import type { SteelEngineeringRule, SteelHumanRuleConfirmation, SteelStandardConformanceState } from "@rtb/types";

export function applyHumanRuleConfirmation(
  rule: SteelEngineeringRule,
  confirmation: SteelHumanRuleConfirmation,
): SteelEngineeringRule {
  if (confirmation.ruleId !== rule.ruleId) {
    throw new Error("steel design fail closed: human rule confirmation does not match the engineering rule");
  }
  if (!confirmation.reviewer?.trim() || !confirmation.confirmedAt?.trim()) {
    throw new Error("steel design fail closed: human rule confirmation requires reviewer and timestamp");
  }
  const conformance: SteelStandardConformanceState = "ENGINEER_CONFIRMED";
  return {
    ...rule,
    clauseRef: confirmation.referenceIdentifier ?? rule.clauseRef,
    humanReviewState: "confirmed",
    standardConformanceState: conformance,
    bindingState: "HUMAN_VALIDATED",
    validationState: "HUMAN_VALIDATED",
  };
}

export function assertNotCertified(rule: SteelEngineeringRule, requestedState: string | null | undefined): void {
  if (requestedState === "CERTIFIED" || requestedState === "CONFORMANCE_VALIDATED" || requestedState === "AS4100_CERTIFIED") {
    throw new Error("steel design fail closed: unvalidated method requested as certified");
  }
  if (rule.validationState === "CERTIFIED" || rule.standardConformanceState === "CERTIFIED") {
    throw new Error("steel design fail closed: unvalidated method requested as certified");
  }
}
