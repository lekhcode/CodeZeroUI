/** Semantic end-of-turn helpers for STT + VAD (Phase 5). */

const CONNECTORS = new Set([
  "and",
  "so",
  "because",
  "but",
  "then",
  "um",
  "uh",
  "like",
  "matlab",
  "aur",
  "toh",
  "ya",
  "or",
  "if",
]);

export type EotConfig = {
  baseSilenceMs: number;
  extendedSilenceMs: number;
  shortSilenceMs: number;
};

export const DEFAULT_EOT: EotConfig = {
  baseSilenceMs: 800,
  extendedSilenceMs: 1600,
  shortSilenceMs: 550,
};

export function lastWord(transcript: string): string {
  const parts = transcript.trim().toLowerCase().split(/\s+/);
  return parts[parts.length - 1]?.replace(/[^\w']/g, "") ?? "";
}

export function looksUnfinished(transcript: string): boolean {
  const t = transcript.trim();
  if (!t) return true;
  if (/[,:;]$/.test(t)) return true;
  if (/\b(and|so|because|but|then|or|if|matlab|aur|toh)\s*$/i.test(t)) return true;
  return CONNECTORS.has(lastWord(t));
}

export function looksComplete(transcript: string): boolean {
  const t = transcript.trim();
  if (!t) return false;
  if (/[.?!]$/.test(t)) return true;
  // Short clear claim without trailing connector
  return !looksUnfinished(t) && t.split(/\s+/).length >= 4;
}

export function silenceThresholdMs(transcript: string, cfg: EotConfig = DEFAULT_EOT): number {
  if (looksUnfinished(transcript)) return cfg.extendedSilenceMs;
  if (looksComplete(transcript)) return cfg.shortSilenceMs;
  return cfg.baseSilenceMs;
}
