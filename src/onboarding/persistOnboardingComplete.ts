import type { QueryClient } from "@tanstack/react-query";
import type { PublicUser } from "@/types/api.types";
import { queryKeys } from "@/hooks/queryKeys";
import { useAuthStore } from "@/store/authStore";
import { usersService } from "@/services/users.service";
import { normalizePublicUser } from "@/utils/publicUser";

/**
 * Skip / Finish — persist `firstTimeLogin: false` on the server and sync client caches.
 */
export async function persistOnboardingComplete(queryClient: QueryClient): Promise<PublicUser> {
  const current = useAuthStore.getState().user;
  if (!current) {
    throw new Error("Not signed in");
  }

  const previousMe = queryClient.getQueryData<PublicUser>(queryKeys.me);
  const optimistic = normalizePublicUser({ ...current, firstTimeLogin: false });

  useAuthStore.getState().setUser(optimistic);
  queryClient.setQueryData<PublicUser>(queryKeys.me, optimistic);

  try {
    const { user } = await usersService.dismissFirstTimeLogin();
    const updated = normalizePublicUser(user);

    useAuthStore.getState().setUser(updated);
    queryClient.setQueryData<PublicUser>(queryKeys.me, updated);

    return updated;
  } catch (error) {
    useAuthStore.getState().setUser(current);
    if (previousMe !== undefined) {
      queryClient.setQueryData<PublicUser>(queryKeys.me, previousMe);
    } else {
      queryClient.removeQueries({ queryKey: queryKeys.me });
    }
    throw error;
  }
}
