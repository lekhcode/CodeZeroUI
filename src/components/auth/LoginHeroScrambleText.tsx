import { useEffect, useRef } from "react";

const SENTENCES = [
  "Patterns beat memorization.",
  "Consistency compounds.",
  "Strong engineers revise.",
  "Debugging builds intuition.",
  "Daily reps create mastery.",
  "Interview confidence is trained.",
  "Spaced revision prevents decay.",
  "Recognition comes before speed.",
  "Momentum matters.",
  "Solve. Revisit. Internalize.",
  "Discipline beats motivation.",
  "Edge cases teach the most.",
  "Repetition wires reflexes.",
  "Think invariants, not hacks.",
  "Weak spots need reps.",
  "Clarity beats cleverness.",
] as const;

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIGITS = "0123456789";
const SYMBOLS = "!@#$%^&*";
const ALPHANUM = LETTERS + DIGITS;

const REVEAL_MS = 2400;
const HOLD_MS = 3000;
const DISSOLVE_MS = 1600;

/** Wider window = each character shuffles longer before locking. */
const SCRAMBLE_WINDOW = 0.26;
const SCRAMBLE_SPREAD = 0.78;

const LONGEST = SENTENCES.reduce((a, b) => (a.length >= b.length ? a : b), "");

type Phase = "reveal" | "hold" | "dissolve";

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

function randomScrambleChar(forTarget?: string): string {
  let ch: string;
  if (Math.random() < 0.88) {
    ch = ALPHANUM[Math.floor(Math.random() * ALPHANUM.length)] ?? "A";
  } else {
    ch = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)] ?? "#";
  }
  if (forTarget && forTarget >= "a" && forTarget <= "z") return ch.toLowerCase();
  if (forTarget && forTarget >= "A" && forTarget <= "Z") return ch.toUpperCase();
  return ch;
}

function scrambleChar(targetChar: string, locked: boolean): string {
  if (locked) return targetChar;
  if (targetChar === " " || targetChar === "." || targetChar === ",") return targetChar;
  return randomScrambleChar(targetChar);
}

function buildFrame(target: string, progress: number, phase: "reveal" | "dissolve"): string {
  const len = target.length;
  const eased = easeInOutCubic(progress);
  let out = "";

  for (let i = 0; i < len; i++) {
    const ch = target[i]!;
    const threshold = i / Math.max(len - 1, 1);
    let lockStrength: number;

    if (phase === "reveal") {
      lockStrength = Math.min(
        1,
        Math.max(0, (eased - threshold * SCRAMBLE_SPREAD) / SCRAMBLE_WINDOW),
      );
    } else {
      const unlock = 1 - eased;
      lockStrength = Math.min(
        1,
        Math.max(0, (unlock - threshold * SCRAMBLE_SPREAD) / SCRAMBLE_WINDOW),
      );
    }

    if (lockStrength >= 0.98) {
      out += ch;
    } else if (lockStrength <= 0.02) {
      out += scrambleChar(ch, false);
    } else if (ch === " " || ch === "." || ch === ",") {
      out += Math.random() < lockStrength ? ch : scrambleChar(ch, false);
    } else {
      out += Math.random() < lockStrength ? ch : scrambleChar(ch, false);
    }
  }

  return out;
}

export function LoginHeroScrambleText() {
  const rootRef = useRef<HTMLParagraphElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const indexRef = useRef(0);
  const phaseRef = useRef<Phase>("reveal");
  const phaseStartRef = useRef(0);
  const rafRef = useRef(0);
  const reducedMotionRef = useRef(false);
  const lastDisplayRef = useRef("");
  const stableClassRef = useRef(false);

  useEffect(() => {
    const root = rootRef.current;
    const textEl = textRef.current;
    if (!root || !textEl) return;

    reducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const setAnimatingClass = (animating: boolean) => {
      if (stableClassRef.current === !animating) return;
      stableClassRef.current = !animating;
      root.classList.toggle("login-hero-scramble--stable", !animating);
      root.classList.toggle("login-hero-scramble--active", animating);
    };

    const advanceSentence = () => {
      indexRef.current = (indexRef.current + 1) % SENTENCES.length;
    };

    const startPhase = (phase: Phase, now: number) => {
      phaseRef.current = phase;
      phaseStartRef.current = now;
      setAnimatingClass(phase !== "hold");
    };

    if (reducedMotionRef.current) {
      let holdTimer = 0;
      const show = (idx: number) => {
        textEl.textContent = SENTENCES[idx] ?? SENTENCES[0];
        setAnimatingClass(false);
      };
      show(0);
      holdTimer = window.setInterval(() => {
        indexRef.current = (indexRef.current + 1) % SENTENCES.length;
        root.classList.add("login-hero-scramble--fade");
        requestAnimationFrame(() => {
          show(indexRef.current);
          root.classList.remove("login-hero-scramble--fade");
        });
      }, HOLD_MS + 400);
      return () => window.clearInterval(holdTimer);
    }

    const tick = (now: number) => {
      if (!phaseStartRef.current) phaseStartRef.current = now;

      const target = SENTENCES[indexRef.current] ?? SENTENCES[0];
      const phase = phaseRef.current;
      const elapsed = now - phaseStartRef.current;
      let display = target;

      if (phase === "reveal") {
        const p = Math.min(1, elapsed / REVEAL_MS);
        display = buildFrame(target, p, "reveal");
        if (p >= 1) startPhase("hold", now);
      } else if (phase === "hold") {
        display = target;
        if (elapsed >= HOLD_MS) startPhase("dissolve", now);
      } else {
        const p = Math.min(1, elapsed / DISSOLVE_MS);
        display = buildFrame(target, p, "dissolve");
        if (p >= 1) {
          advanceSentence();
          startPhase("reveal", now);
        }
      }

      if (display !== lastDisplayRef.current) {
        lastDisplayRef.current = display;
        textEl.textContent = display;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    startPhase("reveal", performance.now());
    rafRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <p
      ref={rootRef}
      className="login-hero-scramble login-hero-scramble--active"
      aria-live="polite"
      aria-atomic="true"
    >
      <span ref={textRef} className="login-hero-scramble__text">
        {SENTENCES[0]}
      </span>
      <span className="login-hero-scramble__sizer" aria-hidden>
        {LONGEST}
      </span>
    </p>
  );
}
