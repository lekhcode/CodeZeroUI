import { Link as RouterLink } from "react-router-dom";
import type { BrainCacheRevisionTask } from "@/types/brainCache.types";
import { formatOverdueDayLabel, getUtcDateKey, utcDaysBeforeToday } from "@/utils/date";
import panel from "@/components/RevisionPanel/RevisionPanel.module.css";

const DIFFICULTY_DOT: Record<string, string> = {
  EASY: panel.dotEasy,
  MEDIUM: panel.dotMedium,
  HARD: panel.dotHard,
  easy: panel.dotEasy,
  medium: panel.dotMedium,
  hard: panel.dotHard,
};

type BrainCacheQueueRowProps = {
  task: BrainCacheRevisionTask;
  mode: "today" | "overdue" | "solved";
  onComplete?: (id: string) => void;
  onSkip?: (id: string) => void;
  busy?: boolean;
};

function formatSolvedWhen(iso: string | null): string {
  if (!iso) return "today";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function BrainCacheQueueRow({ task, mode, onComplete, onSkip, busy }: BrainCacheQueueRowProps) {
  const todayKey = getUtcDateKey();
  const diffKey = task.problem.difficulty.toUpperCase();
  const dot = DIFFICULTY_DOT[diffKey] ?? panel.dotMedium;
  const solved = mode === "solved";

  const metaParts = [task.playlistName];
  if (mode === "overdue") {
    const days = utcDaysBeforeToday(task.dueDate, todayKey);
    if (days > 0) metaParts.push(`${days}d overdue`);
  } else if (mode === "solved") {
    metaParts.push(`Solved ${formatSolvedWhen(task.completedAt)}`);
  } else {
    metaParts.push(`Due ${formatOverdueDayLabel(task.dueDate, todayKey)}`);
  }

  return (
    <div className={`${panel.row} ${solved ? panel.rowRevised : ""}`}>
      <span className={`${panel.dot} ${dot}`} aria-hidden />
      <div className={panel.rowMain}>
        <p className={panel.rowTitle}>
          <RouterLink to={`/problems/${task.problem.slug}`} style={{ color: "inherit", textDecoration: "none" }}>
            {task.problem.title}
          </RouterLink>
        </p>
        <p className={panel.rowMeta}>{metaParts.join(" · ")}</p>
      </div>
      <div className={panel.rowActions}>
        {solved ? (
          <span className={panel.tagRevised}>✓ Solved</span>
        ) : (
          <>
            <button
              type="button"
              className={panel.reviseBtn}
              disabled={busy}
              onClick={() => onSkip?.(task.id)}
            >
              Skip
            </button>
            <button
              type="button"
              className={panel.reviseBtn}
              disabled={busy}
              onClick={() => onComplete?.(task.id)}
            >
              Done
            </button>
            <RouterLink to={`/problems/${task.problem.slug}`} className={panel.reviseBtn}>
              Revise
            </RouterLink>
          </>
        )}
      </div>
    </div>
  );
}
