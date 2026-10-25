/** Light TTS normalization — keep natural speech; only expand ambiguous tech tokens. */

type LexiconRule = { pattern: RegExp; say: string };

const RULES: LexiconRule[] = [
  { pattern: /\bhashmaps?\b/gi, say: "hash map" },
  { pattern: /\bhash\s*tables?\b/gi, say: "hash table" },
  { pattern: /\bJavaScript\b/gi, say: "JavaScript" },
  { pattern: /\bAPIs?\b/gi, say: "A P I" },
  { pattern: /\bHTTP\b/gi, say: "H T T P" },
  { pattern: /\bSQL\b/gi, say: "S Q L" },
  { pattern: /\bO\(n\^?2\)(?!\w)/gi, say: "O of n squared" },
  { pattern: /\bO\(n\s*log\s*n\)(?!\w)/gi, say: "O of n log n" },
  { pattern: /\bO\(n\)(?!\w)/gi, say: "O of n" },
  { pattern: /\bO\(1\)(?!\w)/gi, say: "O of one" },
  { pattern: /\bBFS\b/g, say: "B F S" },
  { pattern: /\bDFS\b/g, say: "D F S" },
  { pattern: /\bJSON\b/g, say: "jason" },
];

export const EVALUATION_PHRASES = [
  "algorithm",
  "complexity",
  "recursion",
  "asynchronous",
  "concurrency",
  "hashmap",
  "binary search",
  "time complexity",
  "space complexity",
  "JavaScript, Java, Python",
  "API, HTTP, SQL",
  "Okay. What would the time complexity be?",
  "You mentioned this is linear time. Which part of the algorithm dominates that cost?",
] as const;

export function rewriteForSpeech(text: string): string {
  let out = text;
  for (const rule of RULES) {
    out = out.replace(rule.pattern, rule.say);
  }
  out = out.replace(/\s*[—–]\s*/g, ". ");
  out = out.replace(/\s{2,}/g, " ");
  return out.trim();
}
