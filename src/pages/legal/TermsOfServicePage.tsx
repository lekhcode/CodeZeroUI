import { LegalPageShell } from "@/legal/LegalPageShell";
import { termsOfService } from "@/legal/content/terms";

export function TermsOfServicePage() {
  return <LegalPageShell meta={termsOfService} />;
}
