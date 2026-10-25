import { useEffect, useState } from "react";
import { Box, Stack, Typography, Button, alpha } from "@mui/material";
import {
  AIInterviewerOrb,
  type AIInterviewerOrbState,
} from "@/modules/judge/interviewer/AIInterviewerOrb";
import { InterviewerStatusStrip } from "@/modules/judge/interviewer/InterviewerStatusStrip";

const STATES: AIInterviewerOrbState[] = [
  "idle",
  "listening",
  "thinking",
  "analysing",
  "speaking",
  "error",
];

/** Public visual QA page — /dev/orb-preview */
export function OrbPreviewPage() {
  const [state, setState] = useState<AIInterviewerOrbState>("listening");
  const [level, setLevel] = useState(0.35);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (state !== "listening" && state !== "speaking") return;
    let raf = 0;
    const tick = (t: number) => {
      setLevel(0.25 + 0.35 * (0.5 + 0.5 * Math.sin(t * 0.004)));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [state]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#030208",
        color: "#fff",
        display: "grid",
        placeItems: "center",
        p: 3,
      }}
    >
      <Stack spacing={4} sx={{ alignItems: "stretch", width: "min(920px, 100%)" }}>
        <Typography
          sx={{
            fontWeight: 800,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontSize: 12,
            color: alpha("#fff", 0.45),
            textAlign: "center",
          }}
        >
          AI Interviewer — visual QA
        </Typography>

        {/* Strip mock — no nested card chrome (matches live problem header) */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            py: 0.5,
            bgcolor: "transparent",
          }}
        >
          <Box sx={{ flexShrink: 0, width: 200 }}>
            <Typography sx={{ fontWeight: 800, fontSize: 16 }}>Two Sum</Typography>
            <Typography sx={{ fontSize: 11, color: alpha("#fff", 0.4) }}>EASY · Array</Typography>
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <InterviewerStatusStrip
              active={active}
              busy={false}
              phase={active ? "discovery" : null}
              uiState={active ? state : "idle"}
              utterance={
                active
                  ? "Is there a specific constraint on the order of the indices?"
                  : ""
              }
              level={level}
              error={null}
              onStart={() => setActive(true)}
              onStop={() => setActive(false)}
            />
          </Box>
        </Box>

        {/* Large orb stage */}
        <Box
          sx={{
            display: "grid",
            placeItems: "center",
            py: 5,
            borderRadius: 2,
            background: `
              radial-gradient(circle at 50% 46%,
                ${alpha("#f5d0fe", 0.1)} 0%,
                ${alpha("#c026d3", 0.08)} 18%,
                ${alpha("#3b0764", 0.2)} 40%,
                ${alpha("#05030a", 0.96)} 68%,
                #020108 100%)
            `,
          }}
        >
          <AIInterviewerOrb state={state} audioLevel={level} outputLevel={level} size={300} />
          <Typography sx={{ mt: 2.5, color: alpha("#f5d0fe", 0.9), fontWeight: 700 }}>{state}</Typography>
        </Box>

        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1, justifyContent: "center" }}>
          {STATES.map((s) => (
            <Button
              key={s}
              size="small"
              variant={state === s ? "contained" : "outlined"}
              onClick={() => {
                setState(s);
                setActive(true);
              }}
              sx={{ textTransform: "none" }}
            >
              {s}
            </Button>
          ))}
        </Stack>
      </Stack>
    </Box>
  );
}
