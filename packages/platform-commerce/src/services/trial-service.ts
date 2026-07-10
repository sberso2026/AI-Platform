import type { StartTrialInput, TrialEligibilityResult } from "@rtb/types";
import { TrialNotEligibleError } from "../domain/errors";
import type { SubscriptionRepository } from "../repositories/subscription-repository";
import type { SubscriptionLifecycleService } from "./subscription-lifecycle-service";
import type { LicenseIssuanceService } from "./license-issuance-service";
import type { CommerceEventService } from "./commerce-event-service";

export class TrialService {
  constructor(
    private readonly subscriptions: SubscriptionRepository,
    private readonly lifecycle: SubscriptionLifecycleService,
    private readonly licenceIssuance: LicenseIssuanceService,
    private readonly events: CommerceEventService
  ) {}

  async checkTrialEligibility(input: {
    tenantId: string;
    productId: string;
    requestedPlanId?: string;
  }): Promise<TrialEligibilityResult> {
    const existing = await this.subscriptions.findActiveByProduct(input.tenantId, input.productId);
    if (existing) {
      return { eligible: false, reason: "active_subscription_exists" };
    }

    const priorTrials = (await this.subscriptions.listByTenant(input.tenantId)).filter(
      (s) => s.product_id === input.productId && (s.status === "expired" || s.status === "cancelled")
    );
    const hadTrial = priorTrials.some(
      (s) => s.trial_start || s.trial_end || s.trial_ends_at || s.metadata?.trial === true
    );
    if (hadTrial) {
      return { eligible: false, reason: "already_used" };
    }

    return { eligible: true, reason: "eligible" };
  }

  async startTrial(input: StartTrialInput) {
    const eligibility = await this.checkTrialEligibility({
      tenantId: input.tenantId,
      productId: input.productId,
      requestedPlanId: input.planId,
    });
    if (!eligibility.eligible) {
      throw new TrialNotEligibleError(eligibility.reason);
    }

    const trialDays = input.trialDays ?? 14;
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + trialDays);

    const subscription = await this.subscriptions.create({
      tenantId: input.tenantId,
      productId: input.productId,
      planId: input.planId,
      workspaceId: input.workspaceId,
      status: "draft",
      createdBy: input.actorUserId,
      metadata: { trial: true, trialDays },
    });

    await this.lifecycle.transition({
      tenantId: input.tenantId,
      subscriptionId: subscription.id,
      targetStatus: "pending_activation",
      actorUserId: input.actorUserId,
      source: "trial",
    });

    await this.lifecycle.transition(
      {
        tenantId: input.tenantId,
        subscriptionId: subscription.id,
        targetStatus: "trialing",
        actorUserId: input.actorUserId,
        source: "trial",
      },
      {
        trial_start: new Date().toISOString(),
        trial_end: trialEnd.toISOString(),
        trial_ends_at: trialEnd.toISOString(),
      }
    );

    const licences = await this.licenceIssuance.issueForSubscription({
      tenantId: input.tenantId,
      subscriptionId: subscription.id,
      productId: input.productId,
      planId: input.planId,
      workspaceId: input.workspaceId,
      seatLimit: input.seatLimit ?? 5,
      issuedBy: input.actorUserId,
    });

    await this.events.emit({
      eventType: "subscription.trial_started",
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      actorUserId: input.actorUserId,
      aggregateType: "subscription",
      aggregateId: subscription.id,
      payload: { trialEnd: trialEnd.toISOString(), licences: licences.map((l) => l.id) },
    });

    return { subscription, licences };
  }

  async expireTrials(tenantId?: string): Promise<number> {
    const now = new Date().toISOString();
    let expired = 0;
    const batchSize = 100;

    while (true) {
      const subs = tenantId
        ? (await this.subscriptions.listByTenant(tenantId)).filter((sub) => {
            if (sub.status !== "trialing") return false;
            const trialEnd = sub.trial_end ?? sub.trial_ends_at;
            return Boolean(trialEnd && trialEnd <= now);
          })
        : await this.subscriptions.listTrialingPastEnd(now, batchSize);

      if (subs.length === 0) break;

      for (const sub of subs) {
        const trialEnd = sub.trial_end ?? sub.trial_ends_at;
        await this.lifecycle.transition({
          tenantId: sub.tenant_id,
          subscriptionId: sub.id,
          targetStatus: "expired",
          source: "scheduler",
          reason: "trial_expired",
        });
        await this.events.emit({
          eventType: "trial.expired",
          tenantId: sub.tenant_id,
          aggregateType: "subscription",
          aggregateId: sub.id,
          payload: { trialEnd },
        });
        expired++;
      }

      if (tenantId || subs.length < batchSize) break;
    }

    return expired;
  }

  async convertTrial(
    tenantId: string,
    subscriptionId: string,
    actorUserId?: string
  ) {
    const sub = await this.subscriptions.getById(tenantId, subscriptionId);
    if (!sub || sub.status !== "trialing") {
      throw new TrialNotEligibleError("not_trialing");
    }
    return this.lifecycle.activate(tenantId, subscriptionId, actorUserId);
  }

  async extendTrial(
    tenantId: string,
    subscriptionId: string,
    extendDays: number,
    actorUserId?: string
  ) {
    const sub = await this.subscriptions.getById(tenantId, subscriptionId);
    if (!sub || sub.status !== "trialing") {
      throw new TrialNotEligibleError("not_trialing");
    }
    const currentEnd = new Date(sub.trial_end ?? sub.trial_ends_at ?? Date.now());
    currentEnd.setDate(currentEnd.getDate() + extendDays);
    const newEnd = currentEnd.toISOString();
    await this.subscriptions.transition(
      { tenantId, subscriptionId, targetStatus: "trialing", actorUserId },
      { trial_end: newEnd, trial_ends_at: newEnd }
    );
    await this.subscriptions.recordEvent(
      tenantId,
      subscriptionId,
      "subscription.trial_extended",
      "trialing",
      "trialing",
      { newEnd, extendDays },
      { actorUserId, source: "api" }
    );
    return this.subscriptions.getById(tenantId, subscriptionId);
  }

  async cancelTrial(tenantId: string, subscriptionId: string, actorUserId?: string) {
    const sub = await this.subscriptions.getById(tenantId, subscriptionId);
    if (!sub || sub.status !== "trialing") {
      throw new TrialNotEligibleError("not_trialing");
    }
    return this.lifecycle.cancel(tenantId, subscriptionId, actorUserId, "trial_cancelled");
  }
}
