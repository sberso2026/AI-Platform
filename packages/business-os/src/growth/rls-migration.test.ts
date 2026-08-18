import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const MIGRATION = resolve(
  import.meta.dirname,
  "../../../../supabase/migrations/20260818130000_batch_99_business_os_growth_intelligence.sql",
);

describe("BOS-3 growth migration", () => {
  const sql = readFileSync(MIGRATION, "utf8");

  it("creates lead, opportunity, and market tables with RLS and no CRM execution tables", () => {
    for (const table of [
      "business_os_growth_leads",
      "business_os_growth_opportunities",
      "business_os_growth_market_segments",
      "business_os_growth_settings",
    ]) {
      expect(sql).toContain(`CREATE TABLE IF NOT EXISTS ${table}`);
    }
    expect(sql).toContain("estimated_value_minor bigint");
    expect(sql).toContain("probability_bps integer");
    expect(sql).toContain("ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("FORCE ROW LEVEL SECURITY");
    expect(sql).toContain("get_user_tenant_ids()");
    expect(sql).toContain("workspace_memberships");
    expect(sql).toContain("suppressed boolean");
    expect(sql).toContain("deleted_at timestamptz");
    expect(sql.toLowerCase()).not.toContain("create table if not exists campaigns");
    expect(sql.toLowerCase()).not.toContain("create table if not exists emails");
    expect(sql.toLowerCase()).not.toContain("create table if not exists proposals");
  });
});
