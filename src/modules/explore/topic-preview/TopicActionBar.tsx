import { Box, IconButton, Tooltip } from "@mui/material";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import BookmarkBorderRoundedIcon from "@mui/icons-material/BookmarkBorderRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import EventNoteRoundedIcon from "@mui/icons-material/EventNoteRounded";
import { miui } from "@/theme/theme";

const iconBtnSx = {
  width: 32,
  height: 32,
  borderRadius: "6px",
  border: `1px solid ${miui.border}`,
  color: miui.textMuted,
  transition: "color 140ms ease, border-color 140ms ease, background-color 140ms ease",
  "&:hover": {
    color: miui.text,
    borderColor: miui.borderStrong,
    bgcolor: miui.hover,
  },
};

type TopicActionBarProps = {
  onShare?: () => void;
  onCopyLink?: () => void;
  onAddSchedule?: () => void;
  enrolled?: boolean;
};

export function TopicActionBar({
  onShare,
  onCopyLink,
  onAddSchedule,
  enrolled,
}: TopicActionBarProps) {
  return (
    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
      <Tooltip title="Share topic">
        <IconButton size="small" onClick={onShare} aria-label="Share topic" sx={iconBtnSx}>
          <ShareOutlinedIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Bookmarks — coming soon">
        <span>
          <IconButton
            size="small"
            disabled
            aria-label="Bookmark topic"
            sx={{ ...iconBtnSx, opacity: 0.45 }}
          >
            <BookmarkBorderRoundedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Copy link">
        <IconButton size="small" onClick={onCopyLink} aria-label="Copy topic link" sx={iconBtnSx}>
          <LinkRoundedIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>
      {!enrolled && onAddSchedule ? (
        <Tooltip title="Add to schedule">
          <IconButton
            size="small"
            onClick={onAddSchedule}
            aria-label="Add to schedule"
            sx={{
              ...iconBtnSx,
              color: miui.primary,
              borderColor: miui.borderFocus,
            }}
          >
            <EventNoteRoundedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      ) : null}
    </Box>
  );
}
