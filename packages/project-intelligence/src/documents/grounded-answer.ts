import type { AnswerStatus, DocumentCitation, GroundedAnswerContract } from "./types";
import { DocumentIntelligenceError } from "./errors";

export interface BuildGroundedAnswerInput {
  draftAnswer?: string;
  answerStatus?: AnswerStatus;
  confidence: number;
  citations: readonly DocumentCitation[];
  evidence?: readonly DocumentCitation[];
  documentsUsed?: readonly string[];
  retrievalTraceId: string;
  model?: string;
  promptVersion?: string;
  processingVersions?: readonly string[];
  warnings?: readonly string[];
  reviewState?: string;
  generatedAt?: string;
}

export function buildGroundedAnswer(input: BuildGroundedAnswerInput): GroundedAnswerContract {
  const answerStatus = input.answerStatus ?? (input.draftAnswer ? "answered" : "abstained");
  const citations = input.citations;
  const requiresCitations = answerStatus === "answered" || answerStatus === "partially_answered";

  if (requiresCitations && citations.length === 0) {
    throw new DocumentIntelligenceError(
      "document_citation_required",
      "Factual answers require at least one citation",
      422,
      { answerStatus },
    );
  }

  if (answerStatus === "answered" && !input.draftAnswer?.trim()) {
    throw new DocumentIntelligenceError(
      "document_insufficient_evidence",
      "Answered status requires non-empty answer text",
      422,
    );
  }

  return {
    answer: input.draftAnswer,
    answerStatus,
    confidence: input.confidence,
    citations,
    evidence: input.evidence ?? citations,
    documentsUsed: input.documentsUsed ?? [...new Set(citations.map((citation) => citation.engineeringDocumentId))],
    retrievalTraceId: input.retrievalTraceId,
    model: input.model,
    promptVersion: input.promptVersion,
    processingVersions: input.processingVersions ?? [],
    warnings: input.warnings ?? [],
    reviewState: input.reviewState,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
  };
}
