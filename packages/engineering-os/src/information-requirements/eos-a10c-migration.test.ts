import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");
const MIGRATION = join(REPO_ROOT, "supabase/migrations/20260930150000_eos_a10c_information_requirements_handover.sql");

describe("EOS-A10C migration contract", () => {
  const sql = readFileSync(MIGRATION, "utf8");

  it("adds information requirements and handover packages with RLS and no document store", () => {
    expect(sql).toContain("engineering_information_requirements");
    expect(sql).toContain("engineering_information_requirement_satisfactions");
    expect(sql).toContain("engineering_handover_packages");
    expect(sql).toContain("engineering_handover_package_items");
    expect(sql).toContain("ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("engineering_core_workspace_member");
    expect(sql).toContain("ACCEPTED_FOR_PURPOSE");
    expect(sql).not.toMatch(/CREATE TABLE IF NOT EXISTS engineering_documents /i);
    expect(sql).not.toMatch(/javascript|sql-expression/i);
    expect(sql).not.toContain("credentials");
  });
});
