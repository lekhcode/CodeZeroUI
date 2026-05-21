import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { getAuthErrorMessage } from "@/utils/authErrors";

const QUERY_ERROR_MESSAGES: Record<string, string> = {
  github_auth: "GitHub sign-in could not be completed.",
  github_session: "Your session could not be restored after GitHub sign-in.",
  github_missing: "GitHub did not return an authorization code.",
  oauth_not_found: "We could not find an account for that sign-in.",
  oauth_exists: "This email already has an account. Sign in instead.",
};

type Options = {
  /** Clear error when pathname changes (default true). */
  clearOnNavigate?: boolean;
  /** Auto-hide after ms; 0 disables (default 10000). */
  autoDismissMs?: number;
};

/**
 * Transient auth errors: consume URL query once, strip params, auto-dismiss, clear on route change.
 */
export function useTransientAuthError(options: Options = {}) {
  const { clearOnNavigate = true, autoDismissMs = 10_000 } = options;
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [error, setError] = useState("");
  const [visible, setVisible] = useState(false);
  const consumedQueryRef = useRef(false);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearError = useCallback(() => {
    setVisible(false);
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
    window.setTimeout(() => setError(""), 220);
  }, []);

  const showError = useCallback(
    (message: string) => {
      const trimmed = message.trim();
      if (!trimmed) {
        clearError();
        return;
      }
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
      setError(trimmed);
      setVisible(true);
      if (autoDismissMs > 0) {
        dismissTimerRef.current = setTimeout(() => clearError(), autoDismissMs);
      }
    },
    [autoDismissMs, clearError],
  );

  const showErrorFromUnknown = useCallback(
    (err: unknown, fallback?: string) => {
      showError(getAuthErrorMessage(err, fallback));
    },
    [showError],
  );

  useEffect(() => {
    if (consumedQueryRef.current) return;
    const code = searchParams.get("error");
    const detail = searchParams.get("detail");
    if (!code && !detail) return;

    consumedQueryRef.current = true;
    let message = "";
    if (detail) {
      try {
        message = decodeURIComponent(detail);
      } catch {
        message = detail;
      }
    } else if (code && QUERY_ERROR_MESSAGES[code]) {
      message = QUERY_ERROR_MESSAGES[code];
    } else if (code) {
      message = "Sign-in could not be completed.";
    }

    if (message) showError(message);

    const next = new URLSearchParams(searchParams);
    next.delete("error");
    next.delete("detail");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams, showError]);

  const prevPathRef = useRef(location.pathname);

  useEffect(() => {
    if (prevPathRef.current !== location.pathname) {
      consumedQueryRef.current = false;
      if (clearOnNavigate) clearError();
      prevPathRef.current = location.pathname;
    }
  }, [location.pathname, clearOnNavigate, clearError]);

  useEffect(
    () => () => {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    },
    [],
  );

  return {
    error,
    visible,
    setError: showError,
    clearError,
    showErrorFromUnknown,
  };
}
