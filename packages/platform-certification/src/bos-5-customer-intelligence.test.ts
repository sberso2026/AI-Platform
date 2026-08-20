import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  BUSINESS_OS_RUNTIME_MANIFEST,
  createBusinessOS,
  implementsOwnAiStack,
} from "@rtb/business-os";
import { createPlatformKernel } from "@rtb/platform-kernel";

const ROOT = resolve(import.meta.dirname, "../../..");

describe("BOS-5 Customer Intelligence", () => {
  it("reuses Platform AI Director and forbids CRM writes, outreach, and credit decisions", () => {
    expect(implementsOwnAiStack).toBe(false);
    const bos = createBusinessOS({} as never, createPlatformKernel({} as never));
    expect(bos.status.snapshot().phase).toBe("BOS-14");
    expect(bos.customerIntelligence).toBeDefined();
    expect(bos.capabilities.isImplemented("customer_intelligence")).toBe(true);
    expect(bos.capabilities.isImplemented("profit_intelligence")).toBe(true);
    expect(() => bos.customerIntelligence.writeExternalCrm()).toThrow("external_crm_write_forbidden");
    expect(() => bos.customerIntelligence.sendToCustomer()).toThrow("external_customer_communication_forbidden");
    expect(() => bos.customerIntelligence.makeCreditDecision()).toThrow("credit_decision_forbidden");
  });

  it("registers /business/customers", () => {
    expect(
      BUSINESS_OS_RUNTIME_MANIFEST.routes?.some(
        (r) => r.path === "/business/customers" && r.title === "Customer Intelligence",
      ),
    ).toBe(true);
    const page = readFileSync(resolve(ROOT, "apps/web/src/app/(platform)/business/customers/page.tsx"), "utf8");
    expect(page).toContain("Customer Intelligence");
    expect(page).toContain("not a CRM");
    expect(page).not.toMatch(/salesforce|hubspot|mailchimp|sendMail/i);
    expect(
      existsSync(resolve(ROOT, "apps/web/src/app/(platform)/business/customers/[id]/page.tsx")),
    ).toBe(true);
  });

  it("adds customer tables without CRM, credit, or outreach systems", () => {
    const migration = resolve(
      ROOT,
      "supabase/migrations/20260819100000_batch_101_business_os_customer_intelligence.sql",
    );
    expect(existsSync(migration)).toBe(true);
    const sql = readFileSync(migration, "utf8");
    expect(sql).toContain("business_os_customers");
    expect(sql).toContain("business_os_customer_financial_facts");
    expect(sql.toLowerCase()).not.toContain("create table if not exists campaigns");
    expect(sql.toLowerCase()).not.toContain("create table if not exists credit_scores");
  });
});
