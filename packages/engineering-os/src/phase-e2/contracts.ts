/**
 * Phase E2 — Native Engineering Knowledge & Grounded Search contracts.
 * Experience/Ask composes retrieval; does not own PI/II/AI engines or KG/Memory.
 */

import {
  E0ForbidsDuplicatePiIiOwnership,
  E0ForbidsForcedExternalDependency,
  E0PreservesCertifiedModuleOwnership,
  EngineeringIntelligenceLayerContractLocked,
  NativeAiSearchWithoutEnterpriseAiRequired,
  NeverFabricateMissingEvidence,
  NoMandatorySapM365CopilotDependency,
  supportsZeroConnectorNativeDeployment,
} from "../phase-e0/contracts";
import {
  PhaseE1DoesNotOwnDomainLogic,
  PhaseE1DoesNotOwnPiIiAiLogic,
  PhaseE1ExperienceFoundationComplete,
  PhaseE1NoFakeAiResponses,
} from "../phase-e1/contracts";

export const ENGINEERING_OS_EVOLUTION_PHASE_E2 = "E2" as const;
export const ENGINEERING_OS_EVOLUTION_CONTRACT_VERSION_E2 = "0.1.0-e2" as const;

export const PhaseE2GroundedSearchComplete = true as const;
export const PhaseE2NativeZeroConnector = true as const;
export const PhaseE2NoSecondAssistantStack = true as const;
export const PhaseE2ComposesExistingSearch = true as const;
export const PhaseE2DoesNotOwnPiIiAiLogic = true as const;
export const PhaseE2DoesNotOwnKgOrMemory = true as const;
export const PhaseE2DoesNotOwnConnectors = true as const;
export const PhaseE2LexicalAlwaysAvailable = true as const;
export const PhaseE2SemanticOptionalWithLexicalFallback = true as const;
export const PhaseE2AbstentionRequiredWhenInsufficient = true as const;
export const PhaseE2NoFabricatedEvidence = true as const;
export const PhaseE2NoFakeEngineeringApprovals = true as const;

export const EngineeringEvidenceStates = [
  "SUFFICIENT",
  "PARTIAL",
  "INSUFFICIENT",
  "CONFLICTING",
  "UNKNOWN",
] as const;
export type EngineeringEvidenceState = (typeof EngineeringEvidenceStates)[number];

export const EngineeringSearchScopes = [
  "workspace",
  "project",
  "asset",
  "document",
  "object",
] as const;
export type EngineeringSearchScope = (typeof EngineeringSearchScopes)[number];

export const EngineeringRetrievalModes = [
  "lexical",
  "semantic",
  "hybrid",
  "lexical_fallback",
  "retrieval_only",
] as const;
export type EngineeringRetrievalMode = (typeof EngineeringRetrievalModes)[number];

export const EngineeringAuthorityStatuses = [
  "CURRENT",
  "SUPERSEDED",
  "DRAFT",
  "APPROVED",
  "UNKNOWN",
] as const;
export type EngineeringAuthorityStatus = (typeof EngineeringAuthorityStatuses)[number];

export type EngineeringSearchableSourceType =
  | "project"
  | "asset"
  | "document"
  | "decision"
  | "action"
  | "risk"
  | "issue"
  | "technical_query"
  | "lesson"
  | "inspection"
  | "timeline"
  | "activity";

export type EngineeringSearchQuery = {
  tenantId: string;
  workspaceId?: string | null;
  userId: string;
  roleSlug?: string | null;
  projectId?: string | null;
  objectType?: string | null;
  objectId?: string | null;
  query: string;
  scope?: EngineeringSearchScope | null;
  limit?: number;
  /** E3 additive: authorised related object IDs from context resolver (optional). */
  relatedObjectIds?: string[];
  /** E3 additive: preferred relationship types for ranking hints (optional). */
  preferredRelationshipTypes?: string[];
  /** E3 additive: context resolution state when enrichment was attempted. */
  contextState?: string | null;
};

export type EngineeringEvidence = {
  sourceId: string;
  sourceType: EngineeringSearchableSourceType;
  title: string;
  canonicalObjectId: string;
  projectId?: string | null;
  revision?: string | null;
  authorityStatus: EngineeringAuthorityStatus;
  sourceLocation: string;
  excerpt: string;
  retrievalScore?: number;
  provenance: "engineering_os_native" | "connector_external";
  lastUpdated?: string | null;
  permissionsApplied: true | false;
  conflicting?: boolean;
  supersededWarning?: boolean;
  pageStart?: number | null;
  pageEnd?: number | null;
  sectionPath?: string | null;
  documentNumber?: string | null;
  figureLabel?: string | null;
  chunkId?: string | null;
  claimKind?: "DOCUMENT_FACT" | "INFERENCE" | "ASSUMPTION" | "MISSING_EVIDENCE";
};

export type EngineeringGroundedSearchResult = {
  query: string;
  scope: EngineeringSearchScope;
  retrievalMode: EngineeringRetrievalMode;
  evidence: EngineeringEvidence[];
  searchedSourceTypes: EngineeringSearchableSourceType[];
  limitations: string[];
  timingMs: {
    retrievalMs: number;
    semanticAttempted: boolean;
    semanticAvailable: boolean;
  };
  tenantId: string;
  workspaceId?: string | null;
};

export type EngineeringGroundedAnswer = {
  answer: string;
  evidence: EngineeringEvidence[];
  scope: EngineeringSearchScope;
  limitations: string[];
  evidenceState: EngineeringEvidenceState;
  retrievalMode: EngineeringRetrievalMode;
  generatedAt: string;
  generationAvailable: boolean;
  abstained: boolean;
  requiresReview: boolean;
  meta?: Record<string, unknown>;
};

export function resolveSearchScope(input: {
  scope?: EngineeringSearchScope | null;
  projectId?: string | null;
  objectType?: string | null;
  objectId?: string | null;
}): EngineeringSearchScope {
  if (input.scope) return input.scope;
  if (input.objectType === "document" && input.objectId) return "document";
  if (input.objectType === "asset" && input.objectId) return "asset";
  if (input.objectId && input.objectType) return "object";
  if (input.projectId) return "project";
  return "workspace";
}

export function mapDocumentAuthorityStatus(input: {
  status?: string | null;
  revision?: string | null;
  isSuperseded?: boolean;
}): EngineeringAuthorityStatus {
  if (input.isSuperseded) return "SUPERSEDED";
  const status = (input.status ?? "").toLowerCase();
  if (status === "approved" || status === "issued" || status === "current") return "APPROVED";
  if (status === "superseded" || status === "obsolete" || status === "withdrawn") {
    return "SUPERSEDED";
  }
  if (status === "draft" || status === "wip" || status === "in_review") return "DRAFT";
  if (status === "active" || status === "released") return "CURRENT";
  return "UNKNOWN";
}

export function classifyEvidenceState(input: {
  evidence: EngineeringEvidence[];
  unauthorizedExcluded?: number;
}): EngineeringEvidenceState {
  const { evidence } = input;
  if (evidence.length === 0) return "INSUFFICIENT";
  const hasConflict = evidence.some((e) => e.conflicting);
  const hasSuperseded = evidence.some((e) => e.authorityStatus === "SUPERSEDED");
  const approvedOrCurrent = evidence.filter(
    (e) =>
      e.authorityStatus === "APPROVED" ||
      e.authorityStatus === "CURRENT" ||
      e.authorityStatus === "UNKNOWN",
  );
  if (hasConflict) return "CONFLICTING";
  if (approvedOrCurrent.length === 0 && hasSuperseded) return "PARTIAL";
  if (evidence.length < 2 && evidence[0]?.authorityStatus === "DRAFT") return "PARTIAL";
  if (evidence.length >= 1) return "SUFFICIENT";
  return "UNKNOWN";
}

export function getPhaseE2Declaration() {
  return {
    evolutionPhase: ENGINEERING_OS_EVOLUTION_PHASE_E2,
    contractVersion: ENGINEERING_OS_EVOLUTION_CONTRACT_VERSION_E2,
    PhaseE2GroundedSearchComplete,
    PhaseE2NativeZeroConnector,
    PhaseE2NoSecondAssistantStack,
    PhaseE2ComposesExistingSearch,
    PhaseE2DoesNotOwnPiIiAiLogic,
    PhaseE2DoesNotOwnKgOrMemory,
    PhaseE2DoesNotOwnConnectors,
    PhaseE2LexicalAlwaysAvailable,
    PhaseE2SemanticOptionalWithLexicalFallback,
    PhaseE2AbstentionRequiredWhenInsufficient,
    PhaseE2NoFabricatedEvidence,
    PhaseE2NoFakeEngineeringApprovals,
    evidenceStates: EngineeringEvidenceStates,
    searchScopes: EngineeringSearchScopes,
    retrievalModes: EngineeringRetrievalModes,
  } as const;
}

export function assertPhaseE2Invariants(input: {
  ProjectIntelligenceV1Intact: boolean;
  InspectionIntelligenceV1Intact: boolean;
  AssetIntelligenceV1Intact: boolean;
  ProjectControlsV1Intact: boolean;
  DigitalTwinV1Intact: boolean;
  EngineeringModelInteroperabilityV1Intact: boolean;
  privateCrossModuleCouplingDetected: boolean;
  duplicateAssetOwnershipDetected: boolean;
  EngineeringOSProductBoundaryLocked: boolean;
}): void {
  if (!EngineeringIntelligenceLayerContractLocked || !PhaseE1ExperienceFoundationComplete) {
    throw new Error("E2 requires E0/E1 contracts locked");
  }
  if (!E0PreservesCertifiedModuleOwnership || !E0ForbidsDuplicatePiIiOwnership) {
    throw new Error("E2 requires ownership invariants");
  }
  if (!PhaseE1DoesNotOwnDomainLogic || !PhaseE1DoesNotOwnPiIiAiLogic) {
    throw new Error("E2 must not reopen E1 ownership");
  }
  if (!PhaseE2DoesNotOwnPiIiAiLogic || !PhaseE2DoesNotOwnKgOrMemory) {
    throw new Error("E2 must not own PI/II/AI/KG/Memory");
  }
  if (
    !PhaseE2NativeZeroConnector ||
    !supportsZeroConnectorNativeDeployment ||
    !NoMandatorySapM365CopilotDependency ||
    !E0ForbidsForcedExternalDependency
  ) {
    throw new Error("E2 requires zero-connector ESSENTIAL");
  }
  if (
    !PhaseE2NoFabricatedEvidence ||
    !NeverFabricateMissingEvidence ||
    !PhaseE1NoFakeAiResponses ||
    !NativeAiSearchWithoutEnterpriseAiRequired
  ) {
    throw new Error("E2 forbids fabricated evidence/answers");
  }
  if (!input.ProjectIntelligenceV1Intact || !input.InspectionIntelligenceV1Intact) {
    throw new Error("E2 regression: PI/II intact");
  }
  if (
    !input.AssetIntelligenceV1Intact ||
    !input.ProjectControlsV1Intact ||
    !input.DigitalTwinV1Intact ||
    !input.EngineeringModelInteroperabilityV1Intact
  ) {
    throw new Error("E2 regression: certified modules intact");
  }
  if (input.privateCrossModuleCouplingDetected || input.duplicateAssetOwnershipDetected) {
    throw new Error("E2 regression: coupling/duplicate ownership");
  }
  if (!input.EngineeringOSProductBoundaryLocked) {
    throw new Error("E2 requires product boundary locked");
  }
}
