import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createBusinessOS, implementsOwnAiStack } from "@rtb/business-os";
import { createPlatformKernel } from "@rtb/platform-kernel";
import type { SupabaseClient } from "@rtb/database";
import { resolveEntitlementTarget } from "../lib/commerce/guards";

const API_ROOT = path.resolve(__dirname, "../app/api/business");

describe("BOS-4 Revenue Execution web wiring", () => {
  it("maps /business/revenue to business-os / business_os", () => {
    expect(resolveEntitlementTarget("/business/revenue")).toEqual({
      productKey: "business-os",
      featureKey: "business_os",
    });
  });

  it("does not implement a second AI stack or external send", () => {
    expect(implementsOwnAiStack).toBe(false);
    const bos = createBusinessOS({} as SupabaseClient, createPlatformKernel({} as SupabaseClient));
    expect(bos.revenueExecution).toBeDefined();
    const src = fs.readFileSync(path.join(API_ROOT, "revenue", "route.ts"), "utf8");
    expect(src).toContain("business_os.revenue_execution.view");
    expect(src).toContain("business_os.revenue_execution.manage");
    expect(src).not.toMatch(/salesforce|hubspot|sendMail|smtp|linkedin/i);
    const send = fs.readFileSync(path.join(API_ROOT, "revenue", "send", "route.ts"), "utf8");
    expect(send).toContain("external_send_forbidden");
    expect(send).toContain("status: 403");
  });

  it("keeps nested reads on view and approvals on approve", () => {
    for (const nested of ["engagements", "drafts", "proposals", "requirements", "pricing"]) {
      const src = fs.readFileSync(path.join(API_ROOT, "revenue", nested, "route.ts"), "utf8");
      expect(src).toContain("business_os.revenue_execution.view");
    }
    expect(fs.readFileSync(path.join(API_ROOT, "revenue", "evaluate", "route.ts"), "utf8")).toContain(
      "business_os.revenue_execution.view",
    );
    expect(fs.readFileSync(path.join(API_ROOT, "revenue", "prepare", "route.ts"), "utf8")).toContain(
      "business_os.revenue_execution.manage",
    );
    expect(fs.readFileSync(path.join(API_ROOT, "revenue", "demo", "route.ts"), "utf8")).toContain(
      "business_os.revenue_execution.manage",
    );
    expect(fs.readFileSync(path.join(API_ROOT, "revenue", "approve", "route.ts"), "utf8")).toContain(
      "business_os.revenue_execution.approve",
    );
  });

  it("renders owner-focused revenue sections rather than a mailbox or CRM", () => {
    const page = fs.readFileSync(
      path.resolve(__dirname, "../app/(platform)/business/revenue/page.tsx"),
      "utf8",
    );
    for (const testId of [
      "bos-revenue-summary",
      "bos-revenue-workbench",
      "bos-revenue-engagement",
      "bos-revenue-proposals",
      "bos-revenue-pricing",
      "bos-revenue-attention",
      "bos-revenue-agent",
    ]) {
      expect(page).toContain(testId);
    }
    expect(page).not.toMatch(/sequence cadences|mailbox|dialer/i);
  });
});
