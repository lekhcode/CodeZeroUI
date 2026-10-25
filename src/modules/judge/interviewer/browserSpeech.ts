/** ₹0 voice I/O via Web Speech APIs — prefers Indian English when the browser exposes it. */

import { rewriteForSpeech } from "./pronunciation";
import { loadVoiceProfile, pickBrowserVoice, type InterviewerVoiceProfile } from "./voiceProfile";

let speakToken = 0;
let speakTimer: number | null = null;
let queueToken = 0;
let cachedVoices: SpeechSynthesisVoice[] = [];
let profileCache: InterviewerVoiceProfile = loadVoiceProfile();

const BENIGN_TTS_ERRORS = new Set(["interrupted", "canceled", "cancelled"]);

export function refreshVoiceProfile(): InterviewerVoiceProfile {
  profileCache = loadVoiceProfile();
  return profileCache;
}

function ensureVoicesLoaded(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !window.speechSynthesis) return [];
  const voices = window.speechSynthesis.getVoices();
  if (voices.length) cachedVoices = voices;
  return cachedVoices.length ? cachedVoices : voices;
}

if (typeof window !== "undefined" && window.speechSynthesis) {
  window.speechSynthesis.addEventListener("voiceschanged", () => {
    cachedVoices = window.speechSynthesis.getVoices();
  });
}

export function cancelBrowserSpeech(): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  speakToken += 1;
  queueToken += 1;
  if (speakTimer !== null) {
    window.clearTimeout(speakTimer);
    speakTimer = null;
  }
  try {
    window.speechSynthesis.cancel();
  } catch {
    /* ignore */
  }
}

/**
 * Sequential sentence TTS for streaming interviewer speech.
 * Same generation keeps playing chunk-by-chunk; barge-in clears via cancelBrowserSpeech().
 */
export class BrowserTtsQueue {
  private q: string[] = [];
  private playing = false;
  private gen = 0;
  private onIdle: (() => void) | null = null;
  private onStart: (() => void) | null = null;
  private onError: ((m: string) => void) | null = null;

  configure(handlers: {
    onIdle?: () => void;
    onStart?: () => void;
    onError?: (m: string) => void;
  }): void {
    this.onIdle = handlers.onIdle ?? null;
    this.onStart = handlers.onStart ?? null;
    this.onError = handlers.onError ?? null;
  }

  clear(): void {
    this.q = [];
    this.playing = false;
    this.gen += 1;
    // Invalidate in-flight synth + pump (barge-in / new turn).
    cancelBrowserSpeech();
  }

  enqueue(text: string): void {
    const t = text.trim();
    if (!t) return;
    this.q.push(t);
    void this.pump();
  }

  private async pump(): Promise<void> {
    if (this.playing) return;
    const myGen = this.gen;
    const myQueue = ++queueToken;
    this.playing = true;
    let started = false;
    while (this.q.length > 0 && myGen === this.gen && myQueue === queueToken) {
      const next = this.q.shift()!;
      await new Promise<void>((resolve) => {
        // Queue path must NOT cancel — sequential chunks share one synth queue.
        speakBrowserTts(next, {
          cancelPrevious: false,
          settleMs: 0,
          onStart: () => {
            if (!started) {
              started = true;
              this.onStart?.();
            }
          },
          onEnd: () => resolve(),
          onError: (m) => {
            this.onError?.(m);
            resolve();
          },
        });
      });
    }
    this.playing = false;
    if (myGen === this.gen && myQueue === queueToken && this.q.length === 0) {
      this.onIdle?.();
    }
  }
}

export function speakBrowserTts(
  text: string,
  opts?: {
    /** Default true for one-shot speak(); false when BrowserTtsQueue owns sequencing. */
    cancelPrevious?: boolean;
    settleMs?: number;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (message: string) => void;
  },
): void {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    opts?.onError?.("Speech synthesis is not supported in this browser.");
    opts?.onEnd?.();
    return;
  }
  const clean = text.trim();
  if (!clean) {
    opts?.onEnd?.();
    return;
  }

  const cancelPrevious = opts?.cancelPrevious !== false;
  // Small settle only when replacing speech; queued chunks join with no artificial gap.
  const settleMs = opts?.settleMs ?? (cancelPrevious ? 80 : 0);
  const myToken = cancelPrevious ? ++speakToken : speakToken;
  if (cancelPrevious) {
    if (speakTimer !== null) {
      window.clearTimeout(speakTimer);
      speakTimer = null;
    }
    try {
      window.speechSynthesis.cancel();
    } catch {
      /* ignore */
    }
  }

  const startUtterance = () => {
    if (cancelPrevious && myToken !== speakToken) return;

    const profile = profileCache;
    const spoken = profile.useLexicon ? rewriteForSpeech(clean) : clean;
    const utter = new SpeechSynthesisUtterance(spoken);
    utter.rate = profile.rate;
    utter.pitch = profile.pitch;
    utter.volume = profile.volume;
    utter.lang = profile.locale || "en-IN";

    const applyVoice = () => {
      const preferred = pickBrowserVoice(ensureVoicesLoaded(), profile);
      if (preferred) {
        utter.voice = preferred;
        utter.lang = preferred.lang || utter.lang;
      }
    };
    applyVoice();
    if (ensureVoicesLoaded().length === 0) {
      window.speechSynthesis.addEventListener("voiceschanged", applyVoice, { once: true });
    }

    let finished = false;
    const finish = (fn?: () => void) => {
      if (finished) return;
      if (cancelPrevious && myToken !== speakToken) return;
      finished = true;
      fn?.();
    };

    utter.onstart = () => {
      if (cancelPrevious && myToken !== speakToken) return;
      try {
        if (window.speechSynthesis.paused) window.speechSynthesis.resume();
      } catch {
        /* ignore */
      }
      opts?.onStart?.();
    };

    utter.onend = () => {
      finish(() => opts?.onEnd?.());
    };

    utter.onerror = (ev) => {
      const reason = String((ev as SpeechSynthesisErrorEvent).error ?? "");
      if (
        BENIGN_TTS_ERRORS.has(reason) ||
        (cancelPrevious && myToken !== speakToken)
      ) {
        finish(() => opts?.onEnd?.());
        return;
      }
      finish(() => {
        opts?.onError?.(`Could not play interviewer voice (${reason || "unknown"}).`);
        opts?.onEnd?.();
      });
    };

    try {
      window.speechSynthesis.speak(utter);
      window.setTimeout(() => {
        if (cancelPrevious && myToken !== speakToken) return;
        try {
          if (window.speechSynthesis.paused) window.speechSynthesis.resume();
        } catch {
          /* ignore */
        }
      }, 250);
    } catch {
      finish(() => {
        opts?.onError?.("Could not start interviewer voice.");
        opts?.onEnd?.();
      });
    }
  };

  if (settleMs > 0) {
    speakTimer = window.setTimeout(() => {
      speakTimer = null;
      startUtterance();
    }, settleMs);
  } else {
    startUtterance();
  }
}

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((ev: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((ev: { error?: string }) => void) | null;
  onend: (() => void) | null;
};

function getSpeechRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function browserSttSupported(): boolean {
  return typeof window !== "undefined" && getSpeechRecognitionCtor() !== null;
}

export function listenBrowserStt(opts: {
  onFinal: (transcript: string) => void;
  onError?: (message: string) => void;
  onEnd?: () => void;
}): { stop: () => void } | null {
  const Ctor = getSpeechRecognitionCtor();
  if (!Ctor) {
    opts.onError?.("Speech recognition is not supported in this browser.");
    return null;
  }

  const rec = new Ctor();
  rec.lang = loadVoiceProfile().locale || "en-IN";
  rec.continuous = false;
  rec.interimResults = false;

  rec.onresult = (ev) => {
    const first = ev.results[0]?.[0]?.transcript?.trim() ?? "";
    if (first) opts.onFinal(first);
  };
  rec.onerror = (ev) => {
    if (ev.error === "aborted" || ev.error === "no-speech") {
      opts.onEnd?.();
      return;
    }
    opts.onError?.(
      ev.error === "not-allowed" ? "Microphone permission denied." : "Could not hear you. Try again.",
    );
  };
  rec.onend = () => opts.onEnd?.();

  try {
    rec.start();
  } catch {
    opts.onError?.("Could not start the microphone.");
    return null;
  }

  return {
    stop: () => {
      try {
        rec.abort();
      } catch {
        /* ignore */
      }
    },
  };
}
