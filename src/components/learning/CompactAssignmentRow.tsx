import { memo } from "react";
import { Box, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import type { TrackedAssignment } from "@/types/api.types";
import {
  problemListDividerSx,
  problemListLinkRowSx,
  problemListMetaSx,
  problemListTitleSx,
  problemListTokens,
} from "@/theme/problemList";
import { miui, monoStatSx } from "@/theme/theme";

type CompactAssignmentRowProps = {
  assignment: TrackedAssignment;
  isLast?: boolean;
  variant?: "default" | "overdue";
};

export const CompactAssignmentRow = memo(function CompactAssignmentRow({
  assignment,
  isLast = false,
  variant = "default",
}: CompactAssignmentRowProps) {
  const isOverdue = variant === "overdue";

  return (
    <Box
      component={RouterLink}
      to={`/problems/${assignment.problem.slug}`}
      sx={problemListLinkRowSx({
        display: "flex",
        alignItems: "center",
        gap: problemListTokens.rowGap,
        pl: 3,
        pr: problemListTokens.rowPx,
        py: problemListTokens.rowPy,
        minHeight: problemListTokens.rowMinHeight,
        ...problemListDividerSx(!isLast),
      })}
    >
      <Box
        sx={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          flexShrink: 0,
          bgcolor: isOverdue ? miui.danger : miui.borderStrong,
        }}
      />
      <Typography sx={{ ...problemListTitleSx(), flex: 1, minWidth: 0 }}>
        {assignment.problem.title}
      </Typography>

      {isOverdue ? (
        <>
          <Box
            sx={{
              ...monoStatSx,
              fontSize: problemListTokens.metaSize,
              fontWeight: problemListTokens.metaWeight,
              px: "6px",
              py: "1px",
              borderRadius: "3px",
              bgcolor: miui.dangerDim,
              border: `1px solid ${miui.dangerBorder}`,
              color: miui.danger,
              flexShrink: 0,
            }}
          >
            DUE
          </Box>
          <ArrowForwardRoundedIcon sx={{ fontSize: 14, color: miui.textDim, flexShrink: 0 }} />
        </>
      ) : (
        <Typography
          className="start-link"
          sx={problemListMetaSx({
            flexShrink: 0,
            color: miui.textMuted,
          })}
        >
          Start →
        </Typography>
      )}
    </Box>
  );
});
