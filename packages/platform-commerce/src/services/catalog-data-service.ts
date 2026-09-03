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
    case "trialing":
      return "trialing";
    case "active":
    case "grace_period":
    case "pending_renewal":
    case "scheduled_cancellation":
      return "active";
    case "pending_payment":
    case "paused":
    case "past_due":
      return "past_due";
    case "cancelled":
      return "cancelled";
    case "expired":
    case "suspended":
      return "expired";
    default:
      return "expired";
  }
}

function mapLicenseStatus(status: LicenseStatus): UiLicenceStatus {
  if (status === "active" || status === "expiring_soon") return "active";
  if (status === "suspended") return "suspended";
  return "expired";
}

function mapInstallationStatus(status: InstallationStatus): UiInstallationStatus {
  const value = String(status);
  if (value === "healthy" || value === "active") return "active";
  if (value === "degraded") return "degraded";
  if (value === "suspended") return "suspended";
  if (value === "failed") return "failed";
  if (
    value === "installing" ||
    value === "provisioning" ||
    value === "queued" ||
    value === "requested" ||
    value === "validating" ||
    value === "upgrading"
  ) {
    return "provisioning";
  }
  if (value === "uninstalling" || value === "uninstall_pending") return "uninstalling";
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
        marketplace_visible: p.marketplace_visible,
      })),
      commercial_plans: allPlans.map((plan) => ({
        id: plan.id,
        product_id: plan.product_id,
        edition: plan.edition,
      })),
      commercial_subscriptions: tenantSubscriptions.map((s) => ({
        id: s.id,
        product_id: s.product_id,
        plan_id: s.plan_id ?? undefined,
        status: mapSubscriptionStatus(s.status),
        renewal_date: s.renewal_date ?? undefined,
      })),
      commercial_licenses: tenantLicenses.map((l) => ({
        id: l.id,
        product_id: l.product_id ?? "",
        status: mapLicenseStatus(l.status),
        license_type: l.license_type,
        application_key: l.application_key ?? undefined,
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
