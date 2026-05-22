import type { LegalPageMeta } from "@/legal/types";

export const termsOfService: LegalPageMeta = {
  title: "Terms of Service",
  description:
    "The terms governing access to CodeZero — acceptable use, account responsibilities, and platform limitations.",
  sections: [
    {
      id: "agreement",
      title: "Agreement",
      blocks: [
        {
          type: "paragraph",
          text: "These Terms of Service (“Terms”) govern your access to and use of CodeZero, a premium DSA training platform operated by LoopCode. By creating an account or using the service, you agree to these Terms.",
        },
        {
          type: "paragraph",
          text: "If you do not agree, do not use CodeZero.",
        },
      ],
    },
    {
      id: "service",
      title: "The service",
      blocks: [
        {
          type: "paragraph",
          text: "CodeZero provides structured interview preparation — schedules, daily practice queues, spaced revision (Brain Cache), onboarding guidance, problem workspaces, submissions analytics, and community features. Features may change as the product evolves.",
        },
        {
          type: "note",
          text: "CodeZero is a training tool. It does not guarantee interview outcomes, employment, or specific performance results.",
        },
      ],
    },
    {
      id: "accounts",
      title: "Accounts & authentication",
      blocks: [
        {
          type: "list",
          items: [
            "You are responsible for maintaining the confidentiality of your credentials and for activity under your account.",
            "You must provide accurate registration information and keep your email reachable for verification and security notices.",
            "You may sign in via email/password, Google OAuth, or GitHub OAuth, subject to each provider’s terms.",
            "You must not share accounts, sell access, or circumvent authentication or access controls.",
          ],
        },
      ],
    },
    {
      id: "acceptable-use",
      title: "Acceptable use",
      blocks: [
        {
          type: "paragraph",
          text: "You agree to use CodeZero lawfully and respectfully. You must not:",
        },
        {
          type: "list",
          items: [
            "Attempt to gain unauthorized access to systems, accounts, or data.",
            "Scrape, bulk-harvest, or automate access in ways that impair service stability.",
            "Upload malware, abuse community features, or harass other users.",
            "Reverse-engineer, copy, or replicate the platform for competing commercial purposes.",
            "Misrepresent your identity or affiliation with LoopCode or CodeZero.",
            "Use the service in violation of applicable law or third-party rights.",
          ],
        },
      ],
    },
    {
      id: "intellectual-property",
      title: "Intellectual property",
      blocks: [
        {
          type: "paragraph",
          text: "CodeZero — including its interface, workflows, branding, content organization, and software — is owned by LoopCode and protected by applicable intellectual property laws.",
        },
        {
          type: "paragraph",
          text: "These Terms grant you a limited, personal, non-transferable license to use the service as intended. No rights are granted to redistribute, commercially exploit, rebrand, or create derivative competing products from the platform or its frontend source.",
        },
        {
          type: "paragraph",
          text: "Repository viewers may inspect frontend code under the separate LICENSE file; that license does not grant production or commercial use rights.",
        },
      ],
    },
    {
      id: "user-content",
      title: "Community & user content",
      blocks: [
        {
          type: "paragraph",
          text: "Content you post in community features remains yours, but you grant LoopCode a license to host, display, and moderate it within the service. We may remove content that violates these Terms or harms the community.",
        },
      ],
    },
    {
      id: "limitations",
      title: "Platform limitations",
      blocks: [
        {
          type: "list",
          items: [
            "The service may experience downtime, maintenance, or partial outages.",
            "Judge, compiler, and third-party integrations depend on external infrastructure and may be unavailable or rate-limited.",
            "We may modify, suspend, or discontinue features with reasonable notice where practicable.",
            "Free or paid tiers, if introduced, will be subject to additional terms presented at enrollment.",
          ],
        },
      ],
    },
    {
      id: "disclaimer",
      title: "Disclaimer",
      blocks: [
        {
          type: "paragraph",
          text: "CodeZero is provided “as is” and “as available” without warranties of any kind, whether express or implied, including merchantability, fitness for a particular purpose, and non-infringement, to the fullest extent permitted by law.",
        },
      ],
    },
    {
      id: "liability",
      title: "Limitation of liability",
      blocks: [
        {
          type: "paragraph",
          text: "To the maximum extent permitted by law, LoopCode and its creators shall not be liable for indirect, incidental, special, consequential, or punitive damages, or for loss of profits, data, or goodwill arising from your use of CodeZero.",
        },
      ],
    },
    {
      id: "termination",
      title: "Termination",
      blocks: [
        {
          type: "paragraph",
          text: "You may stop using CodeZero at any time. We may suspend or terminate access for violations of these Terms, security risk, or extended inactivity, subject to applicable law.",
        },
      ],
    },
    {
      id: "governing",
      title: "Changes & contact",
      blocks: [
        {
          type: "paragraph",
          text: "We may update these Terms. Continued use after updates constitutes acceptance. Questions:",
        },
        {
          type: "list",
          items: ["LoopCode — CodeZero", "Email: whiletrue.codes@gmail.com"],
        },
      ],
    },
  ],
};
