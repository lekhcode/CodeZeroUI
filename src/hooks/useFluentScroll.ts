import { useEffect, useRef, type RefObject } from "react";

const SCROLL_END_MS = 150;

/**
 * Marks the scroll root with `is-scrolling` so global CSS can pause infinite animations.
 * Pass an existing ref when the scroll root is owned by a parent (e.g. page ScrollRegion).
 */
export function useFluentScroll<T extends HTMLElement>(
  scrollRef?: RefObject<T | null>,
): RefObject<T | null> {
  const fallbackRef = useRef<T | null>(null);
  const ref = scrollRef ?? fallbackRef;

  useEffect(() => {
    const scrollEl = ref.current;
    if (scrollEl === null) {
      return;
    }

    let scrollEndTimer: ReturnType<typeof setTimeout> | undefined;

    const onScroll = () => {
      scrollEl.classList.add("is-scrolling");
      if (scrollEndTimer !== undefined) {
        clearTimeout(scrollEndTimer);
      }
      scrollEndTimer = setTimeout(() => {
        scrollEl.classList.remove("is-scrolling");
      }, SCROLL_END_MS);
    };

    scrollEl.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      scrollEl.removeEventListener("scroll", onScroll);
      if (scrollEndTimer !== undefined) {
        clearTimeout(scrollEndTimer);
      }
      scrollEl.classList.remove("is-scrolling");
    };
  }, []);

  return ref;
}
