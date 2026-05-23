import type { RevisionItem } from "@/components/RevisionPanel/revision.types";
import { formatShortDate } from "@/components/RevisionPanel/revisionUtils";
import styles from "@/components/RevisionPanel/RevisionPanel.module.css";

type RevisionRowProps = {
  item: RevisionItem;
  dueLabel?: string;
  onRevise: (id: string, slug: string) => void;
  onRedo?: (id: string, slug: string) => void;
  marking?: boolean;
};

export function RevisionRow({ item, dueLabel = "today", onRevise, onRedo, marking }: RevisionRowProps) {
  const dotClass =
    item.difficulty === "easy"
      ? styles.dotEasy
      : item.difficulty === "hard"
        ? styles.dotHard
        : styles.dotMedium;

  const revised = item.status === "revised";
  const missed = item.status === "missed";

  return (
    <div className={`${styles.row} ${revised ? styles.rowRevised : ""}`}>
      <span className={`${styles.dot} ${dotClass}`} aria-hidden />
      <div className={styles.rowMain}>
        <p className={styles.rowTitle}>{item.problemName}</p>
        <p className={styles.rowMeta}>
          {item.topic} · Solved {formatShortDate(item.solvedOn)} · Due {dueLabel}
        </p>
      </div>
      <div className={styles.rowActions}>
        {revised ? (
          <span className={styles.tagRevised}>✓ Revised</span>
        ) : missed ? (
          <>
            <span className={styles.tagMissed}>✕ Missed</span>
            <button
              type="button"
              className={styles.redoBtn}
              disabled={marking}
              onClick={() => (onRedo ?? onRevise)(item.id, item.slug)}
            >
              Redo
            </button>
          </>
        ) : (
          <button
            type="button"
            className={styles.reviseBtn}
            disabled={marking}
            onClick={() => onRevise(item.id, item.slug)}
          >
            Revise
          </button>
        )}
      </div>
    </div>
  );
}
