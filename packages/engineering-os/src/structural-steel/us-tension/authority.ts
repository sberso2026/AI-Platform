import type { EngineeringRuleAuthorityType, UsTensionMethodRecord } from "@rtb/types";
import {
  AI_ENGINEERING_APPROVAL,
  AI_FACTOR_AUTHORITY,
  AI_LRFD_ASD_AUTHORITY,
  AI_NET_AREA_AUTHORITY,
  AI_STANDARD_CONFORMANCE_AUTHORITY,
  AI_US_TENSION_ASSISTANCE_ADVISORY_ONLY,
  FORBIDDEN_ENGINEERING_RULE_AUTHORITIES,
  GENERIC_MECHANICS_EQUALS_AISC_DESIGN_STRENGTH,
  LLM_MEMORY_ONLY_RULE_ALLOWED,
  LLM_US_TENSION_STRENGTH_AUTHORITY,
  UNKNOWN_US_TENSION_CODE_PARAMETER_GUESSED,
  US_ASD_FACTOR_GUESSED,
  US_BLOCK_SHEAR_IMPLEMENTED,
  US_CONNECTION_TENSION_DESIGN_IMPLEMENTED,
  US_FATIGUE_TENSION_DESIGN_IMPLEMENTED,
  US_HOLE_DEDUCTION_GUESSED,
  US_LRFD_RESISTANCE_FACTOR_GUESSED,
  US_SEISMIC_TENSION_DESIGN_IMPLEMENTED,
  US_SHEAR_LAG_FACTOR_GUESSED,
  US_STEEL_PACK_CERTIFIED,
} from "@rtb/types";

export function assertUsTensionRuleAuthority(authorityType: string): asserts authorityType is EngineeringRuleAuthorityType {
  if (!AI_US_TENSION_ASSISTANCE_ADVISORY_ONLY) throw new Error("AI US tension assistance must remain advisory");
  if (LLM_MEMORY_ONLY_RULE_ALLOWED) throw new Error("LLM memory must not be an allowed engineering-rule authority");
  if (LLM_US_TENSION_STRENGTH_AUTHORITY) throw new Error("AI cannot originate US tension strength");
  if (AI_STANDARD_CONFORMANCE_AUTHORITY) throw new Error("AI cannot certify standard conformance");
  if (AI_LRFD_ASD_AUTHORITY) throw new Error("AI cannot choose LRFD or ASD");
  if (AI_FACTOR_AUTHORITY) throw new Error("AI cannot invent an AISC factor");
  if (AI_NET_AREA_AUTHORITY) throw new Error("AI cannot invent net area");
  if (AI_ENGINEERING_APPROVAL) throw new Error("AI must not approve engineering");
  if ((FORBIDDEN_ENGINEERING_RULE_AUTHORITIES as readonly string[]).includes(authorityType)) {
    throw new Error(`steel design fail closed: ${authorityType} is not an allowed engineering-rule authority`);
  }
}

export function assertMechanicsNotAiscDesignStrength(rule: UsTensionMethodRecord): void {
  if (GENERIC_MECHANICS_EQUALS_AISC_DESIGN_STRENGTH) {
    throw new Error("generic mechanics must not be labelled AISC design strength");
  }
  if (rule.methodType === "ENGINEERING_MECHANICS_REFERENCE" && (rule.outputType.includes("AISC_LRFD") || rule.outputType.includes("AISC_ASD"))) {
    throw new Error("generic mechanics must not be labelled AISC design strength");
  }
}

export function rejectUnknownUsCodeParameter(name: string): never {
  if (UNKNOWN_US_TENSION_CODE_PARAMETER_GUESSED) throw new Error("unknown US tension code parameters must not be guessed");
  throw new Error(`steel design fail closed: unknown required code parameter ${name}`);
}

export function denyAiUsFactor(): never {
  if (AI_FACTOR_AUTHORITY || US_LRFD_RESISTANCE_FACTOR_GUESSED || US_ASD_FACTOR_GUESSED) {
    throw new Error("AI cannot invent an AISC factor");
  }
  throw new Error("AI_AUTHORITY_DENIED: AI cannot invent an AISC factor");
}

export function denyAiUsNetArea(): never {
  if (AI_NET_AREA_AUTHORITY) throw new Error("AI cannot invent net area");
  throw new Error("AI_AUTHORITY_DENIED: AI cannot invent net area");
}

export function denyAiUsShearLag(): never {
  if (US_SHEAR_LAG_FACTOR_GUESSED || AI_FACTOR_AUTHORITY) throw new Error("AI cannot invent a shear-lag factor");
  throw new Error("AI_AUTHORITY_DENIED: AI cannot invent a shear-lag factor");
}

export function denyAiUsCodeStrength(): never {
  if (LLM_US_TENSION_STRENGTH_AUTHORITY) throw new Error("AI cannot originate US tension strength");
  throw new Error("AI_AUTHORITY_DENIED: AI cannot originate AISC code strength");
}

export function requestUsLrfdResistanceFactor(): never {
  if (US_LRFD_RESISTANCE_FACTOR_GUESSED) throw new Error("LRFD resistance factor must not be guessed");
  return rejectUnknownUsCodeParameter("phi");
}

export function requestUsAsdFactor(): never {
  if (US_ASD_FACTOR_GUESSED) throw new Error("ASD factor must not be guessed");
  return rejectUnknownUsCodeParameter("Omega");
}

export function requestUsShearLagFactor(): never {
  if (US_SHEAR_LAG_FACTOR_GUESSED) throw new Error("shear-lag factor must not be guessed");
  return rejectUnknownUsCodeParameter("shear-lag-U");
}

export function requestUsHoleDeduction(): never {
  if (US_HOLE_DEDUCTION_GUESSED) throw new Error("hole deduction must not be guessed");
  return rejectUnknownUsCodeParameter("hole-deduction");
}

export function assertLrfdAsdFactorIsolation(designMethod: "LRFD" | "ASD", factorKind: "phi" | "Omega"): void {
  if (designMethod === "LRFD" && factorKind === "Omega") {
    throw new Error("steel design fail closed: ASD factor cannot be used in LRFD");
  }
  if (designMethod === "ASD" && factorKind === "phi") {
    throw new Error("steel design fail closed: LRFD factor cannot be used in ASD");
  }
}

export function assertNotCertifiedUsTension(requestedState: string | null | undefined): void {
  if (US_STEEL_PACK_CERTIFIED) throw new Error("US steel pack is not certified in US-2");
  if (requestedState === "CERTIFIED" || requestedState === "CONFORMANCE_VALIDATED" || requestedState === "AISC_CERTIFIED") {
    throw new Error("steel design fail closed: unvalidated method requested as certified");
  }
}

export function assertUsTensionBoundaries(): void {
  if (US_BLOCK_SHEAR_IMPLEMENTED) throw new Error("block shear must not be implemented in US-2");
  if (US_CONNECTION_TENSION_DESIGN_IMPLEMENTED) throw new Error("connection tension design must not be implemented in US-2");
  if (US_SEISMIC_TENSION_DESIGN_IMPLEMENTED) throw new Error("seismic tension design must not be implemented in US-2");
  if (US_FATIGUE_TENSION_DESIGN_IMPLEMENTED) throw new Error("fatigue tension design must not be implemented in US-2");
}
