/**
 * Phase 10A — ownership lock constants and assertions.
 */

import {
  ASSET_IDENTITY_OWNERSHIP,
  ASSET_INTELLIGENCE_OWNERSHIP,
  ASSET_INTELLIGENCE_IMPLEMENTED,
  DUPLICATE_ASSET_OWNERSHIP_DETECTED,
  PRODUCTION_ASSET_INTELLIGENCE_READY,
  ACCURACY_CLAIMS_CERTIFIED,
  RUL_CLAIMS_CERTIFIED,
} from "../version";

export type DomainOwner =
  | "engineering_os_shared_domain"
  | "asset_intelligence"
  | "inspection_intelligence"
  | "project_intelligence"
  | "project_controls"
  | "digital_twin"
  | "shm"
  | "future_maintenance_cmms"
  | "external_system";

export type OwnershipRow = {
  concern: string;
  owner: DomainOwner;
  notes: string;
};

export const ASSET_OWNERSHIP_MATRIX: readonly OwnershipRow[] = [
  { concern: "asset_identity", owner: "engineering_os_shared_domain", notes: "assetId and register" },
  { concern: "asset_hierarchy_refs", owner: "engineering_os_shared_domain", notes: "parent/child refs" },
  { concern: "asset_class_type", owner: "engineering_os_shared_domain", notes: "canonical taxonomy ids" },
  { concern: "equipment_identity", owner: "engineering_os_shared_domain", notes: "shared domain" },
  { concern: "component_identity", owner: "engineering_os_shared_domain", notes: "shared domain" },
  { concern: "systems_membership", owner: "engineering_os_shared_domain", notes: "shared domain" },
  { concern: "locations_functional", owner: "engineering_os_shared_domain", notes: "shared domain" },
  { concern: "documents_refs", owner: "engineering_os_shared_domain", notes: "doc refs to assets" },
  { concern: "inspection_history", owner: "inspection_intelligence", notes: "II owns inspection records" },
  { concern: "condition_intelligence", owner: "asset_intelligence", notes: "AI owns derived condition intelligence" },
  { concern: "health_index", owner: "asset_intelligence", notes: "future AI" },
  { concern: "criticality_assessments", owner: "asset_intelligence", notes: "future AI" },
  { concern: "reliability_intelligence", owner: "asset_intelligence", notes: "future AI" },
  { concern: "asset_risk_analytics", owner: "asset_intelligence", notes: "signals only; Core owns register" },
  { concern: "canonical_risk_register", owner: "engineering_os_shared_domain", notes: "Engineering Core" },
  { concern: "failure_intelligence", owner: "asset_intelligence", notes: "future AI" },
  { concern: "degradation_intelligence", owner: "asset_intelligence", notes: "future AI" },
  { concern: "predictive_signals", owner: "asset_intelligence", notes: "advisory" },
  { concern: "rul_estimate", owner: "asset_intelligence", notes: "advisory; not certified" },
  { concern: "sensor_streams", owner: "shm", notes: "SHM / external" },
  { concern: "twin_state", owner: "digital_twin", notes: "future twin module" },
  { concern: "simulation_state", owner: "digital_twin", notes: "future twin module" },
  { concern: "work_orders", owner: "future_maintenance_cmms", notes: "not AI ownership" },
  { concern: "cost_schedule", owner: "project_controls", notes: "future PC" },
  { concern: "lifecycle_identity", owner: "engineering_os_shared_domain", notes: "canonical stage identity" },
  { concern: "lifecycle_intelligence", owner: "asset_intelligence", notes: "analytics/recommendations" },
  { concern: "decision_context", owner: "asset_intelligence", notes: "published-slice context; no autonomous authority" },
  { concern: "risk_signal_intelligence", owner: "asset_intelligence", notes: "advisory signals; Core owns canonical risk" },
  { concern: "risk_candidate_handoff", owner: "asset_intelligence", notes: "human-gated Core adapter only" },
  { concern: "maintenance_recommendation_intelligence", owner: "asset_intelligence", notes: "advisory; not CMMS work orders" },
  { concern: "asset_priority_context", owner: "asset_intelligence", notes: "dimensional attention; not a Health factor" },
  { concern: "project_knowledge", owner: "project_intelligence", notes: "PI owns knowledge derivatives" },
] as const;

export function assertOwnershipLock(): {
  ok: true;
  assetIdentityOwnership: typeof ASSET_IDENTITY_OWNERSHIP;
  assetIntelligenceOwnership: typeof ASSET_INTELLIGENCE_OWNERSHIP;
  duplicateAssetOwnershipDetected: false;
  productionAssetIntelligenceReady: false;
  assetIntelligenceImplemented: typeof ASSET_INTELLIGENCE_IMPLEMENTED;
  accuracyClaimsCertified: false;
  rulClaimsCertified: false;
} {
  if (ASSET_IDENTITY_OWNERSHIP !== "engineering_os_shared_domain") {
    throw new Error("identity_must_be_shared_domain");
  }
  if (ASSET_INTELLIGENCE_OWNERSHIP !== "asset_intelligence") {
    throw new Error("intelligence_owner_mismatch");
  }
  if (DUPLICATE_ASSET_OWNERSHIP_DETECTED) throw new Error("duplicate_ownership");
  if (PRODUCTION_ASSET_INTELLIGENCE_READY) {
    throw new Error("full_module_ga_forbidden_until_explicit_phase");
  }
  if (ACCURACY_CLAIMS_CERTIFIED || RUL_CLAIMS_CERTIFIED) {
    throw new Error("unsupported_claims_forbidden");
  }
  const identityOwners = ASSET_OWNERSHIP_MATRIX.filter((r) => r.concern === "asset_identity");
  if (identityOwners.some((r) => r.owner !== "engineering_os_shared_domain")) {
    throw new Error("duplicate_or_wrong_identity_owner");
  }
  return {
    ok: true,
    assetIdentityOwnership: ASSET_IDENTITY_OWNERSHIP,
    assetIntelligenceOwnership: ASSET_INTELLIGENCE_OWNERSHIP,
    duplicateAssetOwnershipDetected: false,
    productionAssetIntelligenceReady: false,
    assetIntelligenceImplemented: ASSET_INTELLIGENCE_IMPLEMENTED,
    accuracyClaimsCertified: false,
    rulClaimsCertified: false,
  };
}
