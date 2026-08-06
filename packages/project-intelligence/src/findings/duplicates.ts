/**
 * Phase 8E — Duplicate and conflict intelligence (no automatic destructive merge).
 */
import { createHash } from "node:crypto";
import { FindingsIntelligenceError } from "./errors";
import type { FindingsDuplicateKind } from "./types";

export type FindingsDuplicateSignal = {
  kind: FindingsDuplicateKind;
  leftFindingId: string;
  rightFindingId: string;
  similarity: number;
  evidence: string;
  automaticMergeAllowed: false;
};

export const FINDINGS_DUPLICATE_THRESHOLDS = {
  exact: 1,
  probable: 0.85,
  related: 0.65,
} as const;

export function normalizeFindingTitle(title: string): string {
  return title.trim().toLowerCase().replace(/\s+/g, " ");
}

export function findingTitleFingerprint(title: string): string {
  return createHash("sha256").update(normalizeFindingTitle(title)).digest("hex");
}

export function evaluateDuplicatePair(input: {
  left: { id: string; title: string; projectId?: string };
  right: { id: string; title: string; projectId?: string };
  conflicting?: boolean;
}): FindingsDuplicateSignal | null {
  if (input.left.id === input.right.id) return null;
  const leftFp = findingTitleFingerprint(input.left.title);
  const rightFp = findingTitleFingerprint(input.right.title);
  const exact = leftFp === rightFp;
  const similarity = exact
    ? 1
    : normalizeFindingTitle(input.left.title) === normalizeFindingTitle(input.right.title)
      ? 1
      : tokenJaccard(input.left.title, input.right.title);

  if (input.conflicting) {
    return {
      kind: "conflicting_finding",
      leftFindingId: input.left.id,
      rightFindingId: input.right.id,
      similarity,
      evidence: "Human or system marked conflict; retain both until resolution",
      automaticMergeAllowed: false,
    };
  }
  if (similarity >= FINDINGS_DUPLICATE_THRESHOLDS.exact) {
    return {
      kind: "exact_duplicate",
      leftFindingId: input.left.id,
      rightFindingId: input.right.id,
      similarity,
      evidence: "Exact title fingerprint match",
      automaticMergeAllowed: false,
    };
  }
  if (similarity >= FINDINGS_DUPLICATE_THRESHOLDS.probable) {
    return {
      kind: "probable_duplicate",
      leftFindingId: input.left.id,
      rightFindingId: input.right.id,
      similarity,
      evidence: `Similarity ${similarity.toFixed(2)} ≥ probable threshold`,
      automaticMergeAllowed: false,
    };
  }
  if (similarity >= FINDINGS_DUPLICATE_THRESHOLDS.related) {
    return {
      kind: "related_finding",
      leftFindingId: input.left.id,
      rightFindingId: input.right.id,
      similarity,
      evidence: `Similarity ${similarity.toFixed(2)} ≥ related threshold`,
      automaticMergeAllowed: false,
    };
  }
  return null;
}

function tokenJaccard(a: string, b: string): number {
  const ta = new Set(normalizeFindingTitle(a).split(" ").filter(Boolean));
  const tb = new Set(normalizeFindingTitle(b).split(" ").filter(Boolean));
  if (!ta.size || !tb.size) return 0;
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter += 1;
  return inter / (ta.size + tb.size - inter);
}

export function assertHumanMergeDecision(input: {
  reviewerUserId: string;
  approveMerge: boolean;
}): void {
  if (!input.reviewerUserId.trim()) {
    throw new FindingsIntelligenceError("findings_actor_required", "Merge requires human reviewer", 400);
  }
  if (!input.approveMerge) {
    throw new FindingsIntelligenceError(
      "findings_merge_not_approved",
      "Automatic destructive merge is forbidden",
      403,
    );
  }
}
