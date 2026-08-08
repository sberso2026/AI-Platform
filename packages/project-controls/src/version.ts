/**
 * Phase 11N — Project Controls V1.0 GA. Single authoritative version source.
 *
 * Everything that publishes a Project Controls version (manifest, registries,
 * docs, certification, UI) reads from here. Nothing may hard-code a second one.
 *
 * Project Controls owns *intelligence ABOUT projects*. It never owns project
 * identity. Phase 11N closes V1.0 GA over the 11M baseline — twelve contributors
 * frozen at 1.0.0 with advisory-only intelligence surfaces.
 *
 * Scenario Intelligence produces exploratory advisory scenario comparisons from
 * published composed contributors, forecast intelligence, and decision support.
 * It is NOT auto-execution, NOT preferred scenario selection, NOT optimisation,
 * and NOT schedule/cost/contract instruction.
 *
 * Still forbidden: CPM, float, EV/CPI/SPI, resource planning, budget ledger,
 * financial posting, predictive scheduling, Monte Carlo, automatic scenario execution.
 */
export const PROJECT_CONTROLS_PRODUCT_NAME = "Project Controls" as const;
export const PROJECT_CONTROLS_MODULE_KEY = "project_controls" as const;
export const PROJECT_CONTROLS_VERSION = "1.0.0" as const;
export const PROJECT_CONTROLS_STATUS = "ga" as const;
export const PROJECT_CONTROLS_PHASE = "11N" as const;
export const PROJECT_CONTROLS_PREVIOUS_VERSION = "0.13.0-organizational-learning" as const;
export const PROJECT_CONTROLS_RELEASE_TAG = "project-controls-v1.0.0" as const;
export const PROJECT_CONTROLS_READINESS_MARKER = "project-controls-v1-ready" as const;
export const PROJECT_CONTROLS_PUBLIC_CONTRACT_VERSION = "1.0.0" as const;

export const PROJECT_CONTROLS_ROUTE_PREFIX = "/engineering/apps/project-controls" as const;
export const PROJECT_CONTROLS_API_PREFIX = "/api/engineering/project-controls" as const;
export const PROJECT_CONTROLS_PROGRESS_API_ROUTE =
  "/api/engineering/project-controls/progress" as const;
export const PROJECT_CONTROLS_SCHEDULE_API_ROUTE =
  "/api/engineering/project-controls/schedule" as const;
export const PROJECT_CONTROLS_CHANGE_API_ROUTE =
  "/api/engineering/project-controls/change" as const;
export const PROJECT_CONTROLS_COST_API_ROUTE =
  "/api/engineering/project-controls/cost" as const;
export const PROJECT_CONTROLS_PRODUCTIVITY_API_ROUTE =
  "/api/engineering/project-controls/productivity" as const;
export const PROJECT_CONTROLS_FORECAST_API_ROUTE =
  "/api/engineering/project-controls/forecast" as const;
export const PROJECT_CONTROLS_DECISION_API_ROUTE =
  "/api/engineering/project-controls/decision" as const;
export const PROJECT_CONTROLS_SCENARIO_API_ROUTE =
  "/api/engineering/project-controls/scenario" as const;
export const PROJECT_CONTROLS_RISK_OPPORTUNITY_API_ROUTE =
  "/api/engineering/project-controls/risk-opportunity" as const;
export const PROJECT_CONTROLS_ASSURANCE_API_ROUTE =
  "/api/engineering/project-controls/assurance" as const;
export const PROJECT_CONTROLS_EXPLAINABILITY_API_ROUTE =
  "/api/engineering/project-controls/explainability" as const;
export const PROJECT_CONTROLS_ORGANIZATIONAL_LEARNING_API_ROUTE =
  "/api/engineering/project-controls/organizational-learning" as const;
export const PROJECT_CONTROLS_SNAPSHOT_API_ROUTE =
  "/api/engineering/project-controls/snapshot" as const;
export const PROJECT_CONTROLS_PROFILE_API_ROUTE =
  "/api/engineering/project-controls/profile" as const;

// ---------------------------------------------------------------------------
// Certified baselines
// ---------------------------------------------------------------------------

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

export const PHASE_11F_CERTIFIED_COMMIT =
  "15702b8eeb0627dda27411e27966e24c4aaead4b" as const;
export const PHASE_11F_HOSTED_RUN = "31234010313" as const;
export const PHASE_11F_VERSION = "0.6.0-productivity-intelligence" as const;

export const PHASE_11G_CERTIFIED_COMMIT =
  "abdbf3153118baa0c3dc5758fac7a5137b84f5d7" as const;
export const PHASE_11G_HOSTED_RUN = "31238798319" as const;
export const PHASE_11G_VERSION = "0.7.0-forecast-intelligence" as const;

export const PHASE_11H_CERTIFIED_COMMIT =
  "9143abfe86234c115c84c5dc27c42ef48e2d3842" as const;
export const PHASE_11H_HOSTED_RUN = "31239588331" as const;
export const PHASE_11H_VERSION = "0.8.0-decision-support" as const;

export const PHASE_11I_CERTIFIED_COMMIT =
  "1dc73a070883ea4783869517da558ea34ff797eb" as const;
export const PHASE_11I_HOSTED_RUN = "31245651307" as const;
export const PHASE_11I_VERSION = "0.9.0-scenario-intelligence" as const;

export const PHASE_11J_CERTIFIED_COMMIT =
  "c840c93d8f7b5eb93d510437ad92b4087d067b2b" as const;
export const PHASE_11J_HOSTED_RUN = "31246586072" as const;
export const PHASE_11J_VERSION = "0.10.0-risk-opportunity-intelligence" as const;

export const PHASE_11K_CERTIFIED_COMMIT =
  "82ac9720247c96ca4029121b97c44dceb52b5145" as const;
export const PHASE_11K_HOSTED_RUN = "31248471330" as const;
export const PHASE_11K_VERSION = "0.11.0-assurance-intelligence" as const;

export const PHASE_11L_CERTIFIED_COMMIT =
  "5176bed8168ad39cca4de43b2f95737aab6569aa" as const;
export const PHASE_11L_HOSTED_RUN = "31249492990" as const;
export const PHASE_11L_VERSION = "0.12.0-explainability-intelligence" as const;

/** Authoritative Phase 11M baseline this GA release closes over. */
export const PHASE_11M_CERTIFIED_COMMIT =
  "c115329127266022a6233481671b77dee15ae1d7" as const;
export const PHASE_11M_HOSTED_RUN = "31250607668" as const;
export const PHASE_11M_VERSION = "0.13.0-organizational-learning" as const;

// ---------------------------------------------------------------------------
// Implementation state
// ---------------------------------------------------------------------------

export const PROJECT_CONTROLS_IMPLEMENTED = true as const;
export const PRODUCTION_PROJECT_CONTROLS_READY = true as const;
export const PROJECT_CONTROLS_DISCOVERY_IMPLEMENTED = true as const;

export const SHARED_PROJECT_DOMAIN_READY = true as const;
export const PROJECT_CONTEXT_ENGINE_READY = true as const;
export const PROGRESS_INTELLIGENCE_READY = true as const;
export const PROGRESS_CONFIDENCE_ENGINE_READY = true as const;
export const PROGRESS_REVIEW_WORKFLOW_READY = true as const;
export const PROGRESS_PERSISTENCE_READY = true as const;

export const SCHEDULE_INTELLIGENCE_READY = true as const;
export const SCHEDULE_CONFIDENCE_ENGINE_READY = true as const;
export const SCHEDULE_REVIEW_WORKFLOW_READY = true as const;
export const SCHEDULE_PERSISTENCE_READY = true as const;
export const SCHEDULE_INTELLIGENCE_IS_ADVISORY_ONLY = true as const;
export const SCHEDULE_INTELLIGENCE_IS_CPM = false as const;
export const SCHEDULE_INTELLIGENCE_EXECUTES_SCHEDULE = false as const;

export const CHANGE_INTELLIGENCE_READY = true as const;
export const CHANGE_CONFIDENCE_ENGINE_READY = true as const;
export const CHANGE_REVIEW_WORKFLOW_READY = true as const;
export const CHANGE_PERSISTENCE_READY = true as const;
export const CHANGE_INTELLIGENCE_IS_ADVISORY_ONLY = true as const;
export const CHANGE_INTELLIGENCE_IS_CONTRACTUAL_AUTHORITY = false as const;
export const PROJECT_TIMELINE_READY = true as const;
export const PROJECT_SNAPSHOT_READY = true as const;

/** Phase 11E capabilities that are genuinely implemented. */
export const COST_INTELLIGENCE_READY = true as const;
export const COST_CONFIDENCE_ENGINE_READY = true as const;
export const COST_REVIEW_WORKFLOW_READY = true as const;
export const COST_PERSISTENCE_READY = true as const;
export const COST_INTELLIGENCE_IS_ADVISORY_ONLY = true as const;

/** Phase 11F capabilities that are genuinely implemented. */
export const PRODUCTIVITY_INTELLIGENCE_READY = true as const;
export const PRODUCTIVITY_CONFIDENCE_ENGINE_READY = true as const;
export const PRODUCTIVITY_REVIEW_WORKFLOW_READY = true as const;
export const PRODUCTIVITY_PERSISTENCE_READY = true as const;
export const PRODUCTIVITY_INTELLIGENCE_IS_ADVISORY_ONLY = true as const;

/** Phase 11G capabilities that are genuinely implemented. */
export const FORECAST_INTELLIGENCE_READY = true as const;
export const FORECAST_CONFIDENCE_ENGINE_READY = true as const;
export const FORECAST_REVIEW_WORKFLOW_READY = true as const;
export const FORECAST_PERSISTENCE_READY = true as const;
export const FORECAST_INTELLIGENCE_IS_ADVISORY_ONLY = true as const;
export const PROJECT_CONTEXT_COMPOSITION_READY = true as const;

/** Phase 11H capabilities that are genuinely implemented. */
export const DECISION_SUPPORT_READY = true as const;
export const DECISION_CONFIDENCE_ENGINE_READY = true as const;
export const DECISION_REVIEW_WORKFLOW_READY = true as const;
export const DECISION_PERSISTENCE_READY = true as const;
export const DECISION_SUPPORT_IS_ADVISORY_ONLY = true as const;

/** Phase 11I capabilities that are genuinely implemented. */
export const SCENARIO_INTELLIGENCE_READY = true as const;
export const ScenarioIntelligenceReady = true as const;
export const SCENARIO_CONFIDENCE_ENGINE_READY = true as const;
export const SCENARIO_REVIEW_WORKFLOW_READY = true as const;
export const SCENARIO_PERSISTENCE_READY = true as const;
export const SCENARIO_INTELLIGENCE_IS_ADVISORY_ONLY = true as const;

/** Phase 11J capabilities that are genuinely implemented. */
export const RISK_OPPORTUNITY_INTELLIGENCE_READY = true as const;
export const RiskOpportunityIntelligenceReady = true as const;
export const RISK_OPPORTUNITY_CONFIDENCE_ENGINE_READY = true as const;
export const RISK_OPPORTUNITY_REVIEW_WORKFLOW_READY = true as const;
export const RISK_OPPORTUNITY_PERSISTENCE_READY = true as const;
export const RISK_OPPORTUNITY_INTELLIGENCE_IS_ADVISORY_ONLY = true as const;

/** Phase 11K capabilities that are genuinely implemented. */
export const ASSURANCE_INTELLIGENCE_READY = true as const;
export const AssuranceIntelligenceReady = true as const;
export const ASSURANCE_CONFIDENCE_ENGINE_READY = true as const;
export const ASSURANCE_REVIEW_WORKFLOW_READY = true as const;
export const ASSURANCE_PERSISTENCE_READY = true as const;
export const ASSURANCE_INTELLIGENCE_IS_ADVISORY_ONLY = true as const;

/** Phase 11L capabilities that remain genuinely implemented. */
export const EXPLAINABILITY_INTELLIGENCE_READY = true as const;
export const ExplainabilityIntelligenceReady = true as const;
export const EXPLAINABILITY_CONFIDENCE_ENGINE_READY = true as const;
export const EXPLAINABILITY_REVIEW_WORKFLOW_READY = true as const;
export const EXPLAINABILITY_PERSISTENCE_READY = true as const;
export const EXPLAINABILITY_INTELLIGENCE_IS_ADVISORY_ONLY = true as const;

/** Phase 11M capabilities that are genuinely implemented. */
export const ORGANIZATIONAL_LEARNING_INTELLIGENCE_READY = true as const;
export const OrganizationalLearningReady = true as const;
export const ORGANIZATIONAL_LEARNING_CONFIDENCE_ENGINE_READY = true as const;
export const ORGANIZATIONAL_LEARNING_REVIEW_WORKFLOW_READY = true as const;
export const ORGANIZATIONAL_LEARNING_PERSISTENCE_READY = true as const;
export const ORGANIZATIONAL_LEARNING_INTELLIGENCE_IS_ADVISORY_ONLY = true as const;

export const PROGRESS_MEASUREMENT_IMPLEMENTED = true as const;
export const PROGRESS_MEASUREMENT_IS_ADVISORY_ONLY = true as const;
export const PROGRESS_MEASUREMENT_IS_EARNED_VALUE = false as const;
export const PROGRESS_MEASUREMENT_CERTIFIED_FOR_PAYMENT = false as const;
export const PHYSICAL_PERCENT_COMPLETE_CERTIFIED = false as const;

export const PRODUCTION_MEMORY_REPOSITORY_ALLOWED = false as const;

// ---------------------------------------------------------------------------
// Ownership locks
// ---------------------------------------------------------------------------

export const PROJECT_CONTROLS_OWNERSHIP = "project_controls" as const;

export const CANONICAL_PROJECT_IDENTITY_OWNERSHIP =
  "engineering_os_shared_project_domain" as const;
export const PROJECT_IDENTITY_OWNERSHIP = "engineering_os_shared_project_domain" as const;
export const CANONICAL_PROJECT_HIERARCHY_OWNERSHIP =
  "engineering_os_shared_project_domain" as const;
export const CANONICAL_PROJECT_IDENTITY_PHYSICAL_STORE = "engineering_projects" as const;
export const CANONICAL_PROJECT_IDENTITY_CLAIMED_BY_PROJECT_CONTROLS = false as const;
export const PROJECT_IDENTITY_MUTATION_BY_PROJECT_CONTROLS_ALLOWED = false as const;
export const PROJECT_IDENTITY_OWNER_SPELLING_UNIFICATION = "unified_in_phase_11b" as const;
export const PROJECT_CONTROLS_CONSUMES_PROJECT_REFERENCE_ONLY = true as const;

export const CANONICAL_ASSET_IDENTITY_OWNERSHIP = "engineering_os_shared_domain" as const;
export const CANONICAL_ASSET_LIFECYCLE_OWNERSHIP = "engineering_os_shared_domain" as const;
export const CANONICAL_ENGINEERING_RISK_OWNERSHIP = "engineering_core" as const;
export const PROJECT_INTELLIGENCE_OWNERSHIP = "project_intelligence" as const;
export const ASSET_INTELLIGENCE_OWNERSHIP = "asset_intelligence" as const;
export const INSPECTION_INTELLIGENCE_OWNERSHIP = "inspection_intelligence" as const;

export const FINANCIAL_LEDGER_OWNERSHIP =
  "external_finance_or_future_finance_domain" as const;
export const ENTITLEMENTS_OWNERSHIP = "platform_commerce_finance" as const;
export const DIGITAL_TWIN_OWNERSHIP = "external_future" as const;
export const SHM_OWNERSHIP = "external_future" as const;
export const CMMS_WORK_ORDER_OWNERSHIP = "none_in_project_controls" as const;

export const PROGRESS_INTELLIGENCE_OWNERSHIP = "project_controls" as const;
export const SCHEDULE_INTELLIGENCE_OWNERSHIP = "project_controls" as const;
export const CHANGE_INTELLIGENCE_OWNERSHIP = "project_controls" as const;
export const COST_INTELLIGENCE_OWNERSHIP = "project_controls" as const;
export const PRODUCTIVITY_INTELLIGENCE_OWNERSHIP = "project_controls" as const;
export const FORECAST_INTELLIGENCE_OWNERSHIP = "project_controls" as const;
export const decisionSupportOwnership = "project_controls" as const;
export const scenarioIntelligenceOwnership = "project_controls" as const;
export const riskOpportunityIntelligenceOwnership = "project_controls" as const;
export const assuranceIntelligenceOwnership = "project_controls" as const;
export const explainabilityIntelligenceOwnership = "project_controls" as const;
export const organizationalLearningIntelligenceOwnership = "project_controls" as const;
export const assuranceAuthorityOwnership = "human_only" as const;
export const projectRecommendationOwnership = "project_controls" as const;
export const projectDecisionOwnership = "human_only" as const;
export const projectContextCompositionOwnership = "project_controls" as const;

export const CONTRACTUAL_CHANGE_AUTHORITY_OWNERSHIP = "reserved_not_project_controls" as const;
export const CONTRACTUAL_CHANGE_AUTHORITY_CANDIDATE_OWNERS = [
  "engineering_core",
  "future_commercial_contracts_domain",
  "business_os",
  "external_contract_administration",
] as const;

// ---------------------------------------------------------------------------
// Frozen V1 references
// ---------------------------------------------------------------------------

export const ASSET_INTELLIGENCE_V1_TAG = "asset-intelligence-v1.0.0" as const;
export const ASSET_INTELLIGENCE_V1_COMMIT =
  "925e2ed74025cac6a145c346c17c53320efb8757" as const;
export const ASSET_INTELLIGENCE_V1_VERSION = "1.0.0" as const;
export const ASSET_INTELLIGENCE_V1_INTACT = true as const;

export const PROJECT_INTELLIGENCE_V1_TAG = "project-intelligence-v1.0.0" as const;
export const PROJECT_INTELLIGENCE_V1_COMMIT =
  "34975b1cf660580d46287f24e746b8915903f768" as const;
export const PROJECT_INTELLIGENCE_V1_INTACT = true as const;

export const INSPECTION_INTELLIGENCE_V1_TAG = "inspection-intelligence-v1.0.0" as const;
export const INSPECTION_INTELLIGENCE_V1_COMMIT =
  "d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09" as const;
export const INSPECTION_INTELLIGENCE_V1_INTACT = true as const;

export const PROGRESS_INTELLIGENCE_11B_INTACT = true as const;
export const SCHEDULE_INTELLIGENCE_11C_INTACT = true as const;
export const CHANGE_INTELLIGENCE_11D_INTACT = true as const;
export const COST_INTELLIGENCE_11E_INTACT = true as const;
export const PRODUCTIVITY_INTELLIGENCE_11F_INTACT = true as const;

// ---------------------------------------------------------------------------
// Forbidden locks — predictive scheduling / EV / CPM stay false in 11G
// ---------------------------------------------------------------------------

export const EARNED_VALUE_IMPLEMENTED = false as const;
export const CPM_SCHEDULING_IMPLEMENTED = false as const;
export const COST_ENGINE_IMPLEMENTED = false as const;
export const BUDGET_LEDGER_IMPLEMENTED = false as const;
export const FINANCIAL_POSTING_IMPLEMENTED = false as const;
export const COST_INTELLIGENCE_IMPLEMENTED = true as const;
export const SCHEDULE_EXECUTION_IMPLEMENTED = false as const;
export const CHANGE_EXECUTION_IMPLEMENTED = false as const;
export const FORECASTING_IMPLEMENTED = false as const;
export const FORECAST_ENGINE_IMPLEMENTED = false as const;
export const FORECAST_EXECUTION_IMPLEMENTED = false as const;
export const PREDICTIVE_SCHEDULING_IMPLEMENTED = false as const;
export const FORECAST_INTELLIGENCE_IMPLEMENTED = true as const;
export const RESOURCE_LEVELING_IMPLEMENTED = false as const;
export const WORK_PACKAGING_UI_IMPLEMENTED = false as const;
export const CHANGE_CONTROL_IMPLEMENTED = false as const;
export const CONTINGENCY_MANAGEMENT_IMPLEMENTED = false as const;
export const BASELINE_PROVIDER_IMPLEMENTED = false as const;
export const PRODUCTIVITY_ANALYSIS_IMPLEMENTED = false as const;
export const PRODUCTIVITY_INTELLIGENCE_IMPLEMENTED = true as const;
export const RESOURCE_PLANNING_IMPLEMENTED = false as const;
export const TIMESHEET_SYSTEM_IMPLEMENTED = false as const;
export const PAYROLL_IMPLEMENTED = false as const;
export const LABOUR_COST_ENGINE_IMPLEMENTED = false as const;
export const CLAIMS_ANALYSIS_IMPLEMENTED = false as const;
export const CASH_FLOW_IMPLEMENTED = false as const;
export const COMMITMENT_TRACKING_IMPLEMENTED = false as const;
export const FLOAT_COMPUTATION_IMPLEMENTED = false as const;
export const CRITICAL_PATH_COMPUTED = false as const;
export const FORWARD_BACKWARD_PASS_IMPLEMENTED = false as const;

export const PROJECT_CONTROLS_PROGRESS_TABLES_INTRODUCED = true as const;
export const PROJECT_CONTROLS_SCHEDULE_TABLES_INTRODUCED = true as const;
export const PROJECT_CONTROLS_CHANGE_TABLES_INTRODUCED = true as const;
export const PROJECT_CONTROLS_COST_TABLES_INTRODUCED = true as const;
export const PROJECT_CONTROLS_PRODUCTIVITY_TABLES_INTRODUCED = true as const;
export const PROJECT_CONTROLS_FORECAST_TABLES_INTRODUCED = true as const;
export const PROJECT_CONTROLS_DECISION_TABLES_INTRODUCED = true as const;
export const PROJECT_CONTROLS_SCENARIO_TABLES_INTRODUCED = true as const;
export const PROJECT_CONTROLS_RISK_OPPORTUNITY_TABLES_INTRODUCED = true as const;
export const PROJECT_CONTROLS_ASSURANCE_TABLES_INTRODUCED = true as const;
export const PROJECT_CONTROLS_EXPLAINABILITY_TABLES_INTRODUCED = true as const;
export const PROJECT_CONTROLS_ORGANIZATIONAL_LEARNING_TABLES_INTRODUCED = true as const;
export const DECISION_SUPPORT_IMPLEMENTED = true as const;
export const SCENARIO_INTELLIGENCE_IMPLEMENTED = true as const;
export const RISK_OPPORTUNITY_INTELLIGENCE_IMPLEMENTED = true as const;
export const ASSURANCE_INTELLIGENCE_IMPLEMENTED = true as const;
/** Reserved decision execution engine — distinct from advisory Decision Support Intelligence. */
export const DECISIONING_IMPLEMENTED = false as const;
export const DECISION_ENGINE_IMPLEMENTED = false as const;
export const DECISION_EXECUTION_IMPLEMENTED = false as const;
export const PROJECT_CONTROLS_COST_SCHEDULE_TABLES_INTRODUCED = false as const;
export const PROJECT_CONTROLS_PRODUCT_UI_IMPLEMENTED = false as const;
export const PROJECT_CONTROLS_MODULE_REGISTRY_STATUS = "ga" as const;
export const PROJECT_CONTROLS_MODULE_REGISTRY_VERSION = "1.0.0" as const;
export const PROJECT_CONTROLS_MODULE_GA = true as const;
export const PROJECT_CONTROLS_ENTITLEMENTS_ARE_ENTITLEMENT_ONLY = true as const;

/**
 * Phase 11N — V1.0 GA closure markers. These describe *release* state only;
 * they never widen CPM, EV, financial posting or autonomous decision locks.
 */
export const PROJECT_CONTROLS_V1_GA_CERTIFIED = true as const;
export const PROJECT_CONTROLS_V1_FROZEN = true as const;
export const PROJECT_CONTROLS_RELEASE_CLOSED = true as const;
export const PROJECT_CONTROLS_PUBLIC_CONTRACTS_PUBLISHED = true as const;
export const PROJECT_CONTROLS_CAPABILITY_REGISTRY_PUBLISHED = true as const;
export const PROJECT_CONTROLS_SERVICE_REGISTRY_PUBLISHED = true as const;
export const PROJECT_CONTROLS_EVENT_CONTRACTS_FROZEN = true as const;
export const PROJECT_CONTROLS_MODULE_MANIFEST_GENERATED = true as const;
export const PROJECT_CONTROLS_UNAVAILABLE_MATRIX_PUBLISHED = true as const;
export const PROJECT_CONTROLS_COMMERCIAL_PACKAGING_PUBLISHED = true as const;
export const PROJECT_CONTROLS_OPERATIONS_RUNBOOKS_PUBLISHED = true as const;
export const PROJECT_CONTROLS_BACKUP_RESTORE_CERTIFIED = true as const;
export const PROJECT_CONTROLS_UPGRADE_CERTIFIED = true as const;
export const PROJECT_CONTROLS_PERFORMANCE_BASELINE_PUBLISHED = true as const;
export const PROJECT_CONTROLS_MODULE_REGISTRY_DRIFT_DETECTED = false as const;
export const PHASE_11N_COMPLETE = true as const;

export const PROJECT_CONTROLS_V1_ENTITLEMENTS = [
  "project_controls.read",
  "project_controls.assess",
  "project_controls.submit",
  "project_controls.review",
  "project_controls.approve",
  "project_controls.publish",
  "project_controls.admin",
] as const;

export const DUPLICATE_ASSET_OWNERSHIP_INTRODUCED = false as const;
export const DUPLICATE_PROJECT_OWNERSHIP_INTRODUCED = false as const;
export const DUPLICATE_PROJECT_OWNERSHIP_DETECTED = false as const;
export const CANONICAL_LIFECYCLE_MUTATION_ALLOWED = false as const;
export const RISK_CORE_AUTO_MUTATION_ALLOWED = false as const;
export const AI_MAY_PUBLISH_PROGRESS_FORBIDDEN = true as const;
export const AUTONOMOUS_PROGRESS_PUBLICATION_ALLOWED = false as const;
export const AI_MAY_PUBLISH_SCHEDULE_FORBIDDEN = true as const;
export const AUTONOMOUS_SCHEDULE_PUBLICATION_ALLOWED = false as const;
export const AI_MAY_PUBLISH_CHANGE_FORBIDDEN = true as const;
export const AUTONOMOUS_CHANGE_PUBLICATION_ALLOWED = false as const;
export const AI_MAY_PUBLISH_COST_FORBIDDEN = true as const;
export const AUTONOMOUS_COST_PUBLICATION_ALLOWED = false as const;
export const AI_MAY_PUBLISH_PRODUCTIVITY_FORBIDDEN = true as const;
export const AUTONOMOUS_PRODUCTIVITY_PUBLICATION_ALLOWED = false as const;
export const AI_MAY_PUBLISH_FORECAST_FORBIDDEN = true as const;
export const AUTONOMOUS_FORECAST_PUBLICATION_ALLOWED = false as const;
export const AI_MAY_PUBLISH_DECISION_FORBIDDEN = true as const;
export const AUTONOMOUS_DECISION_PUBLICATION_ALLOWED = false as const;
export const AI_MAY_PUBLISH_SCENARIO_FORBIDDEN = true as const;
export const AUTONOMOUS_SCENARIO_PUBLICATION_ALLOWED = false as const;
export const AI_MAY_PUBLISH_RISK_OPPORTUNITY_FORBIDDEN = true as const;
export const AUTONOMOUS_RISK_OPPORTUNITY_PUBLICATION_ALLOWED = false as const;
export const AI_MAY_PUBLISH_ASSURANCE_FORBIDDEN = true as const;
export const AUTONOMOUS_ASSURANCE_PUBLICATION_ALLOWED = false as const;
export const AUTOMATIC_ASSURANCE_APPROVAL_ENABLED = false as const;
export const AUTOMATIC_CERTIFICATION_ENABLED = false as const;
export const AUTOMATIC_EVIDENCE_APPROVAL_ENABLED = false as const;
export const DUPLICATE_ASSURANCE_OWNERSHIP_DETECTED = false as const;
export const AI_MAY_PUBLISH_EXPLAINABILITY_FORBIDDEN = true as const;
export const AUTONOMOUS_EXPLAINABILITY_PUBLICATION_ALLOWED = false as const;
export const AUTOMATIC_EXPLANATION_APPROVAL_ENABLED = false as const;
export const AUTOMATIC_EVIDENCE_CREATION_ENABLED = false as const;
export const DUPLICATE_EXPLAINABILITY_OWNERSHIP_DETECTED = false as const;
export const EXPLAINABILITY_INTELLIGENCE_IMPLEMENTED = true as const;
export const AI_MAY_PUBLISH_ORGANIZATIONAL_LEARNING_FORBIDDEN = true as const;
export const AUTONOMOUS_ORGANIZATIONAL_LEARNING_PUBLICATION_ALLOWED = false as const;
export const AUTOMATIC_LEARNING_APPROVAL_ENABLED = false as const;
export const AUTOMATIC_KNOWLEDGE_MUTATION_ENABLED = false as const;
export const DUPLICATE_KNOWLEDGE_OWNERSHIP_DETECTED = false as const;
export const ORGANIZATIONAL_LEARNING_INTELLIGENCE_IMPLEMENTED = true as const;
export const AUTOMATIC_DECISION_EXECUTION_ENABLED = false as const;
export const AUTOMATIC_SCENARIO_EXECUTION_ENABLED = false as const;
export const AUTOMATIC_RISK_REGISTER_MUTATION_ENABLED = false as const;
export const AUTOMATIC_OPPORTUNITY_REGISTER_MUTATION_ENABLED = false as const;
export const AUTOMATIC_TREATMENT_EXECUTION_ENABLED = false as const;
export const DUPLICATE_RISK_OWNERSHIP_DETECTED = false as const;
export const AUTOMATIC_SCHEDULE_CHANGE_ENABLED = false as const;
export const AUTOMATIC_COST_CHANGE_ENABLED = false as const;
export const AUTOMATIC_CONTRACT_INSTRUCTION_ENABLED = false as const;
export const CONTRACTUAL_CHANGE_APPROVAL_BY_AI_ALLOWED = false as const;

/** Phase 11F certified baseline — remains true for regression compatibility. */
export const PHASE_11F_READY = true as const;
/** Phase 11G certified baseline — remains true for regression compatibility. */
export const PHASE_11G_READY = true as const;
/** Phase 11H certified baseline — remains true for regression compatibility. */
export const PHASE_11H_READY = true as const;
/** Phase 11I certified baseline — remains true for regression compatibility. */
export const PHASE_11I_READY = true as const;
/** Phase 11J certified baseline — remains true for regression compatibility. */
export const PHASE_11J_READY = true as const;
/** Phase 11K certified baseline — remains true for regression compatibility. */
export const PHASE_11K_READY = true as const;
/** Phase 11L implemented in prior phase — remains true for regression compatibility. */
export const PHASE_11L_READY = true as const;
/** Phase 11M implemented in this phase. */
export const PHASE_11M_READY = true as const;
/** Phase 11N readiness flag only — Phase 11N is not implemented in 11M. */
export const PHASE_11N_READY = true as const;

// ---------------------------------------------------------------------------
// Migrations
// ---------------------------------------------------------------------------

export const SHARED_PROJECT_DOMAIN_MIGRATION =
  "supabase/migrations/20260808010000_batch_61_shared_project_domain_references.sql" as const;
export const PROJECT_CONTROLS_PROGRESS_MIGRATION =
  "supabase/migrations/20260808020000_batch_62_project_controls_progress.sql" as const;
export const PROJECT_CONTROLS_SCHEDULE_MIGRATION =
  "supabase/migrations/20260808030000_batch_63_project_controls_schedule.sql" as const;
export const PROJECT_CONTROLS_CHANGE_MIGRATION =
  "supabase/migrations/20260808040000_batch_64_project_controls_change_intelligence.sql" as const;
export const PROJECT_CONTROLS_COST_MIGRATION =
  "supabase/migrations/20260808050000_batch_65_project_controls_cost_intelligence.sql" as const;
export const PROJECT_CONTROLS_PRODUCTIVITY_MIGRATION =
  "supabase/migrations/20260808060000_batch_66_project_controls_productivity_intelligence.sql" as const;
export const PROJECT_CONTROLS_FORECAST_MIGRATION =
  "supabase/migrations/20260808070000_batch_67_project_controls_forecast_intelligence.sql" as const;
export const PROJECT_CONTROLS_DECISION_MIGRATION =
  "supabase/migrations/20260808080000_batch_68_project_controls_decision_support.sql" as const;
export const PROJECT_CONTROLS_SCENARIO_MIGRATION =
  "supabase/migrations/20260808090000_batch_69_project_controls_scenario_intelligence.sql" as const;
export const PROJECT_CONTROLS_RISK_OPPORTUNITY_MIGRATION =
  "supabase/migrations/20260808100000_batch_70_project_controls_risk_opportunity_intelligence.sql" as const;
export const PROJECT_CONTROLS_ASSURANCE_MIGRATION =
  "supabase/migrations/20260808110000_batch_71_project_controls_assurance_intelligence.sql" as const;
export const PROJECT_CONTROLS_EXPLAINABILITY_MIGRATION =
  "supabase/migrations/20260808120000_batch_72_project_controls_explainability_intelligence.sql" as const;
export const PROJECT_CONTROLS_ORGANIZATIONAL_LEARNING_MIGRATION =
  "supabase/migrations/20260808130000_batch_73_project_controls_organizational_learning.sql" as const;

export const PROJECT_CONTROLS_PROGRESS_TABLES = [
  "project_controls_progress_assessments",
  "project_controls_progress_evidence",
  "project_controls_progress_reviews",
  "project_controls_progress_snapshots",
  "project_controls_progress_timeline",
  "project_controls_project_profiles",
  "project_controls_idempotency",
  "project_controls_outbox_events",
] as const;

export const PROJECT_CONTROLS_SCHEDULE_TABLES = [
  "project_controls_schedule_assessments",
  "project_controls_schedule_evidence",
  "project_controls_schedule_reviews",
  "project_controls_schedule_snapshots",
  "project_controls_schedule_timeline",
] as const;

export const PROJECT_CONTROLS_CHANGE_TABLES = [
  "project_controls_change_states",
  "project_controls_change_evidence",
  "project_controls_change_reviews",
  "project_controls_change_confidence",
  "project_controls_change_candidates",
] as const;

export const PROJECT_CONTROLS_COST_TABLES = [
  "project_controls_cost_states",
  "project_controls_cost_evidence",
  "project_controls_cost_reviews",
  "project_controls_cost_confidence",
] as const;

export const PROJECT_CONTROLS_PRODUCTIVITY_TABLES = [
  "project_controls_productivity_states",
  "project_controls_productivity_evidence",
  "project_controls_productivity_reviews",
  "project_controls_productivity_confidence",
] as const;

export const PROJECT_CONTROLS_FORECAST_TABLES = [
  "project_controls_forecast_states",
  "project_controls_forecast_evidence",
  "project_controls_forecast_reviews",
  "project_controls_forecast_confidence",
] as const;

export const PROJECT_CONTROLS_DECISION_TABLES = [
  "project_controls_decision_states",
  "project_controls_decision_evidence",
  "project_controls_decision_reviews",
  "project_controls_decision_confidence",
] as const;

export const PROJECT_CONTROLS_SCENARIO_TABLES = [
  "project_controls_scenario_states",
  "project_controls_scenario_evidence",
  "project_controls_scenario_reviews",
  "project_controls_scenario_confidence",
] as const;

export const PROJECT_CONTROLS_RISK_OPPORTUNITY_TABLES = [
  "project_controls_risk_opportunity_states",
  "project_controls_risk_opportunity_evidence",
  "project_controls_risk_opportunity_reviews",
  "project_controls_risk_opportunity_confidence",
] as const;

export const PROJECT_CONTROLS_ASSURANCE_TABLES = [
  "project_controls_assurance_states",
  "project_controls_assurance_evidence",
  "project_controls_assurance_reviews",
  "project_controls_assurance_confidence",
] as const;

export const PROJECT_CONTROLS_EXPLAINABILITY_TABLES = [
  "project_controls_explainability_states",
  "project_controls_explainability_evidence",
  "project_controls_explainability_reviews",
  "project_controls_explainability_confidence",
] as const;

export const PROJECT_CONTROLS_ORGANIZATIONAL_LEARNING_TABLES = [
  "project_controls_organizational_learning_states",
  "project_controls_organizational_learning_evidence",
  "project_controls_organizational_learning_reviews",
  "project_controls_organizational_learning_confidence",
] as const;

export const PROJECT_CONTROLS_SHARED_PROJECT_TABLES = [
  "project_controls_project_snapshots",
  "project_controls_project_timeline",
] as const;

// ---------------------------------------------------------------------------
// Concept inventory
// ---------------------------------------------------------------------------

export const PROJECT_CONTROLS_IMPLEMENTED_CONCEPTS = [
  "progress",
  "schedule",
  "change",
  "cost",
  "productivity",
  "forecast",
  "decision_support",
  "scenario_intelligence",
  "risk_opportunity_intelligence",
  "assurance_intelligence",
  "explainability_intelligence",
  "organizational_learning",
  "project_profile",
  "project_context_composition",
] as const;

export const PROJECT_CONTROLS_RESERVED_CONCEPTS = [
  "contingency",
  "earned_value_reserved",
  "commitment",
  "resource_demand",
  "baseline_network",
  "variance_earned",
] as const;

export const PROJECT_CONTROLS_DISCOVERY_CONCEPTS = [
  "cost",
  "schedule",
  "progress",
  "change",
  "contingency",
  "earned_value_reserved",
  "wbs_consumption",
  "commitment",
  "productivity",
  "resource_demand",
  "milestone",
  "baseline",
  "variance",
  "forecast_reserved",
] as const;

export type ProjectControlsDiscoveryConcept =
  (typeof PROJECT_CONTROLS_DISCOVERY_CONCEPTS)[number];

export const PROJECT_CONTROLS_EXISTING_ENTITLEMENTS = [
  "action.read",
  "action.write",
  "access",
] as const;

export function getProjectControlsDeclaration() {
  return {
    productName: PROJECT_CONTROLS_PRODUCT_NAME,
    moduleKey: PROJECT_CONTROLS_MODULE_KEY,
    version: PROJECT_CONTROLS_VERSION,
    status: PROJECT_CONTROLS_STATUS,
    phase: PROJECT_CONTROLS_PHASE,
    routePrefix: PROJECT_CONTROLS_ROUTE_PREFIX,
    apiPrefix: PROJECT_CONTROLS_API_PREFIX,
    changeApiRoute: PROJECT_CONTROLS_CHANGE_API_ROUTE,
    costApiRoute: PROJECT_CONTROLS_COST_API_ROUTE,
    productivityApiRoute: PROJECT_CONTROLS_PRODUCTIVITY_API_ROUTE,
    forecastApiRoute: PROJECT_CONTROLS_FORECAST_API_ROUTE,
    decisionApiRoute: PROJECT_CONTROLS_DECISION_API_ROUTE,
    scenarioApiRoute: PROJECT_CONTROLS_SCENARIO_API_ROUTE,
    riskOpportunityApiRoute: PROJECT_CONTROLS_RISK_OPPORTUNITY_API_ROUTE,
    assuranceApiRoute: PROJECT_CONTROLS_ASSURANCE_API_ROUTE,
    snapshotApiRoute: PROJECT_CONTROLS_SNAPSHOT_API_ROUTE,
    phase11aCertifiedCommit: PHASE_11A_CERTIFIED_COMMIT,
    phase11aHostedRun: PHASE_11A_HOSTED_RUN,
    phase11bCertifiedCommit: PHASE_11B_CERTIFIED_COMMIT,
    phase11bHostedRun: PHASE_11B_HOSTED_RUN,
    phase11cCertifiedCommit: PHASE_11C_CERTIFIED_COMMIT,
    phase11cHostedRun: PHASE_11C_HOSTED_RUN,
    phase11cVersion: PHASE_11C_VERSION,
    phase11dCertifiedCommit: PHASE_11D_CERTIFIED_COMMIT,
    phase11dHostedRun: PHASE_11D_HOSTED_RUN,
    phase11dVersion: PHASE_11D_VERSION,
    phase11eCertifiedCommit: PHASE_11E_CERTIFIED_COMMIT,
    phase11eHostedRun: PHASE_11E_HOSTED_RUN,
    phase11eVersion: PHASE_11E_VERSION,
    phase11fCertifiedCommit: PHASE_11F_CERTIFIED_COMMIT,
    phase11fHostedRun: PHASE_11F_HOSTED_RUN,
    phase11fVersion: PHASE_11F_VERSION,
    projectControlsImplemented: PROJECT_CONTROLS_IMPLEMENTED,
    productionProjectControlsReady: PRODUCTION_PROJECT_CONTROLS_READY,
    sharedProjectDomainReady: SHARED_PROJECT_DOMAIN_READY,
    projectContextEngineReady: PROJECT_CONTEXT_ENGINE_READY,
    progressIntelligenceReady: PROGRESS_INTELLIGENCE_READY,
    scheduleIntelligenceReady: SCHEDULE_INTELLIGENCE_READY,
    scheduleIntelligenceIsAdvisoryOnly: SCHEDULE_INTELLIGENCE_IS_ADVISORY_ONLY,
    scheduleIntelligenceIsCpm: SCHEDULE_INTELLIGENCE_IS_CPM,
    scheduleExecutionImplemented: SCHEDULE_EXECUTION_IMPLEMENTED,
    changeIntelligenceReady: CHANGE_INTELLIGENCE_READY,
    changeConfidenceEngineReady: CHANGE_CONFIDENCE_ENGINE_READY,
    changeReviewWorkflowReady: CHANGE_REVIEW_WORKFLOW_READY,
    changePersistenceReady: CHANGE_PERSISTENCE_READY,
    changeIntelligenceIsAdvisoryOnly: CHANGE_INTELLIGENCE_IS_ADVISORY_ONLY,
    changeIntelligenceIsContractualAuthority: CHANGE_INTELLIGENCE_IS_CONTRACTUAL_AUTHORITY,
    changeExecutionImplemented: CHANGE_EXECUTION_IMPLEMENTED,
    contractualChangeApprovalByAiAllowed: CONTRACTUAL_CHANGE_APPROVAL_BY_AI_ALLOWED,
    projectTimelineReady: PROJECT_TIMELINE_READY,
    projectSnapshotReady: PROJECT_SNAPSHOT_READY,
    costIntelligenceReady: COST_INTELLIGENCE_READY,
    costConfidenceEngineReady: COST_CONFIDENCE_ENGINE_READY,
    costReviewWorkflowReady: COST_REVIEW_WORKFLOW_READY,
    costPersistenceReady: COST_PERSISTENCE_READY,
    costIntelligenceIsAdvisoryOnly: COST_INTELLIGENCE_IS_ADVISORY_ONLY,
    aiMayPublishCostForbidden: AI_MAY_PUBLISH_COST_FORBIDDEN,
    productivityIntelligenceReady: PRODUCTIVITY_INTELLIGENCE_READY,
    productivityConfidenceEngineReady: PRODUCTIVITY_CONFIDENCE_ENGINE_READY,
    productivityReviewWorkflowReady: PRODUCTIVITY_REVIEW_WORKFLOW_READY,
    productivityPersistenceReady: PRODUCTIVITY_PERSISTENCE_READY,
    productivityIntelligenceIsAdvisoryOnly: PRODUCTIVITY_INTELLIGENCE_IS_ADVISORY_ONLY,
    aiMayPublishProductivityForbidden: AI_MAY_PUBLISH_PRODUCTIVITY_FORBIDDEN,
    forecastIntelligenceReady: FORECAST_INTELLIGENCE_READY,
    forecastConfidenceEngineReady: FORECAST_CONFIDENCE_ENGINE_READY,
    forecastReviewWorkflowReady: FORECAST_REVIEW_WORKFLOW_READY,
    forecastPersistenceReady: FORECAST_PERSISTENCE_READY,
    forecastIntelligenceIsAdvisoryOnly: FORECAST_INTELLIGENCE_IS_ADVISORY_ONLY,
    projectContextCompositionReady: PROJECT_CONTEXT_COMPOSITION_READY,
    aiMayPublishForecastForbidden: AI_MAY_PUBLISH_FORECAST_FORBIDDEN,
    decisionSupportReady: DECISION_SUPPORT_READY,
    decisionConfidenceEngineReady: DECISION_CONFIDENCE_ENGINE_READY,
    decisionReviewWorkflowReady: DECISION_REVIEW_WORKFLOW_READY,
    decisionPersistenceReady: DECISION_PERSISTENCE_READY,
    decisionSupportIsAdvisoryOnly: DECISION_SUPPORT_IS_ADVISORY_ONLY,
    aiMayPublishDecisionForbidden: AI_MAY_PUBLISH_DECISION_FORBIDDEN,
    scenarioIntelligenceReady: SCENARIO_INTELLIGENCE_READY,
    ScenarioIntelligenceReady: ScenarioIntelligenceReady,
    scenarioConfidenceEngineReady: SCENARIO_CONFIDENCE_ENGINE_READY,
    scenarioReviewWorkflowReady: SCENARIO_REVIEW_WORKFLOW_READY,
    scenarioPersistenceReady: SCENARIO_PERSISTENCE_READY,
    scenarioIntelligenceIsAdvisoryOnly: SCENARIO_INTELLIGENCE_IS_ADVISORY_ONLY,
    aiMayPublishScenarioForbidden: AI_MAY_PUBLISH_SCENARIO_FORBIDDEN,
    automaticScenarioExecutionEnabled: AUTOMATIC_SCENARIO_EXECUTION_ENABLED,
    scenarioIntelligenceOwnership: scenarioIntelligenceOwnership,
    riskOpportunityIntelligenceReady: RISK_OPPORTUNITY_INTELLIGENCE_READY,
    RiskOpportunityIntelligenceReady: RiskOpportunityIntelligenceReady,
    riskOpportunityConfidenceEngineReady: RISK_OPPORTUNITY_CONFIDENCE_ENGINE_READY,
    riskOpportunityReviewWorkflowReady: RISK_OPPORTUNITY_REVIEW_WORKFLOW_READY,
    riskOpportunityPersistenceReady: RISK_OPPORTUNITY_PERSISTENCE_READY,
    riskOpportunityIntelligenceIsAdvisoryOnly: RISK_OPPORTUNITY_INTELLIGENCE_IS_ADVISORY_ONLY,
    aiMayPublishRiskOpportunityForbidden: AI_MAY_PUBLISH_RISK_OPPORTUNITY_FORBIDDEN,
    automaticRiskRegisterMutationEnabled: AUTOMATIC_RISK_REGISTER_MUTATION_ENABLED,
    automaticOpportunityRegisterMutationEnabled: AUTOMATIC_OPPORTUNITY_REGISTER_MUTATION_ENABLED,
    automaticTreatmentExecutionEnabled: AUTOMATIC_TREATMENT_EXECUTION_ENABLED,
    duplicateRiskOwnershipDetected: DUPLICATE_RISK_OWNERSHIP_DETECTED,
    riskOpportunityIntelligenceOwnership: riskOpportunityIntelligenceOwnership,
    assuranceIntelligenceReady: ASSURANCE_INTELLIGENCE_READY,
    AssuranceIntelligenceReady: AssuranceIntelligenceReady,
    assuranceConfidenceEngineReady: ASSURANCE_CONFIDENCE_ENGINE_READY,
    assuranceReviewWorkflowReady: ASSURANCE_REVIEW_WORKFLOW_READY,
    assurancePersistenceReady: ASSURANCE_PERSISTENCE_READY,
    assuranceIntelligenceIsAdvisoryOnly: ASSURANCE_INTELLIGENCE_IS_ADVISORY_ONLY,
    aiMayPublishAssuranceForbidden: AI_MAY_PUBLISH_ASSURANCE_FORBIDDEN,
    automaticAssuranceApprovalEnabled: AUTOMATIC_ASSURANCE_APPROVAL_ENABLED,
    automaticCertificationEnabled: AUTOMATIC_CERTIFICATION_ENABLED,
    automaticEvidenceApprovalEnabled: AUTOMATIC_EVIDENCE_APPROVAL_ENABLED,
    duplicateAssuranceOwnershipDetected: DUPLICATE_ASSURANCE_OWNERSHIP_DETECTED,
    assuranceIntelligenceOwnership: assuranceIntelligenceOwnership,
    assuranceAuthorityOwnership: assuranceAuthorityOwnership,
    automaticDecisionExecutionEnabled: AUTOMATIC_DECISION_EXECUTION_ENABLED,
    automaticScheduleChangeEnabled: AUTOMATIC_SCHEDULE_CHANGE_ENABLED,
    automaticCostChangeEnabled: AUTOMATIC_COST_CHANGE_ENABLED,
    automaticContractInstructionEnabled: AUTOMATIC_CONTRACT_INSTRUCTION_ENABLED,
    decisionSupportOwnership: decisionSupportOwnership,
    projectRecommendationOwnership: projectRecommendationOwnership,
    projectDecisionOwnership: projectDecisionOwnership,
    phase11fReady: PHASE_11F_READY,
    phase11gReady: PHASE_11G_READY,
    phase11hReady: PHASE_11H_READY,
    phase11iReady: PHASE_11I_READY,
    phase11jReady: PHASE_11J_READY,
    phase11kReady: PHASE_11K_READY,
    phase11lReady: PHASE_11L_READY,
    progressMeasurementImplemented: PROGRESS_MEASUREMENT_IMPLEMENTED,
    progressMeasurementIsAdvisoryOnly: PROGRESS_MEASUREMENT_IS_ADVISORY_ONLY,
    progressMeasurementIsEarnedValue: PROGRESS_MEASUREMENT_IS_EARNED_VALUE,
    productionMemoryRepositoryAllowed: PRODUCTION_MEMORY_REPOSITORY_ALLOWED,
    projectControlsOwnership: PROJECT_CONTROLS_OWNERSHIP,
    canonicalProjectIdentityOwnership: CANONICAL_PROJECT_IDENTITY_OWNERSHIP,
    progressIntelligenceOwnership: PROGRESS_INTELLIGENCE_OWNERSHIP,
    scheduleIntelligenceOwnership: SCHEDULE_INTELLIGENCE_OWNERSHIP,
    changeIntelligenceOwnership: CHANGE_INTELLIGENCE_OWNERSHIP,
    costIntelligenceOwnership: COST_INTELLIGENCE_OWNERSHIP,
    productivityIntelligenceOwnership: PRODUCTIVITY_INTELLIGENCE_OWNERSHIP,
    forecastIntelligenceOwnership: FORECAST_INTELLIGENCE_OWNERSHIP,
    projectContextCompositionOwnership: projectContextCompositionOwnership,
    contractualChangeAuthorityOwnership: CONTRACTUAL_CHANGE_AUTHORITY_OWNERSHIP,
    financialLedgerOwnership: FINANCIAL_LEDGER_OWNERSHIP,
    projectIntelligenceOwnership: PROJECT_INTELLIGENCE_OWNERSHIP,
    assetIntelligenceOwnership: ASSET_INTELLIGENCE_OWNERSHIP,
    inspectionIntelligenceOwnership: INSPECTION_INTELLIGENCE_OWNERSHIP,
    canonicalEngineeringRiskOwnership: CANONICAL_ENGINEERING_RISK_OWNERSHIP,
    assetIntelligenceV1Intact: ASSET_INTELLIGENCE_V1_INTACT,
    projectIntelligenceV1Intact: PROJECT_INTELLIGENCE_V1_INTACT,
    inspectionIntelligenceV1Intact: INSPECTION_INTELLIGENCE_V1_INTACT,
    progressIntelligence11bIntact: PROGRESS_INTELLIGENCE_11B_INTACT,
    scheduleIntelligence11cIntact: SCHEDULE_INTELLIGENCE_11C_INTACT,
    changeIntelligence11dIntact: CHANGE_INTELLIGENCE_11D_INTACT,
    costIntelligence11eIntact: COST_INTELLIGENCE_11E_INTACT,
    productivityIntelligence11fIntact: PRODUCTIVITY_INTELLIGENCE_11F_INTACT,
    earnedValueImplemented: EARNED_VALUE_IMPLEMENTED,
    cpmSchedulingImplemented: CPM_SCHEDULING_IMPLEMENTED,
    floatComputationImplemented: FLOAT_COMPUTATION_IMPLEMENTED,
    costEngineImplemented: COST_ENGINE_IMPLEMENTED,
    costIntelligenceImplemented: COST_INTELLIGENCE_IMPLEMENTED,
    budgetLedgerImplemented: BUDGET_LEDGER_IMPLEMENTED,
    financialPostingImplemented: FINANCIAL_POSTING_IMPLEMENTED,
    forecastingImplemented: FORECASTING_IMPLEMENTED,
    forecastEngineImplemented: FORECAST_ENGINE_IMPLEMENTED,
    forecastExecutionImplemented: FORECAST_EXECUTION_IMPLEMENTED,
    predictiveSchedulingImplemented: PREDICTIVE_SCHEDULING_IMPLEMENTED,
    forecastIntelligenceImplemented: FORECAST_INTELLIGENCE_IMPLEMENTED,
    contingencyManagementImplemented: CONTINGENCY_MANAGEMENT_IMPLEMENTED,
    resourceLevelingImplemented: RESOURCE_LEVELING_IMPLEMENTED,
    resourcePlanningImplemented: RESOURCE_PLANNING_IMPLEMENTED,
    timesheetSystemImplemented: TIMESHEET_SYSTEM_IMPLEMENTED,
    payrollImplemented: PAYROLL_IMPLEMENTED,
    labourCostEngineImplemented: LABOUR_COST_ENGINE_IMPLEMENTED,
    productivityAnalysisImplemented: PRODUCTIVITY_ANALYSIS_IMPLEMENTED,
    productivityIntelligenceImplemented: PRODUCTIVITY_INTELLIGENCE_IMPLEMENTED,
    duplicateProjectOwnershipDetected: DUPLICATE_PROJECT_OWNERSHIP_DETECTED,
    projectControlsProgressTablesIntroduced: PROJECT_CONTROLS_PROGRESS_TABLES_INTRODUCED,
    projectControlsScheduleTablesIntroduced: PROJECT_CONTROLS_SCHEDULE_TABLES_INTRODUCED,
    projectControlsChangeTablesIntroduced: PROJECT_CONTROLS_CHANGE_TABLES_INTRODUCED,
    projectControlsCostTablesIntroduced: PROJECT_CONTROLS_COST_TABLES_INTRODUCED,
    projectControlsProductivityTablesIntroduced: PROJECT_CONTROLS_PRODUCTIVITY_TABLES_INTRODUCED,
    projectControlsForecastTablesIntroduced: PROJECT_CONTROLS_FORECAST_TABLES_INTRODUCED,
    projectControlsDecisionTablesIntroduced: PROJECT_CONTROLS_DECISION_TABLES_INTRODUCED,
    projectControlsScenarioTablesIntroduced: PROJECT_CONTROLS_SCENARIO_TABLES_INTRODUCED,
    projectControlsRiskOpportunityTablesIntroduced: PROJECT_CONTROLS_RISK_OPPORTUNITY_TABLES_INTRODUCED,
    projectControlsAssuranceTablesIntroduced: PROJECT_CONTROLS_ASSURANCE_TABLES_INTRODUCED,
    moduleRegistryStatus: PROJECT_CONTROLS_MODULE_REGISTRY_STATUS,
    moduleGa: PROJECT_CONTROLS_MODULE_GA,
    implementedConcepts: PROJECT_CONTROLS_IMPLEMENTED_CONCEPTS,
    reservedConcepts: PROJECT_CONTROLS_RESERVED_CONCEPTS,
    progressTables: PROJECT_CONTROLS_PROGRESS_TABLES,
    scheduleTables: PROJECT_CONTROLS_SCHEDULE_TABLES,
    changeTables: PROJECT_CONTROLS_CHANGE_TABLES,
    costTables: PROJECT_CONTROLS_COST_TABLES,
    productivityTables: PROJECT_CONTROLS_PRODUCTIVITY_TABLES,
    forecastTables: PROJECT_CONTROLS_FORECAST_TABLES,
    decisionTables: PROJECT_CONTROLS_DECISION_TABLES,
    scenarioTables: PROJECT_CONTROLS_SCENARIO_TABLES,
    riskOpportunityTables: PROJECT_CONTROLS_RISK_OPPORTUNITY_TABLES,
    assuranceTables: PROJECT_CONTROLS_ASSURANCE_TABLES,
    sharedProjectTables: PROJECT_CONTROLS_SHARED_PROJECT_TABLES,
    hierarchy:
      "RTB AI Platform → Engineering OS → Engineering Shared Project Domain (canonical project identity) → Project Controls (progress + schedule + change + cost + productivity + forecast + decision support + scenario + risk/opportunity + assurance + explainability + organizational learning intelligence about projects — advisory only)" as const,
    releaseTag: PROJECT_CONTROLS_RELEASE_TAG,
    readinessMarker: PROJECT_CONTROLS_READINESS_MARKER,
    publicContractVersion: PROJECT_CONTROLS_PUBLIC_CONTRACT_VERSION,
    previousVersion: PROJECT_CONTROLS_PREVIOUS_VERSION,
    projectControlsV1GaCertified: PROJECT_CONTROLS_V1_GA_CERTIFIED,
    projectControlsV1Frozen: PROJECT_CONTROLS_V1_FROZEN,
    projectControlsReleaseClosed: PROJECT_CONTROLS_RELEASE_CLOSED,
    projectControlsBackupRestoreCertified: PROJECT_CONTROLS_BACKUP_RESTORE_CERTIFIED,
    moduleRegistryDriftDetected: PROJECT_CONTROLS_MODULE_REGISTRY_DRIFT_DETECTED,
    phase11nComplete: PHASE_11N_COMPLETE,
    phase11mCertifiedCommit: PHASE_11M_CERTIFIED_COMMIT,
    phase11mHostedRun: PHASE_11M_HOSTED_RUN,
    entitlements: PROJECT_CONTROLS_V1_ENTITLEMENTS,
  };
}

/** V1.0 GA declaration — same authoritative source, named for release consumers. */
export function getProjectControlsGaDeclaration() {
  return getProjectControlsDeclaration();
}

/** @deprecated Phase 11A name; kept so 11A consumers keep compiling. */
export const getProjectControlsDiscoveryDeclaration = getProjectControlsDeclaration;
