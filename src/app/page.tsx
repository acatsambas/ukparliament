import { getAllBills } from "@/lib/data";
import BillCard from "@/components/BillCard";

export default function HomePage() {
  const bills = getAllBills();
  const analysedCount = bills.filter((b) => b.textAvailable).length;

  return (
    <>
      <section className="hero">
        <h1>UK Parliament Bill Analyser</h1>
        <p>
          Every bill analysed across economic, social, and environmental
          dimensions — powered by AI, grounded in the full legislative text.
        </p>
      </section>

      {bills.length > 0 && (
        <div className="stats-bar">
          <div className="stat">
            <div className="stat-value">{bills.length}</div>
            <div className="stat-label">Bills Tracked</div>
          </div>
          <div className="stat">
            <div className="stat-value">{analysedCount}</div>
            <div className="stat-label">Fully Analysed</div>
          </div>
          <div className="stat">
            <div className="stat-value">6</div>
            <div className="stat-label">Dimensions</div>
          </div>
        </div>
      )}

      {bills.length === 0 ? (
        <div className="empty-state">
          <h2>No bills analysed yet</h2>
          <p>
            Run the fetch-and-analyse script to populate the data. You&apos;ll need
            a Gemini API key.
          </p>
          <code>
            GEMINI_API_KEY=your-key npx tsx scripts/fetch-and-analyse.ts
            --limit=5
          </code>
        </div>
      ) : (
        <div className="bill-grid">
          {bills.map((bill) => (
            <BillCard
              key={bill.bill.billId}
              billId={bill.bill.billId}
              title={bill.bill.shortTitle}
              summary={bill.summary}
              currentHouse={bill.bill.currentHouse}
              isAct={bill.bill.isAct}
              stage={bill.bill.currentStage?.description || null}
              textAvailable={bill.textAvailable}
              billUrl={bill.bill.billUrl}
              impacts={bill.categories.map((c) => ({
                name: c.name,
                icon: c.icon,
                impact: c.impact,
              }))}
            />
          ))}
        </div>
      )}
    </>
  );
}
