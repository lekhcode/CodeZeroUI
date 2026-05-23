import type { RevisionTab } from "@/components/RevisionPanel/revision.types";
import { InfoTooltip } from "@/components/RevisionPanel/InfoTooltip";
import styles from "@/components/RevisionPanel/RevisionPanel.module.css";

const TABS: Array<{ id: RevisionTab; label: string }> = [
  { id: "today", label: "Today" },
  { id: "week", label: "This Week" },
  { id: "month", label: "This Month" },
];

const TOOLTIPS: Record<RevisionTab, string> = {
  today: "Problems solved yesterday appear here for quick reinforcement.",
  week: "Problems solved during a week become available here on Sunday and stay until next Sunday.",
  month: "Completed weekly revision batches move here for long-term reinforcement.",
};

type RevisionTabsProps = {
  tab: RevisionTab;
  counts: { today: number; week: number; month: number };
  onTabChange: (tab: RevisionTab) => void;
};

export function RevisionTabs({ tab, counts, onTabChange }: RevisionTabsProps) {
  const countFor = (id: RevisionTab) =>
    id === "today" ? counts.today : id === "week" ? counts.week : counts.month;

  return (
    <div className={styles.tabBar}>
      <div className={styles.tabBarStart}>
        <InfoTooltip text={TOOLTIPS[tab]} />
      </div>
      <div className={styles.tabList} role="tablist" aria-label="Revision phase">
        {TABS.map(({ id, label }) => {
          const selected = tab === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              id={`revision-tab-${id}`}
              aria-selected={selected}
              aria-controls={`revision-panel-${id}`}
              tabIndex={selected ? 0 : -1}
              className={`${styles.tab} ${selected ? styles.tabActive : ""}`}
              onClick={() => onTabChange(id)}
            >
              {label}
              <span className={styles.tabBadge}>({countFor(id)})</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
