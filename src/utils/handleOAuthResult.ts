import type { NavigateFunction } from "react-router-dom";
import { isOAuthPendingRegistration, type OAuthAuthResult } from "@/types/api.types";
import { storeOAuthPending, clearOAuthIntent } from "@/utils/oauthFlow";
import type { useAuthStore } from "@/store/authStore";
import { queryClient } from "@/lib/queryClient";
import { queryKeys } from "@/hooks/queryKeys";
import { normalizePublicUser } from "@/utils/publicUser";

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

  const user = normalizePublicUser(result.user);
  queryClient.removeQueries({ queryKey: queryKeys.me });
  setSession(user, result.accessToken);
  queryClient.setQueryData(queryKeys.me, user);
  navigate("/community", { replace: true });
}
