import { Box, Button, Stack, TextField } from "@mui/material";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { AppModal } from "@/components/ui/AppModal";
import { FieldLabel } from "@/components/ui/FieldLabel";
import { miui } from "@/theme/theme";

type FormValues = {
  name: string;
  revisionIntervalDays: number;
};

type BrainCachePlaylistDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: FormValues) => void;
  loading?: boolean;
};

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "6px",
    fontSize: "13px",
    bgcolor: miui.elevated,
    "& fieldset": { borderColor: miui.border },
    "&:hover fieldset": { borderColor: miui.borderMid },
    "&.Mui-focused fieldset": { borderColor: miui.borderFocus },
  },
  "& .MuiInputBase-input::placeholder": {
    color: miui.textDim,
    opacity: 1,
  },
};

export function BrainCachePlaylistDialog({
  open,
  onClose,
  onSubmit,
  loading = false,
}: BrainCachePlaylistDialogProps) {
  const { register, handleSubmit, reset, formState } = useForm<FormValues>({
    defaultValues: { name: "", revisionIntervalDays: 7 },
  });

  useEffect(() => {
    if (open) reset({ name: "", revisionIntervalDays: 7 });
  }, [open, reset]);

  const cancelBtnSx = {
    textTransform: "none",
    fontWeight: 500,
    fontSize: "13px",
    color: miui.textMuted,
    borderRadius: "6px",
    minHeight: 32,
  } as const;

  const submitBtnSx = {
    textTransform: "none",
    fontWeight: 500,
    fontSize: "13px",
    minHeight: 32,
    borderRadius: "6px",
    boxShadow: miui.ctaShadow,
  } as const;

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="New playlist"
      subtitle="Add a spaced-repetition set for problems you pick"
      maxWidth="xs"
      footer={
        <>
          <Button onClick={onClose} disabled={loading} sx={cancelBtnSx}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={loading}
            onClick={handleSubmit(onSubmit)}
            sx={submitBtnSx}
          >
            {loading ? "Creating…" : "Create playlist"}
          </Button>
        </>
      }
    >
      <Stack
        component="form"
        spacing={2}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <Box>
          <FieldLabel hint="Shown in your playlist list">Playlist name</FieldLabel>
          <TextField
            fullWidth
            size="small"
            placeholder="e.g. DP Revision, Google Prep"
            autoFocus
            error={Boolean(formState.errors.name)}
            {...register("name", { required: true, minLength: 1 })}
            sx={fieldSx}
          />
        </Box>

        <Box>
          <FieldLabel hint="How often each problem comes back for revision (1–365 days)">
            Revise every (days)
          </FieldLabel>
          <TextField
            fullWidth
            size="small"
            type="number"
            slotProps={{
              htmlInput: { min: 1, max: 365, step: 1 },
            }}
            error={Boolean(formState.errors.revisionIntervalDays)}
            {...register("revisionIntervalDays", {
              required: true,
              min: 1,
              max: 365,
              valueAsNumber: true,
            })}
            sx={fieldSx}
          />
        </Box>
      </Stack>
    </AppModal>
  );
}
