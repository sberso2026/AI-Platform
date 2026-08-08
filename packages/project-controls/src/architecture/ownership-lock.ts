/**
 * Phase 11E — Project Controls ownership lock.
 *
 * The matrix below is the machine-readable twin of
 * `docs/architecture/PROJECT_CONTROLS_OWNERSHIP_MATRIX.md`. It exists so a
 * boundary violation fails a test rather than a review.
 *
 * Phase 11B change: canonical project identity moves from the Phase 11A
 * placeholder spelling `engineering_core` to `engineering_os_shared_project_domain`,
 * matching the sibling asset identity owner. Project Controls consumes a
 * `ProjectReference` from that layer and owns intelligence about projects only.
 *
 * Phase 11D change: change *intelligence* becomes an owned, implemented concern
 * while contractual change *authority* stays outside Project Controls, and
 * financial ledger ownership is re-spelled to
 * `external_finance_or_future_finance_domain`.
 */

import {
  AI_MAY_PUBLISH_CHANGE_FORBIDDEN,
  AI_MAY_PUBLISH_PROGRESS_FORBIDDEN,
  AI_MAY_PUBLISH_SCHEDULE_FORBIDDEN,
  AUTONOMOUS_CHANGE_PUBLICATION_ALLOWED,
  AUTONOMOUS_PROGRESS_PUBLICATION_ALLOWED,
  AUTONOMOUS_SCHEDULE_PUBLICATION_ALLOWED,
  BUDGET_LEDGER_IMPLEMENTED,
  CHANGE_EXECUTION_IMPLEMENTED,
  CHANGE_INTELLIGENCE_IS_ADVISORY_ONLY,
  CHANGE_INTELLIGENCE_IS_CONTRACTUAL_AUTHORITY,
  CHANGE_INTELLIGENCE_OWNERSHIP,
  CHANGE_INTELLIGENCE_READY,
  CONTRACTUAL_CHANGE_APPROVAL_BY_AI_ALLOWED,
  COST_INTELLIGENCE_IS_ADVISORY_ONLY,
  COST_INTELLIGENCE_OWNERSHIP,
  COST_INTELLIGENCE_READY,
  PRODUCTIVITY_INTELLIGENCE_IS_ADVISORY_ONLY,
  PRODUCTIVITY_INTELLIGENCE_OWNERSHIP,
  PRODUCTIVITY_INTELLIGENCE_READY,
  FORECAST_INTELLIGENCE_OWNERSHIP,
  FORECAST_INTELLIGENCE_READY,
  FORECAST_INTELLIGENCE_IS_ADVISORY_ONLY,
  PROJECT_CONTEXT_COMPOSITION_READY,
  projectContextCompositionOwnership,
  CONTRACTUAL_CHANGE_AUTHORITY_OWNERSHIP,
  FINANCIAL_LEDGER_OWNERSHIP,
  FINANCIAL_POSTING_IMPLEMENTED,
  CANONICAL_ASSET_IDENTITY_OWNERSHIP,
  CANONICAL_ASSET_LIFECYCLE_OWNERSHIP,
  CANONICAL_ENGINEERING_RISK_OWNERSHIP,
  CANONICAL_LIFECYCLE_MUTATION_ALLOWED,
  CANONICAL_PROJECT_HIERARCHY_OWNERSHIP,
  CANONICAL_PROJECT_IDENTITY_CLAIMED_BY_PROJECT_CONTROLS,
  CANONICAL_PROJECT_IDENTITY_OWNERSHIP,
  CHANGE_CONTROL_IMPLEMENTED,
  CONTINGENCY_MANAGEMENT_IMPLEMENTED,
  COST_ENGINE_IMPLEMENTED,
  CPM_SCHEDULING_IMPLEMENTED,
  DUPLICATE_ASSET_OWNERSHIP_INTRODUCED,
  DUPLICATE_PROJECT_OWNERSHIP_DETECTED,
  DUPLICATE_PROJECT_OWNERSHIP_INTRODUCED,
  EARNED_VALUE_IMPLEMENTED,
  FLOAT_COMPUTATION_IMPLEMENTED,
  FORECASTING_IMPLEMENTED,
  PRODUCTION_PROJECT_CONTROLS_READY,
  PROGRESS_INTELLIGENCE_OWNERSHIP,
  PROGRESS_INTELLIGENCE_READY,
  PROGRESS_MEASUREMENT_IS_ADVISORY_ONLY,
  PROGRESS_MEASUREMENT_IS_EARNED_VALUE,
  PROJECT_CONTEXT_ENGINE_READY,
  PROJECT_CONTROLS_CONSUMES_PROJECT_REFERENCE_ONLY,
  PROJECT_CONTROLS_IMPLEMENTED,
  PROJECT_CONTROLS_OWNERSHIP,
  PROJECT_IDENTITY_MUTATION_BY_PROJECT_CONTROLS_ALLOWED,
  PROJECT_IDENTITY_OWNER_SPELLING_UNIFICATION,
  PROJECT_IDENTITY_OWNERSHIP,
  LABOUR_COST_ENGINE_IMPLEMENTED,
  PAYROLL_IMPLEMENTED,
  PRODUCTIVITY_ANALYSIS_IMPLEMENTED,
  RESOURCE_PLANNING_IMPLEMENTED,
  TIMESHEET_SYSTEM_IMPLEMENTED,
  RESOURCE_LEVELING_IMPLEMENTED,
  RISK_CORE_AUTO_MUTATION_ALLOWED,
  SCHEDULE_EXECUTION_IMPLEMENTED,
  SCHEDULE_INTELLIGENCE_IS_ADVISORY_ONLY,
  SCHEDULE_INTELLIGENCE_IS_CPM,
  SCHEDULE_INTELLIGENCE_OWNERSHIP,
  SCHEDULE_INTELLIGENCE_READY,
  SHARED_PROJECT_DOMAIN_READY,
} from "../version";

export type DomainOwner =
  | "engineering_core"
  | "engineering_os_shared_domain"
  | "engineering_os_shared_project_domain"
  | "project_intelligence"
  | "project_controls"
  | "asset_intelligence"
  | "inspection_intelligence"
  | "platform_commerce_finance"
  | "external_finance_or_future_finance_domain"
  | "reserved_not_project_controls"
  | "external_future"
  | "none_in_project_controls";

/** How Project Controls relates to a concern it does not own. */
export type BoundaryRelation = "owns" | "consumes" | "forbidden";

export type OwnershipRow = {
  concern: string;
  owner: DomainOwner;
  /** Project Controls' relationship to this concern. */
  relation: BoundaryRelation;
  notes: string;
};

export const PROJECT_CONTROLS_OWNERSHIP_MATRIX: readonly OwnershipRow[] = [
  {
    concern: "project_identity_canonical",
    owner: "engineering_os_shared_project_domain",
    relation: "consumes",
    notes:
      "Locked 11B: the Engineering Shared Project Domain owns the project record; PC consumes ProjectReference only",
  },
  {
    concern: "project_hierarchy_wbs_canonical",
    owner: "engineering_os_shared_project_domain",
    relation: "consumes",
    notes:
      "Phases, WBS nodes, work packages, activities and milestones are identity refs owned by the shared project domain",
  },
  {
    concern: "project_knowledge",
    owner: "project_intelligence",
    relation: "consumes",
    notes: "PI owns docs/findings/meetings knowledge ABOUT projects",
  },
  {
    concern: "project_documents",
    owner: "project_intelligence",
    relation: "consumes",
    notes: "PI owns document intelligence derivatives",
  },
  {
    concern: "meeting_intelligence",
    owner: "project_intelligence",
    relation: "consumes",
    notes: "PI owns meeting derivatives; PC may cite them as progress evidence",
  },
  {
    concern: "progress_controls_intelligence",
    owner: "project_controls",
    relation: "owns",
    notes: "Implemented in 11B as advisory, evidence-driven progress intelligence",
  },
  {
    concern: "project_profile_composition",
    owner: "project_controls",
    relation: "owns",
    notes: "Project Context Engine composes a ProjectProfile from PC-owned intelligence",
  },
  {
    concern: "cost_controls_intelligence",
    owner: "project_controls",
    relation: "owns",
    notes:
      "Implemented in 11E as advisory, evidence-driven cost intelligence — not a budget ledger, not financial posting, not earned value",
  },
  {
    concern: "productivity_controls_intelligence",
    owner: "project_controls",
    relation: "owns",
    notes:
      "Implemented in 11F as advisory, evidence-driven productivity intelligence — not workforce management, payroll, timesheets or labour %",
  },
  {
    concern: "schedule_controls_intelligence",
    owner: "project_controls",
    relation: "owns",
    notes:
      "Implemented in 11C as advisory, evidence-driven schedule intelligence — not CPM or execution",
  },
  {
    concern: "change_controls_intelligence",
    owner: "project_controls",
    relation: "owns",
    notes:
      "Implemented in 11D as advisory, evidence-driven change intelligence — not contractual change authority and not change execution",
  },
  {
    concern: "contractual_change_authority",
    owner: "reserved_not_project_controls",
    relation: "forbidden",
    notes:
      "Raising, approving, pricing and executing a contractual change belongs to engineering_core, a future commercial/contracts domain, business OS or external contract administration",
  },
  {
    concern: "project_snapshot_and_timeline",
    owner: "project_controls",
    relation: "owns",
    notes:
      "Immutable identifier-only snapshots and an append-only project timeline introduced in 11D",
  },
  {
    concern: "contingency_controls_intelligence",
    owner: "project_controls",
    relation: "owns",
    notes: "Reserved provider interface only; no contingency drawdown in 11D",
  },
  {
    concern: "earned_value",
    owner: "project_controls",
    relation: "forbidden",
    notes:
      "RESERVED — reserved to PC by domain, forbidden to implement; progress intelligence is not earned value",
  },
  {
    concern: "asset_identity_canonical",
    owner: "engineering_os_shared_domain",
    relation: "consumes",
    notes: "PC never owns canonical asset identity",
  },
  {
    concern: "asset_lifecycle_canonical",
    owner: "engineering_os_shared_domain",
    relation: "forbidden",
    notes: "PC never mutates canonical asset lifecycle",
  },
  {
    concern: "asset_intelligence",
    owner: "asset_intelligence",
    relation: "consumes",
    notes: "Frozen V1 — PC consumes public contracts only, owns nothing",
  },
  {
    concern: "inspection_intelligence",
    owner: "inspection_intelligence",
    relation: "consumes",
    notes: "PC may cite inspection results as progress evidence via II public contracts",
  },
  {
    concern: "canonical_risk_register",
    owner: "engineering_core",
    relation: "forbidden",
    notes: "PC may reference risks; auto-mutation of Core Risk is forbidden",
  },
  {
    concern: "financial_ledgers_billing",
    owner: "external_finance_or_future_finance_domain",
    relation: "forbidden",
    notes:
      "Money movement, budgets and postings sit in an external or future finance domain; PC is not a ledger and posts nothing",
  },
  {
    concern: "entitlements_seats_licensing",
    owner: "platform_commerce_finance",
    relation: "consumes",
    notes: "Existing project_controls entitlements are entitlement-only",
  },
  {
    concern: "digital_twin",
    owner: "external_future",
    relation: "forbidden",
    notes: "Out of PC scope",
  },
  {
    concern: "structural_health_monitoring",
    owner: "external_future",
    relation: "forbidden",
    notes: "Out of PC scope",
  },
  {
    concern: "cmms_work_orders",
    owner: "none_in_project_controls",
    relation: "forbidden",
    notes: "No work order execution in PC",
  },
] as const;

export function listConcernsByRelation(relation: BoundaryRelation): readonly OwnershipRow[] {
  return PROJECT_CONTROLS_OWNERSHIP_MATRIX.filter((row) => row.relation === relation);
}

export function assertOwnershipLock(): {
  ok: true;
  projectControlsOwnership: typeof PROJECT_CONTROLS_OWNERSHIP;
  projectIdentityOwnership: typeof PROJECT_IDENTITY_OWNERSHIP;
  canonicalProjectIdentityOwnership: typeof CANONICAL_PROJECT_IDENTITY_OWNERSHIP;
  canonicalProjectIdentityClaimedByProjectControls: false;
  canonicalAssetIdentityOwnership: typeof CANONICAL_ASSET_IDENTITY_OWNERSHIP;
  canonicalEngineeringRiskOwnership: typeof CANONICAL_ENGINEERING_RISK_OWNERSHIP;
  progressIntelligenceOwnership: typeof PROGRESS_INTELLIGENCE_OWNERSHIP;
  scheduleIntelligenceOwnership: typeof SCHEDULE_INTELLIGENCE_OWNERSHIP;
  changeIntelligenceOwnership: typeof CHANGE_INTELLIGENCE_OWNERSHIP;
  costIntelligenceOwnership: typeof COST_INTELLIGENCE_OWNERSHIP;
  productivityIntelligenceOwnership: typeof PRODUCTIVITY_INTELLIGENCE_OWNERSHIP;
  forecastIntelligenceOwnership: typeof FORECAST_INTELLIGENCE_OWNERSHIP;
  projectContextCompositionOwnership: typeof projectContextCompositionOwnership;
  contractualChangeAuthorityOwnership: typeof CONTRACTUAL_CHANGE_AUTHORITY_OWNERSHIP;
  financialLedgerOwnership: typeof FINANCIAL_LEDGER_OWNERSHIP;
  sharedProjectDomainReady: true;
  projectContextEngineReady: true;
  progressIntelligenceReady: true;
  scheduleIntelligenceReady: true;
  changeIntelligenceReady: true;
  changeIntelligenceIsContractualAuthority: false;
  costIntelligenceReady: true;
  costIntelligenceIsAdvisoryOnly: true;
  productivityIntelligenceReady: true;
  productivityIntelligenceIsAdvisoryOnly: true;
  forecastIntelligenceReady: true;
  forecastIntelligenceIsAdvisoryOnly: true;
  projectContextCompositionReady: true;
  projectControlsImplemented: false;
  productionProjectControlsReady: false;
  duplicateAssetOwnershipIntroduced: false;
  duplicateProjectOwnershipDetected: false;
  canonicalLifecycleMutationAllowed: false;
  riskCoreAutoMutationAllowed: false;
} {
  if (PROJECT_CONTROLS_OWNERSHIP !== "project_controls") {
    throw new Error("project_controls_owner_mismatch");
  }
  if (PROJECT_IDENTITY_OWNERSHIP !== "engineering_os_shared_project_domain") {
    throw new Error("project_identity_must_be_shared_project_domain");
  }
  if (CANONICAL_PROJECT_IDENTITY_OWNERSHIP !== "engineering_os_shared_project_domain") {
    throw new Error("canonical_project_identity_must_be_shared_project_domain");
  }
  if (CANONICAL_PROJECT_HIERARCHY_OWNERSHIP !== "engineering_os_shared_project_domain") {
    throw new Error("project_hierarchy_must_be_shared_project_domain");
  }
  if (PROJECT_IDENTITY_OWNER_SPELLING_UNIFICATION !== "unified_in_phase_11b") {
    throw new Error("project_identity_owner_spelling_must_be_unified");
  }
  if (CANONICAL_PROJECT_IDENTITY_CLAIMED_BY_PROJECT_CONTROLS) {
    throw new Error("project_controls_may_not_claim_canonical_project_identity");
  }
  if (PROJECT_IDENTITY_MUTATION_BY_PROJECT_CONTROLS_ALLOWED) {
    throw new Error("project_controls_may_not_mutate_project_identity");
  }
  if (!PROJECT_CONTROLS_CONSUMES_PROJECT_REFERENCE_ONLY) {
    throw new Error("project_controls_must_consume_project_reference_only");
  }
  if (CANONICAL_ASSET_IDENTITY_OWNERSHIP !== "engineering_os_shared_domain") {
    throw new Error("asset_identity_must_be_shared_domain");
  }
  if (CANONICAL_ASSET_LIFECYCLE_OWNERSHIP !== "engineering_os_shared_domain") {
    throw new Error("asset_lifecycle_must_be_shared_domain");
  }
  if (CANONICAL_ENGINEERING_RISK_OWNERSHIP !== "engineering_core") {
    throw new Error("canonical_risk_must_be_engineering_core");
  }
  if (FINANCIAL_LEDGER_OWNERSHIP !== "external_finance_or_future_finance_domain") {
    throw new Error("financial_ledger_owner_must_be_external_finance_domain");
  }
  if (CHANGE_INTELLIGENCE_OWNERSHIP !== "project_controls") {
    throw new Error("change_intelligence_must_be_owned_by_project_controls");
  }
  if (COST_INTELLIGENCE_OWNERSHIP !== "project_controls") {
    throw new Error("cost_intelligence_must_be_owned_by_project_controls");
  }
  if (!COST_INTELLIGENCE_READY || !COST_INTELLIGENCE_IS_ADVISORY_ONLY) {
    throw new Error("cost_intelligence_flags_invalid");
  }
  if (PRODUCTIVITY_INTELLIGENCE_OWNERSHIP !== "project_controls") {
    throw new Error("productivity_intelligence_must_be_owned_by_project_controls");
  }
  if (!PRODUCTIVITY_INTELLIGENCE_READY || !PRODUCTIVITY_INTELLIGENCE_IS_ADVISORY_ONLY) {
    throw new Error("productivity_intelligence_flags_invalid");
  }
  if (PRODUCTIVITY_ANALYSIS_IMPLEMENTED) {
    throw new Error("productivity_provider_unit_rates_must_stay_unimplemented");
  }
  if (String(CONTRACTUAL_CHANGE_AUTHORITY_OWNERSHIP) === "project_controls") {
    throw new Error("project_controls_may_not_hold_contractual_change_authority");
  }
  if (PROJECT_CONTROLS_IMPLEMENTED || PRODUCTION_PROJECT_CONTROLS_READY) {
    throw new Error("project_controls_product_forbidden_in_phase_11f");
  }
  if (
    EARNED_VALUE_IMPLEMENTED ||
    CPM_SCHEDULING_IMPLEMENTED ||
    FLOAT_COMPUTATION_IMPLEMENTED ||
    COST_ENGINE_IMPLEMENTED ||
    BUDGET_LEDGER_IMPLEMENTED ||
    FINANCIAL_POSTING_IMPLEMENTED ||
    RESOURCE_PLANNING_IMPLEMENTED ||
    TIMESHEET_SYSTEM_IMPLEMENTED ||
    PAYROLL_IMPLEMENTED ||
    LABOUR_COST_ENGINE_IMPLEMENTED ||
    SCHEDULE_EXECUTION_IMPLEMENTED ||
    FORECASTING_IMPLEMENTED ||
    RESOURCE_LEVELING_IMPLEMENTED ||
    CHANGE_CONTROL_IMPLEMENTED ||
    CHANGE_EXECUTION_IMPLEMENTED ||
    CONTINGENCY_MANAGEMENT_IMPLEMENTED
  ) {
    throw new Error("project_controls_engines_forbidden_in_phase_11d");
  }
  if (PROGRESS_MEASUREMENT_IS_EARNED_VALUE || !PROGRESS_MEASUREMENT_IS_ADVISORY_ONLY) {
    throw new Error("progress_intelligence_must_stay_advisory_not_earned_value");
  }
  if (SCHEDULE_INTELLIGENCE_IS_CPM || !SCHEDULE_INTELLIGENCE_IS_ADVISORY_ONLY) {
    throw new Error("schedule_intelligence_must_stay_advisory_not_cpm");
  }
  if (
    CHANGE_INTELLIGENCE_IS_CONTRACTUAL_AUTHORITY ||
    !CHANGE_INTELLIGENCE_IS_ADVISORY_ONLY
  ) {
    throw new Error("change_intelligence_must_stay_advisory_not_contractual_authority");
  }
  if (
    !SHARED_PROJECT_DOMAIN_READY ||
    !PROJECT_CONTEXT_ENGINE_READY ||
    !PROGRESS_INTELLIGENCE_READY ||
    !SCHEDULE_INTELLIGENCE_READY ||
    !CHANGE_INTELLIGENCE_READY ||
    !COST_INTELLIGENCE_READY ||
    !PRODUCTIVITY_INTELLIGENCE_READY
  ) {
    throw new Error("phase_11f_capabilities_must_be_ready");
  }
  if (
    DUPLICATE_ASSET_OWNERSHIP_INTRODUCED ||
    DUPLICATE_PROJECT_OWNERSHIP_INTRODUCED ||
    DUPLICATE_PROJECT_OWNERSHIP_DETECTED
  ) {
    throw new Error("duplicate_ownership");
  }
  if (CANONICAL_LIFECYCLE_MUTATION_ALLOWED) {
    throw new Error("canonical_lifecycle_mutation_forbidden");
  }
  if (RISK_CORE_AUTO_MUTATION_ALLOWED) {
    throw new Error("core_risk_auto_mutation_forbidden");
  }
  if (AUTONOMOUS_PROGRESS_PUBLICATION_ALLOWED || !AI_MAY_PUBLISH_PROGRESS_FORBIDDEN) {
    throw new Error("autonomous_progress_publication_forbidden");
  }
  if (AUTONOMOUS_SCHEDULE_PUBLICATION_ALLOWED || !AI_MAY_PUBLISH_SCHEDULE_FORBIDDEN) {
    throw new Error("autonomous_schedule_publication_forbidden");
  }
  if (AUTONOMOUS_CHANGE_PUBLICATION_ALLOWED || !AI_MAY_PUBLISH_CHANGE_FORBIDDEN) {
    throw new Error("autonomous_change_publication_forbidden");
  }
  if (CONTRACTUAL_CHANGE_APPROVAL_BY_AI_ALLOWED) {
    throw new Error("contractual_change_approval_by_ai_forbidden");
  }

  const scheduleRows = PROJECT_CONTROLS_OWNERSHIP_MATRIX.filter(
    (row) => row.concern === "schedule_controls_intelligence",
  );
  if (
    scheduleRows.length !== 1 ||
    scheduleRows[0].owner !== "project_controls" ||
    scheduleRows[0].relation !== "owns"
  ) {
    throw new Error("schedule_controls_intelligence_must_be_owned_by_project_controls");
  }

  const changeRows = PROJECT_CONTROLS_OWNERSHIP_MATRIX.filter(
    (row) => row.concern === "change_controls_intelligence",
  );
  if (
    changeRows.length !== 1 ||
    changeRows[0].owner !== "project_controls" ||
    changeRows[0].relation !== "owns"
  ) {
    throw new Error("change_controls_intelligence_must_be_owned_by_project_controls");
  }

  const costRows = PROJECT_CONTROLS_OWNERSHIP_MATRIX.filter(
    (row) => row.concern === "cost_controls_intelligence",
  );
  if (
    costRows.length !== 1 ||
    costRows[0].owner !== "project_controls" ||
    costRows[0].relation !== "owns"
  ) {
    throw new Error("cost_controls_intelligence_must_be_owned_by_project_controls");
  }

  const productivityRows = PROJECT_CONTROLS_OWNERSHIP_MATRIX.filter(
    (row) => row.concern === "productivity_controls_intelligence",
  );
  if (
    productivityRows.length !== 1 ||
    productivityRows[0].owner !== "project_controls" ||
    productivityRows[0].relation !== "owns"
  ) {
    throw new Error("productivity_controls_intelligence_must_be_owned_by_project_controls");
  }

  const authorityRows = PROJECT_CONTROLS_OWNERSHIP_MATRIX.filter(
    (row) => row.concern === "contractual_change_authority",
  );
  if (
    authorityRows.length !== 1 ||
    authorityRows[0].owner === "project_controls" ||
    authorityRows[0].relation !== "forbidden"
  ) {
    throw new Error("contractual_change_authority_must_stay_outside_project_controls");
  }

  const ledgerRows = PROJECT_CONTROLS_OWNERSHIP_MATRIX.filter(
    (row) => row.concern === "financial_ledgers_billing",
  );
  if (
    ledgerRows.length !== 1 ||
    ledgerRows[0].owner !== "external_finance_or_future_finance_domain" ||
    ledgerRows[0].relation !== "forbidden"
  ) {
    throw new Error("financial_ledgers_must_be_external_finance_domain");
  }

  const identityRows = PROJECT_CONTROLS_OWNERSHIP_MATRIX.filter(
    (row) => row.concern === "project_identity_canonical",
  );
  if (
    identityRows.length !== 1 ||
    identityRows[0].owner !== "engineering_os_shared_project_domain"
  ) {
    throw new Error("duplicate_or_wrong_project_identity_owner");
  }
  const hierarchyRows = PROJECT_CONTROLS_OWNERSHIP_MATRIX.filter(
    (row) => row.concern === "project_hierarchy_wbs_canonical",
  );
  if (hierarchyRows.some((row) => row.owner === "project_controls")) {
    throw new Error("project_controls_may_not_own_project_hierarchy");
  }
  const assetIdentityRows = PROJECT_CONTROLS_OWNERSHIP_MATRIX.filter(
    (row) => row.concern === "asset_identity_canonical",
  );
  if (assetIdentityRows.some((row) => row.owner === "project_controls")) {
    throw new Error("project_controls_may_not_own_asset_identity");
  }
  if (
    PROJECT_CONTROLS_OWNERSHIP_MATRIX.some(
      (row) => row.owner === "project_controls" && row.relation === "consumes",
    )
  ) {
    throw new Error("owner_relation_inconsistent");
  }

  return {
    ok: true,
    projectControlsOwnership: PROJECT_CONTROLS_OWNERSHIP,
    projectIdentityOwnership: PROJECT_IDENTITY_OWNERSHIP,
    canonicalProjectIdentityOwnership: CANONICAL_PROJECT_IDENTITY_OWNERSHIP,
    canonicalProjectIdentityClaimedByProjectControls: false,
    canonicalAssetIdentityOwnership: CANONICAL_ASSET_IDENTITY_OWNERSHIP,
    canonicalEngineeringRiskOwnership: CANONICAL_ENGINEERING_RISK_OWNERSHIP,
    progressIntelligenceOwnership: PROGRESS_INTELLIGENCE_OWNERSHIP,
    scheduleIntelligenceOwnership: SCHEDULE_INTELLIGENCE_OWNERSHIP,
    changeIntelligenceOwnership: CHANGE_INTELLIGENCE_OWNERSHIP,
    costIntelligenceOwnership: COST_INTELLIGENCE_OWNERSHIP,
    productivityIntelligenceOwnership: PRODUCTIVITY_INTELLIGENCE_OWNERSHIP,
    forecastIntelligenceOwnership: FORECAST_INTELLIGENCE_OWNERSHIP,
    projectContextCompositionOwnership: projectContextCompositionOwnership,
    contractualChangeAuthorityOwnership: CONTRACTUAL_CHANGE_AUTHORITY_OWNERSHIP,
    financialLedgerOwnership: FINANCIAL_LEDGER_OWNERSHIP,
    sharedProjectDomainReady: true,
    projectContextEngineReady: true,
    progressIntelligenceReady: true,
    scheduleIntelligenceReady: true,
    changeIntelligenceReady: true,
    changeIntelligenceIsContractualAuthority: false,
    costIntelligenceReady: true,
    costIntelligenceIsAdvisoryOnly: true,
    productivityIntelligenceReady: true,
    productivityIntelligenceIsAdvisoryOnly: true,
    forecastIntelligenceReady: true,
    forecastIntelligenceIsAdvisoryOnly: true,
    projectContextCompositionReady: true,
    projectControlsImplemented: false,
    productionProjectControlsReady: false,
    duplicateAssetOwnershipIntroduced: false,
    duplicateProjectOwnershipDetected: false,
    canonicalLifecycleMutationAllowed: false,
    riskCoreAutoMutationAllowed: false,
  };
}
