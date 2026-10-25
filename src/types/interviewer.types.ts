export type InterviewerUiState =
  | "idle"
  | "listening"
  | "thinking"
  | "speaking"
  | "analyzing"
  | "analysing"
  | "error";

export type InterviewerMode = "strict" | "standard" | "learning";

export type InterviewerSession = {
  sessionId: string;
  state: string;
  uiState: InterviewerUiState | string;
  mode: string;
  slug?: string;
  title?: string;
};

export type InterviewerEventResult = {
  sessionId: string;
  state: string;
  uiState: InterviewerUiState | string;
  turnId: string | null;
  utterance: string;
  decision: string;
  cancelled: boolean;
  latency?: Record<string, unknown>;
};
