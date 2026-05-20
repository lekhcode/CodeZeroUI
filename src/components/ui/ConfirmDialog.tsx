import { Box, Button, Typography } from "@mui/material";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { AppModal } from "@/components/ui/AppModal";
import { miui } from "@/theme/theme";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  /** Optional preview block (e.g. schedule name) */
  preview?: import("react").ReactNode;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  loading = false,
  onConfirm,
  onCancel,
  preview,
}: ConfirmDialogProps) {
  return (
    <AppModal
      open={open}
      onClose={onCancel}
      title={title}
      maxWidth="xs"
      footer={
        <>
          <Button
            onClick={onCancel}
            disabled={loading}
            sx={{
              textTransform: "none",
              fontWeight: 500,
              fontSize: "13px",
              color: miui.textMuted,
              borderRadius: "6px",
              px: 1.5,
              minHeight: 32,
            }}
          >
            {cancelLabel}
          </Button>
          <Button
            variant="contained"
            onClick={onConfirm}
            disabled={loading}
            sx={{
              textTransform: "none",
              fontWeight: 500,
              fontSize: "13px",
              minHeight: 32,
              borderRadius: "6px",
              bgcolor: miui.dangerSoft,
              color: miui.danger,
              border: `1px solid ${miui.dangerBorder}`,
              boxShadow: "none",
              "&:hover": {
                bgcolor: "rgba(248, 113, 113, 0.14)",
                boxShadow: "none",
              },
            }}
          >
            {loading ? "Deleting…" : confirmLabel}
          </Button>
        </>
      }
    >
      <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            bgcolor: miui.dangerSoft,
            border: `1px solid ${miui.dangerBorder}`,
            color: miui.danger,
          }}
        >
          <WarningAmberRoundedIcon sx={{ fontSize: 20 }} />
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          {description ? (
            <Typography sx={{ fontSize: "13px", color: miui.textMuted, lineHeight: 1.5, fontWeight: 400 }}>
              {description}
            </Typography>
          ) : null}
          {preview ? (
            <Box
              sx={{
                mt: 1.25,
                px: 1.25,
                py: 1,
                borderRadius: "6px",
                bgcolor: miui.elevated,
                border: `1px solid ${miui.border}`,
              }}
            >
              {preview}
            </Box>
          ) : null}
        </Box>
      </Box>
    </AppModal>
  );
}
