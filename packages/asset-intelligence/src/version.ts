/**
 * Phase 10F — version and readiness locks.
 */
export const ASSET_INTELLIGENCE_PRODUCT_NAME = "Asset Intelligence" as const;
export const ASSET_INTELLIGENCE_MODULE_KEY = "asset_intelligence" as const;
export const ASSET_INTELLIGENCE_VERSION = "0.6.0-timeseries" as const;
export const ASSET_INTELLIGENCE_STATUS = "timeseries" as const;

export const ASSET_IDENTITY_OWNERSHIP = "engineering_os_shared_domain" as const;
export const ASSET_INTELLIGENCE_OWNERSHIP = "asset_intelligence" as const;

export const ASSET_INTELLIGENCE_IMPLEMENTED = true as const;
export const CORE_CONDITION_SLICE_READY = true as const;
export const CORE_CRITICALITY_SLICE_READY = true as const;
export const CORE_RELIABILITY_SLICE_READY = true as const;
export const FAILURE_TAXONOMY_REGISTRY_READY = true as const;
export const FAILURE_INTELLIGENCE_READY = true as const;
export const ENGINEERING_TIME_SERIES_READY = true as const;
export const CHANGE_DETECTION_ENGINE_READY = true as const;
export const TREND_CONFIDENCE_ENGINE_READY = true as const;
export const TREND_INTELLIGENCE_READY = true as const;
export const DEGRADATION_ANALYSIS_READY = true as const;
export const HEALTH_COMPOSITION_ENGINE_READY = true as const;
export const EVIDENCE_CONFIDENCE_ENGINE_READY = true as const;
export const CRITICALITY_IS_HEALTH_FACTOR = false as const;
export const FAILURE_HEALTH_CONTRIBUTION_ENABLED = false as const;
export const DEGRADATION_HEALTH_CONTRIBUTION_ENABLED = false as const;
export const HOSTED_ASSET_INTELLIGENCE_PERSISTENCE_READY = true as const;
export const PRODUCTION_MEMORY_REPOSITORY_ALLOWED = false as const;
export const PRODUCTION_ASSET_INTELLIGENCE_READY = false as const;
export const DUPLICATE_ASSET_OWNERSHIP_DETECTED = false as const;
export const ACCURACY_CLAIMS_CERTIFIED = false as const;
export const RUL_CLAIMS_CERTIFIED = false as const;
export const PROBABILITY_OF_FAILURE_CERTIFIED = false as const;
export const QUANTITATIVE_RELIABILITY_CERTIFIED = false as const;

export const INSPECTION_INTELLIGENCE_V1_CONTRACTS_CONSUMED = "1.0.0" as const;
export const INSPECTION_INTELLIGENCE_V1_TAG = "inspection-intelligence-v1.0.0" as const;
export const PROJECT_INTELLIGENCE_V1_TAG = "project-intelligence-v1.0.0" as const;

export const PHASE_10A_CERTIFIED_COMMIT = "81d1cade909cf991a9dc91b9236310143f4b215f" as const;
export const PHASE_10B_CERTIFIED_COMMIT = "ef7268e6dd3873f8941885a87a2723130a6bb6bc" as const;
export const PHASE_10B1_CERTIFIED_COMMIT = "e72822434a38e66a409da3c8a291e68f006888c3" as const;
export const PHASE_10C_CERTIFIED_COMMIT = "10b0259134995f55bfe889dba2386edd653d9c2b" as const;
export const PHASE_10D_CERTIFIED_COMMIT = "ef6981e1c42f80cbb12337c21e6830eb22c3fdbf" as const;
export const PHASE_10E_CERTIFIED_COMMIT = "ed127cd85901f8053d09155f7c4053f0b22b8a5f" as const;

export function getAssetIntelligenceCoreDeclaration() {
  return {
    productName: ASSET_INTELLIGENCE_PRODUCT_NAME,
    moduleKey: ASSET_INTELLIGENCE_MODULE_KEY,
    version: ASSET_INTELLIGENCE_VERSION,
    status: ASSET_INTELLIGENCE_STATUS,
    assetIdentityOwnership: ASSET_IDENTITY_OWNERSHIP,
    assetIntelligenceOwnership: ASSET_INTELLIGENCE_OWNERSHIP,
    assetIntelligenceImplemented: ASSET_INTELLIGENCE_IMPLEMENTED,
    coreConditionSliceReady: CORE_CONDITION_SLICE_READY,
    coreCriticalitySliceReady: CORE_CRITICALITY_SLICE_READY,
    coreReliabilitySliceReady: CORE_RELIABILITY_SLICE_READY,
    failureTaxonomyRegistryReady: FAILURE_TAXONOMY_REGISTRY_READY,
    failureIntelligenceReady: FAILURE_INTELLIGENCE_READY,
    engineeringTimeSeriesReady: ENGINEERING_TIME_SERIES_READY,
    changeDetectionEngineReady: CHANGE_DETECTION_ENGINE_READY,
    trendConfidenceEngineReady: TREND_CONFIDENCE_ENGINE_READY,
    trendIntelligenceReady: TREND_INTELLIGENCE_READY,
    degradationAnalysisReady: DEGRADATION_ANALYSIS_READY,
    healthCompositionEngineReady: HEALTH_COMPOSITION_ENGINE_READY,
    evidenceConfidenceEngineReady: EVIDENCE_CONFIDENCE_ENGINE_READY,
    criticalityIsHealthFactor: CRITICALITY_IS_HEALTH_FACTOR,
    failureHealthContributionEnabled: FAILURE_HEALTH_CONTRIBUTION_ENABLED,
    degradationHealthContributionEnabled: DEGRADATION_HEALTH_CONTRIBUTION_ENABLED,
    hostedAssetIntelligencePersistenceReady: HOSTED_ASSET_INTELLIGENCE_PERSISTENCE_READY,
    productionMemoryRepositoryAllowed: PRODUCTION_MEMORY_REPOSITORY_ALLOWED,
    productionAssetIntelligenceReady: PRODUCTION_ASSET_INTELLIGENCE_READY,
    duplicateAssetOwnershipDetected: DUPLICATE_ASSET_OWNERSHIP_DETECTED,
    accuracyClaimsCertified: ACCURACY_CLAIMS_CERTIFIED,
    rulClaimsCertified: RUL_CLAIMS_CERTIFIED,
    probabilityOfFailureCertified: PROBABILITY_OF_FAILURE_CERTIFIED,
    quantitativeReliabilityCertified: QUANTITATIVE_RELIABILITY_CERTIFIED,
    inspectionIntelligenceContractsConsumed: INSPECTION_INTELLIGENCE_V1_CONTRACTS_CONSUMED,
    hierarchy:
      "RTB AI Platform → Engineering OS → Shared Asset Domain (canonical identity) → Asset Intelligence (intelligence about assets)" as const,
  };
}

export function getAssetIntelligenceDiscoveryDeclaration() {
  return {
    ...getAssetIntelligenceCoreDeclaration(),
    status: ASSET_INTELLIGENCE_STATUS,
  };
}
