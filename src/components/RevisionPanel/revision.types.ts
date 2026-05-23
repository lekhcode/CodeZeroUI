export type RevisionDifficulty = "easy" | "medium" | "hard";
export type RevisionStatus = "pending" | "revised" | "missed";

export interface RevisionItem {
  id: string;
  slug: string;
  problemId: string;
  problemName: string;
  topic: string;
  difficulty: RevisionDifficulty;
  solvedOn: string;
  dueOn: string;
  revisedOn?: string;
  status: RevisionStatus;
}

export interface WeeklyBatch {
  weekOf: string;
  problems: RevisionItem[];
  closedAt?: string;
}

export interface MonthlyRecord {
  month: string;
  batches: WeeklyBatch[];
}

export type RevisionTab = "today" | "week" | "month";

export type MonthStats = {
  solved: number;
  revised: number;
  missed: number;
  pending: number;
};

export type RevisionListRow =
  | { kind: "section"; key: string; label: string }
  | { kind: "item"; key: string; item: RevisionItem };
