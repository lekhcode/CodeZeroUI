import { useLayoutEffect, type RefObject } from "react";
import { Box } from "@mui/material";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { ProblemCatalogItem } from "@/types/api.types";
import { ProblemCatalogListHeader } from "@/components/problems/ProblemCatalogListHeader";
import {
  ProblemCatalogRow,
  ROW_HEIGHT,
  gridColumns,
} from "@/components/problems/ProblemCatalogRow";
import { ProblemCatalogTableChrome } from "@/components/problems/ProblemCatalogTable";
import { PROBLEM_LIST_ROW_HEIGHT } from "@/theme/problemList";

type ProblemCatalogVirtualTableProps = {
  items: ProblemCatalogItem[];
  compact?: boolean;
  flat?: boolean;
  scrollRef?: RefObject<HTMLDivElement | null>;
};

export function ProblemCatalogVirtualTable({
  items,
  compact = false,
  flat = false,
  scrollRef,
}: ProblemCatalogVirtualTableProps) {
  const rowHeight = PROBLEM_LIST_ROW_HEIGHT;
  const cols = gridColumns(compact);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollRef?.current ?? null,
    estimateSize: () => rowHeight,
    overscan: 6,
    getItemKey: (index) => items[index]?.id ?? index,
  });

  useLayoutEffect(() => {
    virtualizer.measure();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- remeasure when list size changes
  }, [items.length]);

  return (
    <ProblemCatalogTableChrome flat={flat}>
      <Box sx={{ bgcolor: "transparent" }}>
        <ProblemCatalogListHeader compact={compact} />
        <Box
          sx={{
            height: virtualizer.getTotalSize(),
            width: "100%",
            position: "relative",
          }}
        >
          {virtualizer.getVirtualItems().map((vi) => {
            const row = items[vi.index];
            if (row === undefined) {
              return null;
            }
            return (
              <Box
                key={row.id}
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: ROW_HEIGHT.compact,
                  transform: `translate3d(0, ${vi.start}px, 0)`,
                }}
              >
                <ProblemCatalogRow
                  row={row}
                  compact={compact}
                  index={vi.index}
                  gridColumns={cols}
                  showDivider={vi.index < items.length - 1}
                />
              </Box>
            );
          })}
        </Box>
      </Box>
    </ProblemCatalogTableChrome>
  );
}
