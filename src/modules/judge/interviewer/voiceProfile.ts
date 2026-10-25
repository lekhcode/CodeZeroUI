/** Interviewer voice config — v3 adds neural Edge TTS settings. */

const STORAGE_KEY = "codezero.interviewer.voiceProfile.v3";
const LEGACY_KEY = "codezero.interviewer.voiceProfile.v2";

export type TtsEngine = "neural" | "browser";
export type InterviewTone =
  | "neutral"
  | "encouraging"
  | "curious"
  | "probing"
  | "reassuring"
  | "wrapping_up";

export type InterviewerVoiceProfile = {
  assistantName: string;
  locale: string;
  voiceUri: string | null;
  /** browser = Web Speech; neural = Edge TTS via /tts */
  ttsEngine: TtsEngine;
  /** Edge voice id, e.g. en-IN-NeerjaNeural */
  neuralVoice: string;
  rate: number;
  pitch: number;
  volume: number;
  useLexicon: boolean;
  preferFemale: boolean;
  preferredVoiceNames: string[];
  preferredLangs: string[];
  /** Feature flags */
  useSileroVad: boolean;
  useBackchannel: boolean;
};

export const DEFAULT_VOICE_PROFILE: InterviewerVoiceProfile = {
  assistantName: "Kiran",
  locale: "en-IN",
  voiceUri: null,
  ttsEngine: "neural",
  neuralVoice: "en-IN-NeerjaNeural",
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
  useLexicon: true,
  preferFemale: true,
  preferredVoiceNames: [
    "Microsoft Zira",
    "Google US English",
    "Samantha",
    "Microsoft Aria",
    "Zira",
  ],
  preferredLangs: ["en-IN", "en-US", "en-GB", "en"],
  useSileroVad: false,
  useBackchannel: true,
};

export function loadVoiceProfile(): InterviewerVoiceProfile {
  if (typeof window === "undefined") return { ...DEFAULT_VOICE_PROFILE };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_VOICE_PROFILE, ...(JSON.parse(raw) as Partial<InterviewerVoiceProfile>) };
    }
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const parsed = JSON.parse(legacy) as Partial<InterviewerVoiceProfile>;
      const migrated = { ...DEFAULT_VOICE_PROFILE, ...parsed, ttsEngine: "neural" as const };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    }
  } catch {
    /* ignore */
  }
  return { ...DEFAULT_VOICE_PROFILE };
}

export function saveVoiceProfile(patch: Partial<InterviewerVoiceProfile>): InterviewerVoiceProfile {
  const next = { ...loadVoiceProfile(), ...patch };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return next;
}

function looksFemale(name: string): boolean {
  return /zira|aria|jenny|samantha|susan|karen|moira|female|neerja/i.test(name);
}

function looksMale(name: string): boolean {
  return /david|mark|ravi|male|prabhat|daniel/i.test(name);
}

export function scoreBrowserVoice(
  voice: SpeechSynthesisVoice,
  profile: InterviewerVoiceProfile,
): number {
  let score = 0;
  const lang = (voice.lang || "").toLowerCase();
  const name = voice.name || "";
  profile.preferredLangs.forEach((l, i) => {
    if (lang.startsWith(l.toLowerCase())) score += 80 - i * 8;
  });
  profile.preferredVoiceNames.forEach((hint, i) => {
    if (name.toLowerCase().includes(hint.toLowerCase())) score += 55 - i * 2;
  });
  if (profile.preferFemale) {
    if (looksFemale(name)) score += 45;
    if (looksMale(name)) score -= 40;
  }
  if (/natural|neural|online/i.test(name)) score += 10;
  if (profile.voiceUri && voice.voiceURI === profile.voiceUri) score += 200;
  return score;
}

export function pickBrowserVoice(
  voices: SpeechSynthesisVoice[],
  profile: InterviewerVoiceProfile = loadVoiceProfile(),
): SpeechSynthesisVoice | null {
  if (!voices.length) return null;
  if (profile.voiceUri) {
    const exact = voices.find((v) => v.voiceURI === profile.voiceUri);
    if (exact) return exact;
  }
  let best: SpeechSynthesisVoice | null = null;
  let bestScore = -1;
  for (const v of voices) {
    const s = scoreBrowserVoice(v, profile);
    if (s > bestScore) {
      bestScore = s;
      best = v;
    }
  }
  return best ?? voices.find((v) => v.lang.toLowerCase().startsWith("en")) ?? voices[0] ?? null;
}

export function listRankedBrowserVoices(
  profile: InterviewerVoiceProfile = loadVoiceProfile(),
): Array<{ voice: SpeechSynthesisVoice; score: number }> {
  if (typeof window === "undefined" || !window.speechSynthesis) return [];
  return window.speechSynthesis
    .getVoices()
    .map((voice) => ({ voice, score: scoreBrowserVoice(voice, profile) }))
    .sort((a, b) => b.score - a.score);
}

/** Mild tone → delivery multipliers for Edge TTS requests. */
export function toneToDelivery(tone: InterviewTone | string | undefined): {
  rate: number;
  pitch: number;
  volume: number;
} {
  switch (tone) {
    case "encouraging":
      return { rate: 1.05, pitch: 1.02, volume: 1.0 };
    case "curious":
      return { rate: 1.02, pitch: 1.03, volume: 1.0 };
    case "probing":
      return { rate: 0.95, pitch: 0.98, volume: 1.0 };
    case "reassuring":
      return { rate: 0.92, pitch: 0.99, volume: 0.92 };
    case "wrapping_up":
      return { rate: 0.97, pitch: 1.0, volume: 0.95 };
    default:
      return { rate: 1.0, pitch: 1.0, volume: 1.0 };
  }
}
