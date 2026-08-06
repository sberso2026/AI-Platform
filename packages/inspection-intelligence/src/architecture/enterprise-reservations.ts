/**
 * Phase 9D reservations — mobile/offline/AI Vision/Asset Intelligence remain deferred.
 * Defect and recommendation frameworks are implemented in domain/* (no longer reserved-only).
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

export type OfflineSyncContractsReserved = {
  offlineQueue: true;
  conflictResolver: true;
  mergeStrategy: true;
  retryQueue: true;
  uploadQueue: true;
  syncStatus: true;
  versionResolution: true;
  mobileProductImplemented: false;
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
  mobileProductImplemented: false,
};

/** @deprecated Defect taxonomy is implemented in domain/defects.ts */
export const DEFECT_TAXONOMY_RESERVED = false as const;
/** @deprecated Recommendation contracts are implemented in domain/recommendations.ts */
export const RECOMMENDATION_CONTRACTS_RESERVED = false as const;
