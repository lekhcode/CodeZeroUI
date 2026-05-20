import { Alert, Box, Button, Stack } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { ScheduleTemplate } from "@/types/api.types";
import { schedulesService } from "@/services/schedules.service";
import { queryKeys, trackedDuePrefix, trackedTodayPrefix } from "@/hooks/queryKeys";
import { AppModal } from "@/components/ui/AppModal";
import { FieldLabel } from "@/components/ui/FieldLabel";
import { DifficultyChipPicker } from "@/components/ui/DifficultyChipPicker";
import { QuestionCountStepper } from "@/components/ui/QuestionCountStepper";
import {
  difficultiesToApiPayload,
  SCHEDULE_DIFFICULTY_LEVELS,
  type ScheduleDifficultyLevel,
} from "@/utils/scheduleDifficulty";
import { miui } from "@/theme/theme";

function buildSchema(template: ScheduleTemplate | null) {
  return z.object({
    dailyQuestions: template?.allowsCount
      ? z.number().int().min(1).max(6)
      : z.number().optional(),
    difficulties: template?.allowsDifficulty
      ? z.array(z.enum(["EASY", "MEDIUM", "HARD"])).min(1, "Select at least one difficulty")
      : z.array(z.enum(["EASY", "MEDIUM", "HARD"])).optional(),
  });
}

type FormValues = {
  dailyQuestions: number;
  difficulties: ScheduleDifficultyLevel[];
};

type Props = {
  template: ScheduleTemplate | null;
  open: boolean;
  onClose: () => void;
};

const defaultDifficulties: ScheduleDifficultyLevel[] = [...SCHEDULE_DIFFICULTY_LEVELS];

export function CreateScheduleModal({ template, open, onClose }: Props) {
  const queryClient = useQueryClient();

  const formSchema = useMemo(() => buildSchema(template), [template]);

  const { control, handleSubmit, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(formSchema) as Resolver<FormValues>,
    defaultValues: {
      dailyQuestions: template?.defaultCount ?? 2,
      difficulties: defaultDifficulties,
    },
  });

  useEffect(() => {
    if (open && template) {
      reset({
        dailyQuestions: Math.min(6, Math.max(1, template.defaultCount ?? 2)),
        difficulties: defaultDifficulties,
      });
    }
  }, [open, template, reset]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      if (!template) throw new Error("No template");
      return schedulesService.createUserSchedule({
        templateSlug: template.slug,
        ...(template.allowsCount && values.dailyQuestions !== undefined
          ? { dailyQuestions: values.dailyQuestions }
          : {}),
        ...(template.allowsDifficulty && values.difficulties
          ? difficultiesToApiPayload(values.difficulties)
          : {}),
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.userSchedules });
      void queryClient.invalidateQueries({ queryKey: queryKeys.todayAssignments });
      void queryClient.invalidateQueries({ queryKey: trackedTodayPrefix });
      void queryClient.invalidateQueries({ queryKey: trackedDuePrefix });
      reset();
      onClose();
    },
  });

  if (!template) return null;

  const showCount = template.allowsCount;
  const showDifficulty = template.allowsDifficulty;
  const showFixedNote = !showCount && !showDifficulty;

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Add to schedule"
      subtitle={template.name}
      footer={
        <>
          <Button
            onClick={onClose}
            disabled={mutation.isPending}
            sx={{
              textTransform: "none",
              fontWeight: 500,
              fontSize: "13px",
              color: miui.textMuted,
              borderRadius: "6px",
              minHeight: 32,
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit((v) => mutation.mutate(v))}
            disabled={mutation.isPending}
            sx={{
              textTransform: "none",
              fontWeight: 500,
              fontSize: "13px",
              minHeight: 32,
              borderRadius: "6px",
              boxShadow: miui.ctaShadow,
            }}
          >
            {mutation.isPending ? "Adding…" : "Add schedule"}
          </Button>
        </>
      }
    >
      {mutation.isError && (
        <Alert severity="error" sx={{ mb: 1.5, py: 0.25, fontSize: "13px" }}>
          {mutation.error.message}
        </Alert>
      )}

      <Stack spacing={2}>
        {showFixedNote && (
          <Alert severity="info" sx={{ py: 0.25, fontSize: "13px" }}>
            This schedule uses fixed defaults (e.g. one POTD per day).
          </Alert>
        )}

        {showCount && (
          <Box>
            <FieldLabel hint="Problems assigned from this plan each day (1–6)">
              Questions per day
            </FieldLabel>
            <Controller
              name="dailyQuestions"
              control={control}
              render={({ field }) => (
                <QuestionCountStepper
                  value={field.value ?? 2}
                  onChange={field.onChange}
                  disabled={mutation.isPending}
                />
              )}
            />
          </Box>
        )}

        {showDifficulty && (
          <Box>
            <FieldLabel hint="Select one or more — combine Easy + Medium, etc.">
              Difficulty focus
            </FieldLabel>
            <Controller
              name="difficulties"
              control={control}
              render={({ field }) => (
                <DifficultyChipPicker
                  value={field.value ?? defaultDifficulties}
                  onChange={field.onChange}
                  disabled={mutation.isPending}
                />
              )}
            />
            {formState.errors.difficulties ? (
              <Box sx={{ mt: 0.75, fontSize: "12px", color: miui.danger }}>
                {formState.errors.difficulties.message}
              </Box>
            ) : null}
          </Box>
        )}
      </Stack>
    </AppModal>
  );
}
