import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");
const MIGRATION = join(REPO_ROOT, "supabase/migrations/20260930100000_eos_a9b_lifecycle_evidence_and_schedule.sql");

describe("EOS-A9B migration contract", () => {
  const sql = readFileSync(MIGRATION, "utf8");

  it("adds harvest snapshot columns and governed schedule mappings", () => {
    expect(sql).toContain("evidence_source");
    expect(sql).toContain("evidence_snapshot");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS engineering_lifecycle_schedule_mappings");
    expect(sql).toContain("GATE_MILESTONE");
    expect(sql).toContain("ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("has_permission('engineering', 'admin', tenant_id)");
    expect(sql).not.toMatch(/javascript|sql-expression/i);
  });
});
