/**
 * Phase 9K — cross-module consumer contract fixtures (consume-only).
 * Asset Intelligence, Digital Twin, Project Controls are NOT implemented here.
 */

export const CONSUMER_CONTRACT_VERSION = "1.0.0" as const;

export type CrossModuleConsumerFixture = {
  consumerModule: "asset_intelligence" | "digital_twin" | "project_controls";
  contractIds: readonly string[];
  ownership: "none";
  accessMode: "public_contracts_only";
  directDatabaseAccess: false;
  internalRepositoryImports: false;
  privateSchemaKnowledge: false;
  moduleImplemented: false;
  consumes: readonly string[];
  forbids: readonly string[];
};

export const ASSET_INTELLIGENCE_CONSUMER_FIXTURE: CrossModuleConsumerFixture = {
  consumerModule: "asset_intelligence",
  contractIds: ["ii.asset.reference", "ii.observation.feed", "ii.query.session.read"],
  ownership: "none",
  accessMode: "public_contracts_only",
  directDatabaseAccess: false,
  internalRepositoryImports: false,
  privateSchemaKnowledge: false,
  moduleImplemented: false,
  consumes: [
    "AssetReference",
    "inspection_observations",
    "condition_rating",
    "inspection_completion",
    "defect_summary",
    "recommendation_summary",
  ],
  forbids: ["asset_registry", "asset_health_ownership", "lifecycle_ownership", "ii_internal_repos"],
};

export const DIGITAL_TWIN_CONSUMER_FIXTURE: CrossModuleConsumerFixture = {
  consumerModule: "digital_twin",
  contractIds: ["ii.observation.feed", "ii.event.inspection", "ii.asset.reference"],
  ownership: "none",
  accessMode: "public_contracts_only",
  directDatabaseAccess: false,
  internalRepositoryImports: false,
  privateSchemaKnowledge: false,
  moduleImplemented: false,
  consumes: [
    "inspection_observation_feed",
    "timeline_event",
    "evidence_reference",
    "condition_event",
    "spatial_target_reference",
  ],
  forbids: ["twin_model", "twin_runtime", "geometry_ownership", "ii_internal_repos"],
};

export const PROJECT_CONTROLS_CONSUMER_FIXTURE: CrossModuleConsumerFixture = {
  consumerModule: "project_controls",
  contractIds: ["ii.event.inspection", "ii.query.session.read", "ii.reporting.preparation"],
  ownership: "none",
  accessMode: "public_contracts_only",
  directDatabaseAccess: false,
  internalRepositoryImports: false,
  privateSchemaKnowledge: false,
  moduleImplemented: false,
  consumes: [
    "corrective_action_status",
    "inspection_schedule_signal",
    "overdue_inspection_signal",
    "risk_recommendation_reference",
  ],
  forbids: ["project_controls_ownership_via_ii", "ii_internal_repos", "private_schema"],
};

/** @deprecated Prefer ASSET_INTELLIGENCE_CONSUMER_FIXTURE — retained for 9J compatibility. */
export const ASSET_REFERENCE_CONSUMER_ADAPTER = {
  contractId: "ii.consumer.asset_reference" as const,
  version: CONSUMER_CONTRACT_VERSION,
  ownership: "none" as const,
  direction: "inspection_to_consumer" as const,
  exposes: ["inspectionTargetId", "assetReferenceId", "observedAt", "sessionId"] as const,
  forbids: ["asset_registry", "asset_health_ownership", "lifecycle_ownership"] as const,
};

/** @deprecated Prefer DIGITAL_TWIN_CONSUMER_FIXTURE. */
export const DIGITAL_TWIN_OBSERVATION_FEED_ADAPTER = {
  contractId: "ii.consumer.digital_twin_observation_feed" as const,
  version: CONSUMER_CONTRACT_VERSION,
  ownership: "none" as const,
  direction: "inspection_to_consumer" as const,
  exposes: [
    "observationId",
    "evidenceDerivativeId",
    "conditionRatingId",
    "validatedVisionAnalysisId",
    "publishedAt",
  ] as const,
  forbids: ["twin_model", "twin_runtime", "geometry_ownership"] as const,
};

export function assertConsumerContractsNonOwning(): {
  ok: true;
  assetIntelligenceOwnership: false;
  digitalTwinOwnership: false;
  crossModuleConsumerContractsCertified: true;
} {
  const fixtures = [
    ASSET_INTELLIGENCE_CONSUMER_FIXTURE,
    DIGITAL_TWIN_CONSUMER_FIXTURE,
    PROJECT_CONTROLS_CONSUMER_FIXTURE,
  ];
  for (const f of fixtures) {
    if (f.ownership !== "none") throw new Error(`consumer_ownership:${f.consumerModule}`);
    if (f.moduleImplemented) throw new Error(`consumer_implemented:${f.consumerModule}`);
    if (f.directDatabaseAccess || f.internalRepositoryImports || f.privateSchemaKnowledge) {
      throw new Error(`consumer_coupling:${f.consumerModule}`);
    }
    if (f.accessMode !== "public_contracts_only") {
      throw new Error(`consumer_access_mode:${f.consumerModule}`);
    }
  }
  return {
    ok: true,
    assetIntelligenceOwnership: false,
    digitalTwinOwnership: false,
    crossModuleConsumerContractsCertified: true,
  };
}

export function listCrossModuleConsumerFixtures(): readonly CrossModuleConsumerFixture[] {
  return [
    ASSET_INTELLIGENCE_CONSUMER_FIXTURE,
    DIGITAL_TWIN_CONSUMER_FIXTURE,
    PROJECT_CONTROLS_CONSUMER_FIXTURE,
  ];
}
