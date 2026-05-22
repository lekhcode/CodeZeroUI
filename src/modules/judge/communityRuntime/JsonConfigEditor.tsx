import { lazy, Suspense, useMemo } from "react";
import { Box, CircularProgress, Typography, alpha } from "@mui/material";

const MonacoEditor = lazy(() => import("@monaco-editor/react"));

type JsonConfigEditorProps = {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  /** When set, both panels use the same height for aligned footers */
  fixedHeight?: number;
  minHeight?: number;
  maxHeight?: number;
  ariaLabel: string;
};

export const COMMUNITY_JSON_EDITOR_HEIGHT = 168;

const editorSx = {
  borderRadius: 0.5,
  border: `1px solid ${alpha("#fff", 0.12)}`,
  overflow: "hidden",
  bgcolor: alpha("#010409", 0.92),
} as const;

export function JsonConfigEditor({
  value,
  onChange,
  readOnly = false,
  fixedHeight,
  minHeight = 132,
  maxHeight = 220,
  ariaLabel,
}: JsonConfigEditorProps) {
  const dynamicHeight = useMemo(
    () => Math.min(maxHeight, Math.max(minHeight, 80 + value.split("\n").length * 18)),
    [value, minHeight, maxHeight],
  );
  const height = fixedHeight ?? dynamicHeight;

  return (
    <Box sx={editorSx} role="group" aria-label={ariaLabel}>
      <Suspense
        fallback={
          <Box
            sx={{
              height,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
            }}
          >
            <CircularProgress size={18} sx={{ color: alpha("#fff", 0.35) }} />
            <Typography variant="caption" sx={{ color: alpha("#fff", 0.4) }}>
              Loading editor…
            </Typography>
          </Box>
        }
      >
        <MonacoEditor
          height={height}
          language="json"
          theme="vs-dark"
          value={value}
          onChange={(v) => onChange(v ?? "")}
          options={{
            readOnly,
            minimap: { enabled: false },
            fontSize: 12,
            lineHeight: 18,
            fontFamily: '"JetBrains Mono","Fira Code",ui-monospace,monospace',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 8, bottom: 8 },
            lineNumbers: "on",
            renderLineHighlight: "line",
            folding: true,
            wordWrap: "on",
            tabSize: 2,
            scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
          }}
        />
      </Suspense>
    </Box>
  );
}
