/**
 * Existing V1 engine inventory frozen for II-0. No replacement models.
 */
export const INSPECTION_V1_ENGINE_PRIMITIVES = [
  "planning",
  "sessions",
  "observations",
  "measurements",
  "evidence",
  "defects",
  "recommendations",
  "corrective_actions",
  "assessments",
  "verification",
  "close_out",
  "mobile_offline",
  "condition_rating",
] as const;

export const INSPECTION_V1_CANONICAL_TABLES = [
  "inspection_templates",
  "inspection_template_versions",
  "inspection_plans",
  "inspection_targets",
  "inspection_sessions",
  "inspection_observations",
  "inspection_measurements",
  "inspection_evidence",
  "inspection_reviews",
  "inspection_approvals",
  "inspection_events",
  "inspection_pack_registry",
  "inspection_defects",
  "inspection_recommendations",
  "inspection_corrective_actions",
  "inspection_assessments",
  "inspection_verifications",
  "inspection_compliance_links",
  "inspection_risk_links",
  "inspection_assignments",
  "inspection_workflow_instances",
  "inspection_reporting_outputs",
  "inspection_media_stages",
  "inspection_evidence_annotations",
  "inspection_attestations",
  "inspection_offline_packages",
  "inspection_offline_commands",
  "inspection_condition_ratings",
  "inspection_predictive_signals",
  "inspection_vision_analyses",
  "inspection_vision_derivatives",
] as const;

export const INSPECTION_V1_REPLACEMENT_MODELS_CREATED = false as const;
