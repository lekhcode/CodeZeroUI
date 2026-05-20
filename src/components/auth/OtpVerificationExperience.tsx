import { useEffect, useState } from "react";
import { Box, CircularProgress, Collapse, Typography } from "@mui/material";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import { OtpInput } from "@/components/auth/OtpInput";
import { getAuthErrorMessage, parseResendCooldownSeconds } from "@/utils/authErrors";
import {
  getResendCooldownRemainingSec,
  maskEmail,
  startResendCooldown,
} from "@/utils/pendingVerification";
import "@/styles/auth-verification.css";

export type OtpVerificationPhase = "idle" | "verifying" | "resending" | "success";

type Props = {
  email: string;
  title: string;
  subtitle: string;
  verifyLabel?: string;
  onVerify: (code: string) => Promise<void>;
  onResend?: () => Promise<{ message: string; resendCooldownSeconds?: number }>;
  initialCooldownSec?: number;
  showResend?: boolean;
  backLink?: React.ReactNode;
};

export function OtpVerificationExperience({
  email,
  title,
  subtitle,
  verifyLabel = "Verify",
  onVerify,
  onResend,
  initialCooldownSec = 60,
  showResend = true,
  backLink,
}: Props) {
  const [code, setCode] = useState("");
  const [phase, setPhase] = useState<OtpVerificationPhase>("idle");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [cooldown, setCooldown] = useState(() =>
    Math.max(getResendCooldownRemainingSec(initialCooldownSec), 0),
  );

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setTimeout(() => setCooldown((c) => Math.max(c - 1, 0)), 1000);
    return () => window.clearTimeout(t);
  }, [cooldown]);

  const runVerify = async (otp: string) => {
    if (otp.length !== 6 || phase === "verifying" || phase === "success") return;
    setPhase("verifying");
    setError("");
    setInfo("");
    try {
      await onVerify(otp);
      setPhase("success");
    } catch (e) {
      setPhase("idle");
      setError(getAuthErrorMessage(e, "Verification failed"));
      setCode("");
    }
  };

  const runResend = async () => {
    if (!onResend || cooldown > 0 || phase === "resending") return;
    setPhase("resending");
    setError("");
    try {
      const r = await onResend();
      setInfo(r.message);
      const sec = r.resendCooldownSeconds ?? initialCooldownSec;
      startResendCooldown(sec);
      setCooldown(sec);
    } catch (e) {
      setError(getAuthErrorMessage(e, "Could not resend code"));
      const wait = parseResendCooldownSeconds(e, initialCooldownSec);
      startResendCooldown(wait);
      setCooldown(wait);
    } finally {
      setPhase((p) => (p === "success" ? "success" : "idle"));
    }
  };

  if (phase === "success") {
    return (
      <Box className="otp-verify" sx={{ textAlign: "center" }}>
        <div className="otp-verify__success-ring" aria-hidden>
          <CheckRoundedIcon />
        </div>
        <Typography className="otp-verify__title">Verified</Typography>
        <Typography className="otp-verify__subtitle">Taking you in…</Typography>
      </Box>
    );
  }

  const busy = phase === "verifying" || phase === "resending";

  return (
    <Box className="otp-verify">
      <p className="otp-verify__eyebrow">Email verification</p>
      <Typography component="h1" className="otp-verify__title">
        {title}
      </Typography>
      <Typography className="otp-verify__subtitle">{subtitle}</Typography>

      {email ? (
        <div className="otp-verify__email-chip" title={email}>
          {maskEmail(email)}
        </div>
      ) : null}

      <div
        className={`otp-verify__status${error ? " otp-verify__status--error" : info ? " otp-verify__status--success" : ""}`}
        role="status"
        aria-live="polite"
      >
        {phase === "verifying" && (
          <>
            <CircularProgress size={14} color="inherit" />
            Checking code…
          </>
        )}
        {phase === "resending" && (
          <>
            <CircularProgress size={14} color="inherit" />
            Sending new code…
          </>
        )}
        {phase === "idle" && error}
        {phase === "idle" && !error && info}
      </div>

      <Collapse in={Boolean(error)}>
        {error ? (
          <Typography variant="caption" sx={{ color: "#f87171", display: "block", mb: 1 }}>
            {error}
          </Typography>
        ) : null}
      </Collapse>

      <OtpInput
        value={code}
        onChange={setCode}
        disabled={busy}
        onComplete={(otp) => void runVerify(otp)}
      />

      <div className="otp-verify__actions">
        <button
          type="button"
          className="otp-verify__primary"
          disabled={busy || code.length !== 6}
          onClick={() => void runVerify(code)}
        >
          {phase === "verifying" ? "Verifying…" : verifyLabel}
        </button>

        {showResend && onResend ? (
          <button
            type="button"
            className="otp-verify__resend"
            disabled={busy || cooldown > 0}
            onClick={() => void runResend()}
          >
            {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
          </button>
        ) : null}

        {backLink}
      </div>
    </Box>
  );
}
