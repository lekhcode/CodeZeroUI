import { AppLegalFooter } from "@/components/layout/AppLegalFooter";

type AppCopyrightProps = {
  collapsed?: boolean;
  align?: "left" | "center";
};

/** Sidebar and legacy call sites — delegates to AppLegalFooter. */
export function AppCopyright({ collapsed = false, align = "left" }: AppCopyrightProps) {
  return <AppLegalFooter variant="compact" align={align} collapsed={collapsed} />;
}
