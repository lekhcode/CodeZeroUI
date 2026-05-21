import type { NavigateFunction } from "react-router-dom";
import { isOAuthPendingRegistration, type OAuthAuthResult } from "@/types/api.types";
import { storeOAuthPending, clearOAuthIntent } from "@/utils/oauthFlow";
import type { useAuthStore } from "@/store/authStore";

type SetSession = ReturnType<typeof useAuthStore.getState>["setSession"];

export function applyOAuthAuthResult(
  result: OAuthAuthResult,
  navigate: NavigateFunction,
  setSession: SetSession,
): void {
  clearOAuthIntent();

  if (isOAuthPendingRegistration(result)) {
    storeOAuthPending(result.pendingToken, {
      email: result.email,
      suggestedName: result.suggestedName,
      avatar: result.avatar,
      provider: result.provider,
    });
    navigate("/register/oauth/complete", { replace: true });
    return;
  }

  setSession(result.user, result.accessToken);
  navigate("/community", { replace: true });
}
