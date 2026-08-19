import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  BOS_13_WEB_TSC_RECONCILIATION,
  BROWSER_E2E_STATUS,
  BUSINESS_OS_PHASE,
  bosBrowserE2eCertified,
  createBusinessOS,
} from "@rtb/business-os";
import { createPlatformKernel } from "@rtb/platform-kernel";
import type { SupabaseClient } from "@rtb/database";
import { resolveEntitlementTarget } from "../lib/commerce/guards";

const ROOT = path.resolve(__dirname, "..");
const OCC = fs.readFileSync(path.join(ROOT, "src/app/(platform)/business/page.tsx"), "utf8");
const OPERATIONS = fs.readFileSync(path.join(ROOT, "src/app/(platform)/business/operations/page.tsx"), "utf8");
const OPERATIONS_DETAIL = fs.readFileSync(
  path.join(ROOT, "src/app/(platform)/business/operations/[id]/page.tsx"),
  "utf8",
);

describe("BOS-13 production validation web wiring", () => {
  it("keeps Business OS entitlement mapping and BOS-13 phase", () => {
    expect(BUSINESS_OS_PHASE).toBe("BOS-13");
    expect(resolveEntitlementTarget("/business")).toEqual({
      productKey: "business-os",
      featureKey: "business_os",
    });
    for (const route of [
      "/business/finance",
      "/business/growth",
      "/business/revenue",
      "/business/customers",
      "/business/profit",
      "/business/operations",
      "/business/decisions",
      "/business/risk",
      "/business/context",
      "/business/ai-workforce",
      "/business/integrations",
    ]) {
      expect(resolveEntitlementTarget(route)).toEqual({
        productKey: "business-os",
        featureKey: "business_os",
      });
    }
    const bos = createBusinessOS({} as SupabaseClient, createPlatformKernel({} as SupabaseClient));
    expect(bos.capabilities.list()).toHaveLength(18);
  });

  it("resolves pre-BOS-12 OCC busy state and operations StatusChip value prop", () => {
    expect(OCC).toContain("const [busy, setBusy] = useState(false);");
    expect(OCC).toContain('fetch("/api/business/command")');
    expect(OCC).toContain('fetch("/api/business/decisions/summary")');
    expect(OCC).toContain('fetch("/api/business/risk/summary")');
    expect(OCC).not.toMatch(/computeFinanceMetrics|scoreLead|evaluatePricing|computeResidual/);
    expect(OPERATIONS).toContain("<StatusChip value={row.health} />");
    expect(OPERATIONS_DETAIL).toContain("<StatusChip value={data.health.status} />");
    expect(BOS_13_WEB_TSC_RECONCILIATION.every((row) => row.status === "RESOLVED")).toBe(true);
    expect(BOS_13_WEB_TSC_RECONCILIATION.every((row) => row.classification !== "UNRELATED_BASELINE")).toBe(true);
  });

  it("does not claim browser E2E certification from static wiring tests", () => {
    expect(BROWSER_E2E_STATUS).toBe("BROWSER_E2E_NOT_CERTIFIED");
    expect(bosBrowserE2eCertified).toBe(false);
  });
});
