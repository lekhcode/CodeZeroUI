import { useCallback, useLayoutEffect, useRef, type RefObject } from "react";
import { Box } from "@mui/material";
import { observeElementOffset, useVirtualizer } from "@tanstack/react-virtual";
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
  /** Changes when catalog filters change — remeasures and syncs scroll offset. */
  listEpochKey?: string;
};

/** Distance from scroll-root content top to the virtual row container. */
function measureListAnchorOffset(scrollEl: HTMLElement, listEl: HTMLElement): number {
  const scrollRect = scrollEl.getBoundingClientRect();
  const listRect = listEl.getBoundingClientRect();
  return Math.max(0, Math.round(listRect.top - scrollRect.top + scrollEl.scrollTop));
}

export function ProblemCatalogVirtualTable({
  items,
  compact = false,
  flat = false,
  scrollRef,
  listEpochKey = "",
}: ProblemCatalogVirtualTableProps) {
  const rowHeight = PROBLEM_LIST_ROW_HEIGHT;
  const cols = gridColumns(compact);
  const listBodyRef = useRef<HTMLDivElement>(null);
  /** Ref only — scroll observer reads this; avoids baking margin into row translateY. */
  const listAnchorOffsetRef = useRef(0);

  const syncListAnchor = useCallback(() => {
    const scrollEl = scrollRef?.current;
    const listEl = listBodyRef.current;
    if (!scrollEl || !listEl) {
      listAnchorOffsetRef.current = 0;
      return;
    }
    listAnchorOffsetRef.current = measureListAnchorOffset(scrollEl, listEl);
  }, [scrollRef]);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollRef?.current ?? null,
    estimateSize: () => rowHeight,
    overscan: 6,
    getItemKey: (index) => items[index]?.id ?? index,
    observeElementOffset: (instance, cb) =>
      observeElementOffset(instance, (offset, isScrolling) => {
        cb(Math.max(0, offset - listAnchorOffsetRef.current), isScrolling);
      }),
  });

  useLayoutEffect(() => {
    syncListAnchor();
    const scrollEl = scrollRef?.current;
    const listEl = listBodyRef.current;
    if (!scrollEl || !listEl) return;

    const ro = new ResizeObserver(() => {
      syncListAnchor();
      virtualizer.measure();
    });
    ro.observe(scrollEl);
    ro.observe(listEl);
    scrollEl.addEventListener("scroll", syncListAnchor, { passive: true });
    window.addEventListener("resize", syncListAnchor, { passive: true });

    return () => {
      ro.disconnect();
      scrollEl.removeEventListener("scroll", syncListAnchor);
      window.removeEventListener("resize", syncListAnchor);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- measure via epoch effect; avoid virtualizer dep loop
  }, [scrollRef, syncListAnchor, listEpochKey, items.length]);

  useLayoutEffect(() => {
    syncListAnchor();
    virtualizer.measure();

    const scrollEl = scrollRef?.current;
    if (!scrollEl || items.length === 0) return;

    const anchor = listAnchorOffsetRef.current;
    const listSpan = anchor + virtualizer.getTotalSize();
    const maxScrollTop = Math.max(0, listSpan - scrollEl.clientHeight);
    if (scrollEl.scrollTop > maxScrollTop + 1) {
      scrollEl.scrollTop = maxScrollTop;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- epoch + count drive sync
  }, [listEpochKey, items.length]);

  return (
    <ProblemCatalogTableChrome flat={flat}>
      <Box sx={{ bgcolor: "transparent" }}>
        <ProblemCatalogListHeader compact={compact} />
        <Box
          ref={listBodyRef}
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
