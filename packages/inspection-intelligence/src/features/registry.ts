export const INSPECTION_INTELLIGENCE_MODULE_KEY = "inspection_intelligence" as const;

/** Planned feature IDs — not implemented in Phase 9A. */
export const INSPECTION_INTELLIGENCE_PLANNED_FEATURE_IDS = [
  "inspection_planning",
  "inspection_sessions",
  "inspection_observations",
  "inspection_measurements",
  "inspection_evidence",
  "inspection_review_approval",
  "inspection_reporting",
] as const;

export type InspectionIntelligencePlannedFeatureId =
  (typeof INSPECTION_INTELLIGENCE_PLANNED_FEATURE_IDS)[number];
