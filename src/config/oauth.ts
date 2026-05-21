/**
 * OAuth client config — dev uses *_LOCAL when set; prod uses primary vars.
 * GitHub callback is the frontend route `/auth/github/callback` (not the API).
 * Google uses @react-oauth/google (id token → POST /api/v1/auth/google).
 */

function trimEnv(value: string | undefined): string {
  return (value ?? "").trim();
}

const isDev = import.meta.env.DEV;

export const googleClientId = trimEnv(import.meta.env.VITE_GOOGLE_CLIENT_ID);

export const githubClientId = isDev
  ? trimEnv(import.meta.env.VITE_GITHUB_CLIENT_ID_LOCAL) ||
    trimEnv(import.meta.env.VITE_GITHUB_CLIENT_ID)
  : trimEnv(import.meta.env.VITE_GITHUB_CLIENT_ID);

/**
 * Must match GitHub OAuth App "Authorization callback URL" exactly.
 * Dev: always use the live browser origin (Vite may use :5174 when :5173 is busy).
 * Prod: use VITE_GITHUB_REDIRECT_URI (e.g. https://codezloopcode.uk/auth/github/callback).
 */
export function getGithubRedirectUri(): string {
  if (isDev) {
    return `${window.location.origin}/auth/github/callback`;
  }

  const fromEnv = trimEnv(import.meta.env.VITE_GITHUB_REDIRECT_URI);
  if (fromEnv.length > 0) return fromEnv;
  return `${window.location.origin}/auth/github/callback`;
}

export const isGoogleOAuthConfigured = googleClientId.length > 0;
export const isGithubOAuthConfigured = githubClientId.length > 0;
