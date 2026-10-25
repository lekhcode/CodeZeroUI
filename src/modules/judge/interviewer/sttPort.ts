/**
 * STT port (Phase 6) — browser Web Speech today; swap for Whisper/cloud later.
 */

export type SttResult = {
  text: string;
  isFinal: boolean;
  confidence?: number;
};

export type SttPort = {
  readonly name: string;
  start: (handlers: {
    onPartial?: (t: string) => void;
    onFinal?: (t: SttResult) => void;
    onError?: (m: string) => void;
  }) => void;
  stop: () => void;
};

/** Marker that RealtimeVoiceLoop currently owns browser STT; future engines plug here. */
export const BROWSER_STT_ENGINE = "web-speech" as const;

export type SttEngineId = typeof BROWSER_STT_ENGINE | "whisper-local" | "cloud";
