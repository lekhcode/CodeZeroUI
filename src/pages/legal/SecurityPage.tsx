import { LegalPageShell } from "@/legal/LegalPageShell";
import { securityPage } from "@/legal/content/security";

export function SecurityPage() {
  return <LegalPageShell meta={securityPage} />;
}
