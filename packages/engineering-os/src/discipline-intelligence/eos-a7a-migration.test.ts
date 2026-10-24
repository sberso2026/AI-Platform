import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");
const MIGRATION = join(REPO_ROOT, "supabase/migrations/20260930010000_eos_a7a_multidiscipline_foundation.sql");

describe("EOS-A7A migration contract", () => {
  const sql = readFileSync(MIGRATION, "utf8");

  it("extends the canonical discipline registry and overlay tables", () => {
    expect(sql).toContain("INSERT INTO engineering_disciplines");
    expect(sql).toContain("'materials'");
    expect(sql).toContain("'safety'");
    expect(sql).toContain("'environmental'");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS engineering_discipline_profiles");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS engineering_discipline_tool_bindings");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS engineering_project_disciplines");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS engineering_object_discipline_participants");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS engineering_interface_information_requirements");
    expect(sql).toContain("engineering_core_workspace_member(workspace_id)");
    expect(sql).toContain("has_permission('engineering', 'admin', tenant_id)");
  });

  it("does not create discipline silos, solver hosts, graph stores, or install fields", () => {
    expect(sql).not.toMatch(/CREATE TABLE structural_optimization_studies/);
    expect(sql).not.toMatch(/CREATE TABLE structural_findings/);
    expect(sql).not.toMatch(/CREATE TABLE mechanical_findings/);
    expect(sql).not.toMatch(/CREATE TABLE electrical_findings/);
    expect(sql).not.toMatch(/CREATE TABLE background_jobs/);
    expect(sql).not.toMatch(/CREATE TABLE engineering_execution_hosts/);
    expect(sql).not.toMatch(/CREATE TABLE knowledge_nodes\b/);
    expect(sql).not.toMatch(/executable_path/);
    expect(sql).not.toMatch(/licence_status/);
    expect(sql).not.toMatch(/installed_version/);
  });
});
