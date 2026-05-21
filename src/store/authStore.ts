import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PublicUser } from "@/types/api.types";
import { normalizePublicUser } from "@/utils/publicUser";
import { tokenStorage } from "@/utils/storage";

type AuthState = {
  user: PublicUser | null;
  isAuthenticated: boolean;
  setSession: (user: PublicUser, token: string) => void;
  setUser: (user: PublicUser) => void;
  logout: () => void;
};

/**
 * Client session state — JWT in localStorage, user profile in persisted Zustand.
 * React Query owns server data; this store only holds auth identity for routing/guards.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setSession: (user, token) => {
        tokenStorage.set(token);
        set({ user: normalizePublicUser(user), isAuthenticated: true });
      },
      setUser: (user) => set({ user: normalizePublicUser(user), isAuthenticated: true }),
      logout: () => {
        tokenStorage.clear();
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: "codezero-auth",
      version: 2,
      migrate: (persisted) => {
        const state = persisted as AuthState | undefined;
        if (!state?.user) return state as AuthState;
        const legacy = state.user as PublicUser & { onboardingCompleted?: boolean };
        const firstTimeLogin =
          typeof legacy.firstTimeLogin === "boolean"
            ? legacy.firstTimeLogin
            : legacy.onboardingCompleted === true
              ? false
              : true;
        return {
          ...state,
          user: { ...state.user, firstTimeLogin },
        };
      },
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    },
  ),
);
