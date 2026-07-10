import type { CommerceAnalyticsSummary } from "@rtb/types";
import type {
  BillingRepository,
  InstallationRepository,
  SeatRepository,
  SubscriptionRepository,
  UsageRepository,
} from "../repositories";

export class AnalyticsService {
  constructor(
    private readonly subscriptions: SubscriptionRepository,
    private readonly seats: SeatRepository,
    private readonly installations: InstallationRepository,
    private readonly usage: UsageRepository,
    private readonly billing: BillingRepository
  ) {}

  async getTenantSummary(tenantId: string): Promise<CommerceAnalyticsSummary> {
    const [subs, seatPools, installs, invoices] = await Promise.all([
      this.subscriptions.listByTenant(tenantId),
      this.seats.listByTenant(tenantId),
      this.installations.listByTenant(tenantId),
      this.billing.listInvoices(tenantId),
    ]);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const monthEnd = now.toISOString();
    const usageAgg = await this.usage.aggregateByTenant(tenantId, monthStart, monthEnd);

    return {
      active_subscriptions: subs.filter((s) => s.status === "active").length,
      trialing_subscriptions: subs.filter((s) => s.status === "trial").length,
      total_seats_assigned: seatPools.reduce((n, p) => n + p.assigned_seats, 0),
      total_seats_available: seatPools.reduce((n, p) => n + p.total_seats, 0),
      healthy_installations: installs.filter((i) => i.status === "active" || (i.status as string) === "healthy").length,
      mrr_cents: invoices
        .filter((i) => i.status === "paid")
        .reduce((n, i) => n + i.total_cents, 0),
      usage_metrics_recorded: usageAgg.length,
    };
  }
}
