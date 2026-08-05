/**
 * Phase 8C — Typed handoff from Document Intelligence → Findings Intelligence.
 * DI emits candidates only; Findings Intelligence owns lifecycle/disposition.
 * DI never creates Engineering Core decisions/actions/risks/issues/TQs.
 */
import type { DocumentCitation } from "./types";
import {
  buildDocumentFinding,
  createFindingReviewBoundary,
  type DocumentFindingType,
  type ProposedCoreMutation,
} from "./findings";

export type FindingsHandoffSeverity = "low" | "medium" | "high" | "critical";

export interface DocumentFindingsCandidateHandoff {
  kind: "document_intelligence.candidate_finding";
  featureKey: "document_intelligence";
  targetFeatureKey: "findings_intelligence";
  candidateFindingId: string;
  findingType: DocumentFindingType | string;
  title: string;
  description?: string;
  severitySuggestion: FindingsHandoffSeverity;
  confidence: number;
  evidence: readonly DocumentCitation[];
  engineeringDocumentId: string;
  engineeringDocumentRevision?: string;
  engineeringProjectId?: string;
  engineeringAssetId?: string;
  proposedCategory?: string;
  traceId: string;
  /** Always false — Core mutation requires Findings + human approval. */
  mayMutateEngineeringCore: false;
  proposedCoreMutation?: ProposedCoreMutation;
}

export function createDocumentFindingsHandoff(input: {
  id: string;
  findingType: DocumentFindingType | string;
  title: string;
  description?: string;
  severitySuggestion?: FindingsHandoffSeverity;
  confidence: number;
  evidence: readonly DocumentCitation[];
  engineeringDocumentId: string;
  engineeringDocumentRevision?: string;
  engineeringProjectId?: string;
  engineeringAssetId?: string;
  proposedCategory?: string;
  traceId: string;
  proposedCoreMutation?: ProposedCoreMutation;
  model?: string;
  promptVersion?: string;
}): DocumentFindingsCandidateHandoff {
  const finding = buildDocumentFinding({
    id: input.id,
    findingType: input.findingType,
    severity: input.severitySuggestion ?? "medium",
    title: input.title,
    description: input.description,
    confidence: input.confidence,
    evidence: input.evidence,
    affectedDocumentIds: [input.engineeringDocumentId],
    engineeringProjectId: input.engineeringProjectId,
    model: input.model,
    promptVersion: input.promptVersion,
  });
  const boundary = createFindingReviewBoundary(finding, input.proposedCoreMutation);
  return {
    kind: "document_intelligence.candidate_finding",
    featureKey: "document_intelligence",
    targetFeatureKey: "findings_intelligence",
    candidateFindingId: finding.id,
    findingType: finding.findingType,
    title: finding.title,
    description: finding.description,
    severitySuggestion: (finding.severity ?? "medium") as FindingsHandoffSeverity,
    confidence: finding.confidence,
    evidence: finding.evidence,
    engineeringDocumentId: input.engineeringDocumentId,
    engineeringDocumentRevision: input.engineeringDocumentRevision,
    engineeringProjectId: input.engineeringProjectId,
    engineeringAssetId: input.engineeringAssetId,
    proposedCategory: input.proposedCategory,
    traceId: input.traceId,
    mayMutateEngineeringCore: false,
    proposedCoreMutation: boundary.proposedCoreMutation,
  };
}

export function assertFindingsHandoffCannotMutateCore(
  handoff: DocumentFindingsCandidateHandoff,
): void {
  if (handoff.mayMutateEngineeringCore !== false) {
    throw new Error("Findings handoff must not mutate Engineering Core");
  }
  if (handoff.targetFeatureKey !== "findings_intelligence") {
    throw new Error("Findings handoff target must be findings_intelligence");
  }
}
