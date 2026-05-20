import { Box } from "@mui/material";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { miui } from "@/theme/theme";

/** Minimal shell shown while lazy route chunks load — matches app chrome, no layout shift. */
export function LazyRouteFallback() {
  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        bgcolor: miui.bg,
        px: { xs: 1.5, sm: 2 },
        py: { xs: 1.25, sm: 1.75 },
      }}
    >
      <LoadingSkeleton variant="detail" />
    </Box>
  );
}
