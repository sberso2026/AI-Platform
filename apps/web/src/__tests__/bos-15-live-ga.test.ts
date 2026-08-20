import { describe, expect, it } from "vitest";
import {
  BOS15F_STATUS,
  BOS_15_BROWSER_ROUTES,
  BUSINESS_OS_PHASE,
  bos15EnvironmentPreflight,
  bosBrowserE2eCertified,
  bosProductionEligible,
  createBusinessOS,
} from "@rtb/business-os";
import { createPlatformKernel } from "@rtb/platform-kernel";
import type { SupabaseClient } from "@rtb/database";
import { resolveEntitlementTarget } from "../lib/commerce/guards";

describe("BOS-15 live GA web wiring", () => {
  it("keeps Business OS entitlement mapping and BOS-15 phase", () => {
    expect(BUSINESS_OS_PHASE).toBe("BOS-15");
    expect(bosProductionEligible).toBe(false);
    for (const route of BOS_15_BROWSER_ROUTES) {
      expect(resolveEntitlementTarget(route)).toEqual({
        productKey: "business-os",
        featureKey: "business_os",
      });
    }
    const bos = createBusinessOS({} as SupabaseClient, createPlatformKernel({} as SupabaseClient));
    expect(bos.capabilities.list()).toHaveLength(18);
  });

  it("does not claim browser E2E certification from static wiring tests", () => {
    expect(BOS15F_STATUS).toBe("BOS15F_BLOCKED_BROWSER_ENV");
    expect(bosBrowserE2eCertified).toBe(false);
    const preflight = bos15EnvironmentPreflight();
    expect(preflight.browser.available).toBe(false);
    expect(preflight.browser.executed).toBe(false);
    expect(preflight.browser.classification).toBe("BLOCKED_ENV");
  });
});
