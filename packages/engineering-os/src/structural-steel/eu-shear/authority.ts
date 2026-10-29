import type { EngineeringRuleAuthorityType, EuShearMethodRecord } from "@rtb/types";
import {
  AI_BUCKLING_PARAMETER_AUTHORITY,
  AI_ENGINEERING_APPROVAL,
  AI_NDP_AUTHORITY,
  AI_SHEAR_AREA_AUTHORITY,
  AI_STANDARD_CONFORMANCE_AUTHORITY,
  ELASTIC_SHEAR_BUCKLING_EQUALS_CODE_CAPACITY,
  EU_SHEAR_BUCKLING_COEFFICIENT_GUESSED,
  EU_SHEAR_PARTIAL_FACTOR_GUESSED,
  EU_WEB_SLENDERNESS_LIMIT_GUESSED,
  FORBIDDEN_ENGINEERING_RULE_AUTHORITIES,
  GENERIC_SHEAR_MECHANICS_EQUALS_EN1993_CAPACITY,
  LLM_EU_SHEAR_CAPACITY_AUTHORITY,
  LLM_MEMORY_ONLY_RULE_ALLOWED,
  UNKNOWN_EU_SECTION_SHEAR_PARAMETER_GUESSED,
  UNKNOWN_EU_SHEAR_CODE_PARAMETER_GUESSED,
} from "@rtb/types";

export function assertEuShearRuleAuthority(authorityType: string): asserts authorityType is EngineeringRuleAuthorityType {
  if (LLM_MEMORY_ONLY_RULE_ALLOWED) throw new Error("LLM memory must not be an allowed engineering-rule authority");
  if (LLM_EU_SHEAR_CAPACITY_AUTHORITY) throw new Error("AI cannot originate EU shear capacity");
  if (AI_STANDARD_CONFORMANCE_AUTHORITY) throw new Error("AI cannot certify standard conformance");
  if (AI_NDP_AUTHORITY) throw new Error("AI must not have NDP authority");
  if (AI_SHEAR_AREA_AUTHORITY) throw new Error("AI must not have shear-area authority");
  if (AI_BUCKLING_PARAMETER_AUTHORITY) throw new Error("AI must not have buckling-parameter authority");
  if (AI_ENGINEERING_APPROVAL) throw new Error("AI must not approve engineering");
  if ((FORBIDDEN_ENGINEERING_RULE_AUTHORITIES as readonly string[]).includes(authorityType)) {
    throw new Error(`steel design fail closed: ${authorityType} is not an allowed engineering-rule authority`);
  }
}

export function assertMechanicsNotEn1993ShearCapacity(rule: EuShearMethodRecord): void {
  if (GENERIC_SHEAR_MECHANICS_EQUALS_EN1993_CAPACITY || ELASTIC_SHEAR_BUCKLING_EQUALS_CODE_CAPACITY) {
    throw new Error("generic shear mechanics must not be labelled EN 1993 capacity");
  }
  if (rule.methodType === "ENGINEERING_MECHANICS_REFERENCE" && rule.outputType.includes("EUROCODE_PROFILE")) {
    throw new Error("generic mechanics must not be labelled EN 1993 capacity");
  }
}

export function rejectUnknownEuShearCodeParameter(name: string): never {
  if (
    UNKNOWN_EU_SHEAR_CODE_PARAMETER_GUESSED
    || UNKNOWN_EU_SECTION_SHEAR_PARAMETER_GUESSED
    || EU_SHEAR_PARTIAL_FACTOR_GUESSED
    || EU_SHEAR_BUCKLING_COEFFICIENT_GUESSED
    || EU_WEB_SLENDERNESS_LIMIT_GUESSED
  ) {
    throw new Error("unknown EU shear code parameters must not be guessed");
  }
  throw new Error(`steel design fail closed: unknown required code parameter ${name}`);
}

export function assertNotCertifiedEuShear(requestedState: string | null | undefined): void {
  if (requestedState === "CERTIFIED" || requestedState === "CONFORMANCE_VALIDATED" || requestedState === "EN1993_CERTIFIED") {
    throw new Error("steel design fail closed: unvalidated method requested as certified");
  }
}

export function denyAiShearAreaChoice(): never {
  if (AI_SHEAR_AREA_AUTHORITY) throw new Error("AI must not have shear-area authority");
  throw new Error("AI_AUTHORITY_DENIED: AI cannot invent a shear area");
}

export function denyAiWebSlendernessChoice(): never {
  throw new Error("AI_AUTHORITY_DENIED: AI cannot invent web slenderness");
}

export function denyAiBucklingCoefficientChoice(): never {
  if (AI_BUCKLING_PARAMETER_AUTHORITY) throw new Error("AI must not have buckling-parameter authority");
  throw new Error("AI_AUTHORITY_DENIED: AI cannot invent a buckling coefficient");
}

export function denyAiStiffenerChoice(): never {
  throw new Error("AI_AUTHORITY_DENIED: AI cannot invent stiffener state");
}

export function denyAiShearCapacityOrigin(): never {
  if (LLM_EU_SHEAR_CAPACITY_AUTHORITY) throw new Error("AI cannot originate EU shear capacity");
  throw new Error("AI_AUTHORITY_DENIED: AI cannot originate EU shear capacity");
}

export function assertMixedAuthorityShearComparisonGoverned(
  left: "MECHANICS_REFERENCE" | "EUROCODE_PROFILE_SHEAR_CAPACITY",
  right: "MECHANICS_REFERENCE" | "EUROCODE_PROFILE_SHEAR_CAPACITY",
): void {
  if (left !== right) {
    throw new Error("mixed authority results must not be compared as equivalent");
  }
}
