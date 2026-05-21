import { create } from "zustand";
import { ONBOARDING_STEPS } from "@/onboarding/onboardingSteps";

type OnboardingState = {
  active: boolean;
  replay: boolean;
  stepIndex: number;
  start: (opts?: { replay?: boolean }) => void;
  end: () => void;
  next: () => void;
  back: () => void;
  goTo: (index: number) => void;
};

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  active: false,
  replay: false,
  stepIndex: 0,
  start: (opts) =>
    set({
      active: true,
      replay: Boolean(opts?.replay),
      stepIndex: 0,
    }),
  end: () =>
    set({
      active: false,
      replay: false,
      stepIndex: 0,
    }),
  next: () => {
    const { stepIndex } = get();
    const max = ONBOARDING_STEPS.length - 1;
    if (stepIndex >= max) {
      set({ active: false, replay: false, stepIndex: 0 });
      return;
    }
    set({ stepIndex: stepIndex + 1 });
  },
  back: () => {
    const { stepIndex } = get();
    if (stepIndex <= 0) return;
    set({ stepIndex: stepIndex - 1 });
  },
  goTo: (index) => {
    const max = ONBOARDING_STEPS.length - 1;
    set({ stepIndex: Math.max(0, Math.min(index, max)) });
  },
}));
