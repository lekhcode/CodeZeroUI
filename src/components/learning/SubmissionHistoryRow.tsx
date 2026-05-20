import { memo } from "react";
import { Box, Typography, alpha } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { SubmissionListItem, SubmissionStatus } from "@/types/api.types";
import {
  problemListDividerSx,
  problemListLinkRowSx,
  problemListMetaSx,
  problemListTitleSx,
  problemListTokens,
} from "@/theme/problemList";
import { sectionInsetX } from "@/theme/theme";

dayjs.extend(relativeTime);

const VERDICT_COLOR: Record<SubmissionStatus, string> = {
  ACCEPTED: "#10b981",
  WRONG_ANSWER: "#ef4444",
  RUNTIME_ERROR: "#f59e0b",
  COMPILATION_ERROR: "#8b5cf6",
  TIME_LIMIT_EXCEEDED: "#f97316",
  INTERNAL_ERROR: "#94a3b8",
  QUEUED: "#94a3b8",
  RUNNING: "#0ea5e9",
};

const VERDICT_SHORT: Record<SubmissionStatus, string> = {
  ACCEPTED: "AC",
  WRONG_ANSWER: "WA",
  RUNTIME_ERROR: "RE",
  COMPILATION_ERROR: "CE",
  TIME_LIMIT_EXCEEDED: "TLE",
  INTERNAL_ERROR: "ERR",
  QUEUED: "…",
  RUNNING: "…",
};

type SubmissionHistoryRowProps = {
  submission: SubmissionListItem;
  isLast?: boolean;
};

export const SubmissionHistoryRow = memo(function SubmissionHistoryRow({
  submission,
  isLast = false,
}: SubmissionHistoryRowProps) {
  const color = VERDICT_COLOR[submission.status];
  const runtime =
    submission.runtimeMs !== null ? `${submission.runtimeMs}ms` : null;
  const meta = [submission.language, runtime].filter(Boolean).join(" · ");
  const when = dayjs(submission.createdAt);
  const timeLabel = when.isAfter(dayjs().subtract(7, "day"))
    ? when.fromNow()
    : when.format("MMM D, HH:mm");

  return (
    <Box
      component={RouterLink}
      to={`/problems/${submission.problem.slug}`}
      className="submission-row"
      sx={problemListLinkRowSx({
        display: "flex",
        alignItems: "center",
        gap: problemListTokens.rowGap,
        px: sectionInsetX,
        py: problemListTokens.rowPy,
        minHeight: problemListTokens.rowMinHeight,
        ...problemListDividerSx(!isLast),
      })}
    >
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          bgcolor: color,
          flexShrink: 0,
          boxShadow: submission.status === "ACCEPTED" ? `0 0 8px ${alpha(color, 0.5)}` : "none",
        }}
      />

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography noWrap sx={problemListTitleSx()}>
          {submission.problem.title}
        </Typography>
        <Typography
          noWrap
          sx={problemListMetaSx({
            display: "block",
          })}
        >
          {meta}
        </Typography>
      </Box>

      <Box sx={{ textAlign: "right", flexShrink: 0, pr: 0.25 }}>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 500,
            color,
            fontSize: "0.68rem",
            letterSpacing: "0.04em",
            display: "block",
          }}
        >
          {VERDICT_SHORT[submission.status]}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem" }}>
          {timeLabel}
        </Typography>
      </Box>

      <ChevronRightRoundedIcon sx={{ fontSize: 18, color: alpha("#0f172a", 0.25), flexShrink: 0 }} />
    </Box>
  );
});
