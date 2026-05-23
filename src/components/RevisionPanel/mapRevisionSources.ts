import type { RevisionSource } from "@/components/RevisionPanel/revisionUtils";
import type { RevisionDifficulty, RevisionStatus } from "@/components/RevisionPanel/revision.types";
import type { AutoRevisionItem } from "@/types/autoRevision.types";

function toDifficulty(d: string): RevisionDifficulty {
  const key = d.toLowerCase();
  if (key === "easy" || key === "medium" || key === "hard") return key;
  return "medium";
}

function toStatus(item: AutoRevisionItem): RevisionStatus {
  if (item.isRevised) return "revised";
  if (item.isOverdue) return "missed";
  return "pending";
}

function toPhase(type: AutoRevisionItem["revisionType"]): RevisionSource["phase"] {
  if (type === "DAILY") return "daily";
  if (type === "WEEKLY") return "weekly";
  return "monthly";
}

export function mapAutoRevisionItem(item: AutoRevisionItem): RevisionSource {
  return {
    id: item.id,
    slug: item.slug,
    problemId: item.problemId,
    problemName: item.problemTitle,
    topic: item.primaryTopic,
    difficulty: toDifficulty(item.difficulty),
    solvedOn: item.solvedAt.slice(0, 10),
    scheduledFor: item.scheduledFor,
    revisedOn: item.revisedAt?.slice(0, 10),
    phase: toPhase(item.revisionType),
    status: toStatus(item),
  };
}

export function mapAutoRevisionItems(items: AutoRevisionItem[]): RevisionSource[] {
  return items.map(mapAutoRevisionItem);
}
