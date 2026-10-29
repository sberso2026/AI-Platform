import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const MIGRATION = join(dirname(fileURLToPath(import.meta.url)), "../../../../supabase/migrations/20261028180000_eos_2_4_process_delivery.sql");

describe("EOS 2.4 process delivery migration", () => {
  const sql = readFileSync(MIGRATION, "utf8");
  it("adds isolated process tables without rewriting earlier delivery tables", () => {
    for (const table of [
      "engineering_process_deliveries",
      "engineering_process_streams",
      "engineering_process_models",
      "engineering_process_calculation_links",
      "engineering_process_balances",
      "engineering_process_deliverable_items",
      "engineering_process_reviews",
      "engineering_process_audit",
    ]) {
      expect(sql).toContain(`CREATE TABLE IF NOT EXISTS ${table}`);
      expect(sql).toContain(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`);
    }
    expect(sql).toContain("engineering_core_workspace_member(workspace_id)");
    expect(sql).not.toMatch(/engineering_structural_deliveries/i);
    expect(sql).not.toMatch(/engineering_delivery_lifecycles/i);
    expect(sql).not.toMatch(/DROP TABLE/i);
  });
});
