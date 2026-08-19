import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const MIGRATION = resolve(
  import.meta.dirname,
  "../../../../supabase/migrations/20260819120000_batch_103_business_os_work_operations.sql",
);

describe("BOS-7 work operations migration", () => {
  const sql = readFileSync(MIGRATION, "utf8");

  it("creates bounded work, milestone, cost, and capacity tables with RLS", () => {
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS business_os_work_items");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS business_os_work_milestones");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS business_os_work_action_links");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS business_os_work_cost_facts");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS business_os_work_capacity_facts");
    expect(sql).toContain("amount_minor bigint");
    expect(sql).toContain("available_hours_minor bigint");
    expect(sql).toContain("ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("FORCE ROW LEVEL SECURITY");
    expect(sql).toContain("get_user_tenant_ids()");
    expect(sql).toContain("workspace_memberships");
    expect(sql).toContain("operations_fact");
    expect(sql.toLowerCase()).not.toContain("create table if not exists payroll");
    expect(sql.toLowerCase()).not.toContain("create table if not exists timesheets");
    expect(sql.toLowerCase()).not.toContain("create table if not exists inventory");
    expect(sql.toLowerCase()).not.toContain("create table if not exists engineering_projects");
    expect(sql.toLowerCase()).not.toContain("cpm");
    expect(sql.toLowerCase()).not.toContain("pert");
  });
});
