/** Always-on mic + energy VAD barge-in + continuous STT (browser, ₹0). */

import { cancelBrowserSpeech, refreshVoiceProfile } from "./browserSpeech";
import { silenceThresholdMs } from "./semanticEot";
import { createInterviewerVad, type InterviewerVad } from "./sileroVad";
import { createTtsQueue, type InterviewerTtsQueue } from "./ttsFactory";
import { loadVoiceProfile, type InterviewTone } from "./voiceProfile";

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult:
    | ((ev: {
        resultIndex: number;
        results: ArrayLike<{
          isFinal: boolean;
          0: { transcript: string };
        }>;
      }) => void)
    | null;
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

export type VoiceAgentPhase = "idle" | "listening" | "thinking" | "speaking";

export type RealtimeVoiceHandlers = {
  onPhase?: (phase: VoiceAgentPhase) => void;
  onPartial?: (text: string) => void;
  onFinalUtterance: (text: string) => void;
  onBargeIn?: () => void;
  onError?: (message: string) => void;
  onLevel?: (level01: number) => void;
  onFirstAudio?: (latencyMs: number) => void;
};

export class RealtimeVoiceLoop {
  private stream: MediaStream | null = null;
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private raf = 0;
  private recognition: SpeechRecognitionLike | null = null;
  private wantRunning = false;
  private ttsQueue: InterviewerTtsQueue = createTtsQueue();
  private phase: VoiceAgentPhase = "idle";
  private speechMs = 0;
  private silenceMs = 0;
  private lastTick = 0;
  private handlers: RealtimeVoiceHandlers;
  private interim = "";
  private pendingFinal = "";
  private eotTimer: number | null = null;
  private restartTimer: number | null = null;
  private speakingGuardUntil = 0;
  private lastPartialAt = 0;
  private vad: InterviewerVad = createInterviewerVad();

  constructor(handlers: RealtimeVoiceHandlers) {
    this.handlers = handlers;
    this.ttsQueue.configure({
      onStart: () => {
        this.setPhase("speaking");
        this.speakingGuardUntil = performance.now() + 1400;
        this.speechMs = 0;
      },
      onIdle: () => {
        if (!this.wantRunning) return;
        if (this.phase === "speaking") {
          this.setPhase("listening");
          this.startRecognition();
        }
      },
      onError: (message) => {
        this.handlers.onError?.(message);
        if (this.wantRunning) {
          this.setPhase("listening");
          this.startRecognition();
        }
      },
      onFirstAudio: (ms) => this.handlers.onFirstAudio?.(ms),
    });
  }

  get supported(): boolean {
    return (
      typeof navigator !== "undefined" &&
      !!navigator.mediaDevices?.getUserMedia &&
      getSpeechRecognitionCtor() !== null
    );
  }

  unlockAudio(): void {
    this.ttsQueue.unlock?.();
  }

  async start(): Promise<void> {
    if (!this.supported) {
      this.handlers.onError?.(
        "Realtime voice needs Chrome/Edge + microphone permission.",
      );
      return;
    }
    this.wantRunning = true;
    this.vad = createInterviewerVad();
    this.vad.reset();
    this.ttsQueue.unlock?.();
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: false,
    });
    this.audioCtx = new AudioContext();
    const source = this.audioCtx.createMediaStreamSource(this.stream);
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 2048;
    source.connect(this.analyser);
    this.lastTick = performance.now();
    this.tickVad();
    this.setPhase("listening");
    this.startRecognition();
  }

  stop(): void {
    this.wantRunning = false;
    this.setPhase("idle");
    this.ttsQueue.clear();
    cancelBrowserSpeech();
    this.clearEot();
    if (this.restartTimer !== null) {
      window.clearTimeout(this.restartTimer);
      this.restartTimer = null;
    }
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
    try {
      this.recognition?.abort();
    } catch {
      /* ignore */
    }
    this.recognition = null;
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    void this.audioCtx?.close();
    this.audioCtx = null;
    this.analyser = null;
  }

  setThinking(): void {
    this.setPhase("thinking");
    this.pauseRecognition();
  }

  speak(text: string, tone: InterviewTone = "neutral"): void {
    const t = text.trim();
    this.ttsQueue.clear();
    this.ttsQueue.beginTurn?.();
    if (!t) {
      this.setPhase("listening");
      this.startRecognition();
      return;
    }
    this.pauseRecognition();
    this.setPhase("speaking");
    this.speakingGuardUntil = performance.now() + 1600;
    this.speechMs = 0;
    this.ttsQueue.enqueue(t, tone);
  }

  beginStreamSpeech(): void {
    this.ttsQueue.clear();
    this.ttsQueue.beginTurn?.();
    this.pauseRecognition();
    this.setPhase("speaking");
    this.speakingGuardUntil = performance.now() + 1600;
    this.speechMs = 0;
  }

  enqueueSpeechChunk(text: string, tone: InterviewTone = "neutral"): void {
    const t = text.trim();
    if (!t) return;
    if (this.phase !== "speaking") {
      this.beginStreamSpeech();
    }
    this.speakingGuardUntil = performance.now() + 1200;
    this.ttsQueue.enqueue(t, tone);
  }

  private setPhase(phase: VoiceAgentPhase): void {
    this.phase = phase;
    this.handlers.onPhase?.(phase);
  }

  private rms(): number {
    if (!this.analyser) return 0;
    const data = new Uint8Array(this.analyser.fftSize);
    this.analyser.getByteTimeDomainData(data);
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      const v = (data[i]! - 128) / 128;
      sum += v * v;
    }
    return Math.sqrt(sum / data.length);
  }

  private clearEot(): void {
    if (this.eotTimer !== null) {
      window.clearTimeout(this.eotTimer);
      this.eotTimer = null;
    }
  }

  private scheduleEot(transcript: string): void {
    this.clearEot();
    const wait = silenceThresholdMs(transcript);
    this.eotTimer = window.setTimeout(() => {
      this.eotTimer = null;
      const text = this.pendingFinal.trim();
      if (!text || this.phase !== "listening") return;
      this.pendingFinal = "";
      this.handlers.onFinalUtterance(text);
    }, wait);
  }

  private tickVad = (): void => {
    if (!this.wantRunning) return;
    const now = performance.now();
    const dt = Math.min(50, now - this.lastTick);
    this.lastTick = now;
    const level = this.rms();
    this.handlers.onLevel?.(Math.min(1, level * 6));

    const SPEECH_THRESH = this.phase === "speaking" ? 0.085 : 0.035;
    const BARGE_MS = this.phase === "speaking" ? 420 : 180;
    const isLoud = level >= SPEECH_THRESH;
    const vadState = this.vad.processRms(
      this.phase === "speaking" ? level * 0.85 : level,
      dt,
    );

    if (this.phase === "speaking" && now > this.speakingGuardUntil) {
      if (isLoud && vadState === "speech") {
        this.speechMs += dt;
        if (this.speechMs >= BARGE_MS) {
          this.speechMs = 0;
          this.handleBargeIn();
        }
      } else {
        this.speechMs = 0;
      }
    } else if (this.phase === "listening") {
      if (isLoud || vadState === "speech") {
        this.speechMs += dt;
        this.silenceMs = 0;
      } else {
        this.silenceMs += dt;
        this.speechMs = 0;
        if (
          this.pendingFinal &&
          this.silenceMs >= silenceThresholdMs(this.pendingFinal) &&
          now - this.lastPartialAt > 400
        ) {
          const text = this.pendingFinal.trim();
          this.pendingFinal = "";
          this.clearEot();
          if (text) this.handlers.onFinalUtterance(text);
        }
      }
    }

    this.raf = requestAnimationFrame(this.tickVad);
  };

  private handleBargeIn(): void {
    this.ttsQueue.clear();
    cancelBrowserSpeech();
    this.handlers.onBargeIn?.();
    this.setPhase("listening");
    this.startRecognition();
  }

  private pauseRecognition(): void {
    try {
      this.recognition?.abort();
    } catch {
      /* ignore */
    }
    this.recognition = null;
    if (this.restartTimer !== null) {
      window.clearTimeout(this.restartTimer);
      this.restartTimer = null;
    }
  }

  private startRecognition(): void {
    if (!this.wantRunning) return;
    if (this.phase === "thinking" || this.phase === "speaking") return;
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return;

    this.pauseRecognition();
    refreshVoiceProfile();
    const rec = new Ctor();
    this.recognition = rec;
    rec.lang = loadVoiceProfile().locale || "en-IN";
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (ev) => {
      if (this.phase !== "listening") return;
      let interim = "";
      let finalChunk = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const row = ev.results[i];
        if (!row) continue;
        const piece = row[0]?.transcript ?? "";
        if (row.isFinal) finalChunk += piece;
        else interim += piece;
      }
      if (interim) {
        this.interim = interim.trim();
        this.lastPartialAt = performance.now();
        this.handlers.onPartial?.(this.interim);
      }
      const finalText = finalChunk.trim();
      if (finalText) {
        this.interim = "";
        this.handlers.onPartial?.("");
        this.pendingFinal = `${this.pendingFinal} ${finalText}`.trim();
        this.lastPartialAt = performance.now();
        this.scheduleEot(this.pendingFinal);
      }
    };

    rec.onerror = (ev) => {
      if (ev.error === "not-allowed") {
        this.handlers.onError?.("Microphone permission denied.");
        return;
      }
      if (ev.error && !["aborted", "no-speech", "network"].includes(ev.error)) {
        this.handlers.onError?.(`Mic error: ${ev.error}`);
      }
    };

    rec.onend = () => {
      if (!this.wantRunning) return;
      if (this.phase !== "listening") return;
      this.restartTimer = window.setTimeout(() => {
        this.restartTimer = null;
        this.startRecognition();
      }, 120);
    };

    try {
      rec.start();
    } catch {
      this.restartTimer = window.setTimeout(() => {
        this.restartTimer = null;
        this.startRecognition();
      }, 400);
    }
  }
}
