import type {
  UsConcreteCalculationContext,
  UsConcreteProjectStandardContext,
  UsConcreteResolverFailReason,
  UsConcreteResolverInput,
  UsConcreteResolverResult,
} from "@rtb/types";
import {
  ACI_CONCRETE_DESIGN_EQUALS_BUILDING_CODE_COMPLIANCE,
  ACI_UNKNOWN_EDITION_TOKEN,
  DIRECT_CONTRACT_ACI_PROFILE_EQUALS_BUILDING_CODE_COMPLIANCE,
  GENERATIVE_OPTIMIZER_CAN_SILENTLY_CHANGE_US_STANDARD_CONTEXT,
  ISSUED_US_CONCRETE_CALCULATION_CONTEXT_IMMUTABLE,
  SILENT_ACI318_EDITION_INFERENCE,
  SILENT_US_LOAD_STANDARD_EDITION_INFERENCE,
  STANDARD_UPDATE_OVERWRITES_HISTORICAL_US_CONCRETE_RULE,
  STEEL_LRFD_ASD_SEMANTICS_REUSED_FOR_US_CONCRETE,
  US_CONCRETE_PACK_CERTIFIED,
  US_CONCRETE_STANDARD_CONFORMANCE_STATE,
  US_CONCRETE_STANDARD_EDITION,
} from "@rtb/types";
import {
  assertAciReferencedEditionCompatible,
  assertBuildingCodeAndAciStandardSeparate,
  assertNoDefaultUsBuildingCode,
  assertUsConcreteAmendmentCompatibleWithAdoption,
  assertUsConcreteJurisdictionAndStandardSeparate,
} from "./adoption";
import {
  assertAiUsConcreteAssistanceAdvisoryOnly,
  assertHumanUsConcreteConfirmation,
  assertUsConcreteRuleAuthority,
  denyAiAci318EditionChoice,
  denyAiAciConformanceClaim,
  denyAiBuildingCodeAdoption,
  denyAiBuildingCodeComplianceClaim,
  denyAiLoadStandardEdition,
  denyAiUsConcreteLocalAmendment,
  denySilentAciEditionInference,
  denyUsConcreteProfileFromUserLocation,
} from "./authority";
import { projectDoesNotForceWorkspaceUsCode } from "./context";
import { bindAci318ConcreteFamily } from "./family";
import { assertNoSilentUsConcreteSourceConflict, assertUsConcreteSourcePrecedenceDeclared, DEFAULT_US_CONCRETE_SOURCE_PRECEDENCE } from "./precedence";
import { assertUsCodeParametersUnpopulated } from "./profiles";

function fail(reason: UsConcreteResolverFailReason, detail: string): UsConcreteResolverResult {
  return { ok: false, context: null, failReason: reason, detail, checkState: "CHECK_UNDETERMINED" };
}

export function snapshotIssuedUsConcreteContext(issued: UsConcreteCalculationContext): UsConcreteCalculationContext {
  if (STANDARD_UPDATE_OVERWRITES_HISTORICAL_US_CONCRETE_RULE) {
    throw new Error("standard updates must not overwrite historical US concrete rules");
  }
  if (!ISSUED_US_CONCRETE_CALCULATION_CONTEXT_IMMUTABLE) {
    throw new Error("issued US concrete calculation context must remain immutable");
  }
  return {
    ...issued,
    concreteMaterialStandardRefs: [...issued.concreteMaterialStandardRefs],
    reinforcementMaterialStandardRefs: [...issued.reinforcementMaterialStandardRefs],
    localAmendmentSet: issued.localAmendmentSet.map((row) => ({ ...row })),
    projectOverrideRefs: issued.projectOverrideRefs.map((row) => ({ ...row })),
    sourcePrecedence: [...issued.sourcePrecedence],
    authorityRefs: [...issued.authorityRefs],
    technicalBasisRefs: [...issued.technicalBasisRefs],
    issued: true,
    piiPresent: false,
  };
}

export function historicalUsConcreteContextRemainsReproducible(
  issued: UsConcreteCalculationContext,
  laterProject: UsConcreteProjectStandardContext,
): UsConcreteCalculationContext {
  const frozen = snapshotIssuedUsConcreteContext(issued);
  void laterProject;
  return frozen;
}

export function unknownAciEditionBlocksUsConcreteConformance(context: UsConcreteCalculationContext): void {
  if (context.concreteStandardEdition === ACI_UNKNOWN_EDITION_TOKEN && context.standardConformanceState !== US_CONCRETE_STANDARD_CONFORMANCE_STATE) {
    throw new Error("ACI_EDITION_REQUIRED: unknown edition cannot claim code conformance");
  }
  if (US_CONCRETE_PACK_CERTIFIED) throw new Error("US concrete pack is not certified in US-1");
  if (ACI_CONCRETE_DESIGN_EQUALS_BUILDING_CODE_COMPLIANCE) {
    throw new Error("ACI concrete design must not equal building-code compliance");
  }
  if (context.directContractProfile && DIRECT_CONTRACT_ACI_PROFILE_EQUALS_BUILDING_CODE_COMPLIANCE) {
    throw new Error("direct-contract ACI profile must not equal building-code compliance");
  }
}

function contextFromProject(project: UsConcreteProjectStandardContext): UsConcreteCalculationContext {
  const family = bindAci318ConcreteFamily();
  const direct = Boolean(project.directContractProfileRef) || project.internationalContractualUse;
  return {
    contextId: `us-concrete-${project.projectRef}-${family.familyId}`,
    tenantId: project.tenantId,
    workspaceId: project.workspaceId,
    projectRef: project.projectRef,
    jurisdictionProfileRef: project.jurisdictionProfileRef,
    buildingCodeAdoption: direct ? null : project.buildingCodeAdoption,
    concreteStandardFamily: "ACI 318",
    concreteStandardCode: family.standardCode,
    concreteStandardEdition: project.concreteStandardEdition || US_CONCRETE_STANDARD_EDITION,
    amendmentState: project.amendmentState,
    errataState: project.errataState,
    loadStandard: project.loadStandard,
    seismicStandard: project.seismicStandard,
    concreteMaterialStandardRefs: [...project.concreteMaterialStandardRefs],
    reinforcementMaterialStandardRefs: [...project.reinforcementMaterialStandardRefs],
    localAmendmentSet: direct ? [] : [...project.localAmendmentSet],
    projectOverrideRefs: [...project.projectOverrideRefs],
    sourcePrecedence: [...DEFAULT_US_CONCRETE_SOURCE_PRECEDENCE],
    authorityRefs: [...project.authorityRefs],
    technicalBasisRefs: [...project.technicalBasisRefs],
    intendedStandardProfile: "ACI318",
    standardConformanceState: US_CONCRETE_STANDARD_CONFORMANCE_STATE,
    validationState: "STANDARD_BINDING_FRAMEWORK",
    provenanceRef: `d1e-us1:${project.projectRef}`,
    issued: false,
    humanConfirmation: null,
    directContractProfile: direct,
    statutoryUsComplianceClaimed: false,
    internationalContractualUse: project.internationalContractualUse,
    unitSystemIndependent: true,
    piiPresent: false,
  };
}

export function resolveUsConcreteContext(input: UsConcreteResolverInput): UsConcreteResolverResult {
  assertAiUsConcreteAssistanceAdvisoryOnly();
  assertUsCodeParametersUnpopulated();
  denySilentAciEditionInference();
  if (STEEL_LRFD_ASD_SEMANTICS_REUSED_FOR_US_CONCRETE) {
    return fail("STANDARD_CONTEXT_CONFLICT", "steel LRFD/ASD semantics must not be reused for US concrete");
  }
  if (GENERATIVE_OPTIMIZER_CAN_SILENTLY_CHANGE_US_STANDARD_CONTEXT || input.generativeAttemptedStandardContextChange) {
    return fail("AI_AUTHORITY_DENIED", "generative optimizer cannot silently change US standard context");
  }
  try {
    denyUsConcreteProfileFromUserLocation(input.source);
  } catch (error) {
    return fail("USER_LOCATION_INFERENCE_DENIED", error instanceof Error ? error.message : String(error));
  }
  if (input.aiSelectedAciEdition) {
    try { denyAiAci318EditionChoice(); } catch (error) {
      return fail("AI_AUTHORITY_DENIED", error instanceof Error ? error.message : String(error));
    }
  }
  if (input.aiSelectedBuildingCode) {
    try { denyAiBuildingCodeAdoption(); } catch (error) {
      return fail("AI_AUTHORITY_DENIED", error instanceof Error ? error.message : String(error));
    }
  }
  if (input.aiInventedAmendment) {
    try { denyAiUsConcreteLocalAmendment(); } catch (error) {
      return fail("AI_AUTHORITY_DENIED", error instanceof Error ? error.message : String(error));
    }
  }
  if (input.aiSelectedLoadStandardEdition) {
    try { denyAiLoadStandardEdition(); } catch (error) {
      return fail("AI_AUTHORITY_DENIED", error instanceof Error ? error.message : String(error));
    }
  }
  if (input.aiClaimedConformance) {
    try { denyAiAciConformanceClaim(); } catch (error) {
      return fail("AI_AUTHORITY_DENIED", error instanceof Error ? error.message : String(error));
    }
  }
  if (input.aiClaimedBuildingCodeCompliance) {
    try { denyAiBuildingCodeComplianceClaim(); } catch (error) {
      return fail("AI_AUTHORITY_DENIED", error instanceof Error ? error.message : String(error));
    }
  }
  try {
    assertUsConcreteRuleAuthority(input.ruleAuthorityType);
  } catch (error) {
    return fail("RULE_AUTHORITY_DENIED", error instanceof Error ? error.message : String(error));
  }

  if (input.issuedContext) {
    const issued = snapshotIssuedUsConcreteContext(input.issuedContext);
    unknownAciEditionBlocksUsConcreteConformance(issued);
    return { ok: true, context: issued, failReason: null };
  }

  let candidate: UsConcreteCalculationContext | null = input.explicitCalculationContext;
  if (!candidate && input.projectContext) {
    projectDoesNotForceWorkspaceUsCode(input.projectContext);
    candidate = contextFromProject(input.projectContext);
  }
  if (!candidate) {
    return fail("STANDARD_CONTEXT_INCOMPLETE", "governed US concrete context requires an explicit or project profile");
  }

  try {
    assertNoDefaultUsBuildingCode();
    if (SILENT_ACI318_EDITION_INFERENCE) throw new Error("silent ACI 318 edition inference is forbidden");
    candidate = {
      ...candidate,
      concreteStandardEdition: candidate.concreteStandardEdition?.trim() || ACI_UNKNOWN_EDITION_TOKEN,
    };
    unknownAciEditionBlocksUsConcreteConformance(candidate);
    assertUsConcreteJurisdictionAndStandardSeparate(candidate.jurisdictionProfileRef, candidate.concreteStandardCode);
    assertUsConcreteSourcePrecedenceDeclared(candidate.sourcePrecedence);
    assertNoSilentUsConcreteSourceConflict(candidate);

    if (input.adoptionRequired && !candidate.directContractProfile && !candidate.buildingCodeAdoption) {
      return fail("BUILDING_CODE_CONTEXT_REQUIRED", "missing building-code context where required fails closed");
    }
    if (candidate.buildingCodeAdoption) {
      assertBuildingCodeAndAciStandardSeparate(candidate.buildingCodeAdoption.buildingCodeFamily, candidate.concreteStandardCode);
      assertAciReferencedEditionCompatible(candidate.buildingCodeAdoption, candidate.concreteStandardEdition);
      for (const amendment of candidate.localAmendmentSet) {
        assertUsConcreteAmendmentCompatibleWithAdoption(candidate.buildingCodeAdoption, amendment);
      }
    }
    if (input.localAmendmentRequired && candidate.localAmendmentSet.length === 0 && !candidate.directContractProfile) {
      return fail("LOCAL_AMENDMENT_REQUIRED", "missing required local amendment fails closed");
    }
    if (SILENT_US_LOAD_STANDARD_EDITION_INFERENCE) {
      return fail("LOAD_STANDARD_CONTEXT_REQUIRED", "load-standard edition must not be inferred");
    }
    if (input.loadStandardRequired && !candidate.loadStandard) {
      return fail("LOAD_STANDARD_CONTEXT_REQUIRED", "referenced load-standard context is required");
    }
    if (input.unresolvedSourceConflict) {
      return fail("STANDARD_CONTEXT_CONFLICT", "unresolved governed source conflict fails closed");
    }
    if (input.humanConfirmed) {
      assertHumanUsConcreteConfirmation(candidate.humanConfirmation, true);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.startsWith("ACI_EDITION_REQUIRED")) return fail("ACI_EDITION_REQUIRED", message);
    if (message.startsWith("ACI_REFERENCED_EDITION_MISMATCH")) return fail("ACI_REFERENCED_EDITION_MISMATCH", message);
    if (message.startsWith("EFFECTIVE_DATE_CONFLICT")) return fail("EFFECTIVE_DATE_CONFLICT", message);
    if (message.startsWith("LOCAL_AMENDMENT_CONFLICT")) return fail("LOCAL_AMENDMENT_CONFLICT", message);
    if (message.startsWith("PROJECT_OVERRIDE_CONFLICT")) return fail("PROJECT_OVERRIDE_CONFLICT", message);
    if (message.startsWith("HUMAN_CONFIRMATION_REQUIRED")) return fail("HUMAN_CONFIRMATION_REQUIRED", message);
    if (message.startsWith("STANDARD_CONTEXT_CONFLICT")) return fail("STANDARD_CONTEXT_CONFLICT", message);
    if (message.startsWith("STANDARD_CONTEXT_INCOMPLETE")) return fail("STANDARD_CONTEXT_INCOMPLETE", message);
    throw error;
  }

  return { ok: true, context: candidate, failReason: null };
}

export function assertMultiJurisdictionUsConcreteContexts(contexts: readonly UsConcreteCalculationContext[]): void {
  const tenants = new Set(contexts.map((row) => row.tenantId));
  const workspaces = new Set(contexts.map((row) => row.workspaceId));
  const keys = new Set(contexts.map((row) => `${row.buildingCodeAdoption?.adoptionId ?? "direct"}:${row.provenanceRef}`));
  if (tenants.size !== 1 || workspaces.size !== 1) {
    throw new Error("multi-jurisdiction comparison requires the same tenant/workspace");
  }
  if (keys.size < 2) throw new Error("multi-jurisdiction projects must allow more than one adoption context");
}
