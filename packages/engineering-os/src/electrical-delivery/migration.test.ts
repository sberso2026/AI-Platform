import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const VERSION = "20261029020000";
const MIGRATION = join(dirname(fileURLToPath(import.meta.url)), `../../../../supabase/migrations/${VERSION}_eos_2_9_electrical_delivery.sql`);

describe("EOS 2.9 electrical delivery migration", () => {
  const sql = readFileSync(MIGRATION, "utf8");
  it("adds isolated electrical tables with a valid later version", () => {
    expect(VERSION > "20261029000000").toBe(true);
    expect(VERSION).toMatch(/^\d{14}$/);
    const hour = Number(VERSION.slice(8, 10));
    expect(hour).toBeGreaterThanOrEqual(0);
    expect(hour).toBeLessThanOrEqual(23);
    for (const table of [
      "engineering_electrical_deliveries",
      "engineering_electrical_loads",
      "engineering_electrical_sources",
      "engineering_electrical_models",
      "engineering_electrical_studies",
      "engineering_electrical_cables",
      "engineering_electrical_protection",
      "engineering_electrical_earthing",
      "engineering_electrical_deliverable_items",
      "engineering_electrical_reviews",
      "engineering_electrical_audit",
    ]) {
      expect(sql).toContain(`CREATE TABLE IF NOT EXISTS ${table}`);
      expect(sql).toContain(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`);
    }
    expect(sql).toContain("engineering_core_workspace_member(workspace_id)");
    expect(sql).not.toMatch(/engineering_geotechnical_deliveries/i);
    expect(sql).not.toMatch(/DROP TABLE/i);
  });
});
