/**
 * Phase 14A certification gates A–BL (Engineering OS GA Readiness Lock).
 * 64 gates: A–Z (26) + AA–BL (38).
 */
export const PHASE_14A_ENGINEERING_OS_GA_READINESS_GATES = [
  ["A", "Repository/build identity"],
  ["B", "Project Intelligence V1 tag intact"],
  ["C", "Inspection Intelligence V1 tag intact"],
  ["D", "Asset Intelligence V1 tag intact"],
  ["E", "Project Controls V1 tag intact"],
  ["F", "Digital Twin V1 tag intact"],
  ["G", "Engineering Model Interoperability V1 tag intact"],
  ["H", "Engineering OS package exists"],
  ["I", "Engineering OS certification package exists"],
  ["J", "Version 0.9.0-ga-readiness"],
  ["K", "Status ga_readiness"],
  ["L", "productionEngineeringOSReady is false"],
  ["M", "engineeringOSV1GaCertified is false"],
  ["N", "System inventory document"],
  ["O", "Product boundary document"],
  ["P", "Ownership matrix document"],
  ["Q", "Canonical ownership normalization document"],
  ["R", "Shared domain maturity matrix"],
  ["S", "Module compatibility matrix"],
  ["T", "Capability matrix"],
  ["U", "Cross-module search model"],
  ["V", "AI orchestration model"],
  ["W", "Tool framework integration"],
  ["X", "Client-owned commercial solver architecture"],
  ["Y", "Navigation model"],
  ["Z", "Context model"],
  ["AA", "Event matrix"],
  ["AB", "Health model"],
  ["AC", "Commercial packaging architecture"],
  ["AD", "Security boundary"],
  ["AE", "Capacity/performance baseline"],
  ["AF", "Operations readiness"],
  ["AG", "GA gap register"],
  ["AH", "V1 readiness matrix"],
  ["AI", "Phase 14A overview"],
  ["AJ", "EngineeringOSGaReadinessAssessmentComplete"],
  ["AK", "EngineeringOSProductBoundaryLocked"],
  ["AL", "EngineeringOSOwnershipModelLocked"],
  ["AM", "EngineeringOSModuleCompatibilityAssessed"],
  ["AN", "EngineeringOSSharedDomainMaturityAssessed"],
  ["AO", "EngineeringOSCapabilityMatrixReady"],
  ["AP", "EngineeringOSCrossModuleSearchAssessed"],
  ["AQ", "EngineeringOSAiOrchestrationAssessed"],
  ["AR", "EngineeringOSToolFrameworkIntegrated"],
  ["AS", "clientLicensedSolverExecutionArchitectureSupported"],
  ["AT", "EngineeringOSNavigationAssessed"],
  ["AU", "EngineeringOSContextModelLocked"],
  ["AV", "EngineeringOSEventMatrixReady"],
  ["AW", "EngineeringOSHealthModelDefined"],
  ["AX", "EngineeringOSCommercialPackagingDefined"],
  ["AY", "EngineeringOSSecurityBoundaryDefined"],
  ["AZ", "EngineeringOSOperationsReadinessAssessed"],
  ["BA", "EngineeringOSGaGapRegisterReady"],
  ["BB", "EngineeringOSV1ReadinessMatrixReady"],
  ["BC", "Duplicate ownership/framework flags false"],
  ["BD", "implementsOwnAiStack false"],
  ["BE", "Live commercial solver flags false"],
  ["BF", "Gap register has no UNKNOWN ownership"],
  ["BG", "Migration lineage inventoried / no 14A migration"],
  ["BH", "UI/status mismatches documented"],
  ["BI", "Secret exposure"],
  ["BJ", "Workflow exists"],
  ["BK", "Unit tests"],
  ["BL", "phase14BReady and releaseEligible"],
] as const;

export type Phase14aGateId =
  (typeof PHASE_14A_ENGINEERING_OS_GA_READINESS_GATES)[number][0];

export const PHASE_14A_GATE_COUNT =
  PHASE_14A_ENGINEERING_OS_GA_READINESS_GATES.length;

export const PHASE_14A_EOS_VERSION = "0.9.0-ga-readiness" as const;
export const PHASE_14A_EOS_STATUS = "ga_readiness" as const;

export const PHASE_14A_PI_TAG = "project-intelligence-v1.0.0" as const;
export const PHASE_14A_PI_COMMIT =
  "34975b1cf660580d46287f24e746b8915903f768" as const;
export const PHASE_14A_II_TAG = "inspection-intelligence-v1.0.0" as const;
export const PHASE_14A_II_COMMIT =
  "d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09" as const;
export const PHASE_14A_AI_TAG = "asset-intelligence-v1.0.0" as const;
export const PHASE_14A_AI_COMMIT =
  "925e2ed74025cac6a145c346c17c53320efb8757" as const;
export const PHASE_14A_PC_TAG = "project-controls-v1.0.0" as const;
export const PHASE_14A_PC_COMMIT =
  "b17fe4cfe2574520ec813a7b43ba7328a585d741" as const;
export const PHASE_14A_DT_TAG = "digital-twin-v1.0.0" as const;
export const PHASE_14A_DT_COMMIT =
  "a94425ed009ca087c2f44c9d3757c0c82bd936b1" as const;
export const PHASE_14A_INTEROP_TAG =
  "engineering-model-interoperability-v1.0.0" as const;
export const PHASE_14A_INTEROP_COMMIT =
  "4e55f32f8b5727ae900915b20492bbdf1d60f6b9" as const;
