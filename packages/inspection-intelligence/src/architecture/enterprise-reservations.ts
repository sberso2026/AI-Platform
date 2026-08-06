/** Condition rating / defect taxonomy / recommendation / offline — reserved contracts. */

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

export type DefectTaxonomyReserved = {
  failureMode?: string;
  failureMechanism?: string;
  severity?: string;
  urgency?: string;
  repairClass?: string;
  monitoringRequired?: boolean;
  rootCause?: string;
  defectCategory?: string;
  reserved: true;
};

export type RecommendationAction =
  | "repair"
  | "replace"
  | "monitor"
  | "shutdown"
  | "reinspect"
  | "escalate"
  | "engineering_assessment"
  | "no_action";

export type RecommendationContractReserved = {
  action: RecommendationAction;
  rationale?: string;
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
export const DEFECT_TAXONOMY_RESERVED = true as const;
export const RECOMMENDATION_CONTRACTS_RESERVED = true as const;
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
