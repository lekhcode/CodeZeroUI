import { Box, Stack, Typography, type SxProps, type Theme } from "@mui/material";
import type { ReactNode } from "react";
import { labPanelSx, miui, sectionContentSx } from "@/theme/theme";

type LabSectionProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  accent?: string;
  /** Problems list — no panel card */
  flat?: boolean;
  sx?: SxProps<Theme>;
};

export function LabSection({ title, subtitle, action, children, flat = false, sx }: LabSectionProps) {
  return (
    <Box sx={flat ? { mb: 1, ...sx } : { ...labPanelSx, ...sectionContentSx, mb: 3, ...sx }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        sx={{ mb: flat ? 0.75 : 2, justifyContent: "space-between", alignItems: { sm: "center" } }}
      >
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: flat ? 600 : 900,
              letterSpacing: flat ? "0.05em" : "-0.03em",
              textTransform: "uppercase",
              fontSize: flat ? "0.6875rem" : "0.8rem",
              color: flat ? miui.textDim : "primary.main",
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.6 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {action && <Box sx={{ position: "relative", zIndex: 1 }}>{action}</Box>}
      </Stack>
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          ...(flat ? { flex: 1, minHeight: 0, display: "flex", flexDirection: "column" } : {}),
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
