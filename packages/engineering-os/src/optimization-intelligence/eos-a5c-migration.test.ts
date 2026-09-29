import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");
const MIGRATION = join(REPO_ROOT, "supabase/migrations/20260929230000_eos_a5c_optimization_run_manifest.sql");

describe("EOS-A5C migration contract", () => {
  const sql = readFileSync(MIGRATION, "utf8");

  it("adds the immutable run input manifest and separate run_input_fingerprint", () => {
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS engineering_optimization_run_manifests");
    expect(sql).toContain("ADD COLUMN IF NOT EXISTS run_input_fingerprint");
    expect(sql).toContain("ADD COLUMN IF NOT EXISTS context_fingerprint");
    expect(sql).toContain("manifest_schema_version");
    expect(sql).toContain("engineering_optimization_run_manifest_immutable");
    expect(sql).toContain("engineering_core_workspace_member(workspace_id)");
  });

  it("does not create a second job queue, execution host, graph store, or selected alternative", () => {
    expect(sql).not.toMatch(/CREATE TABLE background_jobs/);
    expect(sql).not.toMatch(/CREATE TABLE engineering_execution_jobs/);
    expect(sql).not.toMatch(/CREATE TABLE engineering_execution_hosts/);
    expect(sql).not.toMatch(/CREATE TABLE knowledge_nodes\b/);
    expect(sql).not.toMatch(/ALTER TABLE engineering_decisions[\s\S]*selected_optimization_alternative_id/);
    expect(sql).not.toMatch(/recommended_alternative_id/);
  });
});
