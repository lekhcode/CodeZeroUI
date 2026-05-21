import type { PublicUser } from "@/types/api.types";

/** Parse API user — normalizes `firstTimeLogin` from `/users/me` and auth responses. */
export function parsePublicUser(raw: PublicUser): PublicUser {
  const value = (raw as { firstTimeLogin?: unknown }).firstTimeLogin;
  const firstTimeLogin = value === true || value === "true" || value === 1;

  return {
    ...raw,
    firstTimeLogin,
  };
}

export function normalizePublicUser(user: PublicUser): PublicUser {
  return parsePublicUser(user);
}
