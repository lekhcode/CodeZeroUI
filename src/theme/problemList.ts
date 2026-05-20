import type { SxProps, Theme } from "@mui/material";
import { miui } from "@/theme/theme";

/** Shared row height for virtualized catalog + preview lists. */
export const PROBLEM_LIST_ROW_HEIGHT = 52;

/** Global problem listing typography + spacing (GitHub / Linear style). */
export const problemListTokens = {
  rowPx: 1.5,
  rowPy: 1.1,
  rowGap: 1.25,
  rowMinHeight: PROBLEM_LIST_ROW_HEIGHT,
  titleSize: "0.8125rem",
  titleWeight: 500,
  titleLineHeight: 1.35,
  metaSize: "0.6875rem",
  metaWeight: 400,
  indexSize: "0.6875rem",
  indexWeight: 500,
  headerSize: "0.6875rem",
  headerWeight: 500,
  headerLetterSpacing: "0.05em",
  hoverBg: "rgba(255, 255, 255, 0.04)",
  hoverTransition: "background-color 120ms ease",
} as const;

export const problemListRowHoverSx = {
  bgcolor: problemListTokens.hoverBg,
} as const;

export function problemListDividerSx(show: boolean): SxProps<Theme> {
  return {
    borderBottom: show ? `1px solid ${miui.border}` : "none",
    bgcolor: "transparent",
  };
}

export function problemListTitleSx(extra?: SxProps<Theme>): SxProps<Theme> {
  return {
    fontSize: problemListTokens.titleSize,
    fontWeight: problemListTokens.titleWeight,
    lineHeight: problemListTokens.titleLineHeight,
    color: miui.text,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    ...extra,
  };
}

export function problemListMetaSx(extra?: SxProps<Theme>): SxProps<Theme> {
  return {
    fontSize: problemListTokens.metaSize,
    fontWeight: problemListTokens.metaWeight,
    color: miui.textDim,
    lineHeight: 1.3,
    ...extra,
  };
}

export function problemListIndexSx(extra?: SxProps<Theme>): SxProps<Theme> {
  return {
    fontFamily: "var(--font-number)",
    fontSize: problemListTokens.indexSize,
    fontWeight: problemListTokens.indexWeight,
    color: miui.textDim,
    fontVariantNumeric: "tabular-nums",
    ...extra,
  };
}

export function problemListHeaderCellSx(align: "left" | "right" = "left"): SxProps<Theme> {
  return {
    fontWeight: problemListTokens.headerWeight,
    letterSpacing: problemListTokens.headerLetterSpacing,
    textTransform: "uppercase",
    color: miui.textDim,
    fontSize: problemListTokens.headerSize,
    textAlign: align,
  };
}

/** Link row shell — background tint only, no transform / scale. */
export function problemListLinkRowSx(extra?: SxProps<Theme>): SxProps<Theme> {
  return {
    textDecoration: "none",
    color: "inherit",
    bgcolor: "transparent",
    transition: problemListTokens.hoverTransition,
    "@media (prefers-reduced-motion: no-preference)": {
      "&:hover": problemListRowHoverSx,
    },
    ...extra,
  };
}

export function problemListHeaderRowSx(gridColumns: string): SxProps<Theme> {
  return {
    display: "grid",
    gridTemplateColumns: gridColumns,
    alignItems: "center",
    gap: problemListTokens.rowGap,
    px: problemListTokens.rowPx,
    py: 0.75,
    bgcolor: "transparent",
    borderBottom: `1px solid ${miui.border}`,
    position: "sticky",
    top: 0,
    zIndex: 2,
  };
}
