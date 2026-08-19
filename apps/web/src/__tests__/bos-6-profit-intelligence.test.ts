import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createBusinessOS, implementsOwnAiStack } from "@rtb/business-os";
import { createPlatformKernel } from "@rtb/platform-kernel";
import type { SupabaseClient } from "@rtb/database";
import { resolveEntitlementTarget } from "../lib/commerce/guards";

const API_ROOT = path.resolve(__dirname, "../app/api/business");

describe("BOS-6 Profit Intelligence web wiring", () => {
  it("maps /business/profit to business-os / business_os", () => {
    expect(resolveEntitlementTarget("/business/profit")).toEqual({
      productKey: "business-os",
      featureKey: "business_os",
    });
  });

  it("does not implement a second AI stack or autonomous reprice path", () => {
    expect(implementsOwnAiStack).toBe(false);
    const bos = createBusinessOS({} as SupabaseClient, createPlatformKernel({} as SupabaseClient));
    expect(bos.profitIntelligence).toBeDefined();
    expect(() => bos.profitIntelligence.repriceAutonomously()).toThrow("autonomous_reprice_forbidden");
    const src = fs.readFileSync(path.join(API_ROOT, "profit", "route.ts"), "utf8");
    expect(src).toContain("business_os.profit_intelligence.view");
    expect(src).toContain("business_os.profit_intelligence.manage");
    expect(src).not.toMatch(/payroll costing|transfer pricing|chart_of_accounts/i);
    expect(fs.existsSync(path.join(API_ROOT, "profit", "reprice", "route.ts"))).toBe(false);
    expect(fs.existsSync(path.join(API_ROOT, "profit", "ledger", "route.ts"))).toBe(false);
  });

  it("keeps nested reads on view and demo ingestion on manage", () => {
    for (const nested of ["facts", "ranking", "leakage", "trends", "data-coverage", "customers"]) {
      const file = fs.readFileSync(path.join(API_ROOT, "profit", nested, "route.ts"), "utf8");
      expect(file).toContain("business_os.profit_intelligence.view");
    }
    expect(fs.readFileSync(path.join(API_ROOT, "profit", "demo", "route.ts"), "utf8")).toContain(
      "business_os.profit_intelligence.manage",
    );
  });

  it("renders owner-focused profit sections rather than a ledger", () => {
    const page = fs.readFileSync(
      path.resolve(__dirname, "../app/(platform)/business/profit/page.tsx"),
      "utf8",
    );
    for (const testId of [
      "bos-profit-summary",
      "bos-profit-ranking",
      "bos-profit-leakage",
      "bos-profit-trends",
      "bos-profit-coverage",
      "bos-profit-attention",
    ]) {
      expect(page).toContain(testId);
    }
    expect(page).toContain("not a general ledger");
    expect(page).toContain("proposed is not realized");
    expect(page).toContain("no autonomous repricing");
    expect(page).not.toMatch(/payroll costing|transfer pricing|reprice this customer/i);
  });
});
