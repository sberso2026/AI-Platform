import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");
const MIGRATION = join(REPO_ROOT, "supabase/migrations/20260929220000_eos_a5_engineering_optimization_core.sql");

describe("EOS-A5 migration contract", () => {
  const sql = readFileSync(MIGRATION, "utf8");

  it("creates the Optimization bounded-context tables", () => {
    expect(sql).toContain("CREATE TABLE engineering_optimization_studies");
    expect(sql).toContain("CREATE TABLE engineering_optimization_objectives");
    expect(sql).toContain("CREATE TABLE engineering_optimization_constraints");
    expect(sql).toContain("CREATE TABLE engineering_optimization_design_variables");
    expect(sql).toContain("CREATE TABLE engineering_optimization_scenarios");
    expect(sql).toContain("CREATE TABLE engineering_optimization_alternatives");
    expect(sql).toContain("CREATE TABLE engineering_optimization_alternative_values");
    expect(sql).toContain("CREATE TABLE engineering_optimization_runs");
    expect(sql).toContain("CREATE TABLE engineering_optimization_run_inputs");
    expect(sql).toContain("CREATE TABLE engineering_optimization_result_metrics");
    expect(sql).toContain("CREATE TABLE engineering_optimization_constraint_evaluations");
  });

  it("does not create a job queue, solver host, value ledger, or graph store", () => {
    expect(sql).not.toMatch(/CREATE TABLE background_jobs/);
    expect(sql).not.toMatch(/CREATE TABLE engineering_execution_jobs/);
    expect(sql).not.toMatch(/CREATE TABLE engineering_execution_hosts/);
    expect(sql).not.toMatch(/CREATE TABLE engineering_value/);
    expect(sql).not.toMatch(/CREATE TABLE knowledge_nodes\b/);
    expect(sql).not.toMatch(/ALTER TABLE engineering_decisions[\s\S]*selected_optimization_alternative_id/);
    expect(sql).not.toMatch(/recommended_alternative_id/);
  });

  it("extends governed taxonomy and fail-closed workspace RLS", () => {
    expect(sql).toContain("'SCOPED_TO', 'CONSTRAINED_BY'");
    expect(sql).toContain("engineering_core_workspace_member(workspace_id)");
    expect(sql).toContain("WHEN 'optimization_study' THEN");
    expect(sql).toContain("frozen configuration baseline");
    expect(sql).toContain("succeeded optimization run evidence is immutable");
  });
});
