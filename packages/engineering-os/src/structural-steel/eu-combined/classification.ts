import {
  BIAXIAL_LINEAR_INTERACTION_ASSUMED,
  EU_INTERACTION_CLASSIFICATION_GUESSED,
  EU_SHEAR_REDUCTION_RULE_GUESSED,
  UNIVERSAL_AXIAL_BIAXIAL_EQUATION,
  UNIVERSAL_INTERACTION_EQUATION,
} from "@rtb/types";
import { rejectUnknownEuInteractionParameter } from "./authority";

export const AU_INTERACTION_ARCHITECTURE_REVIEW = [
  { component: "detectRequiredInteractions / CANONICAL_INTERACTION_ORDER", classification: "JURISDICTION_NEUTRAL_REUSABLE", action: "generalized into structural-steel/mechanics/interaction" },
  { component: "assertSameCombination / revision and component-authority contracts", classification: "JURISDICTION_NEUTRAL_REUSABLE", action: "moved to structural-steel/mechanics/interaction" },
  { component: "componentUtilizations informational vector", classification: "JURISDICTION_NEUTRAL_REUSABLE", action: "moved to structural-steel/mechanics/interaction" },
  { component: "AU_INTERACTION_* method IDs and AS 4100 intended profile", classification: "AU_SPECIFIC", action: "not copied into EU adapter" },
  { component: "toAuCombinedContext AU rule binding", classification: "AU_SPECIFIC", action: "not reused as EU rules" },
  { component: "AU torsion / connection interaction (absent)", classification: "NOT_RELEVANT", action: "out of EU-6 numerical scope" },
] as const;

export const AU_INTERACTION_ARCHITECTURE_REVIEWED = true as const;
export const COMMON_INTERACTION_ARCHITECTURE_REUSED_WHERE_VALID = true as const;

export function requestEuUniversalInteractionEquation(): never {
  if (UNIVERSAL_INTERACTION_EQUATION || UNIVERSAL_AXIAL_BIAXIAL_EQUATION) {
    throw new Error("universal interaction equation is forbidden");
  }
  return rejectUnknownEuInteractionParameter("universalInteractionEquation");
}

export function requestEuBiaxialLinearInteraction(): never {
  if (BIAXIAL_LINEAR_INTERACTION_ASSUMED) throw new Error("biaxial linear interaction must not be assumed");
  return rejectUnknownEuInteractionParameter("biaxialLinearInteraction");
}

export function requestEuShearReduction(): never {
  if (EU_SHEAR_REDUCTION_RULE_GUESSED) throw new Error("shear reduction rule must not be guessed");
  return rejectUnknownEuInteractionParameter("bendingShearReduction");
}

export function requestEuInteractionClassification(): never {
  if (EU_INTERACTION_CLASSIFICATION_GUESSED) throw new Error("section classification must not be guessed");
  return rejectUnknownEuInteractionParameter("sectionClassification");
}

export function requestEuInteractionPartialFactor(): never {
  return rejectUnknownEuInteractionParameter("partial-factor");
}

export function requestEuTorsionalInteraction(): never {
  return rejectUnknownEuInteractionParameter("torsionalInteraction");
}

export function requestEuConnectionInteraction(): never {
  return rejectUnknownEuInteractionParameter("connectionInteraction");
}
