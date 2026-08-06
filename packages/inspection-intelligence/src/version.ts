/**

 * Phase 9G — Inspection Intelligence offline synchronization identity.

 */

export const INSPECTION_INTELLIGENCE_PRODUCT_NAME = "Inspection Intelligence" as const;

export const INSPECTION_INTELLIGENCE_MODULE_KEY = "inspection_intelligence" as const;

export const INSPECTION_INTELLIGENCE_VERSION = "0.7.0-offline-sync" as const;

export const INSPECTION_INTELLIGENCE_ROUTE_PREFIX =

  "/engineering/apps/inspection-intelligence" as const;



export const INSPECTION_PRODUCT_FEATURES_IMPLEMENTED = true as const;

export const INSPECTION_VERTICAL_SLICE_READY = true as const;

export const INSPECTION_ENTERPRISE_FOUNDATION_READY = true as const;

export const INSPECTION_ENGINEERING_DOMAIN_COMPLETE = true as const;

export const INSPECTION_OPERATIONAL_WORKFLOWS_READY = true as const;

export const INSPECTION_MOBILE_PRODUCT_IMPLEMENTED = true as const;

export const INSPECTION_OFFLINE_SYNC_IMPLEMENTED = true as const;

export const INSPECTION_AI_VISION_IMPLEMENTED = false as const;

export const INSPECTION_ASSET_INTELLIGENCE_IMPLEMENTED = false as const;

export const INSPECTION_PREDICTIVE_IMPLEMENTED = false as const;

export const INSPECTION_CONDITION_RATING_IMPLEMENTED = false as const;

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

    aiVisionImplemented: INSPECTION_AI_VISION_IMPLEMENTED,

    assetIntelligenceImplemented: INSPECTION_ASSET_INTELLIGENCE_IMPLEMENTED,

    predictiveImplemented: INSPECTION_PREDICTIVE_IMPLEMENTED,

    conditionRatingImplemented: INSPECTION_CONDITION_RATING_IMPLEMENTED,

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

      "RTB AI Platform → Engineering OS → Shared Engineering SDKs → Engineering Mobile SDK → Inspection Intelligence → Inspection Packs → Mobile Field Features → Offline Sync" as const,

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


