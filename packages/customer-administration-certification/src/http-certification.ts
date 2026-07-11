import { describe, it, expect } from "vitest";
import { canAccessPlatformRoute, MY_ACCOUNT_ROUTE, resolveNavTier } from "@rtb/platform-core";

describe("Phase 4 — Gate D HTTP authorization matrix (unit)", () => {
  it("viewer cannot access installed products", () => {
    expect(
      canAccessPlatformRoute("/system/products", {
        roleSlug: "viewer",
        tier: resolveNavTier("viewer"),
      })
    ).toBe(false);
  });

  it("engineer can access my account", () => {
    expect(
      canAccessPlatformRoute(MY_ACCOUNT_ROUTE, {
        roleSlug: "member",
        tier: resolveNavTier("member"),
      })
    ).toBe(true);
  });

  it("admin cannot access owner subscription billing", () => {
    expect(
      canAccessPlatformRoute("/system/subscription-billing", {
        roleSlug: "admin",
        tier: resolveNavTier("admin"),
      })
    ).toBe(false);
  });

  it("owner can access growth credits", () => {
    expect(
      canAccessPlatformRoute("/system/growth-credits", {
        roleSlug: "owner",
        tier: resolveNavTier("owner"),
      })
    ).toBe(true);
  });
});
