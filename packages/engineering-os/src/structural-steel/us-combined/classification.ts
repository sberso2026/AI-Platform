import {
  BIAXIAL_LINEAR_INTERACTION_ASSUMED,
  US_INTERACTION_CLASSIFICATION_GUESSED,
  US_BENDING_SHEAR_REDUCTION_RULE_GUESSED,
  UNIVERSAL_AXIAL_BIAXIAL_EQUATION,
  UNIVERSAL_US_INTERACTION_EQUATION,
} from "@rtb/types";
import { usElementClassificationState } from "../us-compression/classification";
import { US_BENDING_LOCAL_BUCKLING_FRAMEWORK_STATE } from "../us-bending/classification";
import { rejectUnknownUsInteractionParameter } from "./authority";

export const AU_EU_INTERACTION_ARCHITECTURE_REVIEW = [
  { component: "detectRequiredInteractions / CANONICAL_INTERACTION_ORDER", classification: "JURISDICTION_NEUTRAL_REUSABLE", action: "reused from structural-steel/mechanics/interaction" },
  { component: "assertSameCombination / revision and component-authority contracts", classification: "JURISDICTION_NEUTRAL_REUSABLE", action: "reused from structural-steel/mechanics/interaction" },
  { component: "componentUtilizations informational vector", classification: "JURISDICTION_NEUTRAL_REUSABLE", action: "reused from structural-steel/mechanics/interaction" },
  { component: "AU_INTERACTION_* method IDs and AS 4100 intended profile", classification: "JURISDICTION_SPECIFIC", action: "not copied into US adapter" },
  { component: "EU_INTERACTION_* method IDs, EN 1993 interaction, National Annex, NDP, γM1", classification: "JURISDICTION_SPECIFIC", action: "not reused as AISC authority" },
  { component: "AU/EU torsion / connection / seismic interaction (absent)", classification: "NOT_RELEVANT", action: "out of US-6 numerical scope" },
] as const;

export const US_AU_INTERACTION_ARCHITECTURE_REVIEWED = true as const;
export const US_EU_INTERACTION_ARCHITECTURE_REVIEWED = true as const;

export const US_LOCAL_BUCKLING_INTERACTION_FRAMEWORK_STATE = US_BENDING_LOCAL_BUCKLING_FRAMEWORK_STATE;

export function usInteractionElementClassificationState() {
  if (US_INTERACTION_CLASSIFICATION_GUESSED) throw new Error("section classification must not be guessed");
  return usElementClassificationState();
}

export function requestUsUniversalInteractionEquation(): never {
  if (UNIVERSAL_US_INTERACTION_EQUATION || UNIVERSAL_AXIAL_BIAXIAL_EQUATION) {
    throw new Error("universal interaction equation is forbidden");
  }
  return rejectUnknownUsInteractionParameter("universalInteractionEquation");
}

export function requestUsBiaxialLinearAssumption(): never {
  if (BIAXIAL_LINEAR_INTERACTION_ASSUMED) throw new Error("biaxial linear interaction must not be assumed");
  return rejectUnknownUsInteractionParameter("biaxialLinearInteraction");
}

export function requestUsBendingShearReduction(): never {
  if (US_BENDING_SHEAR_REDUCTION_RULE_GUESSED) throw new Error("shear reduction rule must not be guessed");
  return rejectUnknownUsInteractionParameter("bendingShearReduction");
}
