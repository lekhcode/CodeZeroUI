type AuthInlineErrorProps = {
  message: string;
  visible?: boolean;
  className?: string;
};

/** Lightweight auth error — no alert box, sits above primary actions. */
export function AuthInlineError({ message, visible = true, className = "" }: AuthInlineErrorProps) {
  if (!message.trim()) return null;

  return (
    <p
      className={`auth-inline-error ${visible ? "auth-inline-error--visible" : ""} ${className}`.trim()}
      role="alert"
      aria-live="polite"
    >
      <span className="auth-inline-error__dot" aria-hidden />
      {message}
    </p>
  );
}
