import type {
  EuConcreteResolverFailReason,
  EuConcreteResolverInput,
  EuConcreteResolverResult,
  EurocodeConcreteCalculationContext,
  EurocodeConcreteProjectContext,
} from "@rtb/types";
import {
  CROSS_GENERATION_RULE_MIXING_ALLOWED,
  EU_CONCRETE_PACK_CERTIFIED,
  EU_CONCRETE_STANDARD_CONFORMANCE_STATE,
  EU_CONCRETE_STANDARD_EDITION,
  EUROCODE_UNKNOWN_EDITION_TOKEN,
  ISSUED_EU_CONCRETE_CALCULATION_CONTEXT_IMMUTABLE,
  SILENT_EN1992_EDITION_INFERENCE,
  STANDARD_UPDATE_OVERWRITES_HISTORICAL_CONCRETE_RULE,
} from "@rtb/types";
import {
  assertAnnexCompatibleWithContext,
  assertCountryAndStandardSeparate,
  assertEditionExplicitOrUnknown,
  assertNoCrossEditionMixing,
  resolveNdp,
  unknownEurocodeVersion,
} from "../../structural-steel/eu-standard";
import { assertNdpGenerationCompatible, assertNoDefaultEuConcreteNationalAnnex } from "./annex";
import {
  assertAiEuConcreteAssistanceAdvisoryOnly,
  assertEuConcreteNdpNotFromAi,
  assertEuConcreteRuleAuthority,
  assertHumanEuConcreteConfirmation,
  denyAiEn1992EditionInference,
  denyAiEuConcreteConformanceClaim,
  denyAiEuConcreteNationalAnnexChoice,
  denyAiEuConcreteNdpSupply,
  denyEuConcreteAnnexFromUserLocation,
} from "./authority";
import { projectDoesNotForceWorkspaceAnnex } from "./context";
import { resolveEn1992Part } from "./family";
import { assertNoSilentSourceConflict, assertSourcePrecedenceDeclared, DEFAULT_EU_CONCRETE_SOURCE_PRECEDENCE } from "./precedence";
import { assertEuCodeParametersUnpopulated } from "./profiles";

function fail(reason: EuConcreteResolverFailReason, detail: string): EuConcreteResolverResult {
  return { ok: false, context: null, failReason: reason, detail, checkState: "CHECK_UNDETERMINED" };
}

export function snapshotIssuedEuConcreteContext(issued: EurocodeConcreteCalculationContext): EurocodeConcreteCalculationContext {
  if (STANDARD_UPDATE_OVERWRITES_HISTORICAL_CONCRETE_RULE) {
    throw new Error("standard updates must not overwrite historical EU concrete rules");
  }
  if (!ISSUED_EU_CONCRETE_CALCULATION_CONTEXT_IMMUTABLE) {
    throw new Error("issued EU concrete calculation context must remain immutable");
  }
  return {
    ...issued,
    version: { ...issued.version },
    nationalAnnex: issued.nationalAnnex ? { ...issued.nationalAnnex } : null,
    ndpSet: issued.ndpSet.map((row) => ({ ...row })),
    concreteMaterialStandardRefs: [...issued.concreteMaterialStandardRefs],
    reinforcementMaterialStandardRefs: [...issued.reinforcementMaterialStandardRefs],
    projectOverrideRefs: issued.projectOverrideRefs.map((row) => ({ ...row })),
    sourcePrecedence: [...issued.sourcePrecedence],
    authorityRefs: [...issued.authorityRefs],
    technicalBasisRefs: [...issued.technicalBasisRefs],
    issued: true,
    piiPresent: false,
  };
}

export function historicalEuConcreteContextRemainsReproducible(
  issued: EurocodeConcreteCalculationContext,
  laterProject: EurocodeConcreteProjectContext,
): EurocodeConcreteCalculationContext {
  const frozen = snapshotIssuedEuConcreteContext(issued);
  void laterProject;
  return frozen;
}

export function unknownEditionBlocksEuConcreteConformance(context: EurocodeConcreteCalculationContext): void {
  if (context.version.edition === EUROCODE_UNKNOWN_EDITION_TOKEN && context.standardConformanceState !== EU_CONCRETE_STANDARD_CONFORMANCE_STATE) {
    throw new Error("STANDARD_EDITION_REQUIRED: unknown edition cannot claim code conformance");
  }
  if (context.standardConformanceState !== "INTENDED_PROFILE") {
    throw new Error("EU concrete pack remains INTENDED_PROFILE until edition/rules are validated");
  }
  if (EU_CONCRETE_PACK_CERTIFIED) throw new Error("EU concrete pack is not certified in EU-1");
}

export function assertNoCrossGenerationMixing(
  left: EurocodeConcreteCalculationContext["version"],
  right: EurocodeConcreteCalculationContext["version"],
): void {
  if (CROSS_GENERATION_RULE_MIXING_ALLOWED) throw new Error("cross-generation Eurocode concrete rule mixing is forbidden");
  assertNoCrossEditionMixing(left, right);
}

export function assertMultiCountryEuConcreteContexts(contexts: readonly EurocodeConcreteCalculationContext[]): void {
  const countries = new Set(contexts.map((row) => row.countryCode));
  const tenants = new Set(contexts.map((row) => row.tenantId));
  const workspaces = new Set(contexts.map((row) => row.workspaceId));
  if (tenants.size !== 1 || workspaces.size !== 1) {
    throw new Error("multi-country comparison requires the same tenant/workspace");
  }
  if (countries.size < 2) throw new Error("multi-country projects must allow more than one national context");
}

function contextFromProject(project: EurocodeConcreteProjectContext, requestedPartId: string): EurocodeConcreteCalculationContext {
  const part = resolveEn1992Part(requestedPartId);
  const annex = project.nationalAnnexSet.find((row) => row.standardPartRef === part.partId && (project.countryCode == null || row.countryCode === project.countryCode)) ?? null;
  return {
    contextId: `eu-concrete-${project.projectRef}-${part.partId}`,
    tenantId: project.tenantId,
    workspaceId: project.workspaceId,
    projectRef: project.projectRef,
    jurisdictionProfileRef: project.jurisdictionProfileRef,
    countryCode: project.countryCode ?? "",
    standardFamily: "EUROCODE",
    standardCode: part.standardCode,
    standardPart: part.partId,
    version: {
      ...unknownEurocodeVersion(part.standardCode),
      generationFamily: project.standardGeneration,
      edition: project.standardEdition || EU_CONCRETE_STANDARD_EDITION,
      amendment: project.amendmentState,
    },
    nationalAnnex: annex,
    ndpSet: project.ndpSet,
    concreteMaterialStandardRefs: [...project.concreteMaterialStandardRefs],
    reinforcementMaterialStandardRefs: [...project.reinforcementMaterialStandardRefs],
    loadStandardContextRef: project.loadStandardContextRef,
    durabilityContextRef: project.durabilityContextRef,
    serviceabilityContextRef: project.serviceabilityContextRef,
    projectOverrideRefs: [...project.projectOverrideRefs],
    sourcePrecedence: [...DEFAULT_EU_CONCRETE_SOURCE_PRECEDENCE],
    authorityRefs: [...project.authorityRefs],
    technicalBasisRefs: [...project.technicalBasisRefs],
    intendedStandardProfile: "EN1992",
    standardConformanceState: EU_CONCRETE_STANDARD_CONFORMANCE_STATE,
    validationState: "STANDARD_BINDING_FRAMEWORK",
    provenanceRef: `d1e-eu1:${project.projectRef}`,
    issued: false,
    humanConfirmation: null,
    statutoryEuMembershipRequired: false,
    statutoryEuComplianceClaimed: false,
    internationalContractualUse: project.internationalContractualUse,
    piiPresent: false,
  };
}

export function resolveEurocodeConcreteContext(input: EuConcreteResolverInput): EuConcreteResolverResult {
  assertAiEuConcreteAssistanceAdvisoryOnly();
  assertEuCodeParametersUnpopulated();
  try {
    denyEuConcreteAnnexFromUserLocation(input.source);
  } catch (error) {
    return fail("USER_LOCATION_INFERENCE_DENIED", error instanceof Error ? error.message : String(error));
  }
  if (input.uiLocation && !input.projectContext?.nationalAnnexRef && !input.explicitCalculationContext?.nationalAnnex) {
    try {
      denyEuConcreteAnnexFromUserLocation("ui_location");
    } catch (error) {
      return fail("USER_LOCATION_INFERENCE_DENIED", error instanceof Error ? error.message : String(error));
    }
  }
  if (input.aiSelectedAnnex) {
    try {
      denyAiEuConcreteNationalAnnexChoice();
    } catch (error) {
      return fail("AI_AUTHORITY_DENIED", error instanceof Error ? error.message : String(error));
    }
  }
  if (input.aiSuppliedNdp) {
    try {
      denyAiEuConcreteNdpSupply();
    } catch (error) {
      return fail("AI_AUTHORITY_DENIED", error instanceof Error ? error.message : String(error));
    }
  }
  if (input.aiInferredEdition || SILENT_EN1992_EDITION_INFERENCE) {
    try {
      denyAiEn1992EditionInference();
    } catch (error) {
      return fail("AI_AUTHORITY_DENIED", error instanceof Error ? error.message : String(error));
    }
  }
  if (input.aiClaimedConformance) {
    try {
      denyAiEuConcreteConformanceClaim();
    } catch (error) {
      return fail("AI_AUTHORITY_DENIED", error instanceof Error ? error.message : String(error));
    }
  }
  try {
    assertEuConcreteRuleAuthority(input.ruleAuthorityType);
  } catch (error) {
    return fail("RULE_AUTHORITY_DENIED", error instanceof Error ? error.message : String(error));
  }

  let requestedPart: ReturnType<typeof resolveEn1992Part>;
  try {
    requestedPart = resolveEn1992Part(input.requestedPartId);
  } catch (error) {
    return fail("STANDARD_PART_UNSUPPORTED", error instanceof Error ? error.message : String(error));
  }

  if (input.issuedContext) {
    const issued = snapshotIssuedEuConcreteContext(input.issuedContext);
    unknownEditionBlocksEuConcreteConformance(issued);
    return { ok: true, context: issued, failReason: null };
  }

  let candidate: EurocodeConcreteCalculationContext | null = input.explicitCalculationContext;
  if (!candidate && input.projectContext) {
    projectDoesNotForceWorkspaceAnnex(input.projectContext);
    candidate = contextFromProject(input.projectContext, input.requestedPartId);
  }
  if (!candidate) {
    return fail("STANDARD_CONTEXT_INCOMPLETE", "governed Eurocode concrete context requires an explicit or project profile");
  }

  try {
    if (candidate.standardPart !== requestedPart.partId) {
      return fail("STANDARD_PART_UNSUPPORTED", `requested part ${input.requestedPartId} is not the bound part ${candidate.standardPart}`);
    }
    candidate = {
      ...candidate,
      version: {
        ...candidate.version,
        edition: assertEditionExplicitOrUnknown(candidate.version.edition),
      },
    };
    if (!candidate.countryCode?.trim() && input.ruleRequiresNdp) {
      return fail("NATIONAL_ANNEX_REQUIRED", "country/profile is required before a National Annex can be bound");
    }
    if (candidate.countryCode) assertCountryAndStandardSeparate(candidate.countryCode, candidate.standardCode);
    assertNoDefaultEuConcreteNationalAnnex(candidate.nationalAnnex);
    assertEuConcreteNdpNotFromAi(candidate.ndpSet);
    unknownEditionBlocksEuConcreteConformance(candidate);
    assertSourcePrecedenceDeclared(candidate.sourcePrecedence);
    assertNoSilentSourceConflict(candidate);
    if (candidate.nationalAnnex) {
      assertAnnexCompatibleWithContext(
        {
          countryCode: candidate.countryCode,
          standardPart: candidate.standardPart,
          version: candidate.version,
        },
        candidate.nationalAnnex,
      );
      if (candidate.version.generationFamily !== candidate.nationalAnnex.generationFamily) {
        return fail("STANDARD_VERSION_CONFLICT", "National Annex generation is incompatible with the standard generation");
      }
    }
    if (input.ruleRequiresNdp && !candidate.nationalAnnex) {
      return fail("NATIONAL_ANNEX_REQUIRED", "missing required National Annex fails closed");
    }
    for (const parameterId of input.requiredNdpIds) {
      const resolved = resolveNdp({
        ruleRequiresNdp: input.ruleRequiresNdp,
        annex: candidate.nationalAnnex,
        ndpSet: candidate.ndpSet,
        parameterId,
      });
      if (resolved.kind === "FAIL_CLOSED") {
        return fail(resolved.reason, `NDP ${parameterId} is not governed`);
      }
      if (resolved.kind === "RESOLVED") {
        const record = candidate.ndpSet.find((row) => row.parameterId === parameterId);
        if (record) assertNdpGenerationCompatible(candidate, record);
      }
    }
    if (input.humanConfirmed) {
      assertHumanEuConcreteConfirmation(candidate.humanConfirmation, true);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.startsWith("STANDARD_PART_UNSUPPORTED")) return fail("STANDARD_PART_UNSUPPORTED", message);
    if (message.startsWith("NATIONAL_ANNEX_MISMATCH")) return fail("NATIONAL_ANNEX_MISMATCH", message);
    if (message.startsWith("STANDARD_VERSION_CONFLICT")) return fail("STANDARD_VERSION_CONFLICT", message);
    if (message.startsWith("STANDARD_EDITION_REQUIRED")) return fail("STANDARD_EDITION_REQUIRED", message);
    if (message.startsWith("HUMAN_CONFIRMATION_REQUIRED")) return fail("HUMAN_CONFIRMATION_REQUIRED", message);
    if (message.startsWith("STANDARD_CONTEXT_CONFLICT")) return fail("STANDARD_CONTEXT_CONFLICT", message);
    if (message.startsWith("PROJECT_OVERRIDE_CONFLICT")) return fail("PROJECT_OVERRIDE_CONFLICT", message);
    if (message.startsWith("NDP_EDITION_INCOMPATIBLE")) return fail("NDP_EDITION_INCOMPATIBLE", message);
    throw error;
  }

  return { ok: true, context: candidate, failReason: null };
}
