import { useCallback, useEffect, useState } from "react";

export type TargetRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

function measureElement(el: Element, padding: number): TargetRect {
  const r = el.getBoundingClientRect();
  return {
    top: r.top - padding,
    left: r.left - padding,
    width: r.width + padding * 2,
    height: r.height + padding * 2,
  };
}

export function useOnboardingTarget(targetId: string | undefined, padding = 8, enabled = true) {
  const [rect, setRect] = useState<TargetRect | null>(null);

  const measure = useCallback(() => {
    if (!enabled || !targetId) {
      setRect(null);
      return;
    }
    const el = document.querySelector(`[data-onboarding="${targetId}"]`);
    if (!el) {
      setRect(null);
      return;
    }
    setRect(measureElement(el, padding));
  }, [enabled, targetId, padding]);

  useEffect(() => {
    measure();
    if (!enabled || !targetId) return;

    const el = document.querySelector(`[data-onboarding="${targetId}"]`);
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });

    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(onResize) : null;
    if (ro && el) ro.observe(el);

    const t1 = window.setTimeout(measure, 120);
    const t2 = window.setTimeout(measure, 380);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
      ro?.disconnect();
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [enabled, targetId, measure]);

  return rect;
}
