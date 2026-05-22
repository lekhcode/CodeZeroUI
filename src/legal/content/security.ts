import type { LegalPageMeta } from "@/legal/types";

export const securityPage: LegalPageMeta = {
  title: "Security",
  description:
    "How CodeZero approaches platform security, authentication safety, and responsible vulnerability disclosure.",
  sections: [
    {
      id: "philosophy",
      title: "Security philosophy",
      blocks: [
        {
          type: "paragraph",
          text: "CodeZero is built for engineers who expect their tools to be dependable. Security is treated as a product requirement — not a checkbox — spanning authentication design, session handling, API boundaries, and operational hygiene.",
        },
        {
          type: "paragraph",
          text: "We favor clarity over complexity: explicit auth flows, typed service boundaries, guarded routes, and conservative handling of tokens and credentials.",
        },
      ],
    },
    {
      id: "auth-sessions",
      title: "Authentication & sessions",
      blocks: [
        {
          type: "list",
          items: [
            "Email/password, Google OAuth, and GitHub OAuth are integrated with dedicated completion paths for partial registrations and email verification.",
            "Protected routes require a valid authenticated session; guest routes isolate sign-in and registration flows.",
            "Client auth state is synchronized with server-side user records; sensitive operations are validated on the API.",
            "Browser storage is used only to maintain session continuity and essential UI state — not to persist secrets in plain text beyond what the auth model requires.",
          ],
        },
        {
          type: "note",
          text: "Never share your credentials or OAuth tokens. LoopCode will never ask for your password via unsolicited email.",
        },
      ],
    },
    {
      id: "infrastructure",
      title: "Infrastructure practices",
      blocks: [
        {
          type: "list",
          items: [
            "HTTPS for production traffic between clients and APIs.",
            "Environment-based configuration — OAuth client IDs and API endpoints are supplied via build-time variables, not hard-coded secrets.",
            "Dependency maintenance and linting as part of the standard development workflow.",
            "Principle of least privilege for service accounts and deployment credentials (managed outside this frontend repository).",
          ],
        },
      ],
    },
    {
      id: "your-role",
      title: "Your role in staying secure",
      blocks: [
        {
          type: "list",
          items: [
            "Use a strong, unique password if you register with email.",
            "Enable available security features on your Google and GitHub accounts when using OAuth.",
            "Sign out on shared devices and keep browsers updated.",
            "Report suspicious activity to our security contact promptly.",
          ],
        },
      ],
    },
    {
      id: "disclosure",
      title: "Responsible disclosure",
      blocks: [
        {
          type: "paragraph",
          text: "We welcome good-faith reports of security vulnerabilities. If you believe you have found an issue affecting CodeZero, LoopCode infrastructure, or associated services, please report it privately before public disclosure.",
        },
        {
          type: "paragraph",
          text: "Include a clear description, reproduction steps, impact assessment, and any proof-of-concept that helps us validate the finding. We aim to acknowledge reports promptly and work with researchers on remediation timelines.",
        },
      ],
    },
    {
      id: "out-of-scope",
      title: "Out of scope",
      blocks: [
        {
          type: "paragraph",
          text: "The following are generally not accepted as security issues unless they demonstrate exploitable impact:",
        },
        {
          type: "list",
          items: [
            "Missing security headers on static assets without demonstrated exploit.",
            "Social engineering or physical attacks.",
            "Denial-of-service tests against production without prior written approval.",
            "Issues in third-party services outside LoopCode’s control (report those vendors directly).",
          ],
        },
      ],
    },
    {
      id: "contact",
      title: "Security contact",
      blocks: [
        {
          type: "paragraph",
          text: "Report vulnerabilities and security concerns to:",
        },
        {
          type: "list",
          items: ["Email: whiletrue.codes@gmail.com", "Subject line: [CodeZero Security]"],
        },
      ],
    },
  ],
};
