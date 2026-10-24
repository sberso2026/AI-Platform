import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");
const MIGRATION = join(REPO_ROOT, "supabase/migrations/20260929200000_eos_a3_systems_interface_intelligence.sql");

describe("EOS-A3 migration contract", () => {
  const sql = readFileSync(MIGRATION, "utf8");

  it("creates canonical systems and interfaces without a subsystems table", () => {
    expect(sql).toContain("CREATE TABLE engineering_systems");
    expect(sql).toContain("parent_system_id");
    expect(sql).toContain("CREATE TABLE engineering_interfaces");
    expect(sql).not.toMatch(/CREATE TABLE engineering_subsystems\b/);
    expect(sql).not.toMatch(/ALTER TABLE engineering_assets DROP COLUMN/i);
    expect(sql).toContain("Does not drop or rewrite engineering_assets.system");
  });

  it("does not add future-domain schema", () => {
    expect(sql).not.toMatch(/CREATE TABLE engineering_requirements\b/);
    expect(sql).not.toMatch(/CREATE TABLE engineering_changes\b/);
    expect(sql).not.toMatch(/optimization_/i);
    expect(sql).not.toMatch(/CREATE TABLE knowledge_nodes\b/);
  });

  it("enables workspace fail-closed RLS and hierarchy cycle protection", () => {
    expect(sql).toContain("ALTER TABLE engineering_systems ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("ALTER TABLE engineering_interfaces ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("engineering_core_workspace_member(workspace_id)");
    expect(sql).toContain("system hierarchy cycle detected");
    expect(sql).toContain("system cannot parent itself");
    expect(sql).toContain("WHEN 'system' THEN");
    expect(sql).toContain("WHEN 'interface' THEN");
    expect(sql).toContain("ON DELETE RESTRICT");
  });
});
