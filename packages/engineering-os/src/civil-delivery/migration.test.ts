import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const MIGRATION = join(dirname(fileURLToPath(import.meta.url)), "../../../../supabase/migrations/20261028240000_eos_2_7_civil_delivery.sql");

describe("EOS 2.7 civil delivery migration", () => {
  const sql = readFileSync(MIGRATION, "utf8");
  it("adds isolated civil delivery tables without rewriting earlier delivery tables", () => {
    for (const table of [
      "engineering_civil_deliveries",
      "engineering_civil_surveys",
      "engineering_civil_surfaces",
      "engineering_civil_grading",
      "engineering_civil_earthworks",
      "engineering_civil_drainage",
      "engineering_civil_roads",
      "engineering_civil_quantities",
      "engineering_civil_deliverable_items",
      "engineering_civil_reviews",
      "engineering_civil_audit",
    ]) {
      expect(sql).toContain(`CREATE TABLE IF NOT EXISTS ${table}`);
      expect(sql).toContain(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`);
    }
    expect(sql).toContain("engineering_core_workspace_member(workspace_id)");
    expect(sql).not.toMatch(/engineering_piping_deliveries/i);
    expect(sql).not.toMatch(/DROP TABLE/i);
  });
});
