import { useCallback, useMemo, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import type { RevisionListRow, RevisionTab } from "@/components/RevisionPanel/revision.types";
import { mapAutoRevisionItems } from "@/components/RevisionPanel/mapRevisionSources";
import {
  computeMonthStats,
  formatWeekSectionLabel,
  getClosedWeeklyBatches,
  getDailyRevisions,
  getMonthlyRecordForOffset,
  getMonthlyRevisions,
  getWeekStart,
  getWeeklyRevisions,
  pendingCount,
  tabCompletionPct,
  toRevisionItem,
  type RevisionSource,
} from "@/components/RevisionPanel/revisionUtils";
import type { WeeklyBatch } from "@/components/RevisionPanel/revision.types";

function groupSourcesIntoWeekBatches(sources: RevisionSource[]): WeeklyBatch[] {
  const byWeek = new Map<string, RevisionSource[]>();
  for (const s of sources) {
    const weekOf = getWeekStart(s.solvedOn);
    const list = byWeek.get(weekOf);
    if (list) list.push(s);
    else byWeek.set(weekOf, [s]);
  }
  return [...byWeek.entries()]
    .map(([weekOf, rows]) => ({
      weekOf,
      problems: rows.map(toRevisionItem),
    }))
    .sort((a, b) => b.weekOf.localeCompare(a.weekOf));
}
import { autoRevisionService } from "@/services/autoRevision.service";
import { autoRevisionKeyPrefix, queryKeys } from "@/hooks/queryKeys";
import { getClientTimezone } from "@/utils/timezone";

function todayKeyInTz(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: getClientTimezone() });
}

export function useRevisionData(tab: RevisionTab, monthOffset: number) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const tz = getClientTimezone();
  const today = useMemo(() => todayKeyInTz(), [tz]);

  const todayQuery = useQuery({
    queryKey: queryKeys.autoRevisionToday(tz),
    queryFn: () => autoRevisionService.today(tz),
    staleTime: 30_000,
  });

  const weekQuery = useQuery({
    queryKey: queryKeys.autoRevisionWeek(0, tz),
    queryFn: () => autoRevisionService.week(0, tz),
    staleTime: 30_000,
  });

  const monthQuery = useQuery({
    queryKey: queryKeys.autoRevisionMonth(monthOffset, tz),
    queryFn: () => autoRevisionService.month(monthOffset, tz),
    staleTime: 30_000,
  });

  const sources = useMemo((): RevisionSource[] => {
    const daily = mapAutoRevisionItems(todayQuery.data?.daily ?? []);
    const weekly = mapAutoRevisionItems(weekQuery.data?.problems ?? []);
    const monthly = mapAutoRevisionItems(monthQuery.data?.problems ?? []);
    const byId = new Map<string, RevisionSource>();
    for (const s of [...daily, ...weekly, ...monthly]) {
      byId.set(`${s.phase}:${s.id}`, s);
    }
    return [...byId.values()];
  }, [todayQuery.data, weekQuery.data, monthQuery.data]);

  const dailyItems = useMemo(() => getDailyRevisions(sources, today), [sources, today]);
  const weeklyItems = useMemo(() => getWeeklyRevisions(sources, today), [sources, today]);

  const closedBatches = useMemo(
    () => getClosedWeeklyBatches(sources, today),
    [sources, today],
  );

  const monthlyRecords = useMemo(
    () => getMonthlyRevisions(closedBatches),
    [closedBatches],
  );

  const activeMonthRecord = useMemo(
    () => getMonthlyRecordForOffset(monthlyRecords, monthOffset, today),
    [monthlyRecords, monthOffset, today],
  );

  const monthItems = useMemo(() => {
    if (activeMonthRecord && activeMonthRecord.batches.length > 0) {
      return activeMonthRecord.batches.flatMap((b) => b.problems);
    }
    return mapAutoRevisionItems(monthQuery.data?.problems ?? []).map(toRevisionItem);
  }, [activeMonthRecord, monthQuery.data?.problems]);

  const counts = useMemo(
    () => ({
      today: pendingCount(dailyItems),
      week: pendingCount(weeklyItems),
      month: pendingCount(monthItems),
    }),
    [dailyItems, weeklyItems, monthItems],
  );

  const tabItems = useMemo(() => {
    if (tab === "today") return dailyItems;
    if (tab === "week") return weeklyItems;
    return monthItems;
  }, [tab, dailyItems, weeklyItems, monthItems]);

  const completionPct = useMemo(() => tabCompletionPct(tabItems), [tabItems]);

  const monthStats = useMemo(() => computeMonthStats(monthItems), [monthItems]);

  const monthListRows = useMemo((): RevisionListRow[] => {
    const batches =
      activeMonthRecord && activeMonthRecord.batches.length > 0
        ? activeMonthRecord.batches
        : groupSourcesIntoWeekBatches(
            mapAutoRevisionItems(monthQuery.data?.problems ?? []).filter(
              (s) => s.phase === "monthly",
            ),
          );

    const rows: RevisionListRow[] = [];
    for (const batch of batches) {
      rows.push({
        kind: "section",
        key: `section-${batch.weekOf}`,
        label: formatWeekSectionLabel(batch.weekOf),
      });
      for (const item of batch.problems) {
        rows.push({ kind: "item", key: item.id, item });
      }
    }
    return rows;
  }, [activeMonthRecord, monthQuery.data?.problems]);

  const listRows = useMemo((): RevisionListRow[] => {
    if (tab === "month") return monthListRows;
    return tabItems.map((item) => ({ kind: "item" as const, key: item.id, item }));
  }, [tab, tabItems, monthListRows]);

  const loading = todayQuery.isLoading || weekQuery.isLoading || monthQuery.isLoading;

  const markTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const markMutation = useMutation({
    mutationFn: (id: string) => autoRevisionService.markRevised(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: autoRevisionKeyPrefix });
    },
  });

  const markRevised = useCallback(
    (id: string) => {
      if (markTimerRef.current) clearTimeout(markTimerRef.current);
      markTimerRef.current = setTimeout(() => {
        markMutation.mutate(id);
      }, 400);
    },
    [markMutation],
  );

  const startRevision = useCallback(
    (id: string, slug: string) => {
      navigate(`/problems/${slug}?autoRevisionId=${encodeURIComponent(id)}`);
    },
    [navigate],
  );

  const monthLabel = monthQuery.data?.monthLabel ?? activeMonthRecord?.month ?? "";

  return {
    today,
    tab,
    counts,
    completionPct,
    listRows,
    monthStats,
    monthLabel,
    monthOffset,
    loading,
    markRevised,
    startRevision,
    marking: markMutation.isPending,
  };
}
