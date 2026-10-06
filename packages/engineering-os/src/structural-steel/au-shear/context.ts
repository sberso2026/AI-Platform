import type {
  SteelCapacityEngineInput,
  SteelShearDesignContext,
} from "@rtb/types";
import { INTERACTION_REVIEW_REQUIRED } from "@rtb/types";
import {
  assertAiCannotInventShear,
  bucklingContextRequested,
  requireStiffenerState,
  shearAxisFromInput,
  toLengthM,
  webSlendernessContext,
} from "../mechanics/shear";
import { AU_SHEAR_YIELD_RULE } from "./registry";

export {
  assertAiCannotInventShear,
  bucklingContextRequested,
  requireStiffenerState,
  shearAxisFromInput,
};

export function toAuShearContext(input: SteelCapacityEngineInput): SteelShearDesignContext {
  if (!INTERACTION_REVIEW_REQUIRED) throw new Error("interaction review must remain required until AU-5");
  const axis = shearAxisFromInput(input);
  const stiffenerState = requireStiffenerState(input);
  const web = webSlendernessContext(input, stiffenerState);
  const spacing = input.shear?.stiffenerSpacing;
  return {
    shearContextId: `${input.designContext.designContextId}:shear`,
    memberRef: input.designContext.memberRef,
    sectionRef: input.designContext.sectionRef,
    materialRef: input.designContext.materialRef,
    shearDemandRefs: [input.demand.resultId],
    shearAxis: axis,
    webDepth: web.clearWebDepth,
    webThickness: web.webThickness,
    webSlenderness: web,
    stiffenerState,
    stiffenerSpacing: spacing && typeof spacing.value === "number" ? toLengthM(spacing, "shear.stiffenerSpacing") : null,
    engineeringRuleRef: AU_SHEAR_YIELD_RULE.ruleId,
    standardProfileRef: input.standardContext.contextId,
    technicalBasisRef: AU_SHEAR_YIELD_RULE.technicalBasisRef,
    provenanceRef: input.designContext.provenanceRef,
    validationState: input.designContext.validationState,
    interactionReviewRequired: true,
  };
}
