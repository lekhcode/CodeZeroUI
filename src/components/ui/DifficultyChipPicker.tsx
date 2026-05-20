import { Box } from "@mui/material";
import {
  SCHEDULE_DIFFICULTY_LEVELS,
  type ScheduleDifficultyLevel,
} from "@/utils/scheduleDifficulty";
import { difficultyColor, formatDifficulty } from "@/utils/difficulty";
import { miui } from "@/theme/theme";

type DifficultyChipPickerProps = {
  value: ScheduleDifficultyLevel[];
  onChange: (next: ScheduleDifficultyLevel[]) => void;
  disabled?: boolean;
};

export function DifficultyChipPicker({ value, onChange, disabled = false }: DifficultyChipPickerProps) {
  const toggle = (level: ScheduleDifficultyLevel): void => {
    if (disabled) return;
    if (value.includes(level)) {
      const next = value.filter((d) => d !== level);
      if (next.length > 0) onChange(next);
    } else {
      onChange([...value, level]);
    }
  };

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
      {SCHEDULE_DIFFICULTY_LEVELS.map((level) => {
        const active = value.includes(level);
        const accent = difficultyColor(level);
        return (
          <Box
            key={level}
            component="button"
            type="button"
            disabled={disabled}
            onClick={() => toggle(level)}
            aria-pressed={active}
            sx={{
              fontFamily: "var(--font-number)",
              fontSize: "11px",
              fontWeight: 500,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              px: 1.25,
              py: 0.5,
              minHeight: 28,
              borderRadius: "6px",
              cursor: disabled ? "not-allowed" : "pointer",
              border: `1px solid ${active ? accent : miui.border}`,
              bgcolor: active ? `${accent}18` : miui.elevated,
              color: active ? accent : miui.textMuted,
              boxShadow: active ? `0 0 0 1px ${accent}33` : "none",
              opacity: disabled ? 0.55 : 1,
              transition:
                "border-color 140ms ease, background-color 140ms ease, color 140ms ease, box-shadow 140ms ease",
              ...(!disabled
                ? {
                    "@media (prefers-reduced-motion: no-preference)": {
                      "&:hover": {
                        borderColor: accent,
                        bgcolor: active ? `${accent}22` : miui.hover,
                        color: active ? accent : miui.text,
                      },
                    },
                  }
                : {}),
            }}
          >
            {formatDifficulty(level)}
          </Box>
        );
      })}
    </Box>
  );
}
