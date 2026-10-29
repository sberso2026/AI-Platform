import type { EuConcreteFlexureFingerprint } from "@rtb/types";
import { STALE_EU_FLEXURE_RESULT_REUSE_ALLOWED } from "@rtb/types";
import { fingerprintRcSectionConfiguration } from "../section-mechanics";

export function euFlexureFingerprint(input: EuConcreteFlexureFingerprint): string {
  return [
    input.memberRef,
    input.sectionGeometryVersion,
    input.reinforcementFingerprint,
    input.concreteMaterialRef,
    input.reinforcementMaterialRef,
    input.momentDemandRef,
    input.combinationId ?? "",
    input.d1cRevision,
    input.standardFamily,
    input.generation,
    input.edition,
    input.part,
    input.nationalAnnexRef ?? "",
    input.ndpSetRef ?? "",
    input.materialModelRef ?? "",
    input.stressBlockOrDesignModelRef ?? "",
    input.strainLimitRuleRef ?? "",
    input.partialFactorRef ?? "",
    input.methodVersion,
  ].join("|");
}

export function euFlexureInvalidationTags(previous: string, current: string): string[] {
  if (STALE_EU_FLEXURE_RESULT_REUSE_ALLOWED) throw new Error("stale EU flexure result reuse must not be allowed");
  return previous === current ? [] : ["EU_FLEXURE_INPUT_CHANGED"];
}

export function assertStaleEuFlexureNotReused(tags: string[], reuseAttempted: boolean): void {
  if (reuseAttempted && tags.length > 0) throw new Error("EU concrete flexure fail closed: stale result");
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
