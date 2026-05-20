import { Box, Fade, LinearProgress } from "@mui/material";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { useRouteLoading } from "@/contexts/RouteLoadingContext";
import { miui } from "@/theme/theme";

/** Covers the main outlet while route queries load — avoids empty layout + double fade flashes. */
export function RouteLoadingOverlay() {
  const loading = useRouteLoading();

  return (
    <>
      <Fade in={loading} unmountOnExit>
        <LinearProgress
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 12,
            height: 2,
          }}
        />
      </Fade>
      <Fade in={loading} unmountOnExit>
        <Box
          aria-busy
          aria-label="Loading page"
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 11,
            bgcolor: miui.bg,
            display: "flex",
            flexDirection: "column",
            px: { xs: 1.5, sm: 2 },
            py: { xs: 1.25, sm: 1.75 },
            pointerEvents: "none",
          }}
        >
          <Box className="skeleton skeleton-title" sx={{ width: "40%", maxWidth: 280, mb: 2 }} />
          <LoadingSkeleton variant="detail" />
        </Box>
      </Fade>
    </>
  );
}
