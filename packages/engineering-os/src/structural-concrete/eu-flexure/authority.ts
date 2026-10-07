import {
  AI_EN1992_CONFORMANCE_AUTHORITY,
  AI_ENGINEERING_APPROVAL,
  AI_EU_CONCRETE_ASSISTANCE_ADVISORY_ONLY,
  AI_EU_CONCRETE_NATIONAL_ANNEX_AUTHORITY,
  AI_EU_CONCRETE_NDP_AUTHORITY,
  AI_EU_STRESS_BLOCK_AUTHORITY,
  AI_PARTIAL_FACTOR_AUTHORITY,
  AUTOMATIC_EU_CONCRETE_APPROVAL,
  EU_CONCRETE_COMPRESSION_PARAMETER_GUESSED,
  EU_CONCRETE_ULTIMATE_STRAIN_GUESSED,
  EU_FLEXURE_CHECK_EQUALS_ENGINEERING_APPROVAL,
  EU_FLEXURE_NDP_VALUE_GUESSED,
  EU_FLEXURE_PARTIAL_FACTOR_GUESSED,
  EU_REINFORCEMENT_STRAIN_LIMIT_GUESSED,
  EU_STRESS_BLOCK_PARAMETER_GUESSED,
  GENERATIVE_OPTIMIZER_CAN_CHANGE_EU_STANDARD_CONTEXT,
  LLM_EU_CONCRETE_NUMERICAL_AUTHORITY,
  LLM_MEMORY_ONLY_RULE_ALLOWED,
  type EngineeringRuleAuthorityType,
} from "@rtb/types";
import { assertConcreteEngineeringRuleAuthority } from "../authority";
import { assertAiEuConcreteAssistanceAdvisoryOnly } from "../eu-standard/authority";

export function assertEuFlexureRuleAuthority(authorityType: EngineeringRuleAuthorityType): void {
  if (LLM_MEMORY_ONLY_RULE_ALLOWED) throw new Error("LLM memory-only rules are forbidden");
  assertConcreteEngineeringRuleAuthority(authorityType);
}

export function assertEuFlexureAiBoundary(): void {
  assertAiEuConcreteAssistanceAdvisoryOnly();
  if (LLM_EU_CONCRETE_NUMERICAL_AUTHORITY) throw new Error("LLM has no EU concrete numerical authority");
  if (AI_EU_STRESS_BLOCK_AUTHORITY || EU_STRESS_BLOCK_PARAMETER_GUESSED || EU_CONCRETE_COMPRESSION_PARAMETER_GUESSED) {
    throw new Error("AI cannot invent stress-block parameters");
  }
  if (AI_PARTIAL_FACTOR_AUTHORITY || EU_FLEXURE_PARTIAL_FACTOR_GUESSED) throw new Error("AI cannot invent partial factor");
  if (EU_CONCRETE_ULTIMATE_STRAIN_GUESSED || EU_REINFORCEMENT_STRAIN_LIMIT_GUESSED) throw new Error("AI cannot invent strain limits");
  if (EU_FLEXURE_NDP_VALUE_GUESSED || AI_EU_CONCRETE_NDP_AUTHORITY) throw new Error("AI cannot invent NDP");
  if (AI_EU_CONCRETE_NATIONAL_ANNEX_AUTHORITY) throw new Error("AI cannot select National Annex");
  if (AI_EN1992_CONFORMANCE_AUTHORITY) throw new Error("AI cannot claim EN 1992 conformance");
  if (AI_ENGINEERING_APPROVAL || AUTOMATIC_EU_CONCRETE_APPROVAL || EU_FLEXURE_CHECK_EQUALS_ENGINEERING_APPROVAL) {
    throw new Error("AI cannot approve EU concrete design");
  }
  if (!AI_EU_CONCRETE_ASSISTANCE_ADVISORY_ONLY) throw new Error("AI EU concrete assistance must remain advisory");
}

export function assertCodeParameterNotGuessed(value: number | null | undefined, label: string): void {
  if (value != null) throw new Error(`EU concrete flexure fail closed: ${label} must not be guessed`);
}

export function assertGenerativeCannotChangeStandardContext(attempted: boolean): void {
  if (GENERATIVE_OPTIMIZER_CAN_CHANGE_EU_STANDARD_CONTEXT || attempted) {
    throw new Error("generative optimizer cannot alter EU standard context");
  }
}
