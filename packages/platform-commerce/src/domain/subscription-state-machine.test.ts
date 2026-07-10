import { describe, expect, it } from "vitest";
import { SubscriptionStateMachine } from "./subscription-state-machine";
import type { SubscriptionStatus } from "@rtb/types";
import { InvalidSubscriptionTransitionError } from "./errors";

const ALLOWED: Array<[SubscriptionStatus, SubscriptionStatus]> = [
  ["draft", "pending_activation"],
  ["pending_activation", "trialing"],
  ["pending_activation", "active"],
  ["pending_activation", "cancelled"],
  ["trialing", "active"],
  ["trialing", "expired"],
  ["trialing", "cancelled"],
  ["active", "past_due"],
  ["active", "paused"],
  ["active", "suspended"],
  ["active", "scheduled_cancellation"],
  ["active", "cancelled"],
  ["past_due", "active"],
  ["past_due", "grace_period"],
  ["past_due", "suspended"],
  ["grace_period", "active"],
  ["grace_period", "suspended"],
  ["paused", "active"],
  ["paused", "cancelled"],
  ["suspended", "active"],
  ["suspended", "cancelled"],
  ["scheduled_cancellation", "active"],
  ["scheduled_cancellation", "cancelled"],
  ["cancelled", "active"],
  ["expired", "active"],
];

describe("SubscriptionStateMachine", () => {
  it.each(ALLOWED)("allows %s → %s", (from, to) => {
    expect(SubscriptionStateMachine.canTransition(from, to)).toBe(true);
    expect(() => SubscriptionStateMachine.assertTransition(from, to)).not.toThrow();
  });

  it("denies arbitrary transitions", () => {
    expect(SubscriptionStateMachine.canTransition("draft", "active")).toBe(false);
    expect(SubscriptionStateMachine.canTransition("cancelled", "trialing")).toBe(false);
    expect(() => SubscriptionStateMachine.assertTransition("draft", "active")).toThrow(
      InvalidSubscriptionTransitionError
    );
  });

  it("identifies access-granting statuses", () => {
    expect(SubscriptionStateMachine.isAccessGranting("active")).toBe(true);
    expect(SubscriptionStateMachine.isAccessGranting("trialing")).toBe(true);
    expect(SubscriptionStateMachine.isAccessGranting("suspended")).toBe(false);
  });
});
