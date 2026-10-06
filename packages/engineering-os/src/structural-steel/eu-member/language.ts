import type { SteelCheckVerdict, SteelIncompleteReason, SteelMemberCompletenessState, SteelMemberDesignCheckKind } from "@rtb/types";

export const EU_GOVERNED_REPORT_PHRASES = {
  MECHANICS_REFERENCE: "mechanics reference evaluated",
  CODE_UNAVAILABLE: "code-profile check unavailable",
  INTERACTION: "interaction validation required",
  SERVICEABILITY_CRITERION: "serviceability criterion missing",
  INCOMPLETE: "member code-design check incomplete",
  HUMAN_REVIEW: "human engineering review required",
  CONFORMANCE: "standard conformance not validated",
  NOT_SATISFIED: "deterministic check not satisfied",
} as const;

const FORBIDDEN_REPORT_PHRASES = [
  "EN 1993 compliant",
  "EN1993_COMPLIANT",
  "Eurocode compliant",
  "design approved",
  "certified",
  "safe for construction",
  "IFC approved",
];

export function euGovernedReportLanguage(input: {
  overall: SteelCheckVerdict;
  incompleteReason: SteelIncompleteReason | null;
  interactionRequired: boolean;
}): string {
  if (input.overall === "CHECK_NOT_SATISFIED") return EU_GOVERNED_REPORT_PHRASES.NOT_SATISFIED;
  if (input.incompleteReason === "SERVICEABILITY_CRITERION_REQUIRED") return EU_GOVERNED_REPORT_PHRASES.SERVICEABILITY_CRITERION;
  if (input.interactionRequired || input.incompleteReason === "INTERACTION_RULE_VALIDATION_REQUIRED" || input.incompleteReason === "INTERACTION_METHOD_UNAVAILABLE") {
    return EU_GOVERNED_REPORT_PHRASES.INTERACTION;
  }
  if (input.incompleteReason === "CODE_METHOD_UNAVAILABLE") return EU_GOVERNED_REPORT_PHRASES.CODE_UNAVAILABLE;
  if (input.overall === "CHECK_UNDETERMINED") return EU_GOVERNED_REPORT_PHRASES.INCOMPLETE;
  return EU_GOVERNED_REPORT_PHRASES.CONFORMANCE;
}

export function euCheckRowReportLanguage(kind: SteelMemberDesignCheckKind, state: SteelCheckVerdict | null, reason: SteelIncompleteReason | null): string {
  if (!state || reason === "NOT_APPLICABLE") return "not applicable";
  if (reason === "SERVICEABILITY_CRITERION_REQUIRED") return EU_GOVERNED_REPORT_PHRASES.SERVICEABILITY_CRITERION;
  if (kind === "COMBINED_ACTION" || reason === "INTERACTION_RULE_VALIDATION_REQUIRED" || reason === "INTERACTION_METHOD_UNAVAILABLE") {
    return EU_GOVERNED_REPORT_PHRASES.INTERACTION;
  }
  if (reason === "CODE_METHOD_UNAVAILABLE" || reason === "VALIDATION_REQUIRED") return EU_GOVERNED_REPORT_PHRASES.CODE_UNAVAILABLE;
  if (state === "CHECK_NOT_SATISFIED") return EU_GOVERNED_REPORT_PHRASES.NOT_SATISFIED;
  if (state === "CHECK_SATISFIED") return EU_GOVERNED_REPORT_PHRASES.MECHANICS_REFERENCE;
  return EU_GOVERNED_REPORT_PHRASES.INCOMPLETE;
}

export function assertEuGovernedReportLanguage(text: string): void {
  const lower = text.toLowerCase();
  for (const phrase of FORBIDDEN_REPORT_PHRASES) {
    if (lower.includes(phrase.toLowerCase())) {
      throw new Error("steel design fail closed: forbidden engineering report language");
    }
  }
}

export function assertNoEn1993CompliantClaim(claim: boolean | string | null | undefined): void {
  if (claim === true || (typeof claim === "string" && /en\s*1993 compliant|eurocode compliant/i.test(claim))) {
    throw new Error("steel design fail closed: forbidden engineering report language");
  }
}
