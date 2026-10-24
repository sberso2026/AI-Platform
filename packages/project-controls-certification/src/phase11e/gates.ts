/**
 * Phase 11E certification gates A–BC — Project Controls Cost Intelligence.
 * 55 gates: A–Z (26) + AA–BC (29).
 *
 * Phase 11E proves Cost Intelligence is implemented as advisory intelligence
 * while Progress (11B), Schedule (11C) and Change (11D) Intelligence stay intact.
 *
 * Forbidden by construction and asserted by these gates: no budget ledger, no
 * financial posting, no earned value, no forecast engine, no CPM, no float
 * computation, no schedule execution and no duplicate project ownership.
 */
export const PHASE_11E_PROJECT_CONTROLS_COST_GATES = [
  ["A", "Repository/build identity"],
  ["B", "Phase 11A regression"],
  ["C", "Phase 11B regression"],
  ["D", "Phase 11C regression"],
  ["E", "Phase 11D regression"],
  ["F", "PI v1 integrity"],
  ["G", "II v1 integrity"],
  ["H", "AI v1 integrity"],
  ["I", "Shared Project Domain"],
  ["J", "Ownership locks"],
  ["K", "Cost terminology"],
  ["L", "Finance boundary"],
  ["M", "Cost Control Context"],
  ["N", "Cost Intelligence Engine"],
  ["O", "Cost Intelligence State"],
  ["P", "Cost posture governance"],
  ["Q", "Change attribution"],
  ["R", "Cost Evidence"],
  ["S", "Cost Confidence"],
  ["T", "Currency governance"],
  ["U", "Reporting period/as-of governance"],
  ["V", "Cost structure refs"],
  ["W", "Project Context integration"],
  ["X", "Project Profile"],
  ["Y", "Shared ProjectSnapshot"],
  ["Z", "Shared ProjectTimeline"],
  ["AA", "Governed review"],
  ["AB", "Segregation of duties"],
  ["AC", "Hosted migration"],
  ["AD", "Hosted persistence"],
  ["AE", "CostProvider bounded"],
  ["AF", "ForecastProvider reserved"],
  ["AG", "EarnedValueProvider reserved"],
  ["AH", "EV calculations forbidden"],
  ["AI", "Forecast calculations forbidden"],
  ["AJ", "Financial posting forbidden"],
  ["AK", "Budget ledger forbidden"],
  ["AL", "Event/outbox integrity"],
  ["AM", "HTTP contracts"],
  ["AN", "JWT role matrix"],
  ["AO", "Tenant isolation"],
  ["AP", "Workspace isolation"],
  ["AQ", "IDOR"],
  ["AR", "Idempotency"],
  ["AS", "Concurrency"],
  ["AT", "Observability"],
  ["AU", "Performance"],
  ["AV", "No memory production"],
  ["AW", "No CPM"],
  ["AX", "No schedule execution"],
  ["AY", "No duplicate project ownership"],
  ["AZ", "Frozen V1 tag integrity"],
  ["BA", "Secret exposure"],
  ["BB", "Artifact identity"],
  ["BC", "Phase 11F readiness"],
] as const;

export type Phase11eGateId = (typeof PHASE_11E_PROJECT_CONTROLS_COST_GATES)[number][0];

export const PHASE_11E_GATE_COUNT = PHASE_11E_PROJECT_CONTROLS_COST_GATES.length;

export const PHASE_11E_PROJECT_CONTROLS_VERSION = "0.5.0-cost-intelligence" as const;

export const PHASE_11A_CERTIFIED_COMMIT =
  "b9a3a6091ec4af1eb1ebdd9749da497ce5af9700" as const;
export const PHASE_11A_HOSTED_RUN = "31179910364" as const;
export const PHASE_11A_VERSION = "0.1.0-discovery" as const;

export const PHASE_11B_CERTIFIED_COMMIT =
  "336707d4baaf63b6a4e5f4ef4255f9ca8d7e4dd6" as const;
export const PHASE_11B_HOSTED_RUN = "31187156200" as const;
export const PHASE_11B_VERSION = "0.2.0-progress-intelligence" as const;

export const PHASE_11C_CERTIFIED_COMMIT =
  "e9b137902d8fe749a6ce62bc0903ab9410320e77" as const;
export const PHASE_11C_HOSTED_RUN = "31189507016" as const;
export const PHASE_11C_VERSION = "0.3.0-schedule-intelligence" as const;

export const PHASE_11D_CERTIFIED_COMMIT =
  "3a27fde6bb15fd6298feafca121438dddb2087af" as const;
export const PHASE_11D_HOSTED_RUN = "31231309349" as const;
export const PHASE_11D_VERSION = "0.4.0-change-intelligence" as const;

export const PHASE_11E_ASSET_INTELLIGENCE_V1_TAG = "asset-intelligence-v1.0.0" as const;
export const PHASE_11E_ASSET_INTELLIGENCE_V1_COMMIT =
  "925e2ed74025cac6a145c346c17c53320efb8757" as const;
export const PHASE_11E_PROJECT_INTELLIGENCE_V1_TAG = "project-intelligence-v1.0.0" as const;
export const PHASE_11E_PROJECT_INTELLIGENCE_V1_COMMIT =
  "34975b1cf660580d46287f24e746b8915903f768" as const;
export const PHASE_11E_INSPECTION_INTELLIGENCE_V1_TAG =
  "inspection-intelligence-v1.0.0" as const;
export const PHASE_11E_INSPECTION_INTELLIGENCE_V1_COMMIT =
  "d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09" as const;

export const PHASE_11E_PROJECT_CONTROLS_COST_TABLES = [
  "project_controls_cost_states",
  "project_controls_cost_evidence",
  "project_controls_cost_reviews",
  "project_controls_cost_confidence",
] as const;

export const PHASE_11E_PROJECT_CONTROLS_CHANGE_TABLES = [
  "project_controls_change_states",
  "project_controls_change_evidence",
  "project_controls_change_reviews",
  "project_controls_change_confidence",
  "project_controls_change_candidates",
] as const;

export const PHASE_11E_PROJECT_CONTROLS_SHARED_PROJECT_TABLES = [
  "project_controls_project_snapshots",
  "project_controls_project_timeline",
] as const;

export const PHASE_11E_PROJECT_CONTROLS_SCHEDULE_TABLES = [
  "project_controls_schedule_assessments",
  "project_controls_schedule_evidence",
  "project_controls_schedule_reviews",
  "project_controls_schedule_snapshots",
  "project_controls_schedule_timeline",
] as const;

export const PHASE_11E_PROJECT_CONTROLS_PROGRESS_TABLES = [
  "project_controls_progress_assessments",
  "project_controls_progress_evidence",
  "project_controls_progress_reviews",
  "project_controls_progress_snapshots",
  "project_controls_progress_timeline",
  "project_controls_project_profiles",
  "project_controls_idempotency",
  "project_controls_outbox_events",
] as const;

export const PHASE_11E_FORBIDDEN_LEDGER_TABLES = [
  "financial_ledger",
  "gl",
  "invoice_ledger",
  "budget_ledger",
] as const;

export const PHASE_11E_FORBIDDEN_CAPABILITIES = [
  "EARNED_VALUE_IMPLEMENTED",
  "CPM_SCHEDULING_IMPLEMENTED",
  "FLOAT_COMPUTATION_IMPLEMENTED",
  "COST_ENGINE_IMPLEMENTED",
  "BUDGET_LEDGER_IMPLEMENTED",
  "FINANCIAL_POSTING_IMPLEMENTED",
  "SCHEDULE_EXECUTION_IMPLEMENTED",
  "CHANGE_EXECUTION_IMPLEMENTED",
  "FORECASTING_IMPLEMENTED",
  "FORECAST_ENGINE_IMPLEMENTED",
  "RESOURCE_LEVELING_IMPLEMENTED",
  "CONTINGENCY_MANAGEMENT_IMPLEMENTED",
  "AUTONOMOUS_COST_PUBLICATION_ALLOWED",
  "CONTRACTUAL_CHANGE_APPROVAL_BY_AI_ALLOWED",
] as const;

export const PHASE_11E_REQUIRED_CAPABILITIES = [
  "SHARED_PROJECT_DOMAIN_READY",
  "PROJECT_CONTEXT_ENGINE_READY",
  "PROGRESS_INTELLIGENCE_READY",
  "SCHEDULE_INTELLIGENCE_READY",
  "CHANGE_INTELLIGENCE_READY",
  "COST_INTELLIGENCE_READY",
  "COST_CONFIDENCE_ENGINE_READY",
  "COST_REVIEW_WORKFLOW_READY",
  "COST_PERSISTENCE_READY",
  "COST_INTELLIGENCE_IS_ADVISORY_ONLY",
  "PROJECT_TIMELINE_READY",
  "PROJECT_SNAPSHOT_READY",
  "AI_MAY_PUBLISH_COST_FORBIDDEN",
  "PHASE_11F_READY",
] as const;

export const PHASE_11E_COST_EVENTS = [
  "engineering.project.cost.assessed",
  "engineering.project.cost.reviewed",
  "engineering.project.cost.published",
  "engineering.project.cost.superseded",
  "engineering.project.cost.variance_attributed",
] as const;

export const PHASE_11E_PROJECT_IDENTITY_OWNER = "engineering_os_shared_project_domain" as const;
export const PHASE_11E_COST_INTELLIGENCE_OWNER = "project_controls" as const;
export const PHASE_11E_FINANCIAL_LEDGER_OWNER = "external_finance_or_future_finance_domain" as const;
export const PHASE_11E_CONTRACTUAL_CHANGE_AUTHORITY_OWNER =
  "reserved_not_project_controls" as const;
