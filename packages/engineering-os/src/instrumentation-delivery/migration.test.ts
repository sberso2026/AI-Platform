import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const VERSION = "20261029040000";
const MIGRATION = join(dirname(fileURLToPath(import.meta.url)), `../../../../supabase/migrations/${VERSION}_eos_2_10_instrumentation_control_delivery.sql`);

describe("EOS 2.10 instrumentation and control delivery migration", () => {
  const sql = readFileSync(MIGRATION, "utf8");
  it("adds isolated I&C tables with a valid later version", () => {
    expect(VERSION > "20261029020000").toBe(true);
    expect(VERSION).toMatch(/^\d{14}$/);
    const hour = Number(VERSION.slice(8, 10));
    expect(hour).toBeGreaterThanOrEqual(0);
    expect(hour).toBeLessThanOrEqual(23);
    for (const table of [
      "engineering_ic_deliveries",
      "engineering_ic_instruments",
      "engineering_ic_signals",
      "engineering_ic_alarms",
      "engineering_ic_sif",
      "engineering_ic_verifications",
      "engineering_ic_packages",
      "engineering_ic_networks",
      "engineering_ic_cyber",
      "engineering_ic_deliverable_items",
      "engineering_ic_reviews",
      "engineering_ic_audit",
    ]) {
      expect(sql).toContain(`CREATE TABLE IF NOT EXISTS ${table}`);
      expect(sql).toContain(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`);
    }
    expect(sql).toContain("engineering_core_workspace_member(workspace_id)");
    expect(sql).not.toMatch(/engineering_electrical_deliveries/i);
    expect(sql).not.toMatch(/DROP TABLE/i);
  });
});
