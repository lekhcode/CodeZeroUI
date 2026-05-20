import type { DifficultyLevel, ProblemCatalogStats } from "@/types/api.types";
import { ProblemStatBar } from "@/components/problems/ProblemStatBar";

type ProblemCatalogStatsBarProps = {
  stats: ProblemCatalogStats | undefined;
  loading?: boolean;
  difficulty: DifficultyLevel[];
  onDifficultyChange: (next: DifficultyLevel[]) => void;
  filteredTotal?: number;
  compact?: boolean;
};

export function ProblemCatalogStatsBar(props: ProblemCatalogStatsBarProps) {
  return <ProblemStatBar {...props} />;
}
