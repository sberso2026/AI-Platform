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

describe.skipIf(!LIVE)("EOS-A13B live JWT RLS", () => {
  loadLocalEnv();
  const url = resolveSupabaseUrl()!;
  const anonKey = resolveSupabaseAnonKey()!;
  const serviceKey = resolveServiceRoleKey()!;
  let fixtures: ReviewRlsFixtures;
  let environment: "ready" | "unavailable" = "unavailable";
  let connectionId = "";
  let bindingId = "";
  let objectId = "";
  let repositoryId = "";

  async function rest(path: string, options: RequestInit = {}, jwt?: string) {
    return restFetch(url, anonKey, serviceKey, path, options, jwt);
  }

  beforeAll(async () => {
    if (mode === "misconfigured") {
      throw new Error("ENGINEERING_REVIEW_RLS=1 but hosted credentials are missing");
    }
    const applied = await applyHostedSqlFiles([
      "supabase/migrations/20261001190000_eos_a13b_engineering_edms_construction_connectors.sql",
    ]);
    if (applied.failed) {
      throw new Error(`A13B migration failed: ${applied.failed}`);
    }
    fixtures = await provisionReviewRlsFixtures();
    environment = "ready";
  });

  afterAll(async () => {
    if (environment === "ready") {
      if (objectId) await rest(`engineering_external_object_refs?id=eq.${objectId}`, { method: "DELETE" }, serviceKey);
      if (bindingId) await rest(`engineering_external_project_bindings?id=eq.${bindingId}`, { method: "DELETE" }, serviceKey);
      if (repositoryId) await rest(`engineering_managed_repositories?id=eq.${repositoryId}`, { method: "DELETE" }, serviceKey);
      if (connectionId) await rest(`engineering_external_connections?id=eq.${connectionId}`, { method: "DELETE" }, serviceKey);
      await cleanupTransientReviewPackages();
    }
  });

  beforeEach(({ skip }) => {
    if (environment !== "ready") {
      skip("SKIPPED_ENVIRONMENT_UNAVAILABLE: A13B tables are not on hosted Postgres");
    }
  });

  it("authorized admin mutates connections; engineer reads objects; other workspace, other tenant, and anonymous deny", async () => {
    connectionId = randomUUID();
    bindingId = randomUUID();
    objectId = randomUUID();
    repositoryId = randomUUID();
    const connection = await rest(
      "engineering_external_connections",
      {
        method: "POST",
        body: JSON.stringify({
          id: connectionId,
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          display_name: "A13B live EDMS",
          category: "EDMS",
          vendor: "ACONEX",
          credential_secret_id: "secret:edms-oauth",
          auth_mode: "OAUTH",
          write_policy: "READ_ONLY",
          status: "CONFIGURED",
          enabled: true,
        }),
      },
      fixtures.users.aAdmin.jwt,
    );
    expect(connection.status, JSON.stringify(connection.body)).toBeGreaterThanOrEqual(200);
    expect(connection.status).toBeLessThan(300);

    const engineerWrite = await rest(
      "engineering_external_connections",
      {
        method: "POST",
        body: JSON.stringify({
          id: randomUUID(),
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          display_name: "forged",
          category: "EDMS",
          vendor: "ACONEX",
          credential_secret_id: "secret:forged",
          auth_mode: "OAUTH",
          write_policy: "READ_ONLY",
          enabled: true,
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(mutationDenied(engineerWrite), JSON.stringify(engineerWrite.body)).toBe(true);

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
          repository_type: "ENGINEERING_EDMS",
          display_name: "A13B live EDMS repo",
          enabled: true,
          capture_policy: "MANAGED",
          connection_id: connectionId,
        }),
      },
      fixtures.users.aAdmin.jwt,
    );
    expect(repo.status, JSON.stringify(repo.body)).toBeGreaterThanOrEqual(200);
    expect(repo.status).toBeLessThan(300);

    const binding = await rest(
      "engineering_external_project_bindings",
      {
        method: "POST",
        body: JSON.stringify({
          id: bindingId,
          connection_id: connectionId,
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          eos_project_id: fixtures.projectA1Id,
          external_account_id: "acct-a",
          external_project_id: "ext-a",
          repository_id: repositoryId,
          enabled: true,
        }),
      },
      fixtures.users.aAdmin.jwt,
    );
    expect(binding.status, JSON.stringify(binding.body)).toBeGreaterThanOrEqual(200);
    expect(binding.status).toBeLessThan(300);

    const object = await rest(
      "engineering_external_object_refs",
      {
        method: "POST",
        body: JSON.stringify({
          id: objectId,
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          project_id: fixtures.projectA1Id,
          connection_id: connectionId,
          binding_id: bindingId,
          repository_id: repositoryId,
          source_system: "aconex",
          external_account_id: "acct-a",
          external_project_id: "ext-a",
          object_type: "RFI",
          object_id: "ext-rfi-live",
          object_number: "RFI-142",
          display_name: "Anchor bolt clash",
          fingerprint: "live-a13b",
          occurred_at: "2026-10-01T00:00:00.000Z",
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(object.status, JSON.stringify(object.body)).toBeGreaterThanOrEqual(200);
    expect(object.status).toBeLessThan(300);

    const own = await rest(`engineering_external_object_refs?select=id,object_number&id=eq.${objectId}`, {}, fixtures.users.a1.jwt);
    expect(own.status).toBe(200);
    expect(ids(own.body)).toContain(objectId);

    const a2 = await rest(`engineering_external_object_refs?select=id&id=eq.${objectId}`, {}, fixtures.users.a2.jwt);
    expect(a2.status).toBe(200);
    expect(ids(a2.body)).toEqual([]);

    const b1 = await rest(`engineering_external_connections?select=id,display_name&id=eq.${connectionId}`, {}, fixtures.users.b1.jwt);
    expect(b1.status).toBe(200);
    expect(ids(b1.body)).toEqual([]);
    expect(JSON.stringify(b1.body)).not.toContain("A13B live EDMS");

    const anon = await rest(`engineering_external_connections?select=id&id=eq.${connectionId}`);
    expect(anonReadDenied(anon), JSON.stringify(anon.body)).toBe(true);
  });
});
