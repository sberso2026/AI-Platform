export const REVIEW_FINDING_CATEGORIES = [
  "cross_document_inconsistency",
  "missing_information",
  "requirement_traceability_gap",
  "unsupported_assumption",
  "revision_inconsistency",
  "missing_engineering_evidence",
  "other_observation",
] as const;
export type ReviewFindingCategory = (typeof REVIEW_FINDING_CATEGORIES)[number];
