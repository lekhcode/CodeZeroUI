import type { CompilerLanguage } from "@/types/compiler.types";
import { api, unwrap } from "./api";

export type StarterCodeTemplatePayload = {
  language: CompilerLanguage;
  starterCode: string;
  functionName: string;
  judgeArgHints?: string | null;
};

export type TestcaseUploadItem = {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
  orderIndex: number;
};

export const problemRuntimeConfigService = {
  uploadTemplate(problemId: string, payload: StarterCodeTemplatePayload) {
    return unwrap<{ template: unknown }>(
      api.post(`/api/v1/problems/by-id/${problemId}/templates`, payload),
    );
  },

  uploadTestcases(problemId: string, items: TestcaseUploadItem[]) {
    return unwrap<{ testcase?: unknown; testcases?: unknown[] }>(
      api.post(`/api/v1/problems/by-id/${problemId}/testcases`, items),
    );
  },
};
