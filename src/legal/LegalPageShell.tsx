import { useEffect } from "react";
import { Box, Link, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { CodeZeroBrandLink } from "@/components/brand/CodeZeroBrandLink";
import { AppLegalFooter } from "@/components/layout/AppLegalFooter";
import { LegalDocument } from "@/legal/LegalDocument";
import { LEGAL_LAST_UPDATED, LEGAL_NAV_LINKS } from "@/legal/constants";
import type { LegalPageMeta } from "@/legal/types";
import { miui } from "@/theme/theme";

type LegalPageShellProps = {
  meta: LegalPageMeta;
};

export function LegalPageShell({ meta }: LegalPageShellProps) {
  useEffect(() => {
    const previous = document.title;
    document.title = `${meta.title} · CodeZero`;
    return () => {
      document.title = previous;
    };
  }, [meta.title]);

  return (
    <Box className="legal-page app-scroll">
      <header className="legal-page__header">
        <Box className="legal-page__header-inner">
          <CodeZeroBrandLink size={32} compact to="/login" />
          <nav className="legal-page__nav" aria-label="Legal pages">
            {LEGAL_NAV_LINKS.map((item) => (
              <Link
                key={item.to}
                component={RouterLink}
                to={item.to}
                className="legal-page__nav-link"
                sx={{
                  color: miui.textDim,
                  textDecoration: "none",
                  fontSize: "0.75rem",
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.03em",
                  "&:hover": { color: miui.text },
                }}
              >
                {item.label}
              </Link>
            ))}
            <Link
              component={RouterLink}
              to="/login"
              className="legal-page__nav-link"
              sx={{
                color: miui.textDim,
                textDecoration: "none",
                fontSize: "0.75rem",
                fontFamily: "var(--font-mono)",
                "&:hover": { color: miui.text },
              }}
            >
              Sign in
            </Link>
          </nav>
        </Box>
      </header>

      <Box component="main" className="legal-page__main">
        <article className="legal-page__article">
          <Typography component="p" className="legal-page__eyebrow">
            CodeZero · LoopCode
          </Typography>
          <Typography component="h1" className="legal-page__title">
            {meta.title}
          </Typography>
          <Typography component="p" className="legal-page__description">
            {meta.description}
          </Typography>
          <Typography component="p" className="legal-page__updated">
            Last updated {LEGAL_LAST_UPDATED}
          </Typography>

          <Box className="legal-page__divider" aria-hidden />

          <LegalDocument sections={meta.sections} />

          <Box className="legal-page__related">
            <Typography component="p" className="legal-page__related-label">
              Related
            </Typography>
            <Box className="legal-page__related-links">
              {LEGAL_NAV_LINKS.map((item) => (
                <Link
                  key={item.to}
                  component={RouterLink}
                  to={item.to}
                  className="legal-page__related-link"
                >
                  {item.label}
                </Link>
              ))}
            </Box>
          </Box>
        </article>
      </Box>

      <footer className="legal-page__footer">
        <AppLegalFooter variant="full" />
      </footer>
    </Box>
  );
}
