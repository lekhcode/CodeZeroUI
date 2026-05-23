import { useMemo } from "react";
import { List, type RowComponentProps } from "react-window";
import type { RevisionListRow } from "@/components/RevisionPanel/revision.types";
import { RevisionRow } from "@/components/RevisionPanel/RevisionRow";
import styles from "@/components/RevisionPanel/RevisionPanel.module.css";

const ROW_HEIGHT = 56;
const SECTION_HEIGHT = 32;
const LIST_HEIGHT = 440;

type FlatRow =
  | { type: "section"; key: string; label: string }
  | { type: "item"; key: string; row: RevisionListRow & { kind: "item" } };

type RowData = {
  flatRows: FlatRow[];
  onRevise: (id: string, slug: string) => void;
  marking?: boolean;
};

function Row({
  index,
  style,
  flatRows,
  onRevise,
  marking,
}: RowComponentProps<RowData>) {
  const entry = flatRows[index];
  if (!entry) return null;

  if (entry.type === "section") {
    return (
      <div style={style}>
        <div className={styles.sectionLabel}>{entry.label}</div>
      </div>
    );
  }

  return (
    <div style={style}>
      <RevisionRow item={entry.row.item} onRevise={onRevise} marking={marking} />
    </div>
  );
}

type RevisionListProps = {
  rows: RevisionListRow[];
  emptyMessage: string;
  onRevise: (id: string, slug: string) => void;
  marking?: boolean;
};

export function RevisionList({ rows, emptyMessage, onRevise, marking }: RevisionListProps) {
  const flatRows = useMemo((): FlatRow[] => {
    return rows.map((r) =>
      r.kind === "section"
        ? { type: "section" as const, key: r.key, label: r.label }
        : { type: "item" as const, key: r.key, row: r },
    );
  }, [rows]);

  const uniformHeight = flatRows.every((r) => r.type === "item");

  if (flatRows.length === 0) {
    return <p className={styles.empty}>{emptyMessage}</p>;
  }

  return (
    <div className={styles.listViewport}>
      <List<RowData>
        rowCount={flatRows.length}
        rowHeight={
          uniformHeight
            ? ROW_HEIGHT
            : (index: number) => (flatRows[index]?.type === "section" ? SECTION_HEIGHT : ROW_HEIGHT)
        }
        rowComponent={Row}
        rowProps={{ flatRows, onRevise, marking }}
        style={{ height: LIST_HEIGHT, width: "100%" }}
      />
    </div>
  );
}
