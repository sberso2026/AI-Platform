export const PRODUCT_DETAIL_TABS = [
  "overview",
  "applications",
  "workspaces",
  "licences-seats",
  "usage",
  "installation",
  "health",
  "version-history",
  "audit-history",
  "support",
] as const;

export type ProductDetailTab = (typeof PRODUCT_DETAIL_TABS)[number];

export const PRODUCT_DETAIL_TAB_LABELS: Record<ProductDetailTab, string> = {
  overview: "Overview",
  applications: "Applications",
  workspaces: "Workspaces",
  "licences-seats": "Licences & Seats",
  usage: "Usage",
  installation: "Installation",
  health: "Health",
  "version-history": "Version History",
  "audit-history": "Audit History",
  support: "Support",
};

export function parseProductDetailTab(value: string | null | undefined): ProductDetailTab {
  if (value && PRODUCT_DETAIL_TABS.includes(value as ProductDetailTab)) {
    return value as ProductDetailTab;
  }
  return "overview";
}
