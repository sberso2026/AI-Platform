/**
 * Phase E8 — Engineering Action & Workflow Orchestration.
 * AI proposes → human reviews → existing domain/workflow services execute.
 * Reuses Platform Workflow Engine + Event Bus. No second workflow framework.
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
import { PhaseE3CanonicalContextComplete } from "../phase-e3/contracts";
import {
  PhaseE4ConnectorFrameworkComplete,
  PhaseE4EssentialZeroConnector,
} from "../phase-e4/contracts";
import { PhaseE5ReasoningExplainabilityComplete } from "../phase-e5/contracts";
import { PhaseE6GovernedToolFrameworkComplete } from "../phase-e6/contracts";
import {
  PhaseE7NoSecondMemoryStore,
  PhaseE7PassiveMemoryComplete,
} from "../phase-e7/contracts";

export const ENGINEERING_OS_EVOLUTION_PHASE_E8 = "E8" as const;
export const ENGINEERING_OS_EVOLUTION_CONTRACT_VERSION_E8 = "0.1.0-e8" as const;

export const PhaseE8ActionWorkflowOrchestrationComplete = true as const;
export const PhaseE8ReusesPlatformWorkflowEngine = true as const;
export const PhaseE8NoSecondWorkflowFramework = true as const;
export const PhaseE8NoAutonomousApproval = true as const;
export const PhaseE8ExternalWriteDisabledByDefault = true as const;
export const PhaseE8UsesExistingRegistersOnly = true as const;
export const PhaseE8DoesNotOwnPiIiAiEngines = true as const;
export const PhaseE8DoesNotOwnKgOrMemory = true as const;

export const EngineeringActionTypes = [
  "DRAFT_TQ_RESPONSE",
  "DRAFT_REPORT",
  "CREATE_ACTION",
  "CREATE_DECISION_DRAFT",
  "CREATE_RISK_DRAFT",
  "CREATE_ISSUE_DRAFT",
  "PROPOSE_INTERVENTION",
  "ASSIGN_REVIEW",
  "LINK_EVIDENCE",
  "PREPARE_REGISTER_ENTRY",
  "PREPARE_EXTERNAL_WRITE",
] as const;
export type EngineeringActionType = (typeof EngineeringActionTypes)[number];

export const EngineeringActionProposalStates = [
  "PROPOSED",
  "NEEDS_INPUT",
  "READY_FOR_REVIEW",
  "APPROVED",
  "REJECTED",
  "EXECUTING",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
  "EXPIRED",
] as const;
export type EngineeringActionProposalState =
  (typeof EngineeringActionProposalStates)[number];

export const EngineeringActionAuthorityClasses = [
  "LOW_FRICTION",
  "REVIEW_REQUIRED",
  "APPROVAL_REQUIRED",
  "EXTERNAL_WRITE",
  "SAFETY_CRITICAL",
] as const;
export type EngineeringActionAuthorityClass =
  (typeof EngineeringActionAuthorityClasses)[number];

export const EngineeringActionRiskClasses = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "SAFETY_CRITICAL",
] as const;
export type EngineeringActionRiskClass =
  (typeof EngineeringActionRiskClasses)[number];

export type EngineeringActionSourceContext = {
  tenantId: string;
  workspaceId?: string | null;
  projectId?: string | null;
  objectType?: string | null;
  objectId?: string | null;
  askQuery?: string | null;
  contextResolvedAt?: string | null;
  /** Stale when client contextResolvedAt older than this server snapshot. */
  contextFreshnessToken: string;
};

export type EngineeringActionTargetObject = {
  objectType: string;
  objectId: string;
  tenantId: string;
  projectId?: string | null;
};

export type EngineeringActionProposalProvenance = {
  mechanism: "ASK_PROPOSAL" | "MANUAL" | "TOOL_PREFILL" | "MEMORY_CONTEXT";
  platformWorkflowOwner: "platform_kernel";
  llmGeneratedDraft: boolean;
  autonomousApproval: false;
  payloadHash: string;
  evidenceRefs: string[];
  toolResultRefs: string[];
  memoryRefs: string[];
  reasoningRef?: string | null;
  createdBy: string;
};

export type EngineeringActionProposal = {
  proposalId: string;
  tenantId: string;
  workspaceId?: string | null;
  projectId?: string | null;
  sourceContext: EngineeringActionSourceContext;
  actionType: EngineeringActionType;
  targetObject?: EngineeringActionTargetObject | null;
  proposedPayload: Record<string, unknown>;
  evidenceRefs: string[];
  reasoningRef?: string | null;
  toolResultRefs: string[];
  memoryRefs: string[];
  authorityRequired: EngineeringActionAuthorityClass;
  approvalState: EngineeringActionProposalState;
  riskClass: EngineeringActionRiskClass;
  sensitivityClass: "general" | "sensitive" | "confidential";
  provenance: EngineeringActionProposalProvenance;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  reviewNote?: string | null;
  executionIdempotencyKey?: string | null;
  domainResultId?: string | null;
  domainResultType?: string | null;
  failureReason?: string | null;
  timingMs?: {
    proposalCreateMs?: number;
    reviewLoadMs?: number;
    executionMs?: number;
    workflowEventMs?: number;
  };
  auditTrail: Array<{
    at: string;
    actorId: string;
    action: "create" | "edit" | "approve" | "reject" | "execute" | "fail" | "cancel";
    detail?: string;
  }>;
};

export type CreateEngineeringActionProposalInput = {
  tenantId: string;
  workspaceId?: string | null;
  projectId?: string | null;
  userId: string;
  actionType: EngineeringActionType;
  proposedPayload: Record<string, unknown>;
  sourceContext: Omit<EngineeringActionSourceContext, "contextFreshnessToken"> & {
    contextFreshnessToken?: string;
  };
  targetObject?: EngineeringActionTargetObject | null;
  evidenceRefs?: string[];
  reasoningRef?: string | null;
  toolResultRefs?: string[];
  memoryRefs?: string[];
  authorityRequired?: EngineeringActionAuthorityClass;
  riskClass?: EngineeringActionRiskClass;
  sensitivityClass?: "general" | "sensitive" | "confidential";
  llmGeneratedDraft?: boolean;
  expiresAt?: string | null;
  permissions?: string[];
};

export function defaultAuthorityForAction(
  actionType: EngineeringActionType,
): EngineeringActionAuthorityClass {
  switch (actionType) {
    case "PREPARE_EXTERNAL_WRITE":
      return "EXTERNAL_WRITE";
    case "PROPOSE_INTERVENTION":
      return "SAFETY_CRITICAL";
    case "CREATE_DECISION_DRAFT":
    case "DRAFT_TQ_RESPONSE":
    case "DRAFT_REPORT":
      return "APPROVAL_REQUIRED";
    case "CREATE_RISK_DRAFT":
    case "CREATE_ISSUE_DRAFT":
    case "ASSIGN_REVIEW":
    case "LINK_EVIDENCE":
    case "PREPARE_REGISTER_ENTRY":
      return "REVIEW_REQUIRED";
    case "CREATE_ACTION":
    default:
      return "REVIEW_REQUIRED";
  }
}

export function getPhaseE8Declaration() {
  return {
    evolutionPhase: ENGINEERING_OS_EVOLUTION_PHASE_E8,
    contractVersion: ENGINEERING_OS_EVOLUTION_CONTRACT_VERSION_E8,
    PhaseE8ActionWorkflowOrchestrationComplete,
    PhaseE8ReusesPlatformWorkflowEngine,
    PhaseE8NoSecondWorkflowFramework,
    PhaseE8NoAutonomousApproval,
    PhaseE8ExternalWriteDisabledByDefault,
    PhaseE8UsesExistingRegistersOnly,
    PhaseE8DoesNotOwnPiIiAiEngines,
    PhaseE8DoesNotOwnKgOrMemory,
    actionTypes: EngineeringActionTypes,
    states: EngineeringActionProposalStates,
    authorityClasses: EngineeringActionAuthorityClasses,
    platformWorkflowOwner: "platform_kernel" as const,
    platformEventBusOwner: "platform_kernel" as const,
  } as const;
}

export function assertPhaseE8Invariants(input: {
  ProjectIntelligenceV1Intact: boolean;
  InspectionIntelligenceV1Intact: boolean;
  AssetIntelligenceV1Intact: boolean;
  ProjectControlsV1Intact: boolean;
  DigitalTwinV1Intact: boolean;
  EngineeringModelInteroperabilityV1Intact: boolean;
  privateCrossModuleCouplingDetected: boolean;
  duplicateAssetOwnershipDetected: boolean;
  duplicateWorkflowEngineDetected: boolean;
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
    !PhaseE6GovernedToolFrameworkComplete ||
    !PhaseE7PassiveMemoryComplete
  ) {
    throw new Error("E8 requires E0–E7 contracts locked");
  }
  if (
    !PhaseE8NoSecondWorkflowFramework ||
    !PhaseE8ReusesPlatformWorkflowEngine ||
    input.duplicateWorkflowEngineDetected
  ) {
    throw new Error("E8 must reuse Platform Workflow Engine — no second framework");
  }
  if (!PhaseE8NoAutonomousApproval || !PhaseE8ExternalWriteDisabledByDefault) {
    throw new Error("E8 governance invariants failed");
  }
  if (!PhaseE8UsesExistingRegistersOnly) {
    throw new Error("E8 must use existing registers only");
  }
  if (
    !PhaseE8DoesNotOwnPiIiAiEngines ||
    !PhaseE1DoesNotOwnPiIiAiLogic ||
    !PhaseE8DoesNotOwnKgOrMemory ||
    !PhaseE1DoesNotOwnKgOrMemory ||
    !PhaseE7NoSecondMemoryStore
  ) {
    throw new Error("E8 must not own PI/II/AI/KG/Memory/Workflow infrastructure");
  }
  if (!PhaseE4EssentialZeroConnector) {
    throw new Error("E8 external write must remain governed (E4 essential zero-connector)");
  }
  if (!E0PreservesCertifiedModuleOwnership || !E0ForbidsDuplicatePiIiOwnership) {
    throw new Error("E8 ownership regression");
  }
  if (
    !input.ProjectIntelligenceV1Intact ||
    !input.InspectionIntelligenceV1Intact ||
    !input.AssetIntelligenceV1Intact ||
    !input.ProjectControlsV1Intact ||
    !input.DigitalTwinV1Intact ||
    !input.EngineeringModelInteroperabilityV1Intact
  ) {
    throw new Error("E8 regression: certified modules");
  }
  if (input.privateCrossModuleCouplingDetected || input.duplicateAssetOwnershipDetected) {
    throw new Error("E8 regression: coupling/ownership");
  }
  if (input.duplicateMemoryFrameworkDetected) {
    throw new Error("E8 regression: duplicate memory framework");
  }
  if (!input.EngineeringOSProductBoundaryLocked) {
    throw new Error("E8 requires product boundary locked");
  }
}
