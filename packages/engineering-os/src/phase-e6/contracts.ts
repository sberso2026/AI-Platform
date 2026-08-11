/**
 * Phase E6 — Governed Engineering Tool Framework contracts.
 * Platform Tool Registry remains ownership; Engineering OS defines engineering
 * capability/tool contracts and adapters only. No second registry.
 */

import {
  E0ForbidsDuplicatePiIiOwnership,
  E0PreservesCertifiedModuleOwnership,
  EngineeringIntelligenceLayerContractLocked,
} from "../phase-e0/contracts";
import {
  PhaseE1DoesNotOwnKgOrMemory,
  PhaseE1DoesNotOwnPiIiAiLogic,
  PhaseE1DoesNotOwnToolExecution,
  PhaseE1ExperienceFoundationComplete,
} from "../phase-e1/contracts";
import { PhaseE2GroundedSearchComplete } from "../phase-e2/contracts";
import { PhaseE3CanonicalContextComplete } from "../phase-e3/contracts";
import { PhaseE4ConnectorFrameworkComplete } from "../phase-e4/contracts";
import {
  PhaseE5DoesNotOwnToolsOrKgOrMemory,
  PhaseE5ReasoningExplainabilityComplete,
} from "../phase-e5/contracts";

export const ENGINEERING_OS_EVOLUTION_PHASE_E6 = "E6" as const;
export const ENGINEERING_OS_EVOLUTION_CONTRACT_VERSION_E6 = "0.1.0-e6" as const;

export const PhaseE6GovernedToolFrameworkComplete = true as const;
export const PhaseE6ReusesPlatformToolRegistry = true as const;
export const PhaseE6NoSecondToolRegistry = true as const;
export const PhaseE6LlmCannotImpersonateToolExecution = true as const;
export const PhaseE6NoAutonomousEngineeringApproval = true as const;
export const PhaseE6UncertifiedBlockedFromCertifiedPath = true as const;
export const PhaseE6UnitsRequiredWhereApplicable = true as const;
export const PhaseE6DoesNotOwnPiIiAiEngines = true as const;
export const PhaseE6DoesNotOwnKgOrMemory = true as const;
export const PhaseE6DoesNotOwnConnectors = true as const;

export const EngineeringToolTypes = [
  "DETERMINISTIC_CALCULATION",
  "RETRIEVAL",
  "RULE_CHECK",
  "ANALYTICAL_MODEL",
  "AI_ML_MODEL",
  "QUERY",
  "ESTIMATOR",
  "COMPARATOR",
] as const;
export type EngineeringToolType = (typeof EngineeringToolTypes)[number];

export const EngineeringToolStatuses = [
  "AVAILABLE",
  "UNAVAILABLE",
  "DISABLED",
  "DEPRECATED",
  "UNCERTIFIED",
] as const;
export type EngineeringToolStatus = (typeof EngineeringToolStatuses)[number];

export const EngineeringToolCertifications = [
  "CERTIFIED",
  "VALIDATED",
  "EXPERIMENTAL",
  "UNCERTIFIED",
] as const;
export type EngineeringToolCertification =
  (typeof EngineeringToolCertifications)[number];

export const EngineeringToolOutputKinds = [
  "CALCULATED",
  "CHECKED",
  "ESTIMATED",
  "PREDICTED",
  "RETRIEVED",
  "FAILED",
  "INCOMPLETE",
] as const;
export type EngineeringToolOutputKind = (typeof EngineeringToolOutputKinds)[number];

export const EngineeringToolAuthorityStatuses = [
  "ADVISORY",
  "REQUIRES_HUMAN_REVIEW",
  "BLOCKED",
  "FAILED",
] as const;
export type EngineeringToolAuthorityStatus =
  (typeof EngineeringToolAuthorityStatuses)[number];

export const EngineeringToolFailurePolicies = [
  "FAIL_CLOSED",
  "REQUEST_INPUT",
  "REPORT_UNAVAILABLE",
] as const;
export type EngineeringToolFailurePolicy =
  (typeof EngineeringToolFailurePolicies)[number];

export type EngineeringToolSchema = {
  type: "object";
  required?: string[];
  properties: Record<
    string,
    {
      type: string;
      description?: string;
      unitRequired?: boolean;
      enum?: string[];
    }
  >;
};

export type EngineeringTool = {
  toolId: string;
  name: string;
  capability: string;
  discipline?: string | null;
  toolType: EngineeringToolType;
  inputSchema: EngineeringToolSchema;
  outputSchema: EngineeringToolSchema;
  version: string;
  owner: "platform_intelligence" | "engineering_os_adapter" | string;
  /** Platform registry ownership reference — never a second registry. */
  platformRegistryRef: "platform-intelligence:ai_tools";
  status: EngineeringToolStatus;
  authorityClass: "ADVISORY" | "GOVERNED_CALCULATION" | "EXPERIMENTAL";
  permissions: string[];
  executionMode: "IN_PROCESS" | "SANDBOX" | "EXTERNAL_HOST" | "UNAVAILABLE";
  timeoutMs: number;
  certification: EngineeringToolCertification;
  applicableCodes?: string[];
  evidenceRequirements?: string[];
  failurePolicy: EngineeringToolFailurePolicy;
  /** Capability catalog only — not an executable implementation. */
  capabilityOnly?: boolean;
};

export type EngineeringToolInvocationRequest = {
  tenantId: string;
  workspaceId?: string | null;
  userId: string;
  toolId: string;
  inputs: Record<string, unknown>;
  /** Units keyed by input field name where applicable. */
  units?: Record<string, string>;
  intent?: string;
  requireCertifiedPath?: boolean;
  permissions?: string[];
  agentId?: string | null;
  evidenceRefs?: string[];
  timeoutMs?: number;
};

export type EngineeringToolResult = {
  invocationId: string;
  toolId: string;
  toolVersion: string;
  inputs: Record<string, unknown>;
  units?: Record<string, string>;
  assumptions: string[];
  output: Record<string, unknown> | null;
  outputKind: EngineeringToolOutputKind;
  status: "SUCCESS" | "FAILED" | "INCOMPLETE" | "BLOCKED" | "TIMEOUT";
  applicableRuleRefs: string[];
  evidenceRefs: string[];
  provenance: {
    mechanism: "GOVERNED_TOOL";
    toolId: string;
    toolVersion: string;
    executor: "engineering_os_e6";
    platformRegistryOwner: "platform_intelligence";
    llmGenerated: false;
    inputHash: string;
    outputHash: string | null;
  };
  executedAt: string;
  durationMs: number;
  limitations: string[];
  warnings: string[];
  authorityStatus: EngineeringToolAuthorityStatus;
  reviewRequired: true;
  /** Immutable snapshot — callers must not mutate. */
  immutable: true;
};

export type EngineeringToolDiscoveryRequest = {
  tenantId: string;
  workspaceId?: string | null;
  userId: string;
  intent?: string | null;
  capability?: string | null;
  permissions?: string[];
  requireCertifiedPath?: boolean;
  discipline?: string | null;
};

export type EngineeringToolCandidate = {
  tool: EngineeringTool;
  eligible: boolean;
  reasons: string[];
};

export function getPhaseE6Declaration() {
  return {
    evolutionPhase: ENGINEERING_OS_EVOLUTION_PHASE_E6,
    contractVersion: ENGINEERING_OS_EVOLUTION_CONTRACT_VERSION_E6,
    PhaseE6GovernedToolFrameworkComplete,
    PhaseE6ReusesPlatformToolRegistry,
    PhaseE6NoSecondToolRegistry,
    PhaseE6LlmCannotImpersonateToolExecution,
    PhaseE6NoAutonomousEngineeringApproval,
    PhaseE6UncertifiedBlockedFromCertifiedPath,
    PhaseE6UnitsRequiredWhereApplicable,
    PhaseE6DoesNotOwnPiIiAiEngines,
    PhaseE6DoesNotOwnKgOrMemory,
    PhaseE6DoesNotOwnConnectors,
    toolTypes: EngineeringToolTypes,
    statuses: EngineeringToolStatuses,
    certifications: EngineeringToolCertifications,
    outputKinds: EngineeringToolOutputKinds,
    platformRegistryOwner: "platform_intelligence" as const,
  } as const;
}

export function assertPhaseE6Invariants(input: {
  ProjectIntelligenceV1Intact: boolean;
  InspectionIntelligenceV1Intact: boolean;
  AssetIntelligenceV1Intact: boolean;
  ProjectControlsV1Intact: boolean;
  DigitalTwinV1Intact: boolean;
  EngineeringModelInteroperabilityV1Intact: boolean;
  privateCrossModuleCouplingDetected: boolean;
  duplicateAssetOwnershipDetected: boolean;
  duplicateEngineeringToolFrameworkDetected: boolean;
  EngineeringOSProductBoundaryLocked: boolean;
}): void {
  if (
    !EngineeringIntelligenceLayerContractLocked ||
    !PhaseE1ExperienceFoundationComplete ||
    !PhaseE2GroundedSearchComplete ||
    !PhaseE3CanonicalContextComplete ||
    !PhaseE4ConnectorFrameworkComplete ||
    !PhaseE5ReasoningExplainabilityComplete
  ) {
    throw new Error("E6 requires E0–E5 contracts locked");
  }
  if (
    !PhaseE6NoSecondToolRegistry ||
    !PhaseE6ReusesPlatformToolRegistry ||
    input.duplicateEngineeringToolFrameworkDetected
  ) {
    throw new Error("E6 must reuse Platform Tool Registry — no second registry");
  }
  if (
    !PhaseE5DoesNotOwnToolsOrKgOrMemory ||
    !PhaseE1DoesNotOwnToolExecution ||
    !PhaseE6LlmCannotImpersonateToolExecution
  ) {
    throw new Error("E6 tool ownership / LLM impersonation invariants failed");
  }
  if (
    !PhaseE6DoesNotOwnPiIiAiEngines ||
    !PhaseE1DoesNotOwnPiIiAiLogic ||
    !PhaseE6DoesNotOwnKgOrMemory ||
    !PhaseE1DoesNotOwnKgOrMemory
  ) {
    throw new Error("E6 must not own PI/II/AI/KG/Memory");
  }
  if (!E0PreservesCertifiedModuleOwnership || !E0ForbidsDuplicatePiIiOwnership) {
    throw new Error("E6 ownership regression");
  }
  if (
    !input.ProjectIntelligenceV1Intact ||
    !input.InspectionIntelligenceV1Intact ||
    !input.AssetIntelligenceV1Intact ||
    !input.ProjectControlsV1Intact ||
    !input.DigitalTwinV1Intact ||
    !input.EngineeringModelInteroperabilityV1Intact
  ) {
    throw new Error("E6 regression: certified modules");
  }
  if (input.privateCrossModuleCouplingDetected || input.duplicateAssetOwnershipDetected) {
    throw new Error("E6 regression: coupling/ownership");
  }
  if (!input.EngineeringOSProductBoundaryLocked) {
    throw new Error("E6 requires product boundary locked");
  }
  if (!PhaseE6NoAutonomousEngineeringApproval || !PhaseE6UncertifiedBlockedFromCertifiedPath) {
    throw new Error("E6 governance invariants failed");
  }
}

/** LLM must never mint tool results. */
export function rejectLlmFabricatedToolResult(): never {
  throw new Error("llm_cannot_fabricate_engineering_tool_result");
}
