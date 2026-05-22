import { LegalPageShell } from "@/legal/LegalPageShell";
import { privacyPolicy } from "@/legal/content/privacy";

export function PrivacyPolicyPage() {
  return <LegalPageShell meta={privacyPolicy} />;
}
