/**
 * Phase E9 — Unified Engineering Intelligence Integration.
 * Routes Ask/context to certified PI/AI/II/PC (etc.) public contracts.
 * Does not rebuild, fork, or re-own those engines. No second intelligence registry.
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
import { PhaseE4ConnectorFrameworkComplete } from "../phase-e4/contracts";
import { PhaseE5ReasoningExplainabilityComplete } from "../phase-e5/contracts";
import { PhaseE6GovernedToolFrameworkComplete } from "../phase-e6/contracts";
import { PhaseE7PassiveMemoryComplete } from "../phase-e7/contracts";
import { PhaseE8ActionWorkflowOrchestrationComplete } from "../phase-e8/contracts";

export const ENGINEERING_OS_EVOLUTION_PHASE_E9 = "E9" as const;
export const ENGINEERING_OS_EVOLUTION_CONTRACT_VERSION_E9 = "0.1.0-e9" as const;

export const PhaseE9UnifiedIntelligenceComplete = true as const;
export const PhaseE9ReusesCertifiedEnginesOnly = true as const;
export const PhaseE9NoSecondIntelligenceRegistry = true as const;
export const PhaseE9NoEngineOwnershipDuplication = true as const;
export const PhaseE9NoFabricatedIntelligence = true as const;
export const PhaseE9IntelligenceIsNotApproval = true as const;
export const PhaseE9DoesNotOwnPiIiAiEngines = true as const;
export const PhaseE9DoesNotOwnKgOrMemoryOrTools = true as const;

export const EngineeringIntelligenceOwners = [
  "project_intelligence",
  "asset_intelligence",
  "inspection_intelligence",
  "project_controls",
  "digital_twin",
  "platform_intelligence",
  "engineering_os_composition",
] as const;
export type EngineeringIntelligenceOwner =
  (typeof EngineeringIntelligenceOwners)[number];

export const EngineeringIntelligenceAuthorityClasses = [
  "ADVISORY",
  "REQUIRES_HUMAN_REVIEW",
  "ASSURANCE_FINDING",
  "PREDICTION",
  "SCENARIO",
  "RISK_SIGNAL",
] as const;
export type EngineeringIntelligenceAuthorityClass =
  (typeof EngineeringIntelligenceAuthorityClasses)[number];

export const EngineeringIntelligenceAvailability = [
  "AVAILABLE",
  "UNAVAILABLE",
  "ENTITLEMENT_REQUIRED",
  "MISSING_INPUT",
  "STALE",
  "ERROR",
  "BLOCKED_OWNERSHIP_MISMATCH",
] as const;
export type EngineeringIntelligenceAvailability =
  (typeof EngineeringIntelligenceAvailability)[number];

export const EngineeringIntelligenceIntents = [
  "what_changed",
  "what_requires_attention",
  "why",
  "what_is_predicted",
  "what_are_the_options",
  "what_happens_if",
  "what_evidence_supports",
  "what_is_uncertain",
  "what_needs_human_review",
] as const;
export type EngineeringIntelligenceIntent =
  (typeof EngineeringIntelligenceIntents)[number];

export type EngineeringIntelligenceCapability = {
  capabilityId: string;
  name: string;
  owner: EngineeringIntelligenceOwner;
  /** Owner package public contract version / capability version string. */
  version: string;
  supportedObjectTypes: string[];
  supportedIntents: EngineeringIntelligenceIntent[];
  authorityClass: EngineeringIntelligenceAuthorityClass;
  inputContract: {
    required: string[];
    optional?: string[];
  };
  outputContract: {
    resultShape: string;
    mayIncludeConfidence: boolean;
  };
  availability: Extract<
    EngineeringIntelligenceAvailability,
    "AVAILABLE" | "UNAVAILABLE" | "ENTITLEMENT_REQUIRED"
  >;
  entitlementKey: string;
  provenanceRequirements: string[];
  /** User-facing catalog concept (Projects, Assets, …). */
  userConcept:
    | "Projects"
    | "Assets"
    | "Inspections"
    | "Decisions"
    | "Risks"
    | "Assurance"
    | "Explainability"
    | "Scenarios";
  href?: string | null;
  /** When true, capability is catalog-only — never invent invocation. */
  capabilityOnly?: boolean;
  /** Platform capability registry key when applicable (reuse, not duplicate). */
  platformCapabilityKey?: string | null;
};

export type EngineeringIntelligenceResultEnvelope = {
  capabilityId: string;
  version: string;
  owner: EngineeringIntelligenceOwner;
  result: Record<string, unknown>;
  evidenceRefs: string[];
  authorityStatus: EngineeringIntelligenceAuthorityClass;
  /** Only when source engine supports confidence — never invented numeric certainty. */
  confidence?: number | null;
  uncertaintyNotes?: string[];
  limitations: string[];
  reviewRequired: true;
  provenance: {
    engine: string;
    capabilityId: string;
    version: string;
    owner: EngineeringIntelligenceOwner;
    sourceEvidenceRefs: string[];
    assumptions: string[];
    advisory: true;
    intelligenceIsNotApproval: true;
    predictionIsNotFact: true;
    scenarioIsNotForecastAuthority: true;
    riskSignalIsNotAcceptedRisk: true;
    assuranceFindingIsNotSignOff: true;
  };
  generatedAt: string;
  freshness: "CURRENT" | "STALE" | "UNKNOWN";
  timingMs?: { routeMs?: number; invokeMs?: number; totalMs?: number };
};

export type EngineeringIntelligenceRouteRequest = {
  tenantId: string;
  workspaceId?: string | null;
  userId: string;
  query: string;
  intent?: EngineeringIntelligenceIntent | null;
  objectType?: string | null;
  objectId?: string | null;
  projectId?: string | null;
  entitledKeys?: string[];
  providedInputs?: Record<string, unknown>;
  maxCapabilities?: number;
};

export type EngineeringIntelligenceRouteResult = {
  selected: EngineeringIntelligenceCapability[];
  reasonCode:
    | "MATCHED"
    | "UNSUPPORTED_INTENT"
    | "NO_ENTITLEMENT"
    | "MISSING_INPUT"
    | "UNAVAILABLE"
    | "NO_APPLICABLE_CAPABILITY";
  requiredInputs: string[];
  missingInputs: string[];
  unavailable: Array<{ capabilityId: string; reason: string }>;
  timingMs: { routeMs: number };
};

export function getPhaseE9Declaration() {
  return {
    evolutionPhase: ENGINEERING_OS_EVOLUTION_PHASE_E9,
    contractVersion: ENGINEERING_OS_EVOLUTION_CONTRACT_VERSION_E9,
    PhaseE9UnifiedIntelligenceComplete,
    PhaseE9ReusesCertifiedEnginesOnly,
    PhaseE9NoSecondIntelligenceRegistry,
    PhaseE9NoEngineOwnershipDuplication,
    PhaseE9NoFabricatedIntelligence,
    PhaseE9IntelligenceIsNotApproval,
    PhaseE9DoesNotOwnPiIiAiEngines,
    PhaseE9DoesNotOwnKgOrMemoryOrTools,
    intents: EngineeringIntelligenceIntents,
    owners: EngineeringIntelligenceOwners,
    platformCapabilityRegistryOwner: "platform_intelligence" as const,
    implementsOwnAiStack: false as const,
  } as const;
}

export function assertPhaseE9Invariants(input: {
  ProjectIntelligenceV1Intact: boolean;
  InspectionIntelligenceV1Intact: boolean;
  AssetIntelligenceV1Intact: boolean;
  ProjectControlsV1Intact: boolean;
  DigitalTwinV1Intact: boolean;
  EngineeringModelInteroperabilityV1Intact: boolean;
  privateCrossModuleCouplingDetected: boolean;
  duplicateAssetOwnershipDetected: boolean;
  implementsOwnAiStack: boolean;
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
    !PhaseE7PassiveMemoryComplete ||
    !PhaseE8ActionWorkflowOrchestrationComplete
  ) {
    throw new Error("E9 requires E0–E8 contracts locked");
  }
  if (
    !PhaseE9NoSecondIntelligenceRegistry ||
    !PhaseE9ReusesCertifiedEnginesOnly ||
    !PhaseE9NoEngineOwnershipDuplication
  ) {
    throw new Error("E9 must reuse certified engines — no duplicate ownership/registry");
  }
  if (input.implementsOwnAiStack) {
    throw new Error("E9 must not implement own AI stack");
  }
  if (
    !PhaseE9NoFabricatedIntelligence ||
    !PhaseE9IntelligenceIsNotApproval ||
    !PhaseE9DoesNotOwnPiIiAiEngines ||
    !PhaseE1DoesNotOwnPiIiAiLogic ||
    !PhaseE9DoesNotOwnKgOrMemoryOrTools ||
    !PhaseE1DoesNotOwnKgOrMemory
  ) {
    throw new Error("E9 governance / ownership invariants failed");
  }
  if (!E0PreservesCertifiedModuleOwnership || !E0ForbidsDuplicatePiIiOwnership) {
    throw new Error("E9 ownership regression");
  }
  if (
    !input.ProjectIntelligenceV1Intact ||
    !input.InspectionIntelligenceV1Intact ||
    !input.AssetIntelligenceV1Intact ||
    !input.ProjectControlsV1Intact ||
    !input.DigitalTwinV1Intact ||
    !input.EngineeringModelInteroperabilityV1Intact
  ) {
    throw new Error("E9 regression: certified modules");
  }
  if (input.privateCrossModuleCouplingDetected || input.duplicateAssetOwnershipDetected) {
    throw new Error("E9 regression: coupling/ownership");
  }
  if (!input.EngineeringOSProductBoundaryLocked) {
    throw new Error("E9 requires product boundary locked");
  }
}

export function rejectFabricatedIntelligence(): never {
  throw new Error("intelligence_result_must_not_be_fabricated");
}
