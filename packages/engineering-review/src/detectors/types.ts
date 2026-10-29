import type { UntrustedDocumentText } from "../trust-boundary";
import type { ReviewDocumentRole } from "../review-package";
import type { ReviewOwnership } from "../ownership";
import type { EvidenceDraft } from "../evidence";
import type { ReviewFindingCategory } from "../finding";
import type { ReviewSeverity } from "../severity";
import type { MvpReviewType } from "../review-scope";
import type { ReviewScope } from "../review-scope";
import type { EngineeringFact } from "../facts";
import type { ReferencedRevision } from "../extract";

export type ExtractedRequirement = {
  id: string;
  text: string;
  mappedEvidence: boolean;
};

export type DeclaredAssumption = {
  id: string;
  text: string;
  supported: boolean;
};

export type ReviewDocumentFixture = ReviewOwnership & {
  documentId: string;
  revision: string;
  role: ReviewDocumentRole;
  documentNumber?: string;
  inclusion?: "current" | "superseded";
  fields: Readonly<Record<string, string>>;
  extractedText: UntrustedDocumentText;
  requirements?: readonly ExtractedRequirement[];
  assumptions?: readonly DeclaredAssumption[];
  evidenceKeys?: readonly string[];
};

export type DetectorDetection = {
  detectionKey: string;
  ruleId: string;
  ruleVersion: string;
  reviewType: MvpReviewType;
  category: ReviewFindingCategory;
  title: string;
  description: string;
  severity: ReviewSeverity;
  confidenceScore: number;
  evidence: EvidenceDraft[];
  requirementReferences: string[];
  reasoningSummary: string;
  recommendedAction: string;
  origin?: "detector" | "ai_candidate";
};

export type DetectorContext = {
  ownership: ReviewOwnership;
  documents: readonly ReviewDocumentFixture[];
  scope: ReviewScope;
  facts?: readonly EngineeringFact[];
  revisionRefs?: readonly ReferencedRevision[];
};

export type ReviewDetector = {
  ruleId: string;
  detect(context: DetectorContext): readonly DetectorDetection[];
};

export function evidenceFromField(
  doc: ReviewDocumentFixture,
  field: string,
  value: string,
): EvidenceDraft {
  return {
    evidenceId: `${doc.documentId}:${field}`,
    documentId: doc.documentId,
    tenantId: doc.tenantId,
    workspaceId: doc.workspaceId,
    projectId: doc.projectId,
    revision: doc.revision,
    span: `${field}=${value}`,
    sourceType: "structured_field",
  };
}
