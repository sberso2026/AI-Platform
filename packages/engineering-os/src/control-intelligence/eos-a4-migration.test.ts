import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");
const MIGRATION = join(
  REPO_ROOT,
  "supabase/migrations/20260929210000_eos_a4_requirements_change_impact_configuration.sql",
);

describe("EOS-A4 migration contract", () => {
  const sql = readFileSync(MIGRATION, "utf8");

  it("creates canonical requirement, change, impact, and configuration objects", () => {
    expect(sql).toContain("CREATE TABLE engineering_requirements");
    expect(sql).toContain("CREATE TABLE engineering_changes");
    expect(sql).toContain("CREATE TABLE engineering_impacts");
    expect(sql).toContain("CREATE TABLE engineering_configuration_baselines");
    expect(sql).toContain("CREATE TABLE engineering_configuration_items");
    expect(sql).toContain("UNIQUE (tenant_id, workspace_id, requirement_code)");
    expect(sql).toContain("UNIQUE (tenant_id, workspace_id, change_code)");
    expect(sql).toContain("UNIQUE (tenant_id, workspace_id, impact_code)");
    expect(sql).toContain("UNIQUE (tenant_id, workspace_id, baseline_code)");
    expect(sql).toContain("ON DELETE RESTRICT");
  });

  it("does not add Optimization, Value, or graph-store schema", () => {
    expect(sql).not.toMatch(/optimization_/i);
    expect(sql).not.toMatch(/CREATE TABLE engineering_value/i);
    expect(sql).not.toMatch(/CREATE TABLE knowledge_nodes\b/);
    expect(sql).not.toMatch(/CREATE TABLE project_controls_change/i);
  });

  it("enables workspace fail-closed RLS and frozen baseline protection", () => {
    expect(sql).toContain("ALTER TABLE engineering_requirements ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("ALTER TABLE engineering_changes ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("ALTER TABLE engineering_impacts ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("ALTER TABLE engineering_configuration_baselines ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("ALTER TABLE engineering_configuration_items ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("engineering_core_workspace_member(workspace_id)");
    expect(sql).toContain("frozen configuration baseline is immutable");
    expect(sql).toContain("WHEN 'requirement' THEN");
    expect(sql).toContain("WHEN 'change' THEN");
    expect(sql).toContain("WHEN 'impact' THEN");
    expect(sql).toContain("WHEN 'configuration_baseline' THEN");
    expect(sql).toContain("configuration item cannot include an object from another tenant or workspace");
  });
});
