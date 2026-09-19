import type { MvpReviewType } from "../review-scope";
import { crossDocumentInconsistencyDetector } from "./cross-document-inconsistency";
import { missingEngineeringEvidenceDetector } from "./missing-engineering-evidence";
import { missingInformationDetector } from "./missing-information";
import { requirementTraceabilityDetector } from "./requirement-traceability";
import { revisionInconsistencyDetector } from "./revision-inconsistency";
import { unsupportedAssumptionDetector } from "./unsupported-assumptions";
import type { DetectorContext, DetectorDetection, ReviewDetector } from "./types";

export const ERA1_DETECTORS: readonly ReviewDetector[] = [
  crossDocumentInconsistencyDetector,
  missingInformationDetector,
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
  return ERA1_DETECTORS.filter((detector) => {
    const type = context.scope.reviewTypes.find((reviewType) => detector.ruleId.endsWith(reviewType) || detector.ruleId.includes(reviewType));
    return type ? allowed.has(type) : allowed.size > 0;
  }).flatMap((detector) => {
    const reviewType = detector.ruleId.replace(/^er\./, "") as MvpReviewType;
    if (!allowed.has(reviewType) && !context.scope.reviewTypes.includes(reviewType)) return [];
    if (!allowed.has(reviewType)) return [];
    return [...detector.detect(context)];
  });
}
