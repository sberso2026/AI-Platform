import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const VERSION = "20261029060000";
const MIGRATION = join(dirname(fileURLToPath(import.meta.url)), `../../../../supabase/migrations/${VERSION}_eos_2_11_interface_intelligence.sql`);

describe("EOS 2.11 interface intelligence migration", () => {
  const sql = readFileSync(MIGRATION, "utf8");
  it("adds isolated handoff tables without altering the canonical interface table", () => {
    expect(VERSION > "20261029040000").toBe(true);
    expect(VERSION).toMatch(/^\d{14}$/);
    const hour = Number(VERSION.slice(8, 10));
    expect(hour).toBeGreaterThanOrEqual(0);
    expect(hour).toBeLessThanOrEqual(23);
    for (const table of [
      "engineering_interface_handoffs",
      "engineering_interface_receivers",
      "engineering_interface_packages",
      "engineering_interface_dependencies",
      "engineering_interface_dependents",
      "engineering_interface_baseline_revisions",
      "engineering_interface_events",
      "engineering_interface_audit",
    ]) {
      expect(sql).toContain(`CREATE TABLE IF NOT EXISTS ${table}`);
      expect(sql).toContain(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`);
    }
    expect(sql).toContain("engineering_core_workspace_member(workspace_id)");
    expect(sql).not.toMatch(/engineering_ic_deliveries/i);
    expect(sql).not.toMatch(/DROP TABLE/i);
    expect(sql).not.toMatch(/ALTER TABLE engineering_interfaces/i);
  });
});
