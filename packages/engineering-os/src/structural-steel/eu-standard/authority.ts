import type {
  EurocodeNdpRecord,
  EurocodeStandardContextConfirmation,
  EurocodeSteelDesignContext,
  ForbiddenEngineeringRuleAuthority,
} from "@rtb/types";
import {
  AI_ENGINEERING_APPROVAL,
  AI_EU_STANDARD_ASSISTANCE_ADVISORY_ONLY,
  AI_NATIONAL_ANNEX_AUTHORITY,
  AI_NDP_AUTHORITY,
  AI_STANDARD_CONFORMANCE_AUTHORITY,
  EMPLOYEE_BEHAVIOR_PROFILING,
  EU_AI_NUMERICAL_AUTHORITY,
  EU_STEEL_CONTEXT_PII_REQUIRED,
  FORBIDDEN_ENGINEERING_RULE_AUTHORITIES,
  LLM_MEMORY_ONLY_RULE_ALLOWED,
  NATIONAL_ANNEX_INFERRED_FROM_USER_LOCATION,
  SILENT_EU_STANDARD_EDITION_INFERENCE,
  STANDARD_CONFORMANCE_EQUALS_PROJECT_APPROVAL,
} from "@rtb/types";
import { STRUCTURAL_STANDARD_TEXT_EMBEDDED, TENANT_ISOLATION_PRESERVED, WORKSPACE_ISOLATION_PRESERVED } from "@rtb/types";

const LOCATION_SOURCES = new Set(["locale", "ip", "browser_locale", "physical_location", "tenant_address"]);

export function assertAiEuStandardAssistanceAdvisoryOnly(): void {
  if (!AI_EU_STANDARD_ASSISTANCE_ADVISORY_ONLY) throw new Error("AI Eurocode assistance must remain advisory");
  if (AI_NATIONAL_ANNEX_AUTHORITY) throw new Error("AI must not have National Annex authority");
  if (AI_NDP_AUTHORITY) throw new Error("AI must not have NDP authority");
  if (AI_STANDARD_CONFORMANCE_AUTHORITY) throw new Error("AI must not have standard-conformance authority");
  if (AI_ENGINEERING_APPROVAL) throw new Error("AI must not approve engineering");
  if (EU_AI_NUMERICAL_AUTHORITY) throw new Error("AI must not have numerical authority");
}

export function denyAiNationalAnnexChoice(): never {
  assertAiEuStandardAssistanceAdvisoryOnly();
  throw new Error("AI_AUTHORITY_DENIED: AI cannot choose a National Annex");
}

export function denyAiNdpSupply(): never {
  assertAiEuStandardAssistanceAdvisoryOnly();
  throw new Error("AI_AUTHORITY_DENIED: AI cannot supply NDP values");
}

export function denyAiEditionInference(): never {
  if (SILENT_EU_STANDARD_EDITION_INFERENCE) throw new Error("silent Eurocode edition inference is forbidden");
  throw new Error("AI_AUTHORITY_DENIED: AI cannot infer a Eurocode edition");
}

export function denyAiConformanceClaim(): never {
  if (AI_STANDARD_CONFORMANCE_AUTHORITY) throw new Error("AI must not have standard-conformance authority");
  throw new Error("AI_AUTHORITY_DENIED: AI cannot claim Eurocode conformance");
}

export function denyNationalAnnexFromUserLocation(source: string): void {
  if (NATIONAL_ANNEX_INFERRED_FROM_USER_LOCATION) {
    throw new Error("National Annex must not be inferred from user location");
  }
  if (LOCATION_SOURCES.has(source)) {
    throw new Error("USER_LOCATION_INFERENCE_DENIED: National Annex must be explicit/governed");
  }
}

export function assertEurocodeRuleAuthority(authorityType: string): void {
  if (LLM_MEMORY_ONLY_RULE_ALLOWED) throw new Error("LLM_MEMORY_ONLY rules are forbidden");
  if ((FORBIDDEN_ENGINEERING_RULE_AUTHORITIES as readonly string[]).includes(authorityType)) {
    throw new Error(`RULE_AUTHORITY_DENIED: ${authorityType} is not a governed engineering-rule authority`);
  }
}

export function assertHumanEurocodeConfirmation(
  confirmation: EurocodeStandardContextConfirmation | null,
  required: boolean,
): void {
  if (!required) return;
  if (!confirmation) throw new Error("HUMAN_CONFIRMATION_REQUIRED");
  if (confirmation.aiConfirmed !== false) throw new Error("AI cannot perform Eurocode standard confirmation");
  if (confirmation.engineeringApprovalImplied !== false) {
    throw new Error("standard confirmation is not engineering approval");
  }
  if (STANDARD_CONFORMANCE_EQUALS_PROJECT_APPROVAL) {
    throw new Error("standard conformance is not project approval");
  }
  const fields: Array<keyof EurocodeStandardContextConfirmation> = [
    "jurisdictionConfirmed",
    "generationConfirmed",
    "partConfirmed",
    "editionConfirmed",
    "nationalAnnexConfirmed",
    "projectExceptionsConfirmed",
  ];
  for (const field of fields) {
    if (confirmation[field] !== true) throw new Error(`HUMAN_CONFIRMATION_REQUIRED: ${field}`);
  }
}

export function assertEurocodeContextHasNoPii(context: EurocodeSteelDesignContext): void {
  if (EU_STEEL_CONTEXT_PII_REQUIRED) throw new Error("Eurocode steel context must not require PII");
  if (context.piiPresent !== false) throw new Error("Eurocode steel context must not carry personnel PII");
  if (EMPLOYEE_BEHAVIOR_PROFILING) throw new Error("employee behaviour profiling is forbidden");
}

export function assertEurocodeTenantWorkspaceIsolation(
  left: Pick<EurocodeSteelDesignContext, "tenantId" | "workspaceId">,
  right: Pick<EurocodeSteelDesignContext, "tenantId" | "workspaceId">,
): void {
  if (!TENANT_ISOLATION_PRESERVED || !WORKSPACE_ISOLATION_PRESERVED) {
    throw new Error("tenant and workspace isolation must be preserved");
  }
  if (left.tenantId !== right.tenantId) throw new Error("Eurocode standard profiles must not leak between tenants");
}

export function assertNoEmbeddedStandardText(): void {
  if (STRUCTURAL_STANDARD_TEXT_EMBEDDED) throw new Error("copyrighted standard text must not be embedded");
}

export function assertNdpNotFromAi(records: readonly EurocodeNdpRecord[]): void {
  for (const row of records) {
    if (row.sourceAuthorityRef === "AI" || row.validationState === "AI_SUPPLIED") {
      denyAiNdpSupply();
    }
  }
}

export type { ForbiddenEngineeringRuleAuthority };
