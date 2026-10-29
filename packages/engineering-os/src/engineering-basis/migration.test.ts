import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const MIGRATION = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../../../supabase/migrations/20261028140000_eos_2_2_engineering_basis.sql",
);

describe("EOS 2.2 engineering basis migration", () => {
  const sql = readFileSync(MIGRATION, "utf8");

  it("adds isolated basis tables without rewriting legacy requirements or the lifecycle migration", () => {
    for (const table of [
      "engineering_basis_sets",
      "engineering_basis_items",
      "engineering_basis_requirements",
      "engineering_basis_criteria",
      "engineering_basis_assumptions",
      "engineering_basis_inputs",
      "engineering_basis_sources",
      "engineering_basis_standards",
      "engineering_basis_verifications",
      "engineering_basis_links",
      "engineering_basis_audit",
    ]) {
      expect(sql).toContain(`CREATE TABLE IF NOT EXISTS ${table}`);
      expect(sql).toContain(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`);
    }
    expect(sql).toContain("engineering_core_workspace_member(workspace_id)");
    expect(sql).toContain("has_permission('engineering', 'execute', tenant_id)");
    expect(sql).not.toMatch(/INSERT INTO engineering_requirements/i);
    expect(sql).not.toMatch(/ALTER TABLE engineering_requirements/i);
    expect(sql).not.toMatch(/engineering_delivery_lifecycles/i);
    expect(sql).not.toMatch(/DROP TABLE/i);
  });
});
