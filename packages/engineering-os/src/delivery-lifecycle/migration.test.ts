import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const MIGRATION = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../../../supabase/migrations/20261028120000_eos_2_1_delivery_lifecycle.sql",
);

describe("EOS 2.1 delivery lifecycle migration", () => {
  const sql = readFileSync(MIGRATION, "utf8");

  it("adds isolated lifecycle, baseline, and audit tables without classifying existing projects", () => {
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS engineering_delivery_lifecycles");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS engineering_delivery_baselines");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS engineering_delivery_audit");
    expect(sql).toContain("DEFAULT 'not_classified'");
    expect(sql).toContain("ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("engineering_core_workspace_member(workspace_id)");
    expect(sql).toContain("has_permission('engineering', 'execute', tenant_id)");
    expect(sql).not.toMatch(/INSERT INTO engineering_delivery_lifecycles/i);
    expect(sql).not.toContain("engineering_lifecycle_assignments");
    expect(sql).not.toMatch(/DROP TABLE/i);
  });
});
