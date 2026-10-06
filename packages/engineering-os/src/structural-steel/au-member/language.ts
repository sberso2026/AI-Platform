import type { SteelCheckVerdict, SteelIncompleteReason, SteelMemberCompletenessState, SteelMemberDesignCheckKind } from "@rtb/types";

export const GOVERNED_REPORT_PHRASES = {
  SATISFIED: "deterministic check satisfied",
  NOT_SATISFIED: "deterministic check not satisfied",
  INTERACTION: "interaction validation required",
  SERVICEABILITY_CRITERION: "serviceability criterion missing",
  INCOMPLETE: "member check incomplete",
  HUMAN_REVIEW: "human engineering review required",
} as const;

const FORBIDDEN_REPORT_PHRASES = [
  "AS 4100 compliant",
  "AS4100_COMPLIANT",
  "design approved",
  "certified",
  "safe for construction",
  "IFC approved",
];

export function governedReportLanguage(input: {
  overall: SteelCheckVerdict;
  completeness: SteelMemberCompletenessState;
  incompleteReason: SteelIncompleteReason | null;
  interactionRequired: boolean;
}): string {
  if (input.overall === "CHECK_NOT_SATISFIED") return GOVERNED_REPORT_PHRASES.NOT_SATISFIED;
  if (input.incompleteReason === "SERVICEABILITY_CRITERION_REQUIRED") return GOVERNED_REPORT_PHRASES.SERVICEABILITY_CRITERION;
  if (input.interactionRequired || input.incompleteReason === "INTERACTION_RULE_VALIDATION_REQUIRED") {
    return GOVERNED_REPORT_PHRASES.INTERACTION;
  }
  if (input.overall === "CHECK_UNDETERMINED" || input.completeness !== "COMPLETE") return GOVERNED_REPORT_PHRASES.INCOMPLETE;
  return GOVERNED_REPORT_PHRASES.SATISFIED;
}

export function checkRowReportLanguage(kind: SteelMemberDesignCheckKind, state: SteelCheckVerdict | null, reason: SteelIncompleteReason | null): string {
  if (!state || reason === "NOT_APPLICABLE") return "not applicable";
  if (reason === "SERVICEABILITY_CRITERION_REQUIRED") return GOVERNED_REPORT_PHRASES.SERVICEABILITY_CRITERION;
  if (kind === "COMBINED_ACTION" || reason === "INTERACTION_RULE_VALIDATION_REQUIRED") return GOVERNED_REPORT_PHRASES.INTERACTION;
  if (state === "CHECK_SATISFIED") return GOVERNED_REPORT_PHRASES.SATISFIED;
  if (state === "CHECK_NOT_SATISFIED") return GOVERNED_REPORT_PHRASES.NOT_SATISFIED;
  return GOVERNED_REPORT_PHRASES.INCOMPLETE;
}

export function assertGovernedReportLanguage(text: string): void {
  const lower = text.toLowerCase();
  for (const phrase of FORBIDDEN_REPORT_PHRASES) {
    if (lower.includes(phrase.toLowerCase())) {
      throw new Error("steel design fail closed: forbidden engineering report language");
    }
  }
}
