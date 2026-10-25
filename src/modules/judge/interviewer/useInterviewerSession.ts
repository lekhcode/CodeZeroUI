import { useCallback, useEffect, useRef, useState } from "react";
import { interviewerService } from "@/services/interviewer.service";
import type {
  InterviewerMode,
  InterviewerUiState,
} from "@/types/interviewer.types";
import type { JudgeSubmission } from "@/types/judge.types";
import { playBackchannel, prewarmBackchannel, stopBackchannel } from "./backchannel";
import { cancelBrowserSpeech } from "./browserSpeech";
import { mergeSpeakableChunks } from "./chunkMerge";
import { RealtimeVoiceLoop } from "./realtimeVoiceLoop";
import type { InterviewTone } from "./voiceProfile";

type Options = {
  slug: string;
  language: string | null;
  code: string;
  isAuthenticated: boolean;
  submission: JudgeSubmission | null;
  mode?: InterviewerMode;
};

const TERMINAL = new Set([
  "ACCEPTED",
  "WRONG_ANSWER",
  "RUNTIME_ERROR",
  "COMPILATION_ERROR",
  "TIME_LIMIT_EXCEEDED",
  "INTERNAL_ERROR",
]);

function sessionStorageKey(problemSlug: string): string {
  return `codezero.interviewer.session.${problemSlug}`;
}

function newClientEventId(): string {
  return crypto.randomUUID();
}

function asTone(v: unknown): InterviewTone {
  const ok = new Set([
    "neutral",
    "encouraging",
    "curious",
    "probing",
    "reassuring",
    "wrapping_up",
  ]);
  const s = String(v ?? "neutral");
  return (ok.has(s) ? s : "neutral") as InterviewTone;
}

export function useInterviewerSession({
  slug,
  language,
  code,
  isAuthenticated,
  submission,
  mode = "standard",
}: Options) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [phase, setPhase] = useState<string | null>(null);
  const [uiState, setUiState] = useState<InterviewerUiState | string>("idle");
  const [utterance, setUtterance] = useState("");
  const [partial, setPartial] = useState("");
  const [busy, setBusy] = useState(false);
  const [level, setLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [lastLatencyMs, setLastLatencyMs] = useState<number | null>(null);

  const lastExecId = useRef<string | null>(null);
  const lastCodeSent = useRef<string>("");
  const debounceRef = useRef<number | null>(null);
  const lastSpokenRef = useRef<string>("");
  const voiceRef = useRef<RealtimeVoiceLoop | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const inflightRef = useRef(false);
  const pendingChunksRef = useRef<string[]>([]);
  const streamToneRef = useRef<InterviewTone>("neutral");
  const firstChunkEmittedRef = useRef(false);

  const active = sessionId !== null;

  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  const flushMergedChunks = useCallback((force = false) => {
    const pending = pendingChunksRef.current;
    if (!pending.length) return;
    if (!force && pending.length < 2 && !firstChunkEmittedRef.current) {
      // Emit first sentence immediately for low latency.
      const first = pending.shift()!;
      firstChunkEmittedRef.current = true;
      voiceRef.current?.enqueueSpeechChunk(first, streamToneRef.current);
      return;
    }
    if (!force && pending.length < 2) return;
    const merged = mergeSpeakableChunks(pending, {
      minWords: 8,
      maxWords: 25,
      firstUnmerged: !firstChunkEmittedRef.current,
    });
    pendingChunksRef.current = [];
    for (const part of merged) {
      firstChunkEmittedRef.current = true;
      voiceRef.current?.enqueueSpeechChunk(part, streamToneRef.current);
    }
  }, []);

  const onSpeakChunk = useCallback(
    (text: string, tone?: InterviewTone) => {
      if (tone) streamToneRef.current = tone;
      setUiState("speaking");
      setUtterance((prev) => (prev ? `${prev} ${text}` : text));
      pendingChunksRef.current.push(text);
      if (!firstChunkEmittedRef.current) {
        flushMergedChunks(false);
      } else if (pendingChunksRef.current.length >= 2) {
        flushMergedChunks(false);
      }
    },
    [flushMergedChunks],
  );

  const applyFinalResult = useCallback(
    (
      result: {
        state: string;
        utterance: string;
        cancelled: boolean;
        tone?: InterviewTone;
      },
      opts?: { alreadyStreaming?: boolean },
    ) => {
      setPhase(result.state);
      flushMergedChunks(true);
      if (!result.cancelled && result.utterance.trim()) {
        setUtterance(result.utterance);
        lastSpokenRef.current = result.utterance.trim();
        setError(null);
        if (!opts?.alreadyStreaming) {
          setUiState("speaking");
          voiceRef.current?.speak(result.utterance, result.tone ?? "neutral");
        }
      } else if (!opts?.alreadyStreaming) {
        setUiState("listening");
        voiceRef.current?.speak("");
      }
    },
    [flushMergedChunks],
  );

  const postEvent = useCallback(
    async (type: string, payload: Record<string, unknown> = {}) => {
      const sid = sessionIdRef.current;
      if (!sid) return null;
      setBusy(true);
      setError(null);
      setUiState("thinking");
      voiceRef.current?.setThinking();
      stopBackchannel();
      void playBackchannel();
      let streamed = false;
      pendingChunksRef.current = [];
      firstChunkEmittedRef.current = false;
      streamToneRef.current = "neutral";
      const enriched = {
        ...payload,
        client_event_id:
          typeof payload.client_event_id === "string"
            ? payload.client_event_id
            : newClientEventId(),
      };
      try {
        const useStream =
          type === "candidate.turn.finalized" || type === "interview.started";
        if (useStream) {
          const result = await interviewerService.postEventStream(
            sid,
            type,
            enriched,
            {
              onSpeakChunk: (text, _turnId, tone) => {
                streamed = true;
                onSpeakChunk(text, asTone(tone));
              },
            },
          );
          applyFinalResult(
            { ...result, tone: asTone((result as { tone?: unknown }).tone) },
            { alreadyStreaming: streamed },
          );
          if (streamed && result.utterance.trim()) {
            lastSpokenRef.current = result.utterance.trim();
          }
          return result;
        }

        const { result } = await interviewerService.postEvent(sid, type, enriched);
        applyFinalResult(result);
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Interviewer request failed");
        setUiState("listening");
        voiceRef.current?.speak("");
        return null;
      } finally {
        setBusy(false);
        inflightRef.current = false;
      }
    },
    [applyFinalResult, onSpeakChunk],
  );

  const ensureVoice = useCallback(async () => {
    if (voiceRef.current) return voiceRef.current;
    const loop = new RealtimeVoiceLoop({
      onPhase: (p) => setUiState(p),
      onPartial: (t) => setPartial(t),
      onLevel: (l) => setLevel(l),
      onFirstAudio: (ms) => {
        setLastLatencyMs(Math.round(ms));
        if (typeof console !== "undefined" && console.debug) {
          console.debug(`[interviewer] first_audio_ms=${Math.round(ms)}`);
        }
      },
      onBargeIn: () => {
        stopBackchannel();
        const sid = sessionIdRef.current;
        if (!sid) return;
        void interviewerService
          .postEvent(sid, "candidate.interrupted", {})
          .catch(() => undefined);
      },
      onError: (message) => setError(message),
      onFinalUtterance: (text) => {
        const trimmed = text.trim();
        if (!trimmed || !sessionIdRef.current || inflightRef.current) return;
        if (
          lastSpokenRef.current &&
          trimmed.length > 12 &&
          lastSpokenRef.current.toLowerCase().includes(trimmed.toLowerCase().slice(0, 24))
        ) {
          return;
        }
        inflightRef.current = true;
        setPartial("");
        void postEvent("candidate.turn.finalized", { text: trimmed });
      },
    });
    voiceRef.current = loop;
    loop.unlockAudio();
    await loop.start();
    void prewarmBackchannel();
    return loop;
  }, [postEvent]);

  const start = useCallback(async () => {
    if (!isAuthenticated) {
      setError("Sign in to start the interviewer.");
      return;
    }
    cancelBrowserSpeech();
    lastSpokenRef.current = "";
    setBusy(true);
    setError(null);
    setUtterance("");
    setPartial("");
    setLastLatencyMs(null);
    try {
      await ensureVoice();
      try {
        sessionStorage.removeItem(sessionStorageKey(slug));
      } catch {
        /* ignore */
      }

      const { session } = await interviewerService.createSession({
        slug,
        mode,
        language: language ?? undefined,
      });
      setSessionId(session.sessionId);
      sessionIdRef.current = session.sessionId;
      sessionStorage.setItem(sessionStorageKey(slug), session.sessionId);
      setPhase(session.state);
      let streamed = false;
      pendingChunksRef.current = [];
      firstChunkEmittedRef.current = false;
      streamToneRef.current = "encouraging";
      void playBackchannel();
      const result = await interviewerService.postEventStream(
        session.sessionId,
        "interview.started",
        { client_event_id: newClientEventId() },
        {
          onSpeakChunk: (text, _turnId, tone) => {
            streamed = true;
            onSpeakChunk(text, asTone(tone));
          },
        },
      );
      setPhase(result.state);
      flushMergedChunks(true);
      if (!result.cancelled && result.utterance.trim()) {
        setUtterance(result.utterance);
        lastSpokenRef.current = result.utterance.trim();
        setError(null);
        if (!streamed) {
          setUiState("speaking");
          voiceRef.current?.speak(result.utterance, "encouraging");
        }
      } else if (!streamed) {
        setUiState("listening");
      }
    } catch (err) {
      setSessionId(null);
      sessionIdRef.current = null;
      voiceRef.current?.stop();
      voiceRef.current = null;
      setError(err instanceof Error ? err.message : "Could not start interviewer");
      setUiState("idle");
    } finally {
      setBusy(false);
    }
  }, [isAuthenticated, slug, mode, language, ensureVoice, onSpeakChunk, flushMergedChunks]);

  const stop = useCallback(() => {
    stopBackchannel();
    voiceRef.current?.stop();
    voiceRef.current = null;
    cancelBrowserSpeech();
    try {
      sessionStorage.removeItem(sessionStorageKey(slug));
    } catch {
      /* ignore */
    }
    setSessionId(null);
    sessionIdRef.current = null;
    setPhase(null);
    setUiState("idle");
    setUtterance("");
    setPartial("");
    setLevel(0);
    setError(null);
    setLastLatencyMs(null);
    lastExecId.current = null;
    lastCodeSent.current = "";
    lastSpokenRef.current = "";
    inflightRef.current = false;
  }, [slug]);

  useEffect(() => {
    if (!sessionId || !language || phase !== "CODING") return;
    if (code === lastCodeSent.current) return;
    if (debounceRef.current !== null) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      lastCodeSent.current = code;
      void postEvent("code.snapshot.created", {
        language,
        code,
        diff_summary: "editor_idle_snapshot",
      });
    }, 2500);
    return () => {
      if (debounceRef.current !== null) window.clearTimeout(debounceRef.current);
    };
  }, [code, language, sessionId, phase, postEvent]);

  useEffect(() => {
    if (!sessionId || !submission || !TERMINAL.has(submission.status)) return;
    if (lastExecId.current === submission.id) return;
    lastExecId.current = submission.id;
    const failed = submission.status !== "ACCEPTED";
    const type = failed ? "execution.failed" : "execution.completed";
    void postEvent(type, {
      status: submission.status,
      mode: submission.mode,
      notes: submission.stderr?.slice(0, 400) ?? null,
      stderr: submission.stderr?.slice(0, 400) ?? null,
    });
  }, [submission, sessionId, postEvent]);

  useEffect(() => {
    if (!isAuthenticated || sessionIdRef.current) return;
    let cancelled = false;
    const cachedId = sessionStorage.getItem(sessionStorageKey(slug));
    if (!cachedId) return;
    void (async () => {
      try {
        const { session } = await interviewerService.restoreSession(cachedId);
        if (cancelled) return;
        await ensureVoice();
        if (cancelled) return;
        setSessionId(session.sessionId);
        sessionIdRef.current = session.sessionId;
        setPhase(session.state);
        setUiState("listening");
      } catch {
        sessionStorage.removeItem(sessionStorageKey(slug));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, slug, ensureVoice]);

  useEffect(
    () => () => {
      stopBackchannel();
      voiceRef.current?.stop();
      voiceRef.current = null;
      cancelBrowserSpeech();
    },
    [],
  );

  return {
    active,
    busy,
    phase,
    uiState,
    utterance,
    partial,
    level,
    error,
    lastLatencyMs,
    start,
    stop,
  };
}
