import type { EngineeringRuleAuthorityType, EuInteractionMethodRecord } from "@rtb/types";
import {
  AI_ENGINEERING_APPROVAL,
  AI_INTERACTION_PARAMETER_AUTHORITY,
  AI_NDP_AUTHORITY,
  AI_STANDARD_CONFORMANCE_AUTHORITY,
  BIAXIAL_LINEAR_INTERACTION_ASSUMED,
  EU_INTERACTION_CLASSIFICATION_GUESSED,
  EU_INTERACTION_PARAMETER_GUESSED,
  EU_SHEAR_REDUCTION_RULE_GUESSED,
  FORBIDDEN_ENGINEERING_RULE_AUTHORITIES,
  LLM_EU_INTERACTION_AUTHORITY,
  LLM_MEMORY_ONLY_RULE_ALLOWED,
  UNIVERSAL_AXIAL_BIAXIAL_EQUATION,
  UNIVERSAL_INTERACTION_EQUATION,
  UNKNOWN_INTERACTION_RELATIONSHIP_GUESSED,
} from "@rtb/types";

export function assertEuInteractionRuleAuthority(authorityType: string): asserts authorityType is EngineeringRuleAuthorityType {
  if (LLM_MEMORY_ONLY_RULE_ALLOWED) throw new Error("LLM memory must not be an allowed engineering-rule authority");
  if (LLM_EU_INTERACTION_AUTHORITY) throw new Error("AI cannot invent interaction equation");
  if (AI_STANDARD_CONFORMANCE_AUTHORITY) throw new Error("AI cannot certify standard conformance");
  if (AI_NDP_AUTHORITY) throw new Error("AI must not have NDP authority");
  if (AI_INTERACTION_PARAMETER_AUTHORITY) throw new Error("AI must not have interaction-parameter authority");
  if (AI_ENGINEERING_APPROVAL) throw new Error("AI must not approve engineering");
  if ((FORBIDDEN_ENGINEERING_RULE_AUTHORITIES as readonly string[]).includes(authorityType)) {
    throw new Error(`steel design fail closed: ${authorityType} is not an allowed engineering-rule authority`);
  }
}

export function rejectUnknownEuInteractionParameter(name: string): never {
  if (
    EU_INTERACTION_PARAMETER_GUESSED
    || EU_INTERACTION_CLASSIFICATION_GUESSED
    || EU_SHEAR_REDUCTION_RULE_GUESSED
    || UNIVERSAL_INTERACTION_EQUATION
    || UNIVERSAL_AXIAL_BIAXIAL_EQUATION
    || UNKNOWN_INTERACTION_RELATIONSHIP_GUESSED
    || BIAXIAL_LINEAR_INTERACTION_ASSUMED
  ) {
    throw new Error("unknown EU interaction parameters must not be guessed");
  }
  throw new Error(`steel design fail closed: unknown required code parameter ${name}`);
}

export function assertNotCertifiedEuInteraction(requestedState: string | null | undefined): void {
  if (requestedState === "CERTIFIED" || requestedState === "CONFORMANCE_VALIDATED" || requestedState === "EN1993_CERTIFIED") {
    throw new Error("steel design fail closed: unvalidated method requested as certified");
  }
}

export function denyAiInteractionEquation(): never {
  if (LLM_EU_INTERACTION_AUTHORITY) throw new Error("AI cannot invent interaction equation");
  throw new Error("AI_AUTHORITY_DENIED: AI cannot invent an interaction equation");
}

export function denyAiInteractionCoefficient(): never {
  if (AI_INTERACTION_PARAMETER_AUTHORITY) throw new Error("AI must not have interaction-parameter authority");
  throw new Error("AI_AUTHORITY_DENIED: AI cannot invent an interaction coefficient");
}

export function denyAiInteractionCapacityOrigin(): never {
  throw new Error("AI_AUTHORITY_DENIED: AI cannot originate EU interaction capacity");
}

export function assertNoUniversalInteractionEquation(): void {
  if (UNIVERSAL_INTERACTION_EQUATION || UNIVERSAL_AXIAL_BIAXIAL_EQUATION || UNKNOWN_INTERACTION_RELATIONSHIP_GUESSED) {
    throw new Error("universal interaction equation is forbidden");
  }
}

export function assertEuInteractionApplicability(rule: EuInteractionMethodRecord): void {
  if (!rule.applicability?.trim()) throw new Error("steel design fail closed: interaction-rule applicability is missing");
  if (!rule.interactionType) throw new Error("steel design fail closed: interaction type is missing");
  if (!rule.standardPartRef) throw new Error("steel design fail closed: unsupported standard part");
}
