import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");
const MIGRATION = join(REPO_ROOT, "supabase/migrations/20261001000000_eos_a12a_artifact_template_governance.sql");

describe("EOS-A12A migration contract", () => {
  const sql = readFileSync(MIGRATION, "utf8");

  it("adds template policy metadata with RLS and no binary store", () => {
    expect(sql).toContain("engineering_artifact_template_policies");
    expect(sql).toContain("engineering_artifact_template_fallback_policies");
    expect(sql).toContain("ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("engineering_core_workspace_member");
    expect(sql).toContain("has_permission('engineering', 'admin', tenant_id)");
    expect(sql).toContain("OFFICIAL_TEMPLATE_REQUIRED");
    expect(sql).toContain("PROJECT_CLIENT_APPROVED");
    expect(sql).toContain("COMPANY_OFFICIAL");
    expect(sql).not.toMatch(/content_base64\s+TEXT/i);
    expect(sql).not.toMatch(/CREATE TABLE IF NOT EXISTS engineering_documents /i);
    expect(sql).not.toMatch(/storage\.buckets|javascript|sql-expression/i);
    expect(sql).not.toContain("ENGINEERING_APPROVED");
    expect(sql).not.toContain("credentials");
  });
});
