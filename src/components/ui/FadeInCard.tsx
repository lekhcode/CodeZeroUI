import type { ReactNode } from "react";

type FadeInCardProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
  /** Match inner MUI `borderRadius` so enter transition clips to rounded shape. */
  borderRadius?: number | string;
};

/**
 * Lightweight enter fade — opacity only (no translate) for scroll performance.
 * Visual: subtle appear, same card content.
 */
export function FadeInCard({ children, delay = 0, className, borderRadius }: FadeInCardProps) {
  const radius =
    borderRadius !== undefined
      ? typeof borderRadius === "number"
        ? `${borderRadius * 8}px`
        : borderRadius
      : undefined;

  return (
    <div
      className={className ? `fade-in-card ${className}` : "fade-in-card"}
      style={{
        animationDelay: `${delay}s`,
        borderRadius: radius,
        overflow: radius !== undefined ? "hidden" : undefined,
      }}
    >
      {children}
    </div>
  );
}
