import { useCallback, useMemo, useState, type ReactNode } from "react";
import {
  Box,
  Button,
  Chip,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
  alpha,
} from "@mui/material";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import { judgeUi } from "@/modules/judge/judgeWorkspaceUi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CompilerLanguage } from "@/types/compiler.types";
import { COMPILER_LANGUAGES } from "@/types/compiler.types";
import type { JudgeMeta } from "@/types/judge.types";
import { problemRuntimeConfigService } from "@/services/problemRuntimeConfig.service";
import { queryKeys } from "@/hooks/queryKeys";
import { COMMUNITY_JSON_EDITOR_HEIGHT, JsonConfigEditor } from "./JsonConfigEditor";
import {
  buildStarterCodeExample,
  buildTestcasesExample,
  parseStarterCodeJson,
  parseTestcasesJson,
} from "./communityRuntime.validation";

type CommunityRuntimeConfigPanelProps = {
  problemId: string;
  slug: string;
  problemTitle: string;
  judgeMeta: JudgeMeta;
  isAuthenticated: boolean;
};

type ConfirmKind = "starter" | "testcases";

const STARTER_PLACEHOLDER = `{
  "language": "java",
  "functionName": "solve",
  "judgeArgHints": "Describe parameters for the judge harness.",
  "starterCode": "class Solution {\\n    public void solve() {\\n        \\n    }\\n}"
}`;

const TESTCASE_PLACEHOLDER = `[
  {
    "input": "{\\"args\\":[[1,2,3]]}",
    "expectedOutput": "6",
    "isHidden": false,
    "orderIndex": 1
  }
]`;

function configStatus(judgeMeta: JudgeMeta): "empty" | "partial" | "ready" {
  const hasTemplates = judgeMeta.languages.length > 0;
  const hasCases = judgeMeta.visibleTestcases.length > 0;
  if (hasTemplates && hasCases) return "ready";
  if (hasTemplates || hasCases) return "partial";
  return "empty";
}

export function CommunityRuntimeConfigPanel({
  problemId,
  slug,
  problemTitle,
  judgeMeta,
  isAuthenticated,
}: CommunityRuntimeConfigPanelProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [starterDraft, setStarterDraft] = useState("");
  const [testcaseDraft, setTestcaseDraft] = useState("");
  const [starterTouched, setStarterTouched] = useState(false);
  const [testcaseTouched, setTestcaseTouched] = useState(false);
  const [starterError, setStarterError] = useState<string | null>(null);
  const [testcaseError, setTestcaseError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmKind, setConfirmKind] = useState<ConfirmKind>("starter");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const status = configStatus(judgeMeta);
  const hasTemplates = judgeMeta.languages.length > 0;
  const hasVisibleCases = judgeMeta.visibleTestcases.length > 0;

  const defaultLanguage = useMemo((): CompilerLanguage | null => {
    const ready = judgeMeta.languages.find((l) => l.judgeReadyForLanguage);
    if (ready?.id && isCompilerLang(ready.id)) return ready.id;
    const any = judgeMeta.languages[0];
    return any?.id && isCompilerLang(any.id) ? any.id : "java";
  }, [judgeMeta.languages]);

  const loadStarterFromMeta = useCallback(() => {
    const row = judgeMeta.languages.find((l) => l.id === defaultLanguage) ?? judgeMeta.languages[0];
    if (row) {
      setStarterDraft(
        buildStarterCodeExample(row.id as CompilerLanguage, row.functionName, row.starterCode),
      );
      return;
    }
    setStarterDraft(STARTER_PLACEHOLDER);
  }, [defaultLanguage, judgeMeta.languages]);

  const loadTestcasesFromMeta = useCallback(() => {
    if (judgeMeta.visibleTestcases.length > 0) {
      setTestcaseDraft(
        buildTestcasesExample(
          judgeMeta.visibleTestcases.map((tc) => ({
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            isHidden: false,
            orderIndex: tc.orderIndex,
          })),
        ),
      );
      return;
    }
    setTestcaseDraft(TESTCASE_PLACEHOLDER);
  }, [judgeMeta.visibleTestcases]);

  const handleExpand = () => {
    setOpen((v) => {
      const next = !v;
      if (next && !starterTouched && starterDraft === "") loadStarterFromMeta();
      if (next && !testcaseTouched && testcaseDraft === "") loadTestcasesFromMeta();
      return next;
    });
  };

  const templateMutation = useMutation({
    mutationFn: (raw: string) => {
      const parsed = parseStarterCodeJson(raw);
      if (!parsed.ok) throw new Error(parsed.error);
      return problemRuntimeConfigService.uploadTemplate(problemId, parsed.value);
    },
    onSuccess: async () => {
      setConfirmOpen(false);
      setSuccessMsg("Starter code template saved for this problem.");
      await queryClient.invalidateQueries({ queryKey: queryKeys.judgeMeta(slug) });
      await queryClient.refetchQueries({ queryKey: queryKeys.judgeMeta(slug) });
    },
    onError: (e: Error) => setStarterError(e.message),
  });

  const testcaseMutation = useMutation({
    mutationFn: (raw: string) => {
      const parsed = parseTestcasesJson(raw);
      if (!parsed.ok) throw new Error(parsed.error);
      return problemRuntimeConfigService.uploadTestcases(problemId, parsed.value);
    },
    onSuccess: async () => {
      setConfirmOpen(false);
      setSuccessMsg("Testcases added to this problem.");
      await queryClient.invalidateQueries({ queryKey: queryKeys.judgeMeta(slug) });
      await queryClient.refetchQueries({ queryKey: queryKeys.judgeMeta(slug) });
    },
    onError: (e: Error) => setTestcaseError(e.message),
  });

  const requestUpload = (kind: ConfirmKind) => {
    setSuccessMsg(null);
    if (kind === "starter") {
      const parsed = parseStarterCodeJson(starterDraft);
      if (!parsed.ok) {
        setStarterError(parsed.error);
        return;
      }
      setStarterError(null);
    } else {
      const parsed = parseTestcasesJson(testcaseDraft);
      if (!parsed.ok) {
        setTestcaseError(parsed.error);
        return;
      }
      setTestcaseError(null);
    }
    setConfirmKind(kind);
    setConfirmOpen(true);
  };

  const confirmUpload = () => {
    if (confirmKind === "starter") {
      setStarterError(null);
      templateMutation.mutate(starterDraft);
    } else {
      setTestcaseError(null);
      testcaseMutation.mutate(testcaseDraft);
    }
  };

  const statusSummary =
    status === "ready"
      ? `${judgeMeta.languages.length} lang · ${judgeMeta.visibleTestcases.length} sample cases`
      : status === "partial"
        ? hasTemplates
          ? "Templates only"
          : "Testcases only"
        : "Not configured";

  const headerChip =
    status === "ready" ? (
      <Chip
        size="small"
        icon={<CheckCircleOutlineRoundedIcon sx={{ fontSize: "14px !important" }} />}
        label="Active"
        sx={{
          height: 20,
          fontSize: 10,
          fontWeight: 700,
          bgcolor: alpha("#3fb950", 0.12),
          color: "#7ee787",
          border: `1px solid ${alpha("#3fb950", 0.28)}`,
          "& .MuiChip-icon": { color: "#7ee787" },
        }}
      />
    ) : status === "partial" ? (
      <Chip
        size="small"
        label="Partial"
        sx={{
          height: 20,
          fontSize: 10,
          fontWeight: 700,
          bgcolor: alpha("#d29922", 0.1),
          color: alpha("#e3b341", 0.95),
          border: `1px solid ${alpha("#d29922", 0.25)}`,
        }}
      />
    ) : null;

  const uploading = templateMutation.isPending || testcaseMutation.isPending;

  return (
    <>
      <Box
        sx={{
          flexShrink: 0,
          borderTop: `1px solid ${alpha("#388bfd", 0.22)}`,
          borderBottom: `1px solid ${judgeUi.hairline}`,
          bgcolor: open ? alpha("#388bfd", 0.1) : alpha("#388bfd", 0.07),
        }}
      >
        <Box
          component="button"
          type="button"
          onClick={handleExpand}
          aria-expanded={open}
          sx={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            px: 1.25,
            py: 0.8,
            border: "none",
            borderLeft: "2px solid #388bfd",
            cursor: "pointer",
            bgcolor: "transparent",
            color: "#e6edf3",
            transition: "background 0.15s ease",
            "&:hover": { bgcolor: alpha("#388bfd", 0.12) },
          }}
        >
          <TuneRoundedIcon sx={{ fontSize: 16, color: "#79c0ff", flexShrink: 0 }} />
          <IconButton
            size="small"
            tabIndex={-1}
            aria-hidden
            sx={{
              p: 0.2,
              ml: -0.25,
              color: alpha("#fff", 0.65),
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
            }}
          >
            <ExpandMoreRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: "0.02em",
              flex: 1,
              textAlign: "left",
              color: alpha("#fff", 0.92),
            }}
          >
            Community templates
          </Typography>
          {!open ? headerChip : null}
          {!open ? (
            <Typography variant="caption" sx={{ color: alpha("#fff", 0.62), fontWeight: 600, fontSize: 11 }}>
              {statusSummary}
            </Typography>
          ) : null}
          {!open ? (
            <Typography
              variant="caption"
              sx={{
                color: "#79c0ff",
                fontWeight: 700,
                fontSize: 10,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              {open ? "Hide" : "Expand"}
            </Typography>
          ) : null}
        </Box>

        <Collapse in={open} timeout={200} unmountOnExit>
          <Box
            sx={{
              px: { xs: 1, sm: 1.25 },
              pb: 1.25,
              pt: 0.25,
              maxHeight: { xs: "min(52vh, 420px)", sm: "min(46vh, 380px)" },
              overflowY: "auto",
              overflowX: "hidden",
            }}
            className="app-scroll"
          >
            {successMsg !== null ? (
              <Typography variant="caption" sx={{ color: "#7ee787", fontWeight: 600, display: "block", mb: 1 }}>
                {successMsg}
              </Typography>
            ) : null}

            {status === "empty" ? (
              <Typography variant="caption" sx={{ color: alpha("#fff", 0.42), display: "block", mb: 1.25, lineHeight: 1.5 }}>
                No runtime configuration uploaded yet. Contribute starter code and testcases so others can run and submit
                without setting up the judge themselves.
              </Typography>
            ) : (
              <Typography variant="caption" sx={{ color: alpha("#fff", 0.42), display: "block", mb: 1.25, lineHeight: 1.5 }}>
                This problem already has community runtime configuration. Most solvers use it automatically — upload only
                when you want to improve or extend it.
              </Typography>
            )}

            {!isAuthenticated ? (
              <Typography variant="caption" sx={{ color: alpha("#58a6ff", 0.9), display: "block", mb: 1 }}>
                Sign in to contribute starter code or testcases.
              </Typography>
            ) : null}

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 1.25,
                alignItems: "stretch",
              }}
            >
              <RuntimeUploadSection
                title="Starter code"
                statusLabel={
                  hasTemplates
                    ? `${judgeMeta.languages.length} language${judgeMeta.languages.length === 1 ? "" : "s"}`
                    : "None yet"
                }
                statusActive={hasTemplates}
                helper="If the uploaded starter code does not match this problem’s function signature, user submissions may fail to compile."
                secondaryHelper="Updates replace the template for that language. Match the official function name and parameter types."
                error={starterError}
                onReset={() => {
                  setStarterTouched(false);
                  loadStarterFromMeta();
                  setStarterError(null);
                }}
                onUpload={() => requestUpload("starter")}
                uploadDisabled={!isAuthenticated || uploading}
                uploadLabel={hasTemplates ? "Update template" : "Upload template"}
                editor={
                  open ? (
                    <JsonConfigEditor
                      ariaLabel="Starter code JSON"
                      fixedHeight={COMMUNITY_JSON_EDITOR_HEIGHT}
                      value={starterDraft}
                      onChange={(v) => {
                        setStarterTouched(true);
                        setStarterDraft(v);
                        setStarterError(null);
                      }}
                    />
                  ) : null
                }
                activeLanguages={judgeMeta.languages.map((l) => l.id)}
              />

              <RuntimeUploadSection
                title="Testcases"
                statusLabel={
                  hasVisibleCases
                    ? `${judgeMeta.visibleTestcases.length} visible sample${judgeMeta.visibleTestcases.length === 1 ? "" : "s"}`
                    : "None yet"
                }
                statusActive={hasVisibleCases}
                helper='Each item needs input (JSON string, often {"args":[...]}), expectedOutput, isHidden, and orderIndex.'
                secondaryHelper="Uploads append new testcases; existing cases remain. Use orderIndex to control harness order."
                error={testcaseError}
                onReset={() => {
                  setTestcaseTouched(false);
                  loadTestcasesFromMeta();
                  setTestcaseError(null);
                }}
                onUpload={() => requestUpload("testcases")}
                uploadDisabled={!isAuthenticated || uploading}
                uploadLabel={hasVisibleCases ? "Add / update cases" : "Upload testcases"}
                editor={
                  open ? (
                    <JsonConfigEditor
                      ariaLabel="Testcases JSON"
                      fixedHeight={COMMUNITY_JSON_EDITOR_HEIGHT}
                      value={testcaseDraft}
                      onChange={(v) => {
                        setTestcaseTouched(true);
                        setTestcaseDraft(v);
                        setTestcaseError(null);
                      }}
                    />
                  ) : null
                }
              />
            </Box>
          </Box>
        </Collapse>
      </Box>

      <Dialog
        open={confirmOpen}
        onClose={() => {
          if (!uploading) setConfirmOpen(false);
        }}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              bgcolor: "#161b22",
              color: "#e6edf3",
              border: `1px solid ${alpha("#fff", 0.1)}`,
              borderRadius: 1.5,
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: "1rem", pb: 0.5 }}>
          Upload runtime configuration
        </DialogTitle>
        <DialogContent sx={{ pt: 0 }}>
          <Typography variant="body2" sx={{ color: alpha("#fff", 0.72), lineHeight: 1.6, mb: 1.5 }}>
            You are uploading runtime configuration for this problem. Please verify:
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2.25, color: alpha("#fff", 0.62), fontSize: 13, lineHeight: 1.65 }}>
            <li>
              Problem: <strong style={{ color: "#e6edf3" }}>{problemTitle}</strong>
            </li>
            <li>Function signature matches the statement</li>
            <li>JSON is valid and fields match the expected schema</li>
            {confirmKind === "testcases" ? <li>Testcase input/output pairs are correct for this problem</li> : null}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 1.5, pt: 0 }}>
          <Button
            onClick={() => setConfirmOpen(false)}
            disabled={uploading}
            sx={{ textTransform: "none", color: alpha("#fff", 0.65) }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={uploading}
            onClick={() => confirmUpload()}
            startIcon={<CloudUploadOutlinedIcon />}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              bgcolor: "#238636",
              "&:hover": { bgcolor: "#2ea043" },
            }}
          >
            {uploading ? "Uploading…" : "Confirm upload"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

function isCompilerLang(id: string): id is CompilerLanguage {
  return COMPILER_LANGUAGES.some((l) => l.id === id);
}

type RuntimeUploadSectionProps = {
  title: string;
  statusLabel: string;
  statusActive: boolean;
  helper: string;
  secondaryHelper?: string;
  error: string | null;
  onReset: () => void;
  onUpload: () => void;
  uploadDisabled: boolean;
  uploadLabel: string;
  editor: ReactNode;
  activeLanguages?: string[];
};

/** Same reserved height so starter/testcase columns align when side by side */
const SECTION_HEADER_MIN_H = 28;
const SECTION_HELPER_MIN_H = 64;

function RuntimeUploadSection({
  title,
  statusLabel,
  statusActive,
  helper,
  secondaryHelper,
  error,
  onReset,
  onUpload,
  uploadDisabled,
  uploadLabel,
  editor,
  activeLanguages,
}: RuntimeUploadSectionProps) {
  return (
    <Box
      sx={{
        minWidth: 0,
        height: "100%",
        borderRadius: judgeUi.panelRadius,
        border: `1px solid ${judgeUi.hairlineStrong}`,
        bgcolor: alpha("#010409", 0.5),
        p: 0.85,
        display: "flex",
        flexDirection: "column",
        gap: 0.65,
      }}
    >
      <Box sx={{ flexShrink: 0, minHeight: SECTION_HEADER_MIN_H }}>
        <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", flexWrap: "wrap" }}>
          <Typography sx={{ fontWeight: 800, fontSize: 12, color: alpha("#fff", 0.82) }}>{title}</Typography>
          <Chip
            size="small"
            label={statusLabel}
            sx={{
              height: 18,
              fontSize: 10,
              fontWeight: 700,
              bgcolor: statusActive ? alpha("#388bfd", 0.12) : alpha("#fff", 0.04),
              color: statusActive ? "#79c0ff" : alpha("#fff", 0.45),
              border: `1px solid ${alpha("#fff", statusActive ? 0.14 : 0.08)}`,
            }}
          />
        </Stack>
      </Box>

      <Box sx={{ flexShrink: 0, minHeight: SECTION_HELPER_MIN_H }}>
        {activeLanguages?.length ? (
          <Typography variant="caption" sx={{ color: alpha("#fff", 0.38), fontSize: 10, display: "block", mb: 0.35 }}>
            Languages: {activeLanguages.join(" · ")}
          </Typography>
        ) : null}
        <Typography variant="caption" sx={{ color: alpha("#fff", 0.38), lineHeight: 1.45, display: "block" }}>
          {helper}
        </Typography>
        {secondaryHelper ? (
          <Typography variant="caption" sx={{ color: alpha("#fff", 0.28), lineHeight: 1.4, display: "block", mt: 0.35 }}>
            {secondaryHelper}
          </Typography>
        ) : null}
      </Box>

      <Box sx={{ flexShrink: 0, height: COMMUNITY_JSON_EDITOR_HEIGHT, minHeight: COMMUNITY_JSON_EDITOR_HEIGHT }}>
        {editor}
      </Box>

      {error !== null ? (
        <Typography variant="caption" sx={{ color: "#f85149", fontWeight: 600, flexShrink: 0 }}>
          {error}
        </Typography>
      ) : null}

      <Stack
        direction="row"
        spacing={0.75}
        sx={{ flexShrink: 0, mt: "auto", pt: 0.5, flexWrap: "wrap", alignItems: "center" }}
      >
        <Button
          size="small"
          variant="text"
          onClick={onReset}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            fontSize: 11,
            color: alpha("#fff", 0.5),
            minWidth: 0,
            px: 0.75,
          }}
        >
          Reset editor
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button
          size="small"
          variant="outlined"
          disabled={uploadDisabled}
          onClick={onUpload}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            fontSize: 11,
            color: alpha("#fff", 0.88),
            borderColor: alpha("#fff", 0.2),
            py: 0.35,
          }}
        >
          {uploadLabel}
        </Button>
      </Stack>
    </Box>
  );
}
