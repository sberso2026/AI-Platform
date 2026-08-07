/**
 * Phase 10C — capability and service wiring.
 */

export const PHASE_10C_CAPABILITIES = [
  "asset.condition.read",
  "asset.condition.assess",
  "asset.criticality.read",
  "asset.criticality.assess",
  "asset.criticality.review",
  "asset.intelligence.read",
  "asset.health.read",
  "asset.health.compose",
] as const;

export const PHASE_10C_SERVICES = [
  "AssetIntelligenceService",
  "AssetConditionService",
  "AssetCriticalityService",
  "AssetHealthIndexService",
  "AssetTimelineService",
  "HealthCompositionEngine",
] as const;

/** @deprecated Prefer PHASE_10C_* */
export const PHASE_10B_CAPABILITIES = PHASE_10C_CAPABILITIES;
/** @deprecated Prefer PHASE_10C_* */
export const PHASE_10B_SERVICES = PHASE_10C_SERVICES;
