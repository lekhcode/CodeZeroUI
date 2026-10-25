import { api, unwrap } from "./api";
import type {
  InterviewerEventResult,
  InterviewerMode,
  InterviewerSession,
} from "@/types/interviewer.types";
import { tokenStorage } from "@/utils/storage";

export type InterviewerStreamHandlers = {
  onSpeakChunk?: (text: string, turnId: string | null, tone?: string) => void;
  onFinal?: (result: InterviewerEventResult) => void;
};

function parseSseBlocks(buffer: string): { events: string[]; rest: string } {
  const parts = buffer.split("\n\n");
  const rest = parts.pop() ?? "";
  const events: string[] = [];
  for (const block of parts) {
    const dataLines = block
      .split("\n")
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).trimStart());
    if (dataLines.length) events.push(dataLines.join("\n"));
  }
  return { events, rest };
}

export const interviewerService = {
  health() {
    return unwrap<{ runtime: Record<string, unknown> }>(
      api.get("/api/v1/interviewer/health"),
    );
  },

  voiceProfile() {
    return unwrap<{ profile: Record<string, unknown> }>(
      api.get("/api/v1/interviewer/voice/profile"),
    );
  },

  createSession(payload: { slug: string; mode?: InterviewerMode; language?: string }) {
    return unwrap<{ session: InterviewerSession }>(
      api.post("/api/v1/interviewer/sessions", payload),
    );
  },

  getSession(sessionId: string) {
    return unwrap<{ session: InterviewerSession }>(
      api.get(`/api/v1/interviewer/sessions/${sessionId}`),
    );
  },

  restoreSession(sessionId: string) {
    return unwrap<{ session: InterviewerSession }>(
      api.post(`/api/v1/interviewer/sessions/${sessionId}/restore`),
    );
  },

  postEvent(sessionId: string, type: string, payload: Record<string, unknown> = {}) {
    return unwrap<{ result: InterviewerEventResult }>(
      api.post(`/api/v1/interviewer/sessions/${sessionId}/events`, { type, payload }),
    );
  },

  /**
   * Streaming turn: speak_chunk SSE while LLM generates, then final result.
   * Falls back to JSON postEvent if the stream endpoint is unavailable.
   */
  async postEventStream(
    sessionId: string,
    type: string,
    payload: Record<string, unknown> = {},
    handlers: InterviewerStreamHandlers = {},
  ): Promise<InterviewerEventResult> {
    const baseURL = import.meta.env.VITE_API_BASE_URL ?? "";
    const token = tokenStorage.get();
    let res: Response;
    try {
      res = await fetch(
        `${baseURL}/api/v1/interviewer/sessions/${encodeURIComponent(sessionId)}/events/stream`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ type, payload }),
        },
      );
    } catch {
      const { result } = await interviewerService.postEvent(sessionId, type, payload);
      handlers.onFinal?.(result);
      return result;
    }

    if (!res.ok || !res.body) {
      const { result } = await interviewerService.postEvent(sessionId, type, payload);
      handlers.onFinal?.(result);
      return result;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let finalResult: InterviewerEventResult | null = null;
    let spokenParts: string[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const { events, rest } = parseSseBlocks(buffer);
      buffer = rest;
      for (const raw of events) {
        let item: Record<string, unknown>;
        try {
          item = JSON.parse(raw) as Record<string, unknown>;
        } catch {
          continue;
        }
        const kind = String(item["type"] ?? "");
        if (kind === "speak_chunk") {
          const text = String(item["text"] ?? "").trim();
          const turnId =
            typeof item["turnId"] === "string" ? item["turnId"] : null;
          const tone =
            typeof item["tone"] === "string" ? item["tone"] : undefined;
          if (text) {
            spokenParts.push(text);
            handlers.onSpeakChunk?.(text, turnId, tone);
          }
          continue;
        }
        if (kind === "final" || item["utterance"] !== undefined) {
          finalResult = {
            sessionId: String(item["sessionId"] ?? sessionId),
            state: String(item["state"] ?? ""),
            uiState: String(item["uiState"] ?? "idle"),
            turnId: typeof item["turnId"] === "string" ? item["turnId"] : null,
            utterance: String(item["utterance"] ?? spokenParts.join(" ")),
            decision: String(item["decision"] ?? "remain_silent"),
            cancelled: item["cancelled"] === true,
            latency:
              item["latency"] && typeof item["latency"] === "object"
                ? (item["latency"] as Record<string, unknown>)
                : undefined,
          };
          handlers.onFinal?.(finalResult);
        }
      }
    }

    if (!finalResult) {
      // Stream ended without a final frame — do NOT re-POST (would duplicate the turn).
      const synthesized: InterviewerEventResult = {
        sessionId,
        state: "",
        uiState: spokenParts.length ? "speaking" : "listening",
        turnId: null,
        utterance: spokenParts.join(" "),
        decision: spokenParts.length ? "speak" : "remain_silent",
        cancelled: false,
      };
      handlers.onFinal?.(synthesized);
      return synthesized;
    }
    return finalResult;
  },
};
