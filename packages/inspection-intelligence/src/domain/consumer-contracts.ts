/**
 * Phase 9J — consume-only cross-module contracts for Asset Intelligence / Digital Twin.
 * II does not own those domains; adapters expose observation feeds only.
 */

export const CONSUMER_CONTRACT_VERSION = "1.0.0" as const;

export type AssetReferenceConsumerAdapter = {
  contractId: "ii.consumer.asset_reference";
  version: typeof CONSUMER_CONTRACT_VERSION;
  ownership: "none";
  direction: "inspection_to_consumer";
  exposes: readonly ["inspectionTargetId", "assetReferenceId", "observedAt", "sessionId"];
  forbids: readonly ["asset_registry", "asset_health_ownership", "lifecycle_ownership"];
};

export type DigitalTwinObservationFeedAdapter = {
  contractId: "ii.consumer.digital_twin_observation_feed";
  version: typeof CONSUMER_CONTRACT_VERSION;
  ownership: "none";
  direction: "inspection_to_consumer";
  exposes: readonly [
    "observationId",
    "evidenceDerivativeId",
    "conditionRatingId",
    "validatedVisionAnalysisId",
    "publishedAt",
  ];
  forbids: readonly ["twin_model", "twin_runtime", "geometry_ownership"];
};

export const ASSET_REFERENCE_CONSUMER_ADAPTER: AssetReferenceConsumerAdapter = {
  contractId: "ii.consumer.asset_reference",
  version: CONSUMER_CONTRACT_VERSION,
  ownership: "none",
  direction: "inspection_to_consumer",
  exposes: ["inspectionTargetId", "assetReferenceId", "observedAt", "sessionId"],
  forbids: ["asset_registry", "asset_health_ownership", "lifecycle_ownership"],
};

export const DIGITAL_TWIN_OBSERVATION_FEED_ADAPTER: DigitalTwinObservationFeedAdapter = {
  contractId: "ii.consumer.digital_twin_observation_feed",
  version: CONSUMER_CONTRACT_VERSION,
  ownership: "none",
  direction: "inspection_to_consumer",
  exposes: [
    "observationId",
    "evidenceDerivativeId",
    "conditionRatingId",
    "validatedVisionAnalysisId",
    "publishedAt",
  ],
  forbids: ["twin_model", "twin_runtime", "geometry_ownership"],
};

export function assertConsumerContractsNonOwning(): {
  ok: true;
  assetIntelligenceOwnership: false;
  digitalTwinOwnership: false;
} {
  if (ASSET_REFERENCE_CONSUMER_ADAPTER.ownership !== "none") {
    throw new Error("asset_consumer_must_not_own");
  }
  if (DIGITAL_TWIN_OBSERVATION_FEED_ADAPTER.ownership !== "none") {
    throw new Error("twin_consumer_must_not_own");
  }
  return { ok: true, assetIntelligenceOwnership: false, digitalTwinOwnership: false };
}
