import { Box, Link, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import {
  COPYRIGHT_YEAR,
  CREATOR_NAME,
  LEGAL_NAV_LINKS,
  ORGANIZATION_NAME,
  PLATFORM_NAME,
} from "@/legal/constants";
import { miui } from "@/theme/theme";

type AppLegalFooterProps = {
  /** full = legal page footer; inline = auth/login; compact = sidebar */
  variant?: "full" | "inline" | "compact";
  align?: "left" | "center";
  /** Sidebar icon-only — hide links, show © with tooltip */
  collapsed?: boolean;
};

export function AppLegalFooter({
  variant = "inline",
  align = "center",
  collapsed = false,
}: AppLegalFooterProps) {
  const metaAlign = align === "center" ? "app-legal-footer__meta--center" : "";
  const ownershipLine = `© ${COPYRIGHT_YEAR} ${ORGANIZATION_NAME} · Created by ${CREATOR_NAME}`;
  const collapsedTitle = `${PLATFORM_NAME} — ${ownershipLine}. Privacy, Terms, Security, License.`;

  if (collapsed) {
    return (
      <Typography
        component="p"
        title={collapsedTitle}
        sx={{
          m: 0,
          textAlign: "center",
          fontSize: "0.5625rem",
          color: miui.textDim,
          fontFamily: "var(--font-mono)",
        }}
      >
        ©
      </Typography>
    );
  }

  return (
    <Box
      className={`app-legal-footer app-legal-footer--${variant}`}
      sx={variant === "full" ? { maxWidth: 720, mx: "auto", width: "100%" } : undefined}
    >
      <nav className="app-legal-footer__links" aria-label="Legal">
        {LEGAL_NAV_LINKS.map((item) => (
          <Link
            key={item.to}
            component={RouterLink}
            to={item.to}
            className="app-legal-footer__link"
            sx={{
              color: miui.textDim,
              "&:hover": { color: miui.text },
            }}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <Typography
        component="p"
        className={`app-legal-footer__meta ${metaAlign}`}
        sx={{
          m: 0,
          textAlign: align,
          fontSize: variant === "compact" ? "0.5625rem" : "0.6875rem",
          lineHeight: 1.45,
          color: miui.textDim,
          fontFamily: "var(--font-mono)",
          letterSpacing: "0.02em",
        }}
      >
        {ownershipLine}
      </Typography>
    </Box>
  );
}
