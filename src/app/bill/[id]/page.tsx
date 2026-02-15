import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllBills, getBillById } from "@/lib/data";
import AnalysisSection from "@/components/AnalysisSection";

interface BillPageProps {
    params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
    const bills = getAllBills();
    return bills.map((bill) => ({
        id: String(bill.bill.billId),
    }));
}

export async function generateMetadata({ params }: BillPageProps) {
    const { id } = await params;
    const bill = getBillById(parseInt(id, 10));
    if (!bill) return { title: "Bill Not Found" };
    return {
        title: `${bill.bill.shortTitle} | UK Parliament Bill Analyser`,
        description: bill.summary || `Analysis of ${bill.bill.shortTitle}`,
    };
}

function getHouseBadgeClass(house: string): string {
    switch (house.toLowerCase()) {
        case "commons":
            return "badge badge-commons";
        case "lords":
            return "badge badge-lords";
        default:
            return "badge badge-unassigned";
    }
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

export default async function BillPage({ params }: BillPageProps) {
    const { id } = await params;
    const billAnalysis = getBillById(parseInt(id, 10));

    if (!billAnalysis) {
        notFound();
    }

    const { bill, textAvailable, summary, categories, analysedAt } = billAnalysis;

    return (
        <div className="detail-container">
            <Link href="/" className="back-link">
                ← Back to all bills
            </Link>

            <div className="detail-header">
                <h1 className="detail-title">{bill.shortTitle}</h1>
                <div className="detail-meta">
                    <span className={getHouseBadgeClass(bill.currentHouse)}>
                        {bill.currentHouse}
                    </span>
                    {bill.isAct && <span className="badge badge-act">Act</span>}
                    {bill.currentStage && (
                        <span className="badge badge-stage">
                            {bill.currentStage.description}
                        </span>
                    )}
                </div>
                <div className="detail-date">
                    Last updated: {formatDate(bill.lastUpdate)}
                    {analysedAt && <> · Analysed: {formatDate(analysedAt)}</>}
                </div>
            </div>

            {textAvailable && summary ? (
                <div className="detail-summary">{summary}</div>
            ) : null}

            <div className="detail-links">
                <a
                    href={bill.billUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="detail-external"
                >
                    View on parliament.uk →
                </a>
                <a
                    href={bill.billUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="detail-external"
                >
                    Read full text →
                </a>
            </div>

            {!textAvailable ? (
                <div className="unavailable-notice">
                    <div className="notice-icon">📄</div>
                    <p>
                        The full text for this bill was not available for analysis. Only
                        bills with downloadable full text can be analysed.
                    </p>
                </div>
            ) : categories.length > 0 ? (
                <div style={{ marginTop: 32 }}>
                    <h2 className="analysis-heading">
                        <span>📊</span> Impact Analysis
                    </h2>
                    <div className="analysis-cards">
                        {categories.map((cat) => (
                            <AnalysisSection
                                key={cat.name}
                                name={cat.name}
                                icon={cat.icon}
                                impact={cat.impact}
                                summary={cat.summary}
                                detail={cat.detail}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                <div className="unavailable-notice" style={{ marginTop: 32 }}>
                    <div className="notice-icon">⚠️</div>
                    <p>
                        Analysis could not be completed for this bill. Please try running
                        the analyser again.
                    </p>
                </div>
            )}
        </div>
    );
}
