import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const VERSION = "20261029100000";
const MIGRATION = join(dirname(fileURLToPath(import.meta.url)), `../../../../supabase/migrations/${VERSION}_eos_2_13_design_freeze_deliverable_governance.sql`);

describe("EOS 2.13 design freeze migration", () => {
  const sql = readFileSync(MIGRATION, "utf8");
  it("adds isolated freeze tables without replacing configuration or document masters", () => {
    expect(VERSION > "20261029080000").toBe(true);
    expect(VERSION).toMatch(/^\d{14}$/);
    const hour = Number(VERSION.slice(8, 10));
    expect(hour).toBeGreaterThanOrEqual(0);
    expect(hour).toBeLessThanOrEqual(23);
    for (const table of [
      "engineering_design_freezes",
      "engineering_design_freeze_members",
      "engineering_design_freeze_exceptions",
      "engineering_governed_deliverables",
      "engineering_governed_deliverable_packages",
      "engineering_governed_transmittals",
      "engineering_design_freeze_audit",
    ]) {
      expect(sql).toContain(`CREATE TABLE IF NOT EXISTS ${table}`);
      expect(sql).toContain(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`);
    }
    expect(sql).toContain("engineering_core_workspace_member(workspace_id)");
    expect(sql).not.toMatch(/DROP TABLE/i);
    expect(sql).not.toMatch(/ALTER TABLE engineering_configuration_baselines/i);
    expect(sql).not.toMatch(/ALTER TABLE engineering_documents/i);
    expect(sql).not.toMatch(/CREATE TABLE(?: IF NOT EXISTS)? engineering_documents\b/i);
  });
});
