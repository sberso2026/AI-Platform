import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");
const MIGRATION = join(REPO_ROOT, "supabase/migrations/20260930160000_eos_a11a_engineering_work_generator.sql");

describe("EOS-A11A migration contract", () => {
  const sql = readFileSync(MIGRATION, "utf8");

  it("adds work plans with RLS and no artifact or script store", () => {
    expect(sql).toContain("engineering_work_plans");
    expect(sql).toContain("ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("engineering_core_workspace_member");
    expect(sql).toContain("input_fingerprint");
    expect(sql).not.toMatch(/CREATE TABLE IF NOT EXISTS engineering_documents /i);
    expect(sql).not.toMatch(/javascript|sql-expression/i);
    expect(sql).not.toContain("credentials");
  });
});
