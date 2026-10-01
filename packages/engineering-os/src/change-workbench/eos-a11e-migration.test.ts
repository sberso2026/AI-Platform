import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");
const MIGRATION = join(REPO_ROOT, "supabase/migrations/20260930200000_eos_a11e_change_impact_option_construction.sql");

describe("EOS-A11E migration contract", () => {
  const sql = readFileSync(MIGRATION, "utf8");
  it("adds impact assessment composition without binaries or a second change domain", () => {
    expect(sql).toContain("engineering_impact_assessments");
    expect(sql).toContain("ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("engineering_core_workspace_member");
    expect(sql).toContain("source_fingerprint");
    expect(sql).toContain("A11E_BINARY_DUPLICATION = NO");
    expect(sql).not.toContain("content_base64");
    expect(sql).not.toMatch(/CREATE TABLE IF NOT EXISTS engineering_changes /i);
    expect(sql).not.toMatch(/CREATE TABLE IF NOT EXISTS engineering_impacts /i);
    expect(sql).not.toMatch(/storage\.buckets/);
    expect(sql).not.toContain("credentials");
  });
});
