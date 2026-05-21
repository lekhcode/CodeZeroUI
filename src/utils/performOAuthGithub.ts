import { ApiRequestError } from "@/services/api";
import { authService } from "@/services/auth.service";
import type { OAuthAuthResult } from "@/types/api.types";
import type { OAuthIntent } from "@/utils/oauthFlow";

/**
 * GitHub OAuth: login intent falls through to register (onboarding) when no account exists.
 */
export async function performOAuthGithubExchange(
  code: string,
  redirectUri: string,
  intent: OAuthIntent,
): Promise<OAuthAuthResult> {
  try {
    return await authService.githubExchange(code, redirectUri, intent);
  } catch (err) {
    if (
      intent === "login" &&
      err instanceof ApiRequestError &&
      err.code === "OAUTH_ACCOUNT_NOT_FOUND"
    ) {
      return authService.githubExchange(code, redirectUri, "register");
    }
    throw err;
  }
}
