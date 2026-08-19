import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createBusinessOS, implementsOwnAiStack } from "@rtb/business-os";
import { createPlatformKernel } from "@rtb/platform-kernel";
import type { SupabaseClient } from "@rtb/database";
import { resolveEntitlementTarget } from "../lib/commerce/guards";

const API_ROOT = path.resolve(__dirname, "../app/api/business");

describe("BOS-5 Customer Intelligence web wiring", () => {
  it("maps /business/customers to business-os / business_os", () => {
    expect(resolveEntitlementTarget("/business/customers")).toEqual({
      productKey: "business-os",
      featureKey: "business_os",
    });
  });

  it("does not implement a second AI stack or external CRM write", () => {
    expect(implementsOwnAiStack).toBe(false);
    const bos = createBusinessOS({} as SupabaseClient, createPlatformKernel({} as SupabaseClient));
    expect(bos.customerIntelligence).toBeDefined();
    const src = fs.readFileSync(path.join(API_ROOT, "customers", "route.ts"), "utf8");
    expect(src).toContain("business_os.customer_intelligence.view");
    expect(src).toContain("business_os.customer_intelligence.manage");
    expect(src).not.toMatch(/salesforce|hubspot|sendMail|smtp|mailchimp/i);
    expect(fs.existsSync(path.join(API_ROOT, "customers", "send", "route.ts"))).toBe(false);
    expect(fs.existsSync(path.join(API_ROOT, "customers", "crm", "route.ts"))).toBe(false);
  });

  it("keeps nested reads on view and conversion/demo on manage", () => {
    for (const nested of ["detail", "contacts", "facts", "health", "concentration"]) {
      const file = fs.readFileSync(path.join(API_ROOT, "customers", nested, "route.ts"), "utf8");
      expect(file).toContain("business_os.customer_intelligence.view");
    }
    expect(fs.readFileSync(path.join(API_ROOT, "customers", "convert", "route.ts"), "utf8")).toContain(
      "business_os.customer_intelligence.manage",
    );
    expect(fs.readFileSync(path.join(API_ROOT, "customers", "demo", "route.ts"), "utf8")).toContain(
      "business_os.customer_intelligence.manage",
    );
  });

  it("renders owner-focused customer sections rather than a CRM or mailbox", () => {
    const page = fs.readFileSync(
      path.resolve(__dirname, "../app/(platform)/business/customers/page.tsx"),
      "utf8",
    );
    for (const testId of [
      "bos-customers-summary",
      "bos-customers-list",
      "bos-customers-attention",
      "bos-customers-quality",
    ]) {
      expect(page).toContain(testId);
    }
    const detail = fs.readFileSync(
      path.resolve(__dirname, "../app/(platform)/business/customers/[id]/page.tsx"),
      "utf8",
    );
    for (const testId of [
      "bos-customer-360",
      "bos-customer-overview",
      "bos-customer-commercial",
      "bos-customer-financial",
      "bos-customer-opportunities",
      "bos-customer-proposals",
      "bos-customer-relationship",
      "bos-customer-risks",
      "bos-customer-recommendations",
      "bos-customer-evidence",
    ]) {
      expect(detail).toContain(testId);
    }
    expect(page).not.toMatch(/sequence cadences|mailbox|dialer|predicted churn/i);
    expect(detail.toLowerCase()).toContain("retention");
    expect(detail.toLowerCase()).toContain("not churn probability");
  });
});
