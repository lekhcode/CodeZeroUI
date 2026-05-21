export type OAuthIntent = "login" | "register";

const INTENT_KEY = "codezero:oauth:intent";
const GITHUB_CODE_PREFIX = "oauth:github:code:";
const GITHUB_PENDING_INTENT_KEY = "codezero:oauth:github:pending-intent";

export function setOAuthIntent(intent: OAuthIntent): void {
  sessionStorage.setItem(INTENT_KEY, intent);
  sessionStorage.setItem(GITHUB_PENDING_INTENT_KEY, intent);
}

export function setGithubPendingIntent(intent: OAuthIntent): void {
  setOAuthIntent(intent);
}

export function getOAuthIntent(): OAuthIntent {
  const v = sessionStorage.getItem(INTENT_KEY);
  if (v === "register") return "register";
  return "login";
}

export function clearOAuthIntent(): void {
  sessionStorage.removeItem(INTENT_KEY);
  sessionStorage.removeItem(GITHUB_PENDING_INTENT_KEY);
}

export function encodeGithubOAuthState(intent: OAuthIntent): string {
  return btoa(JSON.stringify({ intent }));
}

function intentFromStateParam(state: string | null): OAuthIntent | null {
  if (!state?.trim()) return null;
  try {
    const parsed = JSON.parse(atob(state)) as { intent?: string };
    if (parsed.intent === "register") return "register";
    if (parsed.intent === "login") return "login";
  } catch {
    /* ignore */
  }
  return null;
}

/** Resolve login vs register for GitHub callback (state param + session fallbacks). */
export function resolveGithubOAuthIntent(state: string | null, code?: string): OAuthIntent {
  const fromState = intentFromStateParam(state);
  if (fromState) return fromState;

  if (code) {
    const perCode = sessionStorage.getItem(`${GITHUB_CODE_PREFIX}${code}:intent`);
    if (perCode === "register" || perCode === "login") return perCode;
  }

  const pending = sessionStorage.getItem(GITHUB_PENDING_INTENT_KEY);
  if (pending === "register") return "register";

  return getOAuthIntent();
}

export function persistGithubCodeIntent(code: string, intent: OAuthIntent): void {
  sessionStorage.setItem(`${GITHUB_CODE_PREFIX}${code}:intent`, intent);
}

/** @deprecated use resolveGithubOAuthIntent */
export function parseGithubOAuthState(state: string | null): OAuthIntent {
  return resolveGithubOAuthIntent(state);
}

const PENDING_TOKEN_KEY = "codezero:oauth:pendingToken";
const PENDING_PREVIEW_KEY = "codezero:oauth:pendingPreview";

export type OAuthPendingPreview = {
  email: string;
  suggestedName: string | null;
  avatar: string | null;
  provider: "GOOGLE" | "GITHUB";
};

export function storeOAuthPending(pendingToken: string, preview: OAuthPendingPreview): void {
  sessionStorage.setItem(PENDING_TOKEN_KEY, pendingToken);
  sessionStorage.setItem(PENDING_PREVIEW_KEY, JSON.stringify(preview));
}

export function getOAuthPendingToken(): string | null {
  return sessionStorage.getItem(PENDING_TOKEN_KEY);
}

export function getOAuthPendingPreview(): OAuthPendingPreview | null {
  const raw = sessionStorage.getItem(PENDING_PREVIEW_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as OAuthPendingPreview;
  } catch {
    return null;
  }
}

export function clearOAuthPending(): void {
  sessionStorage.removeItem(PENDING_TOKEN_KEY);
  sessionStorage.removeItem(PENDING_PREVIEW_KEY);
}

/** Read JWT payload for display only — server still verifies on complete-registration. */
function readJwtPayload(token: string): Record<string, unknown> | null {
  const segment = token.split(".")[1];
  if (!segment) return null;
  try {
    const json = atob(segment.replace(/-/g, "+").replace(/_/g, "/"));
    const parsed: unknown = JSON.parse(json);
    return typeof parsed === "object" && parsed !== null ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function providerFromJwt(value: unknown): OAuthPendingPreview["provider"] {
  const raw = String(value ?? "").toUpperCase();
  return raw === "GITHUB" ? "GITHUB" : "GOOGLE";
}

/** Build preview when API redirect only passes ?pendingToken= (no sessionStorage yet). */
export function previewFromPendingToken(pendingToken: string): OAuthPendingPreview | null {
  const payload = readJwtPayload(pendingToken);
  if (!payload || payload.purpose !== "oauth_pending") return null;
  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  if (!email) return null;
  return {
    email,
    suggestedName: typeof payload.name === "string" ? payload.name : null,
    avatar: typeof payload.avatar === "string" ? payload.avatar : null,
    provider: providerFromJwt(payload.provider),
  };
}
