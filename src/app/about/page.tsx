import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "About | UK Parliament Bill Analyser",
    description: "How the UK Parliament Bill Analyser works, including the AI prompt used for analysis.",
};

const GEMINI_PROMPT = `You are an expert policy analyst. Analyse the following UK Parliament bill across 6 dimensions.

BILL TITLE: [bill title]

BILL TEXT:
[full bill text]

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

Also provide a BILL SUMMARY: a clear, neutral 2-3 sentence summary of what the bill does.`;

export default function AboutPage() {
    return (
        <div className="content-container">
            <h1>About</h1>
            <p>
                The UK Parliament Bill Analyser automatically fetches the latest bills from the{" "}
                <a href="https://bills-api.parliament.uk/" target="_blank" rel="noopener noreferrer">
                    UK Parliament Bills API
                </a>
                , downloads their full legislative text, and analyses each bill using{" "}
                <a href="https://deepmind.google/technologies/gemini/" target="_blank" rel="noopener noreferrer">
                    Google Gemini
                </a>.
            </p>

            <p>
                Each bill is assessed across six dimensions: Economy, Government Finances, Fairness &amp; Justice,
                Liberty &amp; Autonomy, Welfare &amp; Quality of Life, and Environment. The analysis considers
                first and second-order effects, behavioural incentives, and cost-benefit tradeoffs —
                focusing on expected impact rather than stated intention.
            </p>

            <p>
                The analysis runs weekly via a GitHub Actions pipeline. Bills without downloadable full
                text (PDF-only) are listed but not analysed.
            </p>

            <h2>The Prompt</h2>
            <p>
                Every bill is sent to Gemini with the following prompt. The full bill text is included
                verbatim — no summarisation or truncation.
            </p>
            <div className="prompt-block">{GEMINI_PROMPT}</div>

            <h2>Source Code</h2>
            <p>
                The full source code is available on{" "}
                <a href="https://github.com/acatsambas/ukparliament" target="_blank" rel="noopener noreferrer">
                    GitHub
                </a>.
            </p>
        </div>
    );
}
