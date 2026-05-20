import { Box, Typography } from "@mui/material";
import { miui } from "@/theme/theme";

export function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <Box sx={{ mb: 0.75 }}>
      <Typography
        component="span"
        sx={{
          display: "block",
          fontSize: "11px",
          fontWeight: 500,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: miui.textMuted,
        }}
      >
        {children}
      </Typography>
      {hint ? (
        <Typography sx={{ mt: 0.25, fontSize: "12px", color: miui.textDim, fontWeight: 400 }}>
          {hint}
        </Typography>
      ) : null}
    </Box>
  );
}
