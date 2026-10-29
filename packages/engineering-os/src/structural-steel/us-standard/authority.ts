import type { ForbiddenEngineeringRuleAuthority, USSteelDesignContext, UsStandardContextConfirmation } from "@rtb/types";
import {
  AI_AISC_EDITION_AUTHORITY,
  AI_ENGINEERING_APPROVAL,
  AI_LOCAL_AMENDMENT_AUTHORITY,
  AI_LRFD_ASD_AUTHORITY,
  AI_STANDARD_CONFORMANCE_AUTHORITY,
  AI_US_STANDARD_ASSISTANCE_ADVISORY_ONLY,
  EMPLOYEE_BEHAVIOR_PROFILING,
  FORBIDDEN_ENGINEERING_RULE_AUTHORITIES,
  LLM_MEMORY_ONLY_RULE_ALLOWED,
  SILENT_AISC_EDITION_INFERENCE,
  STANDARD_CONFORMANCE_EQUALS_PROJECT_APPROVAL,
  US_AI_NUMERICAL_AUTHORITY,
  US_CODE_PROFILE_INFERRED_FROM_USER_LOCATION,
  US_STEEL_CONTEXT_PII_REQUIRED,
} from "@rtb/types";
import { STRUCTURAL_STANDARD_TEXT_EMBEDDED, TENANT_ISOLATION_PRESERVED, WORKSPACE_ISOLATION_PRESERVED } from "@rtb/types";

const LOCATION_SOURCES = new Set(["locale", "ip", "browser_locale", "physical_location", "tenant_address"]);

export function assertAiUsStandardAssistanceAdvisoryOnly(): void {
  if (!AI_US_STANDARD_ASSISTANCE_ADVISORY_ONLY) throw new Error("AI US-standard assistance must remain advisory");
  if (AI_AISC_EDITION_AUTHORITY) throw new Error("AI must not have AISC edition authority");
  if (AI_LRFD_ASD_AUTHORITY) throw new Error("AI must not have LRFD/ASD authority");
  if (AI_LOCAL_AMENDMENT_AUTHORITY) throw new Error("AI must not have local-amendment authority");
  if (AI_STANDARD_CONFORMANCE_AUTHORITY) throw new Error("AI must not have standard-conformance authority");
  if (AI_ENGINEERING_APPROVAL) throw new Error("AI must not approve engineering");
  if (US_AI_NUMERICAL_AUTHORITY) throw new Error("AI must not have numerical authority");
}

export function denyAiAiscEditionChoice(): never {
  assertAiUsStandardAssistanceAdvisoryOnly();
  throw new Error("AI_AUTHORITY_DENIED: AI cannot choose an AISC edition");
}

export function denyAiLrfdAsdChoice(): never {
  assertAiUsStandardAssistanceAdvisoryOnly();
  throw new Error("AI_AUTHORITY_DENIED: AI cannot choose LRFD or ASD");
}

export function denyAiLocalAmendment(): never {
  assertAiUsStandardAssistanceAdvisoryOnly();
  throw new Error("AI_AUTHORITY_DENIED: AI cannot invent a local amendment");
}

export function denyAiUsConformanceClaim(): never {
  if (AI_STANDARD_CONFORMANCE_AUTHORITY) throw new Error("AI must not have standard-conformance authority");
  throw new Error("AI_AUTHORITY_DENIED: AI cannot claim US code compliance");
}

export function denyCodeProfileFromUserLocation(source: string): void {
  if (US_CODE_PROFILE_INFERRED_FROM_USER_LOCATION) {
    throw new Error("US code profile must not be inferred from user location");
  }
  if (LOCATION_SOURCES.has(source)) {
    throw new Error("USER_LOCATION_INFERENCE_DENIED: US code profile must be explicit/governed");
  }
}

export function denyAiEditionInference(): never {
  if (SILENT_AISC_EDITION_INFERENCE) throw new Error("silent AISC edition inference is forbidden");
  throw new Error("AI_AUTHORITY_DENIED: AI cannot infer an AISC edition");
}

export function assertUsRuleAuthority(authorityType: string): void {
  if (LLM_MEMORY_ONLY_RULE_ALLOWED) throw new Error("LLM_MEMORY_ONLY rules are forbidden");
  if ((FORBIDDEN_ENGINEERING_RULE_AUTHORITIES as readonly string[]).includes(authorityType)) {
    throw new Error(`RULE_AUTHORITY_DENIED: ${authorityType} is not a governed engineering-rule authority`);
  }
}

export function assertHumanUsStandardConfirmation(
  confirmation: UsStandardContextConfirmation | null,
  required: boolean,
): void {
  if (!required) return;
  if (!confirmation) throw new Error("HUMAN_CONFIRMATION_REQUIRED");
  if (confirmation.aiConfirmed !== false) throw new Error("AI cannot perform US standard confirmation");
  if (confirmation.engineeringApprovalImplied !== false) {
    throw new Error("standard confirmation is not engineering approval");
  }
  if (STANDARD_CONFORMANCE_EQUALS_PROJECT_APPROVAL) {
    throw new Error("standard conformance is not project approval");
  }
  const fields: Array<keyof UsStandardContextConfirmation> = [
    "jurisdictionConfirmed",
    "aiscEditionConfirmed",
    "designMethodConfirmed",
    "asceLoadStandardConfirmed",
    "seismicApplicabilityConfirmed",
    "localAmendmentsConfirmed",
    "projectExceptionsConfirmed",
  ];
  for (const field of fields) {
    if (confirmation[field] !== true && confirmation[field] !== "NOT_APPLICABLE") {
      throw new Error(`HUMAN_CONFIRMATION_REQUIRED: ${field}`);
    }
  }
}

export function assertUsContextHasNoPii(context: USSteelDesignContext): void {
  if (US_STEEL_CONTEXT_PII_REQUIRED) throw new Error("US steel context must not require PII");
  if (context.piiPresent !== false) throw new Error("US steel context must not carry personnel PII");
  if (EMPLOYEE_BEHAVIOR_PROFILING) throw new Error("employee behaviour profiling is forbidden");
}

export function assertUsTenantWorkspaceIsolation(
  left: Pick<USSteelDesignContext, "tenantId" | "workspaceId">,
  right: Pick<USSteelDesignContext, "tenantId" | "workspaceId">,
): void {
  if (!TENANT_ISOLATION_PRESERVED || !WORKSPACE_ISOLATION_PRESERVED) {
    throw new Error("tenant and workspace isolation must be preserved");
  }
  if (left.tenantId !== right.tenantId) throw new Error("US standard profiles must not leak between tenants");
}

export function assertNoEmbeddedStandardText(): void {
  if (STRUCTURAL_STANDARD_TEXT_EMBEDDED) throw new Error("copyrighted standard text must not be embedded");
}

export type { ForbiddenEngineeringRuleAuthority };
