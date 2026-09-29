import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");
const MIGRATION = join(REPO_ROOT, "supabase/migrations/20260930020000_eos_a6_external_tool_licence_governance.sql");

describe("EOS-A6 licence governance migration", () => {
  const sql = readFileSync(MIGRATION, "utf8");

  it("adds generic licence fields without SPACE-GASS-specific columns", () => {
    expect(sql).toContain("licence_type");
    expect(sql).toContain("licence_expires_at");
    expect(sql).toContain("api_available");
    expect(sql).toContain("production_use_permitted");
    expect(sql).toContain("'TRIAL'");
    expect(sql).not.toMatch(/space_gass_trial/i);
    expect(sql).not.toMatch(/CREATE TABLE/);
  });
});
