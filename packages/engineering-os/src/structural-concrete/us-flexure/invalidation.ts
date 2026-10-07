import type { UsConcreteFlexureFingerprint } from "@rtb/types";
import { STALE_US_FLEXURE_RESULT_REUSE_ALLOWED } from "@rtb/types";
import { fingerprintRcSectionConfiguration } from "../section-mechanics";

export function usFlexureFingerprint(input: UsConcreteFlexureFingerprint): string {
  return [
    input.memberRef,
    input.sectionGeometryVersion,
    input.reinforcementFingerprint,
    input.concreteMaterialRef,
    input.reinforcementMaterialRef,
    input.momentDemandRef,
    input.combinationId ?? "",
    input.d1cRevision,
    input.aciFamily,
    input.edition,
    input.amendmentState,
    input.errataState,
    input.buildingCodeContextRef ?? "",
    input.localAmendmentRef ?? "",
    input.materialModelRef ?? "",
    input.stressBlockRuleRef ?? "",
    input.strainRuleRef ?? "",
    input.strengthFactorRef ?? "",
    input.methodVersion,
  ].join("|");
}

export function usFlexureInvalidationTags(previous: string, current: string): string[] {
  if (STALE_US_FLEXURE_RESULT_REUSE_ALLOWED) throw new Error("stale US flexure result reuse must not be allowed");
  return previous === current ? [] : ["US_FLEXURE_INPUT_CHANGED"];
}

export function assertStaleUsFlexureNotReused(tags: string[], reuseAttempted: boolean): void {
  if (reuseAttempted && tags.length > 0) throw new Error("US concrete flexure fail closed: stale result");
}

export function sectionLayoutFingerprint(
  geometry: Parameters<typeof fingerprintRcSectionConfiguration>[0]["geometry"],
  layout: Parameters<typeof fingerprintRcSectionConfiguration>[0]["layout"],
  concreteRef: string,
  reinforcementRef: string,
): string {
  return fingerprintRcSectionConfiguration({
    geometry,
    layout,
    concreteRef,
    reinforcementRef,
    unitContext: "mm",
    displacementTreatment: "CONCRETE_GROSS_SEPARATE",
  });
}
