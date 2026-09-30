import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");
const MIGRATION = join(REPO_ROOT, "supabase/migrations/20260930110000_eos_a9c_deliverable_maturity.sql");

describe("EOS-A9C migration contract", () => {
  const sql = readFileSync(MIGRATION, "utf8");

  it("adds expectation, binding, assessment, and waiver tables with RLS", () => {
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS engineering_deliverable_profile_settings");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS engineering_deliverable_expectations");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS engineering_deliverable_artifact_bindings");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS engineering_deliverable_assessments");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS engineering_deliverable_waivers");
    expect(sql).toContain("ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("has_permission('engineering', 'admin', tenant_id)");
    expect(sql).toContain("cross_workspace_artifact_binding_denied");
    expect(sql).not.toMatch(/javascript|sql-expression/i);
    expect(sql).not.toMatch(/percent_complete|maturity_score/i);
  });
});
