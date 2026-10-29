import type { UsElementClassificationState } from "@rtb/types";
import {
  BENDING_CLASSIFICATION_EQUALS_SHEAR_CLASSIFICATION,
  US_TENSION_FIELD_ACTION_IMPLEMENTED,
  US_TENSION_FIELD_ELIGIBILITY_GUESSED,
  US_WEB_SLENDERNESS_LIMIT_GUESSED,
} from "@rtb/types";
import { usElementClassificationState } from "../us-compression/classification";
import { rejectUnknownUsShearCodeParameter } from "./authority";

export const AU_EU_SHEAR_IMPLEMENTATION_REVIEW = [
  { component: "vonMisesShearYieldN / demandShearN / toLengthM / poissonRatio", classification: "JURISDICTION_NEUTRAL_REUSABLE", action: "reused from structural-steel/mechanics/shear" },
  { component: "elasticShearBucklingForceN τcr = kv π² E / (12(1-ν²)(d/t)²)", classification: "JURISDICTION_NEUTRAL_REUSABLE", action: "reused from structural-steel/mechanics/shear" },
  { component: "shear-area, stiffener, axis, panel, and web-slenderness governance", classification: "JURISDICTION_NEUTRAL_REUSABLE", action: "reused from structural-steel/mechanics/shear" },
  { component: "AU_SHEAR_YIELD_REFERENCE / AU_SHEAR_BUCKLING_REFERENCE / AS 4100 φv", classification: "JURISDICTION_SPECIFIC", action: "not copied into US adapter" },
  { component: "EN 1993 Vpl,Rd / web resistance / χw / γM1 / National Annex / NDP", classification: "JURISDICTION_SPECIFIC", action: "not reused as AISC authority" },
  { component: "AU/EU combined action / connection shear", classification: "NOT_RELEVANT", action: "out of US-5 scope" },
] as const;

export const US_WEB_SLENDERNESS_FRAMEWORK_STATE = {
  limitGuessed: false,
  state: "VALIDATION_REQUIRED",
} as const;

export const US_TENSION_FIELD_FRAMEWORK_STATE = {
  actionImplemented: false,
  eligibilityGuessed: false,
  applicability: "VALIDATION_REQUIRED",
} as const;

export function usShearElementClassificationState(): UsElementClassificationState {
  if (BENDING_CLASSIFICATION_EQUALS_SHEAR_CLASSIFICATION) {
    throw new Error("flexural classification must not automatically determine shear classification");
  }
  if (US_WEB_SLENDERNESS_LIMIT_GUESSED) throw new Error("web slenderness limits must not be guessed");
  return usElementClassificationState();
}

export function requestUsWebSlendernessLimit(): never {
  if (US_WEB_SLENDERNESS_LIMIT_GUESSED) throw new Error("web slenderness limits must not be guessed");
  return rejectUnknownUsShearCodeParameter("webSlendernessLimit");
}

export function requestUsTensionFieldEligibility(): never {
  if (US_TENSION_FIELD_ACTION_IMPLEMENTED || US_TENSION_FIELD_ELIGIBILITY_GUESSED) {
    throw new Error("tension-field action must not be implemented in US-5");
  }
  return rejectUnknownUsShearCodeParameter("tensionFieldEligibility");
}
