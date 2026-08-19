import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  BUSINESS_DEVELOPMENT_AGENT_PASSPORT,
  BUSINESS_OS_RUNTIME_MANIFEST,
  createBusinessOS,
  implementsOwnAiStack,
} from "@rtb/business-os";
import { createPlatformKernel } from "@rtb/platform-kernel";

const ROOT = resolve(import.meta.dirname, "../../..");

describe("BOS-4 Revenue Execution", () => {
  it("reuses Platform AI Director with A2 agent authority", () => {
    expect(implementsOwnAiStack).toBe(false);
    const bos = createBusinessOS({} as never, createPlatformKernel({} as never));
    expect(bos.status.snapshot().phase).toBe("BOS-5");
    expect(bos.revenueExecution).toBeDefined();
    expect(bos.capabilities.isImplemented("revenue_execution")).toBe(true);
    expect(bos.capabilities.isImplemented("customer_intelligence")).toBe(true);
    expect(BUSINESS_DEVELOPMENT_AGENT_PASSPORT.authorityMax).toBe("A2");
    expect(() => bos.revenueExecution.sendExternally()).toThrow("external_send_forbidden");
  });

  it("registers /business/revenue", () => {
    expect(
      BUSINESS_OS_RUNTIME_MANIFEST.routes?.some(
        (r) => r.path === "/business/revenue" && r.title === "Revenue Execution",
      ),
    ).toBe(true);
    const page = readFileSync(resolve(ROOT, "apps/web/src/app/(platform)/business/revenue/page.tsx"), "utf8");
    expect(page).toContain("Revenue Execution");
    expect(page).toContain("not send");
    expect(page).not.toMatch(/salesforce|hubspot|sendMail|smtp/i);
  });

  it("adds revenue tables without outbound send or payment systems", () => {
    const migration = resolve(
      ROOT,
      "supabase/migrations/20260818140000_batch_100_business_os_revenue_execution.sql",
    );
    expect(existsSync(migration)).toBe(true);
    const sql = readFileSync(migration, "utf8");
    expect(sql).toContain("business_os_revenue_proposals");
    expect(sql).toContain("business_os_revenue_pricing_scenarios");
    expect(sql.toLowerCase()).not.toContain("create table if not exists outbound_messages");
    expect(sql.toLowerCase()).not.toContain("create table if not exists payments");
  });
});
