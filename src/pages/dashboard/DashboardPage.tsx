import { useEffect, type ReactNode } from "react";
import { FLUENT_PAGE } from "@/theme/fluentScroll";
import { Alert, Box, Button, Grid, LinearProgress, Stack, Typography } from "@mui/material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link as RouterLink } from "react-router-dom";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import TodayRoundedIcon from "@mui/icons-material/TodayRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import ExploreRoundedIcon from "@mui/icons-material/ExploreRounded";
import { PageContainer } from "@/components/ui/PageContainer";
import { SectionCard } from "@/components/ui/SectionCard";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { CompactAssignmentRow } from "@/components/learning/CompactAssignmentRow";
import { BrainCacheCompactRevisionRow } from "@/components/brainCache/BrainCacheCompactRevisionRow";
import { SubmissionHistoryRow } from "@/components/learning/SubmissionHistoryRow";
import { LearningTrendChart } from "@/components/learning/LearningTrendChart";
import { SolveProgressRing } from "@/components/learning/SolveProgressRing";
import { learningService } from "@/services/learning.service";
import { problemsService } from "@/services/problems.service";
import { insightsService } from "@/services/insights.service";
import { submissionsService } from "@/services/submissions.service";
import { schedulesService } from "@/services/schedules.service";
import { brainCacheService } from "@/services/brainCache.service";
import { queryKeys } from "@/hooks/queryKeys";
import { ProblemCatalogInfiniteList } from "@/components/problems/ProblemCatalogInfiniteList";
import { useAuthStore } from "@/store/authStore";
import { AnimatedBanner } from "@/components/ui/AnimatedBanner";
import { WeekBelt } from "@/components/dashboard/WeekBelt";
import { DashboardLeaderboard } from "@/components/dashboard/DashboardLeaderboard";
import { dashNavTabSx, miui, miuiCardSx, monoStatSx, sectionContentSx } from "@/theme/theme";
import dayjs from "dayjs";

function HeroInlineStat({
  label,
  value,
  accent,
  pulse,
  valueTo,
}: {
  label: string;
  value: number;
  accent: string;
  pulse?: boolean;
  valueTo?: string;
}) {
  const showPulse = pulse === true && value > 0;

  return (
    <Box
      className={
        showPulse ? "hero-inline-stat hero-inline-stat--overdue" : "hero-inline-stat"
      }
      sx={{
        position: "relative",
        flexShrink: 0,
        minWidth: 76,
        pl: 0.5,
        pr: 2.5,
        mr: 0.25,
        py: 0.15,
        borderRight: `1px solid ${miui.border}`,
        "&:last-of-type": { borderRight: "none", pr: 0, mr: 0 },
      }}
    >
      <Typography
        sx={{
          display: "block",
          fontSize: "0.625rem",
          fontWeight: 600,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: miui.textDim,
          mb: 0.25,
        }}
      >
        {label}
      </Typography>
      <Typography
        className={showPulse ? "hero-inline-stat-value" : undefined}
        component={valueTo !== undefined ? RouterLink : "span"}
        to={valueTo}
        sx={{
          ...monoStatSx,
          fontSize: "1.125rem",
          fontWeight: 700,
          lineHeight: 1,
          color: accent,
          textDecoration: "none",
          display: "inline-block",
          ...(valueTo !== undefined
            ? {
                cursor: "pointer",
                "&:hover": { filter: "brightness(1.12)" },
              }
            : {}),
        }}
      >
        {value.toLocaleString()}
      </Typography>
    </Box>
  );
}

const DASHBOARD_CATALOG_FILTERS = { shuffle: true } as const;
const DASHBOARD_CATALOG_PAGE_SIZE = 20;

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const todayLabel = dayjs().format("dddd, MMM D");

  useEffect(() => {
    void queryClient.prefetchInfiniteQuery({
      queryKey: queryKeys.problemCatalog({
        ...DASHBOARD_CATALOG_FILTERS,
        infinite: true,
        pageSize: DASHBOARD_CATALOG_PAGE_SIZE,
      }),
      queryFn: () =>
        problemsService.list({
          ...DASHBOARD_CATALOG_FILTERS,
          page: 1,
          limit: DASHBOARD_CATALOG_PAGE_SIZE,
        }),
      initialPageParam: 1,
      staleTime: 120_000,
    });
  }, [queryClient]);

  const todayQuery = useQuery({
    queryKey: queryKeys.trackedToday(),
    queryFn: learningService.getTodayAssignments,
  });

  const dueQuery = useQuery({
    queryKey: queryKeys.trackedDue(),
    queryFn: learningService.getDueAssignments,
  });

  const submissionsQuery = useQuery({
    queryKey: queryKeys.submissions({ page: 1, limit: 5 }),
    queryFn: () => submissionsService.list({ page: 1, limit: 5 }),
  });

  const schedulesQuery = useQuery({
    queryKey: queryKeys.userSchedules,
    queryFn: schedulesService.listUserSchedules,
  });

  const insightsQuery = useQuery({
    queryKey: queryKeys.learningInsights,
    queryFn: insightsService.getLearningInsights,
  });

  const brainTodayQuery = useQuery({
    queryKey: queryKeys.brainCacheToday(),
    queryFn: brainCacheService.todayRevisions,
  });

  const brainOverdueQuery = useQuery({
    queryKey: queryKeys.brainCacheOverdue(),
    queryFn: brainCacheService.overdueRevisions,
  });

  const stats = todayQuery.data?.stats;
  const pendingToday = todayQuery.data?.assignments.filter((a) => a.status === "PENDING") ?? [];
  const solvedToday = todayQuery.data?.assignments.filter((a) => a.status === "SOLVED") ?? [];
  const dueAssignments = dueQuery.data?.assignments ?? [];
  const brainDueToday = brainTodayQuery.data ?? [];
  const brainOverdue = brainOverdueQuery.data ?? [];
  const recentSubmissions = submissionsQuery.data?.submissions ?? [];
  const activeCount = schedulesQuery.data?.filter((s) => s.active).length ?? 0;

  const totalToday = pendingToday.length + solvedToday.length;
  const progressPct = totalToday > 0 ? Math.round((solvedToday.length / totalToday) * 100) : 0;
  const greetingName =
    user?.username ?? user?.fullName?.trim().split(/\s+/)[0] ?? user?.name ?? user?.email?.split("@")[0] ?? "there";

  return (
    <PageContainer className={FLUENT_PAGE.dashboard} sx={{ maxWidth: "100%" }}>
      <Grid container spacing={2} sx={{ alignItems: "stretch" }}>
        <Grid size={{ xs: 12, xl: 9 }}>
      <Box sx={{ contain: "layout style", minWidth: 0 }}>
          <AnimatedBanner
            static
            subtle
            sx={{
              mb: 1.5,
              p: 1.5,
              borderRadius: 0,
              bgcolor: "transparent",
              border: "none",
              borderBottom: `1px solid ${miui.border}`,
              borderLeft: `2px solid ${miui.accent}`,
              pl: 1.5,
              boxSizing: "border-box",
              boxShadow: "none",
            }}
          >
            <Box sx={{ position: "relative", minWidth: 0 }}>
              {stats ? (
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    zIndex: 1,
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "flex-end",
                  }}
                >
                  <SolveProgressRing
                    solved={stats.totalSolved}
                    total={stats.totalProblemsInCatalog}
                    size={72}
                    label="Catalog"
                    animate={false}
                  />
                </Box>
              ) : null}

              <Box sx={{ pr: { xs: stats ? 7.5 : 0, sm: stats ? 9 : 0 }, minWidth: 0 }}>
                <Typography
                  sx={{
                    color: "text.disabled",
                    display: "block",
                    fontSize: "0.6875rem",
                    letterSpacing: "0.04em",
                  }}
                >
                  {todayLabel}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: '"Space Grotesk", sans-serif',
                    fontWeight: 700,
                    fontSize: "1.25rem",
                    mt: 0.2,
                    color: miui.text,
                  }}
                >
                  Hi {greetingName}
                </Typography>
                <Typography
                  sx={{
                    mt: 0.5,
                    maxWidth: { sm: stats ? 420 : 480 },
                    fontSize: "0.8125rem",
                    color: "text.secondary",
                  }}
                >
                  {progressPct}% of today&apos;s queue done
                  {dueAssignments.length > 0 && ` · ${dueAssignments.length} overdue`}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={progressPct}
                  sx={{ mt: 1, height: 3, borderRadius: 0, bgcolor: miui.elevated }}
                />

                {stats ? (
                  <Stack
                    direction="row"
                    sx={{
                      mt: 1.25,
                      flexWrap: "wrap",
                      rowGap: 0.75,
                      columnGap: 0.5,
                      alignItems: "flex-start",
                    }}
                  >
                    <HeroInlineStat label="Solved today" value={stats.solvedToday} accent={miui.success} />
                    <HeroInlineStat label="Pending" value={stats.pendingToday} accent={miui.accent} />
                    <HeroInlineStat
                      label="Overdue"
                      value={stats.dueCount}
                      accent={miui.danger}
                      pulse
                      valueTo="/today?tab=timeline"
                    />
                    <HeroInlineStat label="Accepted" value={stats.totalAccepted} accent={miui.text} />
                  </Stack>
                ) : null}

                {(insightsQuery.data || insightsQuery.isLoading) && (
                  <Box sx={{ mt: stats ? 0.75 : 1.25, minWidth: 0 }}>
                    {insightsQuery.isLoading ? (
                      <Box sx={{ height: 52, display: "flex", alignItems: "flex-end" }}>
                        <LinearProgress sx={{ width: "100%", height: 2, borderRadius: 0 }} />
                      </Box>
                    ) : insightsQuery.isError ? (
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.6875rem" }}>
                        Momentum chart unavailable
                      </Typography>
                    ) : insightsQuery.data ? (
                      <LearningTrendChart insights={insightsQuery.data} embedded interactive={false} />
                    ) : null}
                  </Box>
                )}

                <Stack
                  direction="row"
                  spacing={0.5}
                  sx={{ mt: 1.25, flexWrap: "wrap", borderBottom: `1px solid ${miui.border}` }}
                >
                  <Button
                    component={RouterLink}
                    to="/today"
                    variant="text"
                    size="small"
                    startIcon={<TodayRoundedIcon />}
                    sx={dashNavTabSx(true)}
                  >
                    Today
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/lab"
                    variant="text"
                    size="small"
                    startIcon={<MenuBookRoundedIcon />}
                    sx={dashNavTabSx(false)}
                  >
                    Problems
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/submissions"
                    variant="text"
                    size="small"
                    startIcon={<HistoryRoundedIcon />}
                    sx={dashNavTabSx(false)}
                  >
                    Submissions
                  </Button>
                </Stack>
              </Box>
            </Box>
          </AnimatedBanner>

        {todayQuery.isLoading ? (
          <LoadingSkeleton variant="detail" />
        ) : (
          <>
            {(todayQuery.isError || dueQuery.isError) && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {todayQuery.error?.message ?? dueQuery.error?.message}
              </Alert>
            )}

            <Box sx={{ contentVisibility: "auto", containIntrinsicSize: "auto 220px" }}>
              <WeekBelt />
            </Box>

            <Panel title="Problem library" actionLabel="Open Lab" actionTo="/lab" flat sx={{ mb: 2 }}>
                <ProblemCatalogInfiniteList
                  filters={DASHBOARD_CATALOG_FILTERS}
                  pageSize={DASHBOARD_CATALOG_PAGE_SIZE}
                  compact
                  flat
                  preview
                  virtualized={false}
                  scrollContained
                  maxHeight={216}
                  scrollPageClass="dashboard-library-scroll"
                  enableLoadMore={false}
                />
              </Panel>

            <Grid container spacing={2} sx={{ contentVisibility: "auto" }}>
              <Grid size={{ xs: 12, lg: 7 }}>
                  <Panel title="Pending today" actionLabel="Open" actionTo="/today" count={pendingToday.length}>
                    {pendingToday.length === 0 ? (
                      <Typography variant="body2" color="text.secondary" sx={{ ...sectionContentSx, py: 2 }}>
                        No pending — you&apos;re clear for today.
                      </Typography>
                    ) : (
                      pendingToday.slice(0, 5).map((a, i) => (
                        <CompactAssignmentRow
                          key={a.id}
                          assignment={a}
                          isLast={i === Math.min(pendingToday.length, 5) - 1}
                        />
                      ))
                    )}
                  </Panel>

                  <Panel
                    title="Overdue"
                    actionLabel="Resume"
                    actionTo="/today"
                    count={dueAssignments.length}
                    sx={{ mt: 2 }}
                  >
                    {dueAssignments.length === 0 ? (
                      <Typography variant="body2" color="text.secondary" sx={{ ...sectionContentSx, py: 2 }}>
                        Backlog clear. Discipline is showing.
                      </Typography>
                    ) : (
                      dueAssignments.slice(0, 4).map((a, i) => (
                        <CompactAssignmentRow
                          key={a.id}
                          assignment={a}
                          isLast={i === Math.min(dueAssignments.length, 4) - 1}
                        />
                      ))
                    )}
                  </Panel>

                {(brainDueToday.length > 0 || brainOverdue.length > 0) && (
                    <Panel
                      title="Brain Cache"
                      actionLabel="Open"
                      actionTo="/brain-cache"
                      count={brainDueToday.length + brainOverdue.length}
                      sx={{ mt: 2, borderLeft: `3px solid ${miui.accent}` }}
                    >
                      {brainDueToday.slice(0, 2).map((t, i) => (
                        <BrainCacheCompactRevisionRow
                          key={t.id}
                          task={t}
                          isLast={brainDueToday.length <= 2 && brainOverdue.length === 0 && i === brainDueToday.length - 1}
                        />
                      ))}
                      {brainOverdue.slice(0, 2).map((t, i) => (
                        <BrainCacheCompactRevisionRow
                          key={t.id}
                          task={t}
                          isLast={i === Math.min(brainOverdue.length, 2) - 1}
                        />
                      ))}
                    </Panel>
                )}
              </Grid>

              <Grid size={{ xs: 12, lg: 5 }}>
                  <Panel
                    title="Recent submissions"
                    actionLabel="All"
                    actionTo="/submissions"
                  >
                    {submissionsQuery.isLoading ? (
                      <LoadingSkeleton variant="list" count={4} />
                    ) : recentSubmissions.length === 0 ? (
                      <Typography variant="body2" color="text.secondary" sx={{ ...sectionContentSx, py: 2 }}>
                        No submissions yet. First rep is the hardest.
                      </Typography>
                    ) : (
                      recentSubmissions.map((s, i) => (
                        <SubmissionHistoryRow
                          key={s.id}
                          submission={s}
                          isLast={i === recentSubmissions.length - 1}
                        />
                      ))
                    )}
                  </Panel>

                  <Box sx={{ ...miuiCardSx, ...sectionContentSx, mt: 2, borderRadius: 2.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                      Schedules
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {activeCount} active paths enrolled
                    </Typography>
                    <Button
                      component={RouterLink}
                      to="/templates"
                      size="small"
                      variant="outlined"
                      startIcon={<ExploreRoundedIcon />}
                    >
                      Explore
                    </Button>
                  </Box>
              </Grid>
            </Grid>
          </>
        )}
      </Box>
        </Grid>

        <Grid size={{ xs: 12, xl: 3 }} sx={{ display: "flex", minWidth: 0 }}>
          <DashboardLeaderboard />
        </Grid>
      </Grid>
    </PageContainer>
  );
}

function Panel({
  title,
  actionLabel,
  actionTo,
  count,
  children,
  flat = false,
  sx,
}: {
  title: string;
  actionLabel: string;
  actionTo: string;
  count?: number;
  children: ReactNode;
  /** Borderless section — e.g. problem library list */
  flat?: boolean;
  sx?: object;
}) {
  return (
    <SectionCard
      sx={{
        ...(flat
          ? {
              borderRadius: 0,
              border: "none",
              boxShadow: "none",
              bgcolor: "transparent",
              backgroundImage: "none",
            }
          : { borderRadius: 2.5 }),
        ...sx,
      }}
      headerSx={
        flat
          ? { px: 0, py: 0.75, borderBottom: `1px solid ${miui.border}` }
          : undefined
      }
      bodySx={flat ? { px: 0, pt: 0.75, pb: 0 } : undefined}
      title={title}
      titleAdornment={
        count !== undefined ? (
          <Typography component="span" variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            {count}
          </Typography>
        ) : undefined
      }
      action={
        <Button
          component={RouterLink}
          to={actionTo}
          size="small"
          sx={{ minWidth: 0, fontSize: "0.75rem", flexShrink: 0 }}
        >
          {actionLabel}
        </Button>
      }
    >
      {children}
    </SectionCard>
  );
}
