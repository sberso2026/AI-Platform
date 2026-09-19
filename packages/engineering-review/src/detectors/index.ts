import type { MvpReviewType } from "../review-scope";
import { crossDocumentInconsistencyDetector } from "./cross-document-inconsistency";
import { designBasisConsistencyDetector } from "./design-basis-consistency";
import { missingEngineeringEvidenceDetector } from "./missing-engineering-evidence";
import { missingInformationDetector } from "./missing-information";
import { requirementTraceabilityDetector } from "./requirement-traceability";
import { revisionInconsistencyDetector } from "./revision-inconsistency";
import { unsupportedAssumptionDetector } from "./unsupported-assumptions";
import type { DetectorContext, DetectorDetection, ReviewDetector } from "./types";

export const ERA1_DETECTORS: readonly ReviewDetector[] = [
  crossDocumentInconsistencyDetector,
  missingInformationDetector,
  designBasisConsistencyDetector,
  requirementTraceabilityDetector,
  unsupportedAssumptionDetector,
  revisionInconsistencyDetector,
  missingEngineeringEvidenceDetector,
];

export function runDetectors(
  context: DetectorContext,
  enabledTypes?: readonly MvpReviewType[],
): readonly DetectorDetection[] {
  const allowed = new Set(enabledTypes ?? context.scope.reviewTypes);
  return ERA1_DETECTORS.flatMap((detector) => {
    const reviewType = detector.ruleId.replace(/^er\./, "") as MvpReviewType;
    if (!allowed.has(reviewType)) return [];
    return [...detector.detect(context)];
  });
}

export type { DetectorContext, DetectorDetection, ReviewDetector, ReviewDocumentFixture } from "./types";
