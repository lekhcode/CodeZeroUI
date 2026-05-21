import { Box, Button, Typography, useMediaQuery, useTheme } from "@mui/material";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ONBOARDING_STEPS, type OnboardingPlacement, type OnboardingStep } from "@/onboarding/onboardingSteps";
import { useOnboardingStore } from "@/onboarding/onboardingStore";
import { useOnboardingTarget, type TargetRect } from "@/onboarding/useOnboardingTarget";
import { persistOnboardingComplete } from "@/onboarding/persistOnboardingComplete";
import { miui } from "@/theme/theme";

const DIM = "rgba(10, 11, 13, 0.78)";
const OVERLAY_Z = 1700;
const SPOTLIGHT_Z = 1701;
const PANEL_Z = 1702;

type PanelPos = {
  top?: number | string;
  left?: number | string;
  right?: number;
  bottom?: number;
  transform?: string;
  maxWidth?: number;
};

function panelPosition(rect: TargetRect | null, placement: OnboardingPlacement, isMobile: boolean): PanelPos {
  if (placement === "center" || !rect) {
    return isMobile
      ? { left: 16, right: 16, bottom: 24 }
      : { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
  }

  const margin = 14;
  const panelW = isMobile ? undefined : 340;

  if (isMobile) {
    return { left: 16, right: 16, bottom: 24 };
  }

  if (placement === "right") {
    const left = rect.left + rect.width + margin;
    const top = Math.max(16, Math.min(rect.top, window.innerHeight - 280));
    if (left + (panelW ?? 340) > window.innerWidth - 16) {
      return { left: 16, right: 16, bottom: 24 };
    }
    return { top, left, maxWidth: panelW };
  }

  const top = rect.top + rect.height + margin;
  const fitsBelow = top + 220 < window.innerHeight;
  if (fitsBelow) {
    const left = Math.max(16, Math.min(rect.left, window.innerWidth - (panelW ?? 340) - 16));
    return { top, left, maxWidth: panelW };
  }

  const aboveTop = Math.max(16, rect.top - 220 - margin);
  const left = Math.max(16, Math.min(rect.left, window.innerWidth - (panelW ?? 340) - 16));
  return { top: aboveTop, left, maxWidth: panelW };
}

function SpotlightHole({
  rect,
  reducedMotion,
}: {
  rect: TargetRect | null;
  reducedMotion: boolean;
}) {
  if (!rect) {
    return (
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          bgcolor: DIM,
          zIndex: SPOTLIGHT_Z,
          pointerEvents: "none",
        }}
      />
    );
  }

  const transition = reducedMotion ? { duration: 0 } : { duration: 0.32, ease: [0.4, 0, 0.2, 1] as const };

  return (
    <Box
      component={motion.div}
      initial={false}
      animate={{
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      }}
      transition={transition}
      sx={{
        position: "fixed",
        zIndex: SPOTLIGHT_Z,
        borderRadius: "10px",
        boxShadow: `0 0 0 9999px ${DIM}`,
        border: `1px solid ${miui.borderFocus}`,
        pointerEvents: "none",
      }}
    />
  );
}

function StepPanel({
  step,
  stepIndex,
  total,
  rect,
  isMobile,
  onBack,
  onNext,
  onSkip,
  finishing,
  persistError,
  placement,
}: {
  step: OnboardingStep;
  stepIndex: number;
  total: number;
  rect: TargetRect | null;
  isMobile: boolean;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
  finishing: boolean;
  persistError: string | null;
  placement: OnboardingPlacement;
}) {
  const reducedMotion = useReducedMotion();
  const pos = panelPosition(rect, placement, isMobile);
  const isLast = stepIndex === total - 1;

  return (
    <Box
      component={motion.div}
      key={step.id}
      initial={reducedMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reducedMotion ? undefined : { opacity: 0, y: 6 }}
      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      role="dialog"
      aria-labelledby="onboarding-title"
      aria-describedby="onboarding-body"
      sx={{
        position: "fixed",
        zIndex: PANEL_Z,
        width: isMobile ? undefined : 340,
        maxWidth: isMobile ? undefined : 360,
        ...pos,
        bgcolor: miui.paper,
        border: `1px solid ${miui.borderStrong}`,
        borderRadius: "12px",
        boxShadow: "0 24px 48px rgba(0,0,0,0.45)",
        p: 2,
        pointerEvents: "auto",
      }}
    >
      <Typography
        sx={{
          fontSize: "0.6875rem",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: miui.textDim,
          mb: 0.75,
        }}
      >
        {step.kicker ?? `Step ${stepIndex + 1} of ${total}`}
      </Typography>
      <Typography
        id="onboarding-title"
        sx={{
          fontFamily: '"Space Grotesk", sans-serif',
          fontWeight: 700,
          fontSize: "1.125rem",
          color: miui.text,
          mb: 0.75,
          lineHeight: 1.25,
        }}
      >
        {step.title}
      </Typography>
      <Typography id="onboarding-body" sx={{ fontSize: "0.875rem", color: miui.textMuted, lineHeight: 1.55, mb: 2 }}>
        {step.body}
      </Typography>
      {persistError ? (
        <Typography sx={{ fontSize: "0.75rem", color: miui.danger, mb: 1.5, lineHeight: 1.4 }}>
          {persistError}
        </Typography>
      ) : null}

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, flexWrap: "wrap" }}>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          {ONBOARDING_STEPS.map((_, i) => (
            <Box
              key={i}
              sx={{
                width: i === stepIndex ? 18 : 6,
                height: 3,
                borderRadius: 1,
                bgcolor: i === stepIndex ? miui.accent : miui.border,
                transition: "width 0.2s ease, background-color 0.2s ease",
              }}
            />
          ))}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <Button
            size="small"
            variant="text"
            onClick={onSkip}
            disabled={finishing}
            sx={{ color: miui.textDim, textTransform: "none", minWidth: 0, fontSize: "0.8125rem" }}
          >
            Skip tour
          </Button>
          {stepIndex > 0 && (
            <Button
              size="small"
              variant="text"
              onClick={onBack}
              disabled={finishing}
              sx={{ color: miui.textMuted, textTransform: "none", fontSize: "0.8125rem" }}
            >
              Back
            </Button>
          )}
          <Button
            size="small"
            variant="contained"
            onClick={onNext}
            disabled={finishing}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.8125rem",
              borderRadius: "6px",
              minWidth: 72,
            }}
          >
            {finishing ? "…" : isLast ? "Finish" : "Next"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export function OnboardingWalkthrough() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const reducedMotion = useReducedMotion();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const active = useOnboardingStore((s) => s.active);
  const stepIndex = useOnboardingStore((s) => s.stepIndex);
  const next = useOnboardingStore((s) => s.next);
  const back = useOnboardingStore((s) => s.back);
  const end = useOnboardingStore((s) => s.end);

  const step = ONBOARDING_STEPS[stepIndex];
  const [routeReady, setRouteReady] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [persistError, setPersistError] = useState<string | null>(null);

  const padding = step?.highlightPadding ?? 8;
  const rect = useOnboardingTarget(step?.target, padding, active && routeReady);
  const panelPlacement: OnboardingPlacement =
    routeReady && rect ? step?.placement ?? "auto" : "center";
  const panelRect = routeReady && rect ? rect : null;

  useEffect(() => {
    if (!active || !step) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [active, step]);

  useEffect(() => {
    if (!active || !step) {
      setRouteReady(false);
      return;
    }

    let t: number;
    if (location.pathname !== step.route) {
      navigate(step.route, { replace: true });
      t = window.setTimeout(() => setRouteReady(true), 480);
    } else {
      t = window.setTimeout(() => setRouteReady(true), step.scrollIntoView ? 420 : 120);
    }

    return () => window.clearTimeout(t);
  }, [active, step, location.pathname, navigate]);

  const finish = useCallback(async () => {
    setPersistError(null);
    setFinishing(true);
    try {
      await persistOnboardingComplete(queryClient);
      end();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not save walkthrough progress. Try again.";
      setPersistError(message);
    } finally {
      setFinishing(false);
    }
  }, [queryClient, end]);

  const handleNext = useCallback(() => {
    if (stepIndex >= ONBOARDING_STEPS.length - 1) {
      void finish();
      return;
    }
    next();
  }, [stepIndex, finish, next]);

  const handleSkip = useCallback(() => {
    void finish();
  }, [finish]);

  const portalRoot = useMemo(() => (typeof document !== "undefined" ? document.body : null), []);

  if (!active || !step || !portalRoot) return null;

  return createPortal(
    <>
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          zIndex: OVERLAY_Z,
          bgcolor: DIM,
          pointerEvents: "auto",
        }}
        aria-hidden
        onClick={(e) => e.stopPropagation()}
      />
      {routeReady && rect ? (
        <SpotlightHole rect={rect} reducedMotion={Boolean(reducedMotion)} />
      ) : (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: SPOTLIGHT_Z,
            bgcolor: "transparent",
            pointerEvents: "none",
          }}
        />
      )}
      <AnimatePresence mode="sync" initial={false}>
        <StepPanel
          key={step.id}
          step={step}
          stepIndex={stepIndex}
          total={ONBOARDING_STEPS.length}
          rect={panelRect}
          isMobile={isMobile}
          onBack={back}
          onNext={handleNext}
          onSkip={handleSkip}
          finishing={finishing}
          persistError={persistError}
          placement={panelPlacement}
        />
      </AnimatePresence>
    </>,
    portalRoot,
  );
}
