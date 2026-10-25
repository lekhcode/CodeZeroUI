import { createPortal } from "react-dom";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Stack,
  Typography,
  alpha,
} from "@mui/material";
import StopCircleOutlinedIcon from "@mui/icons-material/StopCircleOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import type { InterviewerUiState } from "@/types/interviewer.types";
import { AIInterviewerOrb } from "./AIInterviewerOrb";
import { useInterviewerHeaderSlot } from "./InterviewerHeaderSlot";
import { loadVoiceProfile } from "./voiceProfile";

const UI_LABEL: Record<string, string> = {
  idle: "Idle",
  listening: "Listening",
  thinking: "Thinking",
  speaking: "Speaking",
  analyzing: "Analysing",
  analysing: "Analysing",
  error: "Recovering",
};

type Props = {
  active: boolean;
  busy: boolean;
  phase: string | null;
  uiState: InterviewerUiState | string;
  utterance: string;
  partial?: string;
  level?: number;
  error: string | null;
  disabled?: boolean;
  onStart: () => void;
  onStop: () => void;
};

export function InterviewerStatusStrip({
  active,
  busy,
  phase,
  uiState,
  utterance,
  partial = "",
  level = 0,
  error,
  disabled = false,
  onStart,
  onStop,
}: Props) {
  const headerSlot = useInterviewerHeaderSlot();
  const headerMount = headerSlot?.mount ?? null;
  const assistantName = loadVoiceProfile().assistantName || "Kiran";

  const label = UI_LABEL[uiState] ?? String(uiState);
  const orbState = error && active ? "error" : uiState;
  const line = partial
    ? `You: ${partial}`
    : utterance ||
      (uiState === "listening"
        ? "Speak naturally — I'm listening."
        : uiState === "thinking"
          ? "Thinking through your approach…"
          : uiState === "analyzing" || uiState === "analysing"
            ? "Reviewing your code…"
            : "");

  const panel = (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        pl: { xs: 0.5, sm: 1.75 },
        pr: { xs: 0.5, sm: 1 },
        py: 0.75,
        minHeight: 96,
        borderRadius: 0,
        border: "none",
        // Blend flat black into orb palette (pink → violet → soft blue).
        background: `
          radial-gradient(120% 140% at 6% 50%,
            ${alpha("#f472b6", 0.18)} 0%,
            ${alpha("#c026d3", 0.12)} 22%,
            ${alpha("#6366f1", 0.08)} 48%,
            ${alpha("#0a0614", 0.35)} 72%,
            transparent 100%),
          linear-gradient(90deg,
            ${alpha("#1a0b2e", 0.55)} 0%,
            ${alpha("#0c0820", 0.25)} 55%,
            transparent 100%)
        `,
        boxShadow: "none",
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: 92,
          height: 92,
          flexShrink: 0,
          display: "grid",
          placeItems: "center",
          overflow: "visible",
          background: `
            radial-gradient(circle at 50% 48%,
              ${alpha("#f9a8d4", 0.2)} 0%,
              ${alpha("#a21caf", 0.12)} 30%,
              ${alpha("#4338ca", 0.07)} 52%,
              transparent 74%)
          `,
        }}
      >
        <AIInterviewerOrb
          state={active ? orbState : "idle"}
          audioLevel={level}
          size={86}
        />
      </Box>

      {!active ? (
        <>
          <Stack spacing={0.2} sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: alpha("#f5d0fe", 0.78),
              }}
            >
              {assistantName}
            </Typography>
          </Stack>
          <Button
            size="small"
            startIcon={
              busy ? (
                <CircularProgress size={10} color="inherit" />
              ) : (
                <AutoAwesomeOutlinedIcon sx={{ fontSize: 13 }} />
              )
            }
            disabled={disabled || busy}
            onClick={onStart}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              fontSize: 11,
              minHeight: 26,
              px: 1.15,
              py: 0.25,
              flexShrink: 0,
              borderRadius: 999,
              color: alpha("#fce7f3", 0.92),
              letterSpacing: "0.02em",
              bgcolor: alpha("#fff", 0.04),
              border: `1px solid ${alpha("#e879f9", 0.28)}`,
              boxShadow: "none",
              "& .MuiButton-startIcon": { mr: 0.55 },
              "&:hover": {
                bgcolor: alpha("#f0abfc", 0.1),
                borderColor: alpha("#f0abfc", 0.42),
              },
              "&.Mui-disabled": {
                color: alpha("#f5d0fe", 0.3),
                borderColor: alpha("#a855f7", 0.15),
              },
            }}
          >
            Start interview
          </Button>
        </>
      ) : (
        <>
          <Stack spacing={0.3} sx={{ minWidth: 0, flex: 1 }}>
            <Stack direction="row" spacing={0.85} sx={{ alignItems: "center" }}>
              <Typography
                component="span"
                aria-live="polite"
                sx={{
                  fontSize: 13.5,
                  fontWeight: 750,
                  color: alpha("#fce7f3", 0.96),
                  letterSpacing: "0.015em",
                  lineHeight: 1.2,
                }}
              >
                {assistantName} · {label}
              </Typography>
              {phase ? (
                <Typography
                  component="span"
                  sx={{
                    fontSize: 10,
                    fontWeight: 650,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: alpha("#c4b5fd", 0.58),
                    lineHeight: 1,
                  }}
                >
                  {phase.replace(/_/g, " ")}
                </Typography>
              ) : null}
            </Stack>
            <Typography
              title={line}
              sx={{
                fontSize: 13,
                lineHeight: 1.4,
                fontWeight: 450,
                color: alpha("#e2e8f0", 0.78),
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {line || "\u00a0"}
            </Typography>
            {error ? (
              <Typography role="alert" sx={{ fontSize: 11, color: "#f85149" }}>
                {error}
              </Typography>
            ) : null}
          </Stack>

          <IconButton
            size="small"
            onClick={onStop}
            title="End interview"
            aria-label="End interview"
            sx={{
              width: 32,
              height: 32,
              flexShrink: 0,
              color: alpha("#fff", 0.55),
              borderRadius: "50%",
              border: `1px solid ${alpha("#fff", 0.1)}`,
              "&:hover": {
                color: "#fda4af",
                borderColor: alpha("#fb7185", 0.4),
                bgcolor: alpha("#fb7185", 0.1),
              },
            }}
          >
            <StopCircleOutlinedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </>
      )}
    </Box>
  );

  if (headerMount) {
    return createPortal(panel, headerMount);
  }

  return <Box sx={{ px: 1, py: 0.5, flexShrink: 0 }}>{panel}</Box>;
}
