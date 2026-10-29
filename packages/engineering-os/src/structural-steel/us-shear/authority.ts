import type { EngineeringRuleAuthorityType, UsShearMethodRecord } from "@rtb/types";
import {
  AI_BUCKLING_PARAMETER_AUTHORITY,
  AI_ENGINEERING_APPROVAL,
  AI_FACTOR_AUTHORITY,
  AI_SHEAR_AREA_AUTHORITY,
  AI_STANDARD_CONFORMANCE_AUTHORITY,
  AI_STIFFENER_AUTHORITY,
  AI_US_SHEAR_ASSISTANCE_ADVISORY_ONLY,
  AI_WEB_SLENDERNESS_AUTHORITY,
  ELASTIC_SHEAR_BUCKLING_EQUALS_AISC_WEB_STRENGTH,
  ELASTIC_SHEAR_EQUALS_AISC_SHEAR_STRENGTH,
  FORBIDDEN_ENGINEERING_RULE_AUTHORITIES,
  LLM_MEMORY_ONLY_RULE_ALLOWED,
  LLM_US_SHEAR_STRENGTH_AUTHORITY,
  UNKNOWN_US_SHEAR_CODE_PARAMETER_GUESSED,
  US_SHEAR_AREA_RULE_GUESSED,
  US_SHEAR_ASD_FACTOR_GUESSED,
  US_SHEAR_BUCKLING_COEFFICIENT_GUESSED,
  US_SHEAR_LRFD_FACTOR_GUESSED,
  US_STEEL_PACK_CERTIFIED,
  US_TENSION_FIELD_ELIGIBILITY_GUESSED,
  US_WEB_SLENDERNESS_LIMIT_GUESSED,
  US_WEB_STABILITY_RULE_GUESSED,
} from "@rtb/types";

export function assertUsShearRuleAuthority(authorityType: string): asserts authorityType is EngineeringRuleAuthorityType {
  if (!AI_US_SHEAR_ASSISTANCE_ADVISORY_ONLY) throw new Error("AI US shear assistance must remain advisory");
  if (LLM_MEMORY_ONLY_RULE_ALLOWED) throw new Error("LLM memory must not be an allowed engineering-rule authority");
  if (LLM_US_SHEAR_STRENGTH_AUTHORITY) throw new Error("AI cannot originate US shear strength");
  if (AI_STANDARD_CONFORMANCE_AUTHORITY) throw new Error("AI cannot certify standard conformance");
  if (AI_FACTOR_AUTHORITY) throw new Error("AI cannot invent an AISC factor");
  if (AI_SHEAR_AREA_AUTHORITY) throw new Error("AI cannot invent a shear area");
  if (AI_WEB_SLENDERNESS_AUTHORITY) throw new Error("AI cannot invent web slenderness");
  if (AI_STIFFENER_AUTHORITY) throw new Error("AI cannot invent stiffener state");
  if (AI_BUCKLING_PARAMETER_AUTHORITY) throw new Error("AI cannot invent a buckling coefficient");
  if (AI_ENGINEERING_APPROVAL) throw new Error("AI must not approve engineering");
  if ((FORBIDDEN_ENGINEERING_RULE_AUTHORITIES as readonly string[]).includes(authorityType)) {
    throw new Error(`steel design fail closed: ${authorityType} is not an allowed engineering-rule authority`);
  }
}

export function assertMechanicsNotAiscShearStrength(rule: UsShearMethodRecord): void {
  if (ELASTIC_SHEAR_EQUALS_AISC_SHEAR_STRENGTH || ELASTIC_SHEAR_BUCKLING_EQUALS_AISC_WEB_STRENGTH) {
    throw new Error("elastic shear mechanics must not be labelled AISC shear strength");
  }
  if (
    (rule.methodType === "ENGINEERING_MECHANICS_REFERENCE" || rule.methodType === "ELASTIC_SHEAR_REFERENCE" || rule.methodType === "ELASTIC_SHEAR_BUCKLING_REFERENCE")
    && (rule.outputType.includes("AISC_LRFD") || rule.outputType.includes("AISC_ASD") || rule.outputType.includes("AISC_NOMINAL"))
  ) {
    throw new Error("generic mechanics must not be labelled AISC shear strength");
  }
}

export function rejectUnknownUsShearCodeParameter(name: string): never {
  if (
    UNKNOWN_US_SHEAR_CODE_PARAMETER_GUESSED
    || US_SHEAR_AREA_RULE_GUESSED
    || US_WEB_SLENDERNESS_LIMIT_GUESSED
    || US_SHEAR_BUCKLING_COEFFICIENT_GUESSED
    || US_WEB_STABILITY_RULE_GUESSED
    || US_TENSION_FIELD_ELIGIBILITY_GUESSED
    || US_SHEAR_LRFD_FACTOR_GUESSED
    || US_SHEAR_ASD_FACTOR_GUESSED
  ) {
    throw new Error("unknown US shear code parameters must not be guessed");
  }
  throw new Error(`steel design fail closed: unknown required code parameter ${name}`);
}

export function denyAiUsShearArea(): never {
  if (AI_SHEAR_AREA_AUTHORITY) throw new Error("AI cannot invent a shear area");
  throw new Error("AI_AUTHORITY_DENIED: AI cannot invent a shear area");
}

export function denyAiUsWebSlenderness(): never {
  if (AI_WEB_SLENDERNESS_AUTHORITY || US_WEB_SLENDERNESS_LIMIT_GUESSED) {
    throw new Error("AI cannot invent web slenderness");
  }
  throw new Error("AI_AUTHORITY_DENIED: AI cannot invent web slenderness");
}

export function denyAiUsStiffener(): never {
  if (AI_STIFFENER_AUTHORITY) throw new Error("AI cannot invent stiffener state");
  throw new Error("AI_AUTHORITY_DENIED: AI cannot invent stiffener state");
}

export function denyAiUsBucklingCoefficient(): never {
  if (AI_BUCKLING_PARAMETER_AUTHORITY || US_SHEAR_BUCKLING_COEFFICIENT_GUESSED) {
    throw new Error("AI cannot invent a buckling coefficient");
  }
  throw new Error("AI_AUTHORITY_DENIED: AI cannot invent a buckling coefficient");
}

export function denyAiUsTensionFieldEligibility(): never {
  if (US_TENSION_FIELD_ELIGIBILITY_GUESSED) throw new Error("tension-field eligibility must not be guessed");
  throw new Error("AI_AUTHORITY_DENIED: AI cannot invent tension-field eligibility");
}

export function denyAiUsShearFactor(): never {
  if (AI_FACTOR_AUTHORITY || US_SHEAR_LRFD_FACTOR_GUESSED || US_SHEAR_ASD_FACTOR_GUESSED) {
    throw new Error("AI cannot invent an AISC factor");
  }
  throw new Error("AI_AUTHORITY_DENIED: AI cannot invent an AISC shear factor");
}

export function denyAiUsShearStrength(): never {
  if (LLM_US_SHEAR_STRENGTH_AUTHORITY) throw new Error("AI cannot originate US shear strength");
  throw new Error("AI_AUTHORITY_DENIED: AI cannot originate AISC shear strength");
}

export function requestUsShearLrfdFactor(): never {
  if (US_SHEAR_LRFD_FACTOR_GUESSED) throw new Error("LRFD resistance factor must not be guessed");
  return rejectUnknownUsShearCodeParameter("phi_v");
}

export function requestUsShearAsdFactor(): never {
  if (US_SHEAR_ASD_FACTOR_GUESSED) throw new Error("ASD allowable-strength factor must not be guessed");
  return rejectUnknownUsShearCodeParameter("Omega_v");
}

export function requestUsShearBucklingCoefficient(): never {
  if (US_SHEAR_BUCKLING_COEFFICIENT_GUESSED) throw new Error("shear buckling coefficient must not be guessed");
  return rejectUnknownUsShearCodeParameter("shearBucklingCoefficient");
}

export function requestUsWebStabilityRule(): never {
  if (US_WEB_STABILITY_RULE_GUESSED) throw new Error("AISC web-stability rule must not be guessed");
  return rejectUnknownUsShearCodeParameter("webStabilityRule");
}

export function requestUsSectionShearStrength(): never {
  return rejectUnknownUsShearCodeParameter("sectionShearStrength");
}

export function requestUsShearAreaRule(): never {
  if (US_SHEAR_AREA_RULE_GUESSED) throw new Error("AISC shear-area rule must not be guessed");
  return rejectUnknownUsShearCodeParameter("shearAreaFromGrossOrWeb");
}

export function requestUsTensionFieldAction(): never {
  if (US_TENSION_FIELD_ELIGIBILITY_GUESSED) throw new Error("tension-field eligibility must not be guessed");
  return rejectUnknownUsShearCodeParameter("tensionFieldAction");
}

export function assertUsShearLrfdAsdFactorIsolation(designMethod: "LRFD" | "ASD", factorKind: "phi_v" | "Omega_v"): void {
  if (designMethod === "LRFD" && factorKind === "Omega_v") {
    throw new Error("steel design fail closed: ASD factor cannot be used in LRFD");
  }
  if (designMethod === "ASD" && factorKind === "phi_v") {
    throw new Error("steel design fail closed: LRFD factor cannot be used in ASD");
  }
}

export function assertUsMixedAuthorityShearComparison(
  left: "MECHANICS_REFERENCE" | "ELASTIC_SHEAR_BUCKLING_REFERENCE" | "AISC_NOMINAL_SHEAR_STRENGTH" | "AISC_LRFD_DESIGN_STRENGTH" | "AISC_ASD_ALLOWABLE_STRENGTH",
  right: "MECHANICS_REFERENCE" | "ELASTIC_SHEAR_BUCKLING_REFERENCE" | "AISC_NOMINAL_SHEAR_STRENGTH" | "AISC_LRFD_DESIGN_STRENGTH" | "AISC_ASD_ALLOWABLE_STRENGTH",
): void {
  const mechanics = left === "MECHANICS_REFERENCE" || left === "ELASTIC_SHEAR_BUCKLING_REFERENCE";
  const code = right === "AISC_NOMINAL_SHEAR_STRENGTH" || right === "AISC_LRFD_DESIGN_STRENGTH" || right === "AISC_ASD_ALLOWABLE_STRENGTH";
  if (mechanics && code) {
    throw new Error("mixed authority results must not be compared as equivalent");
  }
  if (left !== right && !(mechanics && (right === "MECHANICS_REFERENCE" || right === "ELASTIC_SHEAR_BUCKLING_REFERENCE"))) {
    throw new Error("mixed authority results must not be compared as equivalent");
  }
}

export function assertNotCertifiedUsShear(requestedState: string | null | undefined): void {
  if (US_STEEL_PACK_CERTIFIED) throw new Error("US steel pack is not certified in US-5");
  if (requestedState === "CERTIFIED" || requestedState === "CONFORMANCE_VALIDATED" || requestedState === "AISC_CERTIFIED") {
    throw new Error("steel design fail closed: unvalidated method requested as certified");
  }
}

export function assertUsShearBoundaries(): void {
  if (US_TENSION_FIELD_ELIGIBILITY_GUESSED) throw new Error("tension-field eligibility must not be guessed");
}
