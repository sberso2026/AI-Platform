/**
 * Phase 10K — Asset Intelligence V1.0 GA. Single authoritative version source.
 *
 * Everything that publishes an Asset Intelligence version (manifest, registries,
 * docs, certification, UI) reads from here. Nothing may hard-code a second one.
 */
export const ASSET_INTELLIGENCE_PRODUCT_NAME = "Asset Intelligence" as const;
export const ASSET_INTELLIGENCE_MODULE_KEY = "asset_intelligence" as const;
export const ASSET_INTELLIGENCE_VERSION = "1.0.0" as const;
export const ASSET_INTELLIGENCE_STATUS = "ga" as const;
export const ASSET_INTELLIGENCE_ROUTE_PREFIX = "/engineering/apps/asset-intelligence" as const;
export const ASSET_INTELLIGENCE_API_PREFIX = "/api/engineering/asset-intelligence" as const;
export const ASSET_INTELLIGENCE_RELEASE_TAG = "asset-intelligence-v1.0.0" as const;
export const ASSET_INTELLIGENCE_READINESS_MARKER = "asset-intelligence-v1-ready" as const;
export const ASSET_INTELLIGENCE_PUBLIC_CONTRACT_VERSION = "1.0.0" as const;
/** Version this GA release upgraded from — used by the upgrade certification gate. */
export const ASSET_INTELLIGENCE_PREVIOUS_VERSION = "0.10.0-predictive-governance" as const;

export const ASSET_IDENTITY_OWNERSHIP = "engineering_os_shared_domain" as const;
export const CANONICAL_ASSET_LIFECYCLE_OWNERSHIP = "engineering_os_shared_domain" as const;
export const ASSET_INTELLIGENCE_OWNERSHIP = "asset_intelligence" as const;
export const ASSET_LIFECYCLE_INTELLIGENCE_OWNERSHIP = "asset_intelligence" as const;
export const ASSET_RISK_SIGNAL_OWNERSHIP = "asset_intelligence" as const;
export const MAINTENANCE_RECOMMENDATION_INTELLIGENCE_OWNERSHIP = "asset_intelligence" as const;
export const ASSET_PRIORITY_CONTEXT_OWNERSHIP = "asset_intelligence" as const;
export const ASSET_FUSION_OWNERSHIP = "asset_intelligence" as const;
export const ASSET_PREDICTIVE_GOVERNANCE_OWNERSHIP = "asset_intelligence" as const;
export const CANONICAL_ENGINEERING_RISK_OWNERSHIP = "engineering_core" as const;
export const CMMS_WORK_ORDER_OWNERSHIP = "none_in_asset_intelligence" as const;

export const ASSET_INTELLIGENCE_IMPLEMENTED = true as const;
export const CORE_CONDITION_SLICE_READY = true as const;
export const CORE_CRITICALITY_SLICE_READY = true as const;
export const CORE_RELIABILITY_SLICE_READY = true as const;
export const FAILURE_TAXONOMY_REGISTRY_READY = true as const;
export const FAILURE_INTELLIGENCE_READY = true as const;
export const ENGINEERING_TIME_SERIES_READY = true as const;
export const CHANGE_DETECTION_ENGINE_READY = true as const;
export const TREND_CONFIDENCE_ENGINE_READY = true as const;
export const TREND_INTELLIGENCE_READY = true as const;
export const DEGRADATION_ANALYSIS_READY = true as const;
export const LIFECYCLE_CONTEXT_ENGINE_READY = true as const;
export const LIFECYCLE_TAXONOMY_REGISTRY_READY = true as const;
export const ASSET_DECISION_CONTEXT_ENGINE_READY = true as const;
export const RISK_SIGNAL_ENGINE_READY = true as const;
export const MAINTENANCE_RECOMMENDATION_ENGINE_READY = true as const;
export const MAINTENANCE_RECOMMENDATION_TAXONOMY_READY = true as const;
export const ASSET_PRIORITY_ENGINE_READY = true as const;
export const MULTI_SOURCE_FUSION_READY = true as const;
export const SOURCE_RECONCILIATION_ENGINE_READY = true as const;
export const PREDICTIVE_READINESS_ASSESSOR_READY = true as const;
export const PREDICTIVE_OBJECTIVE_REGISTRY_READY = true as const;
export const PREDICTIVE_METHOD_REGISTRY_READY = true as const;
export const PREDICTIVE_METHOD_ELIGIBILITY_ENGINE_READY = true as const;
export const PREDICTIVE_METHOD_QUALIFICATION_FRAMEWORK_READY = true as const;
export const PREDICTIVE_VALIDATION_METRIC_REGISTRY_READY = true as const;
export const HEALTH_COMPOSITION_ENGINE_READY = true as const;
export const EVIDENCE_CONFIDENCE_ENGINE_READY = true as const;

export const CRITICALITY_IS_HEALTH_FACTOR = false as const;
export const FAILURE_HEALTH_CONTRIBUTION_ENABLED = false as const;
export const DEGRADATION_HEALTH_CONTRIBUTION_ENABLED = false as const;
export const LIFECYCLE_HEALTH_CONTRIBUTION_ENABLED = false as const;
export const RISK_HEALTH_CONTRIBUTION_ENABLED = false as const;
export const PRIORITY_HEALTH_CONTRIBUTION_ENABLED = false as const;
export const FUSION_HEALTH_CONTRIBUTION_ENABLED = false as const;
export const PREDICTIVE_HEALTH_CONTRIBUTION_ENABLED = false as const;
export const RISK_CORE_AUTO_MUTATION_ALLOWED = false as const;
export const HOSTED_ASSET_INTELLIGENCE_PERSISTENCE_READY = true as const;
export const PRODUCTION_MEMORY_REPOSITORY_ALLOWED = false as const;
export const PRODUCTION_ASSET_INTELLIGENCE_READY = true as const;
export const DUPLICATE_ASSET_OWNERSHIP_DETECTED = false as const;
export const ACCURACY_CLAIMS_CERTIFIED = false as const;
export const RUL_CLAIMS_CERTIFIED = false as const;
export const PROBABILITY_OF_FAILURE_CERTIFIED = false as const;
export const QUANTITATIVE_RELIABILITY_CERTIFIED = false as const;
export const PREDICTIVE_ML_ENABLED = false as const;
export const PREDICTIVE_METHODS_CERTIFIED = false as const;
export const PRODUCTION_PREDICTIVE_EXECUTION_ENABLED = false as const;
export const NUMERIC_PRIORITY_SCORE_REQUIRED = false as const;
/** Reserved — not implemented in V1.0. */
export const SOURCE_TRUST_MODEL_READY = false as const;

/**
 * Phase 10K — V1.0 GA closure markers. These describe *release* state only;
 * they never widen a predictive, PoF, RUL or health-contribution lock.
 */
export const ASSET_INTELLIGENCE_V1_GA_CERTIFIED = true as const;
export const ASSET_INTELLIGENCE_V1_FROZEN = true as const;
export const ASSET_INTELLIGENCE_RELEASE_CLOSED = true as const;
export const ASSET_INTELLIGENCE_PUBLIC_CONTRACTS_PUBLISHED = true as const;
export const ASSET_INTELLIGENCE_CAPABILITY_REGISTRY_PUBLISHED = true as const;
export const ASSET_INTELLIGENCE_SERVICE_REGISTRY_PUBLISHED = true as const;
export const ASSET_INTELLIGENCE_EVENT_CONTRACTS_FROZEN = true as const;
export const ASSET_INTELLIGENCE_MODULE_MANIFEST_GENERATED = true as const;
export const ASSET_INTELLIGENCE_UNAVAILABLE_MATRIX_PUBLISHED = true as const;
export const ASSET_INTELLIGENCE_COMMERCIAL_PACKAGING_PUBLISHED = true as const;
export const ASSET_INTELLIGENCE_OPERATIONS_RUNBOOKS_PUBLISHED = true as const;
export const ASSET_INTELLIGENCE_BACKUP_RESTORE_CERTIFIED = true as const;
export const ASSET_INTELLIGENCE_UPGRADE_CERTIFIED = true as const;
export const ASSET_INTELLIGENCE_PERFORMANCE_BASELINE_PUBLISHED = true as const;
export const ASSET_INTELLIGENCE_MODULE_REGISTRY_DRIFT_DETECTED = false as const;

export const ASSET_INTELLIGENCE_V1_ENTITLEMENTS = [
  "asset_intelligence.read",
  "asset_intelligence.assess",
  "asset_intelligence.submit",
  "asset_intelligence.review",
  "asset_intelligence.approve",
  "asset_intelligence.publish",
  "asset_intelligence.admin",
] as const;

export const INSPECTION_INTELLIGENCE_V1_CONTRACTS_CONSUMED = "1.0.0" as const;
export const INSPECTION_INTELLIGENCE_V1_TAG = "inspection-intelligence-v1.0.0" as const;
export const PROJECT_INTELLIGENCE_V1_TAG = "project-intelligence-v1.0.0" as const;

export const PHASE_10A_CERTIFIED_COMMIT = "81d1cade909cf991a9dc91b9236310143f4b215f" as const;
export const PHASE_10B_CERTIFIED_COMMIT = "ef7268e6dd3873f8941885a87a2723130a6bb6bc" as const;
export const PHASE_10B1_CERTIFIED_COMMIT = "e72822434a38e66a409da3c8a291e68f006888c3" as const;
export const PHASE_10C_CERTIFIED_COMMIT = "10b0259134995f55bfe889dba2386edd653d9c2b" as const;
export const PHASE_10D_CERTIFIED_COMMIT = "ef6981e1c42f80cbb12337c21e6830eb22c3fdbf" as const;
export const PHASE_10E_CERTIFIED_COMMIT = "ed127cd85901f8053d09155f7c4053f0b22b8a5f" as const;
export const PHASE_10F_CERTIFIED_COMMIT = "94019ae995468ccddadc78a203e92e8460fe4bf0" as const;
export const PHASE_10F_ORIGINAL_CERTIFIED_COMMIT =
  "71a1dccec0ab67d668a3c10fbc4718cff22e1962" as const;
export const PHASE_10F_RECERTIFICATION_RUN = "31150273985" as const;
export const PHASE_10G_CERTIFIED_COMMIT = "f81d6ef1e322b49b823b04fc0464c5272c850e82" as const;
export const PHASE_10G_HOSTED_RUN = "31153833355" as const;
export const PHASE_10H_CERTIFIED_COMMIT = "acec6ce63f9e6eb6968d0f899a61cf442c35ec90" as const;
export const PHASE_10H_HOSTED_RUN = "31158369645" as const;
export const PHASE_10I_CERTIFIED_COMMIT = "27fed4e975f015ff01b60a41dd76ab06ea2886a9" as const;
export const PHASE_10I_HOSTED_RUN = "31163563401" as const;
/** Authoritative Phase 10J baseline this GA release closes over. */
export const PHASE_10J_CERTIFIED_COMMIT = "94ba3eccd5b42d9afbc96962bbf7572470485746" as const;
export const PHASE_10J_HOSTED_RUN = "31170793948" as const;

export function getAssetIntelligenceCoreDeclaration() {
  return {
    productName: ASSET_INTELLIGENCE_PRODUCT_NAME,
    moduleKey: ASSET_INTELLIGENCE_MODULE_KEY,
    version: ASSET_INTELLIGENCE_VERSION,
    status: ASSET_INTELLIGENCE_STATUS,
    routePrefix: ASSET_INTELLIGENCE_ROUTE_PREFIX,
    apiPrefix: ASSET_INTELLIGENCE_API_PREFIX,
    releaseTag: ASSET_INTELLIGENCE_RELEASE_TAG,
    readinessMarker: ASSET_INTELLIGENCE_READINESS_MARKER,
    publicContractVersion: ASSET_INTELLIGENCE_PUBLIC_CONTRACT_VERSION,
    previousVersion: ASSET_INTELLIGENCE_PREVIOUS_VERSION,
    assetIdentityOwnership: ASSET_IDENTITY_OWNERSHIP,
    canonicalAssetLifecycleOwnership: CANONICAL_ASSET_LIFECYCLE_OWNERSHIP,
    assetIntelligenceOwnership: ASSET_INTELLIGENCE_OWNERSHIP,
    assetLifecycleIntelligenceOwnership: ASSET_LIFECYCLE_INTELLIGENCE_OWNERSHIP,
    assetRiskSignalOwnership: ASSET_RISK_SIGNAL_OWNERSHIP,
    maintenanceRecommendationIntelligenceOwnership:
      MAINTENANCE_RECOMMENDATION_INTELLIGENCE_OWNERSHIP,
    assetPriorityContextOwnership: ASSET_PRIORITY_CONTEXT_OWNERSHIP,
    assetFusionOwnership: ASSET_FUSION_OWNERSHIP,
    assetPredictiveGovernanceOwnership: ASSET_PREDICTIVE_GOVERNANCE_OWNERSHIP,
    canonicalEngineeringRiskOwnership: CANONICAL_ENGINEERING_RISK_OWNERSHIP,
    cmmsWorkOrderOwnership: CMMS_WORK_ORDER_OWNERSHIP,
    riskCoreAutoMutationAllowed: RISK_CORE_AUTO_MUTATION_ALLOWED,
    assetIntelligenceImplemented: ASSET_INTELLIGENCE_IMPLEMENTED,
    coreConditionSliceReady: CORE_CONDITION_SLICE_READY,
    coreCriticalitySliceReady: CORE_CRITICALITY_SLICE_READY,
    coreReliabilitySliceReady: CORE_RELIABILITY_SLICE_READY,
    failureTaxonomyRegistryReady: FAILURE_TAXONOMY_REGISTRY_READY,
    failureIntelligenceReady: FAILURE_INTELLIGENCE_READY,
    engineeringTimeSeriesReady: ENGINEERING_TIME_SERIES_READY,
    changeDetectionEngineReady: CHANGE_DETECTION_ENGINE_READY,
    trendConfidenceEngineReady: TREND_CONFIDENCE_ENGINE_READY,
    trendIntelligenceReady: TREND_INTELLIGENCE_READY,
    degradationAnalysisReady: DEGRADATION_ANALYSIS_READY,
    lifecycleContextEngineReady: LIFECYCLE_CONTEXT_ENGINE_READY,
    lifecycleTaxonomyRegistryReady: LIFECYCLE_TAXONOMY_REGISTRY_READY,
    assetDecisionContextEngineReady: ASSET_DECISION_CONTEXT_ENGINE_READY,
    riskSignalEngineReady: RISK_SIGNAL_ENGINE_READY,
    maintenanceRecommendationEngineReady: MAINTENANCE_RECOMMENDATION_ENGINE_READY,
    maintenanceRecommendationTaxonomyReady: MAINTENANCE_RECOMMENDATION_TAXONOMY_READY,
    assetPriorityEngineReady: ASSET_PRIORITY_ENGINE_READY,
    multiSourceFusionReady: MULTI_SOURCE_FUSION_READY,
    sourceReconciliationEngineReady: SOURCE_RECONCILIATION_ENGINE_READY,
    predictiveReadinessAssessorReady: PREDICTIVE_READINESS_ASSESSOR_READY,
    predictiveObjectiveRegistryReady: PREDICTIVE_OBJECTIVE_REGISTRY_READY,
    predictiveMethodRegistryReady: PREDICTIVE_METHOD_REGISTRY_READY,
    predictiveMethodEligibilityEngineReady: PREDICTIVE_METHOD_ELIGIBILITY_ENGINE_READY,
    predictiveMethodQualificationFrameworkReady:
      PREDICTIVE_METHOD_QUALIFICATION_FRAMEWORK_READY,
    predictiveValidationMetricRegistryReady: PREDICTIVE_VALIDATION_METRIC_REGISTRY_READY,
    healthCompositionEngineReady: HEALTH_COMPOSITION_ENGINE_READY,
    evidenceConfidenceEngineReady: EVIDENCE_CONFIDENCE_ENGINE_READY,
    criticalityIsHealthFactor: CRITICALITY_IS_HEALTH_FACTOR,
    failureHealthContributionEnabled: FAILURE_HEALTH_CONTRIBUTION_ENABLED,
    degradationHealthContributionEnabled: DEGRADATION_HEALTH_CONTRIBUTION_ENABLED,
    lifecycleHealthContributionEnabled: LIFECYCLE_HEALTH_CONTRIBUTION_ENABLED,
    riskHealthContributionEnabled: RISK_HEALTH_CONTRIBUTION_ENABLED,
    priorityHealthContributionEnabled: PRIORITY_HEALTH_CONTRIBUTION_ENABLED,
    fusionHealthContributionEnabled: FUSION_HEALTH_CONTRIBUTION_ENABLED,
    predictiveHealthContributionEnabled: PREDICTIVE_HEALTH_CONTRIBUTION_ENABLED,
    hostedAssetIntelligencePersistenceReady: HOSTED_ASSET_INTELLIGENCE_PERSISTENCE_READY,
    productionMemoryRepositoryAllowed: PRODUCTION_MEMORY_REPOSITORY_ALLOWED,
    productionAssetIntelligenceReady: PRODUCTION_ASSET_INTELLIGENCE_READY,
    duplicateAssetOwnershipDetected: DUPLICATE_ASSET_OWNERSHIP_DETECTED,
    accuracyClaimsCertified: ACCURACY_CLAIMS_CERTIFIED,
    rulClaimsCertified: RUL_CLAIMS_CERTIFIED,
    probabilityOfFailureCertified: PROBABILITY_OF_FAILURE_CERTIFIED,
    quantitativeReliabilityCertified: QUANTITATIVE_RELIABILITY_CERTIFIED,
    predictiveMlEnabled: PREDICTIVE_ML_ENABLED,
    predictiveMethodsCertified: PREDICTIVE_METHODS_CERTIFIED,
    productionPredictiveExecutionEnabled: PRODUCTION_PREDICTIVE_EXECUTION_ENABLED,
    sourceTrustModelReady: SOURCE_TRUST_MODEL_READY,
    numericPriorityScoreRequired: NUMERIC_PRIORITY_SCORE_REQUIRED,
    assetIntelligenceV1GaCertified: ASSET_INTELLIGENCE_V1_GA_CERTIFIED,
    assetIntelligenceV1Frozen: ASSET_INTELLIGENCE_V1_FROZEN,
    assetIntelligenceReleaseClosed: ASSET_INTELLIGENCE_RELEASE_CLOSED,
    publicModuleContractsPublished: ASSET_INTELLIGENCE_PUBLIC_CONTRACTS_PUBLISHED,
    capabilityRegistryPublished: ASSET_INTELLIGENCE_CAPABILITY_REGISTRY_PUBLISHED,
    serviceRegistryPublished: ASSET_INTELLIGENCE_SERVICE_REGISTRY_PUBLISHED,
    eventContractsFrozen: ASSET_INTELLIGENCE_EVENT_CONTRACTS_FROZEN,
    moduleManifestGenerated: ASSET_INTELLIGENCE_MODULE_MANIFEST_GENERATED,
    unavailableCapabilityMatrixPublished: ASSET_INTELLIGENCE_UNAVAILABLE_MATRIX_PUBLISHED,
    commercialPackagingPublished: ASSET_INTELLIGENCE_COMMERCIAL_PACKAGING_PUBLISHED,
    operationsRunbooksPublished: ASSET_INTELLIGENCE_OPERATIONS_RUNBOOKS_PUBLISHED,
    backupRestoreCertified: ASSET_INTELLIGENCE_BACKUP_RESTORE_CERTIFIED,
    upgradeCertified: ASSET_INTELLIGENCE_UPGRADE_CERTIFIED,
    performanceBaselinePublished: ASSET_INTELLIGENCE_PERFORMANCE_BASELINE_PUBLISHED,
    moduleRegistryDriftDetected: ASSET_INTELLIGENCE_MODULE_REGISTRY_DRIFT_DETECTED,
    entitlements: ASSET_INTELLIGENCE_V1_ENTITLEMENTS,
    inspectionIntelligenceContractsConsumed: INSPECTION_INTELLIGENCE_V1_CONTRACTS_CONSUMED,
    hierarchy:
      "RTB AI Platform → Engineering OS → Shared Asset Domain (canonical identity) → Asset Intelligence (intelligence about assets)" as const,
  };
}

export function getAssetIntelligenceDiscoveryDeclaration() {
  return {
    ...getAssetIntelligenceCoreDeclaration(),
    status: ASSET_INTELLIGENCE_STATUS,
  };
}

/** V1.0 GA declaration — same authoritative source, named for release consumers. */
export function getAssetIntelligenceGaDeclaration() {
  return getAssetIntelligenceCoreDeclaration();
}
