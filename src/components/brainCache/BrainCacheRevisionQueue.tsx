import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { List, type RowComponentProps } from "react-window";
import type { BrainCacheRevisionTask } from "@/types/brainCache.types";
import { InfoTooltip } from "@/components/RevisionPanel/InfoTooltip";
import { BrainCacheQueueRow } from "@/components/brainCache/BrainCacheQueueRow";
import { brainCacheService } from "@/services/brainCache.service";
import { queryKeys } from "@/hooks/queryKeys";
import { getUtcDateKey } from "@/utils/date";
import { formatOverdueDayLabel } from "@/utils/date";
import panel from "@/components/RevisionPanel/RevisionPanel.module.css";
import styles from "@/components/brainCache/BrainCachePanel.module.css";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

type QueueTab = "today" | "overdue" | "solved";

const TABS: Array<{ id: QueueTab; label: string }> = [
  { id: "today", label: "Today" },
  { id: "overdue", label: "Overdue" },
  { id: "solved", label: "Solved" },
];

const TOOLTIPS: Record<QueueTab, string> = {
  today: "Playlist revisions scheduled for today.",
  overdue: "Past-due revisions from your playlists, grouped by day.",
  solved: "Revisions you marked done today.",
};

const EMPTY: Record<QueueTab, string> = {
  today: "Nothing due today — you've earned rest.",
  overdue: "Backlog clear. Discipline is showing.",
  solved: "No revisions completed yet today.",
};

const ROW_HEIGHT = 56;

type RowData = {
  tasks: BrainCacheRevisionTask[];
  tab: QueueTab;
  onComplete: (id: string) => void;
  onSkip: (id: string) => void;
  busy?: boolean;
};

function QueueRow({
  index,
  style,
  tasks,
  tab,
  onComplete,
  onSkip,
  busy,
}: RowComponentProps<RowData>) {
  const task = tasks[index];
  if (!task) return null;
  return (
    <div style={style}>
      <BrainCacheQueueRow
        task={task}
        mode={tab}
        onComplete={onComplete}
        onSkip={onSkip}
        busy={busy}
      />
    </div>
  );
}

type BrainCacheRevisionQueueProps = {
  onComplete: (id: string) => void;
  onSkip: (id: string) => void;
  busy?: boolean;
};

export function BrainCacheRevisionQueue({ onComplete, onSkip, busy }: BrainCacheRevisionQueueProps) {
  const todayKey = getUtcDateKey();
  const [tab, setTab] = useState<QueueTab>("today");
  const [overduePage, setOverduePage] = useState(0);

  const todayQuery = useQuery({
    queryKey: queryKeys.brainCacheToday(todayKey),
    queryFn: brainCacheService.todayRevisions,
    staleTime: 45_000,
  });

  const overdueQuery = useQuery({
    queryKey: queryKeys.brainCacheOverdue(todayKey),
    queryFn: brainCacheService.overdueRevisions,
    staleTime: 45_000,
  });

  const solvedQuery = useQuery({
    queryKey: queryKeys.brainCacheSolvedToday(todayKey),
    queryFn: brainCacheService.solvedTodayRevisions,
    staleTime: 45_000,
  });

  const todayTasks = todayQuery.data ?? [];
  const overdueTasks = overdueQuery.data ?? [];
  const solvedTasks = solvedQuery.data ?? [];

  const overdueDates = useMemo(
    () => [...new Set(overdueTasks.map((t) => t.dueDate))].sort((a, b) => b.localeCompare(a)),
    [overdueTasks],
  );

  useEffect(() => {
    setOverduePage(0);
  }, [overdueDates.join("|")]);

  const visibleOverdue = useMemo(() => {
    if (overdueDates.length === 0) return [];
    const active = overdueDates[overduePage];
    return active === undefined ? [] : overdueTasks.filter((t) => t.dueDate === active);
  }, [overdueTasks, overdueDates, overduePage]);

  const tabTasks = useMemo(() => {
    if (tab === "today") return todayTasks;
    if (tab === "overdue") return visibleOverdue;
    return solvedTasks;
  }, [tab, todayTasks, visibleOverdue, solvedTasks]);

  const counts = useMemo(
    () => ({
      today: todayTasks.length,
      overdue: overdueTasks.length,
      solved: solvedTasks.length,
    }),
    [todayTasks.length, overdueTasks.length, solvedTasks.length],
  );

  const progressLabel = useMemo(() => {
    if (tab === "solved") return String(counts.solved);
    if (tabTasks.length === 0) return "100%";
    return "0%";
  }, [tab, tabTasks.length, counts.solved]);

  const progressPct = useMemo(() => {
    if (tab === "solved") return solvedTasks.length > 0 ? 100 : 0;
    return tabTasks.length === 0 ? 100 : 0;
  }, [tab, tabTasks.length, solvedTasks.length]);

  const loading =
    tab === "today"
      ? todayQuery.isLoading
      : tab === "overdue"
        ? overdueQuery.isLoading
        : solvedQuery.isLoading;

  const activeOverdueDate = overdueDates[overduePage];

  return (
    <section className={styles.block} aria-label="Revision queue">
      <div className={styles.blockHeader}>
        <h3 className={styles.blockTitle}>Revision queue</h3>
        <span className={styles.blockMeta}>playlist spaced repetition</span>
      </div>

      <div className={panel.progressRow}>
        <div className={panel.progressTrack} aria-hidden>
          <div className={panel.progressFill} style={{ width: `${progressPct}%` }} />
        </div>
        <span className={panel.progressLabel}>{progressLabel}</span>
      </div>

      <div className={panel.tabBar}>
        <div className={panel.tabBarStart}>
          <InfoTooltip text={TOOLTIPS[tab]} />
        </div>
        <div className={panel.tabList} role="tablist" aria-label="Revision queue">
          {TABS.map(({ id, label }) => {
            const selected = tab === id;
            const count = counts[id];
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={selected}
                tabIndex={selected ? 0 : -1}
                className={`${panel.tab} ${selected ? panel.tabActive : ""}`}
                onClick={() => setTab(id)}
              >
                {label}
                <span className={panel.tabBadge}>({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {tab === "overdue" && overdueDates.length > 1 ? (
        <div className={styles.overdueDayNav}>
          <button
            type="button"
            className={styles.overdueDayBtn}
            disabled={overduePage <= 0}
            onClick={() => setOverduePage((p) => p - 1)}
          >
            ←
          </button>
          <span>
            {activeOverdueDate !== undefined
              ? formatOverdueDayLabel(activeOverdueDate, todayKey)
              : ""}{" "}
            · {overduePage + 1}/{overdueDates.length}
          </span>
          <button
            type="button"
            className={styles.overdueDayBtn}
            disabled={overduePage >= overdueDates.length - 1}
            onClick={() => setOverduePage((p) => p + 1)}
          >
            →
          </button>
        </div>
      ) : null}

      {loading ? (
        <LoadingSkeleton variant="list" />
      ) : tabTasks.length === 0 ? (
        <p className={panel.empty}>{EMPTY[tab]}</p>
      ) : (
        <div className={panel.listViewport}>
          <List<RowData>
            rowCount={tabTasks.length}
            rowHeight={ROW_HEIGHT}
            rowComponent={QueueRow}
            rowProps={{ tasks: tabTasks, tab, onComplete, onSkip, busy }}
            style={{ height: 400, width: "100%" }}
          />
        </div>
      )}
    </section>
  );
}
