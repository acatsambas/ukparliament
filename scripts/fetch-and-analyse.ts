import { GoogleGenAI } from "@google/genai";
import { parse as parseHTML } from "node-html-parser";
import * as fs from "fs";
import * as path from "path";
import {
    BillAnalysis,
    ParliamentBillResponse,
    ParliamentBill,
    PublicationsResponse,
    Publication,
    ANALYSIS_DIMENSIONS,
    Impact,
} from "./types";

// ─── Config ──────────────────────────────────────────────────────────────────

const BILLS_API_BASE = "https://bills-api.parliament.uk/api/v1";
const DATA_DIR = path.resolve(__dirname, "..", "data");
const OUTPUT_FILE = path.join(DATA_DIR, "bills.json");
const LIMIT = parseInt(process.argv.find((a) => a.startsWith("--limit="))?.split("=")[1] || "20", 10);
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function fetchJSON<T>(url: string): Promise<T> {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return res.json() as Promise<T>;
}

async function fetchText(url: string): Promise<string> {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return res.text();
}

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Fetch recent bills ──────────────────────────────────────────────────────

async function fetchRecentBills(limit: number): Promise<ParliamentBill[]> {
    console.log(`📋 Fetching up to ${limit} recent bills...`);

    // Fetch current session bills, sorted by most recently updated
    const url = `${BILLS_API_BASE}/Bills?CurrentHouse=All&SortOrder=DateUpdatedDescending&Skip=0&Take=${limit}`;
    const response = await fetchJSON<ParliamentBillResponse>(url);

    // Filter out withdrawn and defeated bills
    const activeBills = response.items.filter(
        (b) => !b.billWithdrawn && !b.isDefeated
    );

    console.log(`   Found ${activeBills.length} active bills (of ${response.totalResults} total)`);
    return activeBills;
}

// ─── Get bill text ───────────────────────────────────────────────────────────

async function getBillText(billId: number): Promise<string | null> {
    try {
        const pubsResponse = await fetchJSON<PublicationsResponse>(
            `${BILLS_API_BASE}/Bills/${billId}/Publications`
        );

        // Find ALL "Bill" publications, sorted by most recent first
        const billPubs = pubsResponse.publications
            .filter((p: Publication) => p.publicationType.name === "Bill")
            .sort((a: Publication, b: Publication) =>
                new Date(b.displayDate).getTime() - new Date(a.displayDate).getTime()
            );

        if (billPubs.length === 0) return null;

        // Search ALL bill publications for HTML text (not just the latest —
        // sometimes the latest pub only has PDFs but an older version has HTML)
        for (const pub of billPubs) {
            // Try HTML files first
            const htmlFile = pub.files.find(
                (f) => f.contentType === "text/html"
            );

            if (htmlFile) {
                const downloadUrl = `${BILLS_API_BASE}/Publications/${pub.id}/Documents/${htmlFile.id}/Download`;
                try {
                    const html = await fetchText(downloadUrl);
                    const text = extractTextFromHTML(html);
                    if (text.length > 500) return text; // Skip if trivially small
                } catch {
                    // Try next publication
                }
            }

            // Try HTML links
            const htmlLink = pub.links.find(
                (l) => l.contentType === "text/html"
            );

            if (htmlLink) {
                try {
                    const html = await fetchText(htmlLink.url);
                    const text = extractTextFromHTML(html);
                    if (text.length > 500) return text;
                } catch {
                    // Link might be broken, try next
                }
            }
        }

        // No HTML text found in any Bill publication
        return null;
    } catch (err) {
        console.error(`   ⚠️  Error fetching publications for bill ${billId}:`, err);
        return null;
    }
}

function extractTextFromHTML(html: string): string {
    const root = parseHTML(html);

    // Remove script, style, and navigation elements
    root.querySelectorAll("script, style, nav, header, footer, meta, link").forEach((el) => el.remove());

    // Use textContent to get ALL text (structuredText skips too much)
    let text = root.textContent || "";

    // Clean up whitespace: collapse multiple spaces/tabs to single space
    text = text.replace(/[ \t]+/g, " ");
    // Collapse 3+ newlines into 2
    text = text.replace(/\n{3,}/g, "\n\n");
    // Remove lines that are only whitespace
    text = text.replace(/\n +\n/g, "\n\n");
    text = text.trim();

    return text;
}

// ─── Gemini Analysis ─────────────────────────────────────────────────────────

function buildAnalysisPrompt(billTitle: string, billText: string): string {
    return `You are an expert policy analyst. Analyse the following UK Parliament bill across 6 dimensions.

BILL TITLE: ${billTitle}

BILL TEXT:
${billText}

---

For each dimension below, provide:
1. An IMPACT rating: "positive", "negative", "neutral", or "mixed"
2. A SUMMARY: 1-2 concise sentences about the expected impact
3. A DETAIL: A thorough analysis paragraph (3-6 sentences)

IMPORTANT INSTRUCTIONS:
- Focus on EXPECTED IMPACT, not the bill's stated intention
- Consider first AND second order effects
- Account for behavioural incentives — how will people change their behaviour in response?
- Conduct a cost-benefit analysis — if there are both positive and negative effects, estimate the net impact
- Be specific and evidence-based where possible

DIMENSIONS:
1. Economy: expected impact on growth and productivity
2. Government Finances: impact on government cost and revenue  
3. Fairness & Justice: does the bill unfairly privilege or penalise a minority group? If so, is there good reason for it (e.g. the group is disadvantaged)?
4. Liberty & Autonomy: if the bill restricts personal liberty, is there good reason for it?
5. Welfare & Quality of Life: is the bill expected to improve quality of life for citizens?
6. Environment: is the bill beneficial to the environment?

Also provide a BILL SUMMARY: a clear, neutral 2-3 sentence summary of what the bill does.

Respond ONLY in this exact JSON format (no markdown, no code fences):
{
  "billSummary": "...",
  "dimensions": [
    {
      "name": "Economy",
      "impact": "positive|negative|neutral|mixed",
      "summary": "...",
      "detail": "..."
    },
    {
      "name": "Government Finances",
      "impact": "positive|negative|neutral|mixed",
      "summary": "...",
      "detail": "..."
    },
    {
      "name": "Fairness & Justice",
      "impact": "positive|negative|neutral|mixed",
      "summary": "...",
      "detail": "..."
    },
    {
      "name": "Liberty & Autonomy",
      "impact": "positive|negative|neutral|mixed",
      "summary": "...",
      "detail": "..."
    },
    {
      "name": "Welfare & Quality of Life",
      "impact": "positive|negative|neutral|mixed",
      "summary": "...",
      "detail": "..."
    },
    {
      "name": "Environment",
      "impact": "positive|negative|neutral|mixed",
      "summary": "...",
      "detail": "..."
    }
  ]
}`;
}

interface GeminiAnalysisResponse {
    billSummary: string;
    dimensions: {
        name: string;
        impact: Impact;
        summary: string;
        detail: string;
    }[];
}

async function analyseBillWithGemini(
    ai: GoogleGenAI,
    billTitle: string,
    billText: string
): Promise<GeminiAnalysisResponse> {
    const prompt = buildAnalysisPrompt(billTitle, billText);

    const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            temperature: 0.3,
        },
    });

    const text = response.text || "";
    return JSON.parse(text) as GeminiAnalysisResponse;
}

// ─── Main Pipeline ───────────────────────────────────────────────────────────

async function main() {
    if (!GEMINI_API_KEY) {
        console.error("❌ GEMINI_API_KEY environment variable is required");
        process.exit(1);
    }

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    // Load existing analyses
    let existingAnalyses: BillAnalysis[] = [];
    if (fs.existsSync(OUTPUT_FILE)) {
        try {
            existingAnalyses = JSON.parse(fs.readFileSync(OUTPUT_FILE, "utf-8"));
        } catch {
            existingAnalyses = [];
        }
    }

    const existingIds = new Set(existingAnalyses.map((a) => a.bill.billId));

    // Fetch recent bills
    const bills = await fetchRecentBills(LIMIT);

    // Process each bill
    const results: BillAnalysis[] = [...existingAnalyses];
    let newCount = 0;

    for (const bill of bills) {
        if (existingIds.has(bill.billId)) {
            console.log(`⏭️  Skipping "${bill.shortTitle}" (already analysed)`);
            continue;
        }

        console.log(`\n🔍 Processing: "${bill.shortTitle}"`);

        // Get full text
        const billText = await getBillText(bill.billId);

        const billData = {
            billId: bill.billId,
            shortTitle: bill.shortTitle,
            currentHouse: bill.currentHouse,
            originatingHouse: bill.originatingHouse,
            lastUpdate: bill.lastUpdate,
            isAct: bill.isAct,
            currentStage: bill.currentStage
                ? {
                    description: bill.currentStage.description,
                    abbreviation: bill.currentStage.abbreviation,
                    house: bill.currentStage.house,
                }
                : null,
            billUrl: `https://bills.parliament.uk/bills/${bill.billId}`,
        };

        if (!billText) {
            console.log(`   ⚠️  No full text available — skipping analysis`);
            results.push({
                bill: billData,
                textAvailable: false,
                summary: "",
                categories: [],
                analysedAt: new Date().toISOString(),
            });
            newCount++;
            continue;
        }

        console.log(`   📄 Got bill text (${billText.length} chars)`);
        console.log(`   🤖 Analysing with Gemini...`);

        try {
            const analysis = await analyseBillWithGemini(ai, bill.shortTitle, billText);

            const categories = ANALYSIS_DIMENSIONS.map((dim, i) => {
                const geminiDim = analysis.dimensions[i];
                return {
                    name: dim.name,
                    icon: dim.icon,
                    impact: geminiDim?.impact || ("neutral" as Impact),
                    summary: geminiDim?.summary || "No analysis available.",
                    detail: geminiDim?.detail || "No detailed analysis available.",
                };
            });

            results.push({
                bill: billData,
                textAvailable: true,
                summary: analysis.billSummary,
                categories,
                analysedAt: new Date().toISOString(),
            });

            console.log(`   ✅ Analysis complete`);
            newCount++;

            // Rate limiting — be polite to Gemini API
            await sleep(2000);
        } catch (err) {
            console.error(`   ❌ Gemini analysis failed:`, err);
            results.push({
                bill: billData,
                textAvailable: true,
                summary: "Analysis failed due to an error.",
                categories: [],
                analysedAt: new Date().toISOString(),
            });
            newCount++;
        }
    }

    // Write output
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));

    console.log(`\n🎉 Done! Processed ${newCount} new bills. Total: ${results.length}`);
    console.log(`   Output: ${OUTPUT_FILE}`);
}

main().catch(console.error);
