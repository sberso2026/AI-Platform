import type { DocumentCitation, DocumentFinding } from "./types";
import { DocumentIntelligenceError } from "./errors";

export const DOCUMENT_FINDING_TYPES = [
  "missing_specification",
  "conflicting_requirement",
  "superseded_reference",
  "missing_approval",
  "incomplete_document_set",
  "unresolved_technical_requirement",
  "decision_evidence_gap",
  "risk_evidence_gap",
  "outdated_drawing_reference",
  "inconsistent_equipment_identifier",
] as const;

export type DocumentFindingType = (typeof DOCUMENT_FINDING_TYPES)[number];

export interface ProposedCoreMutation {
  entity: "risk" | "issue" | "action" | "decision" | "technical_query";
  payload: Record<string, unknown>;
}

/**
 * Review boundary: findings never mutate Engineering Core directly.
 * A human must approve a proposed mutation before any Core service call.
 */
export interface DocumentFindingReviewBoundary {
  finding: DocumentFinding;
  proposedCoreMutation?: ProposedCoreMutation;
  canMutateCore: false;
}

export function createFindingReviewBoundary(
  finding: DocumentFinding,
  proposedCoreMutation?: ProposedCoreMutation,
): DocumentFindingReviewBoundary {
  if (finding.reviewState === "approved" && !proposedCoreMutation) {
    throw new DocumentIntelligenceError(
      "document_conflict_requires_review",
      "Approved findings that propose Core changes require an explicit mutation payload",
      409,
    );
  }
  return {
    finding,
    proposedCoreMutation,
    canMutateCore: false,
  };
}

export function buildDocumentFinding(input: {
  id: string;
  findingType: DocumentFindingType | string;
  severity?: DocumentFinding["severity"];
  title: string;
  description?: string;
  confidence: number;
  evidence: readonly DocumentCitation[];
  affectedDocumentIds: readonly string[];
  engineeringProjectId?: string;
  suggestedReviewAction?: string;
  model?: string;
  promptVersion?: string;
}): DocumentFinding {
  return {
    id: input.id,
    findingType: input.findingType,
    severity: input.severity ?? "medium",
    title: input.title,
    description: input.description,
    confidence: input.confidence,
    evidence: input.evidence,
    affectedDocumentIds: input.affectedDocumentIds,
    engineeringProjectId: input.engineeringProjectId,
    suggestedReviewAction: input.suggestedReviewAction ?? "human_review",
    reviewState: "pending",
    model: input.model,
    promptVersion: input.promptVersion,
  };
}
