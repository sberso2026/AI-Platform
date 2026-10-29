/**
 * Phase 11B — Engineering Shared Project Domain. Single authoritative version source.
 *
 * This package is the *identity layer* for projects and the project hierarchy.
 * It owns canonical project identity; it owns no intelligence, no controls, no
 * measurement and no forecasting. Modules that reason ABOUT projects (Project
 * Intelligence, Project Controls, Asset Intelligence, Inspection Intelligence)
 * consume the reference types published here and never mutate identity.
 *
 * `engineering_projects` remains the physical store. This package is the logical
 * owner and the only sanctioned read path for project identity.
 */
export const ENGINEERING_SHARED_PROJECT_DOMAIN_NAME =
  "Engineering Shared Project Domain" as const;
export const ENGINEERING_SHARED_PROJECT_DOMAIN_KEY =
  "engineering_os_shared_project_domain" as const;
export const ENGINEERING_SHARED_PROJECT_DOMAIN_VERSION =
  "0.1.0-shared-project-domain" as const;
export const ENGINEERING_SHARED_PROJECT_DOMAIN_STATUS = "foundation" as const;
export const ENGINEERING_SHARED_PROJECT_DOMAIN_PHASE = "11B" as const;

export const SHARED_PROJECT_DOMAIN_READY = true as const;

// ---------------------------------------------------------------------------
// Ownership locks
// ---------------------------------------------------------------------------

/**
 * LOCKED DECISION (Phase 11B): canonical project identity is owned by the
 * Engineering Shared Project Domain — the same layer that owns canonical asset
 * identity (`engineering_os_shared_domain`). Phase 11A recorded the owner as
 * `engineering_core` and deferred the spelling unification to Phase 11B; this
 * constant is that unification.
 */
export const CANONICAL_PROJECT_IDENTITY_OWNERSHIP =
  "engineering_os_shared_project_domain" as const;
export const CANONICAL_PROJECT_HIERARCHY_OWNERSHIP =
  "engineering_os_shared_project_domain" as const;
export const CANONICAL_ASSET_IDENTITY_OWNERSHIP = "engineering_os_shared_domain" as const;
export const CANONICAL_ENGINEERING_RISK_OWNERSHIP = "engineering_core" as const;

/** The pre-existing physical table. Phase 11B does not replace or fork it. */
export const CANONICAL_PROJECT_IDENTITY_PHYSICAL_STORE = "engineering_projects" as const;
export const CANONICAL_PROJECT_IDENTITY_PHYSICAL_STORE_INTRODUCED_BY = "batch_20" as const;

/** Reference tables added additively in Phase 11B for the project hierarchy. */
export const SHARED_PROJECT_DOMAIN_REFERENCE_TABLES = [
  "engineering_projects",
  "engineering_project_phases",
  "engineering_wbs_nodes",
  "engineering_work_packages",
  "engineering_activities",
  "engineering_milestones",
] as const;

export const SHARED_PROJECT_DOMAIN_MIGRATION =
  "supabase/migrations/20260808010000_batch_61_shared_project_domain_references.sql" as const;

// ---------------------------------------------------------------------------
// Forbidden-in-identity-layer locks
// ---------------------------------------------------------------------------

/** Consumers resolve references. They never write identity through this port. */
export const PROJECT_IDENTITY_MUTATION_BY_CONSUMERS_ALLOWED = false as const;
export const PROJECT_CONTROLS_MAY_OWN_PROJECT_IDENTITY = false as const;
export const PROJECT_INTELLIGENCE_MAY_OWN_PROJECT_IDENTITY = false as const;
export const DUPLICATE_PROJECT_OWNERSHIP_DETECTED = false as const;

/** The identity layer holds no intelligence of any kind. */
export const PROGRESS_MEASUREMENT_IN_SHARED_DOMAIN = false as const;
export const EARNED_VALUE_IN_SHARED_DOMAIN = false as const;
export const CPM_IN_SHARED_DOMAIN = false as const;
export const COST_IN_SHARED_DOMAIN = false as const;
export const FORECASTING_IN_SHARED_DOMAIN = false as const;

export const PRODUCTION_MEMORY_REPOSITORY_ALLOWED = false as const;

/** Modules permitted to consume project references (read-only). */
export const SANCTIONED_PROJECT_REFERENCE_CONSUMERS = [
  "project_intelligence",
  "project_controls",
  "asset_intelligence",
  "inspection_intelligence",
  "engineering_core",
] as const;

export type SanctionedProjectReferenceConsumer =
  (typeof SANCTIONED_PROJECT_REFERENCE_CONSUMERS)[number];

export function getSharedProjectDomainDeclaration() {
  return {
    name: ENGINEERING_SHARED_PROJECT_DOMAIN_NAME,
    key: ENGINEERING_SHARED_PROJECT_DOMAIN_KEY,
    version: ENGINEERING_SHARED_PROJECT_DOMAIN_VERSION,
    status: ENGINEERING_SHARED_PROJECT_DOMAIN_STATUS,
    phase: ENGINEERING_SHARED_PROJECT_DOMAIN_PHASE,
    sharedProjectDomainReady: SHARED_PROJECT_DOMAIN_READY,
    canonicalProjectIdentityOwnership: CANONICAL_PROJECT_IDENTITY_OWNERSHIP,
    canonicalProjectHierarchyOwnership: CANONICAL_PROJECT_HIERARCHY_OWNERSHIP,
    canonicalAssetIdentityOwnership: CANONICAL_ASSET_IDENTITY_OWNERSHIP,
    canonicalEngineeringRiskOwnership: CANONICAL_ENGINEERING_RISK_OWNERSHIP,
    canonicalProjectIdentityPhysicalStore: CANONICAL_PROJECT_IDENTITY_PHYSICAL_STORE,
    referenceTables: SHARED_PROJECT_DOMAIN_REFERENCE_TABLES,
    projectIdentityMutationByConsumersAllowed:
      PROJECT_IDENTITY_MUTATION_BY_CONSUMERS_ALLOWED,
    projectControlsMayOwnProjectIdentity: PROJECT_CONTROLS_MAY_OWN_PROJECT_IDENTITY,
    duplicateProjectOwnershipDetected: DUPLICATE_PROJECT_OWNERSHIP_DETECTED,
    progressMeasurementInSharedDomain: PROGRESS_MEASUREMENT_IN_SHARED_DOMAIN,
    earnedValueInSharedDomain: EARNED_VALUE_IN_SHARED_DOMAIN,
    cpmInSharedDomain: CPM_IN_SHARED_DOMAIN,
    sanctionedConsumers: SANCTIONED_PROJECT_REFERENCE_CONSUMERS,
    hierarchy:
      "RTB AI Platform → Engineering OS → Engineering Shared Project Domain (canonical project identity) → consuming intelligence modules" as const,
  };
}

/** Fails a test rather than a review when an ownership lock is broken. */
export function assertSharedProjectDomainOwnershipLock(): {
  ok: true;
  canonicalProjectIdentityOwnership: typeof CANONICAL_PROJECT_IDENTITY_OWNERSHIP;
  canonicalProjectHierarchyOwnership: typeof CANONICAL_PROJECT_HIERARCHY_OWNERSHIP;
  projectIdentityMutationByConsumersAllowed: false;
  duplicateProjectOwnershipDetected: false;
} {
  if (CANONICAL_PROJECT_IDENTITY_OWNERSHIP !== "engineering_os_shared_project_domain") {
    throw new Error("project_identity_must_be_shared_project_domain");
  }
  if (CANONICAL_PROJECT_HIERARCHY_OWNERSHIP !== "engineering_os_shared_project_domain") {
    throw new Error("project_hierarchy_must_be_shared_project_domain");
  }
  if (CANONICAL_ASSET_IDENTITY_OWNERSHIP !== "engineering_os_shared_domain") {
    throw new Error("asset_identity_must_be_shared_domain");
  }
  if (PROJECT_IDENTITY_MUTATION_BY_CONSUMERS_ALLOWED) {
    throw new Error("consumer_identity_mutation_forbidden");
  }
  if (PROJECT_CONTROLS_MAY_OWN_PROJECT_IDENTITY || PROJECT_INTELLIGENCE_MAY_OWN_PROJECT_IDENTITY) {
    throw new Error("consumer_may_not_own_project_identity");
  }
  if (DUPLICATE_PROJECT_OWNERSHIP_DETECTED) {
    throw new Error("duplicate_project_ownership");
  }
  if (
    PROGRESS_MEASUREMENT_IN_SHARED_DOMAIN ||
    EARNED_VALUE_IN_SHARED_DOMAIN ||
    CPM_IN_SHARED_DOMAIN ||
    COST_IN_SHARED_DOMAIN ||
    FORECASTING_IN_SHARED_DOMAIN
  ) {
    throw new Error("intelligence_forbidden_in_identity_layer");
  }
  return {
    ok: true,
    canonicalProjectIdentityOwnership: CANONICAL_PROJECT_IDENTITY_OWNERSHIP,
    canonicalProjectHierarchyOwnership: CANONICAL_PROJECT_HIERARCHY_OWNERSHIP,
    projectIdentityMutationByConsumersAllowed: false,
    duplicateProjectOwnershipDetected: false,
  };
}
