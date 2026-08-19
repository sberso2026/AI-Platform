import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const MIGRATION = resolve(
  import.meta.dirname,
  "../../../../supabase/migrations/20260819160000_batch_107_business_os_ai_workforce.sql",
);

describe("BOS-11 AI Workforce migration", () => {
  const sql = readFileSync(MIGRATION, "utf8");

  it("adds operational metadata with RLS and does not create a second agent runtime", () => {
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS business_os_workforce_installations");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS business_os_workforce_tasks");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS business_os_workforce_runs");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS business_os_workforce_approvals");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS business_os_workforce_handoffs");
    expect(sql).toContain("kernel_agent_id uuid REFERENCES agents(id)");
    expect(sql).toContain("ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("FORCE ROW LEVEL SECURITY");
    expect(sql).toContain("get_user_tenant_ids()");
    expect(sql.toLowerCase()).not.toContain("create table if not exists agents");
    expect(sql.toLowerCase()).not.toContain("create table if not exists agent_runs");
    expect(sql.toLowerCase()).not.toContain("create table if not exists ai_memories");
  });
});
