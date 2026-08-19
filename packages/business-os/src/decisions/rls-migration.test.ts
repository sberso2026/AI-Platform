import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const MIGRATION = resolve(
  import.meta.dirname,
  "../../../../supabase/migrations/20260819130000_batch_104_business_os_decision_action.sql",
);

describe("BOS-8 decision action migration", () => {
  const sql = readFileSync(MIGRATION, "utf8");

  it("extends existing decisions with supporting entities and RLS", () => {
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS business_os_decision_contexts");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS business_os_decision_evidence");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS business_os_decision_options");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS business_os_decision_impacts");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS business_os_decision_outcomes");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS business_os_decision_lessons");
    expect(sql).toContain("REFERENCES business_os_decisions(id)");
    expect(sql).toContain("ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("FORCE ROW LEVEL SECURITY");
    expect(sql).toContain("get_user_tenant_ids()");
    expect(sql).toContain("workspace_memberships");
    expect(sql).toContain("'decision'");
    expect(sql.toLowerCase()).not.toContain("create table if not exists business_os_tasks");
    expect(sql.toLowerCase()).not.toContain("create table if not exists business_os_decisions (");
    expect(sql.toLowerCase()).not.toContain("autonomous_approval");
    expect(sql.toLowerCase()).not.toContain("create table if not exists knowledge_graph");
  });
});
