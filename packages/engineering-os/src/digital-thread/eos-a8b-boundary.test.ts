import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");

describe("EOS-A8B boundary", () => {
  it("projects onto existing Platform KG and does not add a graph store or writeback", () => {
    const docs = readFileSync(join(ROOT, "docs/architecture/engineering-os/EOS_A8B_PLATFORM_KG_PROJECTION.md"), "utf8");
    expect(docs).toContain("SOURCE OF TRUTH");
    expect(docs).toContain("engineering_object_links");
    expect(docs).toContain("knowledge_nodes");
    expect(docs).toContain("knowledge_edges");
    expect(docs).toMatch(/No `EngineeringDigitalThreadGraph`/);
    expect(docs).toContain("GRAPH WRITEBACK");
    expect(docs).toContain("USED_BY");
    const sql = readFileSync(join(ROOT, "supabase/migrations/20260930050000_eos_a8b_platform_kg_thread_projection.sql"), "utf8");
    expect(sql).not.toMatch(/CREATE TABLE/);
    expect(sql).toContain("knowledge_nodes");
    expect(sql).toContain("knowledge_edges");
    expect(sql).toContain("engineering-thread-projection");
    const store = readFileSync(join(ROOT, "packages/engineering-os/src/digital-thread/projection/platform-kg-store.ts"), "utf8");
    expect(store).not.toMatch(/from\(\s*["']engineering_object_links["']\s*\)\.(insert|upsert)/);
    expect(store).not.toMatch(/project_intelligence_knowledge_/);
  });
});
