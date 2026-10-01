import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");
const MIGRATION = join(REPO_ROOT, "supabase/migrations/20261001210000_eos_a14a_artifact_object_storage.sql");

describe("EOS-A14A migration contract", () => {
  const sql = readFileSync(MIGRATION, "utf8");

  it("adds a private engineering-artifacts bucket and migration ledger without dropping content_base64", () => {
    expect(sql).toContain("engineering-artifacts");
    expect(sql).toContain("public, file_size_limit");
    expect(sql).toContain("VALUES ('engineering-artifacts', 'engineering-artifacts', false, 26214400)");
    expect(sql).toContain("AS RESTRICTIVE");
    expect(sql).toContain("engineering_artifact_storage_migrations");
    expect(sql).toContain("ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("PUBLIC_BUCKET_REQUIRED = NO");
    expect(sql).toContain("content_base64 column retained");
    expect(sql).not.toMatch(/^\s*DROP COLUMN/im);
    expect(sql).not.toMatch(/VALUES \('engineering-documents'/);
    expect(sql).not.toContain("client_secret");
  });
});
