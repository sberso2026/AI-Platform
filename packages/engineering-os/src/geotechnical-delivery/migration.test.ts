import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const VERSION = "20261029000000";
const MIGRATION = join(dirname(fileURLToPath(import.meta.url)), `../../../../supabase/migrations/${VERSION}_eos_2_8_geotechnical_delivery.sql`);

describe("EOS 2.8 geotechnical delivery migration", () => {
  const sql = readFileSync(MIGRATION, "utf8");
  it("adds isolated geotechnical tables with a valid later version", () => {
    expect(VERSION > "20261028240000").toBe(true);
    expect(VERSION).toMatch(/^\d{14}$/);
    const hour = Number(VERSION.slice(8, 10));
    expect(hour).toBeGreaterThanOrEqual(0);
    expect(hour).toBeLessThanOrEqual(23);
    for (const table of [
      "engineering_geotechnical_deliveries",
      "engineering_geotechnical_investigations",
      "engineering_geotechnical_boreholes",
      "engineering_geotechnical_ground_models",
      "engineering_geotechnical_parameters",
      "engineering_geotechnical_assessments",
      "engineering_geotechnical_recommendations",
      "engineering_geotechnical_deliverable_items",
      "engineering_geotechnical_reviews",
      "engineering_geotechnical_audit",
    ]) {
      expect(sql).toContain(`CREATE TABLE IF NOT EXISTS ${table}`);
      expect(sql).toContain(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`);
    }
    expect(sql).toContain("engineering_core_workspace_member(workspace_id)");
    expect(sql).not.toMatch(/engineering_civil_deliveries/i);
    expect(sql).not.toMatch(/DROP TABLE/i);
  });
});
