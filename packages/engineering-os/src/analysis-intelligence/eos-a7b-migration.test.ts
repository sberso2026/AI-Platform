import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");
const MIGRATION = join(REPO_ROOT, "supabase/migrations/20260930030000_eos_a7b_analysis_execution_foundation.sql");

describe("EOS-A7B migration contract", () => {
  const sql = readFileSync(MIGRATION, "utf8");

  it("creates discipline-neutral analysis tables with RLS and plan immutability", () => {
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS engineering_analysis_requests");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS engineering_analysis_execution_plans");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS engineering_analysis_results");
    expect(sql).toContain("execution_succeeded");
    expect(sql).toContain("result_valid");
    expect(sql).toContain("acceptance_state");
    expect(sql).toContain("analysis_input_fingerprint");
    expect(sql).toContain("engineering_core_workspace_member(workspace_id)");
    expect(sql).toContain("has_permission('engineering', 'execute', tenant_id)");
    expect(sql).toContain("execution_plan_immutable");
    expect(sql).toContain("synthetic_certification");
  });

  it("does not create a second job queue, solver host, graph store, or discipline findings tables", () => {
    expect(sql).not.toMatch(/CREATE TABLE background_jobs/);
    expect(sql).not.toMatch(/CREATE TABLE engineering_execution_hosts/);
    expect(sql).not.toMatch(/CREATE TABLE knowledge_nodes\b/);
    expect(sql).not.toMatch(/CREATE TABLE structural_analysis_findings/);
    expect(sql).not.toMatch(/CREATE TABLE process_analysis_findings/);
    expect(sql).not.toMatch(/CREATE TABLE electrical_analysis_findings/);
    expect(sql).not.toMatch(/CREATE TABLE engineering_optimization_runs/);
    expect(sql).not.toMatch(/SPACE GASS|ETABS|CAESAR|HYSYS|ETAP|PLAXIS/i);
  });
});
