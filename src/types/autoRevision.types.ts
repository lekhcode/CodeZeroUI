import type { DifficultyLevel } from "@/types/api.types";

export type AutoRevisionType = "DAILY" | "WEEKLY" | "MONTHLY";

export type AutoRevisionItem = {
  id: string;
  userId: string;
  problemId: string;
  problemTitle: string;
  difficulty: DifficultyLevel;
  slug: string;
  topics: string[];
  primaryTopic: string;
  revisionStreak: number;
  solvedAt: string;
  revisionType: AutoRevisionType;
  scheduledFor: string;
  isRevised: boolean;
  revisedAt: string | null;
  isOverdue: boolean;
};

export type AutoRevisionTodayGrouped = {
  daily: AutoRevisionItem[];
  weekly: AutoRevisionItem[];
  monthly: AutoRevisionItem[];
};

export type AutoRevisionWeekResponse = {
  weekRange: { start: string; end: string; label: string };
  weekOffset: number;
  problems: AutoRevisionItem[];
  totalScheduled: number;
  totalRevised: number;
};

export type AutoRevisionMonthStats = {
  total: number;
  revised: number;
  pending: number;
  missed: number;
  completionPct: number;
};

export type AutoRevisionMonthResponse = {
  monthLabel: string;
  monthOffset: number;
  range: { start: string; end: string };
  problems: AutoRevisionItem[];
  totalScheduled: number;
  totalRevised: number;
  stats: AutoRevisionMonthStats;
};

export type AutoRevisionSummary = {
  todayPending: number;
  weekPending: number;
  monthPending: number;
  totalPending: number;
  completion30DayPct: number;
  scheduled30Day: number;
  revised30Day: number;
};

export type AutoRevisionFeedResponse = {
  items: AutoRevisionItem[];
  weakTopics: Array<{ topic: string; pending: number }>;
};

export type AutoRevisionHistoryStatus = "completed" | "missed" | "skipped";

export type AutoRevisionHistoryItem = AutoRevisionItem & {
  status: AutoRevisionHistoryStatus;
  timeSpentMinutes: number | null;
  performanceScore: number | null;
  notes: string | null;
};

export type AutoRevisionHistoryResponse = {
  items: AutoRevisionHistoryItem[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
};

export type AutoRevisionActivityDay = {
  date: string;
  count: number;
};

export type AutoRevisionActivityResponse = {
  days: AutoRevisionActivityDay[];
};

export type RevisionFeedStatus = "pending" | "completed" | "all";
export type RevisionFeedPeriod = "all" | "today" | "week" | "month";
export type RevisionFeedSort = "priority" | "due" | "title" | "difficulty";

export type RevisionFeedParams = {
  status?: RevisionFeedStatus;
  period?: RevisionFeedPeriod;
  topic?: string;
  search?: string;
  sort?: RevisionFeedSort;
};
