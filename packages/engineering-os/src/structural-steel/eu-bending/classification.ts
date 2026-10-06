import { EU_BENDING_CLASSIFICATION_LIMIT_GUESSED, EU_LTB_CURVE_GUESSED, EU_MOMENT_FACTOR_GUESSED } from "@rtb/types";
import { euSectionClassificationState } from "../eu-compression/classification";
import { rejectUnknownEuBendingCodeParameter } from "./authority";

export const AU_BENDING_IMPLEMENTATION_REVIEW = [
  { component: "firstYieldMomentNm / toSectionModulusM3", classification: "JURISDICTION_NEUTRAL_REUSABLE", action: "generalized into structural-steel/mechanics/bending" },
  { component: "elasticLtbMomentNm / toWarpingM6 uniform-moment Mcr", classification: "JURISDICTION_NEUTRAL_REUSABLE", action: "generalized into structural-steel/mechanics/ltb" },
  { component: "unbraced-length and LTB restraint governance", classification: "REQUIRES_GENERALIZATION", action: "moved to structural-steel/mechanics/ltb" },
  { component: "AU_BENDING_ELASTIC_MAJOR / MINOR / LTB method IDs", classification: "AU_SPECIFIC", action: "not copied into EU adapter" },
  { component: "AS 4100 intended profile, AU moment-modification and φb tokens, AUST300 identity", classification: "AU_SPECIFIC", action: "not reused as EU rules" },
  { component: "AU shear / combined action", classification: "NOT_RELEVANT", action: "out of EU-4 scope" },
] as const;

export const AU_BENDING_IMPLEMENTATION_REVIEWED = true as const;
export const COMMON_BENDING_MECHANICS_REUSED_WHERE_VALID = true as const;

export const EU_SECTION_RESISTANCE_CLASS_STATE = {
  elastic: "VALIDATION_REQUIRED",
  plastic: "VALIDATION_REQUIRED",
  effective: "VALIDATION_REQUIRED",
  assumedFromClassification: false,
} as const;

export function euBendingSectionClassificationState(): ReturnType<typeof euSectionClassificationState> {
  if (EU_BENDING_CLASSIFICATION_LIMIT_GUESSED) throw new Error("section classification limits must not be guessed");
  return euSectionClassificationState();
}

export function requestEuBendingSectionClassificationLimits(): never {
  if (EU_BENDING_CLASSIFICATION_LIMIT_GUESSED) throw new Error("section classification limits must not be guessed");
  return rejectUnknownEuBendingCodeParameter("sectionClassificationLimits");
}

export function requestEuSectionBendingCapacity(): never {
  return rejectUnknownEuBendingCodeParameter("sectionBendingResistance");
}

export function requestEuLtbCurve(): never {
  if (EU_LTB_CURVE_GUESSED) throw new Error("LTB curves must not be guessed");
  return rejectUnknownEuBendingCodeParameter("ltbCurve");
}

export function requestEuLtbParameter(): never {
  return rejectUnknownEuBendingCodeParameter("ltbReductionFactor");
}

export function requestEuMomentFactor(): never {
  if (EU_MOMENT_FACTOR_GUESSED) throw new Error("moment factors must not be guessed");
  return rejectUnknownEuBendingCodeParameter("momentFactor");
}

export function requestEuBendingPartialFactor(): never {
  return rejectUnknownEuBendingCodeParameter("partial-factor");
}

export function selectEuLtbCurve(_sectionFamily: string | null): never {
  if (EU_LTB_CURVE_GUESSED) throw new Error("LTB curves must not be guessed");
  throw new Error("CHECK_UNDETERMINED: LTB-curve selection rule is unavailable");
}
