/**
 * Phase 11A — Project Controls ownership lock.
 *
 * The matrix below is the machine-readable twin of
 * `docs/architecture/PROJECT_CONTROLS_OWNERSHIP_MATRIX.md`. It exists so a
 * boundary violation fails a test rather than a review.
 */

import {
  CANONICAL_ASSET_IDENTITY_OWNERSHIP,
  CANONICAL_ASSET_LIFECYCLE_OWNERSHIP,
  CANONICAL_ENGINEERING_RISK_OWNERSHIP,
  CANONICAL_LIFECYCLE_MUTATION_ALLOWED,
  CANONICAL_PROJECT_IDENTITY_CLAIMED_BY_PROJECT_CONTROLS,
  COST_ENGINE_IMPLEMENTED,
  CPM_SCHEDULING_IMPLEMENTED,
  DUPLICATE_ASSET_OWNERSHIP_INTRODUCED,
  DUPLICATE_PROJECT_OWNERSHIP_INTRODUCED,
  EARNED_VALUE_IMPLEMENTED,
  PRODUCTION_PROJECT_CONTROLS_READY,
  PROJECT_CONTROLS_IMPLEMENTED,
  PROJECT_CONTROLS_OWNERSHIP,
  PROJECT_IDENTITY_OWNERSHIP,
  RISK_CORE_AUTO_MUTATION_ALLOWED,
  SCHEDULE_EXECUTION_IMPLEMENTED,
} from "../version";

export type DomainOwner =
  | "engineering_core"
  | "engineering_os_shared_domain"
  | "project_intelligence"
  | "project_controls"
  | "asset_intelligence"
  | "inspection_intelligence"
  | "platform_commerce_finance"
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
    owner: "engineering_core",
    relation: "consumes",
    notes: "Locked: Engineering Core owns the project record; PC references projectId only",
  },
  {
    concern: "project_hierarchy_wbs_canonical",
    owner: "engineering_core",
    relation: "consumes",
    notes: "PC consumes WBS nodes; it does not define the canonical breakdown",
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
    notes: "PI owns meeting derivatives",
  },
  {
    concern: "cost_controls_intelligence",
    owner: "project_controls",
    relation: "owns",
    notes: "Future PC concern; no cost engine exists in 11A",
  },
  {
    concern: "schedule_controls_intelligence",
    owner: "project_controls",
    relation: "owns",
    notes: "Future PC concern; no CPM or schedule execution in 11A",
  },
  {
    concern: "progress_controls_intelligence",
    owner: "project_controls",
    relation: "owns",
    notes: "Future PC concern; no progress measurement in 11A",
  },
  {
    concern: "change_controls_intelligence",
    owner: "project_controls",
    relation: "owns",
    notes: "Future PC concern; no change control workflow in 11A",
  },
  {
    concern: "contingency_controls_intelligence",
    owner: "project_controls",
    relation: "owns",
    notes: "Future PC concern; no contingency drawdown in 11A",
  },
  {
    concern: "earned_value",
    owner: "project_controls",
    relation: "forbidden",
    notes: "RESERVED — reserved to PC by domain, forbidden to implement before 11B+",
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
    notes: "PC is a documented future consumer via II public contracts",
  },
  {
    concern: "canonical_risk_register",
    owner: "engineering_core",
    relation: "forbidden",
    notes: "PC may reference risks; auto-mutation of Core Risk is forbidden",
  },
  {
    concern: "financial_ledgers_billing",
    owner: "platform_commerce_finance",
    relation: "forbidden",
    notes: "Commerce/finance owns money movement; PC is not a ledger",
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
  canonicalProjectIdentityClaimedByProjectControls: false;
  canonicalAssetIdentityOwnership: typeof CANONICAL_ASSET_IDENTITY_OWNERSHIP;
  canonicalEngineeringRiskOwnership: typeof CANONICAL_ENGINEERING_RISK_OWNERSHIP;
  projectControlsImplemented: false;
  productionProjectControlsReady: false;
  duplicateAssetOwnershipIntroduced: false;
  duplicateProjectOwnershipIntroduced: false;
  canonicalLifecycleMutationAllowed: false;
  riskCoreAutoMutationAllowed: false;
} {
  if (PROJECT_CONTROLS_OWNERSHIP !== "project_controls") {
    throw new Error("project_controls_owner_mismatch");
  }
  if (PROJECT_IDENTITY_OWNERSHIP !== "engineering_core") {
    throw new Error("project_identity_must_be_engineering_core");
  }
  if (CANONICAL_PROJECT_IDENTITY_CLAIMED_BY_PROJECT_CONTROLS) {
    throw new Error("project_controls_may_not_claim_canonical_project_identity");
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
  if (PROJECT_CONTROLS_IMPLEMENTED || PRODUCTION_PROJECT_CONTROLS_READY) {
    throw new Error("project_controls_product_forbidden_in_phase_11a");
  }
  if (
    EARNED_VALUE_IMPLEMENTED ||
    CPM_SCHEDULING_IMPLEMENTED ||
    COST_ENGINE_IMPLEMENTED ||
    SCHEDULE_EXECUTION_IMPLEMENTED
  ) {
    throw new Error("project_controls_engines_forbidden_in_phase_11a");
  }
  if (DUPLICATE_ASSET_OWNERSHIP_INTRODUCED || DUPLICATE_PROJECT_OWNERSHIP_INTRODUCED) {
    throw new Error("duplicate_ownership");
  }
  if (CANONICAL_LIFECYCLE_MUTATION_ALLOWED) {
    throw new Error("canonical_lifecycle_mutation_forbidden");
  }
  if (RISK_CORE_AUTO_MUTATION_ALLOWED) {
    throw new Error("core_risk_auto_mutation_forbidden");
  }

  const identityRows = PROJECT_CONTROLS_OWNERSHIP_MATRIX.filter(
    (row) => row.concern === "project_identity_canonical",
  );
  if (identityRows.length !== 1 || identityRows[0].owner !== "engineering_core") {
    throw new Error("duplicate_or_wrong_project_identity_owner");
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
    canonicalProjectIdentityClaimedByProjectControls: false,
    canonicalAssetIdentityOwnership: CANONICAL_ASSET_IDENTITY_OWNERSHIP,
    canonicalEngineeringRiskOwnership: CANONICAL_ENGINEERING_RISK_OWNERSHIP,
    projectControlsImplemented: false,
    productionProjectControlsReady: false,
    duplicateAssetOwnershipIntroduced: false,
    duplicateProjectOwnershipIntroduced: false,
    canonicalLifecycleMutationAllowed: false,
    riskCoreAutoMutationAllowed: false,
  };
}
