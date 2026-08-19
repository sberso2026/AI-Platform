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

describe("BOS-2 Financial Intelligence", () => {
  it("reuses Platform AI Director and does not create a ledger", () => {
    expect(implementsOwnAiStack).toBe(false);
    const bos = createBusinessOS({} as never, createPlatformKernel({} as never));
    expect(bos.status.snapshot().phase).toBe("BOS-11");
    expect(bos.financialIntelligence).toBeDefined();
    expect(bos.capabilities.isImplemented("financial_intelligence")).toBe(true);
    expect(bos.capabilities.isImplemented("growth_intelligence")).toBe(true);
    expect(bos.capabilities.isImplemented("revenue_execution")).toBe(true);
    expect(bos.capabilities.isImplemented("customer_intelligence")).toBe(true);
  });

  it("registers /business/finance", () => {
    expect(
      BUSINESS_OS_RUNTIME_MANIFEST.routes?.some(
        (r) => r.path === "/business/finance" && r.title === "Financial Intelligence",
      ),
    ).toBe(true);
    const page = readFileSync(resolve(ROOT, "apps/web/src/app/(platform)/business/finance/page.tsx"), "utf8");
    expect(page).toContain("Financial Intelligence");
    expect(page).not.toMatch(/general ledger|journal posting/i);
  });

  it("adds finance snapshots without invoices or a ledger", () => {
    const migration = resolve(
      ROOT,
      "supabase/migrations/20260818120000_batch_98_business_os_financial_intelligence.sql",
    );
    expect(existsSync(migration)).toBe(true);
    const sql = readFileSync(migration, "utf8");
    expect(sql).toContain("business_os_finance_snapshots");
    expect(sql).toContain("revenue_minor bigint");
    expect(sql.toLowerCase()).not.toContain("create table if not exists invoices");
    expect(sql.toLowerCase()).not.toContain("create table if not exists journal");
  });
});
