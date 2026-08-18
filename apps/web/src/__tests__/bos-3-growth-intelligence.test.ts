import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createBusinessOS, implementsOwnAiStack } from "@rtb/business-os";
import { createPlatformKernel } from "@rtb/platform-kernel";
import type { SupabaseClient } from "@rtb/database";
import { resolveEntitlementTarget } from "../lib/commerce/guards";

const API_ROOT = path.resolve(__dirname, "../app/api/business");

describe("BOS-3 Growth Intelligence web wiring", () => {
  it("maps /business/growth to business-os / business_os", () => {
    expect(resolveEntitlementTarget("/business/growth")).toEqual({
      productKey: "business-os",
      featureKey: "business_os",
    });
  });

  it("does not implement a second AI stack or external CRM/outreach writes", () => {
    expect(implementsOwnAiStack).toBe(false);
    const bos = createBusinessOS({} as SupabaseClient, createPlatformKernel({} as SupabaseClient));
    expect(bos.growthIntelligence).toBeDefined();
    const src = fs.readFileSync(path.join(API_ROOT, "growth", "route.ts"), "utf8");
    expect(src).toContain("business_os.growth_intelligence.view");
    expect(src).toContain("business_os.growth_intelligence.manage");
    expect(src).not.toMatch(/salesforce|hubspot|sendMail|smtp|linkedin/i);
    expect(src).not.toContain("export const DELETE");
  });

  it("keeps nested growth reads on the view permission", () => {
    for (const nested of ["leads", "opportunities", "pipeline", "market"]) {
      const src = fs.readFileSync(path.join(API_ROOT, "growth", nested, "route.ts"), "utf8");
      expect(src).toContain("business_os.growth_intelligence.view");
    }
    expect(fs.readFileSync(path.join(API_ROOT, "growth", "score", "route.ts"), "utf8")).toContain(
      "business_os.growth_intelligence.view",
    );
    expect(fs.readFileSync(path.join(API_ROOT, "growth", "qualification", "route.ts"), "utf8")).toContain(
      "business_os.growth_intelligence.manage",
    );
    expect(fs.readFileSync(path.join(API_ROOT, "growth", "demo", "route.ts"), "utf8")).toContain(
      "business_os.growth_intelligence.manage",
    );
  });

  it("renders owner-focused growth sections rather than a CRM", () => {
    const page = fs.readFileSync(
      path.resolve(__dirname, "../app/(platform)/business/growth/page.tsx"),
      "utf8",
    );
    for (const testId of [
      "bos-growth-summary",
      "bos-growth-leads",
      "bos-growth-opportunities",
      "bos-growth-attention",
      "bos-growth-market",
      "bos-growth-quality",
    ]) {
      expect(page).toContain(testId);
    }
    expect(page).not.toMatch(/sequence cadences|mailbox|dialer/i);
  });
});
