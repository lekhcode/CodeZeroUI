import type { MonthlyRecord, RevisionItem, WeeklyBatch } from "@/components/RevisionPanel/revision.types";

/** Normalized row used by scheduling selectors (mapped from API). */
export type RevisionSource = {
  id: string;
  slug: string;
  problemId: string;
  problemName: string;
  topic: string;
  difficulty: RevisionItem["difficulty"];
  solvedOn: string;
  scheduledFor: string;
  revisedOn?: string;
  phase: "daily" | "weekly" | "monthly";
  status: RevisionItem["status"];
};

function parseYmd(dateKey: string): { y: number; m: number; d: number } {
  const [y, m, d] = dateKey.split("-").map(Number);
  return { y: y!, m: m!, d: d! };
}

function formatYmd(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/** Calendar add days (local date parts, DST-safe enough for date keys). */
export function addDays(dateKey: string, days: number): string {
  const { y, m, d } = parseYmd(dateKey);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return formatYmd(dt.getFullYear(), dt.getMonth() + 1, dt.getDate());
}

export function getYesterday(today: string): string {
  return addDays(today, -1);
}

export function isYesterday(dateKey: string, today: string): boolean {
  return dateKey === getYesterday(today);
}

/** ISO week start (Monday) for a calendar date. */
export function getWeekStart(dateKey: string): string {
  const { y, m, d } = parseYmd(dateKey);
  const dt = new Date(y, m - 1, d);
  const dow = dt.getDay();
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  dt.setDate(dt.getDate() + mondayOffset);
  return formatYmd(dt.getFullYear(), dt.getMonth() + 1, dt.getDate());
}

/** Closing Sunday of the Mon–Sun week identified by `weekOf` (Monday). */
export function weekClosingSunday(weekOf: string): string {
  return addDays(weekOf, 6);
}

/** Weekly batch visible from closing Sunday through the following Saturday. */
export function isActiveDuringNextWeek(batch: WeeklyBatch, today: string): boolean {
  const closing = weekClosingSunday(batch.weekOf);
  if (today < closing) return false;
  const rollover = addDays(closing, 8);
  return today < rollover;
}

export function toRevisionItem(source: RevisionSource): RevisionItem {
  return {
    id: source.id,
    slug: source.slug,
    problemId: source.problemId,
    problemName: source.problemName,
    topic: source.topic,
    difficulty: source.difficulty,
    solvedOn: source.solvedOn,
    dueOn: source.scheduledFor,
    revisedOn: source.revisedOn,
    status: source.status,
  };
}

/** Daily: problems solved yesterday only (due today). */
export function getDailyRevisions(solved: RevisionSource[], today: string): RevisionItem[] {
  return solved
    .filter((s) => s.phase === "daily" && isYesterday(s.solvedOn, today))
    .map(toRevisionItem)
    .sort((a, b) => a.problemName.localeCompare(b.problemName));
}

/** Weekly: batches in the active Sun→Sat window after week close. */
export function getWeeklyRevisions(solved: RevisionSource[], today: string): RevisionItem[] {
  const weeklySources = solved.filter((s) => s.phase === "weekly");
  const batches = buildWeeklyBatches(weeklySources);
  const active = batches.filter((b) => isActiveDuringNextWeek(b, today));
  return active
    .flatMap((b) => b.problems)
    .sort((a, b) => a.problemName.localeCompare(b.problemName));
}

function buildWeeklyBatches(sources: RevisionSource[]): WeeklyBatch[] {
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
      closedAt: weekClosingSunday(weekOf),
      problems: rows.map(toRevisionItem).sort((a, b) => a.problemName.localeCompare(b.problemName)),
    }))
    .sort((a, b) => a.weekOf.localeCompare(b.weekOf));
}

/** Monthly: closed weekly batches grouped by calendar month (YYYY-MM). */
export function getMonthlyRevisions(batches: WeeklyBatch[]): MonthlyRecord[] {
  const byMonth = new Map<string, WeeklyBatch[]>();
  for (const batch of batches) {
    const month = (batch.closedAt ?? batch.weekOf).slice(0, 7);
    const list = byMonth.get(month);
    if (list) list.push(batch);
    else byMonth.set(month, [batch]);
  }
  return [...byMonth.entries()]
    .map(([month, monthBatches]) => ({
      month,
      batches: monthBatches.sort((a, b) => b.weekOf.localeCompare(a.weekOf)),
    }))
    .sort((a, b) => b.month.localeCompare(a.month));
}

/** Monthly archive: closed weekly batches (on/after rollover Sunday). */
export function getClosedWeeklyBatches(solved: RevisionSource[], today: string): WeeklyBatch[] {
  const monthlySources = solved.filter((s) => s.phase === "monthly");
  const byWeek = new Map<string, RevisionSource[]>();
  for (const s of monthlySources) {
    const weekOf = getWeekStart(s.solvedOn);
    const list = byWeek.get(weekOf);
    if (list) list.push(s);
    else byWeek.set(weekOf, [s]);
  }
  return [...byWeek.entries()]
    .map(([weekOf, rows]) => ({
      weekOf,
      closedAt: addDays(weekClosingSunday(weekOf), 8),
      problems: rows.map(toRevisionItem).sort((a, b) => a.problemName.localeCompare(b.problemName)),
    }))
    .filter((b) => {
      const rollover = addDays(weekClosingSunday(b.weekOf), 8);
      return today >= rollover;
    })
    .sort((a, b) => b.weekOf.localeCompare(a.weekOf));
}

export function getMonthlyRecordForOffset(
  records: MonthlyRecord[],
  monthOffset: number,
  today: string,
): MonthlyRecord | null {
  const anchor = parseYmd(today);
  let y = anchor.y;
  let m = anchor.m + monthOffset;
  while (m < 1) {
    m += 12;
    y -= 1;
  }
  while (m > 12) {
    m -= 12;
    y += 1;
  }
  const key = `${y}-${String(m).padStart(2, "0")}`;
  return records.find((r) => r.month === key) ?? null;
}

export function computeMonthStats(items: RevisionItem[]): {
  solved: number;
  revised: number;
  missed: number;
  pending: number;
} {
  const solved = items.length;
  const revised = items.filter((i) => i.status === "revised").length;
  const missed = items.filter((i) => i.status === "missed").length;
  const pending = items.filter((i) => i.status === "pending").length;
  return { solved, revised, missed, pending };
}

export function tabCompletionPct(items: RevisionItem[]): number {
  if (items.length === 0) return 100;
  const done = items.filter((i) => i.status === "revised").length;
  return Math.round((done / items.length) * 100);
}

export function pendingCount(items: RevisionItem[]): number {
  return items.filter((i) => i.status === "pending").length;
}

export function formatWeekSectionLabel(weekOf: string): string {
  const start = parseYmd(weekOf);
  const end = parseYmd(addDays(weekOf, 6));
  const startStr = new Date(start.y, start.m - 1, start.d).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  const endStr = new Date(end.y, end.m - 1, end.d).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  return `Week of ${startStr}–${endStr}`;
}

export function formatShortDate(dateKey: string): string {
  const { y, m, d } = parseYmd(dateKey);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: "short" });
}
