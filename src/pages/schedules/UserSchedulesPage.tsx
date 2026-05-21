import {
  Alert,
  Box,
  Button,
  IconButton,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import { useState } from "react";
import { PageContainer } from "@/components/ui/PageContainer";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { schedulesService } from "@/services/schedules.service";
import { queryKeys, trackedDuePrefix, trackedTodayPrefix } from "@/hooks/queryKeys";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import type { UserSchedule } from "@/types/api.types";
import { formatScheduleDifficultyLabel } from "@/utils/scheduleDifficulty";
import { FLUENT_PAGE } from "@/theme/fluentScroll";
import { miui } from "@/theme/theme";

const metaBadgeSx = {
  fontFamily: "var(--font-number)",
  fontSize: "10px",
  fontWeight: 500,
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  bgcolor: miui.elevated,
  border: `1px solid ${miui.border}`,
  color: miui.textMuted,
  borderRadius: "4px",
  px: 0.75,
  py: 0.2,
  lineHeight: 1.4,
};

function ScheduleRow({
  schedule,
  onToggle,
  onDeleteRequest,
  togglePending,
}: {
  schedule: UserSchedule;
  onToggle: () => void;
  onDeleteRequest: () => void;
  togglePending: boolean;
}) {
  const diffLabel = formatScheduleDifficultyLabel(
    schedule.difficulty,
    schedule.difficultyFilters,
  );

  return (
    <Box
      sx={{
        borderRadius: "8px",
        px: 1.75,
        py: 1.25,
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        flexWrap: "wrap",
        opacity: schedule.active ? 1 : 0.72,
        bgcolor: miui.paper,
        border: `1px solid ${miui.border}`,
        transition: "border-color 140ms ease, background-color 140ms ease",
        "@media (prefers-reduced-motion: no-preference)": {
          "&:hover": { borderColor: miui.borderStrong, bgcolor: miui.elevated },
        },
      }}
    >
      <Box sx={{ flex: 1, minWidth: 180 }}>
        <Typography
          sx={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontWeight: 600,
            fontSize: "14px",
            color: miui.text,
            lineHeight: 1.3,
          }}
        >
          {schedule.template.name}
        </Typography>
        <Stack direction="row" spacing={0.5} sx={{ mt: 0.6, flexWrap: "wrap" }}>
          <Box component="span" sx={metaBadgeSx}>
            {schedule.template.type.replace("_", " ")}
          </Box>
          {schedule.dailyQuestions != null && (
            <Box component="span" sx={{ ...metaBadgeSx, color: miui.primary }}>
              {schedule.dailyQuestions}/day
            </Box>
          )}
          {diffLabel ? (
            <Box component="span" sx={metaBadgeSx}>
              {diffLabel}
            </Box>
          ) : null}
        </Stack>
      </Box>
      <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
        <Typography sx={{ color: miui.textMuted, fontWeight: 400, fontSize: "12px" }}>
          Active
        </Typography>
        <Switch
          size="small"
          checked={schedule.active}
          onChange={onToggle}
          disabled={togglePending}
          sx={{
            "& .MuiSwitch-switchBase.Mui-checked": {
              color: miui.primary,
              "& + .MuiSwitch-track": { bgcolor: miui.primary, opacity: 0.4 },
            },
            "& .MuiSwitch-track": { bgcolor: miui.elevated, opacity: 1 },
          }}
        />
        <IconButton
          size="small"
          onClick={onDeleteRequest}
          aria-label={`Remove ${schedule.template.name}`}
          sx={{
            color: miui.textMuted,
            borderRadius: "6px",
            transition: "color 140ms ease, background-color 140ms ease",
            "&:hover": { color: miui.danger, bgcolor: miui.dangerSoft },
          }}
        >
          <DeleteOutlineRoundedIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Box>
  );
}

export function UserSchedulesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<UserSchedule | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.userSchedules,
    queryFn: schedulesService.listUserSchedules,
  });

  const toggleMutation = useMutation({
    mutationFn: schedulesService.toggleUserSchedule,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.userSchedules });
      void queryClient.invalidateQueries({ queryKey: queryKeys.todayAssignments });
      void queryClient.invalidateQueries({ queryKey: trackedTodayPrefix });
      void queryClient.invalidateQueries({ queryKey: trackedDuePrefix });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: schedulesService.deleteUserSchedule,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.userSchedules });
      void queryClient.invalidateQueries({ queryKey: queryKeys.todayAssignments });
      void queryClient.invalidateQueries({ queryKey: trackedTodayPrefix });
      void queryClient.invalidateQueries({ queryKey: trackedDuePrefix });
      setDeleteTarget(null);
    },
  });

  return (
    <PageContainer className={FLUENT_PAGE.schedules} sx={{ bgcolor: miui.bg, maxWidth: 720 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 2.5,
          gap: 1.5,
          flexWrap: "wrap",
        }}
      >
        <Box data-onboarding="schedules-header">
          <Typography
            variant="h4"
            sx={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 700,
              fontSize: "22px",
              color: miui.text,
            }}
          >
            My schedules
          </Typography>
          <Typography sx={{ color: miui.textMuted, fontWeight: 400, fontSize: "13px", mt: 0.25 }}>
            Toggle, remove, or add learning streams
          </Typography>
        </Box>
        <Button
          component={RouterLink}
          to="/templates"
          variant="contained"
          size="small"
          sx={{ fontWeight: 500, textTransform: "none", borderRadius: "6px", minHeight: 32 }}
        >
          Add schedule
        </Button>
      </Box>

      {isLoading && <LoadingSkeleton variant="list" count={4} />}
      {isError && <Alert severity="error">{(error as Error).message}</Alert>}

      {data?.length === 0 && !isLoading && (
        <EmptyState
          title="No schedules yet"
          description="Explore templates and enroll in POTD, Blind 75, or Top Interview 150."
          actionLabel="Browse templates"
          onAction={() => navigate("/templates")}
        />
      )}

      <Stack spacing={1}>
        {data?.map((schedule) => (
          <ScheduleRow
            key={schedule.id}
            schedule={schedule}
            onToggle={() => toggleMutation.mutate(schedule.id)}
            onDeleteRequest={() => setDeleteTarget(schedule)}
            togglePending={toggleMutation.isPending}
          />
        ))}
      </Stack>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete schedule?"
        description="This removes the schedule from your list. Past assignment history may remain in tracking."
        confirmLabel="Delete schedule"
        loading={deleteMutation.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
        }}
        preview={
          deleteTarget ? (
            <Typography sx={{ fontSize: "13px", fontWeight: 500, color: miui.text }}>
              {deleteTarget.template.name}
            </Typography>
          ) : null
        }
      />
    </PageContainer>
  );
}
