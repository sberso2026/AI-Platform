import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");
const A8B = join(ROOT, "supabase/migrations/20260930050000_eos_a8b_platform_kg_thread_projection.sql");
const A8BC = join(ROOT, "supabase/migrations/20260930060000_eos_a8b_c_platform_kg_workspace_security.sql");

describe("EOS-A8B-C migration contract", () => {
  it("adds workspace RLS helpers without a new graph table and without editing the A8B index migration", () => {
    const a8b = readFileSync(A8B, "utf8");
    expect(a8b).toContain("idx_knowledge_nodes_eos_thread_source");
    expect(a8b).not.toMatch(/CREATE POLICY/);

    const sql = readFileSync(A8BC, "utf8");
    expect(sql).not.toMatch(/CREATE TABLE/);
    expect(sql).toContain("platform_kg_node_visible");
    expect(sql).toContain("engineering_core_workspace_member");
    expect(sql).toContain("knowledge_nodes_select");
    expect(sql).toContain("knowledge_edges_select");
    expect(sql).toContain("from_node_id");
    expect(sql).toContain("to_node_id");
    expect(sql).toContain("engineering_thread_object");
    expect(sql).toContain("engineering-thread-projection");
    expect(sql).toContain("idx_knowledge_nodes_workspace_id");
    expect(sql).not.toMatch(/DROP POLICY IF EXISTS knowledge_nodes_select ON knowledge_nodes;\s*CREATE POLICY knowledge_nodes_select[^\n]+tenant_id = ANY\(get_user_tenant_ids\(\)\)\s*\)/);
  });
});
