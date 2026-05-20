import {
  Box,
  Button,
  IconButton,
  Typography,
  alpha,
} from "@mui/material";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import { Link as RouterLink } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { BrainCachePlaylist } from "@/types/brainCache.types";
import { DifficultyIndicator } from "@/modules/explore/topic-preview/DifficultyIndicator";
import {
  problemListDividerSx,
  problemListLinkRowSx,
  problemListMetaSx,
  problemListTitleSx,
  problemListTokens,
} from "@/theme/problemList";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { brainCacheService } from "@/services/brainCache.service";
import { brainCacheKeyPrefix, queryKeys } from "@/hooks/queryKeys";
import { formatOverdueDayLabel, getUtcDateKey } from "@/utils/date";
import { miui, sectionInsetX } from "@/theme/theme";

type BrainCachePlaylistProblemsListProps = {
  playlist: BrainCachePlaylist;
};

export function BrainCachePlaylistProblemsList({ playlist }: BrainCachePlaylistProblemsListProps) {
  const queryClient = useQueryClient();
  const todayKey = getUtcDateKey();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.brainCachePlaylistProblems(playlist.id),
    queryFn: () => brainCacheService.listPlaylistProblems(playlist.id),
  });

  const removeMutation = useMutation({
    mutationFn: (problemId: string) => brainCacheService.removeProblem(playlist.id, problemId),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: brainCacheKeyPrefix }),
  });

  const problems = data ?? [];

  if (isLoading) {
    return (
      <Box sx={{ p: 2 }}>
        <LoadingSkeleton variant="list" count={4} />
      </Box>
    );
  }

  if (problems.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 4, px: sectionInsetX, textAlign: "center" }}>
        This playlist is empty. Open a problem and tap Brain Cache to add it here.
      </Typography>
    );
  }

  return (
    <Box>
      {problems.map((entry, i) => (
        <Box
          key={entry.playlistProblemId}
          component={RouterLink}
          to={`/problems/${entry.problem.slug}`}
          sx={problemListLinkRowSx({
            display: "flex",
            alignItems: "center",
            gap: problemListTokens.rowGap,
            px: sectionInsetX,
            py: problemListTokens.rowPy,
            minHeight: problemListTokens.rowMinHeight,
            ...problemListDividerSx(i < problems.length - 1),
          })}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, minWidth: 0 }}>
              <Typography noWrap sx={{ ...problemListTitleSx(), flex: 1, minWidth: 0 }}>
                {entry.problem.title}
              </Typography>
              <DifficultyIndicator difficulty={entry.problem.difficulty} />
            </Box>
            <Typography sx={problemListMetaSx({ display: "block", mt: 0.2 })}>
              {entry.nextDueDate !== null
                ? `Next revision: ${formatOverdueDayLabel(entry.nextDueDate, todayKey)}`
                : "On interval schedule"}
            </Typography>
          </Box>
          <Button
            component="span"
            size="small"
            variant="contained"
            className="solve-btn btn-primary"
            tabIndex={-1}
            endIcon={<PlayArrowRoundedIcon />}
            sx={{ flexShrink: 0, fontWeight: 700, pointerEvents: "none" }}
          >
            Solve
          </Button>
          <IconButton
            size="small"
            component="span"
            aria-label="Remove"
            disabled={removeMutation.isPending}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              removeMutation.mutate(entry.problem.id);
            }}
            sx={{ flexShrink: 0, color: "text.secondary" }}
          >
            <DeleteOutlineRoundedIcon fontSize="small" />
          </IconButton>
          <ChevronRightRoundedIcon sx={{ fontSize: 18, color: alpha(miui.text, 0.2), flexShrink: 0 }} />
        </Box>
      ))}
    </Box>
  );
}
