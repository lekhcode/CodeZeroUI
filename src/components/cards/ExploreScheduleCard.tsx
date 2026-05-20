import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import type { ScheduleTemplate } from "@/types/api.types";
import { getTemplateMeta, getTypeLabel } from "@/utils/scheduleCopy";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import TodayRoundedIcon from "@mui/icons-material/TodayRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import { miui } from "@/theme/theme";

const TYPE_ICONS = {
  DAILY_POTD: TodayRoundedIcon,
  STUDY_PLAN: MenuBookRoundedIcon,
  TOPIC: CategoryRoundedIcon,
};

type ExploreScheduleCardProps = {
  template: ScheduleTemplate;
  enrolled?: boolean;
  onEnroll?: () => void;
  /** Topic / study plan — open curriculum preview */
  onPreview?: () => void;
};

export function ExploreScheduleCard({
  template,
  enrolled,
  onEnroll,
  onPreview,
}: ExploreScheduleCardProps) {
  const meta = getTemplateMeta(template.slug, template.type);
  const Icon = TYPE_ICONS[template.type];
  const [gradStart, gradEnd] = meta.gradient;
  const previewable =
    (template.type === "TOPIC" || template.type === "STUDY_PLAN") && onPreview !== undefined;
  const previewHint =
    template.type === "STUDY_PLAN"
      ? "Click card to preview plan"
      : template.type === "TOPIC"
        ? "Click card to preview questions"
        : null;

  const handleCardClick = (): void => {
    if (previewable) onPreview();
  };

  return (
    <Card
      onClick={previewable ? handleCardClick : undefined}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: miui.paper,
        borderRadius: "12px",
        overflow: "hidden",
        transition: "border-color 160ms ease, transform 160ms ease",
        willChange: previewable ? "transform" : undefined,
        boxShadow: "none",
        border: `1px solid ${miui.border}`,
        cursor: previewable ? "pointer" : "default",
        "@media (prefers-reduced-motion: no-preference)": {
          "&:hover": {
            transform: "translateY(-2px)",
            borderColor: miui.borderStrong,
          },
        },
      }}
    >
      <Box
        sx={{
          height: 3,
          background: `linear-gradient(90deg, ${gradStart}, ${gradEnd})`,
        }}
      />
      <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", p: 2.5 }}>
        <Stack
          direction="row"
          sx={{ mb: 2, justifyContent: "space-between", alignItems: "flex-start" }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: miui.elevated,
              border: `1px solid ${miui.border}`,
              color: miui.textMuted,
            }}
          >
            <Icon />
          </Box>
          <Chip
            label={getTypeLabel(template.type)}
            size="small"
            sx={{
              fontWeight: 400,
              bgcolor: miui.elevated,
              color: miui.textMuted,
              border: `1px solid ${miui.border}`,
            }}
          />
        </Stack>

        <Typography
          variant="h6"
          sx={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontWeight: 700,
            fontSize: "1rem",
            color: miui.text,
            mb: 0.5,
          }}
        >
          {template.name}
        </Typography>

        {meta.problemCount && (
          <Typography
            sx={{
              mb: 1,
              display: "block",
              fontFamily: "var(--font-number)",
              fontSize: "12px",
              color: miui.textMuted,
              fontWeight: 400,
            }}
          >
            {meta.problemCount} problems in catalog
          </Typography>
        )}

        <Typography
          variant="body2"
          sx={{ lineHeight: 1.65, mb: 2, flex: 1, color: miui.textMuted, fontWeight: 400 }}
        >
          {meta.tagline}
        </Typography>

        <Stack spacing={0.75} sx={{ mb: 2 }}>
          {meta.highlights.map((h) => (
            <Typography
              key={h}
              variant="caption"
              sx={{ display: "flex", alignItems: "center", gap: 0.75, fontWeight: 400, color: miui.textMuted }}
            >
              <Box
                component="span"
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  bgcolor: miui.primary,
                  flexShrink: 0,
                }}
              />
              {h}
            </Typography>
          ))}
        </Stack>

        {template.allowsCount && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" sx={{ color: miui.textMuted, fontWeight: 400 }}>
              Default pace: {template.defaultCount ?? 2} problems / day (up to 6)
            </Typography>
            <LinearProgress
              variant="determinate"
              value={Math.min(((template.defaultCount ?? 2) / 5) * 100, 100)}
              sx={{
                mt: 0.5,
                height: 4,
                borderRadius: 2,
                bgcolor: miui.elevated,
              }}
            />
          </Box>
        )}

        {previewHint ? (
          <Typography
            sx={{
              fontSize: "11px",
              color: miui.textDim,
              mb: 1,
              fontWeight: 400,
            }}
          >
            {previewHint}
          </Typography>
        ) : null}

        <Button
          variant={enrolled ? "outlined" : "contained"}
          fullWidth
          disabled={enrolled}
          onClick={(e) => {
            e.stopPropagation();
            onEnroll?.();
          }}
          startIcon={enrolled ? <CheckCircleRoundedIcon /> : undefined}
          sx={
            enrolled
              ? {
                  bgcolor: miui.elevated,
                  borderColor: miui.borderStrong,
                  color: miui.textMuted,
                  borderRadius: "8px",
                  fontWeight: 500,
                  "&.Mui-disabled": {
                    bgcolor: miui.elevated,
                    borderColor: miui.borderStrong,
                    color: miui.textMuted,
                  },
                }
              : { fontWeight: 500 }
          }
        >
          {enrolled ? "Added to my schedules" : "Add to my schedules"}
        </Button>
      </CardContent>
    </Card>
  );
}
