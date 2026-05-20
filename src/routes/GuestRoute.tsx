import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { tokenStorage } from "@/utils/storage";
import { getPendingVerifyEmail } from "@/utils/pendingVerification";

/**
 * Auth-only routes: redirect verified sessions to the app; keep pending verification on verify-email.
 */
export function GuestRoute() {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasToken = Boolean(tokenStorage.get());

  if (!hasToken && !isAuthenticated) {
    return <Outlet />;
  }

  if (user && !user.isEmailVerified) {
    const email = user.email || getPendingVerifyEmail();
    if (!location.pathname.startsWith("/verify-email")) {
      return (
        <Navigate to={`/verify-email?email=${encodeURIComponent(email)}`} replace />
      );
    }
    return <Outlet />;
  }

  if (user?.isEmailVerified) {
    return <Navigate to="/community" replace />;
  }

  return <Outlet />;
}
