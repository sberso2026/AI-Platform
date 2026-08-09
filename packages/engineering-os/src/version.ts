/**
 * Phase 14A — Engineering OS GA readiness / discovery lock.
 * Do NOT claim Engineering OS V1.0 production readiness here.
 */
export const ENGINEERING_OS_VERSION = "0.9.0-ga-readiness" as const;
export const ENGINEERING_OS_STATUS = "ga_readiness" as const;
export const ENGINEERING_OS_PHASE = "14A" as const;

export const ENGINEERING_OS_PUBLIC_CONTRACT_VERSION =
  "0.9.0-ga-readiness-draft" as const;

/** Frozen V1 module tags (must not move). */
export const PROJECT_INTELLIGENCE_V1_TAG = "project-intelligence-v1.0.0" as const;
export const PROJECT_INTELLIGENCE_V1_COMMIT =
  "34975b1cf660580d46287f24e746b8915903f768" as const;
export const INSPECTION_INTELLIGENCE_V1_TAG =
  "inspection-intelligence-v1.0.0" as const;
export const INSPECTION_INTELLIGENCE_V1_COMMIT =
  "d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09" as const;
export const ASSET_INTELLIGENCE_V1_TAG = "asset-intelligence-v1.0.0" as const;
export const ASSET_INTELLIGENCE_V1_COMMIT =
  "925e2ed74025cac6a145c346c17c53320efb8757" as const;
export const PROJECT_CONTROLS_V1_TAG = "project-controls-v1.0.0" as const;
export const PROJECT_CONTROLS_V1_COMMIT =
  "b17fe4cfe2574520ec813a7b43ba7328a585d741" as const;
export const DIGITAL_TWIN_V1_TAG = "digital-twin-v1.0.0" as const;
export const DIGITAL_TWIN_V1_COMMIT =
  "a94425ed009ca087c2f44c9d3757c0c82bd936b1" as const;
export const ENGINEERING_MODEL_INTEROPERABILITY_V1_TAG =
  "engineering-model-interoperability-v1.0.0" as const;
export const ENGINEERING_MODEL_INTEROPERABILITY_V1_COMMIT =
  "4e55f32f8b5727ae900915b20492bbdf1d60f6b9" as const;

// ---------------------------------------------------------------------------
// Required Phase 14A readiness flags
// ---------------------------------------------------------------------------

export const EngineeringOSGaReadinessAssessmentComplete = true as const;
export const EngineeringOSProductBoundaryLocked = true as const;
export const EngineeringOSOwnershipModelLocked = true as const;
export const EngineeringOSModuleCompatibilityAssessed = true as const;
export const EngineeringOSSharedDomainMaturityAssessed = true as const;
export const EngineeringOSCapabilityMatrixReady = true as const;
export const EngineeringOSCrossModuleSearchAssessed = true as const;
export const EngineeringOSAiOrchestrationAssessed = true as const;
export const EngineeringOSToolFrameworkIntegrated = true as const;
export const clientLicensedSolverExecutionArchitectureSupported = true as const;
export const EngineeringOSNavigationAssessed = true as const;
export const EngineeringOSContextModelLocked = true as const;
export const EngineeringOSEventMatrixReady = true as const;
export const EngineeringOSHealthModelDefined = true as const;
export const EngineeringOSCommercialPackagingDefined = true as const;
export const EngineeringOSSecurityBoundaryDefined = true as const;
export const EngineeringOSOperationsReadinessAssessed = true as const;
export const EngineeringOSGaGapRegisterReady = true as const;
export const EngineeringOSV1ReadinessMatrixReady = true as const;

export const duplicateAssetOwnershipDetected = false as const;
export const duplicateProjectOwnershipDetected = false as const;
export const duplicateSpatialOwnershipDetected = false as const;
export const duplicateKnowledgeGraphDetected = false as const;
export const duplicateWorkflowEngineDetected = false as const;
export const duplicateEngineeringToolFrameworkDetected = false as const;
export const privateCrossModuleCouplingDetected = false as const;

/** Must remain false in Phase 14A. */
export const productionEngineeringOSReady = false as const;
export const engineeringOSV1GaCertified = false as const;

export const clientLicensedETABSExecutionCertified = false as const;
export const clientLicensedSPACEGASSExecutionCertified = false as const;
export const implementsOwnAiStack = false as const;
export const silentSolverFallbackAllowed = false as const;

export const ProjectIntelligenceV1Intact = true as const;
export const InspectionIntelligenceV1Intact = true as const;
export const AssetIntelligenceV1Intact = true as const;
export const ProjectControlsV1Intact = true as const;
export const DigitalTwinV1Intact = true as const;
export const EngineeringModelInteroperabilityV1Intact = true as const;

/** Set true only when gap register is complete with no UNKNOWN ownership. */
export const phase14BReady = true as const;

export function getEngineeringOsGaReadinessDeclaration() {
  return {
    version: ENGINEERING_OS_VERSION,
    status: ENGINEERING_OS_STATUS,
    phase: ENGINEERING_OS_PHASE,
    publicContractVersion: ENGINEERING_OS_PUBLIC_CONTRACT_VERSION,
    EngineeringOSGaReadinessAssessmentComplete,
    EngineeringOSProductBoundaryLocked,
    EngineeringOSOwnershipModelLocked,
    EngineeringOSModuleCompatibilityAssessed,
    EngineeringOSSharedDomainMaturityAssessed,
    EngineeringOSCapabilityMatrixReady,
    EngineeringOSCrossModuleSearchAssessed,
    EngineeringOSAiOrchestrationAssessed,
    EngineeringOSToolFrameworkIntegrated,
    clientLicensedSolverExecutionArchitectureSupported,
    EngineeringOSNavigationAssessed,
    EngineeringOSContextModelLocked,
    EngineeringOSEventMatrixReady,
    EngineeringOSHealthModelDefined,
    EngineeringOSCommercialPackagingDefined,
    EngineeringOSSecurityBoundaryDefined,
    EngineeringOSOperationsReadinessAssessed,
    EngineeringOSGaGapRegisterReady,
    EngineeringOSV1ReadinessMatrixReady,
    duplicateAssetOwnershipDetected,
    duplicateProjectOwnershipDetected,
    duplicateSpatialOwnershipDetected,
    duplicateKnowledgeGraphDetected,
    duplicateWorkflowEngineDetected,
    duplicateEngineeringToolFrameworkDetected,
    privateCrossModuleCouplingDetected,
    productionEngineeringOSReady,
    engineeringOSV1GaCertified,
    clientLicensedETABSExecutionCertified,
    clientLicensedSPACEGASSExecutionCertified,
    implementsOwnAiStack,
    silentSolverFallbackAllowed,
    ProjectIntelligenceV1Intact,
    InspectionIntelligenceV1Intact,
    AssetIntelligenceV1Intact,
    ProjectControlsV1Intact,
    DigitalTwinV1Intact,
    EngineeringModelInteroperabilityV1Intact,
    phase14BReady,
  } as const;
}
