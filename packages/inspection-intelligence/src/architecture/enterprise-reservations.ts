/**
 * Phase 9G reservations — AI Vision / Asset Intelligence / predictive remain deferred.
 * Offline sync and mobile product are implemented.
 */
export type ConditionRatingReserved = {
  conditionRating?: number;
  healthIndex?: number;
  riskLevel?: "low" | "medium" | "high" | "critical";
  confidence?: number;
  priority?: number;
  remainingLife?: number;
  conditionTrend?: "improving" | "stable" | "declining";
  reserved: true;
};

/** @deprecated Symbol retained for Phase 9C gate; offline engine implemented in 9G. */
export type OfflineSyncContractsReserved = {
  offlineQueue: true;
  conflictResolver: true;
  mergeStrategy: true;
  retryQueue: true;
  uploadQueue: true;
  syncStatus: true;
  versionResolution: true;
  mobileProductImplemented: true;
  offlineSyncImplemented: true;
};

export const CONDITION_RATING_RESERVED = true as const;
export const OFFLINE_SYNC_CONTRACTS_RESERVED: OfflineSyncContractsReserved = {
  offlineQueue: true,
  conflictResolver: true,
  mergeStrategy: true,
  retryQueue: true,
  uploadQueue: true,
  syncStatus: true,
  versionResolution: true,
  mobileProductImplemented: true,
  offlineSyncImplemented: true,
};

/** @deprecated Defect taxonomy is implemented in domain/defects.ts */
export const DEFECT_TAXONOMY_RESERVED = false as const;
/** @deprecated Recommendation contracts are implemented in domain/recommendations.ts */
export const RECOMMENDATION_CONTRACTS_RESERVED = false as const;