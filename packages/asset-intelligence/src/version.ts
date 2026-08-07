/**
 * Phase 10C — version and readiness locks.
 */
export const ASSET_INTELLIGENCE_PRODUCT_NAME = "Asset Intelligence" as const;
export const ASSET_INTELLIGENCE_MODULE_KEY = "asset_intelligence" as const;
export const ASSET_INTELLIGENCE_VERSION = "0.3.0-criticality" as const;
export const ASSET_INTELLIGENCE_STATUS = "criticality" as const;

/** Canonical asset identity remains Engineering OS Shared Domain. */
export const ASSET_IDENTITY_OWNERSHIP = "engineering_os_shared_domain" as const;
/** Intelligence ABOUT assets is owned by Asset Intelligence. */
export const ASSET_INTELLIGENCE_OWNERSHIP = "asset_intelligence" as const;

export const ASSET_INTELLIGENCE_IMPLEMENTED = true as const;
export const CORE_CONDITION_SLICE_READY = true as const;
export const CORE_CRITICALITY_SLICE_READY = true as const;
export const HEALTH_COMPOSITION_ENGINE_READY = true as const;
export const HOSTED_ASSET_INTELLIGENCE_PERSISTENCE_READY = true as const;
export const PRODUCTION_MEMORY_REPOSITORY_ALLOWED = false as const;
export const PRODUCTION_ASSET_INTELLIGENCE_READY = false as const;
export const DUPLICATE_ASSET_OWNERSHIP_DETECTED = false as const;
export const ACCURACY_CLAIMS_CERTIFIED = false as const;
export const RUL_CLAIMS_CERTIFIED = false as const;

export const INSPECTION_INTELLIGENCE_V1_CONTRACTS_CONSUMED = "1.0.0" as const;
export const INSPECTION_INTELLIGENCE_V1_TAG = "inspection-intelligence-v1.0.0" as const;
export const PROJECT_INTELLIGENCE_V1_TAG = "project-intelligence-v1.0.0" as const;

export const PHASE_10A_CERTIFIED_COMMIT = "81d1cade909cf991a9dc91b9236310143f4b215f" as const;
export const PHASE_10B_CERTIFIED_COMMIT = "ef7268e6dd3873f8941885a87a2723130a6bb6bc" as const;
export const PHASE_10B1_CERTIFIED_COMMIT = "e72822434a38e66a409da3c8a291e68f006888c3" as const;

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
    healthCompositionEngineReady: HEALTH_COMPOSITION_ENGINE_READY,
    hostedAssetIntelligencePersistenceReady: HOSTED_ASSET_INTELLIGENCE_PERSISTENCE_READY,
    productionMemoryRepositoryAllowed: PRODUCTION_MEMORY_REPOSITORY_ALLOWED,
    productionAssetIntelligenceReady: PRODUCTION_ASSET_INTELLIGENCE_READY,
    duplicateAssetOwnershipDetected: DUPLICATE_ASSET_OWNERSHIP_DETECTED,
    accuracyClaimsCertified: ACCURACY_CLAIMS_CERTIFIED,
    rulClaimsCertified: RUL_CLAIMS_CERTIFIED,
    inspectionIntelligenceContractsConsumed: INSPECTION_INTELLIGENCE_V1_CONTRACTS_CONSUMED,
    hierarchy:
      "RTB AI Platform → Engineering OS → Shared Asset Domain (canonical identity) → Asset Intelligence (intelligence about assets)" as const,
  };
}

/** @deprecated Prefer getAssetIntelligenceCoreDeclaration — retained for 10A test compatibility. */
export function getAssetIntelligenceDiscoveryDeclaration() {
  return {
    ...getAssetIntelligenceCoreDeclaration(),
    status: ASSET_INTELLIGENCE_STATUS,
  };
}
