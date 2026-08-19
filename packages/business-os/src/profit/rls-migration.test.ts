import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const MIGRATION = resolve(
  import.meta.dirname,
  "../../../../supabase/migrations/20260819110000_batch_102_business_os_profit_intelligence.sql",
);

describe("BOS-6 profit migration", () => {
  const sql = readFileSync(MIGRATION, "utf8");

  it("creates bounded profit facts with RLS and no ledger or cost-accounting subsystem", () => {
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS business_os_profit_facts");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS business_os_profit_settings");
    expect(sql).toContain("revenue_minor bigint");
    expect(sql).toContain("direct_cost_minor bigint");
    expect(sql).toContain("allocated_cost_minor bigint");
    expect(sql).toContain("contribution_minor bigint");
    expect(sql).toContain("ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("FORCE ROW LEVEL SECURITY");
    expect(sql).toContain("get_user_tenant_ids()");
    expect(sql).toContain("workspace_memberships");
    expect(sql.toLowerCase()).not.toContain("create table if not exists general_ledger");
    expect(sql.toLowerCase()).not.toContain("create table if not exists chart_of_accounts");
    expect(sql.toLowerCase()).not.toContain("create table if not exists payroll");
    expect(sql.toLowerCase()).not.toContain("create table if not exists inventory");
    expect(sql.toLowerCase()).not.toContain("create table if not exists transfer_pricing");
  });
});
