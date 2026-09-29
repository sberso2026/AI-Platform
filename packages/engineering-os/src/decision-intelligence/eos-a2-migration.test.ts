import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");
const MIGRATION = join(
  REPO_ROOT,
  "supabase/migrations/20260929180000_eos_a2_decision_assumption_intelligence.sql",
);

describe("EOS-A2 migration contract", () => {
  const sql = readFileSync(MIGRATION, "utf8");

  it("extends engineering_decisions without replacing the parent table", () => {
    expect(sql).toContain("ALTER TABLE engineering_decisions");
    expect(sql).toContain("decision_question");
    expect(sql).toContain("authority_id");
    expect(sql).toContain("effective_at");
    expect(sql).toContain("selected_alternative_id");
    expect(sql).toContain("supersedes_decision_id");
    expect(sql).not.toMatch(/DROP TABLE engineering_decisions/i);
    expect(sql).not.toMatch(/CREATE TABLE engineering_decisions\b/);
  });

  it("creates identifiable alternatives, approvals, and assumptions", () => {
    expect(sql).toContain("CREATE TABLE engineering_decision_alternatives");
    expect(sql).toContain("CREATE TABLE engineering_decision_approvals");
    expect(sql).toContain("CREATE TABLE engineering_assumptions");
    expect(sql).toContain("UNIQUE (id, decision_id)");
    expect(sql).toContain("engineering_decisions_selected_alternative_fk");
    expect(sql).toContain("actor_kind              TEXT NOT NULL DEFAULT 'human' CHECK (actor_kind = 'human')");
  });

  it("does not introduce future-domain or graph schema", () => {
    expect(sql).not.toMatch(/optimization_/i);
    expect(sql).not.toMatch(/CREATE TABLE engineering_systems\b/);
    expect(sql).not.toMatch(/CREATE TABLE engineering_requirements\b/);
    expect(sql).not.toMatch(/CREATE TABLE engineering_interfaces\b/);
    expect(sql).not.toMatch(/CREATE TABLE knowledge_nodes\b/);
    expect(sql).not.toMatch(/project_controls_decision/);
    expect(sql).not.toMatch(/project_intelligence_findings/);
  });

  it("enables RLS with tenant + workspace membership and does not weaken existing decision policies", () => {
    for (const table of [
      "engineering_decision_alternatives",
      "engineering_decision_approvals",
      "engineering_assumptions",
    ]) {
      expect(sql).toContain(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`);
    }
    expect(sql).toContain("engineering_core_workspace_member(workspace_id)");
    expect(sql).toContain("get_user_tenant_ids()");
    expect(sql).not.toMatch(/DROP POLICY.*eng_decisions_/);
    expect(sql).toContain("cross-tenant object links are rejected");
    expect(sql).toContain("relationship_governed");
    expect(sql).toContain("relationship_governed = FALSE");
  });

  it("keeps approvals append-only and human-only", () => {
    expect(sql).toContain("decision approvals are append-only");
    expect(sql).toContain("eng_decision_approvals_update ON engineering_decision_approvals FOR UPDATE USING (false)");
    expect(sql).toContain("AND actor_kind = 'human'");
  });
});
