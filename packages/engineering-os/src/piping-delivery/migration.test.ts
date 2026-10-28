import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const MIGRATION = join(dirname(fileURLToPath(import.meta.url)), "../../../../supabase/migrations/20261028220000_eos_2_6_piping_delivery.sql");

describe("EOS 2.6 piping delivery migration", () => {
  const sql = readFileSync(MIGRATION, "utf8");
  it("adds isolated piping delivery tables without rewriting earlier delivery tables", () => {
    for (const table of [
      "engineering_piping_deliveries",
      "engineering_piping_line_records",
      "engineering_piping_classes",
      "engineering_piping_routes",
      "engineering_piping_stress_models",
      "engineering_piping_stress_results",
      "engineering_piping_supports",
      "engineering_piping_tie_ins",
      "engineering_piping_deliverable_items",
      "engineering_piping_reviews",
      "engineering_piping_audit",
    ]) {
      expect(sql).toContain(`CREATE TABLE IF NOT EXISTS ${table}`);
      expect(sql).toContain(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`);
    }
    expect(sql).toContain("engineering_core_workspace_member(workspace_id)");
    expect(sql).not.toMatch(/engineering_mechanical_deliveries/i);
    expect(sql).not.toMatch(/DROP TABLE/i);
  });
});
