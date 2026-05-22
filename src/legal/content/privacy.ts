import type { LegalPageMeta } from "@/legal/types";

export const privacyPolicy: LegalPageMeta = {
  title: "Privacy Policy",
  description:
    "How CodeZero collects, uses, and protects your information when you train with schedules, revision systems, and modern authentication.",
  sections: [
    {
      id: "overview",
      title: "Overview",
      blocks: [
        {
          type: "paragraph",
          text: "CodeZero is operated by LoopCode. This policy describes how we handle personal information in the CodeZero web application — including account creation, OAuth sign-in, scheduling, onboarding, and session management.",
        },
        {
          type: "paragraph",
          text: "We design privacy practices to match how engineers actually use the product: minimal collection, clear purpose, and protection aligned with authentication and learning workflows.",
        },
      ],
    },
    {
      id: "data-we-collect",
      title: "Information we collect",
      blocks: [
        {
          type: "paragraph",
          text: "Depending on how you use CodeZero, we may process the following categories of data:",
        },
        {
          type: "list",
          items: [
            "Account identifiers — email address, display name, username, and profile fields you provide during registration or OAuth completion.",
            "Authentication data — credentials handled through our API (hashed server-side), email verification state, and OAuth tokens exchanged with Google or GitHub during sign-in.",
            "Learning activity — schedule enrollments, daily assignments, solve history, Brain Cache playlists, revision queues, submissions, and progress metrics tied to your account.",
            "Onboarding state — walkthrough completion and product education preferences synced to your profile.",
            "Technical context — timezone, session identifiers, and request metadata needed to operate the platform securely.",
          ],
        },
      ],
    },
    {
      id: "auth-providers",
      title: "Third-party authentication",
      blocks: [
        {
          type: "paragraph",
          text: "CodeZero supports Google OAuth and GitHub OAuth. When you choose these options, you authenticate directly with the provider. We receive only the information required to create or link your CodeZero account — typically profile identifiers, email (where permitted), and tokens needed to complete the sign-in flow.",
        },
        {
          type: "paragraph",
          text: "Google sign-in uses the Google Identity Services flow; GitHub sign-in redirects to GitHub and returns to our frontend callback route. Each provider’s own privacy policy governs data they collect during authentication.",
        },
        {
          type: "note",
          text: "We do not store your Google or GitHub passwords. OAuth client configuration is managed through environment variables on the frontend and secure server-side handling on the API.",
        },
      ],
    },
    {
      id: "local-storage",
      title: "Browser storage & sessions",
      blocks: [
        {
          type: "paragraph",
          text: "The application uses browser local storage and session storage to maintain a coherent signed-in experience — for example, persisting auth session state, UI preferences, and short-lived client caches that reduce redundant requests.",
        },
        {
          type: "list",
          items: [
            "Session tokens or auth markers are stored client-side only as needed to keep you signed in between visits.",
            "Onboarding and lightweight UI preferences may be cached locally before syncing to your account.",
            "Clearing site data in your browser will sign you out and reset local preferences.",
          ],
        },
      ],
    },
    {
      id: "why-we-collect",
      title: "Why we use your data",
      blocks: [
        {
          type: "list",
          items: [
            "Provide and secure your account — registration, login, email verification, password recovery.",
            "Deliver core product features — schedules, Today’s queue, spaced revision, Brain Cache, submissions, and dashboard insights.",
            "Personalize onboarding — guide new users through Explore, Schedules, Today, and Brain Cache without leaving the live product.",
            "Improve reliability — diagnose errors, prevent abuse, and maintain platform integrity.",
            "Communicate with you — verification emails, security notices, and essential service messages.",
          ],
        },
      ],
    },
    {
      id: "protection",
      title: "How we protect information",
      blocks: [
        {
          type: "paragraph",
          text: "We apply engineering controls appropriate to a modern SaaS training platform: authenticated API access, transport encryption in production, server-side validation, and least-privilege handling of credentials and tokens.",
        },
        {
          type: "paragraph",
          text: "No system is perfectly secure. We continuously refine auth flows, session handling, and dependency hygiene. Report security concerns through our Security page.",
        },
      ],
    },
    {
      id: "retention",
      title: "Retention & deletion",
      blocks: [
        {
          type: "paragraph",
          text: "We retain account and learning data while your account is active and as needed to operate CodeZero. You may request account deletion or data inquiries by contacting LoopCode. Some records may be retained where required for security, fraud prevention, or legal compliance.",
        },
      ],
    },
    {
      id: "your-rights",
      title: "Your choices",
      blocks: [
        {
          type: "list",
          items: [
            "Update profile and settings from within the application where available.",
            "Disconnect from OAuth by managing connected apps in Google or GitHub, and contact us for account-level changes.",
            "Request access, correction, or deletion of personal data by emailing our official contact.",
          ],
        },
      ],
    },
    {
      id: "changes",
      title: "Policy updates",
      blocks: [
        {
          type: "paragraph",
          text: "We may update this policy as CodeZero evolves. Material changes will be reflected on this page with an updated effective date. Continued use after changes constitutes acceptance of the revised policy.",
        },
      ],
    },
    {
      id: "contact",
      title: "Contact",
      blocks: [
        {
          type: "paragraph",
          text: "Privacy questions and data requests:",
        },
        {
          type: "list",
          items: ["LoopCode — CodeZero", "Email: whiletrue.codes@gmail.com"],
        },
      ],
    },
  ],
};
