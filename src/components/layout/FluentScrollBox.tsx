import { Box, type BoxProps } from "@mui/material";
import { useFluentScroll } from "@/hooks/useFluentScroll";

type FluentScrollBoxProps = BoxProps & {
  pageClass: string;
};

/** Scroll region with fluent-scroll pause helpers (community feed, submissions table, etc.). */
export function FluentScrollBox({ pageClass, className, children, sx, ...props }: FluentScrollBoxProps) {
  const scrollRef = useFluentScroll<HTMLDivElement>();
  const mergedClass = ["app-scroll", pageClass, className].filter(Boolean).join(" ");

  return (
    <Box ref={scrollRef} className={mergedClass} sx={sx} {...props}>
      {children}
    </Box>
  );
}
