import type { EuConcreteNdpRecord, EuConcreteStandardContextConfirmation } from "@rtb/types";
import {
  AI_EN1992_EDITION_AUTHORITY,
  AI_ENGINEERING_APPROVAL,
  AI_EU_CONCRETE_CODE_CAPACITY_AUTHORITY,
  AI_EU_CONCRETE_NATIONAL_ANNEX_AUTHORITY,
  AI_EU_CONCRETE_NDP_AUTHORITY,
  AI_EU_CONCRETE_STANDARD_ASSISTANCE_ADVISORY_ONLY,
  AI_EU_CONCRETE_STANDARD_CONFORMANCE_AUTHORITY,
  AI_PARTIAL_FACTOR_AUTHORITY,
  EU_CONCRETE_NATIONAL_ANNEX_INFERRED_FROM_USER_LOCATION,
  GENERATIVE_MODEL_SELECTS_NATIONAL_ANNEX,
  GENERATIVE_MODEL_SELECTS_NDP,
  LLM_MEMORY_ONLY_RULE_ALLOWED,
  SILENT_EN1992_EDITION_INFERENCE,
} from "@rtb/types";
import { assertConcreteEngineeringRuleAuthority } from "../authority";
import {
  assertAiEuStandardAssistanceAdvisoryOnly,
  assertEurocodeRuleAuthority,
  assertHumanEurocodeConfirmation,
  assertNoEmbeddedStandardText,
  denyAiConformanceClaim,
  denyAiEditionInference,
  denyAiNationalAnnexChoice,
  denyAiNdpSupply,
  denyNationalAnnexFromUserLocation,
} from "../../structural-steel/eu-standard";

const LOCATION_SOURCES = new Set(["locale", "ip", "browser_locale", "physical_location", "tenant_address", "ui_location"]);

export function assertAiEuConcreteAssistanceAdvisoryOnly(): void {
  assertAiEuStandardAssistanceAdvisoryOnly();
  if (!AI_EU_CONCRETE_STANDARD_ASSISTANCE_ADVISORY_ONLY) throw new Error("AI EU concrete assistance must remain advisory");
  if (AI_EN1992_EDITION_AUTHORITY) throw new Error("AI must not have EN 1992 edition authority");
  if (AI_EU_CONCRETE_NATIONAL_ANNEX_AUTHORITY || GENERATIVE_MODEL_SELECTS_NATIONAL_ANNEX) {
    throw new Error("AI must not have National Annex authority");
  }
  if (AI_EU_CONCRETE_NDP_AUTHORITY || GENERATIVE_MODEL_SELECTS_NDP) throw new Error("AI must not have NDP authority");
  if (AI_PARTIAL_FACTOR_AUTHORITY) throw new Error("AI must not have partial-factor authority");
  if (AI_EU_CONCRETE_CODE_CAPACITY_AUTHORITY) throw new Error("AI must not have code-capacity authority");
  if (AI_EU_CONCRETE_STANDARD_CONFORMANCE_AUTHORITY) throw new Error("AI must not have standard-conformance authority");
  if (AI_ENGINEERING_APPROVAL) throw new Error("AI must not approve engineering");
}

export function denyAiEuConcreteNationalAnnexChoice(): never {
  assertAiEuConcreteAssistanceAdvisoryOnly();
  denyAiNationalAnnexChoice();
}

export function denyAiEuConcreteNdpSupply(): never {
  assertAiEuConcreteAssistanceAdvisoryOnly();
  denyAiNdpSupply();
}

export function denyAiEn1992EditionInference(): never {
  if (SILENT_EN1992_EDITION_INFERENCE) throw new Error("silent EN 1992 edition inference is forbidden");
  denyAiEditionInference();
}

export function denyAiEuConcreteConformanceClaim(): never {
  assertAiEuConcreteAssistanceAdvisoryOnly();
  denyAiConformanceClaim();
}

export function denyEuConcreteAnnexFromUserLocation(source: string): void {
  if (EU_CONCRETE_NATIONAL_ANNEX_INFERRED_FROM_USER_LOCATION) {
    throw new Error("National Annex must not be inferred from user location");
  }
  denyNationalAnnexFromUserLocation(source);
  if (LOCATION_SOURCES.has(source)) {
    throw new Error("USER_LOCATION_INFERENCE_DENIED: National Annex must be explicit/governed");
  }
}

export function assertEuConcreteRuleAuthority(authorityType: string): void {
  if (LLM_MEMORY_ONLY_RULE_ALLOWED) throw new Error("LLM_MEMORY_ONLY rules are forbidden");
  assertEurocodeRuleAuthority(authorityType);
  if (authorityType === "LLM_MEMORY_ONLY" || authorityType === "UNSOURCED_WEB_SUMMARY" || authorityType === "UNVERIFIED_GENERATED_RULE") {
    throw new Error(`RULE_AUTHORITY_DENIED: ${authorityType}`);
  }
  if (
    authorityType === "VALIDATED_ENGINEERING_REFERENCE" ||
    authorityType === "ESTABLISHED_ENGINEERING_MECHANICS" ||
    authorityType === "AUTHORITATIVE_STANDARD_DERIVED" ||
    authorityType === "HUMAN_AUTHORED_VALIDATED_RULE" ||
    authorityType === "CERTIFIED_EXTERNAL_TOOL_REFERENCE" ||
    authorityType === "OTHER_GOVERNED_ENGINEERING_SOURCE"
  ) {
    assertConcreteEngineeringRuleAuthority(authorityType);
  }
}

export function assertHumanEuConcreteConfirmation(
  confirmation: EuConcreteStandardContextConfirmation | null,
  required: boolean,
): void {
  if (!required) return;
  assertHumanEurocodeConfirmation(confirmation, true);
  if (!confirmation) throw new Error("HUMAN_CONFIRMATION_REQUIRED");
  if (confirmation.ndpSetConfirmed !== true) throw new Error("HUMAN_CONFIRMATION_REQUIRED: ndpSetConfirmed");
  if (confirmation.materialStandardsConfirmed !== true) throw new Error("HUMAN_CONFIRMATION_REQUIRED: materialStandardsConfirmed");
  if (confirmation.projectOverridesConfirmed !== true) throw new Error("HUMAN_CONFIRMATION_REQUIRED: projectOverridesConfirmed");
}

export function assertEuConcreteNdpNotFromAi(records: readonly EuConcreteNdpRecord[]): void {
  for (const row of records) {
    if (row.sourceAuthorityRef === "AI" || row.validationState === "AI_SUPPLIED") {
      denyAiEuConcreteNdpSupply();
    }
  }
}

export function assertNoCopyrightedEn1992Text(): void {
  assertNoEmbeddedStandardText();
}
