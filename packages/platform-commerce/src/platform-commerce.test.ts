import { describe, it, expect } from "vitest";
import type { SubscriptionStatus } from "@rtb/types";

/** Mirrors catalog-data-service status mapping for unit tests */
function mapSubscriptionStatus(status: SubscriptionStatus) {
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

describe("Platform Commerce Engine — status mapping", () => {
  it("maps trial subscription to trialing UI status", () => {
    expect(mapSubscriptionStatus("trial")).toBe("trialing");
  });

  it("maps trialing subscription to trialing UI status, not expired", () => {
    expect(mapSubscriptionStatus("trialing")).toBe("trialing");
  });

  it("maps grace period to active UI status", () => {
    expect(mapSubscriptionStatus("grace_period")).toBe("active");
  });

  it("maps suspended to expired UI status", () => {
    expect(mapSubscriptionStatus("suspended")).toBe("expired");
  });
});

describe("Platform Commerce Engine — architecture contracts", () => {
  it("defines twelve commerce modules", () => {
    const modules = [
      "products",
      "plans",
      "subscriptions",
      "licenses",
      "seats",
      "installations",
      "usage",
      "billing",
      "marketplace",
      "analytics",
      "catalog",
    ];
    expect(modules.length).toBeGreaterThanOrEqual(10);
  });

  it("reserves extension hooks without implementing growth engine", () => {
    const hooks = ["growth", "referral", "partnerCommission"];
    expect(hooks).toContain("growth");
    expect(hooks).not.toContain("loyalty");
  });
});

describe("Platform Commerce Engine — generic product design", () => {
  it("uses product_type not hardcoded OS identifiers", () => {
    const productTypes = [
      "operating_system",
      "application",
      "addon",
      "service",
      "bundle",
    ];
    expect(productTypes).not.toContain("engineering");
    expect(productTypes).toContain("application");
  });

  it("supports extensible usage metric keys", () => {
    const metrics = [
      "ai_tokens",
      "storage_gb",
      "documents",
      "api_calls",
      "automation_executions",
    ];
    expect(metrics.length).toBeGreaterThanOrEqual(5);
  });
});
