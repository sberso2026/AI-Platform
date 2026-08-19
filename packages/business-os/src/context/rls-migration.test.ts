import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const MIGRATION = resolve(
  import.meta.dirname,
  "../../../../supabase/migrations/20260819150000_batch_106_business_os_business_context.sql",
);

describe("BOS-10 business context migration", () => {
  const sql = readFileSync(MIGRATION, "utf8");

  it("extends Kernel knowledge_nodes and adds projection metadata with RLS", () => {
    expect(sql).toContain("knowledge_nodes_tenant_workspace_source_ref_uidx");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS business_os_context_settings");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS business_os_context_projection_runs");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS business_os_context_overrides");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS business_os_context_unresolved");
    expect(sql).toContain("ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("FORCE ROW LEVEL SECURITY");
    expect(sql).toContain("get_user_tenant_ids()");
    expect(sql.toLowerCase()).not.toContain("create table if not exists knowledge_graph");
    expect(sql.toLowerCase()).not.toContain("create table if not exists business_os_graph_nodes");
    expect(sql.toLowerCase()).not.toContain("create table if not exists vector_store");
  });
});
