/**
 * Phase 11A — Project Controls Discovery. Single authoritative version source.
 *
 * This module is a *discovery* artefact. It declares boundaries, ownership and
 * the concepts a future Project Controls product would need. It implements no
 * Project Controls product functionality: no earned value, no CPM, no cost
 * engine, no schedule execution, no budget ledger and no work packaging UI.
 *
 * Anything that publishes a Project Controls version (docs, certification,
 * future manifests) reads from here. Nothing may hard-code a second one.
 */
export const PROJECT_CONTROLS_PRODUCT_NAME = "Project Controls" as const;
export const PROJECT_CONTROLS_MODULE_KEY = "project_controls" as const;
export const PROJECT_CONTROLS_VERSION = "0.1.0-discovery" as const;
export const PROJECT_CONTROLS_STATUS = "discovery" as const;
export const PROJECT_CONTROLS_PHASE = "11A" as const;

/**
 * Declared for boundary documentation only. Phase 11A ships no page, no layout
 * and no API handler behind these prefixes; the Engineering OS module registry
 * entry stays `coming_soon`.
 */
export const PROJECT_CONTROLS_ROUTE_PREFIX = "/engineering/apps/project-controls" as const;
export const PROJECT_CONTROLS_API_PREFIX = "/api/engineering/project-controls" as const;

// ---------------------------------------------------------------------------
// Implementation state
// ---------------------------------------------------------------------------

/** No Project Controls *product* exists. Discovery never flips this. */
export const PROJECT_CONTROLS_IMPLEMENTED = false as const;
/** The discovery package itself exists — this is the only thing Phase 11A adds. */
export const PROJECT_CONTROLS_DISCOVERY_IMPLEMENTED = true as const;
export const PRODUCTION_PROJECT_CONTROLS_READY = false as const;

// ---------------------------------------------------------------------------
// Ownership placeholders — locked in version, expanded in the ownership matrix
// ---------------------------------------------------------------------------

/**
 * Project Controls owns *controls intelligence about projects* (cost, schedule,
 * progress, change, contingency). It does not own the project record itself.
 */
export const PROJECT_CONTROLS_OWNERSHIP = "project_controls" as const;

/**
 * LOCKED DECISION (Phase 11A): canonical project identity is owned by
 * `engineering_core`, not by Project Controls.
 *
 * Repo evidence for the decision:
 *   - `packages/project-intelligence/src/reports/executive-dashboard.ts` cites
 *     `{ source: "engineering_core", refId: "projects.active" }`.
 *   - `packages/project-intelligence/src/reports/executive-widgets.ts` declares
 *     the `project_health` widget `owner: "engineering_core"`.
 *   - Canonical registers (risks, issues, actions, technical queries, lessons)
 *     are all attributed to `engineering_core` by Project Intelligence.
 *
 * Asset identity uses the sibling constant `engineering_os_shared_domain`
 * (see `packages/asset-intelligence/src/version.ts`); both names denote the
 * Engineering OS canonical layer, and Phase 11A does not attempt to unify them.
 * Unifying the two identity-owner spellings is deferred to Phase 11B.
 */
export const PROJECT_IDENTITY_OWNERSHIP = "engineering_core" as const;
export const CANONICAL_PROJECT_IDENTITY_CLAIMED_BY_PROJECT_CONTROLS = false as const;
export const PROJECT_IDENTITY_OWNER_SPELLING_UNIFICATION = "deferred_to_phase_11b" as const;

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

// ---------------------------------------------------------------------------
// Asset Intelligence V1 freeze reference — Phase 11A must not disturb it
// ---------------------------------------------------------------------------

export const ASSET_INTELLIGENCE_V1_TAG = "asset-intelligence-v1.0.0" as const;
export const ASSET_INTELLIGENCE_V1_COMMIT =
  "925e2ed74025cac6a145c346c17c53320efb8757" as const;
export const ASSET_INTELLIGENCE_V1_VERSION = "1.0.0" as const;
export const ASSET_INTELLIGENCE_V1_INTACT = true as const;

export const PROJECT_INTELLIGENCE_V1_TAG = "project-intelligence-v1.0.0" as const;
export const PROJECT_INTELLIGENCE_V1_COMMIT =
  "34975b1cf660580d46287f24e746b8915903f768" as const;
export const INSPECTION_INTELLIGENCE_V1_TAG = "inspection-intelligence-v1.0.0" as const;
export const INSPECTION_INTELLIGENCE_V1_COMMIT =
  "d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09" as const;

// ---------------------------------------------------------------------------
// Forbidden-in-discovery locks. Every one of these is a Phase 11A gate.
// ---------------------------------------------------------------------------

export const EARNED_VALUE_IMPLEMENTED = false as const;
export const CPM_SCHEDULING_IMPLEMENTED = false as const;
export const COST_ENGINE_IMPLEMENTED = false as const;
export const SCHEDULE_EXECUTION_IMPLEMENTED = false as const;
export const BUDGET_LEDGER_IMPLEMENTED = false as const;
export const WORK_PACKAGING_UI_IMPLEMENTED = false as const;
export const PROGRESS_MEASUREMENT_IMPLEMENTED = false as const;
export const CHANGE_CONTROL_IMPLEMENTED = false as const;
export const CONTINGENCY_MANAGEMENT_IMPLEMENTED = false as const;
export const FORECASTING_IMPLEMENTED = false as const;

export const PROJECT_CONTROLS_PRODUCT_TABLES_INTRODUCED = false as const;
export const PROJECT_CONTROLS_PRODUCT_UI_IMPLEMENTED = false as const;
export const PROJECT_CONTROLS_MODULE_REGISTRY_STATUS = "coming_soon" as const;
export const PROJECT_CONTROLS_MODULE_REGISTRY_VERSION = "0.0.0" as const;
export const PROJECT_CONTROLS_ENTITLEMENTS_ARE_ENTITLEMENT_ONLY = true as const;

export const DUPLICATE_ASSET_OWNERSHIP_INTRODUCED = false as const;
export const DUPLICATE_PROJECT_OWNERSHIP_INTRODUCED = false as const;
export const CANONICAL_LIFECYCLE_MUTATION_ALLOWED = false as const;
export const RISK_CORE_AUTO_MUTATION_ALLOWED = false as const;

// ---------------------------------------------------------------------------
// Discovery concept inventory — candidates only, none implemented
// ---------------------------------------------------------------------------

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

/**
 * Entitlement keys that already exist in `platform-commerce`. Phase 11A records
 * them so the certification can prove they remain *entitlement-only* — they
 * gate access to routes that do not yet render a Project Controls product.
 */
export const PROJECT_CONTROLS_EXISTING_ENTITLEMENTS = [
  "action.read",
  "action.write",
  "access",
] as const;

export function getProjectControlsDiscoveryDeclaration() {
  return {
    productName: PROJECT_CONTROLS_PRODUCT_NAME,
    moduleKey: PROJECT_CONTROLS_MODULE_KEY,
    version: PROJECT_CONTROLS_VERSION,
    status: PROJECT_CONTROLS_STATUS,
    phase: PROJECT_CONTROLS_PHASE,
    routePrefix: PROJECT_CONTROLS_ROUTE_PREFIX,
    apiPrefix: PROJECT_CONTROLS_API_PREFIX,
    projectControlsImplemented: PROJECT_CONTROLS_IMPLEMENTED,
    discoveryImplemented: PROJECT_CONTROLS_DISCOVERY_IMPLEMENTED,
    productionProjectControlsReady: PRODUCTION_PROJECT_CONTROLS_READY,
    projectControlsOwnership: PROJECT_CONTROLS_OWNERSHIP,
    projectIdentityOwnership: PROJECT_IDENTITY_OWNERSHIP,
    canonicalProjectIdentityClaimedByProjectControls:
      CANONICAL_PROJECT_IDENTITY_CLAIMED_BY_PROJECT_CONTROLS,
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
    earnedValueImplemented: EARNED_VALUE_IMPLEMENTED,
    cpmSchedulingImplemented: CPM_SCHEDULING_IMPLEMENTED,
    costEngineImplemented: COST_ENGINE_IMPLEMENTED,
    scheduleExecutionImplemented: SCHEDULE_EXECUTION_IMPLEMENTED,
    budgetLedgerImplemented: BUDGET_LEDGER_IMPLEMENTED,
    workPackagingUiImplemented: WORK_PACKAGING_UI_IMPLEMENTED,
    progressMeasurementImplemented: PROGRESS_MEASUREMENT_IMPLEMENTED,
    changeControlImplemented: CHANGE_CONTROL_IMPLEMENTED,
    contingencyManagementImplemented: CONTINGENCY_MANAGEMENT_IMPLEMENTED,
    forecastingImplemented: FORECASTING_IMPLEMENTED,
    projectControlsProductTablesIntroduced: PROJECT_CONTROLS_PRODUCT_TABLES_INTRODUCED,
    projectControlsProductUiImplemented: PROJECT_CONTROLS_PRODUCT_UI_IMPLEMENTED,
    moduleRegistryStatus: PROJECT_CONTROLS_MODULE_REGISTRY_STATUS,
    entitlementsAreEntitlementOnly: PROJECT_CONTROLS_ENTITLEMENTS_ARE_ENTITLEMENT_ONLY,
    duplicateAssetOwnershipIntroduced: DUPLICATE_ASSET_OWNERSHIP_INTRODUCED,
    canonicalLifecycleMutationAllowed: CANONICAL_LIFECYCLE_MUTATION_ALLOWED,
    riskCoreAutoMutationAllowed: RISK_CORE_AUTO_MUTATION_ALLOWED,
    discoveryConcepts: PROJECT_CONTROLS_DISCOVERY_CONCEPTS,
    hierarchy:
      "RTB AI Platform → Engineering OS → Engineering Core (canonical project identity) → Project Controls (controls intelligence about projects — discovery only)" as const,
  };
}
