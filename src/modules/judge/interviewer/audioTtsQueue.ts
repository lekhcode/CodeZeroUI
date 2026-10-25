/** Neural TTS queue (Edge via /api) with prefetch + browser fallback. */

import { tokenStorage } from "@/utils/storage";
import { cancelBrowserSpeech, speakBrowserTts } from "./browserSpeech";
import { rewriteForSpeech } from "./pronunciation";
import {
  loadVoiceProfile,
  toneToDelivery,
  type InterviewTone,
  type InterviewerVoiceProfile,
} from "./voiceProfile";

export type TtsQueueHandlers = {
  onIdle?: () => void;
  onStart?: () => void;
  onError?: (m: string) => void;
  onFirstAudio?: (latencyMs: number) => void;
};

type QueueItem = {
  text: string;
  tone: InterviewTone;
  abort: AbortController;
  audioUrl?: string;
  fetchPromise?: Promise<string | null>;
};

export class AudioTtsQueue {
  private q: QueueItem[] = [];
  private playing = false;
  private gen = 0;
  private audio: HTMLAudioElement | null = null;
  private unlocked = false;
  private handlers: TtsQueueHandlers = {};
  private turnStartedAt = 0;
  private firstAudioSent = false;
  private profile: InterviewerVoiceProfile = loadVoiceProfile();

  configure(handlers: TtsQueueHandlers): void {
    this.handlers = handlers;
  }

  /** Call from Start Interview click to unlock autoplay. */
  unlock(): void {
    if (this.unlocked || typeof window === "undefined") return;
    const a = new Audio();
    a.src =
      "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=";
    void a
      .play()
      .then(() => {
        a.pause();
        this.unlocked = true;
      })
      .catch(() => {
        this.unlocked = true;
      });
  }

  clear(): void {
    this.gen += 1;
    for (const item of this.q) {
      item.abort.abort();
      if (item.audioUrl) URL.revokeObjectURL(item.audioUrl);
    }
    this.q = [];
    this.playing = false;
    this.firstAudioSent = false;
    if (this.audio) {
      const el = this.audio;
      const startVol = el.volume;
      const t0 = performance.now();
      const fade = (): void => {
        const t = (performance.now() - t0) / 100;
        if (t >= 1) {
          try {
            el.pause();
            el.removeAttribute("src");
            el.load();
          } catch {
            /* ignore */
          }
          return;
        }
        el.volume = Math.max(0, startVol * (1 - t));
        requestAnimationFrame(fade);
      };
      requestAnimationFrame(fade);
    }
    cancelBrowserSpeech();
  }

  beginTurn(): void {
    this.turnStartedAt = performance.now();
    this.firstAudioSent = false;
    this.profile = loadVoiceProfile();
  }

  enqueue(text: string, tone: InterviewTone = "neutral"): void {
    const raw = text.trim();
    if (!raw) return;
    if (!this.turnStartedAt) this.beginTurn();
    const item: QueueItem = {
      text: this.profile.useLexicon ? rewriteForSpeech(raw) : raw,
      tone,
      abort: new AbortController(),
    };
    item.fetchPromise = this.prefetch(item);
    this.q.push(item);
    void this.prefetchAhead();
    void this.pump();
  }

  private async prefetchAhead(): Promise<void> {
    for (let i = 0; i < Math.min(3, this.q.length); i++) {
      const item = this.q[i]!;
      if (!item.fetchPromise) item.fetchPromise = this.prefetch(item);
    }
  }

  private async prefetch(item: QueueItem): Promise<string | null> {
    if (this.profile.ttsEngine !== "neural") return null;
    const delivery = toneToDelivery(item.tone);
    const base = import.meta.env.VITE_API_BASE_URL ?? "";
    const token = tokenStorage.get();
    const timer = window.setTimeout(() => item.abort.abort(), 4500);
    try {
      const res = await fetch(`${base}/api/v1/interviewer/tts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          text: item.text,
          voice: this.profile.neuralVoice,
          tone: item.tone,
          rate: this.profile.rate * delivery.rate,
          pitch: this.profile.pitch * delivery.pitch,
          volume: this.profile.volume * delivery.volume,
        }),
        signal: item.abort.signal,
      });
      if (!res.ok) return null;
      const buf = await res.arrayBuffer();
      const blob = new Blob([buf], {
        type: res.headers.get("Content-Type") ?? "audio/mpeg",
      });
      const url = URL.createObjectURL(blob);
      item.audioUrl = url;
      return url;
    } catch {
      return null;
    } finally {
      window.clearTimeout(timer);
    }
  }

  private async pump(): Promise<void> {
    if (this.playing) return;
    const myGen = this.gen;
    this.playing = true;
    let started = false;
    while (this.q.length > 0 && myGen === this.gen) {
      const item = this.q.shift()!;
      void this.prefetchAhead();
      const url = item.fetchPromise ? await item.fetchPromise : null;
      if (myGen !== this.gen) break;

      const markStart = (): void => {
        if (started) return;
        started = true;
        if (!this.firstAudioSent) {
          this.firstAudioSent = true;
          this.handlers.onFirstAudio?.(performance.now() - this.turnStartedAt);
        }
        this.handlers.onStart?.();
      };

      if (url) {
        await this.playUrl(url, myGen, markStart);
        URL.revokeObjectURL(url);
      } else {
        await new Promise<void>((resolve) => {
          speakBrowserTts(item.text, {
            cancelPrevious: false,
            settleMs: 0,
            onStart: markStart,
            onEnd: () => resolve(),
            onError: (m) => {
              this.handlers.onError?.(m);
              resolve();
            },
          });
        });
      }
    }
    this.playing = false;
    if (myGen === this.gen && this.q.length === 0) {
      this.handlers.onIdle?.();
    }
  }

  private playUrl(url: string, myGen: number, onStart: () => void): Promise<void> {
    return new Promise((resolve) => {
      if (!this.audio) this.audio = new Audio();
      const el = this.audio;
      el.volume = this.profile.volume;
      const done = (): void => {
        el.onended = null;
        el.onerror = null;
        resolve();
      };
      el.onended = done;
      el.onerror = () => {
        this.handlers.onError?.("Neural TTS playback failed");
        done();
      };
      el.src = url;
      onStart();
      const p = el.play();
      if (p) {
        void p.catch(() => {
          if (myGen === this.gen) {
            this.handlers.onError?.("Audio play blocked — click Start again.");
          }
          done();
        });
      }
    });
  }
}
