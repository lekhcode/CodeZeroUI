import { createContext, useContext, type ReactNode } from "react";
import { useRouteTransitionLoading } from "@/hooks/useRouteTransitionLoading";

const RouteLoadingContext = createContext(false);

export function RouteLoadingProvider({ children }: { children: ReactNode }) {
  const isRouteLoading = useRouteTransitionLoading();
  return (
    <RouteLoadingContext.Provider value={isRouteLoading}>{children}</RouteLoadingContext.Provider>
  );
}

export function useRouteLoading(): boolean {
  return useContext(RouteLoadingContext);
}
