import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");
const MIGRATION = join(REPO_ROOT, "supabase/migrations/20260930190000_eos_a11d_pre_issue_engineering_review.sql");

describe("EOS-A11D migration contract", () => {
  const sql = readFileSync(MIGRATION, "utf8");
  it("adds composition reviews without duplicating binaries or creating a second review engine", () => {
    expect(sql).toContain("engineering_pre_issue_reviews");
    expect(sql).toContain("ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("engineering_core_workspace_member");
    expect(sql).toContain("review_package_id");
    expect(sql).toContain("target_artifact_hash");
    expect(sql).not.toContain("content_base64");
    expect(sql).not.toMatch(/CREATE TABLE IF NOT EXISTS engineering_review_packages /i);
    expect(sql).not.toMatch(/storage\.buckets/);
    expect(sql).not.toContain("credentials");
  });
});
