import { RejectingInferenceProvider, type ReviewInferenceProvider } from "./ai-boundary";
import { constructFindingFromDetection } from "./engine";
import { dedupeDetections } from "./dedupe";
import { enrichDocumentsWithExtraction } from "./extract";
import { runDetectors } from "./detectors";
import { validateInferenceCandidates } from "./inference";
import { verifyFindingAgainstSources } from "./evidence-resolve";
import { verifyFindingEvidence, type ReviewFinding } from "./finding";
import { advanceCandidateAfterVerification } from "./disposition";
import { createReviewResult, type ReviewResult } from "./result";
import type { ReviewEngineInput } from "./engine";
import { createReviewOwnership } from "./ownership";
import type { DetectorDetection } from "./detectors/types";

export type GroundedReviewPipelineInput = ReviewEngineInput & {
  inference?: ReviewInferenceProvider;
};

export type GroundedReviewPipelineResult = ReviewResult & {
  stages: {
    extractedFactCount: number;
    detectorCount: number;
    inferenceAccepted: number;
    inferenceRejected: number;
    duplicateFindingRate: number;
    presentedCount: number;
    suppressedUnsupportedCount: number;
  };
};

function inferenceToDetections(
  findings: Awaited<ReturnType<ReviewInferenceProvider["proposeFindings"]>>,
  ruleVersion = "1.0.0",
): DetectorDetection[] {
  return findings.map((item, index) => ({
    detectionKey: `ai:${item.category}:${index}:${item.title}`,
    ruleId: `er.${item.category === "requirement_traceability_gap" ? "requirement_traceability" : item.category}`,
    ruleVersion,
    reviewType:
      item.category === "requirement_traceability_gap"
        ? "requirement_traceability"
        : (item.category as DetectorDetection["reviewType"]),
    category: item.category,
    title: item.title,
    description: item.description,
    severity: item.proposedSeverity,
    confidenceScore: item.proposedConfidenceScore,
    evidence: [...item.evidence],
    requirementReferences: [...(item.requirementReferences ?? [])],
    reasoningSummary: item.reasoningSummary,
    recommendedAction: item.recommendedAction,
    origin: "ai_candidate",
  }));
}

/**
 * ERA-4 grounded pipeline:
 * PI-ready extract → facts → deterministic compare → optional schema-validated AI
 * → evidence resolve → verify → persist-ready candidates → AWAITING_ENGINEER.
 * Silence (zero findings) is a successful result.
 */
export async function runGroundedReviewPipeline(
  input: GroundedReviewPipelineInput,
): Promise<GroundedReviewPipelineResult> {
  const ownership = createReviewOwnership(input.pkg);
  const { documents, extracted } = enrichDocumentsWithExtraction(input.documents);
  const detections = [
    ...runDetectors({
      ownership,
      documents,
      scope: input.run.scope,
      facts: extracted.facts,
      revisionRefs: extracted.revisionRefs,
    }),
  ];

  const provider = input.inference ?? new RejectingInferenceProvider();
  const proposed = await provider.proposeFindings({
    documents: documents.map((doc) => doc.extractedText),
    scope: input.run.scope,
  });
  const validated = validateInferenceCandidates(proposed, documents);
  detections.push(...inferenceToDetections(validated.accepted));

  const { unique, duplicateFindingRate } = dedupeDetections(detections);
  const constructed = unique.map((detection, index) =>
    constructFindingFromDetection(
      detection,
      { ...input, documents },
      index,
    ),
  );

  const verified: ReviewFinding[] = [];
  let suppressedUnsupportedCount = 0;
  for (const finding of constructed) {
    const againstSource = verifyFindingAgainstSources(verifyFindingEvidence(finding), documents);
    if (againstSource.verificationState !== "evidence_verified") {
      suppressedUnsupportedCount += 1;
      continue;
    }
    verified.push(
      advanceCandidateAfterVerification(againstSource, "system:review-engine", "system", input.now),
    );
  }

  const result = createReviewResult({
    run: input.run,
    findings: verified,
    limitations: [
      "ERA-4 grounded review uses deterministic extraction and comparison; AI is optional and schema-validated.",
      "Drawing visual interpretation, OCR, FEA, and standards interpretation remain out of scope.",
      "Findings are candidates for a human engineer — not certification or approval.",
    ],
  });

  return {
    ...result,
    stages: {
      extractedFactCount: extracted.facts.length,
      detectorCount: detections.length,
      inferenceAccepted: validated.accepted.length,
      inferenceRejected: validated.rejected.length,
      duplicateFindingRate,
      presentedCount: verified.length,
      suppressedUnsupportedCount,
    },
  };
}
