/**
 * II-6 Inspection Command Centre ownership. Composition over existing inspection_*
 * records. Not a second inspection truth model, health score, or AI KPI store.
 */
export const INSPECTION_COMMAND_CENTRE_PHASE = "II-6" as const;
export const COMMAND_CENTRE_STORES_CANONICAL_COPY = false as const;
export const COMMAND_CENTRE_USES_AI_METRICS = false as const;
export const COMMAND_CENTRE_HEALTH_SCORE_ENABLED = false as const;
export const COMMAND_CENTRE_RISK_PROBABILITY_ENABLED = false as const;
export const COMMAND_CENTRE_REMAINING_LIFE_ENABLED = false as const;

export const INSPECTION_COMMAND_CENTRE_OWNERSHIP = {
  composition: "inspection_intelligence",
  canonicalPlans: "inspection_plans",
  canonicalSessions: "inspection_sessions",
  canonicalDefects: "inspection_defects",
  canonicalCondition: "inspection_condition_ratings",
  canonicalEvidence: "inspection_evidence",
  canonicalCorrectiveActions: "inspection_corrective_actions",
  canonicalVerifications: "inspection_verifications",
  canonicalReports: "inspection_reporting_outputs",
  aiOverlay: "advisory_only_not_canonical",
} as const;
