/**
 * Phase 11B — Project Controls Foundation + Progress Intelligence.
 * Single authoritative version source.
 *
 * Project Controls owns *intelligence ABOUT projects*. It never owns project
 * identity. Phase 11B adds one real capability — advisory Progress Intelligence
 * — plus the Project Context Engine that composes a ProjectProfile from it.
 *
 * What Phase 11B still does NOT implement: earned value, CPM/critical path,
 * a cost engine, a budget ledger, schedule execution, forecasting, resource
 * levelling, change control and contingency drawdown. Those remain reserved
 * provider interfaces that throw `not_implemented`.
 *
 * Anything that publishes a Project Controls version (docs, certification,
 * future manifests) reads from here. Nothing may hard-code a second one.
 */
export const PROJECT_CONTROLS_PRODUCT_NAME = "Project Controls" as const;
export const PROJECT_CONTROLS_MODULE_KEY = "project_controls" as const;
export const PROJECT_CONTROLS_VERSION = "0.2.0-progress-intelligence" as const;
export const PROJECT_CONTROLS_STATUS = "progress_intelligence" as const;
export const PROJECT_CONTROLS_PHASE = "11B" as const;

export const PROJECT_CONTROLS_ROUTE_PREFIX = "/engineering/apps/project-controls" as const;
export const PROJECT_CONTROLS_API_PREFIX = "/api/engineering/project-controls" as const;
export const PROJECT_CONTROLS_PROGRESS_API_ROUTE =
  "/api/engineering/project-controls/progress" as const;
export const PROJECT_CONTROLS_PROFILE_API_ROUTE =
  "/api/engineering/project-controls/profile" as const;

// ---------------------------------------------------------------------------
// Phase 11A baseline
// ---------------------------------------------------------------------------

export const PHASE_11A_CERTIFIED_COMMIT =
  "b9a3a6091ec4af1eb1ebdd9749da497ce5af9700" as const;
export const PHASE_11A_HOSTED_RUN = "31179910364" as const;
export const PHASE_11A_VERSION = "0.1.0-discovery" as const;

// ---------------------------------------------------------------------------
// Implementation state
// ---------------------------------------------------------------------------

/**
 * The Project Controls *product* still does not exist: no cost, no schedule, no
 * change, no contingency, no UI. 11B ships a progress intelligence slice only.
 */
export const PROJECT_CONTROLS_IMPLEMENTED = false as const;
export const PRODUCTION_PROJECT_CONTROLS_READY = false as const;
export const PROJECT_CONTROLS_DISCOVERY_IMPLEMENTED = true as const;

/** Phase 11B capabilities that are genuinely implemented. */
export const SHARED_PROJECT_DOMAIN_READY = true as const;
export const PROJECT_CONTEXT_ENGINE_READY = true as const;
export const PROGRESS_INTELLIGENCE_READY = true as const;
export const PROGRESS_CONFIDENCE_ENGINE_READY = true as const;
export const PROGRESS_REVIEW_WORKFLOW_READY = true as const;
export const PROGRESS_PERSISTENCE_READY = true as const;

/**
 * Progress measurement exists in 11B as *advisory evidence-driven intelligence*.
 * It is explicitly NOT earned value: no budget, no cost baseline, no BCWP.
 */
export const PROGRESS_MEASUREMENT_IMPLEMENTED = true as const;
export const PROGRESS_MEASUREMENT_IS_ADVISORY_ONLY = true as const;
export const PROGRESS_MEASUREMENT_IS_EARNED_VALUE = false as const;
export const PROGRESS_MEASUREMENT_CERTIFIED_FOR_PAYMENT = false as const;
export const PHYSICAL_PERCENT_COMPLETE_CERTIFIED = false as const;

export const PRODUCTION_MEMORY_REPOSITORY_ALLOWED = false as const;

// ---------------------------------------------------------------------------
// Ownership locks
// ---------------------------------------------------------------------------

/**
 * Project Controls owns controls intelligence about projects (progress today;
 * cost, schedule, change and contingency later). It owns no identity.
 */
export const PROJECT_CONTROLS_OWNERSHIP = "project_controls" as const;

/**
 * LOCKED DECISION (Phase 11B, user-mandated): canonical project identity is
 * owned by the Engineering Shared Project Domain. This unifies the two identity
 * owner spellings Phase 11A deferred: asset identity was already
 * `engineering_os_shared_domain`, and project identity is now the sibling
 * `engineering_os_shared_project_domain`.
 *
 * `engineering_projects` remains the physical store — Phase 11B adds additive
 * reference tables (batch_61) for phases, WBS, work packages, activities and
 * milestones, all owned by the same identity layer.
 *
 * Project Controls consumes `ProjectReference` and nothing else.
 */
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
export const FINANCIAL_LEDGER_OWNERSHIP = "platform_commerce_finance" as const;
export const DIGITAL_TWIN_OWNERSHIP = "external_future" as const;
export const SHM_OWNERSHIP = "external_future" as const;
export const CMMS_WORK_ORDER_OWNERSHIP = "none_in_project_controls" as const;

/** Project Controls owns progress *intelligence*, not the progress of record. */
export const PROGRESS_INTELLIGENCE_OWNERSHIP = "project_controls" as const;

// ---------------------------------------------------------------------------
// Frozen V1 references — Phase 11B must not disturb them
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

// ---------------------------------------------------------------------------
// Forbidden-in-11B locks. Every one of these is a Phase 11B gate.
// ---------------------------------------------------------------------------

export const EARNED_VALUE_IMPLEMENTED = false as const;
export const CPM_SCHEDULING_IMPLEMENTED = false as const;
export const COST_ENGINE_IMPLEMENTED = false as const;
export const BUDGET_LEDGER_IMPLEMENTED = false as const;
export const SCHEDULE_EXECUTION_IMPLEMENTED = false as const;
export const FORECASTING_IMPLEMENTED = false as const;
export const RESOURCE_LEVELING_IMPLEMENTED = false as const;
export const WORK_PACKAGING_UI_IMPLEMENTED = false as const;
export const CHANGE_CONTROL_IMPLEMENTED = false as const;
export const CONTINGENCY_MANAGEMENT_IMPLEMENTED = false as const;
export const PRODUCTIVITY_ANALYSIS_IMPLEMENTED = false as const;
export const CLAIMS_ANALYSIS_IMPLEMENTED = false as const;
export const CASH_FLOW_IMPLEMENTED = false as const;
export const COMMITMENT_TRACKING_IMPLEMENTED = false as const;

/** The progress slice introduces PC-owned tables; nothing else does. */
export const PROJECT_CONTROLS_PROGRESS_TABLES_INTRODUCED = true as const;
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

// ---------------------------------------------------------------------------
// Migrations owned by Phase 11B
// ---------------------------------------------------------------------------

export const SHARED_PROJECT_DOMAIN_MIGRATION =
  "supabase/migrations/20260808010000_batch_61_shared_project_domain_references.sql" as const;
export const PROJECT_CONTROLS_PROGRESS_MIGRATION =
  "supabase/migrations/20260808020000_batch_62_project_controls_progress.sql" as const;

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

// ---------------------------------------------------------------------------
// Concept inventory — implemented vs reserved
// ---------------------------------------------------------------------------

export const PROJECT_CONTROLS_IMPLEMENTED_CONCEPTS = ["progress", "project_profile"] as const;

export const PROJECT_CONTROLS_RESERVED_CONCEPTS = [
  "cost",
  "schedule",
  "change",
  "contingency",
  "earned_value_reserved",
  "commitment",
  "productivity",
  "resource_demand",
  "baseline",
  "variance",
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
    phase11aCertifiedCommit: PHASE_11A_CERTIFIED_COMMIT,
    phase11aHostedRun: PHASE_11A_HOSTED_RUN,
    projectControlsImplemented: PROJECT_CONTROLS_IMPLEMENTED,
    productionProjectControlsReady: PRODUCTION_PROJECT_CONTROLS_READY,
    sharedProjectDomainReady: SHARED_PROJECT_DOMAIN_READY,
    projectContextEngineReady: PROJECT_CONTEXT_ENGINE_READY,
    progressIntelligenceReady: PROGRESS_INTELLIGENCE_READY,
    progressConfidenceEngineReady: PROGRESS_CONFIDENCE_ENGINE_READY,
    progressMeasurementImplemented: PROGRESS_MEASUREMENT_IMPLEMENTED,
    progressMeasurementIsAdvisoryOnly: PROGRESS_MEASUREMENT_IS_ADVISORY_ONLY,
    progressMeasurementIsEarnedValue: PROGRESS_MEASUREMENT_IS_EARNED_VALUE,
    physicalPercentCompleteCertified: PHYSICAL_PERCENT_COMPLETE_CERTIFIED,
    productionMemoryRepositoryAllowed: PRODUCTION_MEMORY_REPOSITORY_ALLOWED,
    projectControlsOwnership: PROJECT_CONTROLS_OWNERSHIP,
    canonicalProjectIdentityOwnership: CANONICAL_PROJECT_IDENTITY_OWNERSHIP,
    projectIdentityOwnership: PROJECT_IDENTITY_OWNERSHIP,
    canonicalProjectHierarchyOwnership: CANONICAL_PROJECT_HIERARCHY_OWNERSHIP,
    canonicalProjectIdentityPhysicalStore: CANONICAL_PROJECT_IDENTITY_PHYSICAL_STORE,
    canonicalProjectIdentityClaimedByProjectControls:
      CANONICAL_PROJECT_IDENTITY_CLAIMED_BY_PROJECT_CONTROLS,
    projectIdentityOwnerSpellingUnification: PROJECT_IDENTITY_OWNER_SPELLING_UNIFICATION,
    projectControlsConsumesProjectReferenceOnly:
      PROJECT_CONTROLS_CONSUMES_PROJECT_REFERENCE_ONLY,
    canonicalAssetIdentityOwnership: CANONICAL_ASSET_IDENTITY_OWNERSHIP,
    canonicalAssetLifecycleOwnership: CANONICAL_ASSET_LIFECYCLE_OWNERSHIP,
    canonicalEngineeringRiskOwnership: CANONICAL_ENGINEERING_RISK_OWNERSHIP,
    projectIntelligenceOwnership: PROJECT_INTELLIGENCE_OWNERSHIP,
    assetIntelligenceOwnership: ASSET_INTELLIGENCE_OWNERSHIP,
    inspectionIntelligenceOwnership: INSPECTION_INTELLIGENCE_OWNERSHIP,
    financialLedgerOwnership: FINANCIAL_LEDGER_OWNERSHIP,
    digitalTwinOwnership: DIGITAL_TWIN_OWNERSHIP,
    shmOwnership: SHM_OWNERSHIP,
    cmmsWorkOrderOwnership: CMMS_WORK_ORDER_OWNERSHIP,
    assetIntelligenceV1Intact: ASSET_INTELLIGENCE_V1_INTACT,
    assetIntelligenceV1Tag: ASSET_INTELLIGENCE_V1_TAG,
    assetIntelligenceV1Commit: ASSET_INTELLIGENCE_V1_COMMIT,
    assetIntelligenceV1Version: ASSET_INTELLIGENCE_V1_VERSION,
    projectIntelligenceV1Intact: PROJECT_INTELLIGENCE_V1_INTACT,
    inspectionIntelligenceV1Intact: INSPECTION_INTELLIGENCE_V1_INTACT,
    earnedValueImplemented: EARNED_VALUE_IMPLEMENTED,
    cpmSchedulingImplemented: CPM_SCHEDULING_IMPLEMENTED,
    costEngineImplemented: COST_ENGINE_IMPLEMENTED,
    budgetLedgerImplemented: BUDGET_LEDGER_IMPLEMENTED,
    scheduleExecutionImplemented: SCHEDULE_EXECUTION_IMPLEMENTED,
    forecastingImplemented: FORECASTING_IMPLEMENTED,
    resourceLevelingImplemented: RESOURCE_LEVELING_IMPLEMENTED,
    workPackagingUiImplemented: WORK_PACKAGING_UI_IMPLEMENTED,
    changeControlImplemented: CHANGE_CONTROL_IMPLEMENTED,
    contingencyManagementImplemented: CONTINGENCY_MANAGEMENT_IMPLEMENTED,
    productivityAnalysisImplemented: PRODUCTIVITY_ANALYSIS_IMPLEMENTED,
    claimsAnalysisImplemented: CLAIMS_ANALYSIS_IMPLEMENTED,
    projectControlsProgressTablesIntroduced: PROJECT_CONTROLS_PROGRESS_TABLES_INTRODUCED,
    projectControlsCostScheduleTablesIntroduced:
      PROJECT_CONTROLS_COST_SCHEDULE_TABLES_INTRODUCED,
    projectControlsProductUiImplemented: PROJECT_CONTROLS_PRODUCT_UI_IMPLEMENTED,
    moduleRegistryStatus: PROJECT_CONTROLS_MODULE_REGISTRY_STATUS,
    moduleGa: PROJECT_CONTROLS_MODULE_GA,
    entitlementsAreEntitlementOnly: PROJECT_CONTROLS_ENTITLEMENTS_ARE_ENTITLEMENT_ONLY,
    duplicateAssetOwnershipIntroduced: DUPLICATE_ASSET_OWNERSHIP_INTRODUCED,
    duplicateProjectOwnershipDetected: DUPLICATE_PROJECT_OWNERSHIP_DETECTED,
    canonicalLifecycleMutationAllowed: CANONICAL_LIFECYCLE_MUTATION_ALLOWED,
    riskCoreAutoMutationAllowed: RISK_CORE_AUTO_MUTATION_ALLOWED,
    aiMayPublishProgressForbidden: AI_MAY_PUBLISH_PROGRESS_FORBIDDEN,
    implementedConcepts: PROJECT_CONTROLS_IMPLEMENTED_CONCEPTS,
    reservedConcepts: PROJECT_CONTROLS_RESERVED_CONCEPTS,
    progressTables: PROJECT_CONTROLS_PROGRESS_TABLES,
    hierarchy:
      "RTB AI Platform → Engineering OS → Engineering Shared Project Domain (canonical project identity) → Project Controls (progress intelligence about projects — advisory only)" as const,
  };
}

/** @deprecated Phase 11A name; kept so 11A consumers keep compiling. */
export const getProjectControlsDiscoveryDeclaration = getProjectControlsDeclaration;
