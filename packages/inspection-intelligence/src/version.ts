/**
 * Phase 9A — Inspection Intelligence discovery version identity.
 * Product features are not implemented in this phase.
 */
export const INSPECTION_INTELLIGENCE_PRODUCT_NAME = "Inspection Intelligence" as const;
export const INSPECTION_INTELLIGENCE_MODULE_KEY = "inspection_intelligence" as const;
export const INSPECTION_INTELLIGENCE_VERSION = "0.1.0-discovery" as const;
export const INSPECTION_INTELLIGENCE_ROUTE_PREFIX =
  "/engineering/apps/inspection-intelligence" as const;

/** Phase 9A lock: no commercial inspection product features yet. */
export const INSPECTION_PRODUCT_FEATURES_IMPLEMENTED = false as const;

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
] as const;

export function getInspectionIntelligenceDiscoveryDeclaration() {
  return {
    productName: INSPECTION_INTELLIGENCE_PRODUCT_NAME,
    moduleKey: INSPECTION_INTELLIGENCE_MODULE_KEY,
    version: INSPECTION_INTELLIGENCE_VERSION,
    routePrefix: INSPECTION_INTELLIGENCE_ROUTE_PREFIX,
    inspectionProductFeaturesImplemented: INSPECTION_PRODUCT_FEATURES_IMPLEMENTED,
    plannedEntitlements: INSPECTION_INTELLIGENCE_PLANNED_ENTITLEMENTS,
    coreEntities: INSPECTION_INTELLIGENCE_CORE_ENTITIES,
    assetOwnership: "engineering_os_shared_domain" as const,
    hierarchy: "RTB AI Platform → Engineering OS → Inspection Intelligence → Features" as const,
  };
}
