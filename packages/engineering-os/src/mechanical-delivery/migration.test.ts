import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const MIGRATION = join(dirname(fileURLToPath(import.meta.url)), "../../../../supabase/migrations/20261028200000_eos_2_5_mechanical_delivery.sql");

describe("EOS 2.5 mechanical delivery migration", () => {
  const sql = readFileSync(MIGRATION, "utf8");
  it("adds isolated mechanical tables without rewriting earlier delivery tables", () => {
    for (const table of [
      "engineering_mechanical_deliveries",
      "engineering_mechanical_equipment",
      "engineering_mechanical_datasheets",
      "engineering_mechanical_vendor_data",
      "engineering_mechanical_calculation_links",
      "engineering_mechanical_deliverable_items",
      "engineering_mechanical_reviews",
      "engineering_mechanical_audit",
    ]) {
      expect(sql).toContain(`CREATE TABLE IF NOT EXISTS ${table}`);
      expect(sql).toContain(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`);
    }
    expect(sql).toContain("engineering_core_workspace_member(workspace_id)");
    expect(sql).not.toMatch(/engineering_process_deliveries/i);
    expect(sql).not.toMatch(/DROP TABLE/i);
  });
});
