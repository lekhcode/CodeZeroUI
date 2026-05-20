import { Box } from "@mui/material";
import type { ProblemCatalogItem } from "@/types/api.types";
import { ProblemCatalogListHeader } from "@/components/problems/ProblemCatalogListHeader";
import { ProblemCatalogRow, gridColumns } from "@/components/problems/ProblemCatalogRow";
import { ProblemCatalogTableChrome } from "@/components/problems/ProblemCatalogTable";
import { miui } from "@/theme/theme";

type ProblemCatalogStaticTableProps = {
  items: ProblemCatalogItem[];
  compact?: boolean;
  flat?: boolean;
};

/** Plain list (no virtualizer) — use for small previews e.g. dashboard. */
export function ProblemCatalogStaticTable({
  items,
  compact = false,
  flat = false,
}: ProblemCatalogStaticTableProps) {
  const cols = gridColumns(compact);

  return (
    <ProblemCatalogTableChrome flat={flat}>
      <Box sx={{ bgcolor: flat ? "transparent" : miui.paper }}>
        <ProblemCatalogListHeader compact={compact} />
        <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
          {items.map((row, index) => (
            <Box component="li" key={row.id}>
              <ProblemCatalogRow
                row={row}
                compact={compact}
                index={index}
                gridColumns={cols}
                showDivider={index < items.length - 1}
              />
            </Box>
          ))}
        </Box>
      </Box>
    </ProblemCatalogTableChrome>
  );
}
