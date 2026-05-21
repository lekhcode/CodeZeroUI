import { useEffect, useState } from "react";
import { OAuthProviderIcon } from "@/components/auth/OAuthProviderIcon";
import { Link as RouterLink, useNavigate, useSearchParams } from "react-router-dom";
import { OAuthGoogleProvider } from "@/components/auth/OAuthGoogleProvider";
import { AuthInlineError } from "@/components/auth/AuthInlineError";
import { CountrySelectField } from "@/components/auth/CountrySelectField";
import { OnboardZeroMark3D } from "@/components/auth/OnboardZeroMark3D";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";
import {
  clearOAuthPending,
  getOAuthPendingPreview,
  getOAuthPendingToken,
  storeOAuthPending,
} from "@/utils/oauthFlow";
import type { PublicUser } from "@/types/api.types";
import { useTransientAuthError } from "@/hooks/useTransientAuthError";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/hooks/queryKeys";
import { normalizePublicUser } from "@/utils/publicUser";

const GENDER_OPTIONS: Array<{ value: NonNullable<PublicUser["gender"]>; label: string }> = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "NON_BINARY", label: "Non-binary" },
  { value: "OTHER", label: "Other" },
  { value: "PREFER_NOT_TO_SAY", label: "Prefer not to say" },
];

function OAuthCompleteRegistrationInner() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setSession = useAuthStore((s) => s.setSession);
  const queryClient = useQueryClient();
  const { error, visible, setError, clearError, showErrorFromUnknown } = useTransientAuthError({
    clearOnNavigate: false,
  });
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("");
  const [gender, setGender] = useState<PublicUser["gender"]>(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const fromQuery = searchParams.get("pendingToken");
    const existing = getOAuthPendingPreview();
    if (fromQuery && existing) {
      storeOAuthPending(fromQuery, existing);
    }

    const token = getOAuthPendingToken();
    const p = getOAuthPendingPreview();
    if (!token || !p) {
      navigate("/register", { replace: true });
      return;
    }

    if (p.suggestedName) {
      setFullName((prev) => (prev.trim() ? prev : p.suggestedName ?? ""));
    }
    setReady(true);
  }, [navigate, searchParams]);

  const pendingToken = getOAuthPendingToken();
  const profile = getOAuthPendingPreview();

  if (!ready || !pendingToken || !profile) {
    return (
      <div className="auth-shell--onboard">
        <div className="oauth-callback">
          <span className="oauth-callback__pulse" aria-hidden />
          preparing profile…
        </div>
      </div>
    );
  }

  const providerLabel = profile.provider === "GITHUB" ? "GitHub" : "Google";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!fullName.trim() || !country.trim() || !gender) {
      setError("Full name, country, and gender are required.");
      return;
    }

    setLoading(true);
    try {
      const data = await authService.completeOAuthRegistration({
        pendingToken,
        fullName: fullName.trim(),
        country: country.trim(),
        gender,
      });
      clearOAuthPending();
      const user = normalizePublicUser(data.user);
      queryClient.removeQueries({ queryKey: queryKeys.me });
      setSession(user, data.accessToken);
      queryClient.setQueryData(queryKeys.me, user);
      navigate("/community", { replace: true });
    } catch (err) {
      showErrorFromUnknown(err, "Could not finish registration. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell--onboard">
      <div className="auth-onboard">
        <aside className="auth-onboard__visual" aria-label="CodeZero">
          <div className="auth-onboard__brand">
            code<span>zero</span>
          </div>
          <div className="auth-onboard__mark-wrap">
            <OnboardZeroMark3D />
          </div>
          <div className="auth-onboard__context">
            <p className="auth-onboard__provider">
              <span className="auth-onboard__provider-icon" aria-hidden>
                <OAuthProviderIcon provider={profile.provider} size={18} />
              </span>
              Connected via {providerLabel}
            </p>
            <p className="auth-onboard__email">{profile.email}</p>
            <p className="auth-onboard__hint">
              Your {providerLabel} email is verified. Add a few details to activate your account.
            </p>
          </div>
        </aside>

        <main className="auth-onboard__main">
          <div className="auth-onboard__main-inner">
          <h1 className="auth-onboard__title">Finish setup</h1>
          <p className="auth-onboard__subtitle">One short step before you enter the dojo.</p>

          <form className="auth-onboard__form" onSubmit={onSubmit}>
            <div className="auth-field">
              <label htmlFor="oauth-full-name">Full name</label>
              <input
                id="oauth-full-name"
                type="text"
                required
                autoComplete="name"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (error) clearError();
                }}
                placeholder="Your name"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="oauth-gender">Gender</label>
              <select
                id="oauth-gender"
                required
                value={gender ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setGender(v === "" ? null : (v as NonNullable<PublicUser["gender"]>));
                  if (error) clearError();
                }}
              >
                <option value="" disabled>
                  Select
                </option>
                {GENDER_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <CountrySelectField
              id="oauth-country"
              value={country}
              onChange={(name) => {
                setCountry(name);
                if (error) clearError();
              }}
            />

            <AuthInlineError message={error} visible={visible} />

            <div className="login-form-submit" style={{ marginBottom: 0 }}>
              <button type="submit" className="login-submit-btn" disabled={loading}>
                {loading ? "Creating account…" : "Continue"}
              </button>
            </div>
          </form>

          <footer className="auth-onboard__footer">
            <RouterLink to="/register">Back</RouterLink>
            {" · "}
            <RouterLink to="/login">Sign in</RouterLink>
          </footer>
          </div>
        </main>
      </div>
    </div>
  );
}

export function OAuthCompleteRegistrationPage() {
  return (
    <OAuthGoogleProvider>
      <OAuthCompleteRegistrationInner />
    </OAuthGoogleProvider>
  );
}
