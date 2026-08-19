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

describe("BOS-3 Growth Intelligence", () => {
  it("reuses Platform AI Director and does not execute outreach", () => {
    expect(implementsOwnAiStack).toBe(false);
    const bos = createBusinessOS({} as never, createPlatformKernel({} as never));
    expect(bos.status.snapshot().phase).toBe("BOS-9");
    expect(bos.growthIntelligence).toBeDefined();
    expect(bos.capabilities.isImplemented("growth_intelligence")).toBe(true);
    expect(bos.capabilities.isImplemented("revenue_execution")).toBe(true);
    expect(bos.capabilities.isImplemented("customer_intelligence")).toBe(true);
  });

  it("registers /business/growth", () => {
    expect(
      BUSINESS_OS_RUNTIME_MANIFEST.routes?.some(
        (r) => r.path === "/business/growth" && r.title === "Growth Intelligence",
      ),
    ).toBe(true);
    const page = readFileSync(resolve(ROOT, "apps/web/src/app/(platform)/business/growth/page.tsx"), "utf8");
    expect(page).toContain("Growth Intelligence");
    expect(page).toContain("not outreach");
    expect(page).not.toMatch(/salesforce|hubspot|sendMail/i);
  });

  it("adds growth tables without proposal or CRM write systems", () => {
    const migration = resolve(
      ROOT,
      "supabase/migrations/20260818130000_batch_99_business_os_growth_intelligence.sql",
    );
    expect(existsSync(migration)).toBe(true);
    const sql = readFileSync(migration, "utf8");
    expect(sql).toContain("business_os_growth_leads");
    expect(sql).toContain("business_os_growth_opportunities");
    expect(sql.toLowerCase()).not.toContain("create table if not exists proposals");
  });
});
