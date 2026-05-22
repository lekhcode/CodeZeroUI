import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";
import { ApiRequestError } from "@/services/api";
import { queryKeys } from "@/hooks/queryKeys";
import { normalizePublicUser } from "@/utils/publicUser";
import {
  setPendingVerifyEmail,
  startResendCooldown,
} from "@/utils/pendingVerification";
import { LoginHeroScrambleText } from "@/components/auth/LoginHeroScrambleText";
import { AppLegalFooter } from "@/components/layout/AppLegalFooter";
import { OAuthGoogleProvider } from "@/components/auth/OAuthGoogleProvider";
import { OAuthSignInSection } from "@/components/auth/OAuthSignInSection";
import { AuthInlineError } from "@/components/auth/AuthInlineError";
import { useTransientAuthError } from "@/hooks/useTransientAuthError";

const SNIPPETS = [
  "O(log n)",
  "BFS(G,s)",
  "dp[i][j]",
  "two_sum()",
  "merge()",
  "O(n²)",
  "dfs(node)",
  "cache[k]",
  "left>>1",
  "arr.sort()",
  "stack.pop()",
  "memo={}",
  "n*(n-1)/2",
  "TreeNode",
  "ListNode",
  "hashmap",
  "binary_search",
  "backtrack()",
  "O(1) space",
  "LRU",
  "Dijkstra",
  "topSort()",
  "union-find",
  "sliding_window",
  "0/1 knapsack",
];

const PARTICLE_COLORS = ["#6B6B6B", "#8A8A8A", "#B3B3B3", "#E5E5E5", "#4ADE80"];

export function LoginPage() {
  return (
    <OAuthGoogleProvider>
      <LoginPageInner />
    </OAuthGoogleProvider>
  );
}

function LoginPageInner() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const setSession = useAuthStore((s) => s.setSession);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    error: oauthError,
    visible: oauthErrorVisible,
    setError: setOauthError,
    clearError: clearOauthError,
  } = useTransientAuthError();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const {
    error: formError,
    visible: formErrorVisible,
    setError: setFormError,
    clearError: clearFormError,
    showErrorFromUnknown: showFormErrorFromUnknown,
  } = useTransientAuthError({ clearOnNavigate: false });
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      text: string;
      color: string;
      alpha: number;
      size: number;
      life: number;
      maxLife: number;
    }

    const particles: Particle[] = [];

    const spawn = () => {
      particles.push({
        x: Math.random() * canvas.width,
        y: canvas.height + 20,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -(Math.random() * 0.6 + 0.2),
        text: SNIPPETS[Math.floor(Math.random() * SNIPPETS.length)] ?? "dp[]",
        color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)] ?? "#8A8A8A",
        alpha: 0,
        size: Math.random() * 2 + 10,
        life: 0,
        maxLife: Math.random() * 300 + 200,
      });
    };

    let frame = 0;
    let animId = 0;

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (frame % 40 === 0 && particles.length < 15) spawn();

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]!;
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        const progress = p.life / p.maxLife;
        p.alpha =
          progress < 0.15 ? progress / 0.15 : progress > 0.75 ? 1 - (progress - 0.75) / 0.25 : 1;

        ctx.save();
        ctx.globalAlpha = p.alpha * 0.5;
        ctx.font = `${p.size}px 'Fira Code', monospace`;
        ctx.fillStyle = p.color;
        ctx.fillText(p.text, p.x, p.y);
        ctx.restore();

        if (p.life >= p.maxLife) particles.splice(i, 1);
      }

      frame++;
      animId = requestAnimationFrame(tick);
    };

    tick();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setFormError("Fill in all fields.");
      return;
    }
    setLoading(true);
    clearFormError();
    clearOauthError();
    try {
      const normalizedEmail = email.trim().toLowerCase();

      if (mode === "signup") {
        const reg = await authService.register(normalizedEmail, password);
        setPendingVerifyEmail(normalizedEmail);
        startResendCooldown(reg.resendCooldownSeconds ?? 60);
        navigate(`/verify-email?email=${encodeURIComponent(normalizedEmail)}`, {
          replace: true,
          state: { message: reg.message },
        });
        return;
      }
      const data = await authService.login(normalizedEmail, password);
      const user = normalizePublicUser(data.user);
      queryClient.removeQueries({ queryKey: queryKeys.me });
      setSession(user, data.accessToken);
      queryClient.setQueryData(queryKeys.me, user);
      const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
      const dest =
        from && from !== "/login" && !from.startsWith("/verify-email") ? from : "/community";
      navigate(dest, { replace: true });
    } catch (err) {
      if (err instanceof ApiRequestError && err.code === "EMAIL_NOT_VERIFIED") {
        setPendingVerifyEmail(email.trim().toLowerCase());
        navigate(`/verify-email?email=${encodeURIComponent(email.trim().toLowerCase())}`, {
          replace: true,
          state: {
            message:
              "Verify your email before signing in. Enter the code we sent you, or request a new one.",
          },
        });
        return;
      }
      showFormErrorFromUnknown(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <section className="login-left-panel" aria-hidden={false}>
        <div className="login-left-panel__grid" aria-hidden />
        <div className="login-left-panel__glow" aria-hidden />
        <canvas ref={canvasRef} className="login-left-panel__canvas" aria-hidden />
        <div className="login-left-panel__content">
          <p className="login-eyebrow">your personal coding gym</p>
          <h1 className="login-hero-title">
            Train harder.
            <br />
            <span className="login-hero-accent">Think sharper.</span>
          </h1>
          <p className="login-hero-desc">
            DSA practice with spaced revision, streak tracking, and a Brain Cache that never lets
            important problems slip.
          </p>
          <LoginHeroScrambleText />
          <div className="login-stats">
            {[
              { num: "3,167", label: "problems", color: "var(--text-1)" },
              { num: "847", label: "active users", color: "var(--success)" },
              { num: "98%", label: "retention", color: "var(--text-1)" },
            ].map((s) => (
              <div key={s.label}>
                <div className="login-stat-value" style={{ color: s.color }}>
                  {s.num}
                </div>
                <div className="login-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="login-right-panel">
        <div className="login-right-inner">
          <div className="login-brand zero-mark-spin-host">
            c&lt;&gt;de<span className="login-brand-accent zero-mark-spin-target">{"{0}"}</span>
          </div>

          <h2 className="login-heading">{mode === "signin" ? "Welcome back" : "Join the dojo"}</h2>
          <p className="login-subheading">
            {mode === "signin" ? "continue your training session_" : "start your revision journey_"}
          </p>

          <div className="login-divider">
            <div className="login-divider__line" />
            <span className="login-divider__label">
              {mode === "signin" ? "or sign in with email" : "or sign up with email"}
            </span>
            <div className="login-divider__line" />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="login-field">
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                className="login-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div className="login-field">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                className="login-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
              />
            </div>

            {mode === "signin" && (
              <div className="login-forgot">
                <Link to="/forgot-password">forgot password?</Link>
              </div>
            )}

            <AuthInlineError message={formError} visible={formErrorVisible} />

            <div className="login-form-submit">
              <button type="submit" disabled={loading} className="login-submit-btn">
                {loading
                  ? "Connecting…"
                  : mode === "signin"
                    ? "Sign in"
                    : "Create account"}
              </button>
            </div>
          </form>

          <OAuthSignInSection
            intent={mode === "signin" ? "login" : "register"}
            disabled={loading}
            error={oauthError}
            errorVisible={oauthErrorVisible}
            onError={setOauthError}
            onClearError={clearOauthError}
            variant="login"
            label={mode === "signin" ? "or continue with" : "or continue with"}
          />

          <p className="login-footer">
            {mode === "signin" ? "New here? " : "Have an account? "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                clearFormError();
                clearOauthError();
              }}
            >
              {mode === "signin" ? "create account" : "sign in"}
            </button>
          </p>

          <div className="login-copyright">
            <AppLegalFooter variant="inline" align="center" />
          </div>
        </div>
      </section>
    </div>
  );
}