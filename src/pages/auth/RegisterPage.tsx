import { Box, Divider, Link, Stack, TextField, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link as RouterLink } from "react-router-dom";
import { useRegister } from "@/hooks/useAuth";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { OAuthGoogleProvider } from "@/components/auth/OAuthGoogleProvider";
import { OAuthSignInSection } from "@/components/auth/OAuthSignInSection";
import { AuthInlineError } from "@/components/auth/AuthInlineError";
import { useTransientAuthError } from "@/hooks/useTransientAuthError";
import { validatePassword, isValidUsernameFormat, normalizeUsername } from "@/utils/passwordPolicy";
import { miui } from "@/theme/theme";

const schema = z
  .object({
    email: z.string().email("Enter a valid email"),
    username: z.string().optional(),
    password: z.string(),
    confirm: z.string(),
  })
  .superRefine((data, ctx) => {
    const pv = validatePassword(data.password);
    if (!pv.valid) {
      for (const msg of pv.errors) {
        ctx.addIssue({ code: "custom", message: msg, path: ["password"] });
      }
    }
    if (data.password !== data.confirm) {
      ctx.addIssue({ code: "custom", message: "Passwords do not match", path: ["confirm"] });
    }
    if (data.username?.trim()) {
      const u = normalizeUsername(data.username);
      if (!isValidUsernameFormat(u)) {
        ctx.addIssue({
          code: "custom",
          message: "Username: 3–24 chars, lowercase, numbers, underscores",
          path: ["username"],
        });
      }
    }
  });

type FormValues = z.infer<typeof schema>;

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "6px",
    minHeight: 38,
    fontSize: "13px",
    bgcolor: "transparent",
    "& fieldset": { borderColor: miui.border },
    "&:hover fieldset": { borderColor: miui.borderMid },
    "&.Mui-focused fieldset": { borderColor: miui.accent, borderWidth: "1px" },
  },
  "& .MuiInputLabel-root": {
    fontSize: "12px",
    color: miui.textDim,
    fontWeight: 400,
  },
} as const;

function RegisterPageInner() {
  const registerMutation = useRegister();
  const {
    error: oauthError,
    visible: oauthErrorVisible,
    setError: setOauthError,
    clearError: clearOauthError,
  } = useTransientAuthError();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const password = watch("password", "");

  const mutationMessage =
    registerMutation.isError && registerMutation.error ? registerMutation.error.message : "";

  return (
    <Box
      component="form"
      onSubmit={handleSubmit((v) => {
        clearOauthError();
        registerMutation.mutate({
          email: v.email.trim().toLowerCase(),
          password: v.password,
          username: v.username?.trim() ? normalizeUsername(v.username) : undefined,
        });
      })}
    >
      <h1 className="auth-panel__title">Create account</h1>
      <p className="auth-panel__subtitle">Build your practice OS — email or social sign-up.</p>

      <Stack spacing={1.75}>
        <TextField
          label="Email"
          type="email"
          fullWidth
          size="small"
          {...register("email")}
          error={Boolean(errors.email)}
          helperText={errors.email?.message}
          sx={fieldSx}
        />
        <TextField
          label="Username (optional)"
          fullWidth
          size="small"
          {...register("username")}
          error={Boolean(errors.username)}
          helperText={errors.username?.message ?? "e.g. codezero_dev"}
          sx={fieldSx}
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          size="small"
          {...register("password")}
          error={Boolean(errors.password)}
          helperText={errors.password?.message}
          sx={fieldSx}
        />
        <PasswordStrength password={password} />
        <TextField
          label="Confirm password"
          type="password"
          fullWidth
          size="small"
          {...register("confirm")}
          error={Boolean(errors.confirm)}
          helperText={errors.confirm?.message}
          sx={fieldSx}
        />

        <AuthInlineError message={mutationMessage} visible={Boolean(mutationMessage)} />

        <div className="login-form-submit">
          <button type="submit" className="login-submit-btn" disabled={registerMutation.isPending}>
            {registerMutation.isPending ? "Creating…" : "Create account"}
          </button>
        </div>

        <Divider sx={{ my: 0.5, color: "text.secondary", fontSize: "0.75rem", opacity: 0.7 }}>
          or
        </Divider>

        <OAuthSignInSection
          intent="register"
          variant="auth"
          label="or continue with"
          disabled={registerMutation.isPending}
          error={oauthError}
          errorVisible={oauthErrorVisible}
          onError={setOauthError}
          onClearError={clearOauthError}
        />

        <Typography variant="body2" sx={{ textAlign: "center", fontSize: "12px", color: "text.secondary" }}>
          Already have an account?{" "}
          <Link component={RouterLink} to="/login" sx={{ fontWeight: 500, color: "text.primary" }}>
            Sign in
          </Link>
        </Typography>
      </Stack>
    </Box>
  );
}

export function RegisterPage() {
  return (
    <OAuthGoogleProvider>
      <RegisterPageInner />
    </OAuthGoogleProvider>
  );
}
