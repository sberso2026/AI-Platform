/**
 * Phase 9J — Inspection Intelligence module release closure identity.
 */
export const INSPECTION_INTELLIGENCE_PRODUCT_NAME = "Inspection Intelligence" as const;
export const INSPECTION_INTELLIGENCE_MODULE_KEY = "inspection_intelligence" as const;
export const INSPECTION_INTELLIGENCE_VERSION = "1.0.0-ii-release" as const;
export const INSPECTION_INTELLIGENCE_ROUTE_PREFIX =
  "/engineering/apps/inspection-intelligence" as const;

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
      "RTB AI Platform → Engineering OS → Shared Engineering SDKs → Inspection Intelligence → Release Closure / Public Contracts / Registries / Manifest → AI Vision (advisory) / Condition / Predictive / Packs → Offline Sync" as const,
  };
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
