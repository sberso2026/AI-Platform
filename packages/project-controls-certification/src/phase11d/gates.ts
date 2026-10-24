/**
 * Phase 11D certification gates A–AW — Project Controls Change Intelligence.
 * 49 gates: A–Z (26) + AA–AW (23).
 *
 * Phase 11D proves Change Intelligence is implemented as advisory intelligence
 * while Progress (11B) and Schedule (11C) Intelligence stay intact.
 *
 * Forbidden by construction in Phase 11D and asserted by these gates:
 * no Cost Intelligence, no Cost Engine, no Budget Ledger, no Financial Posting,
 * no Forecast, no Earned Value, no CPM, no float computation, no schedule
 * execution and no contractual change approval engine. Project Controls
 * assesses change; it never approves change.
 */
export const PHASE_11D_PROJECT_CONTROLS_CHANGE_GATES = [
  ["A", "Repository/build identity"],
  ["B", "Asset Intelligence V1 tag intact"],
  ["C", "Project Intelligence V1 integrity"],
  ["D", "Inspection Intelligence V1 integrity"],
  ["E", "Phase 11B progress intelligence intact"],
  ["F", "Phase 11C schedule intelligence intact"],
  ["G", "Canonical project identity owned by shared project domain"],
  ["H", "Change domain types declared"],
  ["I", "Change signal, candidate and reference separated from approved change"],
  ["J", "Change evidence carries provenance and no payload duplication"],
  ["K", "Change confidence engine with six sufficiency states"],
  ["L", "Change engine abstains without sufficient evidence"],
  ["M", "Change impact contexts are advisory enums, never quantum"],
  ["N", "assertNoCostEngine guard in change engine"],
  ["O", "assertNoContractualApproval guard in change engine"],
  ["P", "Change review workflow on the Engineering OS Workflow SDK"],
  ["Q", "Assessment approval is not contractual approval"],
  ["R", "No self-approval and no autonomous change publication"],
  ["S", "Change, candidate and snapshot domain events declared"],
  ["T", "Change event payloads carry identifiers only"],
  ["U", "Persistence port extended for change tables"],
  ["V", "Postgres repository adapter for change tables"],
  ["W", "Production memory repository forbidden"],
  ["X", "Role matrix with change capabilities"],
  ["Y", "ChangeIntelligenceService and engine facade"],
  ["Z", "Project Context Engine composes with change contributor active"],
  ["AA", "Three active profile contributors progress, schedule and change"],
  ["AB", "Cost intelligence contributor stays reserved for Phase 11E"],
  ["AC", "Ownership lock change_controls_intelligence owns"],
  ["AD", "Contractual change authority reserved outside Project Controls"],
  ["AE", "Financial ledger ownership external_finance_or_future_finance_domain"],
  ["AF", "Reserved ChangeProvider contractual methods not_implemented"],
  ["AG", "Reserved BaselineProvider and ContingencyProvider not_implemented"],
  ["AH", "Project Controls change migration tables (batch 64)"],
  ["AI", "Change tables enforce tenant and workspace RLS"],
  ["AJ", "Change tables CHECK-constrain the forbid locks"],
  ["AK", "Change tables reference engineering_projects by FK"],
  ["AL", "Project snapshot and timeline tables introduced"],
  ["AM", "Outbox event types include change and snapshot events"],
  ["AN", "Project profile change_summary column"],
  ["AO", "Change HTTP route"],
  ["AP", "Snapshot HTTP route"],
  ["AQ", "Project profile HTTP route mentions changeIntelligenceReady"],
  ["AR", "No cost engine, budget ledger or financial posting"],
  ["AS", "No earned value, CPM, float, forecast or schedule execution"],
  ["AT", "Module registry still coming_soon and not GA"],
  ["AU", "Phase 11D architecture documents"],
  ["AV", "Unit tests green and secret exposure clean"],
  ["AW", "Change intelligence release eligibility and Phase 11E readiness"],
] as const;

export type Phase11dGateId = (typeof PHASE_11D_PROJECT_CONTROLS_CHANGE_GATES)[number][0];

export const PHASE_11D_GATE_COUNT = PHASE_11D_PROJECT_CONTROLS_CHANGE_GATES.length;

export const PHASE_11D_PROJECT_CONTROLS_VERSION = "0.4.0-change-intelligence" as const;

export const PHASE_11C_CERTIFIED_COMMIT =
  "e9b137902d8fe749a6ce62bc0903ab9410320e77" as const;
export const PHASE_11C_HOSTED_RUN = "31189507016" as const;
export const PHASE_11C_VERSION = "0.3.0-schedule-intelligence" as const;

export const PHASE_11B_CERTIFIED_COMMIT =
  "336707d4baaf63b6a4e5f4ef4255f9ca8d7e4dd6" as const;
export const PHASE_11B_HOSTED_RUN = "31187156200" as const;
export const PHASE_11B_VERSION = "0.2.0-progress-intelligence" as const;

export const PHASE_11A_CERTIFIED_COMMIT =
  "b9a3a6091ec4af1eb1ebdd9749da497ce5af9700" as const;
export const PHASE_11A_HOSTED_RUN = "31179910364" as const;

export const PHASE_11D_ASSET_INTELLIGENCE_V1_TAG = "asset-intelligence-v1.0.0" as const;
export const PHASE_11D_ASSET_INTELLIGENCE_V1_COMMIT =
  "925e2ed74025cac6a145c346c17c53320efb8757" as const;
export const PHASE_11D_PROJECT_INTELLIGENCE_V1_TAG = "project-intelligence-v1.0.0" as const;
export const PHASE_11D_PROJECT_INTELLIGENCE_V1_COMMIT =
  "34975b1cf660580d46287f24e746b8915903f768" as const;
export const PHASE_11D_INSPECTION_INTELLIGENCE_V1_TAG =
  "inspection-intelligence-v1.0.0" as const;
export const PHASE_11D_INSPECTION_INTELLIGENCE_V1_COMMIT =
  "d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09" as const;

export const PHASE_11D_PROJECT_CONTROLS_CHANGE_TABLES = [
  "project_controls_change_states",
  "project_controls_change_evidence",
  "project_controls_change_reviews",
  "project_controls_change_confidence",
  "project_controls_change_candidates",
] as const;

export const PHASE_11D_PROJECT_CONTROLS_SHARED_PROJECT_TABLES = [
  "project_controls_project_snapshots",
  "project_controls_project_timeline",
] as const;

export const PHASE_11D_PROJECT_CONTROLS_SCHEDULE_TABLES = [
  "project_controls_schedule_assessments",
  "project_controls_schedule_evidence",
  "project_controls_schedule_reviews",
  "project_controls_schedule_snapshots",
  "project_controls_schedule_timeline",
] as const;

export const PHASE_11D_PROJECT_CONTROLS_PROGRESS_TABLES = [
  "project_controls_progress_assessments",
  "project_controls_progress_evidence",
  "project_controls_progress_reviews",
  "project_controls_progress_snapshots",
  "project_controls_progress_timeline",
  "project_controls_project_profiles",
  "project_controls_idempotency",
  "project_controls_outbox_events",
] as const;

export const PHASE_11D_FORBIDDEN_CAPABILITIES = [
  "EARNED_VALUE_IMPLEMENTED",
  "CPM_SCHEDULING_IMPLEMENTED",
  "FLOAT_COMPUTATION_IMPLEMENTED",
  "COST_ENGINE_IMPLEMENTED",
  "BUDGET_LEDGER_IMPLEMENTED",
  "FINANCIAL_POSTING_IMPLEMENTED",
  "SCHEDULE_EXECUTION_IMPLEMENTED",
  "CHANGE_EXECUTION_IMPLEMENTED",
  "FORECASTING_IMPLEMENTED",
  "RESOURCE_LEVELING_IMPLEMENTED",
  "CONTINGENCY_MANAGEMENT_IMPLEMENTED",
  "AUTONOMOUS_CHANGE_PUBLICATION_ALLOWED",
  "CONTRACTUAL_CHANGE_APPROVAL_BY_AI_ALLOWED",
] as const;

export const PHASE_11D_REQUIRED_CAPABILITIES = [
  "SHARED_PROJECT_DOMAIN_READY",
  "PROJECT_CONTEXT_ENGINE_READY",
  "PROGRESS_INTELLIGENCE_READY",
  "SCHEDULE_INTELLIGENCE_READY",
  "CHANGE_INTELLIGENCE_READY",
  "CHANGE_CONFIDENCE_ENGINE_READY",
  "CHANGE_REVIEW_WORKFLOW_READY",
  "CHANGE_PERSISTENCE_READY",
  "CHANGE_INTELLIGENCE_IS_ADVISORY_ONLY",
  "PROJECT_TIMELINE_READY",
  "PROJECT_SNAPSHOT_READY",
  "AI_MAY_PUBLISH_CHANGE_FORBIDDEN",
] as const;

export const PHASE_11D_CHANGE_EVENTS = [
  "engineering.project.change.assessed",
  "engineering.project.change.reviewed",
  "engineering.project.change.published",
  "engineering.project.change.superseded",
  "engineering.project.change_candidate.created",
  "engineering.project.snapshot.created",
] as const;

export const PHASE_11D_PROJECT_IDENTITY_OWNER = "engineering_os_shared_project_domain" as const;
export const PHASE_11D_CHANGE_INTELLIGENCE_OWNER = "project_controls" as const;
export const PHASE_11D_CONTRACTUAL_CHANGE_AUTHORITY_OWNER = "reserved_not_project_controls" as const;
export const PHASE_11D_FINANCIAL_LEDGER_OWNER = "external_finance_or_future_finance_domain" as const;
