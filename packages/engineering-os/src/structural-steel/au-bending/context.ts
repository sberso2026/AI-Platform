import type { SteelBendingDesignContext, SteelCapacityEngineInput, SteelStabilityContext } from "@rtb/types";
import { SECTION_CLASSIFICATION_STATE, SILENT_UNBRACED_LENGTH_ASSUMPTION } from "@rtb/types";
import { AU_BENDING_ELASTIC_MAJOR_RULE, AU_BENDING_ELASTIC_MINOR_RULE } from "./registry";

export function bendingAxisFromLimitState(limitState: string): "MAJOR_AXIS" | "MINOR_AXIS" {
  if (limitState === "BENDING_MAJOR") return "MAJOR_AXIS";
  if (limitState === "BENDING_MINOR") return "MINOR_AXIS";
  throw new Error("steel design fail closed: missing axis");
}

export function ltbContextRequested(input: SteelCapacityEngineInput, axis: "MAJOR_AXIS" | "MINOR_AXIS"): boolean {
  if (axis !== "MAJOR_AXIS") return false;
  const stability = input.stability;
  return Boolean(
    input.section.torsionConstant
    || input.section.warpingConstant
    || input.material.shearModulus
    || (stability?.unbracedLengthM != null && stability.unbracedLengthM > 0)
    || stability?.lateralRestraint
    || stability?.torsionalRestraint
    || stability?.warpingRestraint,
  );
}

export function requireUnbracedLengthForLtb(stability: SteelStabilityContext | null): number {
  if (SILENT_UNBRACED_LENGTH_ASSUMPTION) throw new Error("unbraced length must not be assumed silently");
  if (!stability) throw new Error("steel design fail closed: missing unbraced length");
  if (stability.derived) throw new Error("steel design fail closed: unbraced length must not be assumed silently");
  const lu = stability.unbracedLengthM;
  if (lu == null || !(lu > 0)) throw new Error("steel design fail closed: missing unbraced length");
  const provenance = stability.unbracedLengthProvenanceRef ?? stability.sourceEvidenceRef;
  if (!provenance?.trim()) throw new Error("steel design fail closed: missing unbraced length provenance");
  if (/^ai$|^llm|ai-inferred|optimizer-inferred/i.test(provenance)) throw new Error("AI cannot invent LTB values");
  if (!stability.lateralRestraint?.trim() || stability.lateralRestraint === "unknown") {
    throw new Error("steel design fail closed: unknown restraint");
  }
  if (!stability.torsionalRestraint?.trim() || stability.torsionalRestraint === "unknown") {
    throw new Error("steel design fail closed: unknown restraint");
  }
  if (!stability.warpingRestraint?.trim() || stability.warpingRestraint === "unknown") {
    throw new Error("steel design fail closed: unknown restraint");
  }
  return lu;
}

export function assertLoadHeightNotGuessed(stability: SteelStabilityContext | null): void {
  const position = stability?.loadApplicationPosition?.trim();
  if (!position) return;
  if (!/^(shear[-_ ]?centre|centroid|shear center)$/i.test(position)) {
    throw new Error("steel design fail closed: unknown required code parameter loadApplicationPosition");
  }
}

export function toAuBendingContext(input: SteelCapacityEngineInput): SteelBendingDesignContext {
  const axis = bendingAxisFromLimitState(input.limitState);
  const stability = input.stability;
  return {
    bendingContextId: `${input.designContext.designContextId}:bending`,
    memberRef: input.designContext.memberRef,
    sectionRef: input.designContext.sectionRef,
    materialRef: input.designContext.materialRef,
    momentDemandRefs: [input.demand.resultId],
    bendingAxis: axis,
    memberLengthM: stability?.memberLengthM ?? null,
    unbracedLengthM: stability?.unbracedLengthM ?? null,
    unbracedLengthProvenanceRef: stability?.unbracedLengthProvenanceRef ?? stability?.sourceEvidenceRef ?? null,
    restraintContext: stability?.restraintDescription ?? null,
    lateralRestraint: stability?.lateralRestraint ?? null,
    torsionalRestraint: stability?.torsionalRestraint ?? null,
    warpingRestraint: stability?.warpingRestraint ?? null,
    momentDistributionContext: stability?.momentDistributionDescription ?? stability?.momentGradientRef ?? null,
    engineeringRuleRef: axis === "MINOR_AXIS" ? AU_BENDING_ELASTIC_MINOR_RULE.ruleId : AU_BENDING_ELASTIC_MAJOR_RULE.ruleId,
    standardProfileRef: input.standardContext.contextId,
    provenanceRef: input.designContext.provenanceRef,
    validationState: input.designContext.validationState,
    sectionClassificationState: SECTION_CLASSIFICATION_STATE,
  };
}

export function assertAiCannotInventLtb(proposedBy: "AI" | "OPTIMIZER" | "HUMAN", valuesPresent: boolean): void {
  if ((proposedBy === "AI" || proposedBy === "OPTIMIZER") && !valuesPresent) {
    throw new Error("AI cannot invent LTB values");
  }
}

export function consumeD1cDeflectionHandoff(demand: SteelCapacityEngineInput["demand"]): SteelCapacityEngineInput["demand"]["deflection"] {
  return demand.deflection;
}
