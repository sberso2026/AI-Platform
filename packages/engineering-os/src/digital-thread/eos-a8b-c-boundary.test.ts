import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { resolveThreadProjectionFlags } from "./projection/flags";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");

describe("EOS-A8B-C boundary", () => {
  it("documents workspace SQL isolation and keeps KG reads off by default", () => {
    const docs = readFileSync(join(ROOT, "docs/architecture/engineering-os/EOS_A8B_C_KG_WORKSPACE_SECURITY.md"), "utf8");
    expect(docs).toContain("WORKSPACE");
    expect(docs).toContain("engineering_core_workspace_member");
    expect(docs).toContain("PRODUCT_KG_SQL_READ_SECURITY");
    expect(docs).toContain("KG reads remain DEFAULT OFF");
    expect(resolveThreadProjectionFlags().readsEnabled).toBe(false);
    const sql = readFileSync(join(ROOT, "supabase/migrations/20260930060000_eos_a8b_c_platform_kg_workspace_security.sql"), "utf8");
    expect(sql).toContain("platform_kg_is_engineering_thread_node");
    expect(sql).not.toMatch(/CREATE TABLE/);
  });
});
