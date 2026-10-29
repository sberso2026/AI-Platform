import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");
const MIGRATION = join(REPO_ROOT, "supabase/migrations/20260930180000_eos_a11c_engineering_tool_orchestration.sql");

describe("EOS-A11C migration contract", () => {
  const sql = readFileSync(MIGRATION, "utf8");
  it("adds tool handoffs and lineage without a DMS", () => {
    expect(sql).toContain("engineering_tool_handoffs");
    expect(sql).toContain("ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("engineering_core_workspace_member");
    expect(sql).toContain("lineage_kind");
    expect(sql).not.toMatch(/CREATE TABLE IF NOT EXISTS engineering_documents /i);
    expect(sql).not.toMatch(/storage\.buckets/);
    expect(sql).not.toContain("credentials");
  });
});
