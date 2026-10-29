/**
 * Phase E5 — Engineering Reasoning, Evidence & Explainability.
 * Reuses E2–E4 evidence contracts and PC explainability semantics (no CoT, advisory).
 * Does not own tools, KG, memory, connectors, or intelligence engines.
 */

import {
  E0ForbidsDuplicatePiIiOwnership,
  E0PreservesCertifiedModuleOwnership,
  EngineeringIntelligenceLayerContractLocked,
  NeverFabricateMissingEvidence,
} from "../phase-e0/contracts";
import {
  PhaseE1DoesNotOwnKgOrMemory,
  PhaseE1DoesNotOwnPiIiAiLogic,
  PhaseE1ExperienceFoundationComplete,
  PhaseE1NoFakeAiResponses,
} from "../phase-e1/contracts";
import {
  PhaseE2AbstentionRequiredWhenInsufficient,
  PhaseE2GroundedSearchComplete,
  PhaseE2NoFabricatedEvidence,
  type EngineeringEvidence,
  type EngineeringEvidenceState,
  type EngineeringSearchQuery,
} from "../phase-e2/contracts";
import { PhaseE3CanonicalContextComplete } from "../phase-e3/contracts";
import {
  PhaseE4ConnectorFrameworkComplete,
  PhaseE4EssentialZeroConnector,
} from "../phase-e4/contracts";
import type { EngineeringExperienceContext } from "../phase-e1/contracts";

export const ENGINEERING_OS_EVOLUTION_PHASE_E5 = "E5" as const;
export const ENGINEERING_OS_EVOLUTION_CONTRACT_VERSION_E5 = "0.1.0-e5" as const;

export const PhaseE5ReasoningExplainabilityComplete = true as const;
export const PhaseE5DoesNotOwnToolsOrKgOrMemory = true as const;
export const PhaseE5DoesNotOwnConnectors = true as const;
export const PhaseE5DoesNotOwnPiIiAiEngines = true as const;
export const PhaseE5NoHiddenCotExposure = true as const;
export const PhaseE5AdvisoryUnlessCertifiedGoverned = true as const;
export const PhaseE5FactInferenceAssumptionDistinct = true as const;
export const PhaseE5NoFabricatedAuthority = true as const;
export const PhaseE5ProviderFailureDegradesToE2 = true as const;
export const PhaseE5ReusesExistingExplainabilitySemantics = true as const;

/** Aligns with Project Controls ExplanationReason; E5 adds CONFLICTING. */
export const EngineeringReasoningBasisKinds = [
  "EVIDENCE_BASED",
  "DERIVED",
  "ASSUMED",
  "INSUFFICIENT_EVIDENCE",
  "CONFLICTING",
  "UNKNOWN",
] as const;
export type EngineeringReasoningBasisKind =
  (typeof EngineeringReasoningBasisKinds)[number];

export const EngineeringReasoningModes = [
  "explain",
  "compare",
  "summarise",
  "identify_gaps",
  "derive_supported_conclusion",
  "recommend_next_action",
] as const;
export type EngineeringReasoningMode =
  (typeof EngineeringReasoningModes)[number];

export const EngineeringExplanationStatuses = [
  "supported",
  "partially_supported",
  "unsupported",
  "conflicting",
  "incomplete",
  "unknown",
] as const;
export type EngineeringExplanationStatus =
  (typeof EngineeringExplanationStatuses)[number];

export const EngineeringAuthorityStatusesE5 = [
  "ADVISORY",
  "REQUIRES_HUMAN_REVIEW",
  "ABSTAINED",
  "INSUFFICIENT_AUTHORITY",
] as const;
export type EngineeringAuthorityStatusE5 =
  (typeof EngineeringAuthorityStatusesE5)[number];

export type EngineeringReasoningBasisItem = {
  kind: EngineeringReasoningBasisKind;
  statement: string;
  evidenceIds?: string[];
  /** Never a fabricated standard/calculation claim. */
  ruleOrModelRef?: string | null;
};

export type EngineeringReasoningAssumption = {
  statement: string;
  explicit: true;
  evidenceIds?: string[];
};

export type EngineeringApplicableRuleRef = {
  ruleId: string;
  label: string;
  governed: boolean;
  /** false when no controlled rule engine matched — honest disclosure. */
  applied: boolean;
  note?: string;
};

export type EngineeringRecommendedAction = {
  action: string;
  rationale: string;
  requiresHumanReview: true;
  autonomousApproval: false;
};

export type EngineeringWhyExplanation = {
  finding: string;
  keyEvidence: Array<{
    sourceId: string;
    title: string;
    provenance: EngineeringEvidence["provenance"];
    authorityStatus: string;
  }>;
  ruleOrToolBasis: string[];
  assumptions: string[];
  uncertaintyAndLimitations: string[];
  authorityState: EngineeringAuthorityStatusE5;
  /** Always false — contract invariant. */
  chainOfThoughtExposed: false;
  platformInternalsExposed: false;
};

export type EngineeringReasoningRequest = {
  context?: Partial<EngineeringExperienceContext> | null;
  query: string;
  evidence: EngineeringEvidence[];
  requestedIntent?: EngineeringReasoningMode | null;
  searchQuery?: EngineeringSearchQuery | null;
  /** Optional capability/tool refs — never invents tool execution. */
  applicableCapabilityRefs?: string[];
  applicableToolRefs?: string[];
  /** Optional governed rule refs from existing contracts (not a new rules engine). */
  governedRuleRefs?: EngineeringApplicableRuleRef[];
  maxEvidence?: number;
};

export type EngineeringReasoningResponse = {
  answer: string;
  finding: string;
  basis: EngineeringReasoningBasisItem[];
  evidence: EngineeringEvidence[];
  assumptions: EngineeringReasoningAssumption[];
  limitations: string[];
  applicableRules: EngineeringApplicableRuleRef[];
  recommendedNextActions: EngineeringRecommendedAction[];
  evidenceState: EngineeringEvidenceState;
  explanationStatus: EngineeringExplanationStatus;
  authorityStatus: EngineeringAuthorityStatusE5;
  /** Omitted/null when no valid scoring basis exists. */
  confidence?: number | null;
  mode: EngineeringReasoningMode;
  why: EngineeringWhyExplanation;
  abstained: boolean;
  timingMs: {
    evidenceAssemblyMs: number;
    reasoningMs: number;
    totalMs: number;
  };
  degradedToRetrievalOnly: boolean;
  generatedAt: string;
};

export function getPhaseE5Declaration() {
  return {
    evolutionPhase: ENGINEERING_OS_EVOLUTION_PHASE_E5,
    contractVersion: ENGINEERING_OS_EVOLUTION_CONTRACT_VERSION_E5,
    PhaseE5ReasoningExplainabilityComplete,
    PhaseE5DoesNotOwnToolsOrKgOrMemory,
    PhaseE5DoesNotOwnConnectors,
    PhaseE5DoesNotOwnPiIiAiEngines,
    PhaseE5NoHiddenCotExposure,
    PhaseE5AdvisoryUnlessCertifiedGoverned,
    PhaseE5FactInferenceAssumptionDistinct,
    PhaseE5NoFabricatedAuthority,
    PhaseE5ProviderFailureDegradesToE2,
    PhaseE5ReusesExistingExplainabilitySemantics,
    basisKinds: EngineeringReasoningBasisKinds,
    modes: EngineeringReasoningModes,
    explanationStatuses: EngineeringExplanationStatuses,
    authorityStatuses: EngineeringAuthorityStatusesE5,
  } as const;
}

export function assertPhaseE5Invariants(input: {
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
  if (
    !EngineeringIntelligenceLayerContractLocked ||
    !PhaseE1ExperienceFoundationComplete ||
    !PhaseE2GroundedSearchComplete ||
    !PhaseE3CanonicalContextComplete ||
    !PhaseE4ConnectorFrameworkComplete
  ) {
    throw new Error("E5 requires E0–E4 contracts locked");
  }
  if (
    !PhaseE5DoesNotOwnToolsOrKgOrMemory ||
    !PhaseE1DoesNotOwnKgOrMemory ||
    !PhaseE5DoesNotOwnPiIiAiEngines ||
    !PhaseE1DoesNotOwnPiIiAiLogic
  ) {
    throw new Error("E5 must not own tools/KG/Memory/PI/II engines");
  }
  if (!PhaseE5DoesNotOwnConnectors || !PhaseE4EssentialZeroConnector) {
    throw new Error("E5 must not own connectors; ESSENTIAL zero-connector preserved");
  }
  if (
    !PhaseE5NoHiddenCotExposure ||
    !PhaseE5FactInferenceAssumptionDistinct ||
    !PhaseE5NoFabricatedAuthority ||
    !PhaseE1NoFakeAiResponses
  ) {
    throw new Error("E5 explainability/authority invariants failed");
  }
  if (
    !PhaseE2NoFabricatedEvidence ||
    !NeverFabricateMissingEvidence ||
    !PhaseE2AbstentionRequiredWhenInsufficient
  ) {
    throw new Error("E5 must preserve E2 abstention/no-fabrication");
  }
  if (!E0PreservesCertifiedModuleOwnership || !E0ForbidsDuplicatePiIiOwnership) {
    throw new Error("E5 ownership regression");
  }
  if (
    !input.ProjectIntelligenceV1Intact ||
    !input.InspectionIntelligenceV1Intact ||
    !input.AssetIntelligenceV1Intact ||
    !input.ProjectControlsV1Intact ||
    !input.DigitalTwinV1Intact ||
    !input.EngineeringModelInteroperabilityV1Intact
  ) {
    throw new Error("E5 regression: certified modules");
  }
  if (input.privateCrossModuleCouplingDetected || input.duplicateAssetOwnershipDetected) {
    throw new Error("E5 regression: coupling/ownership");
  }
  if (!input.EngineeringOSProductBoundaryLocked) {
    throw new Error("E5 requires product boundary locked");
  }
}
