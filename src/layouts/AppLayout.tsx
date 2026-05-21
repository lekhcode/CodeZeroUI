import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { PageTransition } from "@/components/ui/PageTransition";
import { RouteLoadingOverlay } from "@/components/ui/RouteLoadingOverlay";
import { RouteLoadingProvider, useRouteLoading } from "@/contexts/RouteLoadingContext";
import { miui } from "@/theme/theme";
import { OnboardingProvider } from "@/onboarding/OnboardingProvider";

function MainOutlet() {
  const loading = useRouteLoading();

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        opacity: loading ? 0 : 1,
        transition: "opacity 0.12s ease",
      }}
    >
      <PageTransition>
        <Outlet />
      </PageTransition>
    </Box>
  );
}

/** Shell for authenticated routes — sidebar + topbar + route loader + outlet. */
export function AppLayout() {
  return (
    <RouteLoadingProvider>
      <OnboardingProvider>
        <Box sx={{ display: "flex", height: "100dvh", maxHeight: "100dvh", overflow: "hidden", bgcolor: miui.bg }}>
          <Sidebar />
          <Box
            component="main"
            sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, position: "relative", zIndex: 1 }}
          >
            <Topbar />
            <Box
              sx={{
                flex: 1,
                bgcolor: miui.bg,
                minHeight: 0,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                position: "relative",
              }}
            >
              <RouteLoadingOverlay />
              <MainOutlet />
            </Box>
          </Box>
        </Box>
      </OnboardingProvider>
    </RouteLoadingProvider>
  );
}
