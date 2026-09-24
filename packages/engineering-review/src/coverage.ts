/**
 * Review coverage is declared, never invented.
 * When quantitative coverage cannot be computed from stored data, say so.
 */
export type ReviewCoverageDeclaration =
  | {
      measured: false;
      reason: "coverage_not_measured";
      statement: string;
      assessedDocumentIds: readonly string[];
      excludedDocumentIds: readonly string[];
      reviewTypes: readonly string[];
      extractionFailures: readonly string[];
      unsupportedDocumentIds: readonly string[];
    };

export const COVERAGE_NOT_MEASURED_STATEMENT =
  "Evidence coverage is not measured for this run. No quantitative coverage percentage is available." as const;

export function unmeasuredReviewCoverage(input?: {
  assessedDocumentIds?: readonly string[];
  excludedDocumentIds?: readonly string[];
  reviewTypes?: readonly string[];
  extractionFailures?: readonly string[];
  unsupportedDocumentIds?: readonly string[];
}): ReviewCoverageDeclaration {
  return {
    measured: false,
    reason: "coverage_not_measured",
    statement: COVERAGE_NOT_MEASURED_STATEMENT,
    assessedDocumentIds: input?.assessedDocumentIds ?? [],
    excludedDocumentIds: input?.excludedDocumentIds ?? [],
    reviewTypes: input?.reviewTypes ?? [],
    extractionFailures: input?.extractionFailures ?? [],
    unsupportedDocumentIds: input?.unsupportedDocumentIds ?? [],
  };
}

export function assertsNoFabricatedCoveragePercent(coverage: ReviewCoverageDeclaration): boolean {
  return coverage.measured === false && !("percent" in coverage) && !("score" in coverage);
}
