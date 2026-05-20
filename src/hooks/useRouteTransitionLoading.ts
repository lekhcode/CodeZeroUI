import { useIsFetching } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

/** Minimum overlay time so fast cached navigations do not flash empty content. */
const MIN_OVERLAY_MS = 200;

/**
 * True after pathname changes until initial (pending) queries finish + MIN_OVERLAY_MS.
 * Used for a single app-shell loader instead of page fade + empty layout flashes.
 */
export function useRouteTransitionLoading(): boolean {
  const { pathname } = useLocation();
  const [active, setActive] = useState(false);
  const pathRef = useRef(pathname);
  const startedAtRef = useRef(0);

  const pendingFetches = useIsFetching({
    predicate: (query) =>
      query.state.fetchStatus === "fetching" && query.state.status === "pending",
  });

  useEffect(() => {
    if (pathRef.current !== pathname) {
      pathRef.current = pathname;
      startedAtRef.current = Date.now();
      setActive(true);
    }
  }, [pathname]);

  useEffect(() => {
    if (!active) return;

    const tick = (): void => {
      const elapsed = Date.now() - startedAtRef.current;
      if (pendingFetches === 0 && elapsed >= MIN_OVERLAY_MS) {
        setActive(false);
      }
    };

    let raf = 0;
    const loop = (): void => {
      tick();
      raf = window.requestAnimationFrame(loop);
    };
    raf = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(raf);
  }, [active, pendingFetches]);

  return active;
}
