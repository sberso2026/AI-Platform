/**
 * Phase 11G certification gates A–BC — Project Controls Forecast Intelligence.
 * 55 gates: A–Z (26) + AA–BC (29).
 *
 * Phase 11G proves Forecast Intelligence is implemented as advisory intelligence
 * while Progress (11B) through Productivity (11F) Intelligence
 * stay intact.
 *
 * Forbidden by construction and asserted by these gates: no workforce management,
 * no payroll, no timesheets, no resource planning, no labour productivity %,
 * no forecast engine, no earned value, no CPM, no schedule execution and no
 * duplicate project ownership.
 */
export const PHASE_11G_PROJECT_CONTROLS_FORECAST_GATES = [
  ["A", "Repository/build identity"],
  ["B", "Phase 11A regression"],
  ["C", "Phase 11B regression"],
  ["D", "Phase 11C regression"],
  ["E", "Phase 11D regression"],
  ["F", "Phase 11F regression"],
  ["G", "PI v1 integrity"],
  ["H", "II v1 integrity"],
  ["I", "AI v1 integrity"],
  ["J", "Shared Project Domain"],
  ["K", "Ownership locks"],
  ["L", "Forecast terminology"],
  ["M", "Project context composition"],
  ["N", "Forecast Control Context"],
  ["O", "Forecast Intelligence Engine"],
  ["P", "Forecast Intelligence State"],
  ["Q", "Forecast posture governance"],
  ["R", "Composition layer governance"],
  ["S", "Forecast Evidence"],
  ["T", "Forecast Confidence"],
  ["U", "Trajectory unit governance"],
  ["V", "Reporting period/as-of governance"],
  ["W", "Contributor refs"],
  ["X", "Project Context integration"],
  ["Y", "Project Profile"],
  ["Z", "Shared ProjectSnapshot"],
  ["AA", "Shared ProjectTimeline"],
  ["AB", "Governed review"],
  ["AC", "Segregation of duties"],
  ["AD", "Hosted migration"],
  ["AE", "Hosted persistence"],
  ["AF", "Predictive ForecastProvider reserved"],
  ["AG", "ForecastProvider reserved"],
  ["AH", "EarnedValueProvider reserved"],
  ["AI", "ResourcePlanningProvider reserved"],
  ["AJ", "EV calculations forbidden"],
  ["AK", "Forecast calculations forbidden"],
  ["AL", "Completion date forbidden"],
  ["AM", "Cost forecast forbidden"],
  ["AN", "Event/outbox integrity"],
  ["AO", "HTTP contracts"],
  ["AP", "JWT role matrix"],
  ["AQ", "Tenant isolation"],
  ["AR", "Workspace isolation"],
  ["AS", "IDOR"],
  ["AT", "Idempotency"],
  ["AU", "Concurrency"],
  ["AV", "Observability"],
  ["AW", "Performance"],
  ["AX", "No memory production"],
  ["AY", "No CPM"],
  ["AZ", "No schedule execution"],
  ["BA", "No duplicate project ownership"],
  ["BB", "Frozen V1 tag integrity"],
  ["BC", "Phase 11H readiness"],
] as const;

export type Phase11gGateId = (typeof PHASE_11G_PROJECT_CONTROLS_FORECAST_GATES)[number][0];

export const PHASE_11G_GATE_COUNT = PHASE_11G_PROJECT_CONTROLS_FORECAST_GATES.length;

export const PHASE_11G_PROJECT_CONTROLS_VERSION = "0.7.0-forecast-intelligence" as const;

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

export const PHASE_11E_CERTIFIED_COMMIT =
  "83edd1302a621560511255eb8071d4ad5c9343a9" as const;
export const PHASE_11E_HOSTED_RUN = "31232558080" as const;
export const PHASE_11E_VERSION = "0.5.0-cost-intelligence" as const;

export const PHASE_11F_ASSET_INTELLIGENCE_V1_TAG = "asset-intelligence-v1.0.0" as const;
export const PHASE_11F_ASSET_INTELLIGENCE_V1_COMMIT =
  "925e2ed74025cac6a145c346c17c53320efb8757" as const;
export const PHASE_11F_PROJECT_INTELLIGENCE_V1_TAG = "project-intelligence-v1.0.0" as const;
export const PHASE_11F_PROJECT_INTELLIGENCE_V1_COMMIT =
  "34975b1cf660580d46287f24e746b8915903f768" as const;
export const PHASE_11F_INSPECTION_INTELLIGENCE_V1_TAG =
  "inspection-intelligence-v1.0.0" as const;
export const PHASE_11F_INSPECTION_INTELLIGENCE_V1_COMMIT =
  "d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09" as const;

export const PHASE_11F_CERTIFIED_COMMIT =
  "15702b8eeb0627dda27411e27966e24c4aaead4b" as const;
export const PHASE_11F_HOSTED_RUN = "31234010313" as const;
export const PHASE_11F_VERSION = "0.6.0-productivity-intelligence" as const;

export const PHASE_11G_PROJECT_CONTROLS_FORECAST_TABLES = [
  "project_controls_forecast_states",
  "project_controls_forecast_evidence",
  "project_controls_forecast_reviews",
  "project_controls_forecast_confidence",
] as const;

export const PHASE_11G_PROJECT_CONTROLS_PRODUCTIVITY_TABLES = [
  "project_controls_productivity_states",
  "project_controls_productivity_evidence",
  "project_controls_productivity_reviews",
  "project_controls_productivity_confidence",
] as const;

export const PHASE_11F_PROJECT_CONTROLS_COST_TABLES = [
  "project_controls_cost_states",
  "project_controls_cost_evidence",
  "project_controls_cost_reviews",
  "project_controls_cost_confidence",
] as const;

export const PHASE_11F_PROJECT_CONTROLS_CHANGE_TABLES = [
  "project_controls_change_states",
  "project_controls_change_evidence",
  "project_controls_change_reviews",
  "project_controls_change_confidence",
  "project_controls_change_candidates",
] as const;

export const PHASE_11F_PROJECT_CONTROLS_SHARED_PROJECT_TABLES = [
  "project_controls_project_snapshots",
  "project_controls_project_timeline",
] as const;

export const PHASE_11F_PROJECT_CONTROLS_SCHEDULE_TABLES = [
  "project_controls_schedule_assessments",
  "project_controls_schedule_evidence",
  "project_controls_schedule_reviews",
  "project_controls_schedule_snapshots",
  "project_controls_schedule_timeline",
] as const;

export const PHASE_11F_PROJECT_CONTROLS_PROGRESS_TABLES = [
  "project_controls_progress_assessments",
  "project_controls_progress_evidence",
  "project_controls_progress_reviews",
  "project_controls_progress_snapshots",
  "project_controls_progress_timeline",
  "project_controls_project_profiles",
  "project_controls_idempotency",
  "project_controls_outbox_events",
] as const;

export const PHASE_11F_FORBIDDEN_WORKFORCE_TABLES = [
  "timesheets",
  "payroll",
  "workforce_management",
  "resource_planning",
] as const;

export const PHASE_11F_FORBIDDEN_CAPABILITIES = [
  "EARNED_VALUE_IMPLEMENTED",
  "CPM_SCHEDULING_IMPLEMENTED",
  "FLOAT_COMPUTATION_IMPLEMENTED",
  "RESOURCE_PLANNING_IMPLEMENTED",
  "TIMESHEET_SYSTEM_IMPLEMENTED",
  "PAYROLL_IMPLEMENTED",
  "LABOUR_COST_ENGINE_IMPLEMENTED",
  "COST_ENGINE_IMPLEMENTED",
  "BUDGET_LEDGER_IMPLEMENTED",
  "FINANCIAL_POSTING_IMPLEMENTED",
  "SCHEDULE_EXECUTION_IMPLEMENTED",
  "CHANGE_EXECUTION_IMPLEMENTED",
  "FORECASTING_IMPLEMENTED",
  "FORECAST_ENGINE_IMPLEMENTED",
  "RESOURCE_LEVELING_IMPLEMENTED",
  "CONTINGENCY_MANAGEMENT_IMPLEMENTED",
  "AUTONOMOUS_FORECAST_PUBLICATION_ALLOWED",
  "CONTRACTUAL_CHANGE_APPROVAL_BY_AI_ALLOWED",
  "FORECAST_EXECUTION_IMPLEMENTED",
] as const;

export const PHASE_11G_REQUIRED_CAPABILITIES = [
  "SHARED_PROJECT_DOMAIN_READY",
  "PROJECT_CONTEXT_ENGINE_READY",
  "PROJECT_CONTEXT_COMPOSITION_READY",
  "PROGRESS_INTELLIGENCE_READY",
  "SCHEDULE_INTELLIGENCE_READY",
  "CHANGE_INTELLIGENCE_READY",
  "COST_INTELLIGENCE_READY",
  "PRODUCTIVITY_INTELLIGENCE_READY",
  "FORECAST_INTELLIGENCE_READY",
  "FORECAST_CONFIDENCE_ENGINE_READY",
  "FORECAST_REVIEW_WORKFLOW_READY",
  "FORECAST_PERSISTENCE_READY",
  "FORECAST_INTELLIGENCE_IS_ADVISORY_ONLY",
  "PROJECT_TIMELINE_READY",
  "PROJECT_SNAPSHOT_READY",
  "AI_MAY_PUBLISH_FORECAST_FORBIDDEN",
  "PHASE_11G_READY",
  "PHASE_11H_READY",
] as const;

export const PHASE_11G_FORECAST_EVENTS = [
  "engineering.project.forecast.updated",
  "engineering.project.forecast.reviewed",
  "engineering.project.forecast.published",
] as const;

export const PHASE_11F_PROJECT_IDENTITY_OWNER = "engineering_os_shared_project_domain" as const;
export const PHASE_11G_FORECAST_INTELLIGENCE_OWNER = "project_controls" as const;
export const PHASE_11F_FINANCIAL_LEDGER_OWNER = "external_finance_or_future_finance_domain" as const;
export const PHASE_11F_CONTRACTUAL_CHANGE_AUTHORITY_OWNER =
  "reserved_not_project_controls" as const;
