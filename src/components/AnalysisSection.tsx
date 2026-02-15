"use client";

import { useState } from "react";
import { Impact, getImpactLabel } from "@/lib/types";

interface AnalysisSectionProps {
    name: string;
    icon: string;
    impact: Impact;
    summary: string;
    detail: string;
}

function getImpactBadgeStyle(impact: Impact): React.CSSProperties {
    const colors: Record<Impact, { bg: string; color: string }> = {
        positive: { bg: "var(--impact-positive-bg)", color: "var(--impact-positive)" },
        negative: { bg: "var(--impact-negative-bg)", color: "var(--impact-negative)" },
        mixed: { bg: "var(--impact-mixed-bg)", color: "var(--impact-mixed)" },
        neutral: { bg: "var(--impact-neutral-bg)", color: "var(--impact-neutral)" },
    };
    const c = colors[impact] || colors.neutral;
    return { background: c.bg, color: c.color };
}

export default function AnalysisSection({
    name,
    icon,
    impact,
    summary,
    detail,
}: AnalysisSectionProps) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="analysis-card">
            <div
                className="analysis-card-header"
                onClick={() => setExpanded(!expanded)}
                role="button"
                aria-expanded={expanded}
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setExpanded(!expanded);
                    }
                }}
            >
                <span className="analysis-icon">{icon}</span>
                <div className="analysis-info">
                    <div className="analysis-name">{name}</div>
                    <div className="analysis-summary">{summary}</div>
                </div>
                <span
                    className="analysis-impact-badge"
                    style={getImpactBadgeStyle(impact)}
                >
                    {getImpactLabel(impact)}
                </span>
                <span className={`analysis-expand-icon ${expanded ? "expanded" : ""}`}>
                    ▾
                </span>
            </div>
            <div className={`analysis-detail ${expanded ? "expanded" : ""}`}>
                <div className="analysis-detail-text">{detail}</div>
            </div>
        </div>
    );
}
