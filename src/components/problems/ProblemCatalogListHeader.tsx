import { Box, Typography } from "@mui/material";
import { gridColumns } from "@/components/problems/ProblemCatalogRow";
import { problemListHeaderCellSx, problemListHeaderRowSx } from "@/theme/problemList";

type ProblemCatalogListHeaderProps = {
  compact: boolean;
};

export function ProblemCatalogListHeader({ compact }: ProblemCatalogListHeaderProps) {
  const cols = gridColumns(compact);
  const cell = (label: string, align: "left" | "right" = "left") => (
    <Typography variant="caption" sx={problemListHeaderCellSx(align)}>
      {label}
    </Typography>
  );

  return (
    <Box sx={problemListHeaderRowSx(cols)}>
      {cell("#")}
      <span />
      {cell("Title")}
      {cell("Level", "right")}
      {!compact ? cell("Topics") : null}
      <span />
    </Box>
  );
}
