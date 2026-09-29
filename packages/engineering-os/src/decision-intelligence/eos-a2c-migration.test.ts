import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");
const MIGRATION = join(REPO_ROOT, "supabase/migrations/20260929190000_eos_a2c_decision_workspace_rls.sql");

describe("EOS-A2C decision workspace RLS migration contract", () => {
  const sql = readFileSync(MIGRATION, "utf8");

  it("replaces tenant-only eng_decisions policies with workspace membership", () => {
    expect(sql).toContain("DROP POLICY IF EXISTS eng_decisions_select");
    expect(sql).toContain("engineering_core_workspace_member(workspace_id)");
    expect(sql).toContain("engineering_core_workspace_matches_tenant()");
    expect(sql).toContain("engineering_core_prevent_ownership_mutation()");
    expect(sql).not.toMatch(/CREATE TABLE engineering_systems\b/);
    expect(sql).not.toMatch(/CREATE TABLE engineering_interfaces\b/);
  });

  it("clears selected_alternative_id on alternative delete without nested sync", () => {
    expect(sql).toContain("engineering_decision_clear_selected_on_alt_delete");
    expect(sql).toContain("SET selected_alternative_id = NULL");
    expect(sql).toContain("pg_trigger_depth() > 1");
  });

  it("hardens resolvable object-link endpoints without inventing A3 schema", () => {
    expect(sql).toContain("engineering_core_link_endpoint_allowed");
    expect(sql).toContain("DROP POLICY IF EXISTS eng_obj_links_select");
    expect(sql).not.toMatch(/CREATE TABLE engineering_requirements\b/);
  });
});
