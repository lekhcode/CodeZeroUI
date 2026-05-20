import { useCallback, useEffect, useRef } from "react";
import "@/styles/auth-verification.css";

type Props = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  /** Called when all 6 digits are entered (paste or typing). */
  onComplete?: (code: string) => void;
  autoFocus?: boolean;
  idPrefix?: string;
};

export function OtpInput({
  value,
  onChange,
  disabled = false,
  onComplete,
  autoFocus = true,
  idPrefix = "otp",
}: Props) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = value.padEnd(6, " ").slice(0, 6).split("");

  const setAt = useCallback(
    (index: number, char: string) => {
      const next = value.split("");
      next[index] = char;
      const joined = next.join("").replace(/\s/g, "").slice(0, 6);
      onChange(joined);
      if (joined.length === 6) {
        onComplete?.(joined);
      }
    },
    [onChange, onComplete, value],
  );

  const handleChange = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    if (!digit) {
      setAt(index, "");
      return;
    }
    setAt(index, digit);
    if (index < 5) refs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, key: string) => {
    if (key === "Backspace") {
      if (digits[index]?.trim()) {
        setAt(index, "");
        return;
      }
      if (index > 0) {
        refs.current[index - 1]?.focus();
        setAt(index - 1, "");
      }
    }
    if (key === "ArrowLeft" && index > 0) refs.current[index - 1]?.focus();
    if (key === "ArrowRight" && index < 5) refs.current[index + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted);
    if (pasted.length === 6) onComplete?.(pasted);
    const focusIdx = Math.min(pasted.length, 5);
    refs.current[focusIdx]?.focus();
  };

  useEffect(() => {
    if (autoFocus && !disabled) {
      refs.current[0]?.focus();
    }
  }, [autoFocus, disabled]);

  return (
    <div className="otp-input-row" onPaste={handlePaste} role="group" aria-label="Verification code">
      {Array.from({ length: 6 }).map((_, i) => {
        const filled = Boolean(digits[i]?.trim());
        return (
          <input
            key={i}
            id={`${idPrefix}-${i}`}
            ref={(el) => {
              refs.current[i] = el;
            }}
            className={`otp-input-cell${filled ? " otp-input-cell--filled" : ""}`}
            type="text"
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            maxLength={1}
            value={digits[i]?.trim() ?? ""}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e.key)}
            disabled={disabled}
            aria-label={`Digit ${i + 1} of 6`}
          />
        );
      })}
    </div>
  );
}
