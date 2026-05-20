import { memo } from "react";
import { Box, Typography } from "@mui/material";
import type { TemplatePreviewProblem } from "@/types/api.types";
import { DifficultyIndicator } from "@/modules/explore/topic-preview/DifficultyIndicator";
import {
  PROBLEM_LIST_ROW_HEIGHT,
  problemListDividerSx,
  problemListIndexSx,
  problemListLinkRowSx,
  problemListMetaSx,
  problemListTitleSx,
  problemListTokens,
} from "@/theme/problemList";

type QuestionPreviewRowProps = {
  problem: TemplatePreviewProblem;
  showDivider: boolean;
};

export const QuestionPreviewRow = memo(function QuestionPreviewRow({
  problem,
  showDivider,
}: QuestionPreviewRowProps) {
  return (
    <Box
      sx={problemListDividerSx(showDivider)}
    >
      <Box
        sx={problemListLinkRowSx({
          display: "flex",
          alignItems: "center",
          gap: problemListTokens.rowGap,
          px: problemListTokens.rowPx,
          py: problemListTokens.rowPy,
          minHeight: PROBLEM_LIST_ROW_HEIGHT,
          boxSizing: "border-box",
          cursor: "default",
          userSelect: "none",
        })}
      >
        <Typography sx={problemListIndexSx({ width: 26, textAlign: "right", flexShrink: 0 })}>
          {String(problem.order).padStart(2, "0")}
        </Typography>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography noWrap sx={problemListTitleSx()}>
            {problem.title}
          </Typography>
          <Typography noWrap sx={problemListMetaSx({ display: "block", mt: 0.2 })}>
            {problem.topics.slice(0, 2).join(" · ") || "Curated"}
            {problem.hasDetail ? " · Statement ready" : ""}
          </Typography>
        </Box>
        <DifficultyIndicator difficulty={problem.difficulty} />
      </Box>
    </Box>
  );
});
