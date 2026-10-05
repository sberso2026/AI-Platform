import type {
  SteelCapacityEngineInput,
  SteelShearAxis,
  SteelShearDesignContext,
  SteelShearStiffenerState,
  SteelWebSlendernessContext,
} from "@rtb/types";
import { INTERACTION_REVIEW_REQUIRED, SILENT_SHEAR_AREA_ASSUMPTION, STEEL_SHEAR_STIFFENER_STATES } from "@rtb/types";
import { AU_SHEAR_YIELD_RULE } from "./registry";
import { toLengthM } from "./units";

export function shearAxisFromInput(input: SteelCapacityEngineInput): SteelShearAxis {
  if (input.limitState === "SHEAR_MAJOR") {
    if (input.shear?.shearAxis && input.shear.shearAxis !== "MAJOR_SHEAR") {
      throw new Error("steel design fail closed: missing axis");
    }
    return "MAJOR_SHEAR";
  }
  if (input.limitState === "SHEAR_MINOR") {
    if (input.shear?.shearAxis && input.shear.shearAxis !== "MINOR_SHEAR") {
      throw new Error("steel design fail closed: missing axis");
    }
    return "MINOR_SHEAR";
  }
  if (input.limitState === "SHEAR") {
    const axis = input.shear?.shearAxis;
    if (axis === "MAJOR_SHEAR" || axis === "MINOR_SHEAR") return axis;
    throw new Error("steel design fail closed: missing axis");
  }
  throw new Error("steel design fail closed: missing axis");
}

export function requireStiffenerState(input: SteelCapacityEngineInput): SteelShearStiffenerState {
  const state = input.shear?.stiffenerState;
  if (!state || state === "unknown") {
    throw new Error("steel design fail closed: unknown required stiffener state");
  }
  if (!(STEEL_SHEAR_STIFFENER_STATES as readonly string[]).includes(state)) {
    throw new Error("steel design fail closed: unknown required stiffener state");
  }
  return state;
}

export function assertShearAreaNotAssumed(usedGrossArea: boolean): void {
  if (SILENT_SHEAR_AREA_ASSUMPTION || usedGrossArea) {
    throw new Error("steel design fail closed: missing section.shearArea");
  }
}

export function bucklingContextRequested(input: SteelCapacityEngineInput): boolean {
  return Boolean(
    input.section.webDepth
    || input.section.webThickness
    || input.material.poissonRatio
    || input.shear?.shearBucklingCoefficient
    || input.shear?.stiffenerSpacing,
  );
}

export function webSlendernessContext(input: SteelCapacityEngineInput, stiffenerState: SteelShearStiffenerState): SteelWebSlendernessContext {
  const depth = input.section.webDepth;
  const thickness = input.section.webThickness;
  let clearWebDepth: number | null = null;
  let webThickness: number | null = null;
  let slendernessRatio: number | null = null;
  if (depth && thickness) {
    clearWebDepth = toLengthM(depth, "section.webDepth");
    webThickness = toLengthM(thickness, "section.webThickness");
    slendernessRatio = clearWebDepth / webThickness;
  }
  return {
    clearWebDepth,
    webThickness,
    slendernessRatio,
    stiffenerState,
    limitState: "VALIDATION_REQUIRED",
    technicalRuleRef: null,
  };
}

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

export function assertAiCannotInventShear(proposedBy: "AI" | "OPTIMIZER" | "HUMAN", valuesPresent: boolean): void {
  if ((proposedBy === "AI" || proposedBy === "OPTIMIZER") && !valuesPresent) {
    throw new Error("AI cannot supply missing shear parameters");
  }
}
