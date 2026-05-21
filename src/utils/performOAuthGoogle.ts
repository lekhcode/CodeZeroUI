import { ApiRequestError } from "@/services/api";
import { authService } from "@/services/auth.service";
import type { OAuthAuthResult } from "@/types/api.types";
import type { OAuthIntent } from "@/utils/oauthFlow";

/**
 * Google OAuth: login intent falls through to register (onboarding) when no account exists.
 */
export async function performOAuthGoogleAuth(
  credential: string,
  intent: OAuthIntent,
): Promise<OAuthAuthResult> {
  try {
    return await authService.googleAuth(credential, intent);
  } catch (err) {
    if (
      intent === "login" &&
      err instanceof ApiRequestError &&
      err.code === "OAUTH_ACCOUNT_NOT_FOUND"
    ) {
      return authService.googleAuth(credential, "register");
    }
    throw err;
  }
}
