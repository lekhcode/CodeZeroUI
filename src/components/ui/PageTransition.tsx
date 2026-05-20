import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";

type PageTransitionProps = {
  children: ReactNode;
};

/**
 * Light enter-only transition (opacity). CSS-only — no layout animation cost.
 */
export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();

  return (
    <div
      key={location.pathname}
      className="page-transition-enter"
      style={{
        height: "100%",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        flex: 1,
      }}
    >
      {children}
    </div>
  );
}
