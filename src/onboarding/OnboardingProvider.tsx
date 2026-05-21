import { useNavigate } from "react-router-dom";
import { useOnboardingStore } from "@/onboarding/onboardingStore";
import { OnboardingWalkthrough } from "@/onboarding/OnboardingWalkthrough";
import { useOnboardingAutoStart } from "@/onboarding/useOnboardingAutoStart";

/**
 * App shell wrapper — mounts walkthrough UI and auto-starts from `firstTimeLogin` on `/users/me`.
 */
export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  useOnboardingAutoStart();

  return (
    <>
      {children}
      <OnboardingWalkthrough />
    </>
  );
}

/** Manual replay from Settings — does not change `firstTimeLogin` on the server. */
export function useReplayOnboarding() {
  const navigate = useNavigate();
  const start = useOnboardingStore((s) => s.start);

  return () => {
    start({ replay: true });
    navigate("/templates");
  };
}
