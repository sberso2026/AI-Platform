import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { applyHostedSqlFiles } from "../../engineering-os/scripts/apply-hosted-sql";
import {
  liveRlsMode,
  loadLocalEnv,
  resolveServiceRoleKey,
  resolveSupabaseAnonKey,
  resolveSupabaseUrl,
} from "./env";
import { anonReadDenied, ids, mutationDenied, restFetch } from "./live-http";
import {
  cleanupTransientReviewPackages,
  provisionReviewRlsFixtures,
  type ReviewRlsFixtures,
} from "./fixtures";

const mode = liveRlsMode();
const LIVE = mode === "run";

describe.skipIf(!LIVE)("EOS-A10B live JWT RLS", () => {
  loadLocalEnv();
  const url = resolveSupabaseUrl()!;
  const anonKey = resolveSupabaseAnonKey()!;
  const serviceKey = resolveServiceRoleKey()!;
  let fixtures: ReviewRlsFixtures;
  let environment: "ready" | "unavailable" = "unavailable";
  let repositoryId = "";
  let eventId = "";

  async function rest(path: string, options: RequestInit = {}, jwt?: string) {
    return restFetch(url, anonKey, serviceKey, path, options, jwt);
  }

  beforeAll(async () => {
    if (mode === "misconfigured") {
      throw new Error("ENGINEERING_REVIEW_RLS=1 but hosted credentials are missing");
    }
    const applied = await applyHostedSqlFiles([
      "supabase/migrations/20260930140000_eos_a10b_engineering_work_context.sql",
    ]);
    if (applied.failed) {
      throw new Error(`A10B migration failed: ${applied.failed}`);
    }
    fixtures = await provisionReviewRlsFixtures();
    environment = "ready";
  });

  afterAll(async () => {
    if (environment === "ready") {
      await cleanupTransientReviewPackages();
      if (eventId) {
        await rest(`engineering_work_events?id=eq.${eventId}`, { method: "DELETE" }, serviceKey);
      }
      if (repositoryId) {
        await rest(`engineering_managed_repositories?id=eq.${repositoryId}`, { method: "DELETE" }, serviceKey);
      }
    }
  });

  beforeEach(({ skip }) => {
    if (environment !== "ready") {
      skip("SKIPPED_ENVIRONMENT_UNAVAILABLE: A10B tables are not on hosted Postgres");
    }
  });

  it("same workspace authorized read; other workspace, other tenant, and anonymous deny", async () => {
    eventId = randomUUID();
    repositoryId = randomUUID();
    const repo = await rest(
      "engineering_managed_repositories",
      {
        method: "POST",
        body: JSON.stringify({
          id: repositoryId,
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          project_id: fixtures.projectA1Id,
          scope: "PROJECT",
          repository_type: "CORPORATE_SYNCED_FOLDER",
          display_name: "A10B live repo",
          enabled: true,
          capture_policy: "MANAGED",
        }),
      },
      fixtures.users.aAdmin.jwt,
    );
    expect(repo.status, JSON.stringify(repo.body)).toBeGreaterThanOrEqual(200);
    expect(repo.status).toBeLessThan(300);

    const inserted = await rest(
      "engineering_work_events",
      {
        method: "POST",
        body: JSON.stringify({
          id: eventId,
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          project_id: fixtures.projectA1Id,
          event_type: "SOURCE_REVISED",
          source_system: "sharepoint",
          source_object_type: "document",
          source_object_id: "doc-a10b-live",
          source_event_id: `live-${eventId}`,
          occurred_at: "2026-10-01T00:00:00.000Z",
          materiality: "ROUTINE",
          confirmation_state: "NOT_REQUIRED",
          capture_reason: "Captured because repository=A10B live repo policy=Managed Engineering.",
          managed_repository_id: repositoryId,
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(inserted.status, JSON.stringify(inserted.body)).toBeGreaterThanOrEqual(200);
    expect(inserted.status).toBeLessThan(300);

    const own = await rest(`engineering_work_events?select=id,source_object_id&id=eq.${eventId}`, {}, fixtures.users.a1.jwt);
    expect(own.status).toBe(200);
    expect(ids(own.body)).toContain(eventId);

    const a2 = await rest(`engineering_work_events?select=id&id=eq.${eventId}`, {}, fixtures.users.a2.jwt);
    expect(a2.status).toBe(200);
    expect(ids(a2.body)).toEqual([]);

    const b1 = await rest(`engineering_work_events?select=id,source_object_id&id=eq.${eventId}`, {}, fixtures.users.b1.jwt);
    expect(b1.status).toBe(200);
    expect(ids(b1.body)).toEqual([]);
    expect(JSON.stringify(b1.body)).not.toContain("doc-a10b-live");

    const anon = await rest(`engineering_work_events?select=id&id=eq.${eventId}`);
    expect(anonReadDenied(anon), JSON.stringify(anon.body)).toBe(true);
  });

  it("normal engineer cannot mutate managed repository policy; admin can insert permitted repository", async () => {
    const policyRepoId = randomUUID();
    const payload = {
      id: policyRepoId,
      tenant_id: fixtures.tenantAId,
      workspace_id: fixtures.workspaceA1Id,
      project_id: fixtures.projectA1Id,
      scope: "PROJECT",
      repository_type: "SHAREPOINT_LIBRARY",
      display_name: "A10B policy repo",
      enabled: true,
      capture_policy: "MANAGED",
    };
    const engineer = await rest(
      "engineering_managed_repositories",
      { method: "POST", body: JSON.stringify(payload) },
      fixtures.users.a1.jwt,
    );
    expect(mutationDenied(engineer), JSON.stringify(engineer.body)).toBe(true);

    const admin = await rest(
      "engineering_managed_repositories",
      { method: "POST", body: JSON.stringify(payload) },
      fixtures.users.aAdmin.jwt,
    );
    expect(admin.status, JSON.stringify(admin.body)).toBeGreaterThanOrEqual(200);
    expect(admin.status).toBeLessThan(300);
    await rest(`engineering_managed_repositories?id=eq.${policyRepoId}`, { method: "DELETE" }, serviceKey);
  });
});
