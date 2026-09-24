import type { FindingEvidence } from "./evidence";
import { epistemicStateFromFinding } from "./epistemic-state";
import type { ReviewFinding } from "./finding";
import type { ReviewCoverageDeclaration } from "./coverage";
import { unmeasuredReviewCoverage } from "./coverage";

/**
 * PILOT-1 explainability contract.
 * WHY means engineering justification and evidence provenance.
 * Do not store or expose model chain-of-thought or hidden reasoning tokens.
 */
export type ReviewExplainabilityView = {
  why: string;
  evidence: readonly FindingEvidence[];
  sources: readonly {
    documentId: string;
    revision?: string;
    locator?: string;
  }[];
  assumptions: readonly string[];
  unknowns: readonly string[];
  exclusions: readonly string[];
  coverage: ReviewCoverageDeclaration;
  epistemicState: ReturnType<typeof epistemicStateFromFinding>;
};

export function explainFinding(
  finding: ReviewFinding,
  input?: { exclusions?: readonly string[]; coverage?: ReviewCoverageDeclaration },
): ReviewExplainabilityView {
  const assumptions =
    finding.reasoningBasis === "ASSUMED" ? [finding.reasoningSummary] : [];
  const unknowns =
    finding.reasoningBasis === "INSUFFICIENT_EVIDENCE" || finding.verificationState !== "evidence_verified"
      ? [finding.verificationState === "evidence_verified" ? finding.reasoningSummary : `verification:${finding.verificationState}`]
      : [];
  return {
    why: finding.reasoningSummary,
    evidence: finding.evidence,
    sources: finding.evidence.map((item) => ({
      documentId: item.documentId,
      revision: item.revision,
      locator: item.span ?? item.section ?? item.chunkId,
    })),
    assumptions,
    unknowns,
    exclusions: input?.exclusions ?? [],
    coverage: input?.coverage ?? unmeasuredReviewCoverage(),
    epistemicState: epistemicStateFromFinding(finding),
  };
}

export function explainabilityContainsModelChainOfThought(view: ReviewExplainabilityView): boolean {
  const blob = JSON.stringify(view).toLowerCase();
  return blob.includes("chain-of-thought") || blob.includes("hidden_reasoning") || blob.includes("reasoning_tokens");
}
