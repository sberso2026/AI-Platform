import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { applyHostedReviewMigrations } from "../scripts/apply-hosted-migration";
import { createServiceReviewClient } from "./client";
import {
  liveRlsMode,
  loadLocalEnv,
  resolveServiceRoleKey,
  resolveSupabaseUrl,
} from "./env";
import {
  cleanupTransientReviewPackages,
  provisionReviewRlsFixtures,
  type ReviewRlsFixtures,
} from "./fixtures";

const mode = liveRlsMode();
const LIVE = mode === "run";

describe.skipIf(!LIVE)("ERA-7 Review persistence recovery drill", () => {
  loadLocalEnv();
  const url = resolveSupabaseUrl()!;
  const serviceKey = resolveServiceRoleKey()!;
  let fixtures: ReviewRlsFixtures;
  let environment: "ready" | "unavailable" = "unavailable";

  beforeAll(async () => {
    if (mode === "misconfigured") throw new Error("ENGINEERING_REVIEW_RLS=1 but hosted credentials are missing");
    const applied = await applyHostedReviewMigrations();
    if (!applied.hostedTablesReady) {
      environment = "unavailable";
      return;
    }
    fixtures = await provisionReviewRlsFixtures();
    environment = "ready";
  });

  afterAll(async () => {
    if (environment === "ready") await cleanupTransientReviewPackages();
  });

  beforeEach(({ skip }) => {
    if (environment !== "ready") skip("SKIPPED_ENVIRONMENT_UNAVAILABLE");
  });

  it("can export, delete, and restore a disposable Review package row", async () => {
    const started = Date.now();
    const admin = createServiceReviewClient(url, serviceKey);
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
    expect(inserted.error).toBeNull();
    const snapshot = inserted.data as Record<string, unknown>;
    const id = String(snapshot.id);

    const deleted = await admin.from("engineering_review_packages").delete().eq("id", id);
    expect(deleted.error).toBeNull();
    const missing = await admin.from("engineering_review_packages").select("id").eq("id", id).maybeSingle();
    expect(missing.data).toBeNull();

    const restored = await admin.from("engineering_review_packages").insert(snapshot).select("id, name").single();
    expect(restored.error).toBeNull();
    expect(restored.data?.name).toBe(name);
    const elapsedMs = Date.now() - started;
    expect(elapsedMs).toBeLessThan(30_000);
  });
});
