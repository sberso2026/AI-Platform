import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");
const MIGRATION = join(REPO_ROOT, "supabase/migrations/20260930120000_eos_a9d_deliverable_governance.sql");

describe("EOS-A9D migration contract", () => {
  const sql = readFileSync(MIGRATION, "utf8");

  it("adds project definitions, status mappings, and revision policy columns with RLS", () => {
    expect(sql).toContain("engineering_project_deliverable_definitions");
    expect(sql).toContain("engineering_document_status_mappings");
    expect(sql).toContain("revision_policy");
    expect(sql).toContain("EXACT_REVISION");
    expect(sql).toContain("CURRENT_EFFECTIVE_REVISION");
    expect(sql).toContain("BASELINE_PINNED_REVISION");
    expect(sql).toContain("artifact_not_found");
    expect(sql).toContain("has_permission('engineering', 'admin', tenant_id)");
    expect(sql).not.toMatch(/javascript|sql-expression/i);
    expect(sql).not.toMatch(/IFC = |IFR = /);
  });
});
