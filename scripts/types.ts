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

export type Impact = "positive" | "negative" | "neutral" | "mixed";

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

// Parliament API response types
export interface ParliamentBillResponse {
  items: ParliamentBill[];
  totalResults: number;
  itemsPerPage: number;
}

export interface ParliamentBill {
  billId: number;
  shortTitle: string;
  currentHouse: string;
  originatingHouse: string;
  lastUpdate: string;
  isAct: boolean;
  isDefeated: boolean;
  billWithdrawn: string | null;
  currentStage: {
    description: string;
    abbreviation: string;
    house: string;
    stageSittings: { date: string }[];
  } | null;
}

export interface PublicationFile {
  id: number;
  filename: string;
  contentType: string;
  contentLength: number;
}

export interface PublicationLink {
  id: number;
  title: string;
  url: string;
  contentType: string;
}

export interface Publication {
  id: number;
  title: string;
  house: string;
  displayDate: string;
  publicationType: {
    id: number;
    name: string;
    description: string;
  };
  links: PublicationLink[];
  files: PublicationFile[];
}

export interface PublicationsResponse {
  billId: number;
  publications: Publication[];
}

export const ANALYSIS_DIMENSIONS = [
  { name: "Economy", icon: "📈", key: "economy" },
  { name: "Government Finances", icon: "🏛️", key: "governmentFinances" },
  { name: "Fairness & Justice", icon: "⚖️", key: "fairnessJustice" },
  { name: "Liberty & Autonomy", icon: "🗽", key: "libertyAutonomy" },
  { name: "Welfare & Quality of Life", icon: "❤️", key: "welfareQuality" },
  { name: "Environment", icon: "🌍", key: "environment" },
] as const;
