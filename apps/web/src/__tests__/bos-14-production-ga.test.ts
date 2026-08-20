import { describe, expect, it } from "vitest";
import {
  BOS14C_STATUS,
  BOS_14_BROWSER_ROUTES,
  BUSINESS_OS_PHASE,
  bosBrowserE2eCertified,
  bosProductionEligible,
  createBusinessOS,
} from "@rtb/business-os";
import { createPlatformKernel } from "@rtb/platform-kernel";
import type { SupabaseClient } from "@rtb/database";
import { resolveEntitlementTarget } from "../lib/commerce/guards";

describe("BOS-14 production GA web wiring", () => {
  it("keeps Business OS entitlement mapping and BOS-14 phase", () => {
    expect(BUSINESS_OS_PHASE).toBe("BOS-14");
    expect(bosProductionEligible).toBe(false);
    for (const route of BOS_14_BROWSER_ROUTES) {
      expect(resolveEntitlementTarget(route)).toEqual({
        productKey: "business-os",
        featureKey: "business_os",
      });
    }
    const bos = createBusinessOS({} as SupabaseClient, createPlatformKernel({} as SupabaseClient));
    expect(bos.capabilities.list()).toHaveLength(18);
  });

  it("does not claim browser E2E certification from static wiring tests", () => {
    expect(BOS14C_STATUS).toBe("BOS14C_BLOCKED_BROWSER_ENV");
    expect(bosBrowserE2eCertified).toBe(false);
  });
});
