import styles from "@/components/RevisionPanel/RevisionPanel.module.css";

type RevisionHeaderProps = {
  completionPct: number;
};

export function RevisionHeader({ completionPct }: RevisionHeaderProps) {
  return (
    <>
      <div className={styles.headerRow}>
        <h2 className={styles.title}>Smart Revisions</h2>
        <p className={styles.subtitle}>spaced repetition</p>
      </div>
      <div className={styles.progressRow}>
        <div className={styles.progressTrack} aria-hidden>
          <div className={styles.progressFill} style={{ width: `${completionPct}%` }} />
        </div>
        <span className={styles.progressLabel} aria-live="polite">
          {completionPct}%
        </span>
      </div>
    </>
  );
}
