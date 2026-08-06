export const INSPECTION_INTELLIGENCE_SLICE_FEATURE_IDS = [
  "inspection_planning",
  "inspection_sessions",
  "inspection_observations",
  "inspection_measurements",
  "inspection_evidence",
  "inspection_review_approval",
] as const;

export type InspectionIntelligenceSliceFeatureId =
  (typeof INSPECTION_INTELLIGENCE_SLICE_FEATURE_IDS)[number];

/** Planned but not in first vertical slice depth. */
export const INSPECTION_INTELLIGENCE_PLANNED_FEATURE_IDS = [
  ...INSPECTION_INTELLIGENCE_SLICE_FEATURE_IDS,
  "inspection_reporting",
] as const;
