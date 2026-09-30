import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");
const MIGRATION = join(REPO_ROOT, "supabase/migrations/20260930070000_eos_a8c_engineering_assurance_conditions.sql");

describe("EOS-A8C migration contract", () => {
  const sql = readFileSync(MIGRATION, "utf8");

  it("adds a workspace-scoped assurance condition table with RLS", () => {
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS engineering_assurance_conditions");
    expect(sql).toContain("UNIQUE (tenant_id, workspace_id, fingerprint)");
    expect(sql).toContain("ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("eng_assurance_select");
    expect(sql).toContain("has_permission('engineering', 'admin', tenant_id)");
    expect(sql).not.toMatch(/universal.*score/i);
  });
});
