import type {
  StructuralStandardContext,
  USSteelDesignContext,
  UsProjectStandardContext,
  UsResolverFailReason,
  UsSteelResolverInput,
  UsSteelResolverResult,
  UsStandardVersion,
} from "@rtb/types";
import {
  AISC_UNKNOWN_EDITION_TOKEN,
  CROSS_EDITION_RULE_MIXING_ALLOWED,
  DEFAULT_LRFD_OR_ASD,
  DESIGN_METHOD_AND_UNIT_SYSTEM_SEPARATE,
  SILENT_AISC_EDITION_INFERENCE,
  SILENT_ASCE_EDITION_INFERENCE,
  SILENT_LRFD_ASD_CONVERSION,
  SILENT_SEISMIC_STANDARD_EDITION_INFERENCE,
  STANDARD_UPDATE_OVERWRITES_HISTORICAL_RULE,
  US_SEISMIC_PROFILE_ALWAYS_REQUIRED,
  US_STEEL_DESIGN_AVAILABLE,
  US_STEEL_PACK_CERTIFIED,
} from "@rtb/types";
import { createConfiguredKnowledgeContext } from "../../structural-domain/binding";
import { assertAmendmentCompatibleWithAdoption, assertBuildingCodeAndSteelStandardSeparate, assertJurisdictionAndStandardSeparate } from "./adoption";
import {
  assertAiUsStandardAssistanceAdvisoryOnly,
  assertHumanUsStandardConfirmation,
  assertUsContextHasNoPii,
  assertUsRuleAuthority,
  denyAiAiscEditionChoice,
  denyAiLocalAmendment,
  denyAiLrfdAsdChoice,
  denyAiUsConformanceClaim,
  denyCodeProfileFromUserLocation,
} from "./authority";
import { resolveAiscSteelFamily } from "./family";

export function unknownAiscVersion(standardIdentifier: string): UsStandardVersion {
  if (SILENT_AISC_EDITION_INFERENCE) throw new Error("silent AISC edition inference is forbidden");
  return {
    publisher: "AISC",
    standardFamily: "AISC",
    standardIdentifier,
    edition: AISC_UNKNOWN_EDITION_TOKEN,
    publicationDate: null,
    amendment: AISC_UNKNOWN_EDITION_TOKEN,
    errata: null,
    supersessionState: AISC_UNKNOWN_EDITION_TOKEN,
    effectiveDate: null,
  };
}

export function assertAiscEditionExplicitOrUnknown(edition: string | null | undefined): string {
  if (SILENT_AISC_EDITION_INFERENCE) throw new Error("silent AISC edition inference is forbidden");
  if (!edition?.trim()) return AISC_UNKNOWN_EDITION_TOKEN;
  return edition;
}

export function snapshotIssuedUsContext(issued: USSteelDesignContext): USSteelDesignContext {
  if (STANDARD_UPDATE_OVERWRITES_HISTORICAL_RULE) {
    throw new Error("standard updates must not overwrite historical US steel rules");
  }
  return {
    ...issued,
    referencedStandardRefs: [...issued.referencedStandardRefs],
    connectionStandardRefs: [...issued.connectionStandardRefs],
    engineeringRuleAuthorityRefs: [...issued.engineeringRuleAuthorityRefs],
    sourcePrecedence: [...issued.sourcePrecedence],
    issued: true,
    piiPresent: false,
  };
}

export function historicalUsContextRemainsReproducible(
  issued: USSteelDesignContext,
  laterProject: UsProjectStandardContext,
): USSteelDesignContext {
  const frozen = snapshotIssuedUsContext(issued);
  void laterProject;
  return frozen;
}

export function unknownEditionBlocksUsConformance(context: USSteelDesignContext): void {
  if (context.edition === AISC_UNKNOWN_EDITION_TOKEN && context.standardConformanceState !== "INTENDED_PROFILE") {
    throw new Error("AISC_EDITION_REQUIRED: unknown edition cannot claim code conformance");
  }
  if (US_STEEL_PACK_CERTIFIED || US_STEEL_DESIGN_AVAILABLE) {
    throw new Error("US steel pack is not certified or generally available in US-1");
  }
}

export function toUsStructuralStandardContext(context: USSteelDesignContext): StructuralStandardContext {
  const base = createConfiguredKnowledgeContext({
    contextId: context.contextId,
    jurisdictionProfileRef: context.jurisdictionProfileRef,
    standardFamily: "AISC",
    standardCode: context.steelStandardCode,
    edition: context.edition,
    amendment: context.amendmentErrataState,
    materialScope: "steel",
  });
  return { ...base, nationalAnnexRef: null, calculationScope: context.validationState };
}

export function assertNoUsCrossEditionMixing(left: string, right: string): void {
  if (CROSS_EDITION_RULE_MIXING_ALLOWED) throw new Error("cross-edition AISC rule mixing is forbidden");
  const leftKnown = left !== AISC_UNKNOWN_EDITION_TOKEN;
  const rightKnown = right !== AISC_UNKNOWN_EDITION_TOKEN;
  if (leftKnown && rightKnown && left !== right) {
    throw new Error("STANDARD_VERSION_CONFLICT: AISC edition mismatch");
  }
}

export function projectContextDoesNotForceWorkspaceCode(project: UsProjectStandardContext): void {
  if (project.workspaceGlobalCodeProfileId !== null) {
    throw new Error("workspace must not be globally equal to one US code profile");
  }
}

function fail(reason: UsResolverFailReason, detail: string): UsSteelResolverResult {
  return { ok: false, context: null, failReason: reason, detail, checkState: "CHECK_UNDETERMINED" };
}

function contextFromProject(project: UsProjectStandardContext): USSteelDesignContext {
  const family = resolveAiscSteelFamily();
  return {
    contextId: `us-project-${project.projectId}-AISC360`,
    tenantId: project.tenantId,
    workspaceId: project.workspaceId,
    projectId: project.projectId,
    assetId: null,
    jurisdictionProfileRef: project.jurisdictionProfileRef,
    buildingCodeAdoptionRef: project.directContractProfile ? null : project.buildingCodeFamily,
    buildingCodeAdoption: project.directContractProfile || !project.buildingCodeFamily ? null : {
      adoptionId: `adopt-${project.projectId}`,
      jurisdiction: project.jurisdictionProfileRef,
      adoptingAuthority: "project-declared",
      buildingCodeFamily: project.buildingCodeFamily,
      buildingCodeEdition: project.buildingCodeEdition ?? AISC_UNKNOWN_EDITION_TOKEN,
      effectiveDate: null,
      localAmendmentSetRef: project.localAmendmentSetRef,
      referencedStandards: [family.standardCode],
      projectOverrideRefs: [],
      validationState: "FRAMEWORK_ONLY",
      sourceAuthorityRef: project.designBasisReference ?? "project-standard-profile",
    },
    steelStandardFamily: "AISC",
    steelStandardId: family.familyId,
    steelStandardCode: family.standardCode,
    edition: assertAiscEditionExplicitOrUnknown(project.aiscEdition),
    amendmentErrataState: AISC_UNKNOWN_EDITION_TOKEN,
    designMethod: project.designMethod,
    unitSystem: project.unitSystem,
    referencedStandardRefs: ["ASCE 7"],
    localAmendmentSetRef: project.localAmendmentSetRef,
    localAmendment: null,
    loadStandard: {
      standardId: "ASCE_7",
      standardCode: "ASCE 7",
      edition: SILENT_ASCE_EDITION_INFERENCE ? "INFERRED" : (project.asceEdition || AISC_UNKNOWN_EDITION_TOKEN),
      combinationBasis: "UNKNOWN_PENDING_CONFIRMATION",
      implemented: false,
    },
    seismicApplicable: project.seismicApplicable,
    seismicStandard: project.seismicApplicable
      ? {
        applicable: true,
        standardId: "AISC_341",
        standardCode: "AISC 341",
        edition: SILENT_SEISMIC_STANDARD_EDITION_INFERENCE ? "INFERRED" : (project.seismicEdition ?? AISC_UNKNOWN_EDITION_TOKEN),
        implemented: false,
      }
      : null,
    connectionStandardRefs: ["RCSC", "AISC 358"],
    materialSourceKind: "UNBOUND",
    sectionCatalogRef: null,
    projectStandardContextRef: project.projectId,
    calculationContextRef: null,
    engineeringRuleAuthorityRefs: ["VALIDATED_ENGINEERING_REFERENCE"],
    projectOverride: null,
    sourcePrecedence: ["CONTRACT_REQUIREMENT", "REFERENCED_STANDARD"],
    intendedStandardProfile: "AISC360",
    standardConformanceState: "INTENDED_PROFILE",
    validationState: "FRAMEWORK_ONLY",
    provenanceRef: `us1:${project.projectId}`,
    issued: false,
    humanConfirmation: null,
    piiPresent: false,
    directContractProfile: project.directContractProfile,
  };
}

export function resolveUsSteelContext(input: UsSteelResolverInput): UsSteelResolverResult {
  assertAiUsStandardAssistanceAdvisoryOnly();
  try {
    denyCodeProfileFromUserLocation(input.source);
  } catch (error) {
    return fail("USER_LOCATION_INFERENCE_DENIED", error instanceof Error ? error.message : "location inference denied");
  }
  if (input.aiSelectedEdition) {
    try { denyAiAiscEditionChoice(); } catch (error) {
      return fail("AI_AUTHORITY_DENIED", error instanceof Error ? error.message : "AI edition denied");
    }
  }
  if (input.aiSelectedDesignMethod) {
    try { denyAiLrfdAsdChoice(); } catch (error) {
      return fail("AI_AUTHORITY_DENIED", error instanceof Error ? error.message : "AI method denied");
    }
  }
  if (input.aiInventedAmendment) {
    try { denyAiLocalAmendment(); } catch (error) {
      return fail("AI_AUTHORITY_DENIED", error instanceof Error ? error.message : "AI amendment denied");
    }
  }
  if (input.aiClaimedConformance) {
    try { denyAiUsConformanceClaim(); } catch (error) {
      return fail("AI_AUTHORITY_DENIED", error instanceof Error ? error.message : "AI conformance denied");
    }
  }
  try {
    assertUsRuleAuthority(input.ruleAuthorityType ?? "VALIDATED_ENGINEERING_REFERENCE");
  } catch (error) {
    return fail("RULE_AUTHORITY_DENIED", error instanceof Error ? error.message : "rule authority denied");
  }

  if (input.issuedContext) {
    return { ok: true, context: snapshotIssuedUsContext(input.issuedContext), failReason: null };
  }

  let candidate: USSteelDesignContext | null = null;
  try {
    candidate = input.explicitCalculationContext
      ?? (input.projectContext ? contextFromProject(input.projectContext) : null);
  } catch (error) {
    return fail("UNSUPPORTED_STANDARD_PROFILE", error instanceof Error ? error.message : "unsupported profile");
  }
  if (!candidate) return fail("UNSUPPORTED_STANDARD_PROFILE", "no project or calculation context");

  if (DEFAULT_LRFD_OR_ASD) return fail("DESIGN_METHOD_REQUIRED", "LRFD/ASD must not be defaulted");
  if (candidate.designMethod !== "LRFD" && candidate.designMethod !== "ASD") {
    return fail("DESIGN_METHOD_REQUIRED", "design method must be explicit LRFD or ASD");
  }
  if (!DESIGN_METHOD_AND_UNIT_SYSTEM_SEPARATE || input.collapseDesignMethodFromUnits) {
    return fail("STANDARD_CONTEXT_CONFLICT", "design method is not a unit system");
  }
  if (SILENT_LRFD_ASD_CONVERSION || input.convertLrfdToAsdSilently || input.convertAsdToLrfdSilently) {
    return fail("STANDARD_CONTEXT_CONFLICT", "silent LRFD/ASD conversion is forbidden");
  }

  const edition = assertAiscEditionExplicitOrUnknown(candidate.edition);
  candidate = { ...candidate, edition };
  if (edition === AISC_UNKNOWN_EDITION_TOKEN && candidate.standardConformanceState !== "INTENDED_PROFILE") {
    return fail("AISC_EDITION_REQUIRED", "unknown edition cannot claim code conformance");
  }

  if (input.adoptionRequired && !candidate.directContractProfile && !candidate.buildingCodeAdoption) {
    return fail("BUILDING_CODE_CONTEXT_REQUIRED", "adoption context is required unless the contract specifies standards directly");
  }
  if (candidate.buildingCodeAdoption) {
    try {
      assertBuildingCodeAndSteelStandardSeparate(candidate.buildingCodeAdoption.buildingCodeFamily, candidate.steelStandardCode);
      assertJurisdictionAndStandardSeparate(candidate.jurisdictionProfileRef, candidate.steelStandardCode);
      assertAmendmentCompatibleWithAdoption(candidate.buildingCodeAdoption, candidate.localAmendment);
    } catch (error) {
      const message = error instanceof Error ? error.message : "adoption conflict";
      if (message.includes("LOCAL_AMENDMENT_CONFLICT")) return fail("LOCAL_AMENDMENT_CONFLICT", message);
      if (message.includes("STANDARD_VERSION_CONFLICT")) return fail("STANDARD_VERSION_CONFLICT", message);
      return fail("STANDARD_CONTEXT_CONFLICT", message);
    }
  }

  if (input.loadStandardRequired && !candidate.loadStandard) {
    return fail("LOAD_STANDARD_CONTEXT_REQUIRED", "ASCE load-standard context is required");
  }
  if (SILENT_ASCE_EDITION_INFERENCE) return fail("LOAD_STANDARD_CONTEXT_REQUIRED", "ASCE edition must not be inferred");
  if (candidate.loadStandard && candidate.edition !== AISC_UNKNOWN_EDITION_TOKEN && candidate.loadStandard.edition === AISC_UNKNOWN_EDITION_TOKEN && input.loadStandardRequired) {
    return fail("LOAD_STANDARD_CONTEXT_REQUIRED", "ASCE edition must be explicit and is not inferred from AISC edition");
  }

  if (US_SEISMIC_PROFILE_ALWAYS_REQUIRED && !candidate.seismicApplicable) {
    return fail("SEISMIC_CONTEXT_REQUIRED", "seismic profile is not universally required");
  }
  if (candidate.seismicApplicable && input.ruleRequiresSeismic) {
    if (SILENT_SEISMIC_STANDARD_EDITION_INFERENCE) {
      return fail("SEISMIC_CONTEXT_REQUIRED", "seismic edition must not be inferred");
    }
    if (!candidate.seismicStandard || candidate.seismicStandard.edition === AISC_UNKNOWN_EDITION_TOKEN) {
      return fail("SEISMIC_CONTEXT_REQUIRED", "seismic standard edition is required when seismic design applies");
    }
  }

  if (input.enforceLoadMethodCompatibility && candidate.loadStandard) {
    if (candidate.loadStandard.combinationBasis === "STRENGTH" && candidate.designMethod === "ASD") {
      return fail("STANDARD_CONTEXT_CONFLICT", "ASD is incompatible with a governed strength load basis");
    }
    if (candidate.loadStandard.combinationBasis === "ALLOWABLE" && candidate.designMethod === "LRFD") {
      return fail("STANDARD_CONTEXT_CONFLICT", "LRFD is incompatible with a governed allowable load basis");
    }
  }

  if (candidate.projectOverride && (!candidate.projectOverride.sourceExplicit || !candidate.projectOverride.authorityExplicit || !candidate.projectOverride.scopeExplicit || !candidate.projectOverride.humanConfirmation)) {
    return fail("HUMAN_CONFIRMATION_REQUIRED", "project override must be governed");
  }

  if (input.unresolvedSourceConflict) {
    return fail("STANDARD_CONTEXT_CONFLICT", "unresolved governed source conflict fails closed");
  }

  try {
    unknownEditionBlocksUsConformance(candidate);
    assertUsContextHasNoPii(candidate);
    if (input.humanConfirmationRequired) assertHumanUsStandardConfirmation(candidate.humanConfirmation, true);
  } catch (error) {
    const message = error instanceof Error ? error.message : "context invalid";
    if (message.includes("AISC_EDITION_REQUIRED")) return fail("AISC_EDITION_REQUIRED", message);
    if (message.includes("HUMAN_CONFIRMATION_REQUIRED")) return fail("HUMAN_CONFIRMATION_REQUIRED", message);
    return fail("STANDARD_CONTEXT_CONFLICT", message);
  }

  return { ok: true, context: candidate, failReason: null };
}

export function assertMultiJurisdictionUsContexts(contexts: readonly USSteelDesignContext[]): void {
  const tenants = new Set(contexts.map((row) => row.tenantId));
  const workspaces = new Set(contexts.map((row) => row.workspaceId));
  const jurisdictions = new Set(contexts.map((row) => `${row.jurisdictionProfileRef}:${row.buildingCodeAdoptionRef ?? "direct"}`));
  if (tenants.size !== 1 || workspaces.size !== 1) {
    throw new Error("multi-jurisdiction comparison requires the same tenant/workspace");
  }
  if (jurisdictions.size < 2) throw new Error("multi-jurisdiction projects must allow more than one adoption context");
}
