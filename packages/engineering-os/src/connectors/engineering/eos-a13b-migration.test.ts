import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../../..");
const MIGRATION = join(REPO_ROOT, "supabase/migrations/20261001190000_eos_a13b_engineering_edms_construction_connectors.sql");

describe("EOS-A13B migration contract", () => {
  const sql = readFileSync(MIGRATION, "utf8");
  it("adds generic external connector composition without binaries or credentials", () => {
    expect(sql).toContain("engineering_external_connections");
    expect(sql).toContain("engineering_external_project_bindings");
    expect(sql).toContain("engineering_external_object_refs");
    expect(sql).toContain("ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("READ_ONLY");
    expect(sql).toContain("A13B_BINARY_DUPLICATION = NO");
    expect(sql).not.toContain("content_base64");
    expect(sql).not.toMatch(/CREATE TABLE IF NOT EXISTS engineering_rfis /i);
    expect(sql).not.toMatch(/storage\.buckets/);
    expect(sql).not.toContain("client_secret");
  });
});
