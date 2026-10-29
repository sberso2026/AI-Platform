/**
 * Phase E12 — Production Architecture & Product Certification.
 * Certification/hardening only — not a feature phase.
 * Fixtures/contracts are never promoted to live integration certification.
 */

import { EngineeringIntelligenceLayerContractLocked } from "../phase-e0/contracts";
import { PhaseE1ExperienceFoundationComplete } from "../phase-e1/contracts";
import { PhaseE2GroundedSearchComplete } from "../phase-e2/contracts";
import { PhaseE3CanonicalContextComplete } from "../phase-e3/contracts";
import { PhaseE4ConnectorFrameworkComplete } from "../phase-e4/contracts";
import { PhaseE5ReasoningExplainabilityComplete } from "../phase-e5/contracts";
import { PhaseE6GovernedToolFrameworkComplete } from "../phase-e6/contracts";
import { PhaseE7PassiveMemoryComplete } from "../phase-e7/contracts";
import { PhaseE8ActionWorkflowOrchestrationComplete } from "../phase-e8/contracts";
import { PhaseE9UnifiedIntelligenceComplete } from "../phase-e9/contracts";
import { PhaseE10DeploymentProfilesComplete } from "../phase-e10/contracts";
import { PhaseE11EvaluationFrameworkComplete } from "../phase-e11/contracts";

export const ENGINEERING_OS_EVOLUTION_PHASE_E12 = "E12" as const;
export const ENGINEERING_OS_EVOLUTION_CONTRACT_VERSION_E12 = "0.1.0-e12" as const;

export const PhaseE12ProductionCertificationComplete = true as const;
export const PhaseE12IsCertificationNotFeaturePhase = true as const;
export const PhaseE12DoesNotRedesignArchitecture = true as const;
export const PhaseE12DoesNotWeakenGates = true as const;
export const PhaseE12FixturesNeverLiveCertified = true as const;
export const PhaseE12NoUnsupportedClaims = true as const;

export const EngineeringProductAssertionIds = [
  "A1",
  "A2",
  "A3",
  "A4",
  "A5",
  "A6",
  "A7",
  "A8",
  "A9",
  "A10",
  "A11",
  "A12",
  "A13",
  "A14",
  "A15",
  "A16",
  "A17",
  "A18",
  "A19",
  "A20",
] as const;
export type EngineeringProductAssertionId =
  (typeof EngineeringProductAssertionIds)[number];

export const EngineeringProfileCertStatuses = [
  "CERTIFIED",
  "CONTRACT_READY",
  "NOT_CERTIFIED",
  "NOT_APPLICABLE",
] as const;
export type EngineeringProfileCertStatus =
  (typeof EngineeringProfileCertStatuses)[number];

export const EngineeringIntegrationMaturityClasses = [
  "LIVE_CERTIFIED",
  "IMPLEMENTED_NOT_LIVE_CERTIFIED",
  "CONTRACT_ONLY",
  "FIXTURE_ONLY",
  "UNAVAILABLE",
] as const;
export type EngineeringIntegrationMaturityClass =
  (typeof EngineeringIntegrationMaturityClasses)[number];

export type AssertionResult = {
  id: EngineeringProductAssertionId;
  statement: string;
  passed: boolean;
  evidence: string[];
};

export function getPhaseE12Declaration() {
  return {
    evolutionPhase: ENGINEERING_OS_EVOLUTION_PHASE_E12,
    contractVersion: ENGINEERING_OS_EVOLUTION_CONTRACT_VERSION_E12,
    PhaseE12ProductionCertificationComplete,
    PhaseE12IsCertificationNotFeaturePhase,
    PhaseE12DoesNotRedesignArchitecture,
    PhaseE12DoesNotWeakenGates,
    PhaseE12FixturesNeverLiveCertified,
    PhaseE12NoUnsupportedClaims,
    assertionIds: EngineeringProductAssertionIds,
    profileCertStatuses: EngineeringProfileCertStatuses,
    integrationMaturityClasses: EngineeringIntegrationMaturityClasses,
    releaseTagCandidate: "engineering-os-intelligence-layer-e12",
  } as const;
}

export function assertPhaseE12Invariants(input: {
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
    !PhaseE10DeploymentProfilesComplete ||
    !PhaseE11EvaluationFrameworkComplete
  ) {
    throw new Error("E12 requires E0–E11 contracts locked");
  }
  if (
    !PhaseE12ProductionCertificationComplete ||
    !PhaseE12IsCertificationNotFeaturePhase ||
    !PhaseE12DoesNotRedesignArchitecture ||
    !PhaseE12DoesNotWeakenGates ||
    !PhaseE12FixturesNeverLiveCertified ||
    !PhaseE12NoUnsupportedClaims
  ) {
    throw new Error("E12 certification policy invariants failed");
  }
  if (
    !input.ProjectIntelligenceV1Intact ||
    !input.InspectionIntelligenceV1Intact ||
    !input.AssetIntelligenceV1Intact ||
    !input.ProjectControlsV1Intact ||
    !input.DigitalTwinV1Intact ||
    !input.EngineeringModelInteroperabilityV1Intact
  ) {
    throw new Error("E12 regression: certified modules");
  }
  if (input.privateCrossModuleCouplingDetected || input.duplicateAssetOwnershipDetected) {
    throw new Error("E12 regression: coupling/ownership");
  }
  if (!input.EngineeringOSProductBoundaryLocked) {
    throw new Error("E12 requires product boundary locked");
  }
}
