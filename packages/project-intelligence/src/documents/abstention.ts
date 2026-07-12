import type { AnswerStatus, DocumentCitation, DocumentProcessingStatus } from "./types";
import { isAuthoritativeAnswerAllowed } from "./ingestion-state-machine";

export interface AbstentionContext {
  authorized: boolean;
  processingStatus?: DocumentProcessingStatus;
  citations: readonly DocumentCitation[];
  maxScore: number;
  scoreThreshold: number;
  confidence: number;
  confidenceThreshold: number;
  onlySupersededEvidence?: boolean;
  conflictingEvidence?: boolean;
  citationBuildFailed?: boolean;
  detailAbsent?: boolean;
  outsideProjectScope?: boolean;
}

export interface AbstentionDecision {
  shouldAbstain: boolean;
  answerStatus: AnswerStatus;
  reason: string;
}

export function evaluateAbstention(context: AbstentionContext): AbstentionDecision {
  if (!context.authorized || context.outsideProjectScope) {
    return { shouldAbstain: true, answerStatus: "insufficient_permission", reason: "outside_permitted_scope" };
  }
  if (context.processingStatus && !isAuthoritativeAnswerAllowed(context.processingStatus)) {
    return { shouldAbstain: true, answerStatus: "document_not_ready", reason: "document_processing_incomplete" };
  }
  if (context.conflictingEvidence) {
    return { shouldAbstain: true, answerStatus: "conflicting_evidence", reason: "material_conflict" };
  }
  if (context.onlySupersededEvidence) {
    return { shouldAbstain: true, answerStatus: "abstained", reason: "only_superseded_revision_evidence" };
  }
  if (context.citations.length === 0 || context.citationBuildFailed || context.detailAbsent) {
    return { shouldAbstain: true, answerStatus: "abstained", reason: "no_authorized_evidence" };
  }
  if (context.maxScore < context.scoreThreshold || context.confidence < context.confidenceThreshold) {
    return { shouldAbstain: true, answerStatus: "abstained", reason: "below_threshold" };
  }
  return { shouldAbstain: false, answerStatus: "answered", reason: "sufficient_evidence" };
}

export function detectConflictingCitations(citations: readonly DocumentCitation[]): boolean {
  const byKey = new Map<string, Set<string>>();
  for (const citation of citations) {
    const key = `${citation.engineeringDocumentId}:${citation.sectionPath ?? citation.pageStart ?? "body"}`;
    const values = byKey.get(key) ?? new Set<string>();
    values.add(citation.excerpt.trim().toLocaleLowerCase());
    byKey.set(key, values);
  }
  return [...byKey.values()].some((values) => values.size > 1);
}
