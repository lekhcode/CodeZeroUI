import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getGithubRedirectUri,
  githubClientId,
  isGithubOAuthConfigured,
  isGoogleOAuthConfigured,
} from "@/config/oauth";
import type { OAuthIntent } from "@/utils/oauthFlow";
import { encodeGithubOAuthState, setGithubPendingIntent } from "@/utils/oauthFlow";
import { getAuthErrorMessage } from "@/utils/authErrors";
import { applyOAuthAuthResult } from "@/utils/handleOAuthResult";
import { performOAuthGoogleAuth } from "@/utils/performOAuthGoogle";
import { useAuthStore } from "@/store/authStore";
import { AuthInlineError } from "@/components/auth/AuthInlineError";
import { GoogleOAuthIconButton } from "@/components/auth/GoogleOAuthIconButton";

type OAuthSignInSectionProps = {
  intent: OAuthIntent;
  disabled?: boolean;
  onError: (message: string) => void;
  onClearError?: () => void;
  error?: string;
  errorVisible?: boolean;
  variant?: "login" | "auth";
  label?: string;
};

export function OAuthSignInSection({
  intent,
  disabled = false,
  onError,
  onClearError,
  error = "",
  errorVisible = true,
  variant = "login",
  label = "or continue with",
}: OAuthSignInSectionProps) {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const [oauthLoading, setOauthLoading] = useState<"google" | "github" | null>(null);

  const busy = disabled || oauthLoading !== null;

  const handleGoogleCredential = useCallback(
    async (credential: string) => {
      setOauthLoading("google");
      onClearError?.();
      onError("");
      setGithubPendingIntent(intent);
      try {
        const data = await performOAuthGoogleAuth(credential, intent);
        applyOAuthAuthResult(data, navigate, setSession);
      } catch (err) {
        onError(getAuthErrorMessage(err, "Google sign-in could not be completed."));
      } finally {
        setOauthLoading(null);
      }
    },
    [intent, navigate, onClearError, onError, setSession],
  );

  const githubLogin = useCallback(() => {
    if (!isGithubOAuthConfigured) {
      onError("GitHub sign-in is not configured.");
      return;
    }
    onClearError?.();
    onError("");
    setGithubPendingIntent(intent);
    const params = new URLSearchParams({
      client_id: githubClientId,
      redirect_uri: getGithubRedirectUri(),
      scope: "user:email",
      state: encodeGithubOAuthState(intent),
    });
    window.location.href = `https://github.com/login/oauth/authorize?${params}`;
  }, [intent, onClearError, onError]);

  const labelClass = variant === "login" ? "oauth-below-label" : "oauth-auth-label";
  const rowClass =
    variant === "login" ? "oauth-icon-row oauth-icon-row--below" : "oauth-icon-row oauth-icon-row--auth";

  return (
    <div className="oauth-social-block">
      <p className={labelClass}>{label}</p>
      <AuthInlineError message={error} visible={errorVisible} />
      <div className={rowClass} aria-label="Social sign-in">
        {isGoogleOAuthConfigured ? (
          <GoogleOAuthIconButton
            disabled={busy}
            onSuccess={handleGoogleCredential}
            onError={() => onError("Google sign-in was cancelled.")}
          />
        ) : (
          <button type="button" className="oauth-icon-hit oauth-icon-hit--google" disabled aria-label="Google sign-in not configured" />
        )}
        <button
          type="button"
          className="oauth-icon-hit"
          onClick={githubLogin}
          disabled={busy || !isGithubOAuthConfigured}
          aria-label="Continue with GitHub"
          aria-busy={oauthLoading === "github"}
          title="Continue with GitHub"
        >
          <span className="oauth-icon-svg oauth-icon-svg--github" aria-hidden>
            <GitHubIconSvg />
          </span>
        </button>
      </div>
    </div>
  );
}

function GitHubIconSvg() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}
