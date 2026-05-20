import type { DifficultyLevel } from "@/types/api.types";
import { formatDifficulty } from "@/utils/difficulty";

export const SCHEDULE_DIFFICULTY_LEVELS = ["EASY", "MEDIUM", "HARD"] as const;
export type ScheduleDifficultyLevel = (typeof SCHEDULE_DIFFICULTY_LEVELS)[number];

export function formatScheduleDifficultyLabel(
  difficulty: DifficultyLevel | null | undefined,
  difficultyFilters?: DifficultyLevel[] | null,
): string | null {
  if (difficultyFilters && difficultyFilters.length > 0 && difficultyFilters.length < 3) {
    return difficultyFilters.map((d) => formatDifficulty(d)).join(" · ");
  }
  if (difficulty === null || difficulty === undefined) return null;
  if (difficulty === "MIXED") return "All levels";
  return formatDifficulty(difficulty);
}

/** Map chip selection to API payload */
export function difficultiesToApiPayload(
  selected: ScheduleDifficultyLevel[],
): { difficulties: ScheduleDifficultyLevel[] } | Record<string, never> {
  const unique = [...new Set(selected)];
  if (unique.length === 0) return {};
  return { difficulties: unique };
}
