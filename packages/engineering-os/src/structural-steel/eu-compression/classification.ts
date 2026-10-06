import type { EuBucklingCurveRecord, EuCodeSlendernessContext, EuSectionClassificationState } from "@rtb/types";
import { BUCKLING_CURVE_GUESSED, EU_CODE_SLENDERNESS_RULE_GUESSED, EU_SECTION_CLASSIFICATION_LIMIT_GUESSED } from "@rtb/types";
import { rejectUnknownEuCompressionCodeParameter } from "./authority";

export const AU_COMPRESSION_IMPLEMENTATION_REVIEW = [
  { component: "eulerLoadN / toSecondMomentM4 / toElasticModulusPa", classification: "JURISDICTION_NEUTRAL_REUSABLE", action: "generalized into structural-steel/mechanics" },
  { component: "nominal squash fy × A", classification: "JURISDICTION_NEUTRAL_REUSABLE", action: "reused from structural-steel/mechanics tension-force" },
  { component: "effective-length governance (no silent PINNED/FIXED/FRAME inference)", classification: "REQUIRES_GENERALIZATION", action: "moved to structural-steel/mechanics/effective-length" },
  { component: "AU_COMPRESSION_SQUASH_YIELD / AU_COMPRESSION_EULER_MAJOR / AU_COMPRESSION_EULER_MINOR method IDs", classification: "AU_SPECIFIC", action: "not copied into EU adapter" },
  { component: "AS 4100 intended profile, AU buckling-curve VALIDATION_REQUIRED tokens, AUST300 identity", classification: "AU_SPECIFIC", action: "not reused as EU rules" },
  { component: "AU bending / LTB / shear / interaction", classification: "NOT_RELEVANT", action: "out of EU-3 scope" },
] as const;

export const AU_COMPRESSION_IMPLEMENTATION_REVIEWED = true as const;
export const COMMON_COMPRESSION_MECHANICS_REUSED_WHERE_VALID = true as const;
export const AU_CODE_RULES_REUSED_AS_EU_COMPRESSION_RULES = false as const;

export const EU_BUCKLING_CURVE_CATALOG: readonly EuBucklingCurveRecord[] = [];

export const EU_CODE_SLENDERNESS_CONTEXT: EuCodeSlendernessContext = {
  state: "VALIDATION_REQUIRED",
  ruleGuessed: false,
  normalization: null,
  referenceResistance: null,
};

export function euSectionClassificationState(): EuSectionClassificationState {
  if (EU_SECTION_CLASSIFICATION_LIMIT_GUESSED) throw new Error("section classification limits must not be guessed");
  return "VALIDATION_REQUIRED";
}

export function requestEuSectionClassificationLimits(): never {
  if (EU_SECTION_CLASSIFICATION_LIMIT_GUESSED) throw new Error("section classification limits must not be guessed");
  return rejectUnknownEuCompressionCodeParameter("sectionClassificationLimits");
}

export function requestEuBucklingCurve(): never {
  if (BUCKLING_CURVE_GUESSED) throw new Error("buckling curves must not be guessed");
  return rejectUnknownEuCompressionCodeParameter("bucklingCurve");
}

export function requestEuBucklingParameter(): never {
  return rejectUnknownEuCompressionCodeParameter("bucklingCoefficient");
}

export function requestEuCompressionPartialFactor(): never {
  return rejectUnknownEuCompressionCodeParameter("partial-factor");
}

export function requestEuCodeSlenderness(): never {
  if (EU_CODE_SLENDERNESS_RULE_GUESSED) throw new Error("Eurocode slenderness rules must not be guessed");
  return rejectUnknownEuCompressionCodeParameter("codeSlenderness");
}

export function selectEuBucklingCurve(_sectionFamily: string | null): never {
  if (BUCKLING_CURVE_GUESSED) throw new Error("buckling curves must not be guessed");
  throw new Error("CHECK_UNDETERMINED: buckling-curve selection rule is unavailable");
}
