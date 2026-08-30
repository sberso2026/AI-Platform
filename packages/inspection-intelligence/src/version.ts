/**
 * Inspection Intelligence identity.
 * Historical Phase 9K V1 GA is immutable. Next-gen current release stays unreleased
 * until ADR_APPLICATION_RELEASE_IDENTITY justifies a new version/tag.
 */
export const INSPECTION_INTELLIGENCE_PRODUCT_NAME = "Inspection Intelligence" as const;
export const INSPECTION_INTELLIGENCE_MODULE_KEY = "inspection_intelligence" as const;
export const INSPECTION_INTELLIGENCE_PRODUCT_SLUG = "inspection-intelligence" as const;

/** Historical Phase 9K Product GA. Do not treat as a movable current tag. */
export const INSPECTION_INTELLIGENCE_V1_CERTIFICATION_VERSION = "1.0.0" as const;
export const INSPECTION_INTELLIGENCE_V1_CERTIFICATION_TAG = "inspection-intelligence-v1.0.0" as const;
export const INSPECTION_INTELLIGENCE_V1_CERTIFIED_COMMIT =
  "d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09" as const;

/**
 * Declared product version remains the last GA until a later semver is justified.
 * Next-gen work must not invent an ad hoc GA tag here.
 */
export const INSPECTION_INTELLIGENCE_VERSION = "1.0.0" as const;
export const INSPECTION_INTELLIGENCE_ROUTE_PREFIX =
  "/engineering/apps/inspection-intelligence" as const;
export const INSPECTION_INTELLIGENCE_RELEASE_TAG = "inspection-intelligence-v1.0.0" as const;
export const INSPECTION_INTELLIGENCE_NEXT_GEN_RELEASE_STATUS = "unreleased" as const;
export const INSPECTION_INTELLIGENCE_NEXT_GA_VERSION = null;
export const INSPECTION_INTELLIGENCE_II_0_IMPLEMENTED = true as const;
/** II-1 hosted persistence of existing inspection_* tables. */
export const INSPECTION_INTELLIGENCE_II_1_IMPLEMENTED = true as const;
export const INSPECTION_INTELLIGENCE_II_1_READY = true as const;
export const INSPECTION_INTELLIGENCE_II_2_READY = true as const;
export const INSPECTION_INTELLIGENCE_II_2_IMPLEMENTED = true as const;
export const INSPECTION_INTELLIGENCE_II_3_READY = true as const;
export const INSPECTION_INTELLIGENCE_II_3_IMPLEMENTED = true as const;
export const INSPECTION_INTELLIGENCE_II_4_READY = true as const;
export const INSPECTION_INTELLIGENCE_II_4_IMPLEMENTED = true as const;
export const INSPECTION_INTELLIGENCE_II_5_READY = true as const;

export const INSPECTION_PRODUCT_FEATURES_IMPLEMENTED = true as const;
export const INSPECTION_VERTICAL_SLICE_READY = true as const;
export const INSPECTION_ENTERPRISE_FOUNDATION_READY = true as const;
export const INSPECTION_ENGINEERING_DOMAIN_COMPLETE = true as const;
export const INSPECTION_OPERATIONAL_WORKFLOWS_READY = true as const;
export const INSPECTION_MOBILE_PRODUCT_IMPLEMENTED = true as const;
export const INSPECTION_OFFLINE_SYNC_IMPLEMENTED = true as const;
export const INSPECTION_CONDITION_RATING_IMPLEMENTED = true as const;
export const INSPECTION_PREDICTIVE_SIGNALS_SCAFFOLDED = true as const;
export const INSPECTION_PACK_EXPANSION_IMPLEMENTED = true as const;
export const INSPECTION_AI_VISION_IMPLEMENTED = true as const;
export const INSPECTION_INTELLIGENCE_RELEASE_CLOSED = true as const;
export const INSPECTION_PUBLIC_MODULE_CONTRACTS_PUBLISHED = true as const;
export const INSPECTION_CAPABILITY_REGISTRY_INTEGRATED = true as const;
export const INSPECTION_SERVICE_REGISTRY_PUBLISHED = true as const;
export const INSPECTION_PACK_REGISTRY_HARDENED = true as const;
export const INSPECTION_MODULE_MANIFEST_GENERATED = true as const;
export const INSPECTION_OPERATIONAL_HEALTH_METRICS_EXPOSED = true as const;
export const INSPECTION_VERSIONING_COMPATIBILITY_FORMALIZED = true as const;
export const INSPECTION_CROSS_MODULE_CONSUMER_CONTRACTS_CERTIFIED = true as const;
export const INSPECTION_MODULE_REGISTRY_DRIFT_DETECTED = false as const;
export const INSPECTION_INTELLIGENCE_V1_FROZEN = true as const;
export const INSPECTION_PRODUCTION_READY = true as const;
/** Asset Intelligence / Twin remaining-life product remains unimplemented. */
export const INSPECTION_PREDICTIVE_IMPLEMENTED = false as const;
export const INSPECTION_ASSET_INTELLIGENCE_IMPLEMENTED = false as const;
export const INSPECTION_DEFECT_FRAMEWORK_IMPLEMENTED = true as const;
export const INSPECTION_RECOMMENDATION_FRAMEWORK_IMPLEMENTED = true as const;
export const INSPECTION_CORRECTIVE_ACTION_FRAMEWORK_IMPLEMENTED = true as const;
export const INSPECTION_ASSESSMENT_FRAMEWORK_IMPLEMENTED = true as const;
export const INSPECTION_VERIFICATION_FRAMEWORK_IMPLEMENTED = true as const;
export const INSPECTION_CLOSEOUT_LIFECYCLE_IMPLEMENTED = true as const;
export const INSPECTION_COMPLIANCE_FRAMEWORK_IMPLEMENTED = true as const;
export const INSPECTION_KPI_FRAMEWORK_IMPLEMENTED = true as const;
export const INSPECTION_REPORTING_PREPARATION_IMPLEMENTED = true as const;
export const INSPECTION_MOBILE_REPORTING_IMPLEMENTED = true as const;

export const INSPECTION_INTELLIGENCE_PLANNED_ENTITLEMENTS = [
  "inspection.read",
  "inspection.write",
  "inspection.review",
  "inspection.approve",
  "inspection.report",
  "inspection.admin",
] as const;

export const INSPECTION_INTELLIGENCE_CORE_ENTITIES = [
  "inspection_plan",
  "inspection_template",
  "inspection_template_revision",
  "inspection_session",
  "inspection_assignment",
  "inspection_observation",
  "measurement",
  "inspection_evidence",
  "inspection_evidence_annotation",
  "inspection_attestation",
  "inspection_offline_store",
  "inspection_offline_command",
  "inspection_offline_package",
  "inspection_condition_rating",
  "inspection_condition_aggregation",
  "inspection_predictive_signal",
  "inspection_vision_analysis",
  "inspection_vision_derivative",
  "inspection_vision_validation",
  "inspection_module_manifest",
  "inspection_public_contract",
  "inspection_service_registry",
  "defect",
  "recommendation",
  "corrective_action",
  "engineering_assessment",
  "inspection_verification",
  "inspection_compliance_link",
  "inspection_review",
  "inspection_approval",
  "inspection_report_derivative",
  "inspection_reporting_output",
  "inspection_workflow_instance",
  "inspection_events",
  "inspection_pack_registry",
] as const;

export function getInspectionIntelligenceDomainDeclaration() {
  return {
    productName: INSPECTION_INTELLIGENCE_PRODUCT_NAME,
    moduleKey: INSPECTION_INTELLIGENCE_MODULE_KEY,
    version: INSPECTION_INTELLIGENCE_VERSION,
    releaseTag: INSPECTION_INTELLIGENCE_RELEASE_TAG,
    routePrefix: INSPECTION_INTELLIGENCE_ROUTE_PREFIX,
    inspectionProductFeaturesImplemented: INSPECTION_PRODUCT_FEATURES_IMPLEMENTED,
    verticalSliceReady: INSPECTION_VERTICAL_SLICE_READY,
    enterpriseFoundationReady: INSPECTION_ENTERPRISE_FOUNDATION_READY,
    engineeringDomainComplete: INSPECTION_ENGINEERING_DOMAIN_COMPLETE,
    operationalWorkflowsReady: INSPECTION_OPERATIONAL_WORKFLOWS_READY,
    mobileProductImplemented: INSPECTION_MOBILE_PRODUCT_IMPLEMENTED,
    offlineSyncImplemented: INSPECTION_OFFLINE_SYNC_IMPLEMENTED,
    conditionRatingImplemented: INSPECTION_CONDITION_RATING_IMPLEMENTED,
    predictiveSignalsScaffolded: INSPECTION_PREDICTIVE_SIGNALS_SCAFFOLDED,
    packExpansionImplemented: INSPECTION_PACK_EXPANSION_IMPLEMENTED,
    aiVisionImplemented: INSPECTION_AI_VISION_IMPLEMENTED,
    inspectionIntelligenceReleaseClosed: INSPECTION_INTELLIGENCE_RELEASE_CLOSED,
    publicModuleContractsPublished: INSPECTION_PUBLIC_MODULE_CONTRACTS_PUBLISHED,
    capabilityRegistryIntegrated: INSPECTION_CAPABILITY_REGISTRY_INTEGRATED,
    serviceRegistryPublished: INSPECTION_SERVICE_REGISTRY_PUBLISHED,
    inspectionPackRegistryHardened: INSPECTION_PACK_REGISTRY_HARDENED,
    moduleManifestGenerated: INSPECTION_MODULE_MANIFEST_GENERATED,
    operationalHealthMetricsExposed: INSPECTION_OPERATIONAL_HEALTH_METRICS_EXPOSED,
    versioningCompatibilityFormalized: INSPECTION_VERSIONING_COMPATIBILITY_FORMALIZED,
    crossModuleConsumerContractsCertified: INSPECTION_CROSS_MODULE_CONSUMER_CONTRACTS_CERTIFIED,
    moduleRegistryDriftDetected: INSPECTION_MODULE_REGISTRY_DRIFT_DETECTED,
    inspectionIntelligenceV1Frozen: INSPECTION_INTELLIGENCE_V1_FROZEN,
    productionInspectionIntelligenceReady: INSPECTION_PRODUCTION_READY,
    predictiveImplemented: INSPECTION_PREDICTIVE_IMPLEMENTED,
    assetIntelligenceImplemented: INSPECTION_ASSET_INTELLIGENCE_IMPLEMENTED,
    defectFrameworkImplemented: INSPECTION_DEFECT_FRAMEWORK_IMPLEMENTED,
    recommendationFrameworkImplemented: INSPECTION_RECOMMENDATION_FRAMEWORK_IMPLEMENTED,
    correctiveActionFrameworkImplemented: INSPECTION_CORRECTIVE_ACTION_FRAMEWORK_IMPLEMENTED,
    assessmentFrameworkImplemented: INSPECTION_ASSESSMENT_FRAMEWORK_IMPLEMENTED,
    verificationFrameworkImplemented: INSPECTION_VERIFICATION_FRAMEWORK_IMPLEMENTED,
    closeOutLifecycleImplemented: INSPECTION_CLOSEOUT_LIFECYCLE_IMPLEMENTED,
    complianceFrameworkImplemented: INSPECTION_COMPLIANCE_FRAMEWORK_IMPLEMENTED,
    kpiFrameworkImplemented: INSPECTION_KPI_FRAMEWORK_IMPLEMENTED,
    reportingPreparationImplemented: INSPECTION_REPORTING_PREPARATION_IMPLEMENTED,
    mobileReportingImplemented: INSPECTION_MOBILE_REPORTING_IMPLEMENTED,
    usesEngineeringDomainSdk: true as const,
    usesEngineeringModuleSdk: true as const,
    usesEngineeringWorkflowSdk: true as const,
    usesEngineeringMobileSdk: true as const,
    usesInspectionPackSdk: true as const,
    plannedEntitlements: INSPECTION_INTELLIGENCE_PLANNED_ENTITLEMENTS,
    coreEntities: INSPECTION_INTELLIGENCE_CORE_ENTITIES,
    assetOwnership: "engineering_os_shared_domain" as const,
    couplesVia: "inspection_target" as const,
    hierarchy:
      "RTB AI Platform → Engineering OS → Inspection Intelligence V1.0 (GA) / Project Intelligence / future Asset Intelligence / Project Controls / Digital Twin" as const,
    historicalCertification: {
      version: INSPECTION_INTELLIGENCE_V1_CERTIFICATION_VERSION,
      tag: INSPECTION_INTELLIGENCE_V1_CERTIFICATION_TAG,
      certifiedCommit: INSPECTION_INTELLIGENCE_V1_CERTIFIED_COMMIT,
    },
    currentRelease: {
      version: INSPECTION_INTELLIGENCE_VERSION,
      tag: INSPECTION_INTELLIGENCE_RELEASE_TAG,
      status: INSPECTION_INTELLIGENCE_NEXT_GEN_RELEASE_STATUS,
      nextGaVersion: INSPECTION_INTELLIGENCE_NEXT_GA_VERSION,
      ii0Implemented: INSPECTION_INTELLIGENCE_II_0_IMPLEMENTED,
      ii1Ready: INSPECTION_INTELLIGENCE_II_1_READY,
      ii1Implemented: INSPECTION_INTELLIGENCE_II_1_IMPLEMENTED,
      ii2Ready: INSPECTION_INTELLIGENCE_II_2_READY,
      ii2Implemented: INSPECTION_INTELLIGENCE_II_2_IMPLEMENTED,
      ii3Ready: INSPECTION_INTELLIGENCE_II_3_READY,
      ii3Implemented: INSPECTION_INTELLIGENCE_II_3_IMPLEMENTED,
      ii4Ready: INSPECTION_INTELLIGENCE_II_4_READY,
      ii4Implemented: INSPECTION_INTELLIGENCE_II_4_IMPLEMENTED,
      ii5Ready: INSPECTION_INTELLIGENCE_II_5_READY,
    },
  };
}

export function getInspectionIntelligenceHistoricalCertification() {
  return {
    version: INSPECTION_INTELLIGENCE_V1_CERTIFICATION_VERSION,
    tag: INSPECTION_INTELLIGENCE_V1_CERTIFICATION_TAG,
    certifiedCommit: INSPECTION_INTELLIGENCE_V1_CERTIFIED_COMMIT,
  } as const;
}

export const getInspectionIntelligenceOfflineDeclaration =
  getInspectionIntelligenceDomainDeclaration;
export const getInspectionIntelligenceMobileDeclaration =
  getInspectionIntelligenceDomainDeclaration;
export const getInspectionIntelligenceOperationalDeclaration =
  getInspectionIntelligenceDomainDeclaration;
export const getInspectionIntelligenceEnterpriseDeclaration =
  getInspectionIntelligenceDomainDeclaration;
export const getInspectionIntelligenceSliceDeclaration =
  getInspectionIntelligenceDomainDeclaration;
export const getInspectionIntelligenceDiscoveryDeclaration =
  getInspectionIntelligenceDomainDeclaration;
