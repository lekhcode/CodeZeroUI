/** Shorter arcs + larger gaps so the mark reads as digit 0, not letter O */
const ZERO_RING_DASH = "22 148";

/** Shared zero ring arcs for extrusion + lit front face */
function ZeroRingArcs({
  className,
  opacity,
  strokeWidth = 6,
}: {
  className?: string;
  opacity?: number;
  strokeWidth?: number;
}) {
  const dash = ZERO_RING_DASH;
  return (
    <g className={className} opacity={opacity}>
      <circle
        className="onboard-mark-3d__arc onboard-mark-3d__arc--blue"
        cx="36"
        cy="36"
        r="27"
        strokeWidth={strokeWidth}
        strokeDasharray={dash}
        strokeDashoffset="0"
      />
      <circle
        className="onboard-mark-3d__arc onboard-mark-3d__arc--green"
        cx="36"
        cy="36"
        r="27"
        strokeWidth={strokeWidth}
        strokeDasharray={dash}
        strokeDashoffset="-22"
      />
      <circle
        className="onboard-mark-3d__arc onboard-mark-3d__arc--yellow"
        cx="36"
        cy="36"
        r="27"
        strokeWidth={strokeWidth}
        strokeDasharray={dash}
        strokeDashoffset="-44"
      />
      <circle
        className="onboard-mark-3d__arc onboard-mark-3d__arc--red"
        cx="36"
        cy="36"
        r="27"
        strokeWidth={strokeWidth}
        strokeDasharray={dash}
        strokeDashoffset="-66"
      />
    </g>
  );
}

function BraceStack({ char, side }: { char: "{" | "}"; side: "open" | "close" }) {
  return (
    <span className={`onboard-mark-3d__brace-stack onboard-mark-3d__brace-stack--${side}`}>
      <span className="onboard-mark-3d__brace onboard-mark-3d__brace--e3" aria-hidden>
        {char}
      </span>
      <span className="onboard-mark-3d__brace onboard-mark-3d__brace--e2" aria-hidden>
        {char}
      </span>
      <span className="onboard-mark-3d__brace onboard-mark-3d__brace--e1" aria-hidden>
        {char}
      </span>
      <span className="onboard-mark-3d__brace onboard-mark-3d__brace--face">{char}</span>
    </span>
  );
}

/**
 * Atmospheric 3D `{0}` — layered extrusion + lit Google ring (CSS/SVG, no WebGL).
 */
export function OnboardZeroMark3D() {
  return (
    <div className="onboard-mark-3d" aria-hidden>
      <div className="onboard-mark-3d__fog" />
      <div className="onboard-mark-3d__ambient" />
      <div className="onboard-mark-3d__highlight" />
      <div className="onboard-mark-3d__stage">
        <div className="onboard-mark-3d__rig">
          <div className="onboard-mark-3d__word">
            <BraceStack char="{" side="open" />
            <div className="onboard-mark-3d__zero">
            <svg
              className="onboard-mark-3d__zero-svg onboard-mark-3d__zero-svg--extrude"
              viewBox="0 0 72 72"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <g transform="translate(4.5 5.5)">
                <ZeroRingArcs className="onboard-mark-3d__extrude" opacity={0.22} strokeWidth={6} />
              </g>
              <g transform="translate(2.5 3.25)">
                <ZeroRingArcs className="onboard-mark-3d__extrude" opacity={0.38} strokeWidth={5.8} />
              </g>
              <g transform="translate(1 1.25)">
                <ZeroRingArcs className="onboard-mark-3d__extrude" opacity={0.55} strokeWidth={5.5} />
              </g>
            </svg>
            <svg
              className="onboard-mark-3d__zero-svg onboard-mark-3d__zero-svg--face"
              viewBox="0 0 72 72"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <radialGradient id="mark-zero-void" cx="42%" cy="38%" r="58%">
                  <stop offset="0%" stopColor="#161a22" />
                  <stop offset="72%" stopColor="#0a0b0d" />
                  <stop offset="100%" stopColor="#060708" />
                </radialGradient>
                <linearGradient id="mark-arc-blue" x1="10" y1="8" x2="58" y2="62">
                  <stop offset="0%" stopColor="#7ec8ff" />
                  <stop offset="100%" stopColor="#2f7ef0" />
                </linearGradient>
                <linearGradient id="mark-arc-green" x1="58" y1="10" x2="12" y2="60">
                  <stop offset="0%" stopColor="#6ef5a8" />
                  <stop offset="100%" stopColor="#22c55e" />
                </linearGradient>
                <linearGradient id="mark-arc-yellow" x1="58" y1="58" x2="10" y2="12">
                  <stop offset="0%" stopColor="#ffe566" />
                  <stop offset="100%" stopColor="#f5b820" />
                </linearGradient>
                <linearGradient id="mark-arc-red" x1="8" y1="58" x2="60" y2="10">
                  <stop offset="0%" stopColor="#ff7b72" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
                <filter id="mark-ring-light" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="1" stdDeviation="0.6" floodColor="#fff" floodOpacity="0.18" />
                  <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.5" />
                </filter>
              </defs>
              <ellipse
                className="onboard-mark-3d__zero-void"
                cx="36"
                cy="37"
                rx="19.5"
                ry="21.5"
                fill="url(#mark-zero-void)"
              />
              <g filter="url(#mark-ring-light)">
                <circle
                  className="onboard-mark-3d__arc onboard-mark-3d__arc--blue"
                  cx="36"
                  cy="36"
                  r="27"
                  stroke="url(#mark-arc-blue)"
                  strokeWidth="6"
                  strokeDasharray={ZERO_RING_DASH}
                  strokeDashoffset="0"
                />
                <circle
                  className="onboard-mark-3d__arc onboard-mark-3d__arc--green"
                  cx="36"
                  cy="36"
                  r="27"
                  stroke="url(#mark-arc-green)"
                  strokeWidth="6"
                  strokeDasharray={ZERO_RING_DASH}
                  strokeDashoffset="-22"
                />
                <circle
                  className="onboard-mark-3d__arc onboard-mark-3d__arc--yellow"
                  cx="36"
                  cy="36"
                  r="27"
                  stroke="url(#mark-arc-yellow)"
                  strokeWidth="6"
                  strokeDasharray={ZERO_RING_DASH}
                  strokeDashoffset="-44"
                />
                <circle
                  className="onboard-mark-3d__arc onboard-mark-3d__arc--red"
                  cx="36"
                  cy="36"
                  r="27"
                  stroke="url(#mark-arc-red)"
                  strokeWidth="6"
                  strokeDasharray={ZERO_RING_DASH}
                  strokeDashoffset="-66"
                />
              </g>
              <circle
                className="onboard-mark-3d__zero-inner-rim"
                cx="36"
                cy="36"
                r="21.5"
                strokeWidth="1"
              />
              <circle
                className="onboard-mark-3d__zero-spec"
                cx="36"
                cy="36"
                r="27"
                strokeWidth="1.5"
              />
            </svg>
            </div>
            <BraceStack char="}" side="close" />
          </div>
        </div>
      </div>
      <div className="onboard-mark-3d__floor" />
    </div>
  );
}
