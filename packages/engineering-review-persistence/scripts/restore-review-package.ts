/**
 * Safe Review-row logical recovery drill. Does not restore the staging database.
 * Never prints secret values.
 */
import { randomUUID } from "node:crypto";
import { loadLocalEnv, resolveServiceRoleKey, resolveSupabaseUrl } from "../src/env";
import { createServiceReviewClient } from "../src/client";
import { cleanupTransientReviewPackages, provisionReviewRlsFixtures } from "../src/fixtures";

async function main() {
  loadLocalEnv();
  const url = resolveSupabaseUrl();
  const key = resolveServiceRoleKey();
  if (!url || !key) {
    console.error("Hosted credentials missing. Logical restore drill not executed.");
    process.exit(1);
  }
  const started = Date.now();
  const fixtures = await provisionReviewRlsFixtures();
  const admin = createServiceReviewClient(url, key);
  const name = `ERA-7 restore ${randomUUID().slice(0, 8)}`;
  const inserted = await admin
    .from("engineering_review_packages")
    .insert({
      tenant_id: fixtures.tenantAId,
      workspace_id: fixtures.workspaceA1Id,
      project_id: fixtures.projectA1Id,
      name,
      status: "draft",
      documents: [],
      created_by: fixtures.users.a1.id,
    })
    .select("*")
    .single();
  if (inserted.error || !inserted.data) {
    console.error("restore_insert_failed");
    process.exit(1);
  }
  const snapshot = inserted.data as Record<string, unknown>;
  const id = String(snapshot.id);
  const deleted = await admin.from("engineering_review_packages").delete().eq("id", id);
  if (deleted.error) {
    console.error("restore_delete_failed");
    process.exit(1);
  }
  const restored = await admin.from("engineering_review_packages").insert(snapshot).select("id, name").single();
  await cleanupTransientReviewPackages();
  if (restored.error) {
    console.error("restore_reinsert_failed");
    process.exit(1);
  }
  console.log(
    JSON.stringify({
      backup_source: "logical_row_export",
      test_object: "engineering_review_packages",
      recovery_result: "PASS",
      elapsed_ms: Date.now() - started,
      observed_rpo: "logical_export_at_test_time",
      observed_rto_ms: Date.now() - started,
      pitr: "not_executed",
    }),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "restore_failed");
  process.exit(1);
});
