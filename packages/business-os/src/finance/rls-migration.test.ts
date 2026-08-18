import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const MIGRATION = resolve(
  import.meta.dirname,
  "../../../../supabase/migrations/20260818120000_batch_98_business_os_financial_intelligence.sql",
);

describe("BOS-2 finance migration", () => {
  const sql = readFileSync(MIGRATION, "utf8");

  it("creates vendor-neutral finance tables with bigint minor units and RLS", () => {
    for (const table of [
      "business_os_finance_periods",
      "business_os_finance_snapshots",
      "business_os_finance_receivable_snapshots",
      "business_os_finance_settings",
    ]) {
      expect(sql).toContain(`CREATE TABLE IF NOT EXISTS ${table}`);
    }
    expect(sql).toContain("revenue_minor bigint");
    expect(sql).toContain("ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("FORCE ROW LEVEL SECURITY");
    expect(sql).toContain("get_user_tenant_ids()");
    expect(sql).toContain("workspace_memberships");
    expect(sql.toLowerCase()).not.toContain("create table if not exists invoices");
    expect(sql.toLowerCase()).not.toContain("create table if not exists journal");
    expect(sql.toLowerCase()).not.toContain("create table if not exists ledger");
    expect(sql.toLowerCase()).not.toContain("create table if not exists chart_of_accounts");
  });
});
