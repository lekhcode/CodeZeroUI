import { Box, Typography } from "@mui/material";
import { difficultyColor, formatDifficulty } from "@/utils/difficulty";

/** Minimal difficulty marker for preview rows (not a bulky chip). */
export function DifficultyIndicator({ difficulty }: { difficulty: string }) {
  const color = difficultyColor(difficulty);

  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, flexShrink: 0 }}>
      <Box
        sx={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          bgcolor: color,
          opacity: 0.9,
        }}
      />
      <Typography
        sx={{
          fontFamily: "var(--font-number)",
          fontSize: "10px",
          fontWeight: 400,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color,
        }}
      >
        {formatDifficulty(difficulty)}
      </Typography>
    </Box>
  );
}
