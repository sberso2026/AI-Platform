import type { EngineeringRuleAuthorityType, EuBendingMethodRecord } from "@rtb/types";
import {
  AI_ENGINEERING_APPROVAL,
  AI_LTB_CURVE_AUTHORITY,
  AI_NDP_AUTHORITY,
  AI_STANDARD_CONFORMANCE_AUTHORITY,
  ELASTIC_LTB_EQUALS_CODE_MEMBER_CAPACITY,
  ELASTIC_MECHANICS_EQUALS_EN1993_BENDING_CAPACITY,
  EU_BENDING_CLASSIFICATION_LIMIT_GUESSED,
  EU_BENDING_PARTIAL_FACTOR_GUESSED,
  EU_LTB_CURVE_GUESSED,
  EU_LTB_PARAMETER_GUESSED,
  EU_MOMENT_FACTOR_GUESSED,
  FORBIDDEN_ENGINEERING_RULE_AUTHORITIES,
  LLM_EU_BENDING_CAPACITY_AUTHORITY,
  LLM_MEMORY_ONLY_RULE_ALLOWED,
  UNKNOWN_EU_BENDING_CODE_PARAMETER_GUESSED,
  UNKNOWN_EU_SECTION_BENDING_PARAMETER_GUESSED,
} from "@rtb/types";

export function assertEuBendingRuleAuthority(authorityType: string): asserts authorityType is EngineeringRuleAuthorityType {
  if (LLM_MEMORY_ONLY_RULE_ALLOWED) throw new Error("LLM memory must not be an allowed engineering-rule authority");
  if (LLM_EU_BENDING_CAPACITY_AUTHORITY) throw new Error("AI cannot originate EU bending capacity");
  if (AI_STANDARD_CONFORMANCE_AUTHORITY) throw new Error("AI cannot certify standard conformance");
  if (AI_NDP_AUTHORITY) throw new Error("AI must not have NDP authority");
  if (AI_LTB_CURVE_AUTHORITY) throw new Error("AI must not have LTB-curve authority");
  if (AI_ENGINEERING_APPROVAL) throw new Error("AI must not approve engineering");
  if ((FORBIDDEN_ENGINEERING_RULE_AUTHORITIES as readonly string[]).includes(authorityType)) {
    throw new Error(`steel design fail closed: ${authorityType} is not an allowed engineering-rule authority`);
  }
}

export function assertMechanicsNotEn1993BendingCapacity(rule: EuBendingMethodRecord): void {
  if (ELASTIC_MECHANICS_EQUALS_EN1993_BENDING_CAPACITY || ELASTIC_LTB_EQUALS_CODE_MEMBER_CAPACITY) {
    throw new Error("elastic mechanics must not be labelled EN 1993 bending capacity");
  }
  if (rule.methodType === "ENGINEERING_MECHANICS_REFERENCE" && rule.outputType.includes("EUROCODE_PROFILE")) {
    throw new Error("generic mechanics must not be labelled EN 1993 capacity");
  }
}

export function rejectUnknownEuBendingCodeParameter(name: string): never {
  if (
    UNKNOWN_EU_BENDING_CODE_PARAMETER_GUESSED
    || UNKNOWN_EU_SECTION_BENDING_PARAMETER_GUESSED
    || EU_BENDING_PARTIAL_FACTOR_GUESSED
    || EU_LTB_CURVE_GUESSED
    || EU_LTB_PARAMETER_GUESSED
    || EU_MOMENT_FACTOR_GUESSED
    || EU_BENDING_CLASSIFICATION_LIMIT_GUESSED
  ) {
    throw new Error("unknown EU bending code parameters must not be guessed");
  }
  throw new Error(`steel design fail closed: unknown required code parameter ${name}`);
}

export function assertNotCertifiedEuBending(requestedState: string | null | undefined): void {
  if (requestedState === "CERTIFIED" || requestedState === "CONFORMANCE_VALIDATED" || requestedState === "EN1993_CERTIFIED") {
    throw new Error("steel design fail closed: unvalidated method requested as certified");
  }
}

export function denyAiLtbCurveChoice(): never {
  if (AI_LTB_CURVE_AUTHORITY) throw new Error("AI must not have LTB-curve authority");
  throw new Error("AI_AUTHORITY_DENIED: AI cannot choose an LTB curve");
}

export function denyAiUnbracedLengthChoice(): never {
  throw new Error("AI cannot invent LTB values");
}

export function denyAiRestraintChoice(): never {
  throw new Error("AI cannot invent restraint");
}

export function denyAiBendingCapacityOrigin(): never {
  if (LLM_EU_BENDING_CAPACITY_AUTHORITY) throw new Error("AI cannot originate EU bending capacity");
  throw new Error("AI_AUTHORITY_DENIED: AI cannot originate EU bending capacity");
}

export function assertMixedAuthorityBendingComparisonGoverned(
  left: "MECHANICS_REFERENCE" | "EUROCODE_PROFILE_MEMBER_CAPACITY",
  right: "MECHANICS_REFERENCE" | "EUROCODE_PROFILE_MEMBER_CAPACITY",
): void {
  if (left !== right) {
    throw new Error("mixed authority results must not be compared as equivalent");
  }
}

export function assertMemberBendingNotGlobalFrame(): void {
  throw new Error("member bending stability is not global frame stability");
}
