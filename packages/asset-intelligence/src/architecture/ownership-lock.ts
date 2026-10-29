/**
 * Phase 10A — ownership lock constants and assertions.
 */

import {
  ASSET_IDENTITY_OWNERSHIP,
  ASSET_INTELLIGENCE_OWNERSHIP,
  ASSET_INTELLIGENCE_IMPLEMENTED,
  ASSET_INTELLIGENCE_V1_GA_CERTIFIED,
  DUPLICATE_ASSET_OWNERSHIP_DETECTED,
  PRODUCTION_ASSET_INTELLIGENCE_READY,
  ACCURACY_CLAIMS_CERTIFIED,
  RUL_CLAIMS_CERTIFIED,
  PREDICTIVE_ML_ENABLED,
  PREDICTIVE_METHODS_CERTIFIED,
  PRODUCTION_PREDICTIVE_EXECUTION_ENABLED,
  PROBABILITY_OF_FAILURE_CERTIFIED,
  PREDICTIVE_HEALTH_CONTRIBUTION_ENABLED,
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
  { concern: "multi_source_fusion", owner: "asset_intelligence", notes: "published-slice fusion; not a Health factor" },
  { concern: "source_reconciliation", owner: "asset_intelligence", notes: "conflict records; autonomous resolution forbidden" },
  { concern: "predictive_readiness", owner: "asset_intelligence", notes: "readiness only; predictive ML not enabled" },
  { concern: "predictive_objective_registry", owner: "asset_intelligence", notes: "reserved objectives; none certified" },
  { concern: "predictive_method_registry", owner: "asset_intelligence", notes: "documented methodologies; no method certified" },
  { concern: "predictive_method_eligibility", owner: "asset_intelligence", notes: "candidacy judgement; never a predicted value" },
  { concern: "predictive_method_qualification", owner: "asset_intelligence", notes: "fixture-bounded acceptability; not certification" },
  { concern: "predictive_validation_metrics", owner: "asset_intelligence", notes: "measurement definitions; imply no certified claim" },
  { concern: "predictive_governance", owner: "asset_intelligence", notes: "predictive_execution_forbidden_in_phase_10j" },
  { concern: "project_knowledge", owner: "project_intelligence", notes: "PI owns knowledge derivatives" },
] as const;

export function assertOwnershipLock(): {
  ok: true;
  assetIdentityOwnership: typeof ASSET_IDENTITY_OWNERSHIP;
  assetIntelligenceOwnership: typeof ASSET_INTELLIGENCE_OWNERSHIP;
  duplicateAssetOwnershipDetected: false;
  productionAssetIntelligenceReady: typeof PRODUCTION_ASSET_INTELLIGENCE_READY;
  assetIntelligenceV1GaCertified: typeof ASSET_INTELLIGENCE_V1_GA_CERTIFIED;
  assetIntelligenceImplemented: typeof ASSET_INTELLIGENCE_IMPLEMENTED;
  accuracyClaimsCertified: false;
  rulClaimsCertified: false;
  predictiveMlEnabled: false;
  predictiveMethodsCertified: false;
  productionPredictiveExecutionEnabled: false;
  probabilityOfFailureCertified: false;
  predictiveHealthContributionEnabled: false;
} {
  if (ASSET_IDENTITY_OWNERSHIP !== "engineering_os_shared_domain") {
    throw new Error("identity_must_be_shared_domain");
  }
  if (ASSET_INTELLIGENCE_OWNERSHIP !== "asset_intelligence") {
    throw new Error("intelligence_owner_mismatch");
  }
  if (DUPLICATE_ASSET_OWNERSHIP_DETECTED) throw new Error("duplicate_ownership");
  // Phase 10K is the explicit GA phase: production readiness is only legitimate once
  // the V1.0 contract freeze has been certified.
  if (PRODUCTION_ASSET_INTELLIGENCE_READY && !ASSET_INTELLIGENCE_V1_GA_CERTIFIED) {
    throw new Error("full_module_ga_forbidden_until_explicit_phase");
  }
  if (ACCURACY_CLAIMS_CERTIFIED || RUL_CLAIMS_CERTIFIED) {
    throw new Error("unsupported_claims_forbidden");
  }
  if (PREDICTIVE_ML_ENABLED || PREDICTIVE_METHODS_CERTIFIED) {
    throw new Error("predictive_execution_forbidden_in_phase_10i");
  }
  if (PRODUCTION_PREDICTIVE_EXECUTION_ENABLED || PROBABILITY_OF_FAILURE_CERTIFIED) {
    throw new Error("predictive_execution_forbidden_in_phase_10j");
  }
  if (PREDICTIVE_HEALTH_CONTRIBUTION_ENABLED) {
    throw new Error("predictive_governance_is_not_a_health_factor");
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
    productionAssetIntelligenceReady: PRODUCTION_ASSET_INTELLIGENCE_READY,
    assetIntelligenceV1GaCertified: ASSET_INTELLIGENCE_V1_GA_CERTIFIED,
    assetIntelligenceImplemented: ASSET_INTELLIGENCE_IMPLEMENTED,
    accuracyClaimsCertified: false,
    rulClaimsCertified: false,
    predictiveMlEnabled: false,
    predictiveMethodsCertified: false,
    productionPredictiveExecutionEnabled: false,
    probabilityOfFailureCertified: false,
    predictiveHealthContributionEnabled: false,
  };
}
