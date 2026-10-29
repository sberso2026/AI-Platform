import {
  AI_CONFORMANCE_AUTHORITY,
  AI_ENGINEERING_APPROVAL,
  AI_EU_C1_ASSISTANCE_ADVISORY_ONLY,
  AI_NDP_AUTHORITY,
  AI_RULE_PARAMETER_AUTHORITY,
  AI_SOURCE_CONFLICT_AUTHORITY,
  EU_C1_OPTIMIZATION_ACCEPTS_UNDETERMINED,
  EU_C1_SOURCE_CONFLICT_FAILS_CLOSED,
  GENERATIVE_MODEL_CAN_OVERRIDE_EU_C1_RULE,
  LLM_EU_C1_NUMERICAL_AUTHORITY,
  LLM_MEMORY_ONLY_RULE_ALLOWED,
} from "@rtb/types";

export function assertEuC1AiBoundary(): void {
  if (!AI_EU_C1_ASSISTANCE_ADVISORY_ONLY) throw new Error("C1 AI assistance must remain advisory");
  if (LLM_EU_C1_NUMERICAL_AUTHORITY || LLM_MEMORY_ONLY_RULE_ALLOWED) {
    throw new Error("LLM must not originate C1 numerical rules");
  }
  if (AI_RULE_PARAMETER_AUTHORITY || AI_SOURCE_CONFLICT_AUTHORITY || AI_NDP_AUTHORITY || AI_CONFORMANCE_AUTHORITY || AI_ENGINEERING_APPROVAL) {
    throw new Error("AI must not hold C1 parameter, conflict, NDP, conformance, or approval authority");
  }
  if (GENERATIVE_MODEL_CAN_OVERRIDE_EU_C1_RULE) throw new Error("generative model must not override C1 rules");
  if (EU_C1_OPTIMIZATION_ACCEPTS_UNDETERMINED) throw new Error("C1 optimization must not accept undetermined");
  if (!EU_C1_SOURCE_CONFLICT_FAILS_CLOSED) throw new Error("C1 source conflicts must fail closed");
}
