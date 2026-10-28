import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const VERSION = "20261029080000";
const MIGRATION = join(dirname(fileURLToPath(import.meta.url)), `../../../../supabase/migrations/${VERSION}_eos_2_12_change_impact_intelligence.sql`);

describe("EOS 2.12 change impact migration", () => {
  const sql = readFileSync(MIGRATION, "utf8");
  it("adds isolated assessment tables without replacing canonical change records", () => {
    expect(VERSION > "20261029060000").toBe(true);
    expect(VERSION).toMatch(/^\d{14}$/);
    const hour = Number(VERSION.slice(8, 10));
    expect(hour).toBeGreaterThanOrEqual(0);
    expect(hour).toBeLessThanOrEqual(23);
    for (const table of [
      "engineering_change_impact_cases",
      "engineering_change_candidate_impacts",
      "engineering_change_impact_actions",
      "engineering_change_impact_events",
      "engineering_change_impact_audit",
    ]) {
      expect(sql).toContain(`CREATE TABLE IF NOT EXISTS ${table}`);
      expect(sql).toContain(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`);
    }
    expect(sql).toContain("engineering_core_workspace_member(workspace_id)");
    expect(sql).not.toMatch(/DROP TABLE/i);
    expect(sql).not.toMatch(/CREATE TABLE(?: IF NOT EXISTS)? engineering_changes\b/i);
    expect(sql).not.toMatch(/ALTER TABLE engineering_changes/i);
    expect(sql).not.toMatch(/ALTER TABLE engineering_impacts/i);
    expect(sql).not.toMatch(/ALTER TABLE engineering_impact_assessments/i);
  });
});
