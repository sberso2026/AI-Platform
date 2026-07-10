import type { CommercialSubscription, TransitionSubscriptionInput } from "@rtb/types";
import { SubscriptionStateMachine } from "../domain/subscription-state-machine";
import { SubscriptionNotFoundError } from "../domain/errors";
import type { SubscriptionRepository } from "../repositories/subscription-repository";
import type { CommerceEventService } from "./commerce-event-service";
import type { EntitlementCache } from "./entitlement-cache";
import type { EntitlementVersionRepository } from "../repositories/entitlement-version-repository";

export class SubscriptionLifecycleService {
  constructor(
    private readonly subscriptions: SubscriptionRepository,
    private readonly events: CommerceEventService,
    private readonly cache: EntitlementCache,
    private readonly entitlementVersions?: EntitlementVersionRepository
  ) {}

  private invalidateEntitlements(tenantId: string): void {
    this.cache.invalidateTenant(tenantId);
    void this.entitlementVersions?.bumpTenant(tenantId);
  }

  listByTenant = (tenantId: string) => this.subscriptions.listByTenant(tenantId);
  getById = (tenantId: string, id: string) => this.subscriptions.getById(tenantId, id);

  async transition(
    input: TransitionSubscriptionInput,
    extraPatch: Record<string, unknown> = {}
  ): Promise<CommercialSubscription> {
    const existing = await this.subscriptions.getById(input.tenantId, input.subscriptionId);
    if (!existing) throw new SubscriptionNotFoundError(input.subscriptionId);

    const from = existing.status;
    const to = input.targetStatus;
    SubscriptionStateMachine.assertTransition(from, to);

    const now = new Date().toISOString();
    const patch: Record<string, unknown> = { ...extraPatch };
    if (to === "active" && !existing.activated_at) patch.activated_at = now;
    if (to === "trialing") patch.trial_start = patch.trial_start ?? now;
    if (to === "paused") patch.paused_at = now;
    if (to === "suspended") patch.suspended_at = now;
    if (to === "expired") patch.expired_at = now;
    if (to === "cancelled") {
      patch.cancellation_effective_at = input.effectiveAt ?? now;
    }
    if (to === "scheduled_cancellation") {
      patch.cancellation_requested_at = now;
      patch.cancel_at_period_end = true;
    }

    const updated = await this.subscriptions.transition(input, patch);
    const eventType = SubscriptionStateMachine.eventTypeForTransition(from, to);

    await this.subscriptions.recordEvent(
      input.tenantId,
      input.subscriptionId,
      eventType,
      from,
      to,
      { reason: input.reason },
      {
        actorUserId: input.actorUserId,
        actorType: input.actorType,
        source: input.source,
        reason: input.reason,
        correlationId: input.correlationId,
        idempotencyKey: input.idempotencyKey,
        workspaceId: existing.workspace_id ?? undefined,
        effectiveAt: input.effectiveAt,
      }
    );

    await this.events.emit({
      eventType,
      tenantId: input.tenantId,
      workspaceId: existing.workspace_id ?? undefined,
      actorUserId: input.actorUserId,
      aggregateType: "subscription",
      aggregateId: input.subscriptionId,
      correlationId: input.correlationId,
      idempotencyKey: input.idempotencyKey,
      payload: { from, to, subscriptionId: input.subscriptionId },
    });

    this.invalidateEntitlements(input.tenantId);
    return updated;
  }

  activate(tenantId: string, subscriptionId: string, actorUserId?: string) {
    return this.transition({
      tenantId,
      subscriptionId,
      targetStatus: "active",
      actorUserId,
      source: "api",
    });
  }

  pause(tenantId: string, subscriptionId: string, actorUserId?: string, reason?: string) {
    return this.transition({
      tenantId,
      subscriptionId,
      targetStatus: "paused",
      actorUserId,
      reason,
      source: "api",
    });
  }

  resume(tenantId: string, subscriptionId: string, actorUserId?: string) {
    return this.transition({
      tenantId,
      subscriptionId,
      targetStatus: "active",
      actorUserId,
      source: "api",
      reason: "resumed",
    });
  }

  suspend(tenantId: string, subscriptionId: string, actorUserId?: string, reason?: string) {
    return this.transition({
      tenantId,
      subscriptionId,
      targetStatus: "suspended",
      actorUserId,
      reason,
      source: "api",
    });
  }

  scheduleCancellation(
    tenantId: string,
    subscriptionId: string,
    actorUserId?: string,
    effectiveAt?: string
  ) {
    return this.transition({
      tenantId,
      subscriptionId,
      targetStatus: "scheduled_cancellation",
      actorUserId,
      effectiveAt,
      source: "api",
    });
  }

  cancel(tenantId: string, subscriptionId: string, actorUserId?: string, reason?: string) {
    return this.transition({
      tenantId,
      subscriptionId,
      targetStatus: "cancelled",
      actorUserId,
      reason,
      source: "api",
    });
  }

  renew(tenantId: string, subscriptionId: string, actorUserId?: string) {
    return this.transition({
      tenantId,
      subscriptionId,
      targetStatus: "active",
      actorUserId,
      source: "api",
      reason: "renewed",
    });
  }
}
