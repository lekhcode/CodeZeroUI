import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate, useSearchParams } from "react-router-dom";
import { OAuthGoogleProvider } from "@/components/auth/OAuthGoogleProvider";
import { AuthInlineError } from "@/components/auth/AuthInlineError";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";
import {
  clearOAuthPending,
  getOAuthPendingPreview,
  getOAuthPendingToken,
  previewFromPendingToken,
  storeOAuthPending,
  type OAuthPendingPreview,
} from "@/utils/oauthFlow";
import type { PublicUser } from "@/types/api.types";
import { useTransientAuthError } from "@/hooks/useTransientAuthError";

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
  const { error, visible, setError, clearError, showErrorFromUnknown } = useTransientAuthError({
    clearOnNavigate: false,
  });
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("");
  const [gender, setGender] = useState<PublicUser["gender"]>(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const fromQuery = searchParams.get("pendingToken")?.trim();
    let existing = getOAuthPendingPreview();
    let token = getOAuthPendingToken();

    if (fromQuery) {
      if (!existing) {
        const fromUrl: OAuthPendingPreview = {
          email: searchParams.get("email")?.trim().toLowerCase() ?? "",
          suggestedName: searchParams.get("suggestedName")?.trim() || null,
          avatar: searchParams.get("avatar")?.trim() || null,
          provider: searchParams.get("provider") === "GITHUB" ? "GITHUB" : "GOOGLE",
        };
        if (!fromUrl.email) {
          const fromJwt = previewFromPendingToken(fromQuery);
          if (fromJwt) {
            storeOAuthPending(fromQuery, fromJwt);
          }
        } else {
          storeOAuthPending(fromQuery, fromUrl);
        }
      } else {
        storeOAuthPending(fromQuery, existing);
      }
      token = getOAuthPendingToken();
      existing = getOAuthPendingPreview();
    }

    const p = existing;
    if (!token || !p?.email) {
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
      setSession(data.user, data.accessToken);
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
        <aside className="auth-onboard__aside">
          <div className="auth-onboard__brand">
            code<span>zero</span>
          </div>
          <div className="auth-onboard__context">
            <p className="auth-onboard__provider">Connected via {providerLabel}</p>
            {profile.avatar ? (
              <img src={profile.avatar} alt="" className="auth-onboard__avatar" width={40} height={40} />
            ) : null}
            <p className="auth-onboard__email">{profile.email}</p>
            <p className="auth-onboard__hint">
              Your {providerLabel} email is verified. Add a few details to activate your account.
            </p>
          </div>
        </aside>

        <main className="auth-onboard__main">
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

            <div className="auth-field">
              <label htmlFor="oauth-country">Country</label>
              <input
                id="oauth-country"
                type="text"
                required
                autoComplete="country-name"
                value={country}
                onChange={(e) => {
                  setCountry(e.target.value);
                  if (error) clearError();
                }}
                placeholder="India"
              />
            </div>

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
