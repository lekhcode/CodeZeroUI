import { useState } from "react";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import type { RevisionTab } from "@/components/RevisionPanel/revision.types";
import { RevisionHeader } from "@/components/RevisionPanel/RevisionHeader";
import { RevisionTabs } from "@/components/RevisionPanel/RevisionTabs";
import { RevisionList } from "@/components/RevisionPanel/RevisionList";
import { MonthStats } from "@/components/RevisionPanel/MonthStats";
import { useRevisionData } from "@/components/RevisionPanel/useRevisionData";
import styles from "@/components/RevisionPanel/RevisionPanel.module.css";

const EMPTY: Record<RevisionTab, string> = {
  today: "Nothing solved yesterday. Today's stack resets daily.",
  week: "No active weekly batch. Problems solved this week appear on Sunday.",
  month: "No monthly archive for this period yet.",
};

export function RevisionPanel() {
  const [tab, setTab] = useState<RevisionTab>("today");
  const [monthOffset, setMonthOffset] = useState(0);

  const data = useRevisionData(tab, monthOffset);

  const handleTabKeyDown = (e: React.KeyboardEvent) => {
    const order: RevisionTab[] = ["today", "week", "month"];
    const idx = order.indexOf(tab);
    if (e.key === "ArrowRight") {
      e.preventDefault();
      setTab(order[Math.min(idx + 1, order.length - 1)]!);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      setTab(order[Math.max(idx - 1, 0)]!);
    }
  };

  return (
    <section className={styles.panel} aria-label="Smart Revisions">
      <RevisionHeader completionPct={data.completionPct} />

      <div onKeyDown={handleTabKeyDown}>
        <RevisionTabs tab={tab} counts={data.counts} onTabChange={setTab} />
      </div>

      <div
        role="tabpanel"
        id={`revision-panel-${tab}`}
        aria-labelledby={`revision-tab-${tab}`}
      >
        {tab === "month" ? (
          <>
            <div className={styles.monthNav}>
              <button
                type="button"
                className={styles.monthNavBtn}
                onClick={() => setMonthOffset(monthOffset - 1)}
              >
                ← Prev
              </button>
              <span>{data.monthLabel}</span>
              <button
                type="button"
                className={styles.monthNavBtn}
                onClick={() => setMonthOffset(monthOffset + 1)}
                disabled={monthOffset >= 0}
              >
                Next →
              </button>
            </div>
            <MonthStats stats={data.monthStats} />
          </>
        ) : null}

        {data.loading ? (
          <LoadingSkeleton variant="list" />
        ) : (
          <RevisionList
            rows={data.listRows}
            emptyMessage={EMPTY[tab]}
            onRevise={data.startRevision}
            marking={data.marking}
          />
        )}
      </div>
    </section>
  );
}
