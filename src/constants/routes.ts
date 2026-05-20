/** Public marketing entry and default post-auth home. */
export const ROUTES = {
  landing: "/",
  community: "/community",
  login: "/login",
} as const;

/** After sign-in, email verification, or OAuth — always land here. */
export const AUTH_HOME = ROUTES.community;
