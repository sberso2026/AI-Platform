import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");
const MIGRATION = join(REPO_ROOT, "supabase/migrations/20261001120000_eos_a12b_engineering_attention.sql");

describe("EOS-A12B migration contract", () => {
  const sql = readFileSync(MIGRATION, "utf8");

  it("persists only acknowledgement and preference metadata with RLS", () => {
    expect(sql).toContain("engineering_attention_acknowledgements");
    expect(sql).toContain("engineering_attention_preferences");
    expect(sql).toContain("ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("user_id = auth.uid()");
    expect(sql).toContain("engineering_core_workspace_member");
    expect(sql).toContain("fingerprint");
    expect(sql).not.toMatch(/content_base64\s+TEXT/i);
    expect(sql).not.toContain("productivity");
    expect(sql).not.toContain("hours_worked");
    expect(sql).not.toMatch(/CREATE TABLE IF NOT EXISTS engineering_attention_items/i);
  });
});
