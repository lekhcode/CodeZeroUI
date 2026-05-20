import { Box, Typography } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";
import type { TemplatePreviewProblem } from "@/types/api.types";
import { QuestionPreviewRow } from "@/modules/explore/topic-preview/QuestionPreviewRow";
import { PROBLEM_LIST_ROW_HEIGHT } from "@/theme/problemList";
import { miui } from "@/theme/theme";

type QuestionPreviewListProps = {
  problems: TemplatePreviewProblem[];
  loading?: boolean;
  listLabel?: string;
};

const ROW_HEIGHT = PROBLEM_LIST_ROW_HEIGHT;

export function QuestionPreviewList({
  problems,
  loading = false,
  listLabel = "Questions",
}: QuestionPreviewListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: problems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 6,
  });

  if (loading) {
    return (
      <Box sx={{ px: 2, py: 1.5 }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <Box
            key={i}
            className="skeleton"
            sx={{
              height: 40,
              mb: 0.5,
              borderRadius: 0,
              opacity: 0.5,
            }}
          />
        ))}
      </Box>
    );
  }

  if (problems.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography sx={{ fontSize: "13px", color: miui.textMuted }}>
          No preview problems found yet.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        contain: "layout style",
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1,
          borderBottom: `1px solid ${miui.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <Typography
          sx={{
            fontSize: "11px",
            fontWeight: 500,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: miui.textMuted,
          }}
        >
          {listLabel} · {problems.length}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: miui.textDim }}>
          <LockOutlinedIcon sx={{ fontSize: 12 }} />
          <Typography sx={{ fontSize: "11px" }}>Preview</Typography>
        </Box>
      </Box>

      <Box
        ref={parentRef}
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: "auto",
          overflowX: "hidden",
          WebkitOverflowScrolling: "touch",
          overscrollBehavior: "contain",
          willChange: "scroll-position",
        }}
      >
        <Box
          sx={{
            height: virtualizer.getTotalSize(),
            width: "100%",
            position: "relative",
          }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const problem = problems[virtualRow.index];
            if (problem === undefined) return null;

            return (
              <Box
                key={problem.slug}
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translate3d(0, ${virtualRow.start}px, 0)`,
                }}
              >
                <QuestionPreviewRow
                  problem={problem}
                  showDivider={virtualRow.index < problems.length - 1}
                />
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
