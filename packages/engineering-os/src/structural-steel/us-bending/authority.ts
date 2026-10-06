import type { EngineeringRuleAuthorityType, UsBendingMethodRecord } from "@rtb/types";
import {
  AI_CB_FACTOR_AUTHORITY,
  AI_ELEMENT_CLASSIFICATION_AUTHORITY,
  AI_ENGINEERING_APPROVAL,
  AI_FACTOR_AUTHORITY,
  AI_LTB_RESTRAINT_AUTHORITY,
  AI_STANDARD_CONFORMANCE_AUTHORITY,
  AI_UNBRACED_LENGTH_AUTHORITY,
  AI_US_BENDING_ASSISTANCE_ADVISORY_ONLY,
  ELASTIC_BENDING_EQUALS_AISC_FLEXURAL_STRENGTH,
  ELASTIC_LTB_EQUALS_AISC_FLEXURAL_STRENGTH,
  FORBIDDEN_ENGINEERING_RULE_AUTHORITIES,
  GENERIC_SUPPORT_AUTOMATICALLY_DEFINES_LTB_RESTRAINT,
  LLM_MEMORY_ONLY_RULE_ALLOWED,
  LLM_US_BENDING_STRENGTH_AUTHORITY,
  PLASTIC_CAPACITY_ASSUMED_WITHOUT_CLASSIFICATION,
  UNKNOWN_US_BENDING_CODE_PARAMETER_GUESSED,
  UNKNOWN_US_SECTION_FLEXURAL_PARAMETER_GUESSED,
  US_BENDING_ASD_FACTOR_GUESSED,
  US_BENDING_CLASSIFICATION_LIMIT_GUESSED,
  US_BENDING_LRFD_FACTOR_GUESSED,
  US_CB_FACTOR_GUESSED,
  US_CONNECTION_BENDING_DESIGN_IMPLEMENTED,
  US_LOCAL_BUCKLING_RULE_GUESSED,
  US_LTB_STRENGTH_RULE_GUESSED,
  US_LTB_TRANSITION_PARAMETER_GUESSED,
  US_SEISMIC_BENDING_DESIGN_IMPLEMENTED,
  US_STEEL_PACK_CERTIFIED,
} from "@rtb/types";

export function assertUsBendingRuleAuthority(authorityType: string): asserts authorityType is EngineeringRuleAuthorityType {
  if (!AI_US_BENDING_ASSISTANCE_ADVISORY_ONLY) throw new Error("AI US bending assistance must remain advisory");
  if (LLM_MEMORY_ONLY_RULE_ALLOWED) throw new Error("LLM memory must not be an allowed engineering-rule authority");
  if (LLM_US_BENDING_STRENGTH_AUTHORITY) throw new Error("AI cannot originate US bending strength");
  if (AI_STANDARD_CONFORMANCE_AUTHORITY) throw new Error("AI cannot certify standard conformance");
  if (AI_FACTOR_AUTHORITY) throw new Error("AI cannot invent an AISC factor");
  if (AI_ELEMENT_CLASSIFICATION_AUTHORITY) throw new Error("AI cannot invent element classification");
  if (AI_UNBRACED_LENGTH_AUTHORITY) throw new Error("AI cannot invent unbraced length");
  if (AI_LTB_RESTRAINT_AUTHORITY) throw new Error("AI cannot invent LTB restraint");
  if (AI_CB_FACTOR_AUTHORITY) throw new Error("AI cannot invent Cb");
  if (AI_ENGINEERING_APPROVAL) throw new Error("AI must not approve engineering");
  if ((FORBIDDEN_ENGINEERING_RULE_AUTHORITIES as readonly string[]).includes(authorityType)) {
    throw new Error(`steel design fail closed: ${authorityType} is not an allowed engineering-rule authority`);
  }
}

export function assertMechanicsNotAiscFlexuralStrength(rule: UsBendingMethodRecord): void {
  if (ELASTIC_BENDING_EQUALS_AISC_FLEXURAL_STRENGTH || ELASTIC_LTB_EQUALS_AISC_FLEXURAL_STRENGTH) {
    throw new Error("elastic mechanics must not be labelled AISC flexural strength");
  }
  if (
    (rule.methodType === "ENGINEERING_MECHANICS_REFERENCE" || rule.methodType === "ELASTIC_BENDING_REFERENCE" || rule.methodType === "ELASTIC_LTB_REFERENCE")
    && (rule.outputType.includes("AISC_LRFD") || rule.outputType.includes("AISC_ASD") || rule.outputType.includes("AISC_NOMINAL"))
  ) {
    throw new Error("generic mechanics must not be labelled AISC flexural strength");
  }
}

export function rejectUnknownUsBendingCodeParameter(name: string): never {
  if (
    UNKNOWN_US_BENDING_CODE_PARAMETER_GUESSED
    || UNKNOWN_US_SECTION_FLEXURAL_PARAMETER_GUESSED
    || US_BENDING_CLASSIFICATION_LIMIT_GUESSED
    || US_LOCAL_BUCKLING_RULE_GUESSED
    || US_CB_FACTOR_GUESSED
    || US_LTB_TRANSITION_PARAMETER_GUESSED
    || US_LTB_STRENGTH_RULE_GUESSED
    || US_BENDING_LRFD_FACTOR_GUESSED
    || US_BENDING_ASD_FACTOR_GUESSED
  ) {
    throw new Error("unknown US bending code parameters must not be guessed");
  }
  throw new Error(`steel design fail closed: unknown required code parameter ${name}`);
}

export function denyAiUsUnbracedLength(): never {
  if (AI_UNBRACED_LENGTH_AUTHORITY) throw new Error("AI cannot invent unbraced length");
  throw new Error("AI_AUTHORITY_DENIED: AI cannot invent unbraced length");
}

export function denyAiUsLtbRestraint(): never {
  if (AI_LTB_RESTRAINT_AUTHORITY) throw new Error("AI cannot invent LTB restraint");
  throw new Error("AI_AUTHORITY_DENIED: AI cannot invent LTB restraint");
}

export function denyAiUsCbFactor(): never {
  if (AI_CB_FACTOR_AUTHORITY || US_CB_FACTOR_GUESSED) throw new Error("AI cannot invent Cb");
  throw new Error("AI_AUTHORITY_DENIED: AI cannot invent Cb");
}

export function denyAiUsBendingClassification(): never {
  if (AI_ELEMENT_CLASSIFICATION_AUTHORITY || US_BENDING_CLASSIFICATION_LIMIT_GUESSED) {
    throw new Error("AI cannot invent element classification");
  }
  throw new Error("AI_AUTHORITY_DENIED: AI cannot invent element classification");
}

export function denyAiUsBendingFactor(): never {
  if (AI_FACTOR_AUTHORITY || US_BENDING_LRFD_FACTOR_GUESSED || US_BENDING_ASD_FACTOR_GUESSED) {
    throw new Error("AI cannot invent an AISC factor");
  }
  throw new Error("AI_AUTHORITY_DENIED: AI cannot invent an AISC bending factor");
}

export function denyAiUsBendingStrength(): never {
  if (LLM_US_BENDING_STRENGTH_AUTHORITY) throw new Error("AI cannot originate US bending strength");
  throw new Error("AI_AUTHORITY_DENIED: AI cannot originate AISC flexural strength");
}

export function denyAiUsLtbRule(): never {
  if (US_LTB_STRENGTH_RULE_GUESSED) throw new Error("AISC LTB strength rule must not be guessed");
  throw new Error("AI_AUTHORITY_DENIED: AI cannot invent an AISC LTB rule");
}

export function requestUsBendingLrfdFactor(): never {
  if (US_BENDING_LRFD_FACTOR_GUESSED) throw new Error("LRFD resistance factor must not be guessed");
  return rejectUnknownUsBendingCodeParameter("phi_b");
}

export function requestUsBendingAsdFactor(): never {
  if (US_BENDING_ASD_FACTOR_GUESSED) throw new Error("ASD allowable-strength factor must not be guessed");
  return rejectUnknownUsBendingCodeParameter("Omega_b");
}

export function requestUsCbFactor(): never {
  if (US_CB_FACTOR_GUESSED) throw new Error("Cb must not be guessed");
  return rejectUnknownUsBendingCodeParameter("Cb");
}

export function requestUsLtbTransitionParameters(): never {
  if (US_LTB_TRANSITION_PARAMETER_GUESSED) throw new Error("Lp/Lr must not be guessed");
  return rejectUnknownUsBendingCodeParameter("Lp_Lr");
}

export function requestUsLocalBucklingRule(): never {
  if (US_LOCAL_BUCKLING_RULE_GUESSED) throw new Error("local-buckling rule must not be guessed");
  return rejectUnknownUsBendingCodeParameter("localBucklingReduction");
}

export function requestUsSectionFlexuralStrength(): never {
  return rejectUnknownUsBendingCodeParameter("sectionFlexuralStrength");
}

export function requestUsLtbStrengthRule(): never {
  if (US_LTB_STRENGTH_RULE_GUESSED) throw new Error("AISC LTB strength rule must not be guessed");
  return rejectUnknownUsBendingCodeParameter("ltbStrengthCurve");
}

export function assertUsBendingLrfdAsdFactorIsolation(designMethod: "LRFD" | "ASD", factorKind: "phi_b" | "Omega_b"): void {
  if (designMethod === "LRFD" && factorKind === "Omega_b") {
    throw new Error("steel design fail closed: ASD factor cannot be used in LRFD");
  }
  if (designMethod === "ASD" && factorKind === "phi_b") {
    throw new Error("steel design fail closed: LRFD factor cannot be used in ASD");
  }
}

export function assertUsMixedAuthorityBendingComparison(
  left: "MECHANICS_REFERENCE" | "ELASTIC_LTB_REFERENCE" | "AISC_NOMINAL_FLEXURAL_STRENGTH" | "AISC_LRFD_DESIGN_STRENGTH" | "AISC_ASD_ALLOWABLE_STRENGTH",
  right: "MECHANICS_REFERENCE" | "ELASTIC_LTB_REFERENCE" | "AISC_NOMINAL_FLEXURAL_STRENGTH" | "AISC_LRFD_DESIGN_STRENGTH" | "AISC_ASD_ALLOWABLE_STRENGTH",
): void {
  const mechanics = left === "MECHANICS_REFERENCE" || left === "ELASTIC_LTB_REFERENCE";
  const code = right === "AISC_NOMINAL_FLEXURAL_STRENGTH" || right === "AISC_LRFD_DESIGN_STRENGTH" || right === "AISC_ASD_ALLOWABLE_STRENGTH";
  if (mechanics && code) {
    throw new Error("mixed authority results must not be compared as equivalent");
  }
  if (left !== right && !(mechanics && (right === "MECHANICS_REFERENCE" || right === "ELASTIC_LTB_REFERENCE"))) {
    throw new Error("mixed authority results must not be compared as equivalent");
  }
}

export function assertUsMemberBendingNotGlobalFrame(): void {
  throw new Error("member bending stability is not global frame stability");
}

export function assertSupportDoesNotDefineLtbRestraint(_label: string): never {
  if (GENERIC_SUPPORT_AUTOMATICALLY_DEFINES_LTB_RESTRAINT) {
    throw new Error("generic supports must not automatically define LTB restraint");
  }
  throw new Error("generic supports do not automatically define LTB restraint");
}

export function assertPlasticCapacityNotAssumedWithoutClassification(): void {
  if (PLASTIC_CAPACITY_ASSUMED_WITHOUT_CLASSIFICATION) {
    throw new Error("plastic capacity must not be assumed without classification");
  }
}

export function assertNotCertifiedUsBending(requestedState: string | null | undefined): void {
  if (US_STEEL_PACK_CERTIFIED) throw new Error("US steel pack is not certified in US-4");
  if (requestedState === "CERTIFIED" || requestedState === "CONFORMANCE_VALIDATED" || requestedState === "AISC_CERTIFIED") {
    throw new Error("steel design fail closed: unvalidated method requested as certified");
  }
}

export function assertUsBendingBoundaries(): void {
  if (US_SEISMIC_BENDING_DESIGN_IMPLEMENTED) throw new Error("seismic bending design must not be implemented in US-4");
  if (US_CONNECTION_BENDING_DESIGN_IMPLEMENTED) throw new Error("connection bending design must not be implemented in US-4");
}
