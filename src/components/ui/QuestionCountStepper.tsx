import { Box } from "@mui/material";
import { miui } from "@/theme/theme";

const MIN = 1;
const MAX = 6;

type QuestionCountStepperProps = {
  value: number;
  onChange: (n: number) => void;
  disabled?: boolean;
};

/** Compact 1–6 picker — avoids number input coercion bugs blocking API calls. */
export function QuestionCountStepper({ value, onChange, disabled = false }: QuestionCountStepperProps) {
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
      {Array.from({ length: MAX - MIN + 1 }, (_, i) => MIN + i).map((n) => {
        const active = value === n;
        return (
          <Box
            key={n}
            component="button"
            type="button"
            disabled={disabled}
            onClick={() => onChange(n)}
            aria-pressed={active}
            sx={{
              fontFamily: "var(--font-number)",
              fontSize: "13px",
              fontWeight: active ? 600 : 500,
              minWidth: 36,
              height: 32,
              borderRadius: "6px",
              border: `1px solid ${active ? miui.borderFocus : miui.border}`,
              bgcolor: active ? miui.active : miui.elevated,
              color: active ? miui.text : miui.textMuted,
              cursor: disabled ? "not-allowed" : "pointer",
              boxShadow: active ? `0 0 0 1px ${miui.borderGlow}` : "none",
              transition: "border-color 140ms ease, background-color 140ms ease, color 140ms ease",
              opacity: disabled ? 0.55 : 1,
              ...(!disabled
                ? {
                    "@media (prefers-reduced-motion: no-preference)": {
                      "&:hover": {
                        bgcolor: active ? miui.active : miui.hover,
                        borderColor: miui.borderStrong,
                        color: miui.text,
                      },
                    },
                  }
                : {}),
            }}
          >
            {n}
          </Box>
        );
      })}
    </Box>
  );
}
