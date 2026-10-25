/** Soft backchannel clips while the LLM thinks (Phase 4). */

import { tokenStorage } from "@/utils/storage";
import { loadVoiceProfile } from "./voiceProfile";

const LINES = ["Mm-hmm.", "Okay.", "Got it.", "Right."];

let cache: Map<string, string> = new Map();
let audio: HTMLAudioElement | null = null;
let lastPlayedAt = 0;

async function ensureClip(text: string): Promise<string | null> {
  const hit = cache.get(text);
  if (hit) return hit;
  const profile = loadVoiceProfile();
  if (profile.ttsEngine !== "neural") return null;
  const base = import.meta.env.VITE_API_BASE_URL ?? "";
  const token = tokenStorage.get();
  try {
    const res = await fetch(`${base}/api/v1/interviewer/tts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        text,
        voice: profile.neuralVoice,
        tone: "encouraging",
        rate: 1.05,
        pitch: 1.0,
        volume: 0.75,
      }),
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    const url = URL.createObjectURL(
      new Blob([buf], { type: res.headers.get("Content-Type") ?? "audio/mpeg" }),
    );
    cache.set(text, url);
    return url;
  } catch {
    return null;
  }
}

/** Prefetch a couple of short ack clips (call after Start unlock). */
export async function prewarmBackchannel(): Promise<void> {
  if (!loadVoiceProfile().useBackchannel) return;
  await Promise.all(LINES.slice(0, 2).map((l) => ensureClip(l)));
}

/** Play one soft ack if enough time has passed since the last one. */
export async function playBackchannel(): Promise<void> {
  const profile = loadVoiceProfile();
  if (!profile.useBackchannel) return;
  const now = performance.now();
  if (now - lastPlayedAt < 12_000) return;
  lastPlayedAt = now;
  const line = LINES[Math.floor(Math.random() * LINES.length)]!;
  const url = await ensureClip(line);
  if (!url) return;
  if (!audio) audio = new Audio();
  const el = audio;
  el.volume = 0.55;
  el.src = url;
  void el.play().catch(() => undefined);
}

export function stopBackchannel(): void {
  if (audio) {
    try {
      audio.pause();
    } catch {
      /* ignore */
    }
  }
}
