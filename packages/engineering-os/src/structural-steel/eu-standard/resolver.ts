import type {
  EurocodeProjectStandardContext,
  EurocodeResolverFailReason,
  EurocodeSteelDesignContext,
  EurocodeSteelResolverInput,
  EurocodeSteelResolverResult,
  EurocodeStandardVersion,
  StructuralNationalAnnexRef,
  StructuralStandardContext,
} from "@rtb/types";
import {
  CROSS_EDITION_RULE_MIXING_ALLOWED,
  EUROCODE_UNKNOWN_EDITION_TOKEN,
  EU_STEEL_DESIGN_AVAILABLE,
  EU_STEEL_PACK_CERTIFIED,
  SILENT_EU_STANDARD_EDITION_INFERENCE,
  STANDARD_UPDATE_OVERWRITES_HISTORICAL_RULE,
} from "@rtb/types";
import { createConfiguredKnowledgeContext } from "../../structural-domain/binding";
import { assertAnnexCompatibleWithContext, assertCountryAndStandardSeparate, assertNoDefaultNationalAnnex, resolveNdp } from "./annex";
import {
  assertAiEuStandardAssistanceAdvisoryOnly,
  assertEurocodeContextHasNoPii,
  assertEurocodeRuleAuthority,
  assertHumanEurocodeConfirmation,
  assertNdpNotFromAi,
  denyAiConformanceClaim,
  denyAiEditionInference,
  denyAiNationalAnnexChoice,
  denyAiNdpSupply,
  denyNationalAnnexFromUserLocation,
} from "./authority";
import { resolveEurocodePart } from "./family";

export function unknownEurocodeVersion(standardIdentifier: string): EurocodeStandardVersion {
  if (SILENT_EU_STANDARD_EDITION_INFERENCE) throw new Error("silent Eurocode edition inference is forbidden");
  return {
    standardIdentifier,
    generationFamily: EUROCODE_UNKNOWN_EDITION_TOKEN,
    edition: EUROCODE_UNKNOWN_EDITION_TOKEN,
    publicationDate: null,
    amendment: EUROCODE_UNKNOWN_EDITION_TOKEN,
    corrigendum: null,
    supersessionState: EUROCODE_UNKNOWN_EDITION_TOKEN,
    effectiveDate: null,
  };
}

export function assertEditionExplicitOrUnknown(edition: string | null | undefined): string {
  if (SILENT_EU_STANDARD_EDITION_INFERENCE) throw new Error("silent Eurocode edition inference is forbidden");
  if (!edition?.trim()) return EUROCODE_UNKNOWN_EDITION_TOKEN;
  return edition;
}

export function snapshotIssuedEurocodeContext(issued: EurocodeSteelDesignContext): EurocodeSteelDesignContext {
  if (STANDARD_UPDATE_OVERWRITES_HISTORICAL_RULE) {
    throw new Error("standard updates must not overwrite historical Eurocode rules");
  }
  return {
    ...issued,
    version: { ...issued.version },
    nationalAnnex: issued.nationalAnnex ? { ...issued.nationalAnnex } : null,
    ndpSet: issued.ndpSet.map((row) => ({ ...row })),
    issued: true,
    piiPresent: false,
  };
}

export function assertNoCrossEditionMixing(
  left: Pick<EurocodeStandardVersion, "generationFamily" | "edition">,
  right: Pick<EurocodeStandardVersion, "generationFamily" | "edition">,
): void {
  if (CROSS_EDITION_RULE_MIXING_ALLOWED) throw new Error("cross-edition Eurocode rule mixing is forbidden");
  if (left.generationFamily !== right.generationFamily) {
    throw new Error("STANDARD_VERSION_CONFLICT: Eurocode generation mismatch");
  }
  const leftKnown = left.edition !== EUROCODE_UNKNOWN_EDITION_TOKEN;
  const rightKnown = right.edition !== EUROCODE_UNKNOWN_EDITION_TOKEN;
  if (leftKnown && rightKnown && left.edition !== right.edition) {
    throw new Error("STANDARD_VERSION_CONFLICT: Eurocode edition mismatch");
  }
}

export function unknownEditionBlocksConformance(context: EurocodeSteelDesignContext): void {
  if (context.version.edition === EUROCODE_UNKNOWN_EDITION_TOKEN && context.standardConformanceState !== "INTENDED_PROFILE") {
    throw new Error("STANDARD_EDITION_REQUIRED: unknown edition cannot claim code conformance");
  }
  if (EU_STEEL_PACK_CERTIFIED || EU_STEEL_DESIGN_AVAILABLE) {
    throw new Error("EU steel pack is not certified or generally available in EU-1");
  }
}

export function toStructuralStandardContext(context: EurocodeSteelDesignContext): StructuralStandardContext {
  const annex: StructuralNationalAnnexRef | null = context.nationalAnnex
    ? {
      annexId: context.nationalAnnex.nationalAnnexId,
      country: context.nationalAnnex.countryCode,
      jurisdiction: context.jurisdictionProfileRef,
      standardCode: context.standardCode,
      edition: context.nationalAnnex.edition,
      annexEdition: context.nationalAnnex.edition,
      effectiveFrom: context.nationalAnnex.effectiveDate ?? context.version.effectiveDate ?? "1970-01-01",
      effectiveTo: null,
      parameterSetRef: context.nationalAnnex.nationalParameterSetRef,
      sourceReference: context.nationalAnnex.sourceAuthorityRef,
      validationState: context.nationalAnnex.validationState,
    }
    : null;
  const base = createConfiguredKnowledgeContext({
    contextId: context.contextId,
    jurisdictionProfileRef: context.jurisdictionProfileRef,
    standardFamily: "EN",
    standardCode: context.standardCode,
    edition: context.version.edition,
    amendment: context.version.amendment,
    materialScope: "steel",
  });
  return { ...base, nationalAnnexRef: annex, calculationScope: context.validationState };
}

export function assertMultiCountryWorkspaceContexts(contexts: readonly EurocodeSteelDesignContext[]): void {
  const countries = new Set(contexts.map((row) => row.countryCode));
  const tenants = new Set(contexts.map((row) => row.tenantId));
  const workspaces = new Set(contexts.map((row) => row.workspaceId));
  if (tenants.size !== 1 || workspaces.size !== 1) {
    throw new Error("multi-country comparison requires the same tenant/workspace");
  }
  if (countries.size < 2) throw new Error("multi-country projects must allow more than one national context");
}

export function projectContextDoesNotForceWorkspaceAnnex(project: EurocodeProjectStandardContext): void {
  if (project.workspaceGlobalAnnexId !== null) {
    throw new Error("workspace must not be globally equal to one National Annex");
  }
}

function fail(reason: EurocodeResolverFailReason, detail: string): EurocodeSteelResolverResult {
  return { ok: false, context: null, failReason: reason, detail, checkState: "CHECK_UNDETERMINED" };
}

function contextFromProject(project: EurocodeProjectStandardContext, input: EurocodeSteelResolverInput): EurocodeSteelDesignContext {
  const part = resolveEurocodePart(input.requestedPartId);
  const annex = project.nationalAnnexSet.find((row) => row.countryCode === project.countryCode && row.standardPartRef === part.partId) ?? null;
  return {
    contextId: `eu-project-${project.projectId}-${part.partId}`,
    tenantId: project.tenantId,
    workspaceId: project.workspaceId,
    projectId: project.projectId,
    assetId: null,
    jurisdictionProfileRef: project.jurisdictionProfileRef,
    countryCode: project.countryCode ?? "",
    standardFamily: "EUROCODE",
    standardPart: part.partId,
    standardCode: part.standardCode,
    version: {
      ...unknownEurocodeVersion(part.standardCode),
      generationFamily: project.generationFamily,
    },
    nationalAnnex: annex,
    ndpSet: project.projectSpecificGovernedParameters,
    materialSourceKind: "UNBOUND",
    sectionCatalogRef: null,
    projectContextRef: project.projectId,
    calculationContextRef: null,
    sourceAuthorityRef: project.designBasisReference ?? "project-standard-profile",
    intendedStandardProfile: "EN1993",
    standardConformanceState: "INTENDED_PROFILE",
    validationState: "FRAMEWORK_ONLY",
    provenanceRef: `eu1:${project.projectId}`,
    issued: false,
    humanConfirmation: null,
    piiPresent: false,
  };
}

export function resolveEurocodeSteelContext(input: EurocodeSteelResolverInput): EurocodeSteelResolverResult {
  assertAiEuStandardAssistanceAdvisoryOnly();
  try {
    denyNationalAnnexFromUserLocation(input.source);
  } catch (error) {
    return fail("USER_LOCATION_INFERENCE_DENIED", error instanceof Error ? error.message : String(error));
  }
  if (input.aiSelectedAnnex) {
    try {
      denyAiNationalAnnexChoice();
    } catch (error) {
      return fail("AI_AUTHORITY_DENIED", error instanceof Error ? error.message : String(error));
    }
  }
  if (input.aiSuppliedNdp) {
    try {
      denyAiNdpSupply();
    } catch (error) {
      return fail("AI_AUTHORITY_DENIED", error instanceof Error ? error.message : String(error));
    }
  }
  if (input.aiInferredEdition) {
    try {
      denyAiEditionInference();
    } catch (error) {
      return fail("AI_AUTHORITY_DENIED", error instanceof Error ? error.message : String(error));
    }
  }
  if (input.aiClaimedConformance) {
    try {
      denyAiConformanceClaim();
    } catch (error) {
      return fail("AI_AUTHORITY_DENIED", error instanceof Error ? error.message : String(error));
    }
  }
  try {
    assertEurocodeRuleAuthority(input.ruleAuthorityType);
  } catch (error) {
    return fail("RULE_AUTHORITY_DENIED", error instanceof Error ? error.message : String(error));
  }

  let requestedPart: ReturnType<typeof resolveEurocodePart>;
  try {
    requestedPart = resolveEurocodePart(input.requestedPartId);
  } catch (error) {
    return fail("STANDARD_PART_UNSUPPORTED", error instanceof Error ? error.message : String(error));
  }

  if (input.issuedContext) {
    const issued = snapshotIssuedEurocodeContext(input.issuedContext);
    unknownEditionBlocksConformance(issued);
    return { ok: true, context: issued, failReason: null };
  }

  let candidate: EurocodeSteelDesignContext | null = input.explicitCalculationContext;
  if (!candidate && input.projectContext) {
    projectContextDoesNotForceWorkspaceAnnex(input.projectContext);
    if (!input.projectContext.countryCode) {
      return fail("NATIONAL_ANNEX_REQUIRED", "project country is required before a National Annex can be bound");
    }
    candidate = contextFromProject(input.projectContext, input);
  }
  if (!candidate) {
    return fail("STANDARD_PART_UNSUPPORTED", "governed Eurocode steel context requires an explicit or project profile");
  }

  try {
    const part = requestedPart;
    if (candidate.standardPart !== part.partId) {
      return fail("STANDARD_PART_UNSUPPORTED", `requested part ${input.requestedPartId} is not the bound part ${candidate.standardPart}`);
    }
    candidate = {
      ...candidate,
      version: {
        ...candidate.version,
        edition: assertEditionExplicitOrUnknown(candidate.version.edition),
      },
    };
    assertCountryAndStandardSeparate(candidate.countryCode, candidate.standardCode);
    assertNoDefaultNationalAnnex(candidate.nationalAnnex);
    assertNdpNotFromAi(candidate.ndpSet);
    assertEurocodeContextHasNoPii(candidate);
    unknownEditionBlocksConformance(candidate);
    if (candidate.nationalAnnex) {
      assertAnnexCompatibleWithContext(candidate, candidate.nationalAnnex);
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
    }
    if (input.humanConfirmed) {
      assertHumanEurocodeConfirmation(candidate.humanConfirmation, true);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.startsWith("STANDARD_PART_UNSUPPORTED")) return fail("STANDARD_PART_UNSUPPORTED", message);
    if (message.startsWith("NATIONAL_ANNEX_MISMATCH")) return fail("NATIONAL_ANNEX_MISMATCH", message);
    if (message.startsWith("STANDARD_VERSION_CONFLICT")) return fail("STANDARD_VERSION_CONFLICT", message);
    if (message.startsWith("STANDARD_EDITION_REQUIRED")) return fail("STANDARD_EDITION_REQUIRED", message);
    if (message.startsWith("HUMAN_CONFIRMATION_REQUIRED")) return fail("HUMAN_CONFIRMATION_REQUIRED", message);
    throw error;
  }

  return { ok: true, context: candidate, failReason: null };
}

export function historicalContextRemainsReproducible(
  issued: EurocodeSteelDesignContext,
  laterProject: EurocodeProjectStandardContext,
): EurocodeSteelDesignContext {
  const frozen = snapshotIssuedEurocodeContext(issued);
  if (laterProject.countryCode && laterProject.countryCode !== frozen.countryCode) {
    return frozen;
  }
  return frozen;
}
