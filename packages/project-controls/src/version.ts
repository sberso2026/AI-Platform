/**
 * Phase 11D — Project Controls Change Intelligence.
 * Single authoritative version source.
 *
 * Project Controls owns *intelligence ABOUT projects*. It never owns project
 * identity. Phase 11D adds Change Intelligence as a third contributor to the
 * Project Context Engine. Progress (11B) and Schedule (11C) stay intact.
 *
 * Change Intelligence assesses what the evidence supports about a change. It is
 * NOT contractual authority: it never approves, publishes or executes a
 * contractual change, never posts to a ledger and never mutates a budget.
 *
 * Still forbidden: cost engine, budget ledger, financial posting, earned value,
 * CPM/critical path, float, schedule execution, forecasting, contingency
 * drawdown, resource levelling, change execution.
 */
export const PROJECT_CONTROLS_PRODUCT_NAME = "Project Controls" as const;
export const PROJECT_CONTROLS_MODULE_KEY = "project_controls" as const;
export const PROJECT_CONTROLS_VERSION = "0.4.0-change-intelligence" as const;
export const PROJECT_CONTROLS_STATUS = "change_intelligence" as const;
export const PROJECT_CONTROLS_PHASE = "11D" as const;

export const PROJECT_CONTROLS_ROUTE_PREFIX = "/engineering/apps/project-controls" as const;
export const PROJECT_CONTROLS_API_PREFIX = "/api/engineering/project-controls" as const;
export const PROJECT_CONTROLS_PROGRESS_API_ROUTE =
  "/api/engineering/project-controls/progress" as const;
export const PROJECT_CONTROLS_SCHEDULE_API_ROUTE =
  "/api/engineering/project-controls/schedule" as const;
export const PROJECT_CONTROLS_CHANGE_API_ROUTE =
  "/api/engineering/project-controls/change" as const;
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

// ---------------------------------------------------------------------------
// Implementation state
// ---------------------------------------------------------------------------

export const PROJECT_CONTROLS_IMPLEMENTED = false as const;
export const PRODUCTION_PROJECT_CONTROLS_READY = false as const;
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

/** Phase 11D capabilities that are genuinely implemented. */
export const CHANGE_INTELLIGENCE_READY = true as const;
export const CHANGE_CONFIDENCE_ENGINE_READY = true as const;
export const CHANGE_REVIEW_WORKFLOW_READY = true as const;
export const CHANGE_PERSISTENCE_READY = true as const;
export const CHANGE_INTELLIGENCE_IS_ADVISORY_ONLY = true as const;
export const CHANGE_INTELLIGENCE_IS_CONTRACTUAL_AUTHORITY = false as const;
export const PROJECT_TIMELINE_READY = true as const;
export const PROJECT_SNAPSHOT_READY = true as const;

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

/**
 * Phase 11D re-spells financial ledger ownership. Phase 11C attributed it to
 * `platform_commerce_finance`, which is the entitlement/billing platform, not a
 * project finance system of record. Neither exists inside Project Controls, so
 * the owner is named for what it is: an external or future finance domain.
 */
export const FINANCIAL_LEDGER_OWNERSHIP =
  "external_finance_or_future_finance_domain" as const;
export const ENTITLEMENTS_OWNERSHIP = "platform_commerce_finance" as const;
export const DIGITAL_TWIN_OWNERSHIP = "external_future" as const;
export const SHM_OWNERSHIP = "external_future" as const;
export const CMMS_WORK_ORDER_OWNERSHIP = "none_in_project_controls" as const;

export const PROGRESS_INTELLIGENCE_OWNERSHIP = "project_controls" as const;
export const SCHEDULE_INTELLIGENCE_OWNERSHIP = "project_controls" as const;
export const CHANGE_INTELLIGENCE_OWNERSHIP = "project_controls" as const;

/** Contractual change authority is deliberately unassigned inside Project Controls. */
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

// ---------------------------------------------------------------------------
// Forbidden locks — cost / EV / CPM / contractual authority stay false in 11D
// ---------------------------------------------------------------------------

export const EARNED_VALUE_IMPLEMENTED = false as const;
export const CPM_SCHEDULING_IMPLEMENTED = false as const;
export const COST_ENGINE_IMPLEMENTED = false as const;
export const BUDGET_LEDGER_IMPLEMENTED = false as const;
export const FINANCIAL_POSTING_IMPLEMENTED = false as const;
export const COST_INTELLIGENCE_IMPLEMENTED = false as const;
export const SCHEDULE_EXECUTION_IMPLEMENTED = false as const;
export const CHANGE_EXECUTION_IMPLEMENTED = false as const;
export const FORECASTING_IMPLEMENTED = false as const;
export const RESOURCE_LEVELING_IMPLEMENTED = false as const;
export const WORK_PACKAGING_UI_IMPLEMENTED = false as const;
export const CHANGE_CONTROL_IMPLEMENTED = false as const;
export const CONTINGENCY_MANAGEMENT_IMPLEMENTED = false as const;
/** BaselineProvider is reserved interface-only in Phase 11D. */
export const BASELINE_PROVIDER_IMPLEMENTED = false as const;
export const PRODUCTIVITY_ANALYSIS_IMPLEMENTED = false as const;
export const CLAIMS_ANALYSIS_IMPLEMENTED = false as const;
export const CASH_FLOW_IMPLEMENTED = false as const;
export const COMMITMENT_TRACKING_IMPLEMENTED = false as const;
export const FLOAT_COMPUTATION_IMPLEMENTED = false as const;
export const CRITICAL_PATH_COMPUTED = false as const;
export const FORWARD_BACKWARD_PASS_IMPLEMENTED = false as const;

export const PROJECT_CONTROLS_PROGRESS_TABLES_INTRODUCED = true as const;
export const PROJECT_CONTROLS_SCHEDULE_TABLES_INTRODUCED = true as const;
export const PROJECT_CONTROLS_CHANGE_TABLES_INTRODUCED = true as const;
export const PROJECT_CONTROLS_COST_SCHEDULE_TABLES_INTRODUCED = false as const;
export const PROJECT_CONTROLS_PRODUCT_UI_IMPLEMENTED = false as const;
export const PROJECT_CONTROLS_MODULE_REGISTRY_STATUS = "coming_soon" as const;
export const PROJECT_CONTROLS_MODULE_REGISTRY_VERSION = "0.0.0" as const;
export const PROJECT_CONTROLS_MODULE_GA = false as const;
export const PROJECT_CONTROLS_ENTITLEMENTS_ARE_ENTITLEMENT_ONLY = true as const;

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
export const CONTRACTUAL_CHANGE_APPROVAL_BY_AI_ALLOWED = false as const;

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

/** Project-level (not change-specific) tables introduced alongside 11D. */
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
  "project_profile",
] as const;

export const PROJECT_CONTROLS_RESERVED_CONCEPTS = [
  "cost",
  "contingency",
  "earned_value_reserved",
  "commitment",
  "productivity",
  "resource_demand",
  "baseline_network",
  "variance_earned",
  "forecast_reserved",
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
    snapshotApiRoute: PROJECT_CONTROLS_SNAPSHOT_API_ROUTE,
    phase11aCertifiedCommit: PHASE_11A_CERTIFIED_COMMIT,
    phase11aHostedRun: PHASE_11A_HOSTED_RUN,
    phase11bCertifiedCommit: PHASE_11B_CERTIFIED_COMMIT,
    phase11bHostedRun: PHASE_11B_HOSTED_RUN,
    phase11cCertifiedCommit: PHASE_11C_CERTIFIED_COMMIT,
    phase11cHostedRun: PHASE_11C_HOSTED_RUN,
    phase11cVersion: PHASE_11C_VERSION,
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
    changeIntelligenceIsContractualAuthority:
      CHANGE_INTELLIGENCE_IS_CONTRACTUAL_AUTHORITY,
    changeExecutionImplemented: CHANGE_EXECUTION_IMPLEMENTED,
    contractualChangeApprovalByAiAllowed: CONTRACTUAL_CHANGE_APPROVAL_BY_AI_ALLOWED,
    projectTimelineReady: PROJECT_TIMELINE_READY,
    projectSnapshotReady: PROJECT_SNAPSHOT_READY,
    progressMeasurementImplemented: PROGRESS_MEASUREMENT_IMPLEMENTED,
    progressMeasurementIsAdvisoryOnly: PROGRESS_MEASUREMENT_IS_ADVISORY_ONLY,
    progressMeasurementIsEarnedValue: PROGRESS_MEASUREMENT_IS_EARNED_VALUE,
    productionMemoryRepositoryAllowed: PRODUCTION_MEMORY_REPOSITORY_ALLOWED,
    projectControlsOwnership: PROJECT_CONTROLS_OWNERSHIP,
    canonicalProjectIdentityOwnership: CANONICAL_PROJECT_IDENTITY_OWNERSHIP,
    progressIntelligenceOwnership: PROGRESS_INTELLIGENCE_OWNERSHIP,
    scheduleIntelligenceOwnership: SCHEDULE_INTELLIGENCE_OWNERSHIP,
    changeIntelligenceOwnership: CHANGE_INTELLIGENCE_OWNERSHIP,
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
    earnedValueImplemented: EARNED_VALUE_IMPLEMENTED,
    cpmSchedulingImplemented: CPM_SCHEDULING_IMPLEMENTED,
    floatComputationImplemented: FLOAT_COMPUTATION_IMPLEMENTED,
    costEngineImplemented: COST_ENGINE_IMPLEMENTED,
    costIntelligenceImplemented: COST_INTELLIGENCE_IMPLEMENTED,
    budgetLedgerImplemented: BUDGET_LEDGER_IMPLEMENTED,
    financialPostingImplemented: FINANCIAL_POSTING_IMPLEMENTED,
    forecastingImplemented: FORECASTING_IMPLEMENTED,
    contingencyManagementImplemented: CONTINGENCY_MANAGEMENT_IMPLEMENTED,
    resourceLevelingImplemented: RESOURCE_LEVELING_IMPLEMENTED,
    duplicateProjectOwnershipDetected: DUPLICATE_PROJECT_OWNERSHIP_DETECTED,
    projectControlsProgressTablesIntroduced: PROJECT_CONTROLS_PROGRESS_TABLES_INTRODUCED,
    projectControlsScheduleTablesIntroduced: PROJECT_CONTROLS_SCHEDULE_TABLES_INTRODUCED,
    projectControlsChangeTablesIntroduced: PROJECT_CONTROLS_CHANGE_TABLES_INTRODUCED,
    moduleRegistryStatus: PROJECT_CONTROLS_MODULE_REGISTRY_STATUS,
    moduleGa: PROJECT_CONTROLS_MODULE_GA,
    implementedConcepts: PROJECT_CONTROLS_IMPLEMENTED_CONCEPTS,
    reservedConcepts: PROJECT_CONTROLS_RESERVED_CONCEPTS,
    progressTables: PROJECT_CONTROLS_PROGRESS_TABLES,
    scheduleTables: PROJECT_CONTROLS_SCHEDULE_TABLES,
    changeTables: PROJECT_CONTROLS_CHANGE_TABLES,
    sharedProjectTables: PROJECT_CONTROLS_SHARED_PROJECT_TABLES,
    hierarchy:
      "RTB AI Platform → Engineering OS → Engineering Shared Project Domain (canonical project identity) → Project Controls (progress + schedule + change intelligence about projects — advisory only)" as const,
  };
}

/** @deprecated Phase 11A name; kept so 11A consumers keep compiling. */
export const getProjectControlsDiscoveryDeclaration = getProjectControlsDeclaration;
