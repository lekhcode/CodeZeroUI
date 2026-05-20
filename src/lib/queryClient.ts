import { QueryClient } from "@tanstack/react-query";

/**
 * Central React Query defaults — tuned for dashboard-style reads (stale-while-revalidate).
 * Mutations invalidate narrowly scoped keys in hooks to avoid global refetch storms.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: 1,
      /** Avoid refetch storms on tab focus; data stays fresh within staleTime. */
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      structuralSharing: true,
    },
    mutations: {
      retry: 0,
    },
  },
});
