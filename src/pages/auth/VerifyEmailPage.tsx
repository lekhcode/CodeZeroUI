import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link as RouterLink, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { OtpVerificationExperience } from "@/components/auth/OtpVerificationExperience";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";
import {
  clearPendingVerifyEmail,
  getPendingVerifyEmail,
  setPendingVerifyEmail,
  startResendCooldown,
} from "@/utils/pendingVerification";
import { miui } from "@/theme/theme";
import { queryKeys } from "@/hooks/queryKeys";
import { normalizePublicUser } from "@/utils/publicUser";

const DEFAULT_COOLDOWN = 60;

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const queryClient = useQueryClient();

  const queryEmail = searchParams.get("email")?.trim().toLowerCase() ?? "";
  const storedEmail = getPendingVerifyEmail();
  const email = queryEmail || storedEmail;

  const registerMessage =
    typeof location.state === "object" &&
    location.state !== null &&
    "message" in location.state &&
    typeof (location.state as { message?: string }).message === "string"
      ? (location.state as { message: string }).message
      : "We sent a 6-digit code to your inbox. Enter it below to activate your account.";

  useEffect(() => {
    if (queryEmail) setPendingVerifyEmail(queryEmail);
  }, [queryEmail]);

  useEffect(() => {
    if (!email) {
      navigate("/register", { replace: true });
    }
  }, [email, navigate]);

  if (!email) {
    return null;
  }

  const from =
    typeof location.state === "object" &&
    location.state !== null &&
    "from" in location.state &&
    typeof (location.state as { from?: { pathname?: string } }).from?.pathname === "string"
      ? (location.state as { from: { pathname: string } }).from.pathname
      : "/community";

  return (
    <OtpVerificationExperience
      email={email}
      title="Check your email"
      subtitle={registerMessage}
      verifyLabel="Activate account"
      initialCooldownSec={DEFAULT_COOLDOWN}
      onVerify={async (code) => {
        const result = await authService.verifyEmail(email, code);
        clearPendingVerifyEmail();
        const user = normalizePublicUser(result.user);
        queryClient.removeQueries({ queryKey: queryKeys.me });
        setSession(user, result.accessToken);
        queryClient.setQueryData(queryKeys.me, user);
        window.setTimeout(() => navigate(from, { replace: true }), 600);
      }}
      onResend={async () => {
        const r = await authService.resendOtp(email);
        startResendCooldown(r.resendCooldownSeconds ?? DEFAULT_COOLDOWN);
        return r;
      }}
      backLink={
        <RouterLink
          to="/login"
          style={{ color: miui.accent, fontWeight: 700, fontSize: "0.8125rem", textAlign: "center" }}
          onClick={() => clearPendingVerifyEmail()}
        >
          Back to sign in
        </RouterLink>
      }
    />
  );
}
