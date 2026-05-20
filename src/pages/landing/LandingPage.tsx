import { useEffect } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import ForumRoundedIcon from "@mui/icons-material/ForumRounded";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import { CodeZeroLogo } from "@/components/brand/CodeZeroLogo";
import { AppCopyright } from "@/components/layout/AppCopyright";
import { AmbientBackground } from "@/components/ui/AmbientBackground";
import { AUTH_HOME, ROUTES } from "@/constants/routes";
import { useAuthStore } from "@/store/authStore";
import { tokenStorage } from "@/utils/storage";
import heroImg from "@/assets/hero.png";
import { dotGridHeroSx, glassSx, miui } from "@/theme/theme";

/**
 * Public home — guests stay here; verified sessions skip to the app home (community).
 */
export function LandingPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasToken = Boolean(tokenStorage.get());

  useEffect(() => {
    if ((hasToken || isAuthenticated) && user?.isEmailVerified) {
      navigate(AUTH_HOME, { replace: true });
    }
  }, [hasToken, isAuthenticated, user?.isEmailVerified, navigate]);

  if ((hasToken || isAuthenticated) && user?.isEmailVerified) {
    return null;
  }

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        bgcolor: miui.bg,
        color: miui.text,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <AmbientBackground />

      <Container maxWidth="lg" sx={{ flex: 1, py: { xs: 3, md: 5 }, position: "relative", zIndex: 1 }}>
        <Stack
          direction="row"
          sx={{ mb: { xs: 4, md: 6 }, alignItems: "center", justifyContent: "space-between" }}
        >
          <Box component={RouterLink} to={ROUTES.landing} sx={{ textDecoration: "none" }}>
            <CodeZeroLogo size={34} />
          </Box>
          <Button
            component={RouterLink}
            to={ROUTES.login}
            variant="outlined"
            size="small"
            startIcon={<LoginRoundedIcon />}
            sx={{ textTransform: "none", borderColor: miui.border, color: miui.text }}
          >
            Sign in
          </Button>
        </Stack>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: { xs: 4, md: 6 },
            alignItems: "center",
          }}
        >
          <Box>
            <Typography
              component="p"
              sx={{
                fontSize: "0.75rem",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: miui.brandOrange,
                mb: 1.5,
              }}
            >
              Your personal coding gym
            </Typography>
            <Typography
              component="h1"
              sx={{
                fontFamily: '"Space Grotesk", sans-serif',
                fontWeight: 700,
                fontSize: { xs: "2.25rem", sm: "3rem" },
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
                mb: 2,
              }}
            >
              Train harder.
              <br />
              <Box component="span" sx={{ color: miui.brandOrange }}>
                Think sharper.
              </Box>
            </Typography>
            <Typography variant="body1" sx={{ color: miui.textMuted, maxWidth: 480, mb: 3, lineHeight: 1.65 }}>
              DSA practice with spaced revision, streak tracking, and a community where builders share
              what they learn.
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <Button
                component={RouterLink}
                to={ROUTES.community}
                variant="contained"
                size="large"
                startIcon={<ForumRoundedIcon />}
                className="solve-btn btn-primary"
                sx={{ textTransform: "none", fontWeight: 600 }}
              >
                Open community
              </Button>
              <Button
                component={RouterLink}
                to={ROUTES.login}
                variant="outlined"
                size="large"
                sx={{ textTransform: "none", borderColor: miui.border, color: miui.text }}
              >
                Start training
              </Button>
            </Stack>
          </Box>

          <Box
            sx={{
              ...dotGridHeroSx,
              ...glassSx,
              borderRadius: 4,
              p: 2,
              border: `1px solid ${miui.border}`,
              boxShadow: `0 24px 64px rgba(0,0,0,0.45)`,
            }}
          >
            <Box
              component="img"
              src={heroImg}
              alt="CodeZero practice dashboard preview"
              sx={{ width: "100%", height: "auto", borderRadius: 2.5, display: "block" }}
            />
          </Box>
        </Box>
      </Container>

      <Box sx={{ py: 2, position: "relative", zIndex: 1 }}>
        <AppCopyright align="center" />
      </Box>
    </Box>
  );
}
