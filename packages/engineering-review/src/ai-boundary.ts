import type { UntrustedDocumentText } from "./trust-boundary";
import type { ReviewScope } from "./review-scope";
import type { ReviewFindingCategory } from "./finding";
import type { ReviewSeverity } from "./severity";
import type { EvidenceDraft } from "./evidence";
import type { ReviewOwnership } from "./ownership";
import type { FindingEvidence } from "./evidence";

/**
 * AI-assisted review boundary. Implementations are untrusted until findings
 * are constructed and evidence is verified. Unit tests must not call networks.
 */
export type ReviewInferenceCandidate = {
  title: string;
  description: string;
  category: ReviewFindingCategory;
  proposedSeverity: ReviewSeverity;
  proposedConfidenceScore: number;
  evidence: readonly EvidenceDraft[];
  requirementReferences?: readonly string[];
  reasoningSummary: string;
  recommendedAction: string;
};

export interface ReviewInferenceProvider {
  proposeFindings(input: {
    documents: readonly UntrustedDocumentText[];
    scope: ReviewScope;
  }): Promise<readonly ReviewInferenceCandidate[]>;
}

export interface EvidenceResolver {
  resolve(
    ref: Pick<EvidenceDraft, "documentId" | "span" | "revision" | "chunkId">,
    ownership: ReviewOwnership,
  ): FindingEvidence | null;
}

export class RejectingInferenceProvider implements ReviewInferenceProvider {
  async proposeFindings(_input: {
    documents: readonly UntrustedDocumentText[];
    scope: ReviewScope;
  }): Promise<readonly ReviewInferenceCandidate[]> {
    return [];
  }
}
