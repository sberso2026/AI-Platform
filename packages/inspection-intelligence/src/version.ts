/**
 * Phase 9C — Inspection Intelligence enterprise foundation identity.
 */
export const INSPECTION_INTELLIGENCE_PRODUCT_NAME = "Inspection Intelligence" as const;
export const INSPECTION_INTELLIGENCE_MODULE_KEY = "inspection_intelligence" as const;
export const INSPECTION_INTELLIGENCE_VERSION = "0.3.0-enterprise-foundation" as const;
export const INSPECTION_INTELLIGENCE_ROUTE_PREFIX =
  "/engineering/apps/inspection-intelligence" as const;

export const INSPECTION_PRODUCT_FEATURES_IMPLEMENTED = true as const;
export const INSPECTION_VERTICAL_SLICE_READY = true as const;
export const INSPECTION_ENTERPRISE_FOUNDATION_READY = true as const;
export const INSPECTION_AI_VISION_IMPLEMENTED = false as const;
export const INSPECTION_ASSET_INTELLIGENCE_IMPLEMENTED = false as const;
export const INSPECTION_PREDICTIVE_IMPLEMENTED = false as const;
export const INSPECTION_MOBILE_PRODUCT_IMPLEMENTED = false as const;
export const INSPECTION_CONDITION_RATING_IMPLEMENTED = false as const;
export const INSPECTION_OFFLINE_SYNC_IMPLEMENTED = false as const;

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
  "defect",
  "recommendation",
  "inspection_review",
  "inspection_approval",
  "inspection_report_derivative",
  "inspection_events",
  "inspection_pack_registry",
] as const;

export function getInspectionIntelligenceEnterpriseDeclaration() {
  return {
    productName: INSPECTION_INTELLIGENCE_PRODUCT_NAME,
    moduleKey: INSPECTION_INTELLIGENCE_MODULE_KEY,
    version: INSPECTION_INTELLIGENCE_VERSION,
    routePrefix: INSPECTION_INTELLIGENCE_ROUTE_PREFIX,
    inspectionProductFeaturesImplemented: INSPECTION_PRODUCT_FEATURES_IMPLEMENTED,
    verticalSliceReady: INSPECTION_VERTICAL_SLICE_READY,
    enterpriseFoundationReady: INSPECTION_ENTERPRISE_FOUNDATION_READY,
    aiVisionImplemented: INSPECTION_AI_VISION_IMPLEMENTED,
    assetIntelligenceImplemented: INSPECTION_ASSET_INTELLIGENCE_IMPLEMENTED,
    predictiveImplemented: INSPECTION_PREDICTIVE_IMPLEMENTED,
    mobileProductImplemented: INSPECTION_MOBILE_PRODUCT_IMPLEMENTED,
    conditionRatingImplemented: INSPECTION_CONDITION_RATING_IMPLEMENTED,
    offlineSyncImplemented: INSPECTION_OFFLINE_SYNC_IMPLEMENTED,
    plannedEntitlements: INSPECTION_INTELLIGENCE_PLANNED_ENTITLEMENTS,
    coreEntities: INSPECTION_INTELLIGENCE_CORE_ENTITIES,
    assetOwnership: "engineering_os_shared_domain" as const,
    couplesVia: "inspection_target" as const,
    usesEngineeringModuleSdk: true as const,
    usesInspectionPackSdk: true as const,
    hierarchy:
      "RTB AI Platform → Engineering OS → Inspection Intelligence → Inspection Packs → Features" as const,
  };
}

export const getInspectionIntelligenceSliceDeclaration =
  getInspectionIntelligenceEnterpriseDeclaration;
export const getInspectionIntelligenceDiscoveryDeclaration =
  getInspectionIntelligenceEnterpriseDeclaration;
