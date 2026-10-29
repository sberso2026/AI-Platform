/**
 * Phase E11 — Evaluation, Performance & Engineer Adoption.
 * Product/evaluation gates before production certification.
 * Does not add major architecture; reuses E0–E10 contracts.
 * Benchmark results ≠ real-user / commercial ROI claims.
 */

import {
  E0ForbidsDuplicatePiIiOwnership,
  E0PreservesCertifiedModuleOwnership,
  EngineeringIntelligenceLayerContractLocked,
  supportsZeroConnectorNativeDeployment,
} from "../phase-e0/contracts";
import { PhaseE1ExperienceFoundationComplete } from "../phase-e1/contracts";
import { PhaseE2GroundedSearchComplete } from "../phase-e2/contracts";
import { PhaseE3CanonicalContextComplete } from "../phase-e3/contracts";
import { PhaseE4ConnectorFrameworkComplete } from "../phase-e4/contracts";
import { PhaseE5ReasoningExplainabilityComplete } from "../phase-e5/contracts";
import { PhaseE6GovernedToolFrameworkComplete } from "../phase-e6/contracts";
import { PhaseE7PassiveMemoryComplete } from "../phase-e7/contracts";
import { PhaseE8ActionWorkflowOrchestrationComplete } from "../phase-e8/contracts";
import { PhaseE9UnifiedIntelligenceComplete } from "../phase-e9/contracts";
import {
  PhaseE10DeploymentProfilesComplete,
  PhaseE10EssentialZeroConnectorIndependent,
  PhaseE10ProfileIsNotAuthorization,
} from "../phase-e10/contracts";

export const ENGINEERING_OS_EVOLUTION_PHASE_E11 = "E11" as const;
export const ENGINEERING_OS_EVOLUTION_CONTRACT_VERSION_E11 = "0.1.0-e11" as const;

export const PhaseE11EvaluationFrameworkComplete = true as const;
export const PhaseE11BenchmarkDeterministic = true as const;
export const PhaseE11NoUnsupportedProductivityClaims = true as const;
export const PhaseE11BenchmarkIsNotRealUserKpi = true as const;
export const PhaseE11NoHiddenCotInTelemetry = true as const;
export const PhaseE11AdversarialFailClosed = true as const;
export const PhaseE11EssentialZeroConnectorPreserved = true as const;
export const PhaseE11DoesNotOwnPiEvalDb = true as const;
export const PhaseE11DoesNotAddMajorArchitecture = true as const;

/** Metric provenance — never confuse these. */
export const EngineeringMetricKinds = [
  "SYSTEM_METRIC",
  "BENCHMARK_METRIC",
  "REAL_USER_METRIC",
] as const;
export type EngineeringMetricKind = (typeof EngineeringMetricKinds)[number];

export const EngineeringReportDataStatuses = [
  "BENCHMARK",
  "LIVE",
  "NOT_ENOUGH_DATA",
] as const;
export type EngineeringReportDataStatus =
  (typeof EngineeringReportDataStatuses)[number];

export const EngineeringEvaluationDomains = [
  "retrieval",
  "reasoning",
  "tools",
  "memory",
  "actions",
  "intelligence",
] as const;
export type EngineeringEvaluationDomain =
  (typeof EngineeringEvaluationDomains)[number];

export const EngineeringRetrievalCriteria = [
  "relevance",
  "citation_correctness",
  "revision_correctness",
  "scope_context_correctness",
  "permission_correctness",
  "abstention_correctness",
] as const;

export const EngineeringReasoningCriteria = [
  "evidence_grounding",
  "fact_inference_assumption_separation",
  "conflict_handling",
  "unsupported_claim_rejection",
  "why_provenance",
] as const;

export const EngineeringToolCriteria = [
  "correct_tool_selection",
  "input_unit_validation",
  "certification_enforcement",
  "result_provenance",
  "failure_handling",
] as const;

export const EngineeringMemoryCriteria = [
  "precedent_relevance",
  "authority_supersession",
  "source_provenance",
  "restricted_source_exclusion",
] as const;

export const EngineeringActionCriteria = [
  "correct_prefill",
  "human_approval",
  "idempotency",
  "audit",
  "false_completion_prevention",
] as const;

export const EngineeringIntelligenceCriteria = [
  "correct_capability_routing",
  "entitlement",
  "provenance",
  "authority_semantics",
  "fallback",
] as const;

export type EngineeringCriterionResult = {
  criterion: string;
  domain: EngineeringEvaluationDomain;
  passed: boolean;
  detail: string;
};

export type EngineeringOSEvaluationResult = {
  runId: string;
  deterministic: true;
  metricKind: "BENCHMARK_METRIC";
  disclaimer: "Synthetic/seeded benchmark results — not real client productivity or accuracy evidence.";
  domains: Record<
    EngineeringEvaluationDomain,
    { passed: boolean; criteria: EngineeringCriterionResult[] }
  >;
  overallPassed: boolean;
};

export function getPhaseE11Declaration() {
  return {
    evolutionPhase: ENGINEERING_OS_EVOLUTION_PHASE_E11,
    contractVersion: ENGINEERING_OS_EVOLUTION_CONTRACT_VERSION_E11,
    PhaseE11EvaluationFrameworkComplete,
    PhaseE11BenchmarkDeterministic,
    PhaseE11NoUnsupportedProductivityClaims,
    PhaseE11BenchmarkIsNotRealUserKpi,
    PhaseE11NoHiddenCotInTelemetry,
    PhaseE11AdversarialFailClosed,
    PhaseE11EssentialZeroConnectorPreserved,
    PhaseE11DoesNotOwnPiEvalDb,
    PhaseE11DoesNotAddMajorArchitecture,
    principle:
      "Engineering OS succeeds only if it reduces engineering effort while preserving evidence, authority and trust.",
    metricKinds: EngineeringMetricKinds,
    reportDataStatuses: EngineeringReportDataStatuses,
    evaluationDomains: EngineeringEvaluationDomains,
    /** Platform Intelligence owns durable eval DB; EOS E11 owns product gates/benchmarks. */
    platformEvalOwnership: "platform_intelligence" as const,
  } as const;
}

export function assertPhaseE11Invariants(input: {
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
    !PhaseE4ConnectorFrameworkComplete ||
    !PhaseE5ReasoningExplainabilityComplete ||
    !PhaseE6GovernedToolFrameworkComplete ||
    !PhaseE7PassiveMemoryComplete ||
    !PhaseE8ActionWorkflowOrchestrationComplete ||
    !PhaseE9UnifiedIntelligenceComplete ||
    !PhaseE10DeploymentProfilesComplete
  ) {
    throw new Error("E11 requires E0–E10 contracts locked");
  }
  if (
    !PhaseE10EssentialZeroConnectorIndependent ||
    !PhaseE11EssentialZeroConnectorPreserved ||
    !supportsZeroConnectorNativeDeployment
  ) {
    throw new Error("E11 must preserve ESSENTIAL zero-connector independence");
  }
  if (!PhaseE10ProfileIsNotAuthorization) {
    throw new Error("E11 must preserve profile ≠ authorization");
  }
  if (
    !PhaseE11EvaluationFrameworkComplete ||
    !PhaseE11BenchmarkDeterministic ||
    !PhaseE11NoUnsupportedProductivityClaims ||
    !PhaseE11BenchmarkIsNotRealUserKpi ||
    !PhaseE11NoHiddenCotInTelemetry ||
    !PhaseE11AdversarialFailClosed ||
    !PhaseE11DoesNotOwnPiEvalDb ||
    !PhaseE11DoesNotAddMajorArchitecture
  ) {
    throw new Error("E11 evaluation invariants failed");
  }
  if (!E0PreservesCertifiedModuleOwnership || !E0ForbidsDuplicatePiIiOwnership) {
    throw new Error("E11 ownership regression");
  }
  if (
    !input.ProjectIntelligenceV1Intact ||
    !input.InspectionIntelligenceV1Intact ||
    !input.AssetIntelligenceV1Intact ||
    !input.ProjectControlsV1Intact ||
    !input.DigitalTwinV1Intact ||
    !input.EngineeringModelInteroperabilityV1Intact
  ) {
    throw new Error("E11 regression: certified modules");
  }
  if (input.privateCrossModuleCouplingDetected || input.duplicateAssetOwnershipDetected) {
    throw new Error("E11 regression: coupling/ownership");
  }
  if (!input.EngineeringOSProductBoundaryLocked) {
    throw new Error("E11 requires product boundary locked");
  }
}
