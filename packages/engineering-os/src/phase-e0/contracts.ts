/**
 * Phase E0 — Engineering Intelligence Layer product contracts (machine-readable).
 * Does not reopen Engineering OS V1.0 GA freezes.
 */

export const ENGINEERING_OS_EVOLUTION_PHASE = "E0" as const;
export const ENGINEERING_OS_EVOLUTION_CONTRACT_VERSION = "0.1.0-e0" as const;

export const EngineeringIntelligenceLayerContractLocked = true as const;
export const PhaseE0ArchitectureComplete = true as const;
export const PhaseE0NoMajorMigrationRequired = true as const;

/** Product principles encoded as invariants. */
export const EngineeringOsSitsAboveClientTools = true as const;
export const AvoidUnnecessaryAuthoritativeDuplication = true as const;
export const NativeAiSearchWithoutEnterpriseAiRequired = true as const;
export const EnterpriseConnectorsOptional = true as const;
export const EnterpriseConnectorsNeverHardDependency = true as const;
export const AssistantFirstUx = true as const;
export const StructuredModulesRemainAvailable = true as const;
export const PlatformComplexityHiddenFromEngineers = true as const;
export const HumansRetainEngineeringAuthority = true as const;
export const AiRecommendationsAdvisoryByDefault = true as const;
export const NeverFabricateMissingEvidence = true as const;
export const AmbientGovernanceRequired = true as const;
export const VendorNeutralLogicalArchitecture = true as const;
export const ProgressiveDeploymentSupported = true as const;
export const NoMandatorySapM365CopilotDependency = true as const;
export const ExternalSystemsRemainSorWhereAuthoritative = true as const;
export const EngineeringOsOwnsCanonicalContextNotArbitraryCopies = true as const;
export const ReduceEngineerContextSwitching = true as const;

/** Canonical SoR principle. */
export const ExternalRecordNotEqualEngineeringOsRecord = true as const;
export const PreferReferencesMappingsProvenance = true as const;

/** UX complexity. */
export const CapabilityBasedUxHideUnavailable = true as const;
export const HideDeadNonClickablePrimaryFeatures = true as const;

/** Deployment profile support. */
export const DeploymentProfiles = ["ESSENTIAL", "PROFESSIONAL", "ENTERPRISE"] as const;
export type DeploymentProfile = (typeof DeploymentProfiles)[number];

export const supportsZeroConnectorNativeDeployment = true as const;
export const supportsEnterpriseFederatedDeployment = true as const;

/** Experience surfaces (target). */
export const ExperienceSurfaces = [
  "ask_engineering_os",
  "my_engineering",
  "explore",
  "intelligence",
] as const;

/** Target layers. */
export const EngineeringIntelligenceLayers = [
  "experience",
  "engineering_domain",
  "engineering_intelligence",
  "engineering_capability",
  "native_services",
  "enterprise_integration",
] as const;

/** Certified ownership must remain intact through E-series. */
export const E0PreservesCertifiedModuleOwnership = true as const;
export const E0ForbidsDuplicatePiIiOwnership = true as const;
export const E0ForbidsForcedExternalDependency = true as const;

export const PHASE_E0_DOCUMENTS = [
  "docs/architecture/adr/ADR_ENGINEERING_INTELLIGENCE_LAYER_E0.md",
  "docs/architecture/ENGINEERING_OS_PHASE_E0_PRODUCT_ARCHITECTURE.md",
  "docs/architecture/ENGINEERING_OS_PHASE_E0_LAYER_OWNERSHIP_MATRIX.md",
  "docs/architecture/ENGINEERING_OS_PHASE_E0_SYSTEM_OF_RECORD_POLICY.md",
  "docs/architecture/ENGINEERING_OS_PHASE_E0_CONNECTOR_BOUNDARY.md",
  "docs/architecture/ENGINEERING_OS_PHASE_E0_DEPLOYMENT_PROFILES.md",
  "docs/architecture/ENGINEERING_OS_PHASE_E0_UX_COMPLEXITY_POLICY.md",
  "docs/architecture/ENGINEERING_OS_PHASE_E0_MIGRATION_COMPATIBILITY.md",
  "docs/architecture/ENGINEERING_OS_PHASE_E0_ROADMAP_E1_E12.md",
] as const;

export function getPhaseE0Declaration() {
  return {
    evolutionPhase: ENGINEERING_OS_EVOLUTION_PHASE,
    contractVersion: ENGINEERING_OS_EVOLUTION_CONTRACT_VERSION,
    EngineeringIntelligenceLayerContractLocked,
    PhaseE0ArchitectureComplete,
    PhaseE0NoMajorMigrationRequired,
    EnterpriseConnectorsOptional,
    EnterpriseConnectorsNeverHardDependency,
    NativeAiSearchWithoutEnterpriseAiRequired,
    CapabilityBasedUxHideUnavailable,
    ExternalRecordNotEqualEngineeringOsRecord,
    PreferReferencesMappingsProvenance,
    supportsZeroConnectorNativeDeployment,
    supportsEnterpriseFederatedDeployment,
    DeploymentProfiles,
    ExperienceSurfaces,
    EngineeringIntelligenceLayers,
    E0PreservesCertifiedModuleOwnership,
    E0ForbidsDuplicatePiIiOwnership,
    E0ForbidsForcedExternalDependency,
    NoMandatorySapM365CopilotDependency,
    AiRecommendationsAdvisoryByDefault,
    NeverFabricateMissingEvidence,
    documents: PHASE_E0_DOCUMENTS,
  } as const;
}

export function assertPhaseE0Invariants(input: {
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
  if (!EngineeringIntelligenceLayerContractLocked) {
    throw new Error("E0 contract must be locked");
  }
  if (!EnterpriseConnectorsOptional || !EnterpriseConnectorsNeverHardDependency) {
    throw new Error("E0 requires optional enterprise connectors");
  }
  if (!supportsZeroConnectorNativeDeployment) {
    throw new Error("E0 requires zero-connector native deployment support");
  }
  if (!NoMandatorySapM365CopilotDependency) {
    throw new Error("E0 forbids mandatory SAP/M365/Copilot dependency");
  }
  if (!CapabilityBasedUxHideUnavailable) {
    throw new Error("E0 requires capability-based UX hiding");
  }
  if (!input.ProjectIntelligenceV1Intact || !input.InspectionIntelligenceV1Intact) {
    throw new Error("E0 regression: PI/II V1 intact flags must remain true");
  }
  if (
    !input.AssetIntelligenceV1Intact ||
    !input.ProjectControlsV1Intact ||
    !input.DigitalTwinV1Intact ||
    !input.EngineeringModelInteroperabilityV1Intact
  ) {
    throw new Error("E0 regression: certified module intact flags must remain true");
  }
  if (input.privateCrossModuleCouplingDetected) {
    throw new Error("E0 regression: private cross-module coupling detected");
  }
  if (input.duplicateAssetOwnershipDetected) {
    throw new Error("E0 regression: duplicate asset ownership detected");
  }
  if (!input.EngineeringOSProductBoundaryLocked) {
    throw new Error("E0 requires Engineering OS product boundary to remain locked");
  }
}
