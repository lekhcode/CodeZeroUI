import { Box, Dialog, Fade, IconButton, useMediaQuery, useTheme } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ScheduleTemplate } from "@/types/api.types";
import { schedulesService } from "@/services/schedules.service";
import { queryKeys } from "@/hooks/queryKeys";
import { AuthInlineError } from "@/components/auth/AuthInlineError";
import { QuestionPreviewList } from "@/modules/explore/topic-preview/QuestionPreviewList";
import { TopicOverviewPanel } from "@/modules/explore/topic-preview/TopicOverviewPanel";
import { ApiRequestError } from "@/services/api";
import { getAuthErrorMessage } from "@/utils/authErrors";
import { miui } from "@/theme/theme";

type TopicPreviewModalProps = {
  template: ScheduleTemplate | null;
  open: boolean;
  enrolled?: boolean;
  onClose: () => void;
  onAddSchedule: (template: ScheduleTemplate) => void;
};

export function TopicPreviewModal({
  template,
  open,
  enrolled = false,
  onClose,
  onAddSchedule,
}: TopicPreviewModalProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const previewQuery = useQuery({
    queryKey: queryKeys.templatePreview(template?.slug ?? ""),
    queryFn: () => schedulesService.getTemplatePreview(template!.slug, template!),
    enabled: open && template !== null,
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
    retry: (count, err) => {
      if (err instanceof ApiRequestError && err.status === 404) return false;
      return count < 2;
    },
  });

  const problems = useMemo(
    () => previewQuery.data?.problems ?? [],
    [previewQuery.data?.problems],
  );

  const listLabel =
    template?.type === "STUDY_PLAN" ? "Plan curriculum" : "Topic questions";

  const previewError =
    previewQuery.isError && !previewQuery.isLoading
      ? getAuthErrorMessage(previewQuery.error, "Could not load preview.")
      : "";

  if (!template) return null;

  const preview = previewQuery.data;

  const handleShare = async (): Promise<void> => {
    const url = `${window.location.origin}/templates?preview=${template.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: template.name, url });
        return;
      } catch {
        /* fall through */
      }
    }
    await navigator.clipboard.writeText(url);
  };

  const handleCopyLink = (): void => {
    const url = `${window.location.origin}/templates?preview=${template.slug}`;
    void navigator.clipboard.writeText(url);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      keepMounted={false}
      slotProps={{
        backdrop: {
          sx: {
            bgcolor: "rgba(5, 6, 8, 0.78)",
          },
        },
        paper: {
          sx: {
            borderRadius: "10px",
            border: `1px solid ${miui.borderStrong}`,
            bgcolor: miui.bg,
            backgroundImage: "none",
            overflow: "hidden",
            maxHeight: "calc(100dvh - 40px)",
            m: { xs: 1, sm: 2 },
          },
        },
        transition: {
          enter: true,
          exit: true,
          timeout: { enter: 180, exit: 140 },
        },
      }}
    >
      <Fade in={open} timeout={180}>
        <Box sx={{ display: "flex", flexDirection: "column", maxHeight: "inherit" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              px: 1,
              py: 0.5,
              borderBottom: `1px solid ${miui.border}`,
              flexShrink: 0,
            }}
          >
            <IconButton
              size="small"
              onClick={onClose}
              aria-label="Close preview"
              sx={{ color: miui.textMuted, borderRadius: "6px" }}
            >
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              height: { xs: "auto", md: "min(72vh, 640px)" },
              maxHeight: { xs: "calc(100dvh - 80px)", md: "min(72vh, 640px)" },
              minHeight: { md: 420 },
            }}
          >
            <Box
              sx={{
                flex: isMobile ? "0 0 auto" : 1.15,
                minWidth: 0,
                minHeight: isMobile ? 280 : 0,
                maxHeight: isMobile ? 360 : "none",
                display: "flex",
                flexDirection: "column",
                bgcolor: miui.paper,
                order: isMobile ? 2 : 0,
              }}
            >
              <AuthInlineError message={previewError} visible={Boolean(previewError)} />
              <QuestionPreviewList
                problems={problems}
                loading={previewQuery.isLoading}
                listLabel={listLabel}
              />
            </Box>

            <Box
              sx={{
                flex: isMobile ? "0 0 auto" : "0 0 300px",
                minWidth: isMobile ? "100%" : 280,
                maxWidth: isMobile ? "100%" : 340,
                minHeight: isMobile ? 320 : 0,
                order: isMobile ? 1 : 1,
              }}
            >
              <TopicOverviewPanel
                template={template}
                preview={preview}
                loading={previewQuery.isLoading}
                enrolled={enrolled}
                onAddSchedule={() => onAddSchedule(template)}
                onShare={() => void handleShare()}
                onCopyLink={handleCopyLink}
              />
            </Box>
          </Box>
        </Box>
      </Fade>
    </Dialog>
  );
}
