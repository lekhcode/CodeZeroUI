import { useEffect, useRef, type Dispatch, type RefObject, type SetStateAction } from "react";
import { useFluentScroll } from "@/hooks/useFluentScroll";
import { Alert, Box, CircularProgress, Typography, alpha } from "@mui/material";
import { ProblemCatalogVirtualTable } from "@/components/problems/ProblemCatalogVirtualTable";
import { ProblemCatalogStaticTable } from "@/components/problems/ProblemCatalogStaticTable";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  useProblemCatalogInfinite,
  type CatalogFilterState,
} from "@/hooks/useProblemCatalogInfinite";
import { miui } from "@/theme/theme";

type ProblemCatalogInfiniteListProps = {
  filters: CatalogFilterState;
  pageSize?: number;
  compact?: boolean;
  /** Lab: borderless floating list + lighter scroll */
  flat?: boolean;
  maxHeight?: number | string;
  /** Small lists (dashboard): static rows — instant paint, no virtualizer blank gap. */
  virtualized?: boolean;
  /** Dashboard preview: cache shuffle results, keep prior rows while refetching. */
  preview?: boolean;
  /** When false, only the first page is fetched (no scroll-to-load). */
  enableLoadMore?: boolean;
  /**
   * When false, list flows in the page (no inner scroll box).
   * Use on dashboard — avoids nested scroll jank.
   */
  scrollContained?: boolean;
  /** Lab: list fills remaining shell height (single scroll root). */
  fillHeight?: boolean;
  /** Fluent scroll root class (e.g. FLUENT_PAGE.lab). */
  scrollPageClass?: string;
  /** Lab: page scroll parent — list flows inside it (no nested scroll box). */
  externalScrollRef?: RefObject<HTMLDivElement | null>;
  /** Receives filtered total and solved count (when logged in). */
  onListStats?: Dispatch<SetStateAction<{ total: number; solvedCount?: number }>>;
};

const DEFAULT_LAB_HEIGHT = "min(72vh, 720px)";

export function ProblemCatalogInfiniteList({
  filters,
  pageSize = 50,
  compact = false,
  flat = false,
  maxHeight = DEFAULT_LAB_HEIGHT,
  virtualized = true,
  enableLoadMore = true,
  scrollContained = true,
  fillHeight = false,
  scrollPageClass,
  externalScrollRef,
  preview = false,
  onListStats,
}: ProblemCatalogInfiniteListProps) {
  const internalScrollRef = useFluentScroll<HTMLDivElement>();
  const scrollRootRef = externalScrollRef ?? internalScrollRef;
  const usesExternalScroll = externalScrollRef !== undefined;
  const hasScrollRoot = scrollContained || usesExternalScroll;
  const scrollClassName = ["app-scroll", scrollPageClass].filter(Boolean).join(" ");
  const sentinelRef = useRef<HTMLDivElement>(null);

  const {
    items,
    total,
    isLoading,
    isError,
    error,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    solvedCount,
  } = useProblemCatalogInfinite(filters, pageSize, { preview });

  useEffect(() => {
    onListStats?.({ total, solvedCount });
  }, [onListStats, total, solvedCount]);

  const fetchNextPageRef = useRef(fetchNextPage);
  fetchNextPageRef.current = fetchNextPage;

  const hasNextPageRef = useRef(hasNextPage);
  const isFetchingNextPageRef = useRef(isFetchingNextPage);
  hasNextPageRef.current = hasNextPage;
  isFetchingNextPageRef.current = isFetchingNextPage;

  useEffect(() => {
    if (!enableLoadMore) {
      return;
    }

    let observer: IntersectionObserver | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let activeRoot: HTMLDivElement | null = null;

    const tryLoadMore = () => {
      const root = scrollRootRef.current;
      if (!root || !hasNextPageRef.current || isFetchingNextPageRef.current) {
        return;
      }
      const { scrollTop, clientHeight, scrollHeight } = root;
      if (clientHeight < 120) {
        return;
      }
      if (scrollTop + clientHeight < scrollHeight - 80) {
        return;
      }
      isFetchingNextPageRef.current = true;
      void fetchNextPageRef.current().finally(() => {
        isFetchingNextPageRef.current = false;
      });
    };

    const bind = (root: HTMLDivElement) => {
      if (activeRoot === root && observer !== null) {
        return;
      }
      if (observer !== null) {
        observer.disconnect();
      }
      if (activeRoot !== null) {
        activeRoot.removeEventListener("scroll", onScroll);
      }

      activeRoot = root;
      observer = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            tryLoadMore();
          }
        },
        { root, rootMargin: "0px", threshold: 0 },
      );
      const sentinel = sentinelRef.current;
      if (sentinel !== null) {
        observer.observe(sentinel);
      }
      root.addEventListener("scroll", onScroll, { passive: true });
    };

    const onScroll = () => tryLoadMore();

    const setup = () => {
      const root = scrollRootRef.current;
      if (root === null || sentinelRef.current === null) {
        return;
      }
      bind(root);
    };

    setup();

    const root = scrollRootRef.current;
    if (root !== null && typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(setup);
      resizeObserver.observe(root);
    }

    return () => {
      observer?.disconnect();
      resizeObserver?.disconnect();
      if (activeRoot !== null) {
        activeRoot.removeEventListener("scroll", onScroll);
      }
    };
  }, [enableLoadMore, hasScrollRoot, items.length]);

  if (isLoading && items.length === 0) {
    return <LoadingSkeleton variant="list" count={compact ? 6 : 10} />;
  }

  if (isError) {
    return (
      <Alert severity="error" sx={{ borderRadius: 2 }}>
        {error instanceof Error ? error.message : "Failed to load problems"}
      </Alert>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="No problems match"
        description="Try clearing filters or sync the catalog from the backend."
      />
    );
  }

  const table = virtualized ? (
    <ProblemCatalogVirtualTable
      items={items}
      compact={compact}
      flat={flat}
      scrollRef={hasScrollRoot ? scrollRootRef : undefined}
    />
  ) : (
    <ProblemCatalogStaticTable items={items} compact={compact} flat={flat} />
  );

  if (!scrollContained || usesExternalScroll) {
    return (
      <Box
        sx={{
          borderRadius: flat ? 0 : 2,
          bgcolor: flat ? "transparent" : alpha(miui.bg, 0.35),
          border: flat ? "none" : `1px solid ${miui.border}`,
        }}
      >
        {table}

        {enableLoadMore && (
          <>
            <Box ref={sentinelRef} sx={{ height: 8, width: "100%" }} aria-hidden />

            {isFetchingNextPage && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1.5,
                  py: 2,
                }}
              >
                <CircularProgress size={22} thickness={5} />
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Loading more…
                </Typography>
              </Box>
            )}

            {!hasNextPage && !isFetchingNextPage && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", textAlign: "center", py: 2, fontWeight: 600 }}
              >
                {items.length >= total
                  ? `All ${total.toLocaleString()} problems loaded`
                  : "End of list"}
              </Typography>
            )}
          </>
        )}
      </Box>
    );
  }

  const labDefaultHeight = maxHeight === DEFAULT_LAB_HEIGHT;
  const heightSx = fillHeight
    ? { flex: 1, minHeight: 0, height: "100%", maxHeight: "100%" }
    : {
        maxHeight,
        ...(compact && labDefaultHeight ? { minHeight: 280 } : {}),
        ...(!compact && !flat ? { minHeight: 400 } : {}),
        ...(!compact && flat && labDefaultHeight ? { minHeight: 360 } : {}),
      };

  return (
    <Box
      ref={internalScrollRef}
      className={scrollClassName}
      sx={{
        ...heightSx,
        overflowY: "auto",
        overflowX: "hidden",
        borderRadius: flat ? 0 : 2,
        bgcolor: flat ? "transparent" : alpha(miui.bg, 0.35),
        border: flat ? "none" : `1px solid ${miui.border}`,
        WebkitOverflowScrolling: "touch",
        overscrollBehavior: fillHeight ? "contain" : undefined,
      }}
    >
      {table}

      {enableLoadMore && (
        <>
          <Box ref={sentinelRef} sx={{ height: 8, width: "100%" }} aria-hidden />

          {isFetchingNextPage && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1.5,
                py: 2,
              }}
            >
              <CircularProgress size={22} thickness={5} />
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                Loading more…
              </Typography>
            </Box>
          )}

          {!hasNextPage && !isFetchingNextPage && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", textAlign: "center", py: 2, fontWeight: 600 }}
            >
              {items.length >= total
                ? `All ${total.toLocaleString()} problems loaded`
                : "End of list"}
            </Typography>
          )}
        </>
      )}
    </Box>
  );
}
