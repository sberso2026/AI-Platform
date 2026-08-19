import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const MIGRATION = resolve(
  import.meta.dirname,
  "../../../../supabase/migrations/20260819100000_batch_101_business_os_customer_intelligence.sql",
);

describe("BOS-5 customer migration", () => {
  const sql = readFileSync(MIGRATION, "utf8");

  it("creates customer, contact, link, and fact tables with RLS and no CRM execution", () => {
    for (const table of [
      "business_os_customers",
      "business_os_customer_contacts",
      "business_os_customer_links",
      "business_os_customer_financial_facts",
      "business_os_customer_settings",
    ]) {
      expect(sql).toContain(`CREATE TABLE IF NOT EXISTS ${table}`);
    }
    expect(sql).toContain("revenue_minor bigint");
    expect(sql).toContain("gross_contribution_minor bigint");
    expect(sql).toContain("ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("FORCE ROW LEVEL SECURITY");
    expect(sql).toContain("get_user_tenant_ids()");
    expect(sql).toContain("workspace_memberships");
    expect(sql).toContain("suppressed boolean");
    expect(sql.toLowerCase()).not.toContain("create table if not exists campaigns");
    expect(sql.toLowerCase()).not.toContain("create table if not exists emails");
    expect(sql.toLowerCase()).not.toContain("create table if not exists crm_sync");
    expect(sql.toLowerCase()).not.toContain("create table if not exists credit_scores");
    expect(sql.toLowerCase()).not.toContain("create table if not exists outbound_messages");
  });
});
