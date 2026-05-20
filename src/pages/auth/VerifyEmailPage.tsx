import { useEffect } from "react";
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
import { AUTH_HOME } from "@/constants/routes";
import { miui } from "@/theme/theme";

const DEFAULT_COOLDOWN = 60;

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);

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
        setSession(result.user, result.accessToken);
        window.setTimeout(() => navigate(AUTH_HOME, { replace: true }), 600);
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
