import type { ScheduleType } from "@/types/api.types";
import { getTemplateMeta } from "@/utils/scheduleCopy";

export type TopicPreviewCopy = {
  headline: string;
  teaches: string;
  whyItMatters: string;
  patterns: string[];
};

const TOPIC_COPY: Record<string, TopicPreviewCopy> = {
  "binary-search": {
    headline: "Search sorted spaces with logarithmic efficiency.",
    teaches:
      "Binary search on arrays, search-on-answer patterns, and boundary invariants (left/right/mid).",
    whyItMatters:
      "Interviewers use it to test whether you can reason about monotonic predicates — not just memorize templates.",
    patterns: ["Classic index search", "Lower/upper bound", "Search on answer", "Rotated sorted arrays"],
  },
  "dynamic-programming": {
    headline: "Break overlapping subproblems into optimal substructure.",
    teaches:
      "State definition, transitions, tabulation vs memoization, and space-optimized DP.",
    whyItMatters:
      "DP separates candidates who pattern-match from those who can model state and transitions under pressure.",
    patterns: ["1D/2D DP", "Knapsack variants", "LIS / subsequences", "Grid paths", "State compression"],
  },
  graphs: {
    headline: "Model relationships as nodes and edges.",
    teaches:
      "Traversal (BFS/DFS), shortest paths, topological order, and connectivity (union-find).",
    whyItMatters:
      "Graph thinking appears in scheduling, dependencies, networks, and game boards — often disguised as non-graph problems.",
    patterns: ["BFS / DFS", "Dijkstra", "Topological sort", "Union-Find", "Multi-source BFS"],
  },
  "sliding-window": {
    headline: "Maintain a moving window over sequences.",
    teaches:
      "Fixed vs variable windows, two pointers, and substring/subarray optimization.",
    whyItMatters:
      "Turns O(n²) brute force into O(n) for many array/string problems — a high-frequency interview win.",
    patterns: ["Fixed-size window", "Variable window shrink/expand", "Two pointers", "At-most K distinct"],
  },
  "blind-75": {
    headline: "The iconic curated list for FAANG-style interviews.",
    teaches: "High-yield patterns across arrays, trees, graphs, and DP in interview order.",
    whyItMatters: "Maximizes signal per hour — every problem is chosen for frequency in real loops.",
    patterns: ["Two pointers", "Trees & graphs", "DP classics", "Intervals", "Design-adjacent"],
  },
  "top-interview-150": {
    headline: "LeetCode's comprehensive interview preparation track.",
    teaches: "Broad pattern coverage with increasing depth — from warm-ups to hard capstones.",
    whyItMatters: "Balances breadth and depth when you have months, not weeks, to prepare.",
    patterns: ["All major patterns", "Systematic progression", "Mixed difficulty arcs"],
  },
  "neetcode-150": {
    headline: "Pattern-first roadmap aligned with video explanations.",
    teaches: "NeetCode ordering groups problems by technique for faster mental models.",
    whyItMatters: "Pairs well with visual learners who want structure before volume.",
    patterns: ["Arrays & hashing", "Trees & graphs", "DP path", "Bit manipulation"],
  },
};

export function getPreviewEnrollLabel(type: ScheduleType, enrolled: boolean): string {
  if (enrolled) return "Already in your schedules";
  if (type === "STUDY_PLAN") return "Add plan to schedule";
  if (type === "TOPIC") return "Add topic to schedule";
  return "Add to schedule";
}

export function getTopicPreviewCopy(slug: string, type: ScheduleType): TopicPreviewCopy {
  const catalog = TOPIC_COPY[slug];
  if (catalog !== undefined) return catalog;

  const meta = getTemplateMeta(slug, type);
  return {
    headline: meta.tagline,
    teaches: meta.highlights.join(" · "),
    whyItMatters: "Structured practice on your schedule with measurable daily progress.",
    patterns: meta.highlights,
  };
}
