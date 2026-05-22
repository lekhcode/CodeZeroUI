import { LegalPageShell } from "@/legal/LegalPageShell";
import { legalNotice } from "@/legal/content/notice";

export function LegalNoticePage() {
  return <LegalPageShell meta={legalNotice} />;
}
