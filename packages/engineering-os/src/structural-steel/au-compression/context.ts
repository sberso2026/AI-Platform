import type {
  AuCompressionDesignContext,
  SteelCapacityEngineInput,
} from "@rtb/types";
import { SECTION_CLASSIFICATION_STATE } from "@rtb/types";
import {
  assertAiCannotSupplyEffectiveLength,
  assertEffectiveLengthGovernance,
  axisLength,
  resolveBucklingAxes,
} from "../mechanics/effective-length";
import { AU_COMPRESSION_SQUASH_RULE } from "./registry";

export { assertAiCannotSupplyEffectiveLength };

export function toAuCompressionContext(input: SteelCapacityEngineInput): AuCompressionDesignContext {
  const stability = assertEffectiveLengthGovernance(input.stability);
  const axes = resolveBucklingAxes(stability);
  if (axes.includes("TORSIONAL") || axes.includes("FLEXURAL_TORSIONAL")) {
    throw new Error("steel design fail closed: unsupported buckling mode");
  }
  if (stability.memberLengthM == null || !(stability.memberLengthM > 0)) {
    throw new Error("steel design fail closed: missing member length");
  }
  const major = axes.includes("MAJOR_AXIS") ? axisLength(stability, "MAJOR_AXIS", stability.effectiveLengthFactorMajor) : null;
  const minor = axes.includes("MINOR_AXIS") ? axisLength(stability, "MINOR_AXIS", stability.effectiveLengthFactorMinor) : null;
  if (axes.includes("MAJOR_AXIS") && axes.includes("MINOR_AXIS") && major == null && minor == null) {
    throw new Error("steel design fail closed: missing effective length");
  }
  return {
    compressionContextId: `${input.designContext.designContextId}:compression`,
    memberRef: input.designContext.memberRef,
    sectionRef: input.designContext.sectionRef,
    materialRef: input.designContext.materialRef,
    axialDemandRef: input.demand.resultId,
    memberLengthM: stability.memberLengthM,
    effectiveLengthMajorM: major,
    effectiveLengthMinorM: minor,
    bucklingAxes: axes,
    unbracedLengthM: stability.unbracedLengthM,
    restraintContext: stability.restraintDescription ?? "unknown",
    engineeringRuleRef: AU_COMPRESSION_SQUASH_RULE.ruleId,
    standardProfileRef: input.standardContext.contextId,
    provenanceRef: input.designContext.provenanceRef,
    validationState: input.designContext.validationState,
    effectiveLengthProvenanceRef: stability.effectiveLengthProvenanceRef ?? stability.sourceEvidenceRef ?? "missing",
    sectionClassificationState: SECTION_CLASSIFICATION_STATE,
  };
}
