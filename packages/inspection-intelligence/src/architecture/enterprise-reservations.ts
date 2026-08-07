/**
 * Phase 9H — AI Vision / Asset Intelligence remain deferred.
 * Condition rating and II predictive signal scaffolding are implemented in domain/*.
 */
export type ConditionRatingReserved = {
  /** @deprecated Use domain/condition-rating.ts */
  reserved: false;
};

export const CONDITION_RATING_RESERVED = false as const;

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
