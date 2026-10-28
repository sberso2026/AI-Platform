import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const MIGRATION = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../../../supabase/migrations/20261028160000_eos_2_3_structural_delivery.sql",
);

describe("EOS 2.3 structural delivery migration", () => {
  const sql = readFileSync(MIGRATION, "utf8");

  it("adds isolated structural tables without rewriting lifecycle, basis, or D1 formula migrations", () => {
    for (const table of [
      "engineering_structural_deliveries",
      "engineering_structural_loads",
      "engineering_structural_models",
      "engineering_structural_calculation_links",
      "engineering_structural_results",
      "engineering_structural_deliverables",
      "engineering_structural_reviews",
      "engineering_structural_audit",
    ]) {
      expect(sql).toContain(`CREATE TABLE IF NOT EXISTS ${table}`);
      expect(sql).toContain(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`);
    }
    expect(sql).toContain("engineering_core_workspace_member(workspace_id)");
    expect(sql).not.toMatch(/engineering_delivery_lifecycles/i);
    expect(sql).not.toMatch(/engineering_requirements/i);
    expect(sql).not.toMatch(/DROP TABLE/i);
  });
});
