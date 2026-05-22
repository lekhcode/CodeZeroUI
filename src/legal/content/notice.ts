import type { LegalPageMeta } from "@/legal/types";

export const legalNotice: LegalPageMeta = {
  title: "Legal Notice",
  description:
    "Ownership, licensing, and permitted use of the CodeZero frontend and platform intellectual property.",
  sections: [
    {
      id: "ownership",
      title: "Ownership",
      blocks: [
        {
          type: "paragraph",
          text: "CodeZero is proprietary software and product intellectual property owned by LoopCode.",
        },
        {
          type: "paragraph",
          text: "Created by Lekh Ray. Copyright © 2026 LoopCode. All rights reserved unless expressly granted in writing.",
        },
      ],
    },
    {
      id: "platform",
      title: "What this covers",
      blocks: [
        {
          type: "paragraph",
          text: "This notice applies to the CodeZero web application, its user interface, design system, onboarding flows, schedule and revision experiences, authentication UX, component architecture, and the frontend source code in this repository.",
        },
      ],
    },
    {
      id: "permitted",
      title: "Permitted use of this repository",
      blocks: [
        {
          type: "paragraph",
          text: "Unless you hold a separate written agreement with LoopCode, you may:",
        },
        {
          type: "list",
          items: [
            "View and browse this repository",
            "Study its architecture and implementation",
            "Evaluate engineering quality for hiring, collaboration, or educational review",
          ],
        },
      ],
    },
    {
      id: "prohibited",
      title: "Unauthorized use",
      blocks: [
        {
          type: "paragraph",
          text: "Without prior written authorization from LoopCode, the following are prohibited:",
        },
        {
          type: "list",
          items: [
            "Redistribution or publication of source code or assets",
            "Commercial reuse, sublicensing, or white-labeling",
            "Rebranding or claiming ownership of CodeZero",
            "Cloning or deploying competing versions derived from this work",
            "Removing copyright, license, or attribution notices",
          ],
        },
      ],
    },
    {
      id: "license-file",
      title: "LICENSE file",
      blocks: [
        {
          type: "paragraph",
          text: "The full proprietary license terms are defined in the LICENSE file at the repository root. Repository access implies acknowledgment of those terms.",
        },
      ],
    },
    {
      id: "trademarks",
      title: "Names & branding",
      blocks: [
        {
          type: "paragraph",
          text: "“CodeZero” and “LoopCode” identify the platform and organization. Unauthorized use of these names, logos, or trade dress in competing products is not permitted.",
        },
      ],
    },
    {
      id: "inquiries",
      title: "Licensing inquiries",
      blocks: [
        {
          type: "paragraph",
          text: "For commercial licensing, partnership, or written permission requests:",
        },
        {
          type: "list",
          items: ["LoopCode", "Email: whiletrue.codes@gmail.com"],
        },
      ],
    },
  ],
};
