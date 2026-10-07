import type { EngineeringRuleAuthorityType, UsConcreteCalculationContext, UsConcreteStandardContextConfirmation } from "@rtb/types";
import {
  AI_ACI318_EDITION_AUTHORITY,
  AI_ACI_CONFORMANCE_AUTHORITY,
  AI_BUILDING_CODE_ADOPTION_AUTHORITY,
  AI_BUILDING_CODE_COMPLIANCE_AUTHORITY,
  AI_CODE_CAPACITY_AUTHORITY,
  AI_ENGINEERING_APPROVAL,
  AI_LOAD_STANDARD_AUTHORITY,
  AI_LOCAL_AMENDMENT_AUTHORITY,
  AI_STRENGTH_FACTOR_AUTHORITY,
  AI_STRESS_BLOCK_AUTHORITY,
  AI_US_CONCRETE_STANDARD_ASSISTANCE_ADVISORY_ONLY,
  COPYRIGHTED_ACI318_TEXT_COMMITTED,
  GENERATIVE_MODEL_SELECTS_ACI_EDITION,
  GENERATIVE_MODEL_SELECTS_BUILDING_CODE,
  GENERATIVE_MODEL_SELECTS_LOAD_STANDARD_EDITION,
  GENERATIVE_MODEL_SELECTS_LOCAL_AMENDMENT,
  LLM_MEMORY_ONLY_RULE_ALLOWED,
  SILENT_ACI318_EDITION_INFERENCE,
  STANDARD_TEXT_REQUIRED_BY_RUNTIME,
  STRUCTURAL_STANDARD_TEXT_EMBEDDED,
  US_CONCRETE_STANDARD_INFERRED_FROM_USER_LOCATION,
  US_CONCRETE_STANDARD_TENANT_ISOLATION,
  US_CONCRETE_STANDARD_WORKSPACE_ISOLATION,
} from "@rtb/types";
import { assertConcreteEngineeringRuleAuthority } from "../authority";

const LOCATION_SOURCES = new Set(["locale", "ip", "browser_locale", "physical_location", "tenant_address", "ui_location"]);

export function assertAiUsConcreteAssistanceAdvisoryOnly(): void {
  if (!AI_US_CONCRETE_STANDARD_ASSISTANCE_ADVISORY_ONLY) throw new Error("AI US concrete assistance must remain advisory");
  if (AI_ACI318_EDITION_AUTHORITY || GENERATIVE_MODEL_SELECTS_ACI_EDITION) throw new Error("AI must not have ACI 318 edition authority");
  if (AI_BUILDING_CODE_ADOPTION_AUTHORITY || GENERATIVE_MODEL_SELECTS_BUILDING_CODE) throw new Error("AI must not have building-code adoption authority");
  if (AI_LOCAL_AMENDMENT_AUTHORITY || GENERATIVE_MODEL_SELECTS_LOCAL_AMENDMENT) throw new Error("AI must not invent a local amendment");
  if (AI_LOAD_STANDARD_AUTHORITY || GENERATIVE_MODEL_SELECTS_LOAD_STANDARD_EDITION) throw new Error("AI must not have load-standard authority");
  if (AI_STRENGTH_FACTOR_AUTHORITY) throw new Error("AI must not invent strength-reduction factor");
  if (AI_STRESS_BLOCK_AUTHORITY) throw new Error("AI must not invent stress-block coefficient");
  if (AI_CODE_CAPACITY_AUTHORITY) throw new Error("AI must not originate code capacity");
  if (AI_ACI_CONFORMANCE_AUTHORITY) throw new Error("AI must not claim ACI conformance");
  if (AI_BUILDING_CODE_COMPLIANCE_AUTHORITY) throw new Error("AI must not claim building-code compliance");
  if (AI_ENGINEERING_APPROVAL) throw new Error("AI must not approve engineering");
}

export function denyAiAci318EditionChoice(): never {
  assertAiUsConcreteAssistanceAdvisoryOnly();
  throw new Error("AI_AUTHORITY_DENIED: AI cannot choose an ACI 318 edition");
}

export function denyAiBuildingCodeAdoption(): never {
  assertAiUsConcreteAssistanceAdvisoryOnly();
  throw new Error("AI_AUTHORITY_DENIED: AI cannot choose a building-code edition");
}

export function denyAiUsConcreteLocalAmendment(): never {
  assertAiUsConcreteAssistanceAdvisoryOnly();
  throw new Error("AI_AUTHORITY_DENIED: AI cannot invent a local amendment");
}

export function denyAiLoadStandardEdition(): never {
  assertAiUsConcreteAssistanceAdvisoryOnly();
  throw new Error("AI_AUTHORITY_DENIED: AI cannot choose a load-standard edition");
}

export function denyAiAciConformanceClaim(): never {
  assertAiUsConcreteAssistanceAdvisoryOnly();
  throw new Error("AI_AUTHORITY_DENIED: AI cannot claim ACI compliance");
}

export function denyAiBuildingCodeComplianceClaim(): never {
  assertAiUsConcreteAssistanceAdvisoryOnly();
  throw new Error("AI_AUTHORITY_DENIED: AI cannot claim building-code compliance");
}

export function denyUsConcreteProfileFromUserLocation(source: string): void {
  if (US_CONCRETE_STANDARD_INFERRED_FROM_USER_LOCATION) {
    throw new Error("US concrete standard must not be inferred from user location");
  }
  if (LOCATION_SOURCES.has(source)) {
    throw new Error("USER_LOCATION_INFERENCE_DENIED: ACI/building-code profile must be explicit/governed");
  }
}

export function denySilentAciEditionInference(): void {
  if (SILENT_ACI318_EDITION_INFERENCE) throw new Error("silent ACI 318 edition inference is forbidden");
}

export function assertUsConcreteRuleAuthority(authorityType: string): void {
  if (LLM_MEMORY_ONLY_RULE_ALLOWED) throw new Error("LLM_MEMORY_ONLY rules are forbidden");
  if (authorityType === "LLM_MEMORY_ONLY" || authorityType === "UNSOURCED_WEB_SUMMARY" || authorityType === "UNVERIFIED_GENERATED_RULE") {
    throw new Error(`RULE_AUTHORITY_DENIED: ${authorityType}`);
  }
  assertConcreteEngineeringRuleAuthority(authorityType as EngineeringRuleAuthorityType);
}

export function assertHumanUsConcreteConfirmation(
  confirmation: UsConcreteStandardContextConfirmation | null,
  required: boolean,
): void {
  if (!required) return;
  if (!confirmation) throw new Error("HUMAN_CONFIRMATION_REQUIRED");
  if (confirmation.aiConfirmed !== false) throw new Error("AI cannot perform US concrete standard confirmation");
  if (confirmation.engineeringApprovalImplied !== false) throw new Error("standard confirmation is not engineering approval");
  const fields: Array<keyof UsConcreteStandardContextConfirmation> = [
    "aciEditionConfirmed",
    "amendmentErrataConfirmed",
    "buildingCodeAdoptionConfirmed",
    "referencedStandardProfileConfirmed",
    "localAmendmentsConfirmed",
    "loadStandardConfirmed",
    "materialStandardsConfirmed",
    "projectOverridesConfirmed",
  ];
  for (const field of fields) {
    if (confirmation[field] !== true && confirmation[field] !== "NOT_APPLICABLE") {
      throw new Error(`HUMAN_CONFIRMATION_REQUIRED: ${field}`);
    }
  }
}

export function assertUsConcreteTenantWorkspaceIsolation(
  left: Pick<UsConcreteCalculationContext, "tenantId" | "workspaceId">,
  right: Pick<UsConcreteCalculationContext, "tenantId" | "workspaceId">,
): void {
  if (!US_CONCRETE_STANDARD_TENANT_ISOLATION || !US_CONCRETE_STANDARD_WORKSPACE_ISOLATION) {
    throw new Error("tenant and workspace isolation must be preserved");
  }
  if (left.tenantId !== right.tenantId) throw new Error("US concrete standard profiles must not leak between tenants");
}

export function assertNoCopyrightedAci318Text(): void {
  if (STANDARD_TEXT_REQUIRED_BY_RUNTIME || STRUCTURAL_STANDARD_TEXT_EMBEDDED || COPYRIGHTED_ACI318_TEXT_COMMITTED) {
    throw new Error("copyrighted ACI/building-code text must not be embedded");
  }
}
