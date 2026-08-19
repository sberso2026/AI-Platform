import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const MIGRATION = resolve(
  import.meta.dirname,
  "../../../../supabase/migrations/20260819170000_batch_108_business_os_connectors_hardening.sql",
);

describe("BOS-12 connectors migration", () => {
  const sql = readFileSync(MIGRATION, "utf8");

  it("adds connector metadata with RLS and does not create a second integration stack", () => {
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS business_os_connector_installations");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS business_os_connector_sync_runs");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS business_os_connector_staging");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS business_os_connector_import_batches");
    expect(sql).toContain("secret_id text");
    expect(sql).toContain("becomes_canonical boolean NOT NULL DEFAULT false CHECK (becomes_canonical = false)");
    expect(sql).toContain("ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("FORCE ROW LEVEL SECURITY");
    expect(sql).toContain("get_user_tenant_ids()");
    expect(sql.toLowerCase()).not.toContain("create table if not exists secrets");
    expect(sql.toLowerCase()).not.toContain("create table if not exists agents");
    expect(sql.toLowerCase()).not.toContain("create table if not exists knowledge_nodes");
    expect(sql.toLowerCase()).not.toContain("create table if not exists jobs");
  });
});
