import { Box, type SxProps, type Theme } from "@mui/material";
import type { ReactNode, RefObject } from "react";
import { useFluentScroll } from "@/hooks/useFluentScroll";

/** Fills the main outlet without page-level scroll (inner regions scroll instead). */
export function FixedPageShell({
  children,
  sx,
}: {
  children: ReactNode;
  sx?: SxProps<Theme>;
}) {
  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        px: { xs: 1.5, sm: 2 },
        py: { xs: 1.25, sm: 1.5 },
        fontSize: "0.875rem",
        width: "100%",
        maxWidth: "100%",
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

/** Scrollable sub-region inside a fixed page shell. */
export function ScrollRegion({
  children,
  sx,
  pageClass,
  scrollRef: scrollRefProp,
}: {
  children: ReactNode;
  sx?: SxProps<Theme>;
  /** e.g. FLUENT_PAGE.today — enables scroll perf helpers */
  pageClass?: string;
  /** Expose the scroll root for virtualized lists / infinite scroll on the same container */
  scrollRef?: RefObject<HTMLDivElement | null>;
}) {
  const scrollRef = useFluentScroll(scrollRefProp);
  const className = ["app-scroll", pageClass].filter(Boolean).join(" ");

  return (
    <Box
      ref={scrollRef}
      className={className}
      sx={{
        flex: 1,
        minHeight: 0,
        overflow: "auto",
        overflowX: "hidden",
        WebkitOverflowScrolling: "touch",
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
