import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getGithubRedirectUri } from "@/config/oauth";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";
import { getAuthErrorMessage } from "@/utils/authErrors";
import { applyOAuthAuthResult } from "@/utils/handleOAuthResult";
import {
  persistGithubCodeIntent,
  resolveGithubOAuthIntent,
  getOAuthIntent,
} from "@/utils/oauthFlow";
import { isOAuthPendingRegistration, type OAuthAuthResult } from "@/types/api.types";
import { tokenStorage } from "@/utils/storage";

const GITHUB_CODE_PREFIX = "oauth:github:code:";
const GITHUB_SESSION_SUFFIX = ":session";

function codeKey(code: string): string {
  return `${GITHUB_CODE_PREFIX}${code}`;
}

function sessionKey(code: string): string {
  return `${codeKey(code)}${GITHUB_SESSION_SUFFIX}`;
}

type ExchangeRole = "owner" | "waiter" | "done";

function claimGithubExchange(code: string): ExchangeRole {
  const key = codeKey(code);
  const value = sessionStorage.getItem(key);
  if (value === "done") return "done";
  if (value === "exchanging") return "waiter";
  sessionStorage.setItem(key, "exchanging");
  return "owner";
}

function persistGithubResult(code: string, data: OAuthAuthResult): void {
  sessionStorage.setItem(codeKey(code), "done");
  sessionStorage.setItem(sessionKey(code), JSON.stringify(data));
  if (!isOAuthPendingRegistration(data)) {
    tokenStorage.set(data.accessToken);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function GitHubCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const [message, setMessage] = useState("Connecting your GitHub account");

  useEffect(() => {
    let cancelled = false;

    const goLoginError = (err: unknown, fallback: string, intent: "login" | "register") => {
      const msg = getAuthErrorMessage(err, fallback);
      setMessage("Redirecting…");
      const base = intent === "register" ? "/register" : "/login";
      navigate(`${base}?error=github_auth&detail=${encodeURIComponent(msg)}`, { replace: true });
    };

    const applyResult = (data: OAuthAuthResult) => {
      if (cancelled) return;
      applyOAuthAuthResult(data, navigate, setSession);
    };

    const hydrateFromStorage = async (code: string): Promise<OAuthAuthResult | null> => {
      const raw = sessionStorage.getItem(sessionKey(code));
      if (!raw) return null;
      try {
        return JSON.parse(raw) as OAuthAuthResult;
      } catch {
        sessionStorage.removeItem(sessionKey(code));
        return null;
      }
    };

    const waitForPeerExchange = async (code: string): Promise<OAuthAuthResult | null> => {
      for (let i = 0; i < 30; i++) {
        const stored = await hydrateFromStorage(code);
        if (stored) return stored;
        if (sessionStorage.getItem(codeKey(code)) === null) return null;
        await sleep(200);
      }
      return null;
    };

    const finish = async () => {
      const token = searchParams.get("token");
      if (token) {
        try {
          tokenStorage.set(token);
          const user = await authService.me();
          if (!cancelled) {
            setSession(user, token);
            navigate("/community", { replace: true });
          }
        } catch {
          if (!cancelled) {
            setMessage("Redirecting…");
            navigate("/login?error=github_session", { replace: true });
          }
        }
        return;
      }

      const code = searchParams.get("code");
      if (!code) {
        if (!cancelled) navigate("/login?error=github_missing", { replace: true });
        return;
      }

      const intent = resolveGithubOAuthIntent(searchParams.get("state"), code);
      persistGithubCodeIntent(code, intent);
      const role = claimGithubExchange(code);

      if (role === "done" || role === "waiter") {
        const stored = await waitForPeerExchange(code);
        if (stored) {
          applyResult(stored);
          return;
        }
        if (!cancelled) {
          sessionStorage.removeItem(codeKey(code));
          sessionStorage.removeItem(sessionKey(code));
          setMessage("Redirecting…");
          const back = getOAuthIntent() === "register" ? "/register" : "/login";
          navigate(`${back}?error=github_auth`, { replace: true });
        }
        return;
      }

      try {
        const data = await authService.githubExchange(code, getGithubRedirectUri(), intent);
        persistGithubResult(code, data);
        applyResult(data);
      } catch (err) {
        sessionStorage.removeItem(codeKey(code));
        sessionStorage.removeItem(sessionKey(code));
        sessionStorage.removeItem(`${codeKey(code)}:intent`);
        if (!cancelled) {
          goLoginError(
            err,
            "GitHub sign-in could not be completed. Check your GitHub email visibility and try again.",
            intent,
          );
        }
      }
    };

    void finish();
    return () => {
      cancelled = true;
    };
  }, [navigate, searchParams, setSession]);

  return (
    <div className="oauth-callback">
      <span className="oauth-callback__pulse" aria-hidden />
      {message}
    </div>
  );
}
