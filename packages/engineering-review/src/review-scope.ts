import { failClosed } from "./errors";

export const MVP_REVIEW_TYPES = [
  "cross_document_inconsistency",
  "missing_information",
  "design_basis_consistency",
  "requirement_traceability",
  "unsupported_assumption",
  "revision_inconsistency",
  "missing_engineering_evidence",
] as const;
export type MvpReviewType = (typeof MVP_REVIEW_TYPES)[number];

export const REVIEW_SCOPE_LABELS: Record<MvpReviewType, string> = {
  cross_document_inconsistency: "Cross-document consistency",
  missing_information: "Missing information",
  design_basis_consistency: "Design-basis consistency",
  requirement_traceability: "Requirement traceability",
  unsupported_assumption: "Unsupported assumptions",
  revision_inconsistency: "Revision consistency",
  missing_engineering_evidence: "Missing evidence",
};

/** Capabilities that must not be advertised or selectable in ERA-5. */
export const UNSUPPORTED_REVIEW_CAPABILITIES = [
  "code compliance",
  "structural analysis",
  "FEA",
  "drawing vision",
  "OCR review",
  "autonomous design",
] as const;

export type ReviewScope = {
  reviewTypes: readonly MvpReviewType[];
  documentRoles?: readonly string[];
  discipline?: string;
  requiredFields?: readonly string[];
  expectedEvidenceKeys?: readonly string[];
};

export function createReviewScope(input: {
  reviewTypes: readonly MvpReviewType[];
  documentRoles?: readonly string[];
  discipline?: string;
  requiredFields?: readonly string[];
  expectedEvidenceKeys?: readonly string[];
}): ReviewScope {
  if (!input.reviewTypes.length) {
    failClosed("scope_empty", "Review scope must include at least one review type");
  }
  for (const reviewType of input.reviewTypes) {
    if (!(MVP_REVIEW_TYPES as readonly string[]).includes(reviewType)) {
      failClosed("review_type_unsupported", "Review type is not in the supported Engineering Review set", { reviewType });
    }
  }
  return {
    reviewTypes: [...input.reviewTypes],
    documentRoles: input.documentRoles,
    discipline: input.discipline,
    requiredFields: input.requiredFields,
    expectedEvidenceKeys: input.expectedEvidenceKeys,
  };
}
