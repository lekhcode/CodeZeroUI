import { useCallback, useId, useLayoutEffect, useRef, useState, type FocusEvent, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import styles from "@/components/RevisionPanel/RevisionPanel.module.css";

const TIP_MAX_W = 260;
const VIEWPORT_PAD = 8;

type InfoTooltipProps = {
  text: string;
};

export function InfoTooltip({ text }: InfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const tipRef = useRef<HTMLDivElement>(null);
  const tipId = useId();

  const placeTooltip = useCallback((target: HTMLButtonElement) => {
    const rect = target.getBoundingClientRect();
    let left = rect.left - TIP_MAX_W - 10;
    let top = rect.top;

    if (left < VIEWPORT_PAD) {
      left = VIEWPORT_PAD;
    }

    if (top < VIEWPORT_PAD) top = VIEWPORT_PAD;

    setPos({ left, top });
    setOpen(true);
  }, []);

  useLayoutEffect(() => {
    if (!open || !tipRef.current) return;
    const tip = tipRef.current.getBoundingClientRect();
    let { left, top } = pos;
    const maxTop = window.innerHeight - VIEWPORT_PAD;

    if (left + tip.width > window.innerWidth - VIEWPORT_PAD) {
      left = window.innerWidth - tip.width - VIEWPORT_PAD;
    }
    if (top + tip.height > maxTop) {
      top = Math.max(VIEWPORT_PAD, maxTop - tip.height);
    }

    if (left !== pos.left || top !== pos.top) {
      setPos({ left, top });
    }
  }, [open, pos, text]);

  const onMouseEnter = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      placeTooltip(e.currentTarget);
    },
    [placeTooltip],
  );

  const onFocus = useCallback(
    (e: FocusEvent<HTMLButtonElement>) => {
      placeTooltip(e.currentTarget);
    },
    [placeTooltip],
  );

  return (
    <>
      <button
        type="button"
        className={styles.infoButton}
        aria-describedby={open ? tipId : undefined}
        onMouseEnter={onMouseEnter}
        onMouseLeave={() => setOpen(false)}
        onFocus={onFocus}
        onBlur={() => setOpen(false)}
      >
        ⓘ
      </button>
      {open
        ? createPortal(
            <div
              ref={tipRef}
              id={tipId}
              role="tooltip"
              className={styles.tooltip}
              style={{ left: pos.left, top: pos.top }}
            >
              {text}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
