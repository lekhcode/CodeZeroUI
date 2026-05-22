import type { CompilerLanguage } from "@/types/compiler.types";
import { COMPILER_LANGUAGES } from "@/types/compiler.types";
import type { StarterCodeTemplatePayload, TestcaseUploadItem } from "@/services/problemRuntimeConfig.service";

const LANG_IDS = new Set(COMPILER_LANGUAGES.map((l) => l.id));

function isCompilerLanguage(v: string): v is CompilerLanguage {
  return LANG_IDS.has(v as CompilerLanguage);
}

const FN_RE = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;

export function parseStarterCodeJson(raw: string): { ok: true; value: StarterCodeTemplatePayload } | { ok: false; error: string } {
  const t = raw.trim();
  if (t === "") return { ok: false, error: "Paste or enter starter code JSON." };
  let parsed: unknown;
  try {
    parsed = JSON.parse(t) as unknown;
  } catch {
    return { ok: false, error: "Invalid JSON — check brackets, quotes, and commas." };
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { ok: false, error: "Starter code JSON must be a single object." };
  }
  const o = parsed as Record<string, unknown>;
  const language = typeof o.language === "string" ? o.language : "";
  if (!isCompilerLanguage(language)) {
    return { ok: false, error: `language must be one of: ${[...LANG_IDS].join(", ")}` };
  }
  const functionName = typeof o.functionName === "string" ? o.functionName.trim() : "";
  if (functionName === "" || functionName.length > 80 || !FN_RE.test(functionName)) {
    return { ok: false, error: "functionName must be a valid identifier (1–80 chars)." };
  }
  const starterCode = typeof o.starterCode === "string" ? o.starterCode : "";
  if (starterCode.trim() === "") {
    return { ok: false, error: "starterCode is required." };
  }
  let judgeArgHints: string | null | undefined;
  if (o.judgeArgHints === undefined) {
    judgeArgHints = undefined;
  } else if (o.judgeArgHints === null) {
    judgeArgHints = null;
  } else if (typeof o.judgeArgHints === "string") {
    judgeArgHints = o.judgeArgHints;
  } else {
    return { ok: false, error: "judgeArgHints must be a string or null when provided." };
  }
  return {
    ok: true,
    value: { language, functionName, starterCode, judgeArgHints },
  };
}

function parseTestcaseItem(item: unknown, index: number): { ok: true; value: TestcaseUploadItem } | { ok: false; error: string } {
  if (item === null || typeof item !== "object" || Array.isArray(item)) {
    return { ok: false, error: `Testcase #${index + 1} must be an object.` };
  }
  const o = item as Record<string, unknown>;
  const input = typeof o.input === "string" ? o.input : "";
  const expectedOutput = typeof o.expectedOutput === "string" ? o.expectedOutput : "";
  if (input.trim() === "") return { ok: false, error: `Testcase #${index + 1}: input is required.` };
  if (expectedOutput.trim() === "") return { ok: false, error: `Testcase #${index + 1}: expectedOutput is required.` };
  if (typeof o.isHidden !== "boolean") {
    return { ok: false, error: `Testcase #${index + 1}: isHidden must be true or false.` };
  }
  if (typeof o.orderIndex !== "number" || !Number.isInteger(o.orderIndex) || o.orderIndex < 0) {
    return { ok: false, error: `Testcase #${index + 1}: orderIndex must be a non-negative integer.` };
  }
  return {
    ok: true,
    value: {
      input,
      expectedOutput,
      isHidden: o.isHidden,
      orderIndex: o.orderIndex,
    },
  };
}

export function parseTestcasesJson(raw: string): { ok: true; value: TestcaseUploadItem[] } | { ok: false; error: string } {
  const t = raw.trim();
  if (t === "") return { ok: false, error: "Paste or enter testcase JSON array." };
  let parsed: unknown;
  try {
    parsed = JSON.parse(t) as unknown;
  } catch {
    return { ok: false, error: "Invalid JSON — expected an array of testcase objects." };
  }
  if (!Array.isArray(parsed) || parsed.length === 0) {
    return { ok: false, error: "Testcases must be a non-empty JSON array." };
  }
  const items: TestcaseUploadItem[] = [];
  for (let i = 0; i < parsed.length; i++) {
    const r = parseTestcaseItem(parsed[i], i);
    if (!r.ok) return r;
    items.push(r.value);
  }
  return { ok: true, value: items };
}

export function buildStarterCodeExample(language: CompilerLanguage, functionName: string, starterCode: string, judgeArgHints?: string | null): string {
  const body: Record<string, unknown> = {
    language,
    functionName,
    starterCode,
  };
  if (judgeArgHints !== undefined && judgeArgHints !== null && judgeArgHints !== "") {
    body.judgeArgHints = judgeArgHints;
  }
  return JSON.stringify(body, null, 2);
}

export function buildTestcasesExample(
  cases: Array<{ input: string; expectedOutput: string; isHidden?: boolean; orderIndex: number }>,
): string {
  return JSON.stringify(
    cases.map((c, i) => ({
      input: c.input,
      expectedOutput: c.expectedOutput,
      isHidden: c.isHidden ?? false,
      orderIndex: c.orderIndex ?? i + 1,
    })),
    null,
    2,
  );
}
