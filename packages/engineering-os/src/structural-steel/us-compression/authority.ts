import type { EngineeringRuleAuthorityType, UsCompressionMethodRecord } from "@rtb/types";
import {
  AI_EFFECTIVE_LENGTH_FACTOR_AUTHORITY,
  AI_ELEMENT_CLASSIFICATION_AUTHORITY,
  AI_ENGINEERING_APPROVAL,
  AI_FACTOR_AUTHORITY,
  AI_STABILITY_METHOD_AUTHORITY,
  AI_STANDARD_CONFORMANCE_AUTHORITY,
  AI_US_COMPRESSION_ASSISTANCE_ADVISORY_ONLY,
  DEFAULT_K_FACTOR,
  EULER_REFERENCE_EQUALS_AISC_MEMBER_STRENGTH,
  FORBIDDEN_ENGINEERING_RULE_AUTHORITIES,
  LLM_MEMORY_ONLY_RULE_ALLOWED,
  LLM_US_COMPRESSION_STRENGTH_AUTHORITY,
  SUPPORT_LABEL_AUTOMATICALLY_DEFINES_K_FACTOR,
  UNKNOWN_US_COMPRESSION_CODE_PARAMETER_GUESSED,
  US_CODE_SLENDERNESS_LIMIT_GUESSED,
  US_COMPRESSION_ASD_FACTOR_GUESSED,
  US_COMPRESSION_LRFD_FACTOR_GUESSED,
  US_COMPRESSION_STRENGTH_RULE_GUESSED,
  US_CONNECTION_COMPRESSION_DESIGN_IMPLEMENTED,
  US_ELEMENT_CLASSIFICATION_LIMIT_GUESSED,
  US_SEISMIC_COMPRESSION_DESIGN_IMPLEMENTED,
  US_STEEL_PACK_CERTIFIED,
} from "@rtb/types";

export function assertUsCompressionRuleAuthority(authorityType: string): asserts authorityType is EngineeringRuleAuthorityType {
  if (!AI_US_COMPRESSION_ASSISTANCE_ADVISORY_ONLY) throw new Error("AI US compression assistance must remain advisory");
  if (LLM_MEMORY_ONLY_RULE_ALLOWED) throw new Error("LLM memory must not be an allowed engineering-rule authority");
  if (LLM_US_COMPRESSION_STRENGTH_AUTHORITY) throw new Error("AI cannot originate US compression strength");
  if (AI_STANDARD_CONFORMANCE_AUTHORITY) throw new Error("AI cannot certify standard conformance");
  if (AI_FACTOR_AUTHORITY) throw new Error("AI cannot invent an AISC factor");
  if (AI_EFFECTIVE_LENGTH_FACTOR_AUTHORITY) throw new Error("AI cannot invent an effective-length factor");
  if (AI_STABILITY_METHOD_AUTHORITY) throw new Error("AI cannot choose a stability-analysis method");
  if (AI_ELEMENT_CLASSIFICATION_AUTHORITY) throw new Error("AI cannot invent element classification");
  if (AI_ENGINEERING_APPROVAL) throw new Error("AI must not approve engineering");
  if ((FORBIDDEN_ENGINEERING_RULE_AUTHORITIES as readonly string[]).includes(authorityType)) {
    throw new Error(`steel design fail closed: ${authorityType} is not an allowed engineering-rule authority`);
  }
}

export function assertMechanicsNotAiscCompressionStrength(rule: UsCompressionMethodRecord): void {
  if (EULER_REFERENCE_EQUALS_AISC_MEMBER_STRENGTH) {
    throw new Error("Euler reference must not be labelled AISC member strength");
  }
  if (
    (rule.methodType === "ENGINEERING_MECHANICS_REFERENCE" || rule.methodType === "ELASTIC_BUCKLING_REFERENCE")
    && (rule.outputType.includes("AISC_LRFD") || rule.outputType.includes("AISC_ASD") || rule.outputType.includes("AISC_NOMINAL"))
  ) {
    throw new Error("generic mechanics must not be labelled AISC member strength");
  }
}

export function rejectUnknownUsCompressionCodeParameter(name: string): never {
  if (
    UNKNOWN_US_COMPRESSION_CODE_PARAMETER_GUESSED
    || US_COMPRESSION_STRENGTH_RULE_GUESSED
    || US_COMPRESSION_LRFD_FACTOR_GUESSED
    || US_COMPRESSION_ASD_FACTOR_GUESSED
    || US_CODE_SLENDERNESS_LIMIT_GUESSED
    || US_ELEMENT_CLASSIFICATION_LIMIT_GUESSED
  ) {
    throw new Error("unknown US compression code parameters must not be guessed");
  }
  throw new Error(`steel design fail closed: unknown required code parameter ${name}`);
}

export function denyAiUsKFactor(): never {
  if (AI_EFFECTIVE_LENGTH_FACTOR_AUTHORITY || DEFAULT_K_FACTOR) {
    throw new Error("AI cannot invent an effective-length factor");
  }
  throw new Error("AI_AUTHORITY_DENIED: AI cannot invent a K factor");
}

export function denyAiUsStabilityMethod(): never {
  if (AI_STABILITY_METHOD_AUTHORITY) throw new Error("AI cannot choose a stability-analysis method");
  throw new Error("AI_AUTHORITY_DENIED: AI cannot choose a stability-analysis method");
}

export function denyAiUsElementClassification(): never {
  if (AI_ELEMENT_CLASSIFICATION_AUTHORITY || US_ELEMENT_CLASSIFICATION_LIMIT_GUESSED) {
    throw new Error("AI cannot invent element classification");
  }
  throw new Error("AI_AUTHORITY_DENIED: AI cannot invent element classification");
}

export function denyAiUsCompressionFactor(): never {
  if (AI_FACTOR_AUTHORITY || US_COMPRESSION_LRFD_FACTOR_GUESSED || US_COMPRESSION_ASD_FACTOR_GUESSED) {
    throw new Error("AI cannot invent an AISC factor");
  }
  throw new Error("AI_AUTHORITY_DENIED: AI cannot invent an AISC compression factor");
}

export function denyAiUsCompressionStrength(): never {
  if (LLM_US_COMPRESSION_STRENGTH_AUTHORITY) throw new Error("AI cannot originate US compression strength");
  throw new Error("AI_AUTHORITY_DENIED: AI cannot originate AISC compression strength");
}

export function requestUsCompressionLrfdFactor(): never {
  if (US_COMPRESSION_LRFD_FACTOR_GUESSED) throw new Error("LRFD resistance factor must not be guessed");
  return rejectUnknownUsCompressionCodeParameter("phi_c");
}

export function requestUsCompressionAsdFactor(): never {
  if (US_COMPRESSION_ASD_FACTOR_GUESSED) throw new Error("ASD allowable-strength factor must not be guessed");
  return rejectUnknownUsCompressionCodeParameter("Omega_c");
}

export function requestUsCompressionStrengthRule(): never {
  if (US_COMPRESSION_STRENGTH_RULE_GUESSED) throw new Error("AISC compression-strength rule must not be guessed");
  return rejectUnknownUsCompressionCodeParameter("compressionStrengthCurve");
}

export function assertUsCompressionLrfdAsdFactorIsolation(designMethod: "LRFD" | "ASD", factorKind: "phi_c" | "Omega_c"): void {
  if (designMethod === "LRFD" && factorKind === "Omega_c") {
    throw new Error("steel design fail closed: ASD factor cannot be used in LRFD");
  }
  if (designMethod === "ASD" && factorKind === "phi_c") {
    throw new Error("steel design fail closed: LRFD factor cannot be used in ASD");
  }
}

export function assertUsMixedAuthorityCompressionComparison(
  left: "MECHANICS_REFERENCE" | "ELASTIC_BUCKLING_REFERENCE" | "AISC_NOMINAL_COMPRESSIVE_STRENGTH" | "AISC_LRFD_DESIGN_STRENGTH" | "AISC_ASD_ALLOWABLE_STRENGTH",
  right: "MECHANICS_REFERENCE" | "ELASTIC_BUCKLING_REFERENCE" | "AISC_NOMINAL_COMPRESSIVE_STRENGTH" | "AISC_LRFD_DESIGN_STRENGTH" | "AISC_ASD_ALLOWABLE_STRENGTH",
): void {
  const mechanics = left === "MECHANICS_REFERENCE" || left === "ELASTIC_BUCKLING_REFERENCE";
  const code = right === "AISC_NOMINAL_COMPRESSIVE_STRENGTH" || right === "AISC_LRFD_DESIGN_STRENGTH" || right === "AISC_ASD_ALLOWABLE_STRENGTH";
  if (mechanics && code) {
    throw new Error("mixed authority results must not be compared as equivalent");
  }
  if (left !== right && !(mechanics && (right === "MECHANICS_REFERENCE" || right === "ELASTIC_BUCKLING_REFERENCE"))) {
    throw new Error("mixed authority results must not be compared as equivalent");
  }
}

export function assertUsMemberStabilityNotGlobalFrame(): void {
  throw new Error("member stability is not global frame stability");
}

export function assertD1cNotCompleteUsStabilityAnalysis(): void {
  throw new Error("D1C is not complete US stability analysis");
}

export function assertSupportLabelDoesNotDefineK(_label: string): never {
  if (SUPPORT_LABEL_AUTOMATICALLY_DEFINES_K_FACTOR) {
    throw new Error("support labels must not automatically define K");
  }
  throw new Error("support labels do not automatically define K factor");
}

export function assertNoDefaultKFactor(): void {
  if (DEFAULT_K_FACTOR) throw new Error("K factor must not be defaulted");
}

export function assertNotCertifiedUsCompression(requestedState: string | null | undefined): void {
  if (US_STEEL_PACK_CERTIFIED) throw new Error("US steel pack is not certified in US-3");
  if (requestedState === "CERTIFIED" || requestedState === "CONFORMANCE_VALIDATED" || requestedState === "AISC_CERTIFIED") {
    throw new Error("steel design fail closed: unvalidated method requested as certified");
  }
}

export function assertUsCompressionBoundaries(): void {
  if (US_SEISMIC_COMPRESSION_DESIGN_IMPLEMENTED) throw new Error("seismic compression design must not be implemented in US-3");
  if (US_CONNECTION_COMPRESSION_DESIGN_IMPLEMENTED) throw new Error("connection compression design must not be implemented in US-3");
}
