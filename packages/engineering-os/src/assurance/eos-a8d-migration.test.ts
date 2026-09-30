import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");
const MIGRATION = join(REPO_ROOT, "supabase/migrations/20260930080000_eos_a8d_assurance_governance.sql");

describe("EOS-A8D migration contract", () => {
  const sql = readFileSync(MIGRATION, "utf8");

  it("adds governed settings, evaluation runs, and Review citations with RLS", () => {
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS engineering_assurance_rule_settings");
    expect(sql).toContain("UNIQUE (tenant_id, workspace_id, rule_id, rule_version)");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS engineering_assurance_evaluation_runs");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS engineering_assurance_review_citations");
    expect(sql).toContain("cross_tenant_review_link_denied");
    expect(sql).toContain("cross_workspace_review_link_denied");
    expect(sql).toContain("has_permission('engineering', 'admin', tenant_id)");
    expect(sql).toContain("ENABLE ROW LEVEL SECURITY");
    expect(sql).not.toMatch(/CREATE TABLE.*engineering_review_finding/i);
    expect(sql).not.toMatch(/javascript|sql-expression/i);
  });
});
