import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { useMe } from "@/hooks/useAuth";
import { queryKeys } from "@/hooks/queryKeys";
import { useOnboardingStore } from "@/onboarding/onboardingStore";
import { tokenStorage } from "@/utils/storage";

const EXPLORE_ROUTE = "/templates";

/**
 * Starts the first-run walkthrough when the server profile has `firstTimeLogin: true`.
 * Waits for a fresh `/users/me` refetch so stale persisted auth cannot suppress the tour.
 */
export function useOnboardingAutoStart() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const authUser = useAuthStore((s) => s.user);
  const active = useOnboardingStore((s) => s.active);
  const replay = useOnboardingStore((s) => s.replay);
  const start = useOnboardingStore((s) => s.start);

  const hasToken = Boolean(tokenStorage.get());
  const { data: me, isFetched, isFetching } = useMe(hasToken);

  useEffect(() => {
    if (!hasToken) return;
    void queryClient.refetchQueries({ queryKey: queryKeys.me });
  }, [hasToken, queryClient]);

  useEffect(() => {
    if (!hasToken || !isFetched || isFetching) return;

    const profile = me ?? authUser;
    if (!profile || profile.firstTimeLogin !== true) return;
    if (replay || active) return;

    start({ replay: false });

    if (location.pathname !== EXPLORE_ROUTE) {
      navigate(EXPLORE_ROUTE, { replace: true });
    }
  }, [
    hasToken,
    isFetched,
    isFetching,
    me,
    authUser,
    me?.id,
    me?.firstTimeLogin,
    authUser?.id,
    authUser?.firstTimeLogin,
    replay,
    active,
    start,
    navigate,
    location.pathname,
  ]);
}
