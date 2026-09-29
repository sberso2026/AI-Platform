import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");
const MIGRATION = join(REPO_ROOT, "supabase/migrations/20260930040000_eos_a8a_digital_thread_link_resolve.sql");

describe("EOS-A8A migration contract", () => {
  const sql = readFileSync(MIGRATION, "utf8");

  it("extends the existing link resolver without a Digital Thread object table or graph store", () => {
    expect(sql).toContain("analysis_request");
    expect(sql).toContain("analysis_result");
    expect(sql).toContain("engineering_object_link_resolve");
    expect(sql).toContain("engineering_core_link_endpoint_allowed");
    expect(sql).not.toMatch(/CREATE TABLE/);
    expect(sql).not.toMatch(/knowledge_nodes/);
    expect(sql).not.toMatch(/engineering_digital_thread_/);
  });
});
