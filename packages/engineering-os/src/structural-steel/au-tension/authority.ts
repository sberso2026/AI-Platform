import type { EngineeringRuleAuthorityType } from "@rtb/types";
import {
  AI_STANDARD_CONFORMANCE_AUTHORITY,
  FORBIDDEN_ENGINEERING_RULE_AUTHORITIES,
  LLM_MEMORY_ONLY_RULE_ALLOWED,
  LLM_STEEL_CAPACITY_AUTHORITY,
  UNKNOWN_CODE_PARAMETER_GUESSED,
} from "@rtb/types";

export function assertEngineeringRuleAuthority(authorityType: string): asserts authorityType is EngineeringRuleAuthorityType {
  if (LLM_MEMORY_ONLY_RULE_ALLOWED) throw new Error("LLM memory must not be an allowed engineering-rule authority");
  if (LLM_STEEL_CAPACITY_AUTHORITY) throw new Error("AI cannot originate capacity");
  if (AI_STANDARD_CONFORMANCE_AUTHORITY) throw new Error("AI cannot certify standard conformance");
  if ((FORBIDDEN_ENGINEERING_RULE_AUTHORITIES as readonly string[]).includes(authorityType)) {
    throw new Error(`steel design fail closed: ${authorityType} is not an allowed engineering-rule authority`);
  }
  if (authorityType === "LLM_MEMORY_ONLY") {
    throw new Error("steel design fail closed: LLM_MEMORY_ONLY authority rejected");
  }
}

export function assertUnknownCodeParameterNotGuessed(): void {
  if (UNKNOWN_CODE_PARAMETER_GUESSED) throw new Error("unknown code parameters must not be guessed");
}

export function rejectUnknownCodeParameter(name: string): never {
  assertUnknownCodeParameterNotGuessed();
  throw new Error(`steel design fail closed: unknown required code parameter ${name}`);
}
