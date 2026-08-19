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

describe("BOS-6 Profit Intelligence", () => {
  it("reuses Platform AI Director and forbids autonomous profit actions", () => {
    expect(implementsOwnAiStack).toBe(false);
    const bos = createBusinessOS({} as never, createPlatformKernel({} as never));
    expect(bos.status.snapshot().phase).toBe("BOS-6");
    expect(bos.profitIntelligence).toBeDefined();
    expect(bos.capabilities.isImplemented("profit_intelligence")).toBe(true);
    expect(bos.capabilities.isImplemented("work_operations")).toBe(false);
    expect(() => bos.profitIntelligence.repriceAutonomously()).toThrow("autonomous_reprice_forbidden");
    expect(() => bos.profitIntelligence.terminateCustomer()).toThrow("autonomous_customer_action_forbidden");
  });

  it("registers /business/profit", () => {
    expect(
      BUSINESS_OS_RUNTIME_MANIFEST.routes?.some(
        (r) => r.path === "/business/profit" && r.title === "Profit Intelligence",
      ),
    ).toBe(true);
    const page = readFileSync(resolve(ROOT, "apps/web/src/app/(platform)/business/profit/page.tsx"), "utf8");
    expect(page).toContain("Profit Intelligence");
    expect(page).toContain("not a general ledger");
    expect(page).toContain("no autonomous repricing");
    expect(page).not.toMatch(/payroll costing|transfer pricing/i);
  });

  it("adds profit fact tables without a ledger or cost-accounting subsystem", () => {
    const migration = resolve(
      ROOT,
      "supabase/migrations/20260819110000_batch_102_business_os_profit_intelligence.sql",
    );
    expect(existsSync(migration)).toBe(true);
    const sql = readFileSync(migration, "utf8");
    expect(sql).toContain("business_os_profit_facts");
    expect(sql).toContain("ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("FORCE ROW LEVEL SECURITY");
    expect(sql.toLowerCase()).not.toContain("create table if not exists general_ledger");
    expect(sql.toLowerCase()).not.toContain("create table if not exists payroll");
  });
});
