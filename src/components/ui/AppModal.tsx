import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  type DialogProps,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { miui } from "@/theme/theme";

const modalPaperSx = {
  borderRadius: "10px",
  border: `1px solid ${miui.borderStrong}`,
  bgcolor: miui.paper,
  backgroundImage: "none",
  boxShadow: "0 16px 48px rgba(0,0,0,0.45)",
  maxHeight: "calc(100dvh - 32px)",
};

type AppModalProps = {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: DialogProps["maxWidth"];
};

/** Compact SaaS-style modal shell (Linear / Vercel inspired). */
export function AppModal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = "sm",
}: AppModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={maxWidth}
      slotProps={{
        backdrop: {
          sx: {
            bgcolor: miui.overlay,
            backdropFilter: "blur(4px)",
          },
        },
        paper: { sx: modalPaperSx },
        transition: { timeout: { enter: 200, exit: 140 } },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 1,
          py: 1.5,
          px: 2,
          borderBottom: `1px solid ${miui.border}`,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.16 }}
            sx={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 600,
              fontSize: "15px",
              color: miui.text,
              lineHeight: 1.3,
            }}
          >
            {title}
          </Box>
          {subtitle ? (
            <Box
              sx={{
                mt: 0.35,
                fontSize: "12px",
                fontWeight: 400,
                color: miui.textMuted,
                lineHeight: 1.45,
              }}
            >
              {subtitle}
            </Box>
          ) : null}
        </Box>
        <IconButton
          size="small"
          onClick={onClose}
          aria-label="Close"
          sx={{
            mt: -0.25,
            color: miui.textMuted,
            borderRadius: "6px",
            "&:hover": { bgcolor: miui.hover, color: miui.text },
          }}
        >
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 2, py: 1.75 }}>{children}</DialogContent>

      {footer ? (
        <DialogActions
          sx={{
            px: 2,
            py: 1.25,
            gap: 1,
            borderTop: `1px solid ${miui.border}`,
          }}
        >
          {footer}
        </DialogActions>
      ) : null}
    </Dialog>
  );
}
