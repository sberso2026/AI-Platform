import {
  EU_SHEAR_BUCKLING_COEFFICIENT_GUESSED,
  EU_TENSION_FIELD_ACTION_IMPLEMENTED,
  EU_WEB_SLENDERNESS_LIMIT_GUESSED,
  TENSION_FIELD_ACTION_IMPLEMENTED,
} from "@rtb/types";
import { rejectUnknownEuShearCodeParameter } from "./authority";

export const AU_SHEAR_IMPLEMENTATION_REVIEW = [
  { component: "vonMisesShearYieldN / demandShearN", classification: "JURISDICTION_NEUTRAL_REUSABLE", action: "generalized into structural-steel/mechanics/shear" },
  { component: "elasticShearBucklingForceN τcr = kv π² E / (12(1-ν²)(d/t)²)", classification: "JURISDICTION_NEUTRAL_REUSABLE", action: "generalized into structural-steel/mechanics/shear" },
  { component: "shear-area, stiffener, axis, and web-slenderness governance", classification: "REQUIRES_GENERALIZATION", action: "moved to structural-steel/mechanics/shear" },
  { component: "AU_SHEAR_YIELD_REFERENCE / AU_SHEAR_BUCKLING_REFERENCE method IDs", classification: "AU_SPECIFIC", action: "not copied into EU adapter" },
  { component: "AS 4100 intended profile, AU φv tokens, AUST300 identity", classification: "AU_SPECIFIC", action: "not reused as EU rules" },
  { component: "AU bending / combined action", classification: "NOT_RELEVANT", action: "out of EU-5 scope" },
] as const;

export const AU_SHEAR_IMPLEMENTATION_REVIEWED = true as const;
export const COMMON_SHEAR_MECHANICS_REUSED_WHERE_VALID = true as const;

export function requestEuWebSlendernessLimit(): never {
  if (EU_WEB_SLENDERNESS_LIMIT_GUESSED) throw new Error("web slenderness limits must not be guessed");
  return rejectUnknownEuShearCodeParameter("webSlendernessLimit");
}

export function requestEuSectionShearCapacity(): never {
  return rejectUnknownEuShearCodeParameter("sectionShearResistance");
}

export function requestEuWebStabilityCapacity(): never {
  return rejectUnknownEuShearCodeParameter("webStabilityResistance");
}

export function requestEuShearBucklingCoefficient(): never {
  if (EU_SHEAR_BUCKLING_COEFFICIENT_GUESSED) throw new Error("shear buckling coefficients must not be guessed");
  return rejectUnknownEuShearCodeParameter("shearBucklingCoefficient");
}

export function requestEuShearPartialFactor(): never {
  return rejectUnknownEuShearCodeParameter("partial-factor");
}

export function requestEuTensionFieldAction(): never {
  if (EU_TENSION_FIELD_ACTION_IMPLEMENTED || TENSION_FIELD_ACTION_IMPLEMENTED) {
    throw new Error("tension-field action must not be implemented in EU-5");
  }
  return rejectUnknownEuShearCodeParameter("tensionFieldAction");
}

export function requestEuShearAreaFromGross(): never {
  return rejectUnknownEuShearCodeParameter("shearAreaFromGrossOrWeb");
}
