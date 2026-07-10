import type { SubscriptionStatus } from "@rtb/types";
import { InvalidSubscriptionTransitionError } from "./errors";

/** Allowed subscription state transitions (Phase 2). */
const TRANSITIONS: Record<SubscriptionStatus, SubscriptionStatus[]> = {
  draft: ["pending_activation"],
  pending_activation: ["trialing", "active", "cancelled"],
  trialing: ["active", "expired", "cancelled"],
  trial: ["active", "expired", "cancelled"],
  active: ["past_due", "paused", "suspended", "scheduled_cancellation", "cancelled"],
  past_due: ["active", "grace_period", "suspended"],
  grace_period: ["active", "suspended"],
  paused: ["active", "cancelled"],
  suspended: ["active", "cancelled"],
  scheduled_cancellation: ["active", "cancelled"],
  cancelled: ["active"],
  expired: ["active"],
  pending_renewal: ["active", "cancelled", "expired"],
  pending_payment: ["active", "cancelled", "past_due"],
};

const EVENT_BY_TRANSITION: Partial<Record<string, string>> = {
  "draft→pending_activation": "subscription.pending_activation",
  "pending_activation→trialing": "subscription.trial_started",
  "pending_activation→active": "subscription.activated",
  "trialing→active": "subscription.activated",
  "trialing→expired": "subscription.expired",
  "active→past_due": "subscription.payment_failed",
  "active→grace_period": "subscription.grace_period_started",
  "active→paused": "subscription.paused",
  "active→suspended": "subscription.suspended",
  "active→scheduled_cancellation": "subscription.cancellation_scheduled",
  "active→cancelled": "subscription.cancelled",
  "paused→active": "subscription.resumed",
  "suspended→active": "subscription.reactivated",
  "scheduled_cancellation→active": "subscription.cancellation_reversed",
  "scheduled_cancellation→cancelled": "subscription.cancelled",
  "cancelled→active": "subscription.reactivated",
  "expired→active": "subscription.renewed",
  "trialing→cancelled": "subscription.cancelled",
  "paused→cancelled": "subscription.cancelled",
  "suspended→cancelled": "subscription.cancelled",
  "past_due→active": "subscription.activated",
  "grace_period→active": "subscription.activated",
  "grace_period→suspended": "subscription.suspended",
  "past_due→grace_period": "subscription.grace_period_started",
  "past_due→suspended": "subscription.suspended",
};

export class SubscriptionStateMachine {
  static canTransition(from: SubscriptionStatus, to: SubscriptionStatus): boolean {
    return TRANSITIONS[from]?.includes(to) ?? false;
  }

  static assertTransition(from: SubscriptionStatus, to: SubscriptionStatus): void {
    if (!this.canTransition(from, to)) {
      throw new InvalidSubscriptionTransitionError(from, to);
    }
  }

  static eventTypeForTransition(
    from: SubscriptionStatus,
    to: SubscriptionStatus
  ): string {
    return EVENT_BY_TRANSITION[`${from}→${to}`] ?? "subscription.status_changed";
  }

  static isAccessGranting(status: SubscriptionStatus): boolean {
    return ["trialing", "active", "grace_period", "scheduled_cancellation"].includes(status);
  }
}
