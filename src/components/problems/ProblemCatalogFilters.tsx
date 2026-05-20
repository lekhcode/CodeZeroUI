import {
  Box,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  alpha,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import type { DifficultyLevel } from "@/types/api.types";
import { AnimatedBanner } from "@/components/ui/AnimatedBanner";
import { difficultyColor, formatDifficulty } from "@/utils/difficulty";
import { miui } from "@/theme/theme";

const DIFFICULTY_OPTIONS: DifficultyLevel[] = ["EASY", "MEDIUM", "HARD"];

const CONTROL_HEIGHT = 40;

type ProblemCatalogFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  difficulty: DifficultyLevel[];
  onDifficultyChange: (value: DifficultyLevel[]) => void;
  includePremium: boolean;
  onIncludePremiumChange: (value: boolean) => void;
  /** Lab problems panel — flat strip above the list */
  variant?: "card" | "embedded";
};

export function ProblemCatalogFilters({
  search,
  onSearchChange,
  difficulty,
  onDifficultyChange,
  includePremium,
  onIncludePremiumChange,
  variant = "card",
}: ProblemCatalogFiltersProps) {
  const embedded = variant === "embedded";

  const controls = (
    <>
      <TextField
        fullWidth
        size="small"
        placeholder="Search problems by title or slug…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        slotProps={{
          input: {
            startAdornment: <SearchRoundedIcon sx={{ mr: 1, color: "text.secondary", fontSize: 18 }} />,
            sx: {
              height: embedded ? 36 : CONTROL_HEIGHT,
              transition: "box-shadow 0.15s ease",
            },
          },
        }}
        sx={{
          mb: embedded ? 1 : 1.5,
          "& .MuiOutlinedInput-root": {
            bgcolor: embedded ? miui.elevated : "var(--bg-elevated)",
            borderRadius: embedded ? 1 : 2,
            transition: "background-color 0.15s ease",
            "& fieldset": { border: embedded ? `1px solid ${miui.border}` : "none" },
            "&:hover": {
              bgcolor: "var(--bg-hover)",
            },
            "&.Mui-focused": {
              bgcolor: "var(--bg-active)",
              boxShadow: "none",
            },
            "&.Mui-focused fieldset": {
              borderColor: embedded ? miui.borderStrong : "transparent",
            },
          },
        }}
      />

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        sx={{
          alignItems: { sm: "center" },
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, minHeight: embedded ? 36 : CONTROL_HEIGHT, flexWrap: "wrap" }}>
          {!embedded ? (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase", flexShrink: 0 }}
            >
              Difficulty
            </Typography>
          ) : null}
          <ToggleButtonGroup
            exclusive={false}
            size="small"
            value={difficulty}
            onChange={(_e, next: DifficultyLevel[]) => {
              onDifficultyChange(next);
            }}
            aria-label="Difficulty filter"
            sx={{
              height: embedded ? 34 : CONTROL_HEIGHT,
              gap: 0.5,
              "& .MuiToggleButton-root": {
                height: embedded ? 30 : CONTROL_HEIGHT - 4,
                px: 1.5,
                fontSize: embedded ? "0.75rem" : undefined,
                textTransform: "none",
                fontWeight: 600,
                borderColor: miui.border,
                borderRadius: "6px !important",
                transition: "background-color 0.15s ease, color 0.15s ease",
                "&.Mui-selected.MuiToggleButton-root": {
                  bgcolor: miui.accentDim,
                  color: miui.primary,
                  borderColor: miui.primary,
                },
              },
            }}
          >
            {DIFFICULTY_OPTIONS.map((d) => {
              const c = difficultyColor(d);
              return (
                <ToggleButton
                  key={d}
                  value={d}
                  sx={{
                    "&.Mui-selected": {
                      bgcolor: `${alpha(c, 0.14)} !important`,
                      color: `${c} !important`,
                      borderColor: `${alpha(c, 0.4)} !important`,
                    },
                  }}
                >
                  {formatDifficulty(d)}
                </ToggleButton>
              );
            })}
          </ToggleButtonGroup>
        </Box>

        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={includePremium}
              onChange={(e) => onIncludePremiumChange(e.target.checked)}
            />
          }
          label={
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: embedded ? "0.75rem" : undefined }}>
              Premium
            </Typography>
          }
          sx={{ m: 0, minHeight: embedded ? 36 : CONTROL_HEIGHT, alignItems: "center", flexShrink: 0 }}
        />
      </Stack>
    </>
  );

  if (embedded) {
    return (
      <Box
        sx={{
          flexShrink: 0,
          px: 0.5,
          pt: 0.75,
          pb: 1,
          borderBottom: `1px solid ${miui.border}`,
          bgcolor: miui.paper,
        }}
      >
        {controls}
      </Box>
    );
  }

  return (
    <AnimatedBanner
      static
      subtle
      sx={{
        p: 2,
        borderRadius: 2.5,
        border: `1px solid ${miui.border}`,
        bgcolor: miui.paper,
        boxShadow: "none",
      }}
    >
      {controls}
    </AnimatedBanner>
  );
}
