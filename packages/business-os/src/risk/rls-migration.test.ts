import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const MIGRATION = resolve(
  import.meta.dirname,
  "../../../../supabase/migrations/20260819140000_batch_105_business_os_business_risk.sql",
);

describe("BOS-9 business risk migration", () => {
  const sql = readFileSync(MIGRATION, "utf8");

  it("creates canonical risk entities with RLS ENABLE + FORCE", () => {
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS business_os_risks");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS business_os_risk_assessments");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS business_os_risk_controls");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS business_os_risk_control_links");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS business_os_risk_treatments");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS business_os_risk_action_links");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS business_os_risk_obligations");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS business_os_risk_incidents");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS business_os_risk_evidence");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS business_os_risk_settings");
    expect(sql).toContain("REFERENCES business_os_actions(id)");
    expect(sql).toContain("ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("FORCE ROW LEVEL SECURITY");
    expect(sql).toContain("get_user_tenant_ids()");
    expect(sql).toContain("workspace_memberships");
    expect(sql).toContain("'risk'");
    expect(sql.toLowerCase()).not.toContain("create table if not exists business_os_tasks");
    expect(sql.toLowerCase()).not.toContain("autonomous_risk_acceptance");
    expect(sql.toLowerCase()).not.toContain("regulator");
    expect(sql.toLowerCase()).not.toContain("create table if not exists knowledge_graph");
  });
});
