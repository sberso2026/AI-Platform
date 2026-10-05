import { SECTION_CLASSIFICATION_STATE, SILENT_MOMENT_MODIFICATION_FACTOR } from "@rtb/types";
import { rejectUnknownCodeParameter } from "../au-tension/authority";

export function auBendingSectionClassificationState(): typeof SECTION_CLASSIFICATION_STATE {
  return SECTION_CLASSIFICATION_STATE;
}

export function requestAuMomentModificationFactor(): never {
  if (SILENT_MOMENT_MODIFICATION_FACTOR) throw new Error("moment modification factor must not be applied silently");
  return rejectUnknownCodeParameter("momentModificationFactor");
}

export function requestAuCodeProfileLtb(): never {
  return rejectUnknownCodeParameter("as4100MemberBendingCapacity");
}

export function requestAuPlasticSectionCapacity(): never {
  return rejectUnknownCodeParameter("sectionClassificationLimits");
}

export function requestAuLtbReductionFactor(): never {
  return rejectUnknownCodeParameter("ltbReductionFactor");
}
