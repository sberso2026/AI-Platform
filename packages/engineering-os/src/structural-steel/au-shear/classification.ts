import { TENSION_FIELD_ACTION_IMPLEMENTED, WEB_SLENDERNESS_LIMIT_GUESSED } from "@rtb/types";
import { rejectUnknownCodeParameter } from "../au-tension/authority";

export function requestAuWebSlendernessLimit(): never {
  if (WEB_SLENDERNESS_LIMIT_GUESSED) throw new Error("web slenderness limits must not be guessed");
  return rejectUnknownCodeParameter("webSlendernessLimit");
}

export function requestAuCodeProfileShear(): never {
  return rejectUnknownCodeParameter("as4100ShearCapacity");
}

export function requestAuShearCapacityReduction(): never {
  return rejectUnknownCodeParameter("shearCapacityReductionFactor");
}

export function requestAuTensionFieldAction(): never {
  if (TENSION_FIELD_ACTION_IMPLEMENTED) throw new Error("tension-field action must not be implemented in AU-4");
  return rejectUnknownCodeParameter("tensionFieldAction");
}

export function requestAuConnectionShear(): never {
  return rejectUnknownCodeParameter("connectionShearCapacity");
}

export function requestAuBendingShearInteraction(): never {
  return rejectUnknownCodeParameter("bendingShearInteraction");
}
