import type {
  ScheduleTemplate,
  TemplatePreviewPayload,
  TemplatePreviewProblem,
} from "@/types/api.types";
import { ApiRequestError, api, unwrap } from "@/services/api";
import { problemsService } from "@/services/problems.service";

/** Mirrors backend `TOPIC_LEETCODE_TAGS` for legacy API fallback when `/preview` is missing. */
const TOPIC_LEETCODE_TAGS: Record<string, string[]> = {
  "binary-search": ["Binary Search"],
  "dynamic-programming": ["Dynamic Programming"],
  graphs: [
    "Graph",
    "Depth-First Search",
    "Breadth-First Search",
    "Topological Sort",
    "Union Find",
    "Shortest Path",
  ],
  "sliding-window": ["Sliding Window", "Two Pointers"],
};

const STUDY_PLAN_SLUGS = new Set(["blind-75", "top-interview-150", "neetcode-150"]);

const MAX_TOPIC_PREVIEW = 500;

type LegacyPlanProblemsResponse = {
  templateSlug: string;
  templateName: string;
  total: number;
  problems: TemplatePreviewProblem[];
};

function statsFromProblems(problems: TemplatePreviewProblem[]): TemplatePreviewPayload["stats"] {
  let easy = 0;
  let medium = 0;
  let hard = 0;
  for (const p of problems) {
    if (p.difficulty === "EASY") easy += 1;
    else if (p.difficulty === "MEDIUM") medium += 1;
    else hard += 1;
  }
  return { easy, medium, hard };
}

function buildPayload(template: ScheduleTemplate, problems: TemplatePreviewProblem[]): TemplatePreviewPayload {
  return {
    templateSlug: template.slug,
    templateName: template.name,
    templateType: template.type,
    allowsDifficulty: template.allowsDifficulty,
    allowsCount: template.allowsCount,
    defaultCount: template.defaultCount,
    total: problems.length,
    stats: statsFromProblems(problems),
    problems,
  };
}

async function legacyStudyPlanPreview(
  slug: string,
  template: ScheduleTemplate,
): Promise<TemplatePreviewPayload> {
  const plan = await unwrap<LegacyPlanProblemsResponse>(
    api.get(`/api/v1/plans/${encodeURIComponent(slug)}`),
  );
  return buildPayload(template, plan.problems);
}

async function legacyTopicPreview(
  slug: string,
  template: ScheduleTemplate,
): Promise<TemplatePreviewPayload> {
  const tags = TOPIC_LEETCODE_TAGS[slug];
  if (tags === undefined) {
    throw new ApiRequestError(`Topic preview is not configured for "${slug}".`, { status: 404 });
  }

  const problems: TemplatePreviewProblem[] = [];
  let page = 1;

  while (problems.length < MAX_TOPIC_PREVIEW) {
    const pageData = await problemsService.list({ topics: tags, page, limit: 100 });
    for (const item of pageData.items) {
      if (problems.length >= MAX_TOPIC_PREVIEW) break;
      problems.push({
        order: problems.length + 1,
        slug: item.slug,
        title: item.title,
        difficulty: item.difficulty,
        topics: item.topics,
        isPremium: item.isPremium,
        hasDetail: item.hasDetail,
      });
    }
    if (page >= pageData.totalPages || pageData.items.length === 0) break;
    page += 1;
  }

  return buildPayload(template, problems);
}

/**
 * Use unified preview API; on 404 (older production deploy) fall back to `/plans/*` or problem catalog.
 */
export async function fetchTemplatePreview(
  slug: string,
  template: ScheduleTemplate,
): Promise<TemplatePreviewPayload> {
  try {
    const payload = await unwrap<{ preview: TemplatePreviewPayload }>(
      api.get(`/api/v1/schedule-templates/${encodeURIComponent(slug)}/preview`),
    );
    return payload.preview;
  } catch (err) {
    if (!(err instanceof ApiRequestError) || err.status !== 404) {
      throw err;
    }
  }

  if (STUDY_PLAN_SLUGS.has(slug)) {
    return legacyStudyPlanPreview(slug, template);
  }

  if (template.type === "TOPIC") {
    return legacyTopicPreview(slug, template);
  }

  throw new ApiRequestError("Preview is not available on this server yet.", { status: 404 });
}
