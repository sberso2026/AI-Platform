/**
 * Phase 10A — Asset Intelligence discovery identity (not production-ready).
 */
export const ASSET_INTELLIGENCE_PRODUCT_NAME = "Asset Intelligence" as const;
export const ASSET_INTELLIGENCE_MODULE_KEY = "asset_intelligence" as const;
export const ASSET_INTELLIGENCE_VERSION = "0.1.0-discovery" as const;
export const ASSET_INTELLIGENCE_STATUS = "discovery" as const;

/** Canonical asset identity remains Engineering OS Shared Domain. */
export const ASSET_IDENTITY_OWNERSHIP = "engineering_os_shared_domain" as const;
/** Future intelligence ABOUT assets is owned by Asset Intelligence (not implemented). */
export const ASSET_INTELLIGENCE_OWNERSHIP = "asset_intelligence" as const;

export const ASSET_INTELLIGENCE_IMPLEMENTED = false as const;
export const PRODUCTION_ASSET_INTELLIGENCE_READY = false as const;
export const DUPLICATE_ASSET_OWNERSHIP_DETECTED = false as const;
export const ACCURACY_CLAIMS_CERTIFIED = false as const;
export const RUL_CLAIMS_CERTIFIED = false as const;

export const INSPECTION_INTELLIGENCE_V1_CONTRACTS_CONSUMED = "1.0.0" as const;
export const INSPECTION_INTELLIGENCE_V1_TAG = "inspection-intelligence-v1.0.0" as const;
export const PROJECT_INTELLIGENCE_V1_TAG = "project-intelligence-v1.0.0" as const;

export function getAssetIntelligenceDiscoveryDeclaration() {
  return {
    productName: ASSET_INTELLIGENCE_PRODUCT_NAME,
    moduleKey: ASSET_INTELLIGENCE_MODULE_KEY,
    version: ASSET_INTELLIGENCE_VERSION,
    status: ASSET_INTELLIGENCE_STATUS,
    assetIdentityOwnership: ASSET_IDENTITY_OWNERSHIP,
    assetIntelligenceOwnership: ASSET_INTELLIGENCE_OWNERSHIP,
    assetIntelligenceImplemented: ASSET_INTELLIGENCE_IMPLEMENTED,
    productionAssetIntelligenceReady: PRODUCTION_ASSET_INTELLIGENCE_READY,
    duplicateAssetOwnershipDetected: DUPLICATE_ASSET_OWNERSHIP_DETECTED,
    accuracyClaimsCertified: ACCURACY_CLAIMS_CERTIFIED,
    rulClaimsCertified: RUL_CLAIMS_CERTIFIED,
    inspectionIntelligenceContractsConsumed: INSPECTION_INTELLIGENCE_V1_CONTRACTS_CONSUMED,
    hierarchy:
      "RTB AI Platform → Engineering OS → Shared Asset Domain (canonical identity) → Asset Intelligence (intelligence about assets; discovery only)" as const,
  };
}
