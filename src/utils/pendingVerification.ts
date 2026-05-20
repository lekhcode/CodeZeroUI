const EMAIL_KEY = "codezero_pending_verify_email";
const COOLDOWN_KEY = "codezero_verify_resend_cooldown";

export function setPendingVerifyEmail(email: string): void {
  sessionStorage.setItem(EMAIL_KEY, email.trim().toLowerCase());
}

export function getPendingVerifyEmail(): string {
  return sessionStorage.getItem(EMAIL_KEY) ?? "";
}

export function clearPendingVerifyEmail(): void {
  sessionStorage.removeItem(EMAIL_KEY);
  sessionStorage.removeItem(COOLDOWN_KEY);
}

export function maskEmail(email: string): string {
  const trimmed = email.trim();
  const at = trimmed.indexOf("@");
  if (at <= 1) return trimmed;
  const local = trimmed.slice(0, at);
  const domain = trimmed.slice(at);
  const visible = local.slice(0, Math.min(2, local.length));
  const hidden = Math.max(local.length - visible.length, 1);
  return `${visible}${"•".repeat(hidden)}${domain}`;
}

export function setResendCooldownEndsAt(epochMs: number): void {
  sessionStorage.setItem(COOLDOWN_KEY, String(epochMs));
}

export function getResendCooldownRemainingSec(defaultSec = 60): number {
  const raw = sessionStorage.getItem(COOLDOWN_KEY);
  if (!raw) return defaultSec;
  const ends = Number(raw);
  if (!Number.isFinite(ends)) return defaultSec;
  const left = Math.ceil((ends - Date.now()) / 1000);
  return left > 0 ? left : 0;
}

export function startResendCooldown(seconds: number): void {
  setResendCooldownEndsAt(Date.now() + seconds * 1000);
}
