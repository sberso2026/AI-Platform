import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../../..");
const MIGRATION = join(REPO_ROOT, "supabase/migrations/20261001200000_eos_a13c_platform_consolidation_binary_storage.sql");

describe("EOS-A13C migration contract", () => {
  const sql = readFileSync(MIGRATION, "utf8");

  it("adds storage metadata without dropping content_base64 or rewriting connector tables", () => {
    expect(sql).toContain("storage_kind");
    expect(sql).toContain("object_key");
    expect(sql).toContain("migration_state");
    expect(sql).toContain("LEGACY_RELATIONAL");
    expect(sql).toContain("OBJECT_STORAGE");
    expect(sql).toContain("Do not drop");
    expect(sql).toContain("PUBLIC_BUCKET_REQUIRED = NO");
    expect(sql).toContain("CONTRACT_ONLY");
    expect(sql).not.toMatch(/DROP COLUMN.*content_base64/i);
    expect(sql).not.toMatch(/CREATE TABLE IF NOT EXISTS engineering_connector_core_v2/i);
    expect(sql).not.toMatch(/CREATE TABLE.*storage\.buckets/i);
    expect(sql).toContain("No public storage bucket");
    expect(sql).not.toContain("client_secret");
  });
});
