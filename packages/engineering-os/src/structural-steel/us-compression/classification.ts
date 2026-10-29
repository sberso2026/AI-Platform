import type { UsElementClassificationState } from "@rtb/types";
import { US_CODE_SLENDERNESS_LIMIT_GUESSED, US_ELEMENT_CLASSIFICATION_LIMIT_GUESSED } from "@rtb/types";
import { rejectUnknownUsCompressionCodeParameter } from "./authority";

export const AU_EU_COMPRESSION_IMPLEMENTATION_REVIEW = [
  { component: "eulerLoadN / toSecondMomentM4 / toElasticModulusPa", classification: "JURISDICTION_NEUTRAL_REUSABLE", action: "reused from structural-steel/mechanics" },
  { component: "nominal squash fy × A", classification: "JURISDICTION_NEUTRAL_REUSABLE", action: "reused from structural-steel/mechanics tension-force" },
  { component: "effective-length governance (no silent PINNED/FIXED/FREE/K=1)", classification: "JURISDICTION_NEUTRAL_REUSABLE", action: "reused from structural-steel/mechanics/effective-length" },
  { component: "AU_COMPRESSION_SQUASH_YIELD / AU_COMPRESSION_EULER method IDs / AS 4100 alpha_b / phiNc", classification: "JURISDICTION_SPECIFIC", action: "not copied into US adapter" },
  { component: "EN 1993 buckling curves, χ, γM1, National Annex, NDP", classification: "JURISDICTION_SPECIFIC", action: "not reused as AISC authority" },
  { component: "AU/EU member-capacity code-profile labels", classification: "JURISDICTION_SPECIFIC", action: "not reused as AISC Pn/φPn/Pn/Ω" },
  { component: "AU bending / LTB / shear / interaction", classification: "NOT_RELEVANT", action: "out of US-3 scope" },
] as const;

export type UsMemberSlendernessContext = {
  engineeringSlendernessMajor: number | null;
  engineeringSlendernessMinor: number | null;
  codeSlendernessLimit: null;
  codeLimitGuessed: false;
  state: "VALIDATION_REQUIRED";
};

export const US_CODE_SLENDERNESS_CONTEXT: UsMemberSlendernessContext = {
  engineeringSlendernessMajor: null,
  engineeringSlendernessMinor: null,
  codeSlendernessLimit: null,
  codeLimitGuessed: false,
  state: "VALIDATION_REQUIRED",
};

export function usMemberSlendernessContext(input: {
  effectiveLengthMajorM: number | null;
  effectiveLengthMinorM: number | null;
  radiusOfGyrationMajorM: number | null;
  radiusOfGyrationMinorM: number | null;
}): UsMemberSlendernessContext {
  if (US_CODE_SLENDERNESS_LIMIT_GUESSED) throw new Error("AISC code slenderness limits must not be guessed");
  const major = input.effectiveLengthMajorM != null && input.radiusOfGyrationMajorM != null && input.radiusOfGyrationMajorM > 0
    ? input.effectiveLengthMajorM / input.radiusOfGyrationMajorM
    : null;
  const minor = input.effectiveLengthMinorM != null && input.radiusOfGyrationMinorM != null && input.radiusOfGyrationMinorM > 0
    ? input.effectiveLengthMinorM / input.radiusOfGyrationMinorM
    : null;
  return {
    engineeringSlendernessMajor: major,
    engineeringSlendernessMinor: minor,
    codeSlendernessLimit: null,
    codeLimitGuessed: false,
    state: "VALIDATION_REQUIRED",
  };
}

export function usElementClassificationState(): UsElementClassificationState {
  if (US_ELEMENT_CLASSIFICATION_LIMIT_GUESSED) throw new Error("element classification limits must not be guessed");
  return "VALIDATION_REQUIRED";
}

export function requestUsElementClassificationLimits(): never {
  if (US_ELEMENT_CLASSIFICATION_LIMIT_GUESSED) throw new Error("element classification limits must not be guessed");
  return rejectUnknownUsCompressionCodeParameter("elementClassificationLimits");
}

export function requestUsCodeSlendernessLimit(): never {
  if (US_CODE_SLENDERNESS_LIMIT_GUESSED) throw new Error("AISC code slenderness limits must not be guessed");
  return rejectUnknownUsCompressionCodeParameter("codeSlendernessLimit");
}

export function classifyUsCompressionElement(_sectionFamily: string | null): never {
  if (US_ELEMENT_CLASSIFICATION_LIMIT_GUESSED) throw new Error("element classification limits must not be guessed");
  throw new Error("CHECK_UNDETERMINED: AISC element classification rule is unavailable");
}
