/** Merge short speakable sentences; keep first sentence unmerged for low latency. */

const WORD = /\S+/g;

export function wordCount(text: string): number {
  return (text.match(WORD) ?? []).length;
}

export function mergeSpeakableChunks(
  sentences: string[],
  opts?: { minWords?: number; maxWords?: number; firstUnmerged?: boolean },
): string[] {
  const minWords = opts?.minWords ?? 8;
  const maxWords = opts?.maxWords ?? 25;
  const firstUnmerged = opts?.firstUnmerged !== false;
  const cleaned = sentences.map((s) => s.trim()).filter(Boolean);
  if (!cleaned.length) return [];

  const out: string[] = [];
  let rest = cleaned;
  if (firstUnmerged) {
    out.push(cleaned[0]!);
    rest = cleaned.slice(1);
  }

  let buf = "";
  for (const sent of rest) {
    if (!buf) {
      buf = sent;
      continue;
    }
    if (buf.trimEnd().endsWith("?")) {
      out.push(buf);
      buf = sent;
      continue;
    }
    const combined = wordCount(buf) + wordCount(sent);
    if (wordCount(buf) < minWords && combined <= maxWords) {
      buf = `${buf} ${sent}`;
    } else {
      out.push(buf);
      buf = sent;
    }
  }
  if (buf) out.push(buf);
  return out;
}
