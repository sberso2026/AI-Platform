import type { AuConcreteFlexureFingerprint } from "@rtb/types";
import { STALE_AU_FLEXURE_RESULT_REUSE_ALLOWED } from "@rtb/types";
import { fingerprintRcSectionConfiguration } from "../section-mechanics";

export function auFlexureFingerprint(input: AuConcreteFlexureFingerprint): string {
  return [
    input.memberRef,
    input.sectionGeometryVersion,
    input.reinforcementFingerprint,
    input.concreteMaterialRef,
    input.reinforcementMaterialRef,
    input.momentDemandRef,
    input.combinationId ?? "",
    input.d1cRevision,
    input.standardEdition,
    input.materialModelRef ?? "",
    input.stressBlockRuleRef ?? "",
    input.strainLimitRuleRef ?? "",
    input.strengthFactorRef ?? "",
    input.methodVersion,
  ].join("|");
}

export function auFlexureInvalidationTags(previous: string, current: string): string[] {
  if (STALE_AU_FLEXURE_RESULT_REUSE_ALLOWED) throw new Error("stale AU flexure result reuse must not be allowed");
  return previous === current ? [] : ["AU_FLEXURE_INPUT_CHANGED"];
}

export function assertStaleAuFlexureNotReused(tags: string[], reuseAttempted: boolean): void {
  if (reuseAttempted && tags.length > 0) throw new Error("AU concrete flexure fail closed: stale result");
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
