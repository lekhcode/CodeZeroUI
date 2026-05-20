import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { problemsService } from "@/services/problems.service";
import { queryKeys } from "@/hooks/queryKeys";
import type { ProblemCatalogFilters, ProblemCatalogItem } from "@/types/api.types";

export type CatalogFilterState = Omit<ProblemCatalogFilters, "page" | "limit">;

type UseProblemCatalogInfiniteOptions = {
  /** Dashboard slice: cache shuffle + show prior page while refetching */
  preview?: boolean;
};

export function useProblemCatalogInfinite(
  filters: CatalogFilterState,
  pageSize: number,
  options?: UseProblemCatalogInfiniteOptions,
) {
  const shuffled = filters.shuffle === true;
  const preview = options?.preview === true;

  const query = useInfiniteQuery({
    queryKey: queryKeys.problemCatalog({ ...filters, infinite: true, pageSize }),
    queryFn: ({ pageParam }) =>
      problemsService.list({
        ...filters,
        page: pageParam,
        limit: pageSize,
      }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      shuffled ? undefined : last.page < last.totalPages ? last.page + 1 : undefined,
    staleTime: preview ? 120_000 : shuffled ? 0 : 60_000,
    gcTime: preview ? 300_000 : shuffled ? 0 : 5 * 60_000,
    refetchOnMount: preview ? false : shuffled ? "always" : false,
    placeholderData: preview ? keepPreviousData : undefined,
  });

  const items: ProblemCatalogItem[] =
    query.data?.pages.flatMap((page) => page.items) ?? [];

  const total = query.data?.pages[0]?.total ?? 0;
  const solvedCount = query.data?.pages[0]?.solvedCount;

  return {
    ...query,
    items,
    total,
    solvedCount,
  };
}
