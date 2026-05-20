import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { FixedPageShell, ScrollRegion } from "@/components/layout/FixedPageShell";
import { ProblemCatalogFilters } from "@/components/problems/ProblemCatalogFilters";
import { ProblemCatalogInfiniteList } from "@/components/problems/ProblemCatalogInfiniteList";
import { ProblemCatalogStatsBar } from "@/components/problems/ProblemCatalogStatsBar";
import { ProblemTopicTagBar } from "@/components/problems/ProblemTopicTagBar";
import { problemsService } from "@/services/problems.service";
import { queryKeys } from "@/hooks/queryKeys";
import type { CatalogFilterState } from "@/hooks/useProblemCatalogInfinite";
import type { DifficultyLevel } from "@/types/api.types";
import { FLUENT_PAGE } from "@/theme/fluentScroll";
import { miui, monoStatSx } from "@/theme/theme";

const PAGE_SIZE = 50;

export function LabPage() {
  const pageScrollRef = useRef<HTMLDivElement>(null);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [difficulty, setDifficulty] = useState<DifficultyLevel[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [includePremium, setIncludePremium] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const catalogFilters: CatalogFilterState = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      difficulty: difficulty.length > 0 ? difficulty : undefined,
      topics: topics.length > 0 ? topics : undefined,
      includePremium,
    }),
    [debouncedSearch, difficulty, topics, includePremium],
  );

  const statsQuery = useQuery({
    queryKey: queryKeys.problemCatalogStats(includePremium),
    queryFn: () => problemsService.getCatalogStats(includePremium),
    staleTime: 60_000,
  });

  const topicsQuery = useQuery({
    queryKey: queryKeys.problemTopics(includePremium),
    queryFn: () => problemsService.listTopicTags(includePremium),
    staleTime: 5 * 60_000,
  });

  const toggleTopic = useCallback((topic: string) => {
    setTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic],
    );
  }, []);

  const [listStats, setListStats] = useState<{ total: number; solvedCount?: number }>({
    total: 0,
  });

  const solvedLabel =
    listStats.solvedCount !== undefined && listStats.total > 0 ? (
      <Typography
        sx={{
          ...monoStatSx,
          fontSize: "11px",
          fontWeight: 500,
          color: miui.textMuted,
          whiteSpace: "nowrap",
        }}
      >
        <Box component="span" sx={{ color: miui.success }}>
          {listStats.solvedCount.toLocaleString()}
        </Box>
        {" / "}
        {listStats.total.toLocaleString()} solved
      </Typography>
    ) : null;

  const hasActiveFilters =
    debouncedSearch.length > 0 || difficulty.length > 0 || topics.length > 0;

  return (
    <FixedPageShell>
      <ScrollRegion
        scrollRef={pageScrollRef}
        pageClass={FLUENT_PAGE.lab}
        sx={{
          flex: 1,
          minHeight: 0,
        }}
      >
        <Box component="header" sx={{ mb: { xs: 1, sm: 1.25 }, minWidth: 0 }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, lineHeight: 1.25, fontSize: { xs: "1.05rem", sm: "1.125rem" } }}
          >
            Problem library
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.35, fontSize: { xs: "0.75rem", sm: "0.8125rem" } }}
          >
            Search, filter, and solve from the full catalog
          </Typography>
        </Box>

        <Box component="section" sx={{ mb: { xs: 1, sm: 1.25 } }}>
          <ProblemCatalogStatsBar
            stats={statsQuery.data}
            loading={statsQuery.isLoading}
            difficulty={difficulty}
            onDifficultyChange={setDifficulty}
            filteredTotal={hasActiveFilters ? listStats.total : undefined}
            compact
          />
        </Box>

        <Box
          component="section"
          sx={{
            mb: { xs: 0.75, sm: 1 },
            px: { xs: 0, sm: 0.5 },
            py: { xs: 0.75, sm: 1 },
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              fontWeight: 800,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              mb: { xs: 0.75, sm: 1 },
              display: "block",
              fontSize: "0.625rem",
            }}
          >
            Topics
          </Typography>
          <ProblemTopicTagBar
            topicTags={topicsQuery.data?.topicTags ?? []}
            selected={topics}
            onToggle={toggleTopic}
            loading={topicsQuery.isLoading}
          />
        </Box>

        <Box component="section" aria-label="Problem library" sx={{ minWidth: 0 }}>
          <Box
            sx={{
              position: "sticky",
              top: 0,
              zIndex: 6,
              flexShrink: 0,
              bgcolor: miui.bg,
              borderTop: `1px solid ${miui.border}`,
              boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
            }}
          >
            <Box
              sx={{
                px: { xs: 1, sm: 1.5 },
                py: 0.75,
                borderBottom: `1px solid ${miui.border}`,
                bgcolor: miui.elevated,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: miui.textDim,
                  fontSize: "0.6875rem",
                }}
              >
                Problems
              </Typography>
              {solvedLabel}
            </Box>

            <ProblemCatalogFilters
              variant="embedded"
              search={searchInput}
              onSearchChange={setSearchInput}
              difficulty={difficulty}
              onDifficultyChange={setDifficulty}
              includePremium={includePremium}
              onIncludePremiumChange={setIncludePremium}
            />
          </Box>

          <ProblemCatalogInfiniteList
            filters={catalogFilters}
            pageSize={PAGE_SIZE}
            flat
            scrollContained={false}
            externalScrollRef={pageScrollRef}
            scrollPageClass={FLUENT_PAGE.lab}
            onListStats={setListStats}
          />
        </Box>
      </ScrollRegion>
    </FixedPageShell>
  );
}
