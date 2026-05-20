import { ApiRequestError } from "@/services/api";

const OTP_MESSAGES: Record<string, string> = {
  OTP_INVALID: "That code doesn't match. Check your email and try again.",
  OTP_EXPIRED: "This code has expired. Request a new one below.",
  OTP_MAX_ATTEMPTS: "Too many wrong attempts. Request a new code.",
  OTP_RESEND_COOLDOWN: "Please wait before requesting another code.",
  OTP_RATE_LIMIT: "Too many codes requested. Try again in about an hour.",
  EMAIL_NOT_VERIFIED: "Verify your email before signing in.",
  EMAIL_ALREADY_VERIFIED: "This email is already verified. Sign in instead.",
  EMAIL_SEND_FAILED: "We couldn't send the email right now. Try again shortly.",
  RESEND_SANDBOX_RECIPIENT:
    "Email is in Resend test mode. Use your verified domain in EMAIL_FROM, or test with delivered@resend.dev.",
  RESEND_DOMAIN_REQUIRED: "Set EMAIL_FROM to an address on your verified Resend domain.",
  RESEND_RATE_LIMIT: "Email service is busy. Please try again in a moment.",
};

export function getAuthErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (error instanceof ApiRequestError) {
    if (error.code && OTP_MESSAGES[error.code]) {
      return OTP_MESSAGES[error.code];
    }
    if (error.message.trim().length > 0) {
      return error.message;
    }
  }
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }
  return fallback;
}

/** Parses "Please wait 42s before requesting another code" from resend cooldown errors. */
export function parseResendCooldownSeconds(error: unknown, fallback = 60): number {
  if (error instanceof ApiRequestError && error.message) {
    const match = /wait (\d+)s/i.exec(error.message);
    if (match?.[1]) {
      const n = Number(match[1]);
      if (Number.isFinite(n) && n > 0) return n;
    }
  }
  return fallback;
}
