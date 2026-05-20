import type { ReactNode } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import type { ScheduleTemplate, TemplatePreviewPayload } from "@/types/api.types";
import { getTypeLabel } from "@/utils/scheduleCopy";
import { getPreviewEnrollLabel, getTopicPreviewCopy } from "@/utils/topicPreviewCopy";
import { TopicActionBar } from "@/modules/explore/topic-preview/TopicActionBar";
import { DifficultyIndicator } from "@/modules/explore/topic-preview/DifficultyIndicator";
import { miui } from "@/theme/theme";

type TopicOverviewPanelProps = {
  template: ScheduleTemplate;
  preview: TemplatePreviewPayload | undefined;
  loading?: boolean;
  enrolled?: boolean;
  onAddSchedule: () => void;
  onShare: () => void;
  onCopyLink: () => void;
};

export function TopicOverviewPanel({
  template,
  preview,
  loading = false,
  enrolled,
  onAddSchedule,
  onShare,
  onCopyLink,
}: TopicOverviewPanelProps) {
  const copy = getTopicPreviewCopy(template.slug, template.type);
  const total = preview?.total ?? 0;
  const stats = preview?.stats;

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        background: `linear-gradient(165deg, ${miui.paper} 0%, ${miui.bg} 55%, #0a0c10 100%)`,
        borderLeft: { xs: "none", md: `1px solid ${miui.border}` },
        borderTop: { xs: `1px solid ${miui.border}`, md: "none" },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `radial-gradient(ellipse 70% 45% at 100% 0%, rgba(176,184,196,0.06) 0%, transparent 50%)`,
        }}
      />

      <Box sx={{ position: "relative", flex: 1, minHeight: 0, display: "flex", flexDirection: "column", p: 2 }}>
        <TopicActionBar
          onShare={onShare}
          onCopyLink={onCopyLink}
          onAddSchedule={enrolled ? undefined : onAddSchedule}
          enrolled={enrolled}
        />

        <Typography
          sx={{
            mt: 1.5,
            fontFamily: '"Space Grotesk", sans-serif',
            fontWeight: 700,
            fontSize: "18px",
            lineHeight: 1.25,
            color: miui.text,
          }}
        >
          {template.name}
        </Typography>

        <Typography sx={{ mt: 0.5, fontSize: "12px", color: miui.textMuted, lineHeight: 1.5 }}>
          {copy.headline}
        </Typography>

        <Stack direction="row" spacing={0.5} sx={{ mt: 1.25, flexWrap: "wrap" }}>
          <Box component="span" sx={metaPillSx}>
            {getTypeLabel(template.type)}
          </Box>
          <Box component="span" sx={metaPillSx}>
            {loading ? "…" : `${total} questions`}
          </Box>
        </Stack>

        {!loading && stats ? (
          <Stack direction="row" spacing={1.25} sx={{ mt: 1.25 }}>
            <DifficultyIndicator difficulty="EASY" />
            <Typography sx={statCountSx}>{stats.easy}</Typography>
            <DifficultyIndicator difficulty="MEDIUM" />
            <Typography sx={statCountSx}>{stats.medium}</Typography>
            <DifficultyIndicator difficulty="HARD" />
            <Typography sx={statCountSx}>{stats.hard}</Typography>
          </Stack>
        ) : null}

        <Box sx={{ mt: 2, flex: 1, minHeight: 0, overflow: "auto" }} className="app-scroll">
          <Section title="What you'll learn">{copy.teaches}</Section>
          <Section title="Why it matters">{copy.whyItMatters}</Section>
          <Section title="Core patterns">
            <Stack spacing={0.5}>
              {copy.patterns.map((p) => (
                <Typography key={p} sx={bulletSx}>
                  {p}
                </Typography>
              ))}
            </Stack>
          </Section>
        </Box>

        <Box sx={{ pt: 1.5, flexShrink: 0 }}>
          <Button
            fullWidth
            variant="contained"
            disabled={enrolled || loading}
            onClick={onAddSchedule}
            sx={{
              textTransform: "none",
              fontWeight: 500,
              fontSize: "13px",
              minHeight: 36,
              borderRadius: "6px",
              boxShadow: miui.ctaShadow,
            }}
          >
            {getPreviewEnrollLabel(template.type, enrolled === true)}
          </Button>
          <Typography sx={{ mt: 0.75, textAlign: "center", fontSize: "11px", color: miui.textDim }}>
            Solve via Today after enrolling — preview is read-only
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography
        sx={{
          fontSize: "10px",
          fontWeight: 500,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: miui.textDim,
          mb: 0.5,
        }}
      >
        {title}
      </Typography>
      <Typography sx={{ fontSize: "13px", color: miui.textMuted, lineHeight: 1.55, fontWeight: 400 }}>
        {children}
      </Typography>
    </Box>
  );
}

const metaPillSx = {
  fontFamily: "var(--font-number)",
  fontSize: "10px",
  fontWeight: 500,
  letterSpacing: "0.04em",
  textTransform: "uppercase" as const,
  px: 0.75,
  py: 0.2,
  borderRadius: "4px",
  border: `1px solid ${miui.border}`,
  color: miui.textMuted,
  bgcolor: miui.elevated,
};

const statCountSx = {
  fontFamily: "var(--font-number)",
  fontSize: "12px",
  color: miui.textMuted,
  mr: 0.5,
};

const bulletSx = {
  fontSize: "12px",
  color: miui.textMuted,
  pl: 1,
  borderLeft: `2px solid ${miui.borderStrong}`,
  lineHeight: 1.45,
};
