import type { EngineeringRuleAuthorityType, EuCompressionMethodRecord } from "@rtb/types";
import {
  AI_BUCKLING_CURVE_AUTHORITY,
  AI_ENGINEERING_APPROVAL,
  AI_NDP_AUTHORITY,
  AI_STANDARD_CONFORMANCE_AUTHORITY,
  BUCKLING_CURVE_GUESSED,
  EULER_REFERENCE_EQUALS_EN1993_MEMBER_CAPACITY,
  EU_BUCKLING_PARAMETER_GUESSED,
  EU_COMPRESSION_PARTIAL_FACTOR_GUESSED,
  EU_CODE_SLENDERNESS_RULE_GUESSED,
  EU_SECTION_CLASSIFICATION_LIMIT_GUESSED,
  FORBIDDEN_ENGINEERING_RULE_AUTHORITIES,
  LLM_EU_COMPRESSION_CAPACITY_AUTHORITY,
  LLM_MEMORY_ONLY_RULE_ALLOWED,
  UNKNOWN_EU_COMPRESSION_CODE_PARAMETER_GUESSED,
} from "@rtb/types";

export function assertEuCompressionRuleAuthority(authorityType: string): asserts authorityType is EngineeringRuleAuthorityType {
  if (LLM_MEMORY_ONLY_RULE_ALLOWED) throw new Error("LLM memory must not be an allowed engineering-rule authority");
  if (LLM_EU_COMPRESSION_CAPACITY_AUTHORITY) throw new Error("AI cannot originate EU compression capacity");
  if (AI_STANDARD_CONFORMANCE_AUTHORITY) throw new Error("AI cannot certify standard conformance");
  if (AI_NDP_AUTHORITY) throw new Error("AI must not have NDP authority");
  if (AI_BUCKLING_CURVE_AUTHORITY) throw new Error("AI must not have buckling-curve authority");
  if (AI_ENGINEERING_APPROVAL) throw new Error("AI must not approve engineering");
  if ((FORBIDDEN_ENGINEERING_RULE_AUTHORITIES as readonly string[]).includes(authorityType)) {
    throw new Error(`steel design fail closed: ${authorityType} is not an allowed engineering-rule authority`);
  }
}

export function assertMechanicsNotEn1993MemberCapacity(rule: EuCompressionMethodRecord): void {
  if (EULER_REFERENCE_EQUALS_EN1993_MEMBER_CAPACITY) {
    throw new Error("Euler reference must not be labelled EN 1993 member capacity");
  }
  if (rule.methodType === "ENGINEERING_MECHANICS_REFERENCE" && rule.outputType.includes("EUROCODE_PROFILE")) {
    throw new Error("generic mechanics must not be labelled EN 1993 capacity");
  }
}

export function rejectUnknownEuCompressionCodeParameter(name: string): never {
  if (
    UNKNOWN_EU_COMPRESSION_CODE_PARAMETER_GUESSED
    || EU_COMPRESSION_PARTIAL_FACTOR_GUESSED
    || BUCKLING_CURVE_GUESSED
    || EU_BUCKLING_PARAMETER_GUESSED
    || EU_SECTION_CLASSIFICATION_LIMIT_GUESSED
    || EU_CODE_SLENDERNESS_RULE_GUESSED
  ) {
    throw new Error("unknown EU compression code parameters must not be guessed");
  }
  throw new Error(`steel design fail closed: unknown required code parameter ${name}`);
}

export function assertNotCertifiedEuCompression(requestedState: string | null | undefined): void {
  if (requestedState === "CERTIFIED" || requestedState === "CONFORMANCE_VALIDATED" || requestedState === "EN1993_CERTIFIED") {
    throw new Error("steel design fail closed: unvalidated method requested as certified");
  }
}

export function denyAiBucklingCurveChoice(): never {
  if (AI_BUCKLING_CURVE_AUTHORITY) throw new Error("AI must not have buckling-curve authority");
  throw new Error("AI_AUTHORITY_DENIED: AI cannot choose a buckling curve");
}

export function denyAiEffectiveLengthChoice(): never {
  throw new Error("AI cannot supply effective length");
}

export function denyAiCompressionCapacityOrigin(): never {
  if (LLM_EU_COMPRESSION_CAPACITY_AUTHORITY) throw new Error("AI cannot originate EU compression capacity");
  throw new Error("AI_AUTHORITY_DENIED: AI cannot originate EU compression capacity");
}

export function assertMixedAuthorityComparisonGoverned(
  left: "MECHANICS_REFERENCE" | "EUROCODE_PROFILE_MEMBER_CAPACITY",
  right: "MECHANICS_REFERENCE" | "EUROCODE_PROFILE_MEMBER_CAPACITY",
): void {
  if (left !== right) {
    throw new Error("mixed authority results must not be compared as equivalent");
  }
}

export function assertMemberStabilityNotGlobalFrame(): void {
  throw new Error("member stability is not global frame stability");
}
