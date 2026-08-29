/**
 * PI-0 commerce documentation only. Does not create plans.
 */

export const PROJECT_INTELLIGENCE_COMMERCE_BOUNDARY = {
  productSlug: "project-intelligence",
  productType: "application",
  applicationKey: "project_intelligence",
  parentProduct: "engineering-os",
  parentDependencyRequired: true,
  parentMinimumVersion: "1.0.0",
  seatRequired: true,
  workspaceRequired: true,
  entitlementModel: "application_access_on_engineering_os_plans",
  standaloneCatalogProductHasPlans: false,
  uiMismatch:
    "Standalone catalog card currently expects a product plan although PI is licensed through Engineering OS.",
  createPlansInPi0: false,
} as const;
