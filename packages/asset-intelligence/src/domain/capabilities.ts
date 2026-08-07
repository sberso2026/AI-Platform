/**
 * Phase 10C / 10E — capability and service wiring.
 */

export const PHASE_10E_CAPABILITIES = [
  "asset.condition.read",
  "asset.condition.assess",
  "asset.criticality.read",
  "asset.criticality.assess",
  "asset.criticality.review",
  "asset.reliability.read",
  "asset.reliability.assess",
  "asset.failure.read",
  "asset.failure.assess",
  "asset.failure.submit",
  "asset.failure.review",
  "asset.failure.approve",
  "asset.failure.publish",
  "asset.failure.taxonomy.query",
  "asset.intelligence.read",
  "asset.health.read",
  "asset.health.compose",
] as const;

export const PHASE_10E_SERVICES = [
  "AssetIntelligenceService",
  "AssetConditionService",
  "AssetCriticalityService",
  "AssetReliabilityService",
  "AssetFailureService",
  "AssetHealthIndexService",
  "AssetTimelineService",
  "HealthCompositionEngine",
  "EvidenceConfidenceEngine",
  "AssetFailureIntelligenceEngine",
  "FailureTaxonomyRegistry",
] as const;

/** @deprecated Prefer PHASE_10E_* */
export const PHASE_10C_CAPABILITIES = PHASE_10E_CAPABILITIES;
/** @deprecated Prefer PHASE_10E_* */
export const PHASE_10C_SERVICES = PHASE_10E_SERVICES;
/** @deprecated Prefer PHASE_10C_* */
export const PHASE_10B_CAPABILITIES = PHASE_10C_CAPABILITIES;
/** @deprecated Prefer PHASE_10C_* */
export const PHASE_10B_SERVICES = PHASE_10C_SERVICES;
