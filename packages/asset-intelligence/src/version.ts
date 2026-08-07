/**
 * Phase 10B — Asset Intelligence core identity (not full module GA).
 */
export const ASSET_INTELLIGENCE_PRODUCT_NAME = "Asset Intelligence" as const;
export const ASSET_INTELLIGENCE_MODULE_KEY = "asset_intelligence" as const;
export const ASSET_INTELLIGENCE_VERSION = "0.2.1-hosted-persistence" as const;
export const ASSET_INTELLIGENCE_STATUS = "hosted_persistence" as const;

/** Canonical asset identity remains Engineering OS Shared Domain. */
export const ASSET_IDENTITY_OWNERSHIP = "engineering_os_shared_domain" as const;
/** Intelligence ABOUT assets is owned by Asset Intelligence. */
export const ASSET_INTELLIGENCE_OWNERSHIP = "asset_intelligence" as const;

/** Core foundation + condition vertical slice exist; not full module GA. */
export const ASSET_INTELLIGENCE_IMPLEMENTED = true as const;
export const CORE_CONDITION_SLICE_READY = true as const;
export const HOSTED_ASSET_INTELLIGENCE_PERSISTENCE_READY = true as const;
export const PRODUCTION_MEMORY_REPOSITORY_ALLOWED = false as const;
/** Full module production readiness remains false. */
export const PRODUCTION_ASSET_INTELLIGENCE_READY = false as const;
export const DUPLICATE_ASSET_OWNERSHIP_DETECTED = false as const;
export const ACCURACY_CLAIMS_CERTIFIED = false as const;
export const RUL_CLAIMS_CERTIFIED = false as const;

export const INSPECTION_INTELLIGENCE_V1_CONTRACTS_CONSUMED = "1.0.0" as const;
export const INSPECTION_INTELLIGENCE_V1_TAG = "inspection-intelligence-v1.0.0" as const;
export const PROJECT_INTELLIGENCE_V1_TAG = "project-intelligence-v1.0.0" as const;

export const PHASE_10A_CERTIFIED_COMMIT = "81d1cade909cf991a9dc91b9236310143f4b215f" as const;
export const PHASE_10B_CERTIFIED_COMMIT = "ef7268e6dd3873f8941885a87a2723130a6bb6bc" as const;

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
