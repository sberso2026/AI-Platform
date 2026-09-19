import { createReviewFinding, verifyFindingEvidence, type ReviewFinding } from "./finding";
import { runDetectors, type DetectorContext, type DetectorDetection } from "./detectors";
import type { ReviewRun } from "./review-run";
import { createReviewResult, type ReviewResult } from "./result";
import { advanceCandidateAfterVerification } from "./disposition";
import type { ReviewPackage } from "./review-package";
import type { ReviewDocumentFixture } from "./detectors/types";
import { createReviewOwnership } from "./ownership";

export type ReviewEngineInput = {
  run: ReviewRun;
  pkg: ReviewPackage;
  documents: readonly ReviewDocumentFixture[];
  now?: string;
};

/**
 * Deterministic pipeline stages remain separate:
 * detect → construct findings → verify evidence → (optional) queue for engineer.
 */
export function runDeterministicReview(input: ReviewEngineInput): ReviewResult {
  const ownership = createReviewOwnership(input.pkg);
  const context: DetectorContext = {
    ownership,
    documents: input.documents,
    scope: input.run.scope,
  };
  const detections = runDetectors(context);
  const findings = detections.map((detection, index) =>
    constructFindingFromDetection(detection, input, index),
  );
  const verified = findings.map((finding) => {
    const next = verifyFindingEvidence(finding);
    if (next.verificationState !== "evidence_verified") return next;
    return advanceCandidateAfterVerification(next, "system:review-engine", "system", input.now);
  });
  return createReviewResult({
    run: input.run,
    findings: verified,
  });
}

export function constructFindingFromDetection(
  detection: DetectorDetection,
  input: ReviewEngineInput,
  index: number,
): ReviewFinding {
  return createReviewFinding({
    id: `finding-${input.run.id}-${index}`,
    tenantId: input.pkg.tenantId,
    workspaceId: input.pkg.workspaceId,
    projectId: input.pkg.projectId,
    reviewPackageId: input.pkg.id,
    reviewRunId: input.run.id,
    category: detection.category,
    title: detection.title,
    description: detection.description,
    severity: detection.severity,
    confidence: { score: detection.confidenceScore },
    evidence: detection.evidence,
    requirementReferences: detection.requirementReferences,
    reasoningSummary: detection.reasoningSummary,
    recommendedAction: detection.recommendedAction,
    provenance: {
      origin: "detector",
      ruleId: detection.ruleId,
      ruleVersion: detection.ruleVersion,
      detectorId: detection.ruleId,
    },
    now: input.now,
  });
}
