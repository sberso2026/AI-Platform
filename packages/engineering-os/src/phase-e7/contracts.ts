/**
 * Phase E7 — Passive Engineering Memory.
 * Reuses Platform Kernel Memory + Knowledge Graph ownership.
 * Engineering OS defines engineering memory contracts/adapters only.
 * No second memory store or KG framework. No hidden CoT persistence.
 */

import {
  E0ForbidsDuplicatePiIiOwnership,
  E0PreservesCertifiedModuleOwnership,
  EngineeringIntelligenceLayerContractLocked,
} from "../phase-e0/contracts";
import {
  PhaseE1DoesNotOwnKgOrMemory,
  PhaseE1DoesNotOwnPiIiAiLogic,
  PhaseE1ExperienceFoundationComplete,
} from "../phase-e1/contracts";
import { PhaseE2GroundedSearchComplete } from "../phase-e2/contracts";
import {
  PhaseE3CanonicalContextComplete,
  PhaseE3NoSecondKnowledgeGraph,
  type EngineeringObjectReference,
} from "../phase-e3/contracts";
import { PhaseE4ConnectorFrameworkComplete } from "../phase-e4/contracts";
import {
  PhaseE5DoesNotOwnToolsOrKgOrMemory,
  PhaseE5ReasoningExplainabilityComplete,
} from "../phase-e5/contracts";
import {
  PhaseE6DoesNotOwnKgOrMemory,
  PhaseE6GovernedToolFrameworkComplete,
} from "../phase-e6/contracts";

export const ENGINEERING_OS_EVOLUTION_PHASE_E7 = "E7" as const;
export const ENGINEERING_OS_EVOLUTION_CONTRACT_VERSION_E7 = "0.1.0-e7" as const;

export const PhaseE7PassiveMemoryComplete = true as const;
export const PhaseE7ReusesPlatformMemory = true as const;
export const PhaseE7ReusesPlatformKg = true as const;
export const PhaseE7NoSecondMemoryStore = true as const;
export const PhaseE7NoSecondKnowledgeGraph = true as const;
export const PhaseE7NoHiddenCotPersistence = true as const;
export const PhaseE7NoUnsupportedAiFactPromotion = true as const;
export const PhaseE7WorkingContextNotAutoOrgKnowledge = true as const;
export const PhaseE7MemoryIsNeverAutomaticAuthority = true as const;
export const PhaseE7DoesNotOwnPiIiAiEngines = true as const;
export const PhaseE7DoesNotOwnToolsOrConnectors = true as const;

export const EngineeringMemoryClasses = [
  "WORKING_CONTEXT",
  "PROJECT_MEMORY",
  "ENGINEERING_KNOWLEDGE",
  "ORGANISATIONAL_KNOWLEDGE",
] as const;
export type EngineeringMemoryClass = (typeof EngineeringMemoryClasses)[number];

export const EngineeringMemoryAuthorityStatuses = [
  "DRAFT",
  "OBSERVED",
  "REVIEWED",
  "APPROVED",
  "SUPERSEDED",
  "REJECTED",
  "UNKNOWN",
] as const;
export type EngineeringMemoryAuthorityStatus =
  (typeof EngineeringMemoryAuthorityStatuses)[number];

export const EngineeringMemoryRetentionActions = [
  "RETAIN",
  "ARCHIVE",
  "DELETE",
  "SOFT_DELETE",
] as const;
export type EngineeringMemoryRetentionAction =
  (typeof EngineeringMemoryRetentionActions)[number];

export const EngineeringMemorySensitivities = [
  "general",
  "sensitive",
  "confidential",
  "public",
] as const;
export type EngineeringMemorySensitivity =
  (typeof EngineeringMemorySensitivities)[number];

export const EngineeringMemorySourceTypes = [
  "decision",
  "technical_query",
  "action",
  "lesson",
  "engineering_conclusion",
  "tool_result",
  "inspection_conclusion",
  "document_relationship",
  "project_outcome",
  "explicit_capture",
] as const;
export type EngineeringMemorySourceType =
  (typeof EngineeringMemorySourceTypes)[number];

export type EngineeringMemoryRetentionPolicy = {
  action: EngineeringMemoryRetentionAction;
  /** ISO timestamp after which action may apply. */
  applyAfter?: string | null;
  /** Hard delete only when policy explicitly permits (audit default: soft). */
  hardDeletePermitted: boolean;
  reason?: string | null;
};

export type EngineeringMemoryAccessMetadata = {
  revoked: boolean;
  sourceAccessRequired: true;
  /** When true, retrieval must verify caller can access source. */
  restricted: boolean;
  authorizedUserIds?: string[];
};

export type EngineeringMemoryProvenance = {
  mechanism: "PASSIVE_CAPTURE" | "PROMOTED" | "EXPLICIT_LESSON" | "TOOL_RESULT";
  platformMemoryOwner: "platform_kernel";
  platformMemoryId: string | null;
  llmGenerated: false;
  containsCot: false;
  eventType?: string | null;
  /** Deterministic dedupe key from tenant+source+event. */
  captureHash: string;
  originalEvidenceRefs: string[];
};

export type EngineeringMemoryRecord = {
  memoryId: string;
  tenantId: string;
  workspaceId?: string | null;
  projectId?: string | null;
  memoryClass: EngineeringMemoryClass;
  subject: EngineeringObjectReference;
  summary: string;
  fact?: string | null;
  relatedObjects: EngineeringObjectReference[];
  evidenceRefs: string[];
  sourceType: EngineeringMemorySourceType | string;
  sourceId: string;
  authorityStatus: EngineeringMemoryAuthorityStatus;
  provenance: EngineeringMemoryProvenance;
  createdBy: string;
  createdAt: string;
  validFrom?: string | null;
  supersededBy?: string | null;
  retentionPolicy?: EngineeringMemoryRetentionPolicy | null;
  sensitivity: EngineeringMemorySensitivity;
  access: EngineeringMemoryAccessMetadata;
};

export type EngineeringMemoryCaptureCandidate = {
  tenantId: string;
  workspaceId?: string | null;
  projectId?: string | null;
  memoryClass?: EngineeringMemoryClass;
  subject: EngineeringObjectReference;
  summary: string;
  fact?: string | null;
  relatedObjects?: EngineeringObjectReference[];
  evidenceRefs?: string[];
  sourceType: EngineeringMemorySourceType | string;
  sourceId: string;
  authorityStatus: EngineeringMemoryAuthorityStatus;
  eventType?: string | null;
  createdBy: string;
  validFrom?: string | null;
  sensitivity?: EngineeringMemorySensitivity;
  access?: Partial<EngineeringMemoryAccessMetadata>;
  /** Optional E6 tool invocation id when capturing tool results. */
  toolInvocationId?: string | null;
  toolStatus?: string | null;
  toolCertificationPath?: "CERTIFIED" | "VALIDATED" | "EXPERIMENTAL" | "UNCERTIFIED" | null;
};

export type EngineeringMemoryRetrievalQuery = {
  tenantId: string;
  workspaceId?: string | null;
  projectId?: string | null;
  userId: string;
  query?: string | null;
  subjectObjectId?: string | null;
  subjectObjectType?: string | null;
  sourceType?: string | null;
  memoryClasses?: EngineeringMemoryClass[];
  /** Include SUPERSEDED for traceability (default false for "current" presentation). */
  includeSuperseded?: boolean;
  includeDraft?: boolean;
  includeRejected?: boolean;
  /** Caller-authorised source IDs; revoked/unauthorised filtered. */
  authorisedSourceIds?: string[] | null;
  limit?: number;
};

export type EngineeringMemoryHit = {
  record: EngineeringMemoryRecord;
  score: number;
  rankReason: string;
  conflictWithMemoryIds: string[];
  presentedAsCurrent: boolean;
};

export function getPhaseE7Declaration() {
  return {
    evolutionPhase: ENGINEERING_OS_EVOLUTION_PHASE_E7,
    contractVersion: ENGINEERING_OS_EVOLUTION_CONTRACT_VERSION_E7,
    PhaseE7PassiveMemoryComplete,
    PhaseE7ReusesPlatformMemory,
    PhaseE7ReusesPlatformKg,
    PhaseE7NoSecondMemoryStore,
    PhaseE7NoSecondKnowledgeGraph,
    PhaseE7NoHiddenCotPersistence,
    PhaseE7NoUnsupportedAiFactPromotion,
    PhaseE7WorkingContextNotAutoOrgKnowledge,
    PhaseE7MemoryIsNeverAutomaticAuthority,
    PhaseE7DoesNotOwnPiIiAiEngines,
    PhaseE7DoesNotOwnToolsOrConnectors,
    memoryClasses: EngineeringMemoryClasses,
    authorityStatuses: EngineeringMemoryAuthorityStatuses,
    retentionActions: EngineeringMemoryRetentionActions,
    platformMemoryOwner: "platform_kernel" as const,
    platformKgOwner: "platform_kernel" as const,
  } as const;
}

export function assertPhaseE7Invariants(input: {
  ProjectIntelligenceV1Intact: boolean;
  InspectionIntelligenceV1Intact: boolean;
  AssetIntelligenceV1Intact: boolean;
  ProjectControlsV1Intact: boolean;
  DigitalTwinV1Intact: boolean;
  EngineeringModelInteroperabilityV1Intact: boolean;
  privateCrossModuleCouplingDetected: boolean;
  duplicateAssetOwnershipDetected: boolean;
  duplicateKnowledgeGraphDetected: boolean;
  duplicateMemoryFrameworkDetected: boolean;
  EngineeringOSProductBoundaryLocked: boolean;
}): void {
  if (
    !EngineeringIntelligenceLayerContractLocked ||
    !PhaseE1ExperienceFoundationComplete ||
    !PhaseE2GroundedSearchComplete ||
    !PhaseE3CanonicalContextComplete ||
    !PhaseE4ConnectorFrameworkComplete ||
    !PhaseE5ReasoningExplainabilityComplete ||
    !PhaseE6GovernedToolFrameworkComplete
  ) {
    throw new Error("E7 requires E0–E6 contracts locked");
  }
  if (
    !PhaseE7NoSecondMemoryStore ||
    !PhaseE7ReusesPlatformMemory ||
    input.duplicateMemoryFrameworkDetected
  ) {
    throw new Error("E7 must reuse Platform Memory — no second memory framework");
  }
  if (
    !PhaseE7NoSecondKnowledgeGraph ||
    !PhaseE7ReusesPlatformKg ||
    !PhaseE3NoSecondKnowledgeGraph ||
    input.duplicateKnowledgeGraphDetected
  ) {
    throw new Error("E7 must reuse Platform KG — no second KG");
  }
  if (
    !PhaseE7NoHiddenCotPersistence ||
    !PhaseE7NoUnsupportedAiFactPromotion ||
    !PhaseE7WorkingContextNotAutoOrgKnowledge ||
    !PhaseE7MemoryIsNeverAutomaticAuthority
  ) {
    throw new Error("E7 governance invariants failed");
  }
  if (
    !PhaseE5DoesNotOwnToolsOrKgOrMemory ||
    !PhaseE6DoesNotOwnKgOrMemory ||
    !PhaseE1DoesNotOwnKgOrMemory ||
    !PhaseE7DoesNotOwnPiIiAiEngines ||
    !PhaseE1DoesNotOwnPiIiAiLogic
  ) {
    throw new Error("E7 must not own PI/II/AI/KG/Memory infrastructure");
  }
  if (!E0PreservesCertifiedModuleOwnership || !E0ForbidsDuplicatePiIiOwnership) {
    throw new Error("E7 ownership regression");
  }
  if (
    !input.ProjectIntelligenceV1Intact ||
    !input.InspectionIntelligenceV1Intact ||
    !input.AssetIntelligenceV1Intact ||
    !input.ProjectControlsV1Intact ||
    !input.DigitalTwinV1Intact ||
    !input.EngineeringModelInteroperabilityV1Intact
  ) {
    throw new Error("E7 regression: certified modules");
  }
  if (input.privateCrossModuleCouplingDetected || input.duplicateAssetOwnershipDetected) {
    throw new Error("E7 regression: coupling/ownership");
  }
  if (!input.EngineeringOSProductBoundaryLocked) {
    throw new Error("E7 requires product boundary locked");
  }
}

/** Reject unsupported AI conclusions promoted as facts. */
export function rejectUnsupportedAiFactPromotion(): never {
  throw new Error("unsupported_ai_conclusion_cannot_become_memory_fact");
}

/** Reject CoT / private reasoning persistence. */
export function rejectCotPersistence(): never {
  throw new Error("hidden_cot_must_not_be_persisted_in_engineering_memory");
}
