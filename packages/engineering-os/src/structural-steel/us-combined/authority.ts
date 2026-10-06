import type { EngineeringRuleAuthorityType, UsInteractionMethodRecord } from "@rtb/types";
import {
  AI_CLASSIFICATION_AUTHORITY,
  AI_ENGINEERING_APPROVAL,
  AI_FACTOR_AUTHORITY,
  AI_INTERACTION_PARAMETER_AUTHORITY,
  AI_STANDARD_CONFORMANCE_AUTHORITY,
  AI_STABILITY_METHOD_AUTHORITY,
  AI_US_INTERACTION_ASSISTANCE_ADVISORY_ONLY,
  BIAXIAL_LINEAR_INTERACTION_ASSUMED,
  FORBIDDEN_ENGINEERING_RULE_AUTHORITIES,
  LLM_MEMORY_ONLY_RULE_ALLOWED,
  LLM_US_INTERACTION_AUTHORITY,
  MIXED_LRFD_ASD_COMPONENTS_ALLOWED,
  UNIVERSAL_AXIAL_BIAXIAL_EQUATION,
  UNIVERSAL_INTERACTION_EQUATION,
  UNIVERSAL_US_INTERACTION_EQUATION,
  UNKNOWN_US_INTERACTION_PARAMETER_GUESSED,
  UNKNOWN_US_INTERACTION_RELATIONSHIP_GUESSED,
  US_BENDING_SHEAR_REDUCTION_RULE_GUESSED,
  US_INTERACTION_CLASSIFICATION_GUESSED,
  US_INTERACTION_MOMENT_AMPLIFICATION_GUESSED,
  US_INTERACTION_PARAMETER_GUESSED,
  US_SHEAR_REDUCTION_RULE_GUESSED,
  US_STEEL_PACK_CERTIFIED,
  US_SYNTHETIC_INTERACTION_UTILIZATION,
} from "@rtb/types";

export function assertUsInteractionRuleAuthority(authorityType: string): asserts authorityType is EngineeringRuleAuthorityType {
  if (!AI_US_INTERACTION_ASSISTANCE_ADVISORY_ONLY) throw new Error("AI US interaction assistance must remain advisory");
  if (LLM_MEMORY_ONLY_RULE_ALLOWED) throw new Error("LLM memory must not be an allowed engineering-rule authority");
  if (LLM_US_INTERACTION_AUTHORITY) throw new Error("AI cannot invent interaction equation");
  if (AI_STANDARD_CONFORMANCE_AUTHORITY) throw new Error("AI cannot certify standard conformance");
  if (AI_INTERACTION_PARAMETER_AUTHORITY || US_INTERACTION_PARAMETER_GUESSED) {
    throw new Error("AI must not have interaction-parameter authority");
  }
  if (AI_STABILITY_METHOD_AUTHORITY) throw new Error("AI cannot choose a stability method");
  if (AI_CLASSIFICATION_AUTHORITY) throw new Error("AI cannot invent classification");
  if (AI_FACTOR_AUTHORITY) throw new Error("AI cannot invent an AISC factor");
  if (AI_ENGINEERING_APPROVAL) throw new Error("AI must not approve engineering");
  if ((FORBIDDEN_ENGINEERING_RULE_AUTHORITIES as readonly string[]).includes(authorityType)) {
    throw new Error(`steel design fail closed: ${authorityType} is not an allowed engineering-rule authority`);
  }
}

export function rejectUnknownUsInteractionParameter(name: string): never {
  if (
    UNKNOWN_US_INTERACTION_PARAMETER_GUESSED
    || US_INTERACTION_PARAMETER_GUESSED
    || US_INTERACTION_CLASSIFICATION_GUESSED
    || US_INTERACTION_MOMENT_AMPLIFICATION_GUESSED
    || US_BENDING_SHEAR_REDUCTION_RULE_GUESSED
    || US_SHEAR_REDUCTION_RULE_GUESSED
    || UNIVERSAL_US_INTERACTION_EQUATION
    || UNIVERSAL_INTERACTION_EQUATION
    || UNIVERSAL_AXIAL_BIAXIAL_EQUATION
    || UNKNOWN_US_INTERACTION_RELATIONSHIP_GUESSED
    || BIAXIAL_LINEAR_INTERACTION_ASSUMED
    || US_SYNTHETIC_INTERACTION_UTILIZATION
  ) {
    throw new Error("unknown US interaction parameters must not be guessed");
  }
  throw new Error(`steel design fail closed: unknown required code parameter ${name}`);
}

export function assertUsNoUniversalInteractionEquation(): void {
  if (UNIVERSAL_US_INTERACTION_EQUATION || UNIVERSAL_INTERACTION_EQUATION || UNIVERSAL_AXIAL_BIAXIAL_EQUATION || UNKNOWN_US_INTERACTION_RELATIONSHIP_GUESSED) {
    throw new Error("universal interaction equation is forbidden");
  }
}

export function assertUsInteractionApplicability(rule: UsInteractionMethodRecord): void {
  if (!rule.applicability?.trim()) throw new Error("steel design fail closed: interaction-rule applicability is missing");
  if (!rule.interactionType) throw new Error("steel design fail closed: interaction type is missing");
  if (!rule.aiscEditionRequirement?.trim()) throw new Error("steel design fail closed: AISC edition requirement is missing");
  if (!rule.designMethodApplicability) throw new Error("steel design fail closed: DESIGN_METHOD_REQUIRED");
}

export function assertUsMixedLrfdAsdComponents(
  designMethod: "LRFD" | "ASD",
  capacities: readonly { designMethod?: "LRFD" | "ASD" }[],
): void {
  if (MIXED_LRFD_ASD_COMPONENTS_ALLOWED) {
    throw new Error("mixed LRFD/ASD components must not be allowed");
  }
  const methods = new Set(capacities.map((row) => row.designMethod).filter((value): value is "LRFD" | "ASD" => value === "LRFD" || value === "ASD"));
  if (methods.has("LRFD") && methods.has("ASD")) {
    throw new Error("steel design fail closed: mixed LRFD/ASD components");
  }
  for (const row of capacities) {
    if (row.designMethod && row.designMethod !== designMethod) {
      throw new Error("steel design fail closed: mixed LRFD/ASD components");
    }
  }
}

export function assertUsInteractionLrfdAsdRuleIsolation(designMethod: "LRFD" | "ASD", factorKind: "phi" | "Omega"): void {
  if (designMethod === "LRFD" && factorKind === "Omega") {
    throw new Error("steel design fail closed: ASD interaction factor cannot be used in LRFD");
  }
  if (designMethod === "ASD" && factorKind === "phi") {
    throw new Error("steel design fail closed: LRFD interaction factor cannot be used in ASD");
  }
}

export function assertUsMechanicsNotPromotedToAiscInteraction(
  capacities: readonly { resultClass?: string; authorityState?: string }[],
): void {
  for (const row of capacities) {
    if (row.authorityState === "MECHANICS_REFERENCE" && row.resultClass === "DESIGN_CAPACITY") {
      throw new Error("mechanics-reference capacity must not be treated as AISC interaction resistance");
    }
  }
}

export function denyAiUsInteractionEquation(): never {
  if (LLM_US_INTERACTION_AUTHORITY) throw new Error("AI cannot invent interaction equation");
  throw new Error("AI_AUTHORITY_DENIED: AI cannot invent an interaction equation");
}

export function denyAiUsInteractionCoefficient(): never {
  if (AI_INTERACTION_PARAMETER_AUTHORITY || US_INTERACTION_PARAMETER_GUESSED) {
    throw new Error("AI must not have interaction-parameter authority");
  }
  throw new Error("AI_AUTHORITY_DENIED: AI cannot invent an interaction coefficient");
}

export function denyAiUsMomentAmplification(): never {
  if (US_INTERACTION_MOMENT_AMPLIFICATION_GUESSED) throw new Error("moment amplification must not be guessed");
  throw new Error("AI_AUTHORITY_DENIED: AI cannot amplify moment");
}

export function denyAiUsInteractionStabilityChoice(): never {
  if (AI_STABILITY_METHOD_AUTHORITY) throw new Error("AI cannot choose a stability method");
  throw new Error("AI_AUTHORITY_DENIED: AI cannot choose a stability method");
}

export function denyAiUsClassification(): never {
  if (AI_CLASSIFICATION_AUTHORITY || US_INTERACTION_CLASSIFICATION_GUESSED) {
    throw new Error("AI cannot invent classification");
  }
  throw new Error("AI_AUTHORITY_DENIED: AI cannot invent classification");
}

export function denyAiUsInteractionFactor(): never {
  if (AI_FACTOR_AUTHORITY) throw new Error("AI cannot invent an AISC factor");
  throw new Error("AI_AUTHORITY_DENIED: AI cannot invent an AISC interaction factor");
}

export function denyAiUsInteractionResult(): never {
  if (LLM_US_INTERACTION_AUTHORITY) throw new Error("AI cannot originate AISC interaction result");
  throw new Error("AI_AUTHORITY_DENIED: AI cannot originate AISC interaction result");
}

export function denyAiUsMixedCombinations(): never {
  throw new Error("AI_AUTHORITY_DENIED: AI cannot mix load combinations");
}

export function denyAiUsMixedDesignMethods(): never {
  throw new Error("AI_AUTHORITY_DENIED: AI cannot mix design methods");
}

export function requestUsInteractionEquation(): never {
  return rejectUnknownUsInteractionParameter("aiscInteractionEquation");
}

export function requestUsBiaxialLinearInteraction(): never {
  if (BIAXIAL_LINEAR_INTERACTION_ASSUMED) throw new Error("biaxial linear interaction must not be assumed");
  return rejectUnknownUsInteractionParameter("biaxialLinearInteraction");
}

export function requestUsShearReduction(): never {
  if (US_BENDING_SHEAR_REDUCTION_RULE_GUESSED || US_SHEAR_REDUCTION_RULE_GUESSED) {
    throw new Error("shear reduction rule must not be guessed");
  }
  return rejectUnknownUsInteractionParameter("bendingShearReduction");
}

export function requestUsMomentAmplification(): never {
  if (US_INTERACTION_MOMENT_AMPLIFICATION_GUESSED) throw new Error("moment amplification must not be guessed");
  return rejectUnknownUsInteractionParameter("momentAmplification");
}

export function requestUsInteractionClassification(): never {
  if (US_INTERACTION_CLASSIFICATION_GUESSED) throw new Error("section classification must not be guessed");
  return rejectUnknownUsInteractionParameter("elementClassification");
}

export function requestUsInteractionParameter(): never {
  if (US_INTERACTION_PARAMETER_GUESSED) throw new Error("interaction parameter must not be guessed");
  return rejectUnknownUsInteractionParameter("interactionCoefficient");
}

export function requestUsInteractionLrfdFactor(): never {
  return rejectUnknownUsInteractionParameter("phi");
}

export function requestUsInteractionAsdFactor(): never {
  return rejectUnknownUsInteractionParameter("Omega");
}

export function requestUsTorsionalInteraction(): never {
  return rejectUnknownUsInteractionParameter("torsionalInteraction");
}

export function requestUsConnectionInteraction(): never {
  return rejectUnknownUsInteractionParameter("connectionInteraction");
}

export function requestUsSeismicInteraction(): never {
  return rejectUnknownUsInteractionParameter("seismicInteraction");
}

export function assertNotCertifiedUsInteraction(requestedState: string | null | undefined): void {
  if (US_STEEL_PACK_CERTIFIED) throw new Error("US steel pack is not certified in US-6");
  if (requestedState === "CERTIFIED" || requestedState === "CONFORMANCE_VALIDATED" || requestedState === "AISC_CERTIFIED") {
    throw new Error("steel design fail closed: unvalidated method requested as certified");
  }
}
