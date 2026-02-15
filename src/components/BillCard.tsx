import Link from "next/link";
import { Impact } from "@/lib/types";

interface BillCardProps {
    billId: number;
    title: string;
    summary: string;
    currentHouse: string;
    isAct: boolean;
    stage: string | null;
    textAvailable: boolean;
    billUrl: string;
    impacts: { name: string; icon: string; impact: Impact }[];
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

export default function BillCard({
    billId,
    title,
    summary,
    currentHouse,
    isAct,
    stage,
    textAvailable,
    billUrl,
    impacts,
}: BillCardProps) {
    return (
        <Link href={`/bill/${billId}`} className="bill-card">
            <div className="bill-card-header">
                <h2 className="bill-card-title">{title}</h2>
            </div>
            <div className="bill-card-meta">
                <span className={getHouseBadgeClass(currentHouse)}>{currentHouse}</span>
                {isAct && <span className="badge badge-act">Act</span>}
                {stage && <span className="badge badge-stage">{stage}</span>}
            </div>
            {textAvailable && summary ? (
                <p className="bill-card-summary">{summary}</p>
            ) : (
                <p className="bill-card-summary" style={{ fontStyle: "italic", opacity: 0.6 }}>
                    Full text not available for analysis
                </p>
            )}
            {textAvailable && impacts.length > 0 && (
                <div className="impact-pills">
                    {impacts.map(({ name, icon, impact }) => (
                        <span
                            key={name}
                            className={`impact-pill impact-pill-${impact}`}
                        >
                            <span className="pill-icon">{icon}</span>
                            {name.split(" ")[0]}
                        </span>
                    ))}
                </div>
            )}
            <div className="bill-card-link">
                View full text on parliament.uk →
            </div>
        </Link>
    );
}
