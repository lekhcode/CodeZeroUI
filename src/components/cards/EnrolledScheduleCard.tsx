import { Card, CardContent, Chip, Stack, Typography, alpha } from "@mui/material";
import { FadeInCard } from "@/components/ui/FadeInCard";
import type { UserSchedule } from "@/types/api.types";
import { formatScheduleDifficultyLabel } from "@/utils/scheduleDifficulty";

type EnrolledScheduleCardProps = {
  schedule: UserSchedule;
  index?: number;
};

export function EnrolledScheduleCard({ schedule, index = 0 }: EnrolledScheduleCardProps) {
  const diffLabel = formatScheduleDifficultyLabel(
    schedule.difficulty,
    schedule.difficultyFilters,
  );

  return (
    <FadeInCard delay={index * 0.04} className="card-hover-lift-3">
      <Card sx={{ height: "100%" }}>
        <CardContent>
          <Stack spacing={1}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              {schedule.template.name}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
              <Chip label={schedule.template.type.replace("_", " ")} size="small" variant="outlined" />
              {schedule.dailyQuestions !== null && (
                <Chip label={`${schedule.dailyQuestions}/day`} size="small" variant="outlined" />
              )}
              {diffLabel ? <Chip label={diffLabel} size="small" variant="outlined" /> : null}
              <Chip
                label={schedule.active ? "Active" : "Paused"}
                size="small"
                sx={{
                  fontWeight: 800,
                  color: schedule.active ? "#059669" : "#64748b",
                  bgcolor: alpha(schedule.active ? "#059669" : "#64748b", 0.1),
                }}
              />
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </FadeInCard>
  );
}
