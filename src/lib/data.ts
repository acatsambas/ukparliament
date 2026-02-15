import * as fs from "fs";
import * as path from "path";
import { BillAnalysis } from "./types";

export type { Impact, BillStage, Bill, AnalysisCategory, BillAnalysis } from "./types";
export { getImpactColor, getImpactLabel } from "./types";

const DATA_PATH = path.join(process.cwd(), "data", "bills.json");

export function getAllBills(): BillAnalysis[] {
    try {
        const raw = fs.readFileSync(DATA_PATH, "utf-8");
        return JSON.parse(raw) as BillAnalysis[];
    } catch {
        return [];
    }
}

export function getBillById(id: number): BillAnalysis | undefined {
    const bills = getAllBills();
    return bills.find((b) => b.bill.billId === id);
}
