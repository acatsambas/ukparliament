export type Impact = "positive" | "negative" | "neutral" | "mixed";

export interface BillStage {
    description: string;
    abbreviation: string;
    house: string;
}

export interface Bill {
    billId: number;
    shortTitle: string;
    currentHouse: string;
    originatingHouse: string;
    lastUpdate: string;
    isAct: boolean;
    currentStage: BillStage | null;
    billUrl: string;
}

export interface AnalysisCategory {
    name: string;
    icon: string;
    impact: Impact;
    summary: string;
    detail: string;
}

export interface BillAnalysis {
    bill: Bill;
    textAvailable: boolean;
    summary: string;
    categories: AnalysisCategory[];
    analysedAt: string;
}

export function getImpactColor(impact: Impact): string {
    switch (impact) {
        case "positive":
            return "var(--impact-positive)";
        case "negative":
            return "var(--impact-negative)";
        case "mixed":
            return "var(--impact-mixed)";
        case "neutral":
        default:
            return "var(--impact-neutral)";
    }
}

export function getImpactLabel(impact: Impact): string {
    return impact.charAt(0).toUpperCase() + impact.slice(1);
}
