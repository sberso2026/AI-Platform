import type { SteelCheckVerdict, SteelIncompleteReason, SteelMemberDesignCheckKind } from "@rtb/types";

export const US_GOVERNED_REPORT_PHRASES = {
  MECHANICS_REFERENCE: "mechanics reference evaluated",
  CODE_UNAVAILABLE: "AISC code-profile strength unavailable",
  INTERACTION: "interaction validation required",
  DESIGN_METHOD: "design method context incomplete",
  SERVICEABILITY_CRITERION: "serviceability criterion required",
  BUILDING_CODE: "building-code compliance not evaluated",
  INCOMPLETE: "member code-design check incomplete",
  HUMAN_REVIEW: "human engineering review required",
  CONFORMANCE: "standard conformance not validated",
  NOT_SATISFIED: "deterministic check not satisfied",
} as const;

const FORBIDDEN_REPORT_PHRASES = [
  "AISC compliant",
  "AISC 360 compliant",
  "US code compliant",
  "building-code compliant",
  "design approved",
  "certified",
  "safe for construction",
];

export function usGovernedReportLanguage(input: {
  overall: SteelCheckVerdict;
  incompleteReason: SteelIncompleteReason | null;
  interactionRequired: boolean;
}): string {
  if (input.overall === "CHECK_NOT_SATISFIED") return US_GOVERNED_REPORT_PHRASES.NOT_SATISFIED;
  if (input.incompleteReason === "SERVICEABILITY_CRITERION_REQUIRED") return US_GOVERNED_REPORT_PHRASES.SERVICEABILITY_CRITERION;
  if (input.incompleteReason === "DESIGN_METHOD_REQUIRED" || input.incompleteReason === "LOAD_BASIS_INCOMPATIBLE") {
    return US_GOVERNED_REPORT_PHRASES.DESIGN_METHOD;
  }
  if (input.incompleteReason === "BUILDING_CODE_CONTEXT_REQUIRED") return US_GOVERNED_REPORT_PHRASES.BUILDING_CODE;
  if (input.interactionRequired || input.incompleteReason === "INTERACTION_RULE_VALIDATION_REQUIRED" || input.incompleteReason === "INTERACTION_METHOD_UNAVAILABLE" || input.incompleteReason === "INTERACTION_REQUIRED") {
    return US_GOVERNED_REPORT_PHRASES.INTERACTION;
  }
  if (input.incompleteReason === "CODE_METHOD_UNAVAILABLE") return US_GOVERNED_REPORT_PHRASES.CODE_UNAVAILABLE;
  if (input.overall === "CHECK_UNDETERMINED") return US_GOVERNED_REPORT_PHRASES.INCOMPLETE;
  return US_GOVERNED_REPORT_PHRASES.CONFORMANCE;
}

export function usCheckRowReportLanguage(kind: SteelMemberDesignCheckKind, state: SteelCheckVerdict | null, reason: SteelIncompleteReason | null): string {
  if (!state || reason === "NOT_APPLICABLE") return "not applicable";
  if (reason === "SERVICEABILITY_CRITERION_REQUIRED") return US_GOVERNED_REPORT_PHRASES.SERVICEABILITY_CRITERION;
  if (reason === "DESIGN_METHOD_REQUIRED" || reason === "LOAD_BASIS_INCOMPATIBLE") return US_GOVERNED_REPORT_PHRASES.DESIGN_METHOD;
  if (reason === "BUILDING_CODE_CONTEXT_REQUIRED") return US_GOVERNED_REPORT_PHRASES.BUILDING_CODE;
  if (kind === "COMBINED_ACTION" || reason === "INTERACTION_RULE_VALIDATION_REQUIRED" || reason === "INTERACTION_METHOD_UNAVAILABLE" || reason === "INTERACTION_REQUIRED") {
    return US_GOVERNED_REPORT_PHRASES.INTERACTION;
  }
  if (reason === "CODE_METHOD_UNAVAILABLE" || reason === "VALIDATION_REQUIRED" || reason === "LOCAL_BUCKLING_RULE_REQUIRED" || reason === "AISC_EDITION_REQUIRED") {
    return US_GOVERNED_REPORT_PHRASES.CODE_UNAVAILABLE;
  }
  if (state === "CHECK_NOT_SATISFIED") return US_GOVERNED_REPORT_PHRASES.NOT_SATISFIED;
  if (state === "CHECK_SATISFIED") return US_GOVERNED_REPORT_PHRASES.MECHANICS_REFERENCE;
  return US_GOVERNED_REPORT_PHRASES.INCOMPLETE;
}

export function assertUsGovernedReportLanguage(text: string): void {
  const lower = text.toLowerCase();
  for (const phrase of FORBIDDEN_REPORT_PHRASES) {
    if (lower.includes(phrase.toLowerCase())) {
      throw new Error("steel design fail closed: forbidden engineering report language");
    }
  }
}

export function assertNoAiscCompliantClaim(claim: boolean | string | null | undefined): void {
  if (claim === true || (typeof claim === "string" && /aisc(\s*360)? compliant|us code compliant|building-code compliant/i.test(claim))) {
    throw new Error("steel design fail closed: forbidden engineering report language");
  }
}
