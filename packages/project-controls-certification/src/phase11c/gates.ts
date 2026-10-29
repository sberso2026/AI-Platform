/**
 * Phase 11C certification gates A–AQ — Project Controls Schedule Intelligence.
 * 43 gates: A–Z (26) + AA–AQ (17).
 *
 * Phase 11C proves Schedule Intelligence is implemented while Progress
 * Intelligence from 11B stays intact. CPM, float and schedule execution
 * remain forbidden by construction.
 */
export const PHASE_11C_PROJECT_CONTROLS_SCHEDULE_GATES = [
  ["A", "Repository/build identity"],
  ["B", "Asset Intelligence V1 tag intact"],
  ["C", "Project Intelligence V1 integrity"],
  ["D", "Inspection Intelligence V1 integrity"],
  ["E", "Phase 11B progress intelligence intact"],
  ["F", "Canonical project identity owned by shared project domain"],
  ["G", "Schedule domain types declared"],
  ["H", "Schedule confidence engine with five sufficiency states"],
  ["I", "Schedule engine abstains without sufficient evidence"],
  ["J", "Schedule engine forbids CPM and float derivation"],
  ["K", "assertNoCpm guard in schedule engine"],
  ["L", "Schedule review workflow on the Engineering OS Workflow SDK"],
  ["M", "No self-approval and no autonomous schedule publication"],
  ["N", "Schedule and profile domain events declared"],
  ["O", "Persistence port extended for schedule tables"],
  ["P", "Postgres repository adapter for schedule tables"],
  ["Q", "Production memory repository forbidden"],
  ["R", "Role matrix with schedule capabilities"],
  ["S", "ScheduleIntelligenceService and engine facade"],
  ["T", "Project Context Engine composes with schedule contributor active"],
  ["U", "Two active profile contributors progress and schedule"],
  ["V", "Ownership lock schedule_controls_intelligence owns"],
  ["W", "Reserved ScheduleProvider CPM methods not_implemented"],
  ["X", "Project Controls schedule migration tables (batch 63)"],
  ["Y", "Schedule tables enforce tenant and workspace RLS"],
  ["Z", "Schedule tables CHECK-constrain the forbid locks"],
  ["AA", "Schedule tables reference engineering_projects by FK"],
  ["AB", "Outbox event types include schedule events"],
  ["AC", "Project profile schedule_summary column"],
  ["AD", "Schedule HTTP route"],
  ["AE", "Project profile HTTP route mentions scheduleIntelligenceReady"],
  ["AF", "No CPM or schedule execution implementation"],
  ["AG", "No earned value or cost engine"],
  ["AH", "Module registry still coming_soon and not GA"],
  ["AI", "Phase 11C architecture documents"],
  ["AJ", "Unit tests green"],
  ["AK", "Certification package and architecture test"],
  ["AL", "Secret exposure"],
  ["AM", "Artifact identity"],
  ["AN", "Hosted schedule and progress tables exist"],
  ["AO", "AI/PI/II V1 surfaces unmodified"],
  ["AP", "Phase 11D readiness"],
  ["AQ", "Schedule intelligence release eligibility"],
] as const;

export type Phase11cGateId = (typeof PHASE_11C_PROJECT_CONTROLS_SCHEDULE_GATES)[number][0];

export const PHASE_11C_GATE_COUNT = PHASE_11C_PROJECT_CONTROLS_SCHEDULE_GATES.length;

export const PHASE_11C_PROJECT_CONTROLS_VERSION = "0.3.0-schedule-intelligence" as const;

export const PHASE_11B_CERTIFIED_COMMIT =
  "336707d4baaf63b6a4e5f4ef4255f9ca8d7e4dd6" as const;
export const PHASE_11B_HOSTED_RUN = "31187156200" as const;
export const PHASE_11B_VERSION = "0.2.0-progress-intelligence" as const;

export const PHASE_11A_CERTIFIED_COMMIT =
  "b9a3a6091ec4af1eb1ebdd9749da497ce5af9700" as const;
export const PHASE_11A_HOSTED_RUN = "31179910364" as const;

export const PHASE_11C_ASSET_INTELLIGENCE_V1_TAG = "asset-intelligence-v1.0.0" as const;
export const PHASE_11C_ASSET_INTELLIGENCE_V1_COMMIT =
  "925e2ed74025cac6a145c346c17c53320efb8757" as const;
export const PHASE_11C_PROJECT_INTELLIGENCE_V1_TAG = "project-intelligence-v1.0.0" as const;
export const PHASE_11C_PROJECT_INTELLIGENCE_V1_COMMIT =
  "34975b1cf660580d46287f24e746b8915903f768" as const;
export const PHASE_11C_INSPECTION_INTELLIGENCE_V1_TAG =
  "inspection-intelligence-v1.0.0" as const;
export const PHASE_11C_INSPECTION_INTELLIGENCE_V1_COMMIT =
  "d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09" as const;

export const PHASE_11C_PROJECT_CONTROLS_SCHEDULE_TABLES = [
  "project_controls_schedule_assessments",
  "project_controls_schedule_evidence",
  "project_controls_schedule_reviews",
  "project_controls_schedule_snapshots",
  "project_controls_schedule_timeline",
] as const;

export const PHASE_11C_PROJECT_CONTROLS_PROGRESS_TABLES = [
  "project_controls_progress_assessments",
  "project_controls_progress_evidence",
  "project_controls_progress_reviews",
  "project_controls_progress_snapshots",
  "project_controls_progress_timeline",
  "project_controls_project_profiles",
  "project_controls_idempotency",
  "project_controls_outbox_events",
] as const;

export const PHASE_11C_FORBIDDEN_CAPABILITIES = [
  "EARNED_VALUE_IMPLEMENTED",
  "CPM_SCHEDULING_IMPLEMENTED",
  "FLOAT_COMPUTATION_IMPLEMENTED",
  "COST_ENGINE_IMPLEMENTED",
  "BUDGET_LEDGER_IMPLEMENTED",
  "SCHEDULE_EXECUTION_IMPLEMENTED",
  "FORECASTING_IMPLEMENTED",
  "RESOURCE_LEVELING_IMPLEMENTED",
  "CHANGE_CONTROL_IMPLEMENTED",
  "CONTINGENCY_MANAGEMENT_IMPLEMENTED",
] as const;

export const PHASE_11C_PROJECT_IDENTITY_OWNER = "engineering_os_shared_project_domain" as const;
