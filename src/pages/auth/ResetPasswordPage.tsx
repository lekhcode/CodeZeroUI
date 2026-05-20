import { Box, Button, Collapse, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate, useSearchParams } from "react-router-dom";
import { OtpInput } from "@/components/auth/OtpInput";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { authService } from "@/services/auth.service";
import { validatePassword } from "@/utils/passwordPolicy";
import { getAuthErrorMessage } from "@/utils/authErrors";
import { maskEmail } from "@/utils/pendingVerification";
import { miui } from "@/theme/theme";
import "@/styles/auth-verification.css";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get("email")?.trim().toLowerCase() ?? "";

  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [step, setStep] = useState<"otp" | "password" | "done">("otp");

  useEffect(() => {
    if (!email) navigate("/forgot-password", { replace: true });
  }, [email, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pv = validatePassword(password);
    if (!pv.valid) {
      setError("Password does not meet requirements");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (code.length !== 6) {
      setError("Enter the 6-digit verification code from your email");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const r = await authService.resetPassword(email, code, password);
      setMessage(r.message);
      setStep("done");
      window.setTimeout(() => navigate("/login", { replace: true }), 1500);
    } catch (err) {
      setError(getAuthErrorMessage(err, "Reset failed"));
    } finally {
      setLoading(false);
    }
  };

  if (!email) return null;

  if (step === "done") {
    return (
      <Box className="otp-verify" sx={{ textAlign: "center" }}>
        <Typography className="otp-verify__title">Password updated</Typography>
        <Typography className="otp-verify__subtitle">{message}</Typography>
      </Box>
    );
  }

  return (
    <Box component="form" className="otp-verify" onSubmit={(e) => void submit(e)}>
      <p className="otp-verify__eyebrow">Password reset</p>
      <Typography component="h1" className="otp-verify__title">
        Reset password
      </Typography>
      <Typography className="otp-verify__subtitle">
        Enter the verification code we sent, then choose a new password.
      </Typography>

      {email ? (
        <div className="otp-verify__email-chip" title={email}>
          {maskEmail(email)}
        </div>
      ) : null}

      <Collapse in={Boolean(error)}>
        <Typography variant="caption" sx={{ color: "#f87171", display: "block", mb: 1 }}>
          {error}
        </Typography>
      </Collapse>

      {step === "otp" && (
        <Stack spacing={2} sx={{ alignItems: "stretch" }}>
          <Typography
            component="label"
            htmlFor="reset-otp-0"
            variant="caption"
            sx={{ fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: miui.textDim }}
          >
            Verification code
          </Typography>
          <OtpInput
            idPrefix="reset-otp"
            value={code}
            onChange={setCode}
            disabled={loading}
            onComplete={() => setStep("password")}
          />
          <Button
            type="button"
            variant="contained"
            size="large"
            fullWidth
            disabled={code.length !== 6}
            onClick={() => setStep("password")}
            sx={{ borderRadius: 1, textTransform: "none", fontWeight: 700 }}
          >
            Continue
          </Button>
        </Stack>
      )}

      {step === "password" && (
        <Stack spacing={2}>
          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "monospace" }}>
            Code: {code.replace(/(\d{3})(\d{3})/, "$1-$2")}
          </Typography>
          <TextField
            label="New password"
            type="password"
            fullWidth
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <PasswordStrength password={password} />
          <TextField
            label="Confirm new password"
            type="password"
            fullWidth
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          <Button type="submit" variant="contained" size="large" fullWidth disabled={loading}>
            {loading ? "Updating…" : "Update password"}
          </Button>
          <Button type="button" variant="text" size="small" onClick={() => setStep("otp")}>
            Edit verification code
          </Button>
        </Stack>
      )}

      <Typography variant="body2" sx={{ textAlign: "center", mt: 2 }}>
        <RouterLink to="/login" style={{ color: miui.accent, fontWeight: 700 }}>
          Back to sign in
        </RouterLink>
      </Typography>
    </Box>
  );
}
