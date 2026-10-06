import {
  BIAXIAL_LINEAR_INTERACTION_ASSUMED,
  SHEAR_REDUCTION_RULE_GUESSED,
  TORSIONAL_INTERACTION_IMPLEMENTED,
  UNIVERSAL_INTERACTION_EQUATION,
  UNKNOWN_INTERACTION_RELATIONSHIP_GUESSED,
} from "@rtb/types";
import { rejectUnknownCodeParameter } from "../au-tension/authority";

export function requestAuUniversalInteractionEquation(): never {
  if (UNIVERSAL_INTERACTION_EQUATION || UNKNOWN_INTERACTION_RELATIONSHIP_GUESSED) {
    throw new Error("universal interaction equation is forbidden");
  }
  return rejectUnknownCodeParameter("universalInteractionEquation");
}

export function requestAuCodeProfileInteraction(): never {
  return rejectUnknownCodeParameter("as4100InteractionEquation");
}

export function requestAuBiaxialLinearInteraction(): never {
  if (BIAXIAL_LINEAR_INTERACTION_ASSUMED) throw new Error("biaxial linear interaction must not be assumed");
  return rejectUnknownCodeParameter("biaxialLinearInteraction");
}

export function requestAuShearReduction(): never {
  if (SHEAR_REDUCTION_RULE_GUESSED) throw new Error("shear reduction rule must not be guessed");
  return rejectUnknownCodeParameter("bendingShearReduction");
}

export function requestAuTorsionalInteraction(): never {
  if (TORSIONAL_INTERACTION_IMPLEMENTED) throw new Error("torsional interaction must not be implemented");
  return rejectUnknownCodeParameter("torsionalInteraction");
}

export function requestAuConnectionInteraction(): never {
  return rejectUnknownCodeParameter("connectionInteraction");
}
