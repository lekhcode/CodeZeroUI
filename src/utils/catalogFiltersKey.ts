import type { CatalogFilterState } from "@/hooks/useProblemCatalogInfinite";

/** Stable key for catalog list remeasure / scroll sync when filters change. */
export function catalogFiltersKey(filters: CatalogFilterState): string {
  return JSON.stringify({
    search: filters.search ?? "",
    difficulty: filters.difficulty ?? [],
    topics: filters.topics ?? [],
    includePremium: filters.includePremium ?? false,
    shuffle: filters.shuffle ?? false,
  });
}
