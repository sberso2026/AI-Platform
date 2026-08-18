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

  it("keeps catalog identity coming_soon while wiring the OS factory", () => {
    const catalog = OPERATING_SYSTEMS.find((os) => os.id === "business");
    expect(catalog?.status).toBe("coming_soon");
    expect(BUSINESS_OS_RUNTIME_MANIFEST.id).toBe("business");
    expect(implementsOwnAiStack).toBe(false);
    const kernel = createPlatformKernel({} as SupabaseClient);
    const bos = createBusinessOS({} as SupabaseClient, kernel);
    expect(bos.status.snapshot().foundationState).toBe("preview");
    expect(bos.status.snapshot().catalogStatus).toBe("coming_soon");
  });
});
