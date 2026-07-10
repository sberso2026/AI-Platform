import type { CreateSubscriptionInput, SubscriptionStatus } from "@rtb/types";
import { SubscriptionRepository } from "../repositories";
import { commerceExtensions } from "./product-service";

export class SubscriptionService {
  constructor(private readonly subscriptions: SubscriptionRepository) {}

  listByTenant = (tenantId: string) => this.subscriptions.listByTenant(tenantId);

  getById = (tenantId: string, id: string) =>
    this.subscriptions.getById(tenantId, id);

  async create(input: CreateSubscriptionInput) {
    const subscription = await this.subscriptions.create(input);
    await this.subscriptions.recordEvent(
      input.tenantId,
      subscription.id,
      "subscription.created",
      null,
      subscription.status,
      { product_id: input.productId, plan_id: input.planId }
    );
    await commerceExtensions.growth?.onSubscriptionCreated?.(subscription);
    return subscription;
  }

  async changeStatus(
    tenantId: string,
    id: string,
    status: SubscriptionStatus,
    updatedBy?: string
  ) {
    const existing = await this.subscriptions.getById(tenantId, id);
    if (!existing) throw new Error("Subscription not found");
    const updated = await this.subscriptions.updateStatus(
      tenantId,
      id,
      status,
      updatedBy
    );
    await this.subscriptions.recordEvent(
      tenantId,
      id,
      "subscription.status_changed",
      existing.status,
      status,
      {}
    );
    if (status === "active" && existing.status !== "active") {
      await commerceExtensions.growth?.onSubscriptionRenewed?.(updated);
    }
    return updated;
  }

  listTrialingPastEnd = (now: string, limit: number) =>
    this.subscriptions.listTrialingPastEnd(now, limit);

  listScheduledCancellationsDue = (now: string, limit: number) =>
    this.subscriptions.listScheduledCancellationsDue(now, limit);

  listGracePeriodExpired = (now: string, limit: number) =>
    this.subscriptions.listGracePeriodExpired(now, limit);

  listExpiringSubscriptions = (withinDays: number, limit: number) =>
    this.subscriptions.listExpiringSubscriptions(withinDays, limit);
}
