import { lazy } from "react";

/** Route-level code splitting — reduces initial bundle; visuals unchanged after load. */
export const DashboardPage = lazy(() =>
  import("@/pages/dashboard/DashboardPage").then((m) => ({ default: m.DashboardPage })),
);
export const LabPage = lazy(() => import("@/pages/lab/LabPage").then((m) => ({ default: m.LabPage })));
export const TodayPage = lazy(() =>
  import("@/pages/today/TodayPage").then((m) => ({ default: m.TodayPage })),
);
export const SubmissionsPage = lazy(() =>
  import("@/pages/submissions/SubmissionsPage").then((m) => ({ default: m.SubmissionsPage })),
);
export const TemplatesPage = lazy(() =>
  import("@/pages/templates/TemplatesPage").then((m) => ({ default: m.TemplatesPage })),
);
export const UserSchedulesPage = lazy(() =>
  import("@/pages/schedules/UserSchedulesPage").then((m) => ({ default: m.UserSchedulesPage })),
);
export const BrainCachePage = lazy(() =>
  import("@/pages/brainCache/BrainCachePage").then((m) => ({ default: m.BrainCachePage })),
);
export const CommunityHubPage = lazy(() =>
  import("@/pages/community/CommunityHubPage").then((m) => ({ default: m.CommunityHubPage })),
);
export const CommunityBrowsePage = lazy(() =>
  import("@/pages/community/CommunityBrowsePage").then((m) => ({ default: m.CommunityBrowsePage })),
);
export const CommunityCreatePostPage = lazy(() =>
  import("@/pages/community/CommunityCreatePostPage").then((m) => ({
    default: m.CommunityCreatePostPage,
  })),
);
export const CommunityPostPage = lazy(() =>
  import("@/pages/community/CommunityPostPage").then((m) => ({ default: m.CommunityPostPage })),
);
export const ProblemDetailPage = lazy(() =>
  import("@/pages/problems/ProblemDetailPage").then((m) => ({ default: m.ProblemDetailPage })),
);
export const SettingsPage = lazy(() =>
  import("@/pages/settings/SettingsPage").then((m) => ({ default: m.SettingsPage })),
);
export const PrivacyPolicyPage = lazy(() =>
  import("@/pages/legal/PrivacyPolicyPage").then((m) => ({ default: m.PrivacyPolicyPage })),
);
export const TermsOfServicePage = lazy(() =>
  import("@/pages/legal/TermsOfServicePage").then((m) => ({ default: m.TermsOfServicePage })),
);
export const SecurityPage = lazy(() =>
  import("@/pages/legal/SecurityPage").then((m) => ({ default: m.SecurityPage })),
);
export const LegalNoticePage = lazy(() =>
  import("@/pages/legal/LegalNoticePage").then((m) => ({ default: m.LegalNoticePage })),
);
