import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Box } from "@mui/material";

type Ctx = {
  mount: HTMLDivElement | null;
  setMount: (el: HTMLDivElement | null) => void;
};

const InterviewerHeaderSlotContext = createContext<Ctx | null>(null);

export function InterviewerHeaderSlotProvider({ children }: { children: ReactNode }) {
  const [mount, setMountState] = useState<HTMLDivElement | null>(null);
  const setMount = useCallback((el: HTMLDivElement | null) => {
    setMountState((prev) => (prev === el ? prev : el));
  }, []);
  const value = useMemo(() => ({ mount, setMount }), [mount, setMount]);
  return (
    <InterviewerHeaderSlotContext.Provider value={value}>
      {children}
    </InterviewerHeaderSlotContext.Provider>
  );
}

export function useInterviewerHeaderSlot() {
  return useContext(InterviewerHeaderSlotContext);
}

/** Fills remaining header width after the problem title block. */
export function InterviewerHeaderPanelMount() {
  const ctx = useInterviewerHeaderSlot();
  return (
    <Box
      ref={ctx?.setMount}
      sx={{
        flex: 1,
        minWidth: 0,
        alignSelf: "stretch",
        display: "flex",
        alignItems: "center",
        // Soft orb-tint wash so the header doesn't read as flat black.
        background: `
          radial-gradient(90% 120% at 12% 50%,
            rgba(244, 114, 182, 0.1) 0%,
            rgba(168, 85, 247, 0.07) 35%,
            rgba(79, 70, 229, 0.04) 60%,
            transparent 100%)
        `,
      }}
    />
  );
}
