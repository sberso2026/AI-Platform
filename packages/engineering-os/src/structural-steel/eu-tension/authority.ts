import type { EngineeringRuleAuthorityType, EuTensionMethodRecord } from "@rtb/types";
import {
  AI_ENGINEERING_APPROVAL,
  AI_NDP_AUTHORITY,
  AI_STANDARD_CONFORMANCE_AUTHORITY,
  EU_PARTIAL_FACTOR_GUESSED,
  FORBIDDEN_ENGINEERING_RULE_AUTHORITIES,
  GENERIC_MECHANICS_EQUALS_EN1993_CAPACITY,
  LLM_EU_TENSION_CAPACITY_AUTHORITY,
  LLM_MEMORY_ONLY_RULE_ALLOWED,
  UNKNOWN_EU_CODE_PARAMETER_GUESSED,
} from "@rtb/types";

export function assertEuTensionRuleAuthority(authorityType: string): asserts authorityType is EngineeringRuleAuthorityType {
  if (LLM_MEMORY_ONLY_RULE_ALLOWED) throw new Error("LLM memory must not be an allowed engineering-rule authority");
  if (LLM_EU_TENSION_CAPACITY_AUTHORITY) throw new Error("AI cannot originate EU tension capacity");
  if (AI_STANDARD_CONFORMANCE_AUTHORITY) throw new Error("AI cannot certify standard conformance");
  if (AI_NDP_AUTHORITY) throw new Error("AI must not have NDP authority");
  if (AI_ENGINEERING_APPROVAL) throw new Error("AI must not approve engineering");
  if ((FORBIDDEN_ENGINEERING_RULE_AUTHORITIES as readonly string[]).includes(authorityType)) {
    throw new Error(`steel design fail closed: ${authorityType} is not an allowed engineering-rule authority`);
  }
}

export function assertMechanicsNotEurocodeCapacity(rule: EuTensionMethodRecord): void {
  if (GENERIC_MECHANICS_EQUALS_EN1993_CAPACITY) {
    throw new Error("generic mechanics must not be labelled EN 1993 capacity");
  }
  if (rule.methodType === "ENGINEERING_MECHANICS_REFERENCE" && rule.outputType.includes("EUROCODE_PROFILE")) {
    throw new Error("generic mechanics must not be labelled EN 1993 capacity");
  }
}

export function rejectUnknownEuCodeParameter(name: string): never {
  if (UNKNOWN_EU_CODE_PARAMETER_GUESSED || EU_PARTIAL_FACTOR_GUESSED) {
    throw new Error("unknown EU code parameters must not be guessed");
  }
  throw new Error(`steel design fail closed: unknown required code parameter ${name}`);
}

export function assertNotCertifiedEuTension(requestedState: string | null | undefined): void {
  if (requestedState === "CERTIFIED" || requestedState === "CONFORMANCE_VALIDATED" || requestedState === "EN1993_CERTIFIED") {
    throw new Error("steel design fail closed: unvalidated method requested as certified");
  }
}
