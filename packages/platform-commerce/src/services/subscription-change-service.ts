import type { CommercialSubscription, CommercialSubscriptionChange } from "@rtb/types";
import { PlanChangeConflictError, SubscriptionNotFoundError } from "../domain/errors";
import { SubscriptionStateMachine } from "../domain/subscription-state-machine";
import type { LicenseRepository } from "../repositories/license-repository";
import type { PlanEntitlementRepository } from "../repositories/entitlement-repository";
import type { SubscriptionChangeRepository } from "../repositories/subscription-change-repository";
import type { SubscriptionRepository } from "../repositories/subscription-repository";
import type { CommerceEventService } from "./commerce-event-service";
import type { EntitlementCache } from "./entitlement-cache";
import type { LicenseIssuanceService } from "./license-issuance-service";

export class SubscriptionChangeService {
  constructor(
    private readonly subscriptions: SubscriptionRepository,
    private readonly changes: SubscriptionChangeRepository,
    private readonly planEntitlements: PlanEntitlementRepository,
    private readonly licenses: LicenseRepository,
    private readonly licenceIssuance: LicenseIssuanceService,
    private readonly events: CommerceEventService,
    private readonly cache: EntitlementCache
  ) {}

  getPendingChange = (tenantId: string, subscriptionId: string) =>
    this.changes.getPending(tenantId, subscriptionId);

  async requestUpgrade(input: {
    tenantId: string;
    subscriptionId: string;
    targetPlanId: string;
    effectiveAt?: string;
    requestedBy?: string;
    reason?: string;
    immediate?: boolean;
  }): Promise<CommercialSubscriptionChange> {
    return this.schedulePlanChange({
      ...input,
      changeType: "upgrade",
      immediate: input.immediate ?? true,
    });
  }

  async requestDowngrade(input: {
    tenantId: string;
    subscriptionId: string;
    targetPlanId: string;
    effectiveAt?: string;
    requestedBy?: string;
    reason?: string;
    immediate?: boolean;
  }): Promise<CommercialSubscriptionChange> {
    return this.schedulePlanChange({
      ...input,
      changeType: "downgrade",
      immediate: input.immediate ?? false,
    });
  }

  async schedulePlanChange(input: {
    tenantId: string;
    subscriptionId: string;
    targetPlanId: string;
    changeType: CommercialSubscriptionChange["change_type"];
    effectiveAt?: string;
    requestedBy?: string;
    reason?: string;
    immediate?: boolean;
  }): Promise<CommercialSubscriptionChange> {
    const sub = await this.subscriptions.getById(input.tenantId, input.subscriptionId);
    if (!sub) throw new SubscriptionNotFoundError(input.subscriptionId);
    if (!SubscriptionStateMachine.isAccessGranting(sub.status)) {
      throw new PlanChangeConflictError("Subscription not in a changeable state");
    }

    const existing = await this.changes.getPending(input.tenantId, input.subscriptionId);
    if (existing) {
      throw new PlanChangeConflictError("A plan change is already pending");
    }

    const effectiveAt =
      input.effectiveAt ??
      (input.immediate ? new Date().toISOString() : sub.current_period_end ?? new Date().toISOString());

    const change = await this.changes.create({
      tenantId: input.tenantId,
      subscriptionId: input.subscriptionId,
      currentPlanId: sub.plan_id ?? undefined,
      targetPlanId: input.targetPlanId,
      changeType: input.changeType,
      effectiveAt,
      requestedBy: input.requestedBy,
      reason: input.reason,
    });

    const status = input.immediate ? "pending" : "scheduled";
    const scheduled = await this.changes.updateStatus(input.tenantId, change.id, status);

    if (input.immediate) {
      return this.applyScheduledChange(input.tenantId, scheduled.id, input.requestedBy);
    }

    await this.subscriptions.recordEvent(
      input.tenantId,
      input.subscriptionId,
      "subscription.plan_change_scheduled",
      sub.status,
      sub.status,
      { targetPlanId: input.targetPlanId, changeType: input.changeType },
      { actorUserId: input.requestedBy, source: "api" }
    );

    await this.events.emit({
      eventType: "subscription.plan_changed",
      tenantId: input.tenantId,
      aggregateType: "subscription_change",
      aggregateId: scheduled.id,
      payload: { subscriptionId: input.subscriptionId, targetPlanId: input.targetPlanId },
    });

    return scheduled;
  }

  async cancelScheduledChange(
    tenantId: string,
    changeId: string,
    cancelledBy?: string
  ): Promise<CommercialSubscriptionChange> {
    const cancelled = await this.changes.updateStatus(tenantId, changeId, "cancelled", {
      cancelled_at: new Date().toISOString(),
    });
    this.cache.invalidateTenant(tenantId);
    await this.events.emit({
      eventType: "subscription.plan_change_cancelled",
      tenantId,
      actorUserId: cancelledBy,
      aggregateType: "subscription_change",
      aggregateId: changeId,
      payload: {},
    });
    return cancelled;
  }

  async applyScheduledChange(
    tenantId: string,
    changeId: string,
    appliedBy?: string
  ): Promise<CommercialSubscriptionChange> {
    const change = await this.changes.getById(tenantId, changeId);
    if (!change) throw new PlanChangeConflictError("Plan change not found");
    const sub = await this.subscriptions.getById(tenantId, change.subscription_id);
    if (!sub) throw new SubscriptionNotFoundError(change.subscription_id);

    await this.subscriptions.transition(
      {
        tenantId,
        subscriptionId: change.subscription_id,
        targetStatus: sub.status,
        actorUserId: appliedBy,
      },
      {
        plan_id: change.target_plan_id,
        plan_snapshot_json: { plan_id: change.target_plan_id, applied_at: new Date().toISOString() },
      }
    );

    const eventType =
      change.change_type === "upgrade" ? "subscription.upgraded" : "subscription.downgraded";
    await this.subscriptions.recordEvent(
      tenantId,
      change.subscription_id,
      eventType,
      sub.status,
      sub.status,
      { fromPlanId: change.current_plan_id, toPlanId: change.target_plan_id },
      { actorUserId: appliedBy, source: "scheduler" }
    );

    await this.licenceIssuance.issueForSubscription({
      tenantId,
      subscriptionId: change.subscription_id,
      productId: sub.product_id,
      planId: change.target_plan_id,
      issuedBy: appliedBy,
    });

    const applied = await this.changes.updateStatus(tenantId, changeId, "applied", {
      applied_at: new Date().toISOString(),
    });

    this.cache.invalidateTenant(tenantId);
    await this.events.emit({
      eventType: "subscription.plan_changed",
      tenantId,
      actorUserId: appliedBy,
      aggregateType: "subscription_change",
      aggregateId: changeId,
      payload: { applied: true },
    });

    return applied;
  }

  convertTrialToPlan(
    tenantId: string,
    subscriptionId: string,
    targetPlanId: string,
    actorUserId?: string
  ) {
    return this.schedulePlanChange({
      tenantId,
      subscriptionId,
      targetPlanId,
      changeType: "conversion",
      requestedBy: actorUserId,
      immediate: true,
    });
  }

  listScheduledDue = (before: string) => this.changes.listScheduledDue(before);
}
