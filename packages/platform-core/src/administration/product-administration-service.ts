import type { CommercialProductView, PlatformCommerceData } from "../commerce/commerce-types";
import { buildCatalogSummary } from "../commerce/commerce-adapter";
import type {
  ProductAdministrationView,
  ProductCatalogSummaryView,
} from "./administration-types";
import { normalizeHealthStatus } from "./status-normalizers";

export function enrichProductAdministrationView(
  product: CommercialProductView,
  extras?: {
    healthCheckStatus?: string;
    availableVersion?: string;
    workspaceAssignmentCount?: number;
    lastHealthCheckAt?: string;
    installationId?: string;
  }
): ProductAdministrationView {
  return {
    ...product,
    healthStatus: normalizeHealthStatus({
      installationStatus: product.installationStatus,
      healthCheckStatus: extras?.healthCheckStatus,
      installationSuspended: product.installationStatus === "suspended",
    }),
    availableVersion: extras?.availableVersion,
    workspaceAssignmentCount: extras?.workspaceAssignmentCount,
    lastHealthCheckAt: extras?.lastHealthCheckAt,
    installationId: extras?.installationId,
  };
}

export function buildProductCatalogSummary(
  products: CommercialProductView[],
  context: { roleSlug: string },
  commerceData?: PlatformCommerceData
): ProductCatalogSummaryView {
  const summary = buildCatalogSummary(products, {
    roleSlug: context.roleSlug,
    engineeringOsEnabled: true,
  });

  const installed = products.filter((p) => p.catalogTab === "installed");
  const healthStatuses = installed.map((p) =>
    normalizeHealthStatus({ installationStatus: p.installationStatus })
  );

  let installationHealth: ProductCatalogSummaryView["installationHealth"] = "healthy";
  if (healthStatuses.some((h) => h === "failed")) installationHealth = "failed";
  else if (healthStatuses.some((h) => h === "degraded")) installationHealth = "degraded";
  else if (healthStatuses.some((h) => h === "warning")) installationHealth = "warning";
  else if (healthStatuses.every((h) => h === "suspended") && installed.length > 0) {
    installationHealth = "suspended";
  }

  const liveAppCount = commerceData?.application_installations?.filter((a) =>
    ["active", "healthy", "degraded"].includes(a.status)
  ).length;
  const appCount = liveAppCount && liveAppCount > 0 ? liveAppCount : summary.installedApplications;

  return {
    installedOperatingSystems: summary.installedProducts,
    installedApplications: appCount,
    assignedSeats: summary.assignedSeats,
    totalSeats: summary.totalSeats,
    currentPlan: summary.currentPlan,
    renewalDate: summary.renewalDate,
    installationHealth,
  };
}
