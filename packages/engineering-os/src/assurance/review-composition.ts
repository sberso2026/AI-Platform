import type {
  AssuranceReviewCitation,
  AssuranceReviewFindingRef,
  EngineeringAssuranceCondition,
} from "./types";

/**
 * Composes Condition → Review Package → Finding without transferring Finding ownership
 * into Assurance or duplicating Review persistence.
 */
export function composeConditionReviewThread(input: {
  condition: EngineeringAssuranceCondition;
  citations: readonly AssuranceReviewCitation[];
  findings: readonly AssuranceReviewFindingRef[];
}): {
  path: string;
  reviewPackageIds: string[];
  findingIds: string[];
  automaticFinding: false;
  findingOwnedBy: "engineering-review";
} {
  const reviewPackageIds = [...new Set(input.citations.map((row) => row.reviewPackageId))];
  const findingIds = input.findings.filter((row) => reviewPackageIds.includes(row.reviewPackageId)).map((row) => row.id);
  const hops = [
    input.condition.digitalThreadPath,
    `assurance_condition:${input.condition.conditionCode}`,
    ...reviewPackageIds.map((id) => `review_package:${id}`),
    ...findingIds.map((id) => `review_finding:${id}`),
  ].filter(Boolean);
  return {
    path: hops.join(" → "),
    reviewPackageIds,
    findingIds,
    automaticFinding: false,
    findingOwnedBy: "engineering-review",
  };
}
