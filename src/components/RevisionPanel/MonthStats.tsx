import type { MonthStats as MonthStatsType } from "@/components/RevisionPanel/revision.types";
import styles from "@/components/RevisionPanel/RevisionPanel.module.css";

type MonthStatsProps = {
  stats: MonthStatsType;
};

export function MonthStats({ stats }: MonthStatsProps) {
  return (
    <div className={styles.monthStats} aria-label="Monthly revision statistics">
      <div className={styles.monthStat}>
        <span className={styles.monthStatValue}>{stats.solved}</span>
        <span className={styles.monthStatLabel}>Solved</span>
      </div>
      <div className={styles.monthStat}>
        <span className={styles.monthStatValue}>{stats.revised}</span>
        <span className={styles.monthStatLabel}>Revised</span>
      </div>
      <div className={styles.monthStat}>
        <span className={styles.monthStatValue}>{stats.missed}</span>
        <span className={styles.monthStatLabel}>Missed</span>
      </div>
      <div className={styles.monthStat}>
        <span className={styles.monthStatValue}>{stats.pending}</span>
        <span className={styles.monthStatLabel}>Pending</span>
      </div>
    </div>
  );
}
