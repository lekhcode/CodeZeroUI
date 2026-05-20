import { Box, Typography } from "@mui/material";
import PsychologyRoundedIcon from "@mui/icons-material/PsychologyRounded";
import { Link as RouterLink } from "react-router-dom";
import type { BrainCacheRevisionTask } from "@/types/brainCache.types";
import {
  problemListDividerSx,
  problemListLinkRowSx,
  problemListMetaSx,
  problemListTitleSx,
  problemListTokens,
} from "@/theme/problemList";
import { miui } from "@/theme/theme";

type BrainCacheCompactRevisionRowProps = {
  task: BrainCacheRevisionTask;
  isLast?: boolean;
};

export function BrainCacheCompactRevisionRow({
  task,
  isLast = false,
}: BrainCacheCompactRevisionRowProps) {
  return (
    <Box
      component={RouterLink}
      to={`/problems/${task.problem.slug}`}
      sx={problemListLinkRowSx({
        display: "flex",
        alignItems: "center",
        gap: problemListTokens.rowGap,
        px: problemListTokens.rowPx,
        py: problemListTokens.rowPy,
        minHeight: problemListTokens.rowMinHeight,
        ...problemListDividerSx(!isLast),
      })}
    >
      <PsychologyRoundedIcon sx={{ fontSize: 16, color: miui.primary, flexShrink: 0, opacity: 0.85 }} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography noWrap sx={problemListTitleSx()}>
          {task.problem.title}
        </Typography>
        <Typography noWrap sx={problemListMetaSx({ display: "block", mt: 0.2 })}>
          {task.playlistName}
        </Typography>
      </Box>
      <Typography sx={problemListMetaSx({ color: task.status === "OVERDUE" ? miui.danger : miui.textMuted })}>
        Revise
      </Typography>
    </Box>
  );
}
