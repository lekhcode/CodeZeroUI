import { GoogleOAuthProvider } from "@react-oauth/google";
import type { ReactNode } from "react";
import { googleClientId } from "@/config/oauth";

/** Wraps pages that render Google Sign-In (Login, Register). */
export function OAuthGoogleProvider({ children }: { children: ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={googleClientId || "placeholder.apps.googleusercontent.com"}>
      {children}
    </GoogleOAuthProvider>
  );
}
