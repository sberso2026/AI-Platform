import { describe, expect, it } from "vitest";
import { resolveEntitlementTarget } from "../lib/commerce/guards";
import {
  BUSINESS_OS_RUNTIME_MANIFEST,
  createBusinessOS,
  implementsOwnAiStack,
} from "@rtb/business-os";
import { createPlatformKernel } from "@rtb/platform-kernel";
import type { SupabaseClient } from "@rtb/database";
import { OPERATING_SYSTEMS } from "@rtb/platform-core";

describe("BOS-0 web foundation wiring", () => {
  it("maps /business routes to business-os product and business_os feature", () => {
    expect(resolveEntitlementTarget("/business")).toEqual({
      productKey: "business-os",
      featureKey: "business_os",
    });
    expect(resolveEntitlementTarget("/business/settings").productKey).toBe("business-os");
    expect(resolveEntitlementTarget("/engineering").productKey).toBe("engineering-os");
  });

  it("keeps catalog identity available after BOS Core v1.0 GA", () => {
    const catalog = OPERATING_SYSTEMS.find((os) => os.id === "business");
    expect(catalog?.status).toBe("available");
    expect(BUSINESS_OS_RUNTIME_MANIFEST.id).toBe("business");
    expect(implementsOwnAiStack).toBe(false);
    const kernel = createPlatformKernel({} as SupabaseClient);
    const bos = createBusinessOS({} as SupabaseClient, kernel);
    expect(bos.status.snapshot().foundationState).toBe("ga");
    expect(bos.status.snapshot().catalogStatus).toBe("available");
  });
});
