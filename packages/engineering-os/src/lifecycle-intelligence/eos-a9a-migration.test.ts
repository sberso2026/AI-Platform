import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");
const MIGRATION = join(REPO_ROOT, "supabase/migrations/20260930090000_eos_a9a_lifecycle_intelligence.sql");

describe("EOS-A9A migration contract", () => {
  const sql = readFileSync(MIGRATION, "utf8");

  it("adds governed assignments, evaluations, decisions, and immutable transitions", () => {
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS engineering_lifecycle_profile_settings");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS engineering_lifecycle_assignments");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS engineering_lifecycle_evaluations");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS engineering_lifecycle_gate_decisions");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS engineering_lifecycle_transitions");
    expect(sql).toContain("UNIQUE (tenant_id, workspace_id, project_id, scope_type, scope_id)");
    expect(sql).toContain("cross_workspace_gate_evidence_denied");
    expect(sql).toContain("cross_tenant_transition_denied");
    expect(sql).toContain("ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("has_permission('engineering', 'admin', tenant_id)");
    expect(sql).not.toMatch(/CREATE TABLE.*lifecycle_findings/i);
    expect(sql).not.toMatch(/javascript|sql-expression/i);
  });
});
