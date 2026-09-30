import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");
const MIGRATION = join(REPO_ROOT, "supabase/migrations/20260930140000_eos_a10b_engineering_work_context.sql");

describe("EOS-A10B migration contract", () => {
  const sql = readFileSync(MIGRATION, "utf8");

  it("adds managed repositories and work events with RLS and source-event uniqueness", () => {
    expect(sql).toContain("engineering_managed_repositories");
    expect(sql).toContain("engineering_work_events");
    expect(sql).toContain("source_event_id");
    expect(sql).toContain("ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("has_permission('engineering', 'admin', tenant_id)");
    expect(sql).toContain("engineering_core_workspace_member");
    expect(sql).toContain("UNIQUE (tenant_id, workspace_id, source_system, source_event_id)");
    expect(sql).not.toMatch(/CREATE TABLE IF NOT EXISTS events /i);
    expect(sql).not.toMatch(/javascript|sql-expression/i);
    expect(sql).not.toContain("credentials");
  });
});
