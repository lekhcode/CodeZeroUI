export type OnboardingPlacement = "auto" | "right" | "bottom" | "center";

export type OnboardingStep = {
  id: string;
  route: string;
  /** Matches `data-onboarding` on a DOM node; omit for centered steps. */
  target?: string;
  title: string;
  body: string;
  kicker?: string;
  placement?: OnboardingPlacement;
  highlightPadding?: number;
  scrollIntoView?: boolean;
};

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "explore",
    route: "/templates",
    target: "explore-header",
    kicker: "Daily training system",
    title: "Start in Explore",
    body: "This is where your training starts. Explore topics, pick what you want to master, and add them to your schedule to receive daily practice problems.",
    placement: "bottom",
    scrollIntoView: true,
  },
  {
    id: "add-schedule",
    route: "/templates",
    target: "explore-enroll-cta",
    kicker: "Activation",
    title: "Add to your schedule",
    body: "This is your main action — enroll a topic or plan and CodeZero turns it into a daily queue tailored to you.",
    placement: "auto",
    highlightPadding: 10,
    scrollIntoView: true,
  },
  {
    id: "schedules",
    route: "/schedules",
    target: "schedules-header",
    kicker: "Your coding gym",
    title: "My schedules",
    body: "Scheduled topics generate fresh practice every day. Keep streams active and treat this list like your training roster.",
    placement: "bottom",
  },
  {
    id: "today",
    route: "/today",
    target: "today-queue",
    kicker: "Daily loop",
    title: "Today’s practice",
    body: "Your assigned problems land here — track difficulty, clear the queue, and build consistency the way interview prep actually works.",
    placement: "bottom",
    scrollIntoView: true,
  },
  {
    id: "brain-cache",
    route: "/brain-cache",
    target: "brain-cache-header",
    kicker: "Retention",
    title: "Brain Cache",
    body: "Important problems stay in rotation instead of fading. Spaced revision keeps patterns sharp between schedule days.",
    placement: "bottom",
  },
  {
    id: "study-plans",
    route: "/templates",
    target: "explore-study-plans",
    kicker: "Structured paths",
    title: "Study plans",
    body: "Follow curated lists — we assign the next problems in order each day so you always know what to work on next.",
    placement: "bottom",
    scrollIntoView: true,
  },
  {
    id: "other-modules",
    route: "/templates",
    target: "sidebar-nav",
    kicker: "Everything else",
    title: "The rest of CodeZero",
    body: "Dashboard for insights, Lab to experiment, Community to discuss, and Submissions to review runs — all orbit your daily schedule.",
    placement: "right",
  },
  {
    id: "finish",
    route: "/templates",
    kicker: "You’re set",
    title: "Build the habit",
    body: "Explore → schedule → solve daily → revise. Come back tomorrow — consistency is the product.",
    placement: "center",
  },
];
