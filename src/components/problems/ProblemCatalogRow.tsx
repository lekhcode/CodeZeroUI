import { memo } from "react";
import { Box, Typography } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { Link as RouterLink } from "react-router-dom";
import type { ProblemCatalogItem } from "@/types/api.types";
import { ProblemSolvedIndicator } from "@/components/problems/ProblemSolvedIndicator";
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
import { miui } from "@/theme/theme";

export const ROW_HEIGHT = {
  compact: PROBLEM_LIST_ROW_HEIGHT,
  full: PROBLEM_LIST_ROW_HEIGHT,
} as const;

type ProblemCatalogRowProps = {
  row: ProblemCatalogItem;
  compact: boolean;
  index: number;
  gridColumns: string;
  /** @deprecated Style is unified; kept for call-site compat */
  flat?: boolean;
  showDivider?: boolean;
};

export const ProblemCatalogRow = memo(function ProblemCatalogRow({
  row,
  compact,
  index: _index,
  gridColumns,
  showDivider = true,
}: ProblemCatalogRowProps) {
  return (
    <Box sx={problemListDividerSx(showDivider)}>
      <Box
        component={RouterLink}
        to={`/problems/${row.slug}`}
        className="problem-row"
        sx={problemListLinkRowSx({
          display: "grid",
          gridTemplateColumns: gridColumns,
          alignItems: "center",
          gap: problemListTokens.rowGap,
          px: problemListTokens.rowPx,
          py: problemListTokens.rowPy,
          minHeight: PROBLEM_LIST_ROW_HEIGHT,
          boxSizing: "border-box",
          position: "relative",
        })}
      >
        <Typography sx={problemListIndexSx()}>{row.leetcodeId}</Typography>

        <ProblemSolvedIndicator solved={row.solved} />

        <Box sx={{ minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, minWidth: 0 }}>
            <Typography className="catalog-title" sx={problemListTitleSx()}>
              {row.title}
            </Typography>
            {row.isPremium ? (
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.25,
                  flexShrink: 0,
                  color: miui.caution,
                  fontSize: problemListTokens.metaSize,
                  fontWeight: problemListTokens.metaWeight,
                }}
              >
                <LockOutlinedIcon sx={{ fontSize: 12 }} />
                <Typography component="span" sx={{ fontSize: "inherit", fontWeight: "inherit" }}>
                  Pro
                </Typography>
              </Box>
            ) : null}
          </Box>
          {compact && row.topics.length > 0 ? (
            <Typography noWrap sx={problemListMetaSx({ display: "block", mt: 0.25 })}>
              {row.topics.slice(0, 3).join(" · ")}
            </Typography>
          ) : null}
        </Box>

        <Box sx={{ justifySelf: "end" }}>
          <DifficultyIndicator difficulty={row.difficulty} />
        </Box>

        {!compact ? (
          <Typography
            noWrap
            sx={problemListMetaSx({
              minWidth: 0,
              display: { xs: "none", md: "block" },
            })}
          >
            {row.topics.slice(0, 3).join(" · ") || "—"}
          </Typography>
        ) : null}

        <span />
      </Box>
    </Box>
  );
});

export function gridColumns(compact: boolean): string {
  return compact
    ? "52px 22px minmax(0, 1fr) 72px 20px"
    : "52px 22px minmax(0, 1fr) 72px minmax(100px, 1.2fr) 20px";
}
