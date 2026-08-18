import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createBusinessOS, implementsOwnAiStack } from "@rtb/business-os";
import { createPlatformKernel } from "@rtb/platform-kernel";
import type { SupabaseClient } from "@rtb/database";
import { resolveEntitlementTarget } from "../lib/commerce/guards";

const API_ROOT = path.resolve(__dirname, "../app/api/business");

describe("BOS-2 Financial Intelligence web wiring", () => {
  it("maps /business/finance to business-os / business_os", () => {
    expect(resolveEntitlementTarget("/business/finance")).toEqual({
      productKey: "business-os",
      featureKey: "business_os",
    });
  });

  it("does not implement a second AI stack or external accounting writes", () => {
    expect(implementsOwnAiStack).toBe(false);
    const bos = createBusinessOS({} as SupabaseClient, createPlatformKernel({} as SupabaseClient));
    expect(bos.financialIntelligence).toBeDefined();
    const src = fs.readFileSync(path.join(API_ROOT, "finance", "route.ts"), "utf8");
    expect(src).toContain("business_os.financial_intelligence.view");
    expect(src).toContain("business_os.financial_intelligence.manage");
    expect(src).not.toMatch(/xero|quickbooks|myob|stripe|sendMail/i);
    expect(src).not.toContain("export const DELETE");
  });

  it("keeps nested finance reads on the view permission", () => {
    for (const nested of ["periods", "receivables", "trends", "forecast", "health"]) {
      const src = fs.readFileSync(path.join(API_ROOT, "finance", nested, "route.ts"), "utf8");
      expect(src).toContain("business_os.financial_intelligence.view");
    }
    const demo = fs.readFileSync(path.join(API_ROOT, "finance", "demo", "route.ts"), "utf8");
    expect(demo).toContain("business_os.financial_intelligence.manage");
  });

  it("renders owner-focused finance sections rather than a ledger", () => {
    const page = fs.readFileSync(
      path.resolve(__dirname, "../app/(platform)/business/finance/page.tsx"),
      "utf8",
    );
    for (const testId of [
      "bos-finance-summary",
      "bos-finance-trend",
      "bos-finance-cash",
      "bos-finance-receivables",
      "bos-finance-budget",
      "bos-finance-attention",
      "bos-finance-quality",
    ]) {
      expect(page).toContain(testId);
    }
    expect(page).not.toMatch(/general ledger|journal posting|chart of accounts/i);
  });
});
