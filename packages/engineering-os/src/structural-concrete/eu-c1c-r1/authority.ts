import {
  AI_CONFORMANCE_AUTHORITY,
  AI_ENGINEERING_APPROVAL,
  AI_EU_C1C_R1_ASSISTANCE_ADVISORY_ONLY,
  AI_NDP_AUTHORITY,
  AI_RULE_PARAMETER_AUTHORITY,
  AI_SOURCE_CONFLICT_AUTHORITY,
  EU_C1C_R1_DEFAULT_NDP_VALUE,
  EU_C1C_R1_GAMMA_C_VALUE_GUESSED,
  EU_C1C_R1_GAMMA_S_VALUE_GUESSED,
  LLM_EU_C1C_R1_NUMERICAL_AUTHORITY,
  LLM_MEMORY_ONLY_RULE_ALLOWED,
} from "@rtb/types";

export function assertEuC1cR1AiBoundary(): void {
  if (!AI_EU_C1C_R1_ASSISTANCE_ADVISORY_ONLY) throw new Error("R1 AI assistance must remain advisory");
  if (LLM_EU_C1C_R1_NUMERICAL_AUTHORITY || LLM_MEMORY_ONLY_RULE_ALLOWED) {
    throw new Error("LLM must not originate R1 numerical rules");
  }
  if (AI_RULE_PARAMETER_AUTHORITY || AI_SOURCE_CONFLICT_AUTHORITY || AI_NDP_AUTHORITY || AI_CONFORMANCE_AUTHORITY || AI_ENGINEERING_APPROVAL) {
    throw new Error("AI must not hold R1 parameter, conflict, NDP, conformance, or approval authority");
  }
  if (EU_C1C_R1_GAMMA_C_VALUE_GUESSED || EU_C1C_R1_GAMMA_S_VALUE_GUESSED || EU_C1C_R1_DEFAULT_NDP_VALUE) {
    throw new Error("R1 must not guess or default NDP values");
  }
}
