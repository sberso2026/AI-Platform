import { SECTION_CLASSIFICATION_STATE } from "@rtb/types";
import { rejectUnknownCodeParameter } from "../au-tension/authority";

export function auSectionClassificationState(): typeof SECTION_CLASSIFICATION_STATE {
  return SECTION_CLASSIFICATION_STATE;
}

export function requestAuCompressionDesignCapacity(): never {
  return rejectUnknownCodeParameter("as4100MemberCapacityReduction");
}

export function requestAuBucklingCurve(): never {
  return rejectUnknownCodeParameter("bucklingCurve");
}

export function requestAuSectionClassificationLimits(): never {
  return rejectUnknownCodeParameter("sectionClassificationLimits");
}
