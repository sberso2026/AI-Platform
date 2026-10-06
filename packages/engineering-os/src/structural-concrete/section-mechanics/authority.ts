import {
  AI_CAN_OVERRIDE_DETERMINISTIC_SECTION_KERNEL,
  AI_ENGINEERING_APPROVAL,
  AI_RC_SECTION_ASSISTANCE_ADVISORY_ONLY,
  AUTOMATIC_RC_ENGINEERING_APPROVAL,
  LLM_RC_SECTION_NUMERICAL_AUTHORITY,
  RC_SECTION_MECHANICS_EQUALS_ENGINEERING_APPROVAL,
} from "@rtb/types";

export function assertAiCannotOverrideSectionKernel(): void {
  if (!AI_RC_SECTION_ASSISTANCE_ADVISORY_ONLY) throw new Error("AI RC section assistance must remain advisory");
  if (LLM_RC_SECTION_NUMERICAL_AUTHORITY) throw new Error("LLM has no RC section numerical authority");
  if (AI_CAN_OVERRIDE_DETERMINISTIC_SECTION_KERNEL) throw new Error("AI cannot override the deterministic section kernel");
  if (AI_ENGINEERING_APPROVAL || AUTOMATIC_RC_ENGINEERING_APPROVAL || RC_SECTION_MECHANICS_EQUALS_ENGINEERING_APPROVAL) {
    throw new Error("RC section mechanics is not engineering approval");
  }
}
