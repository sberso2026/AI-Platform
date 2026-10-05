import type {
  EosAiCapabilityRecord,
  EosCrossDisciplineImpact,
  EosCrossDisciplineInterface,
  EosDisciplineDefinition,
} from "@rtb/types";
import {
  DISCIPLINE_SECURITY_OVERRIDE_ALLOWED,
  DUPLICATE_PLATFORM_FRAMEWORK_ALLOWED,
  EOS_CORE_OWNED_REGISTERS,
  EOS_D0_GOVERNANCE_PROFILES,
  EOS_FORBIDDEN_PLATFORM_FRAMEWORKS,
  EOS_GLOBAL_FIRST_ARCHITECTURE,
  GOVERNED_NUMERICAL_OUTPUT_ALLOWED_FOR_LLM_DEFAULT,
  LLM_ORIGINATES_GOVERNED_NUMERIC_RESULT,
  UNCERTIFIED_TOOL_SILENT_FALLBACK_ALLOWED,
} from "@rtb/types";
import { assertAiCapabilityRecord } from "../global-governance/guards";
import { EOS_ORGANIZATIONAL_INTELLIGENCE_BOUNDARY, EOS_SECURITY_BASELINE } from "../global-governance/catalogs";

export function assertDisciplineInheritsGlobalGovernance(pack: EosDisciplineDefinition): void {
  const required = EOS_D0_GOVERNANCE_PROFILES;
  for (const key of Object.keys(required) as Array<keyof typeof required>) {
    if (!pack.inheritedProfiles[key]?.trim()) {
      throw new Error(`discipline ${pack.disciplineId} missing governance profile ${key}`);
    }
  }
  if (pack.euOnlyAssumption !== false) throw new Error(`discipline ${pack.disciplineId} must not be EU-only`);
  if (!pack.jurisdictionApplicability.includes("global-baseline")) {
    throw new Error(`discipline ${pack.disciplineId} must remain globally applicable`);
  }
  if (pack.jurisdictionApplicability.length < 2) {
    throw new Error(`discipline ${pack.disciplineId} must support multiple jurisdiction profiles`);
  }
  if (pack.ownerPackage !== "@rtb/engineering-os") {
    throw new Error("discipline packs live in the common Engineering OS framework, not a mini-OS");
  }
}

export function assertDisciplineAiGovernance(pack: EosDisciplineDefinition): void {
  for (const cap of pack.aiCapabilities) {
    assertAiCapabilityRecord({
      capabilityId: cap.capabilityId,
      name: cap.capabilityId,
      module: pack.disciplineId,
      discipline: pack.disciplineId,
      intendedPurpose: cap.intendedPurpose,
      AIType: "GENERATIVE",
      modelOrTool: null,
      provider: null,
      version: pack.version,
      inputCategories: cap.dataCategories,
      outputCategories: ["AI_SUGGESTION"],
      engineeringImpact: cap.engineeringImpact,
      humanOversightRequired: cap.humanOversightRequired,
      autonomousActionAllowed: cap.autonomousActionAllowed,
      governedNumericalOutputAllowed: cap.governedNumericalOutputAllowed,
      evidenceRequired: cap.evidenceRequired,
      provenanceRequired: cap.provenanceRequired,
      riskClassification: cap.riskClassification,
      jurisdictionApplicability: cap.jurisdictionApplicability,
      deploymentRegion: cap.jurisdictionApplicability,
      dataCategories: cap.dataCategories,
      reviewStatus: "DRAFT",
      effectiveVersion: pack.version,
    } satisfies EosAiCapabilityRecord);
    if (cap.governedNumericalOutputAllowed !== GOVERNED_NUMERICAL_OUTPUT_ALLOWED_FOR_LLM_DEFAULT) {
      throw new Error("LLM governed numerical origination is forbidden by default");
    }
    if (!cap.evidenceRequired || !cap.provenanceRequired) {
      throw new Error("discipline AI capabilities must require evidence and provenance");
    }
  }
  for (const calc of pack.calculationDefinitions) {
    if (calc.llmOriginatesGovernedNumericResult !== LLM_ORIGINATES_GOVERNED_NUMERIC_RESULT) {
      throw new Error("LLM may not originate governed numeric results");
    }
    if (!calc.deterministic) throw new Error("governed calculations must be deterministic");
  }
}

export function assertCoreRegisterOwnership(objectTypeId: string): void {
  if ((EOS_CORE_OWNED_REGISTERS as readonly string[]).includes(objectTypeId)) {
    throw new Error(`core register ${objectTypeId} is owned by Engineering Core and must not be recreated`);
  }
}

export function assertNoDuplicatePlatformFramework(framework: string): void {
  if (DUPLICATE_PLATFORM_FRAMEWORK_ALLOWED) throw new Error("duplicate platform frameworks are forbidden");
  if (DISCIPLINE_SECURITY_OVERRIDE_ALLOWED) throw new Error("discipline security override is forbidden");
  if ((EOS_FORBIDDEN_PLATFORM_FRAMEWORKS as readonly string[]).includes(framework)) {
    throw new Error(`discipline packs must not implement ${framework}`);
  }
}

export function assertNoUncertifiedSilentFallback(input: { certified: boolean; silentFallbackUsed: boolean }): void {
  if (UNCERTIFIED_TOOL_SILENT_FALLBACK_ALLOWED) throw new Error("silent fallback policy must remain denied");
  if (!input.certified && input.silentFallbackUsed) {
    throw new Error("uncertified external tools must not silently fall back");
  }
}

export function assertCrossDisciplineInterface(row: EosCrossDisciplineInterface): void {
  if (!row.interfaceId || !row.sourceDiscipline || !row.targetDiscipline || !row.relation) {
    throw new Error("cross-discipline interface is incomplete");
  }
  if (typeof row.humanReviewRequired !== "boolean") {
    throw new Error("cross-discipline interface must declare human review requirement");
  }
  if (!row.status) throw new Error("cross-discipline interface must declare status");
}

export function assertCrossDisciplineImpact(row: EosCrossDisciplineImpact): void {
  if (!row.sourceDiscipline || !row.affectedDiscipline || !row.sourceObject || !row.affectedObject) {
    throw new Error("cross-discipline impact contract is incomplete");
  }
  if (row.aiSuggestionAdvisory !== true) throw new Error("AI impact suggestions remain advisory");
}

export function assertDisciplinePrivacyAndSecurity(pack: EosDisciplineDefinition): void {
  if (!pack.provenanceRequirements.includes("eos-eu-0-global-provenance")) {
    throw new Error(`discipline ${pack.disciplineId} must inherit global provenance`);
  }
  if (!pack.dataClassifications.includes("engineeringData")) {
    throw new Error(`discipline ${pack.disciplineId} must classify engineering data`);
  }
  if (EOS_ORGANIZATIONAL_INTELLIGENCE_BOUNDARY.employeeSurveillanceDefault !== "PROHIBITED") {
    throw new Error("employee surveillance must remain prohibited");
  }
  if (EOS_ORGANIZATIONAL_INTELLIGENCE_BOUNDARY.personalBehaviorProfilingDefault !== "PROHIBITED") {
    throw new Error("personal behavior profiling must remain prohibited");
  }
  if (!EOS_SECURITY_BASELINE.controls.includes("MFA") || !EOS_SECURITY_BASELINE.controls.includes("least_privilege")) {
    throw new Error("security baseline missing required controls");
  }
  if (DISCIPLINE_SECURITY_OVERRIDE_ALLOWED) throw new Error("discipline packs may not weaken inherited security");
  for (const model of pack.inspectionModels) {
    if (model.aiFindingEqualsEngineeringApproval) {
      throw new Error("inspection AI findings are not engineering approval");
    }
  }
  for (const twin of pack.digitalTwinModels) {
    if (twin.humanPersonTwinAllowed) {
      throw new Error("human/person twins are forbidden in discipline extensions");
    }
  }
}

export function assertNationalAnnexInheritance(pack: EosDisciplineDefinition): void {
  if (pack.inheritedProfiles.engineeringStandardsProfile !== "jurisdiction-selected") {
    throw new Error("standards/national annexes must remain jurisdiction-selected, not hard-coded");
  }
}

export function assertGlobalFirstDisciplineFramework(): void {
  if (!EOS_GLOBAL_FIRST_ARCHITECTURE) throw new Error("discipline framework must remain global-first");
}
