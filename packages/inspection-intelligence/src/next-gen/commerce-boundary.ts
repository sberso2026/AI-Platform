/**
 * II-0 commerce documentation. Does not create standalone II plans.
 */
export const INSPECTION_INTELLIGENCE_COMMERCE_BOUNDARY = {
  productSlug: "inspection-intelligence",
  productType: "application",
  applicationKey: "inspection_intelligence",
  parentProduct: "engineering-os",
  parentDependencyRequired: true,
  parentMinimumVersion: "1.0.0",
  seatRequired: true,
  workspaceRequired: true,
  entitlementModel: "application_access_on_engineering_os_plans",
  standaloneCatalogProductHasPlans: false,
  catalogSurface: "engineering_os_application",
  uiMismatch: false,
  catalogCommerceReconciled: true,
  planMismatchResolved: true,
  standaloneLicensingCreated: false,
  businessOsEntitlementRequired: false,
  createStandalonePlansInIi0: false,
} as const;
