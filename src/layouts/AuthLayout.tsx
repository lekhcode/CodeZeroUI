import { Box, Container } from "@mui/material";
import { Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { CodeZeroBrandLink } from "@/components/brand/CodeZeroBrandLink";
import { AppCopyright } from "@/components/layout/AppCopyright";
import { miui } from "@/theme/theme";

export function AuthLayout() {
  const location = useLocation();
  const isOAuthOnboard = location.pathname === "/register/oauth/complete";

  if (isOAuthOnboard) {
    return <Outlet />;
  }

  return (
    <Box
      className="auth-shell--compact"
      sx={{
        minHeight: "100vh",
        bgcolor: miui.bg,
      }}
    >
      <Container maxWidth={false} disableGutters sx={{ width: "100%", px: 0 }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
          <Box className="auth-panel">
            <Box className="auth-panel__brand">
              <CodeZeroBrandLink size={40} />
            </Box>
            <Outlet />
          </Box>
        </motion.div>
        <Box sx={{ mt: 2, px: 2 }}>
          <AppCopyright align="center" />
        </Box>
      </Container>
    </Box>
  );
}
