import { useCallback, useEffect, useRef } from "react";

const SPIN_INTERVAL_MS = 60_000;
const SPIN_DURATION_MS = 720;
const SPIN_EASING = "cubic-bezier(0.45, 0.05, 0.35, 1)";

/**
 * Callback ref — wires auto-spin when the mark mounts (avoids null ref on first effect).
 * Uses Web Animations API (same motion as CSS hover) so each interval reliably restarts.
 */
export function useZeroMarkAutoSpin() {
  const cleanupRef = useRef<(() => void) | null>(null);

  const setSpinTarget = useCallback((node: HTMLElement | null) => {
    cleanupRef.current?.();
    cleanupRef.current = null;

    if (!node) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let running: Animation | null = null;

    const playSpin = () => {
      if (running?.playState === "running") return;
      running?.cancel();
      running = node.animate(
        [{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }],
        { duration: SPIN_DURATION_MS, easing: SPIN_EASING },
      );
      running.onfinish = () => {
        running = null;
      };
      running.oncancel = () => {
        running = null;
      };
    };

    const intervalId = window.setInterval(playSpin, SPIN_INTERVAL_MS);

    cleanupRef.current = () => {
      window.clearInterval(intervalId);
      running?.cancel();
      running = null;
    };
  }, []);

  useEffect(() => () => cleanupRef.current?.(), []);

  return setSpinTarget;
}
