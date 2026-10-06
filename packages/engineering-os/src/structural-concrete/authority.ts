import {
  AI_CONCRETE_ASSISTANCE_ADVISORY_ONLY,
  AI_CONCRETE_CODE_CONFORMANCE_AUTHORITY,
  AI_ENGINEERING_APPROVAL,
  AUTOMATIC_CONCRETE_ENGINEERING_APPROVAL,
  CONCRETE_ENGINEERING_RULE_AUTHORITY_REUSED,
  DEFAULT_MINIMUM_CONCRETE_COVER,
  ENGINEERING_RULE_AUTHORITY_TYPES,
  FORBIDDEN_ENGINEERING_RULE_AUTHORITIES,
  GENERATIVE_MODEL_EQUALS_ENGINEERING_AUTHORITY,
  GLOBAL_CODE_STRESS_BLOCK_IMPLEMENTED,
  LLM_CONCRETE_NUMERICAL_AUTHORITY,
  LLM_MEMORY_ONLY_RULE_ALLOWED,
  NUMERICAL_CODE_CRACK_WIDTH_IMPLEMENTED,
  PARALLEL_CONCRETE_RULE_AUTHORITY_CREATED,
  type EngineeringRuleAuthorityType,
} from "@rtb/types";

export function assertConcreteEngineeringRuleAuthority(authorityType: EngineeringRuleAuthorityType): void {
  if (!CONCRETE_ENGINEERING_RULE_AUTHORITY_REUSED) throw new Error("concrete must reuse global engineering-rule authority");
  if (PARALLEL_CONCRETE_RULE_AUTHORITY_CREATED) throw new Error("parallel concrete rule authority is forbidden");
  if (LLM_MEMORY_ONLY_RULE_ALLOWED) throw new Error("LLM memory-only rules are forbidden");
  if (!(ENGINEERING_RULE_AUTHORITY_TYPES as readonly string[]).includes(authorityType)) {
    throw new Error("concrete design fail closed: ungoverned engineering-rule authority");
  }
  if ((FORBIDDEN_ENGINEERING_RULE_AUTHORITIES as readonly string[]).includes(authorityType)) {
    throw new Error("concrete design fail closed: forbidden engineering-rule authority");
  }
}

export function assertAiCannotInventConcreteStrength(): void {
  if (LLM_CONCRETE_NUMERICAL_AUTHORITY) throw new Error("AI cannot invent concrete strength");
}

export function assertAiCannotInventStressBlock(): void {
  if (GLOBAL_CODE_STRESS_BLOCK_IMPLEMENTED || LLM_CONCRETE_NUMERICAL_AUTHORITY) {
    throw new Error("AI cannot invent stress-block coefficients");
  }
}

export function assertAiCannotInventCover(): void {
  if (DEFAULT_MINIMUM_CONCRETE_COVER || LLM_CONCRETE_NUMERICAL_AUTHORITY) {
    throw new Error("AI cannot invent cover");
  }
}

export function assertAiCannotInventCrackLimit(): void {
  if (NUMERICAL_CODE_CRACK_WIDTH_IMPLEMENTED || LLM_CONCRETE_NUMERICAL_AUTHORITY) {
    throw new Error("AI cannot invent crack-width limit");
  }
}

export function assertAiCannotClaimConcreteConformance(): void {
  if (AI_CONCRETE_CODE_CONFORMANCE_AUTHORITY) throw new Error("AI cannot claim concrete code conformance");
}

export function assertAiCannotApproveConcrete(): void {
  if (!AI_CONCRETE_ASSISTANCE_ADVISORY_ONLY) throw new Error("AI concrete assistance must remain advisory");
  if (AI_ENGINEERING_APPROVAL || AUTOMATIC_CONCRETE_ENGINEERING_APPROVAL) {
    throw new Error("AI cannot approve concrete design");
  }
  if (GENERATIVE_MODEL_EQUALS_ENGINEERING_AUTHORITY) {
    throw new Error("generative model must not equal engineering authority");
  }
}
