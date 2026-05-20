import { motion } from "framer-motion";
import type { ReactNode } from "react";

/** Wrapper avoids `component={motion.div}` on MUI — `transition` prop conflicts crash React. */
export function MotionFadeIn({
  children,
  delay = 0,
  /** Set false inside the app shell to avoid stacking fades on every navigation. */
  animate = true,
}: {
  children: ReactNode;
  delay?: number;
  animate?: boolean;
}) {
  const shellStyle = {
    height: "100%",
    minHeight: 0,
    display: "flex",
    flexDirection: "column" as const,
    flex: 1,
  };

  if (!animate) {
    return <div style={shellStyle}>{children}</div>;
  }

  return (
    <motion.div
      style={shellStyle}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
