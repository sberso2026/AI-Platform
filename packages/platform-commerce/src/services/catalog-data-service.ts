import type { PlatformCommerceData } from "@rtb/platform-core";
import type { SubscriptionStatus as UiSubscriptionStatus } from "@rtb/platform-core";
import type { LicenceStatus as UiLicenceStatus } from "@rtb/platform-core";
import type { InstallationStatus as UiInstallationStatus } from "@rtb/platform-core";
import type { SubscriptionStatus } from "@rtb/types";
import type { LicenseStatus } from "@rtb/types";
import type { InstallationStatus } from "@rtb/types";
import type {
  InstallationRepository,
  LicenseRepository,
  PlanRepository,
  ProductRepository,
  SeatRepository,
  SubscriptionRepository,
  UsageRepository,
} from "../repositories";

function mapSubscriptionStatus(status: SubscriptionStatus): UiSubscriptionStatus {
  switch (status) {
    case "trial":
      return "trialing";
    case "active":
    case "grace_period":
    case "pending_renewal":
      return "active";
    case "pending_payment":
    case "paused":
      return "past_due";
    case "cancelled":
      return "cancelled";
    case "suspended":
    default:
      return "expired";
  }
}

function mapLicenseStatus(status: LicenseStatus): UiLicenceStatus {
  if (status === "active") return "active";
  if (status === "suspended") return "suspended";
  return "expired";
}

function mapInstallationStatus(status: InstallationStatus): UiInstallationStatus {
  if (status === "healthy") return "healthy";
  if (status === "degraded") return "degraded";
  if (status === "installing" || status === "uninstalling") return "installing";
  if (status === "failed") return "failed";
  return "not_installed";
}

/** Builds PlatformCommerceData for the UI adapter from commerce engine tables */
export class CatalogDataService {
  constructor(
    private readonly products: ProductRepository,
    private readonly plans: PlanRepository,
    private readonly subscriptions: SubscriptionRepository,
    private readonly licenses: LicenseRepository,
    private readonly seats: SeatRepository,
    private readonly installations: InstallationRepository,
    private readonly usage: UsageRepository
  ) {}

  async buildTenantCommerceData(tenantId: string): Promise<PlatformCommerceData> {
    const [
      catalogProducts,
      tenantSubscriptions,
      tenantLicenses,
      tenantInstallations,
      tenantSeats,
    ] = await Promise.all([
      this.products.listCatalog(),
      this.subscriptions.listByTenant(tenantId),
      this.licenses.listByTenant(tenantId),
      this.installations.listByTenant(tenantId),
      this.seats.listByTenant(tenantId),
    ]);

    const planResults = await Promise.all(
      catalogProducts.map((p) => this.plans.listByProduct(p.id))
    );
    const allPlans = planResults.flat();

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const usageAgg = await this.usage.aggregateByTenant(
      tenantId,
      monthStart,
      now.toISOString()
    );

    return {
      commercial_products: catalogProducts.map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        product_type: p.product_type,
        description: p.description ?? "",
        icon: p.icon ?? undefined,
        lifecycle_status: p.lifecycle_status,
      })),
      commercial_plans: allPlans.map((plan) => ({
        id: plan.id,
        product_id: plan.product_id,
        edition: plan.edition,
      })),
      commercial_subscriptions: tenantSubscriptions.map((s) => ({
        id: s.id,
        product_id: s.product_id,
        status: mapSubscriptionStatus(s.status),
        renewal_date: s.renewal_date ?? undefined,
      })),
      commercial_licenses: tenantLicenses.map((l) => ({
        id: l.id,
        product_id: l.product_id ?? "",
        status: mapLicenseStatus(l.status),
      })),
      product_installations: tenantInstallations.map((i) => ({
        id: i.id,
        product_id: i.product_id,
        status: mapInstallationStatus(i.status),
        version: i.version ?? undefined,
      })),
      commercial_seat_pools: tenantSeats.map((s) => ({
        id: s.id,
        product_id: s.product_id,
        assigned: s.assigned_seats,
        total: s.total_seats,
      })),
      commercial_usage_aggregates: usageAgg.map((u) => ({
        id: u.metric_key,
        product_id: "",
        summary: `${u.name}: ${u.total_quantity} ${u.unit}`,
      })),
    };
  }
}
