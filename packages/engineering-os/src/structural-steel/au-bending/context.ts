import type { SteelBendingDesignContext, SteelCapacityEngineInput } from "@rtb/types";
import { SECTION_CLASSIFICATION_STATE } from "@rtb/types";
import { bendingAxisFromLimitState } from "../mechanics/bending";
import {
  assertAiCannotInventLtb,
  assertLoadHeightNotGuessed,
  consumeD1cDeflectionHandoff,
  ltbContextRequested,
  requireUnbracedLengthForLtb,
} from "../mechanics/ltb";
import { AU_BENDING_ELASTIC_MAJOR_RULE, AU_BENDING_ELASTIC_MINOR_RULE } from "./registry";

export {
  assertAiCannotInventLtb,
  assertLoadHeightNotGuessed,
  bendingAxisFromLimitState,
  consumeD1cDeflectionHandoff,
  ltbContextRequested,
  requireUnbracedLengthForLtb,
};

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
