/** Platform legal metadata — single source for pages, footer, and README references. */

export const PLATFORM_NAME = "CodeZero";
export const ORGANIZATION_NAME = "LoopCode";
export const CREATOR_NAME = "Lekh Ray";
export const COPYRIGHT_YEAR = 2026;
export const CONTACT_EMAIL = "whiletrue.codes@gmail.com";
export const CONTACT_MAILTO = `mailto:${CONTACT_EMAIL}`;

export const LEGAL_LAST_UPDATED = "May 22, 2026";

export const LEGAL_ROUTES = {
  privacy: "/privacy",
  terms: "/terms",
  security: "/security",
  legal: "/legal",
} as const;

export const LEGAL_NAV_LINKS = [
  { label: "Privacy", to: LEGAL_ROUTES.privacy },
  { label: "Terms", to: LEGAL_ROUTES.terms },
  { label: "Security", to: LEGAL_ROUTES.security },
  { label: "License", to: LEGAL_ROUTES.legal },
] as const;
