/**
 * Phase 11B certification gates A–AS — Project Controls Foundation,
 * Engineering Shared Project Domain and Progress Intelligence.
 * 45 gates: A–Z (26) + AA–AS (19).
 *
 * Unlike Phase 11A, which proved the *absence* of a Project Controls product,
 * Phase 11B proves the presence of one real capability while every other
 * capability stays absent by construction. Gates therefore come in two flavours:
 * presence gates for the shared project domain, the progress slice and its
 * persistence; and continuing absence gates for earned value, CPM, cost,
 * schedule execution, forecasting, product UI and module GA.
 */
export const PHASE_11B_PROJECT_CONTROLS_PROGRESS_GATES = [
  ["A", "Repository/build identity"],
  ["B", "Asset Intelligence V1 tag intact"],
  ["C", "Project Intelligence V1 integrity"],
  ["D", "Inspection Intelligence V1 integrity"],
  ["E", "Canonical project identity owned by shared project domain"],
  ["F", "Identity owner spelling unified in Phase 11B"],
  ["G", "Engineering Shared Project Domain package exists"],
  ["H", "Shared project domain reference types complete"],
  ["I", "Project reference resolution port is read-only"],
  ["J", "Shared project domain reference migration (batch 61)"],
  ["K", "Project Controls consumes ProjectReference only"],
  ["L", "Reserved providers are interfaces that throw not_implemented"],
  ["M", "Progress domain types declared"],
  ["N", "Progress confidence engine with five sufficiency states"],
  ["O", "Progress engine abstains without sufficient evidence"],
  ["P", "Progress engine forbids earned value derivation"],
  ["Q", "Project Context Engine composes a ProjectProfile"],
  ["R", "Reserved project profile contributors declared"],
  ["S", "Progress review workflow on the Engineering OS Workflow SDK"],
  ["T", "No self-approval and no autonomous progress publication"],
  ["U", "Progress and profile domain events declared"],
  ["V", "Persistence port and memory adapter"],
  ["W", "Postgres repository adapter"],
  ["X", "Production memory repository forbidden"],
  ["Y", "Role matrix with no reserved-concern capabilities"],
  ["Z", "Services and engine facade"],
  ["AA", "Project Controls progress migration tables (batch 62)"],
  ["AB", "Progress tables enforce tenant and workspace RLS"],
  ["AC", "Progress tables CHECK-constrain the forbid locks"],
  ["AD", "Progress tables reference engineering_projects by FK"],
  ["AE", "Progress HTTP route"],
  ["AF", "Project profile HTTP route"],
  ["AG", "No earned value or CPM implementation"],
  ["AH", "No cost, schedule execution, forecasting or levelling engine"],
  ["AI", "Module registry still coming_soon and not GA"],
  ["AJ", "Commerce entitlements remain entitlement-only"],
  ["AK", "Phase 11B architecture documents"],
  ["AL", "Unit tests green"],
  ["AM", "Certification package and architecture test"],
  ["AN", "Secret exposure"],
  ["AO", "Artifact identity"],
  ["AP", "Hosted progress and reference tables exist"],
  ["AQ", "AI/PI/II V1 surfaces unmodified"],
  ["AR", "Phase 11C readiness"],
  ["AS", "Progress intelligence release eligibility"],
] as const;

export type Phase11bGateId = (typeof PHASE_11B_PROJECT_CONTROLS_PROGRESS_GATES)[number][0];

export const PHASE_11B_GATE_COUNT = PHASE_11B_PROJECT_CONTROLS_PROGRESS_GATES.length;

export const PHASE_11B_PROJECT_CONTROLS_VERSION = "0.2.0-progress-intelligence" as const;
export const PHASE_11B_SHARED_PROJECT_DOMAIN_VERSION = "0.1.0-shared-project-domain" as const;

export const PHASE_11B_PROJECT_IDENTITY_OWNER = "engineering_os_shared_project_domain" as const;
export const PHASE_11B_ASSET_IDENTITY_OWNER = "engineering_os_shared_domain" as const;

/** Phase 11A is the certified baseline Phase 11B builds on. */
export const PHASE_11A_CERTIFIED_COMMIT =
  "b9a3a6091ec4af1eb1ebdd9749da497ce5af9700" as const;
export const PHASE_11A_HOSTED_RUN = "31179910364" as const;

export const PHASE_11B_ASSET_INTELLIGENCE_V1_TAG = "asset-intelligence-v1.0.0" as const;
export const PHASE_11B_ASSET_INTELLIGENCE_V1_COMMIT =
  "925e2ed74025cac6a145c346c17c53320efb8757" as const;
export const PHASE_11B_PROJECT_INTELLIGENCE_V1_TAG = "project-intelligence-v1.0.0" as const;
export const PHASE_11B_PROJECT_INTELLIGENCE_V1_COMMIT =
  "34975b1cf660580d46287f24e746b8915903f768" as const;
export const PHASE_11B_INSPECTION_INTELLIGENCE_V1_TAG =
  "inspection-intelligence-v1.0.0" as const;
export const PHASE_11B_INSPECTION_INTELLIGENCE_V1_COMMIT =
  "d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09" as const;

/** Project Controls tables introduced by the Phase 11B progress slice. */
export const PHASE_11B_PROJECT_CONTROLS_TABLES = [
  "project_controls_progress_assessments",
  "project_controls_progress_evidence",
  "project_controls_progress_reviews",
  "project_controls_progress_snapshots",
  "project_controls_progress_timeline",
  "project_controls_project_profiles",
  "project_controls_idempotency",
  "project_controls_outbox_events",
] as const;

/** Identity reference tables owned by the shared project domain. */
export const PHASE_11B_SHARED_PROJECT_DOMAIN_TABLES = [
  "engineering_project_phases",
  "engineering_wbs_nodes",
  "engineering_work_packages",
  "engineering_activities",
  "engineering_milestones",
] as const;

/** Capabilities that must still be unimplemented after Phase 11B. */
export const PHASE_11B_FORBIDDEN_CAPABILITIES = [
  "EARNED_VALUE_IMPLEMENTED",
  "CPM_SCHEDULING_IMPLEMENTED",
  "COST_ENGINE_IMPLEMENTED",
  "BUDGET_LEDGER_IMPLEMENTED",
  "SCHEDULE_EXECUTION_IMPLEMENTED",
  "FORECASTING_IMPLEMENTED",
  "RESOURCE_LEVELING_IMPLEMENTED",
  "WORK_PACKAGING_UI_IMPLEMENTED",
  "CHANGE_CONTROL_IMPLEMENTED",
  "CONTINGENCY_MANAGEMENT_IMPLEMENTED",
  "PRODUCTIVITY_ANALYSIS_IMPLEMENTED",
  "CLAIMS_ANALYSIS_IMPLEMENTED",
  "CASH_FLOW_IMPLEMENTED",
  "COMMITMENT_TRACKING_IMPLEMENTED",
] as const;
