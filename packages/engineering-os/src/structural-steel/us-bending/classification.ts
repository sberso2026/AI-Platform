import type { UsBendingClassificationContext, UsElementClassificationState, UsLtbTransitionParameterContext } from "@rtb/types";
import { PLASTIC_CAPACITY_ASSUMED_WITHOUT_CLASSIFICATION, US_BENDING_CLASSIFICATION_LIMIT_GUESSED, US_LOCAL_BUCKLING_RULE_GUESSED, US_LTB_TRANSITION_PARAMETER_GUESSED } from "@rtb/types";
import { usElementClassificationState } from "../us-compression/classification";
import { rejectUnknownUsBendingCodeParameter } from "./authority";

export const AU_EU_BENDING_IMPLEMENTATION_REVIEW = [
  { component: "firstYieldMomentNm / toSectionModulusM3", classification: "JURISDICTION_NEUTRAL_REUSABLE", action: "reused from structural-steel/mechanics/bending" },
  { component: "elasticLtbMomentNm / toWarpingM6 uniform-moment Mcr", classification: "JURISDICTION_NEUTRAL_REUSABLE", action: "reused from structural-steel/mechanics/ltb" },
  { component: "unbraced-length and LTB restraint governance", classification: "JURISDICTION_NEUTRAL_REUSABLE", action: "reused from structural-steel/mechanics/ltb" },
  { component: "AU_BENDING_ELASTIC_MAJOR / MINOR / LTB method IDs / AS 4100 φb / αm", classification: "JURISDICTION_SPECIFIC", action: "not copied into US adapter" },
  { component: "EN 1993 Mc,Rd / Mb,Rd / LTB curves / χLT / γM1 / National Annex / NDP", classification: "JURISDICTION_SPECIFIC", action: "not reused as AISC authority" },
  { component: "AU/EU shear / combined action", classification: "NOT_RELEVANT", action: "out of US-4 scope" },
] as const;

export const US_BENDING_LOCAL_BUCKLING_FRAMEWORK_STATE = {
  flange: "VALIDATION_REQUIRED",
  web: "VALIDATION_REQUIRED",
  other: "VALIDATION_REQUIRED",
  ruleGuessed: false,
} as const;

export const US_LTB_TRANSITION_PARAMETER_CONTEXT: UsLtbTransitionParameterContext = {
  Lp: null,
  Lr: null,
  guessed: false,
  state: "VALIDATION_REQUIRED",
};

export const US_FLEXURAL_BEHAVIOR_CONTEXT = {
  elastic: "ELASTIC",
  plastic: "VALIDATION_REQUIRED",
  localBucklingControlled: "VALIDATION_REQUIRED",
  assumedPlasticWithoutClassification: false,
} as const;

export function usBendingElementClassificationState(): UsElementClassificationState {
  if (US_BENDING_CLASSIFICATION_LIMIT_GUESSED) throw new Error("element classification limits must not be guessed");
  return usElementClassificationState();
}

export function usBendingClassificationContext(input: {
  element: UsBendingClassificationContext["element"];
  axis: UsBendingClassificationContext["axis"];
  limitState: string;
}): UsBendingClassificationContext {
  if (US_BENDING_CLASSIFICATION_LIMIT_GUESSED) throw new Error("element classification limits must not be guessed");
  return {
    element: input.element,
    axis: input.axis,
    limitState: input.limitState,
    compactnessState: "VALIDATION_REQUIRED",
    limitGuessed: false,
  };
}

export function requestUsBendingClassificationLimits(): never {
  if (US_BENDING_CLASSIFICATION_LIMIT_GUESSED) throw new Error("element classification limits must not be guessed");
  return rejectUnknownUsBendingCodeParameter("elementClassificationLimits");
}

export function classifyUsBendingElement(_sectionFamily: string | null): never {
  if (US_BENDING_CLASSIFICATION_LIMIT_GUESSED) throw new Error("element classification limits must not be guessed");
  throw new Error("CHECK_UNDETERMINED: AISC element classification rule is unavailable");
}

export function assertNoPlasticFromSectionModulusAlone(): void {
  if (PLASTIC_CAPACITY_ASSUMED_WITHOUT_CLASSIFICATION) {
    throw new Error("plastic capacity must not be assumed without classification");
  }
}

export function requestUsLocalBucklingLimits(): never {
  if (US_LOCAL_BUCKLING_RULE_GUESSED) throw new Error("local-buckling rule must not be guessed");
  return rejectUnknownUsBendingCodeParameter("localBucklingLimits");
}

export function requestUsLpLr(): never {
  if (US_LTB_TRANSITION_PARAMETER_GUESSED) throw new Error("Lp/Lr must not be guessed");
  return rejectUnknownUsBendingCodeParameter("Lp_Lr");
}
