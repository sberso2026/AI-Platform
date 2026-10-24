import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");
const MIGRATION = join(REPO_ROOT, "supabase/migrations/20260930170000_eos_a11b_engineering_artifact_automation.sql");

describe("EOS-A11B migration contract", () => {
  const sql = readFileSync(MIGRATION, "utf8");

  it("adds generation metadata and draft bytes with RLS and no DMS", () => {
    expect(sql).toContain("engineering_artifact_generation_runs");
    expect(sql).toContain("engineering_generated_artifacts");
    expect(sql).toContain("ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("engineering_core_workspace_member");
    expect(sql).toContain("content_base64");
    expect(sql).not.toMatch(/CREATE TABLE IF NOT EXISTS engineering_documents /i);
    expect(sql).not.toMatch(/storage\.buckets|javascript|sql-expression/i);
    expect(sql).not.toContain("ENGINEERING_APPROVED");
    expect(sql).not.toContain("credentials");
  });
});
