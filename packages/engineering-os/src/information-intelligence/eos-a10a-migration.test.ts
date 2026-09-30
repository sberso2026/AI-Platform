import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");
const MIGRATION = join(REPO_ROOT, "supabase/migrations/20260930130000_eos_a10a_engineering_information_intelligence.sql");

describe("EOS-A10A migration contract", () => {
  const sql = readFileSync(MIGRATION, "utf8");

  it("adds information refs, versioned authority policies, and historical resolutions with RLS", () => {
    expect(sql).toContain("engineering_information_refs");
    expect(sql).toContain("engineering_information_authority_policies");
    expect(sql).toContain("engineering_information_authority_resolutions");
    expect(sql).toContain("policy_version");
    expect(sql).toContain("ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("has_permission('engineering', 'admin', tenant_id)");
    expect(sql).toContain("engineering_core_workspace_member");
    expect(sql).not.toMatch(/CREATE TABLE.*engineering_documents /i);
    expect(sql).not.toMatch(/javascript|sql-expression/i);
  });
});
