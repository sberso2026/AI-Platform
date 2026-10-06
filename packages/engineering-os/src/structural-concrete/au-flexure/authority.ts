import {
  AI_AS3600_CONFORMANCE_AUTHORITY,
  AI_AU_CONCRETE_ASSISTANCE_ADVISORY_ONLY,
  AI_ENGINEERING_APPROVAL,
  AI_STRESS_BLOCK_AUTHORITY,
  AI_STRENGTH_FACTOR_AUTHORITY,
  AUTOMATIC_AU_CONCRETE_APPROVAL,
  AU_FLEXURE_CHECK_EQUALS_ENGINEERING_APPROVAL,
  AU_FLEXURE_STRENGTH_FACTOR_GUESSED,
  AU_STRESS_BLOCK_PARAMETER_GUESSED,
  AU_ULTIMATE_CONCRETE_STRAIN_GUESSED,
  LLM_AU_CONCRETE_NUMERICAL_AUTHORITY,
  LLM_MEMORY_ONLY_RULE_ALLOWED,
  type EngineeringRuleAuthorityType,
} from "@rtb/types";
import { assertConcreteEngineeringRuleAuthority } from "../authority";

export function assertAuFlexureRuleAuthority(authorityType: EngineeringRuleAuthorityType): void {
  if (LLM_MEMORY_ONLY_RULE_ALLOWED) throw new Error("LLM memory-only rules are forbidden");
  assertConcreteEngineeringRuleAuthority(authorityType);
}

export function assertAuFlexureAiBoundary(): void {
  if (!AI_AU_CONCRETE_ASSISTANCE_ADVISORY_ONLY) throw new Error("AI AU concrete assistance must remain advisory");
  if (LLM_AU_CONCRETE_NUMERICAL_AUTHORITY) throw new Error("LLM has no AU concrete numerical authority");
  if (AI_STRESS_BLOCK_AUTHORITY || AU_STRESS_BLOCK_PARAMETER_GUESSED) throw new Error("AI cannot invent stress-block parameters");
  if (AI_STRENGTH_FACTOR_AUTHORITY || AU_FLEXURE_STRENGTH_FACTOR_GUESSED) throw new Error("AI cannot invent phi/design factor");
  if (AU_ULTIMATE_CONCRETE_STRAIN_GUESSED) throw new Error("AI cannot invent ultimate strain");
  if (AI_AS3600_CONFORMANCE_AUTHORITY) throw new Error("AI cannot claim AS 3600 conformance");
  if (AI_ENGINEERING_APPROVAL || AUTOMATIC_AU_CONCRETE_APPROVAL || AU_FLEXURE_CHECK_EQUALS_ENGINEERING_APPROVAL) {
    throw new Error("AI cannot approve AU concrete design");
  }
}

export function assertCodeParameterNotGuessed(value: number | null | undefined, label: string): void {
  if (value != null) throw new Error(`AU concrete flexure fail closed: ${label} must not be guessed`);
}
