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

describe.skipIf(!LIVE)("EOS-A13A live JWT RLS", () => {
  loadLocalEnv();
  const url = resolveSupabaseUrl()!;
  const anonKey = resolveSupabaseAnonKey()!;
  const serviceKey = resolveServiceRoleKey()!;
  let fixtures: ReviewRlsFixtures;
  let environment: "ready" | "unavailable" = "unavailable";
  let connectionId = "";
  let repositoryId = "";
  let sourceId = "";

  async function rest(path: string, options: RequestInit = {}, jwt?: string) {
    return restFetch(url, anonKey, serviceKey, path, options, jwt);
  }

  beforeAll(async () => {
    if (mode === "misconfigured") {
      throw new Error("ENGINEERING_REVIEW_RLS=1 but hosted credentials are missing");
    }
    const applied = await applyHostedSqlFiles([
      "supabase/migrations/20261001180000_eos_a13a_m365_sharepoint_connector.sql",
    ]);
    if (applied.failed) {
      throw new Error(`A13A migration failed: ${applied.failed}`);
    }
    fixtures = await provisionReviewRlsFixtures();
    environment = "ready";
  });

  afterAll(async () => {
    if (environment === "ready") {
      if (sourceId) await rest(`engineering_external_source_refs?id=eq.${sourceId}`, { method: "DELETE" }, serviceKey);
      if (repositoryId) {
        await rest(`engineering_sharepoint_scopes?repository_id=eq.${repositoryId}`, { method: "DELETE" }, serviceKey);
        await rest(`engineering_managed_repositories?id=eq.${repositoryId}`, { method: "DELETE" }, serviceKey);
      }
      if (connectionId) await rest(`engineering_m365_connections?id=eq.${connectionId}`, { method: "DELETE" }, serviceKey);
      await cleanupTransientReviewPackages();
    }
  });

  beforeEach(({ skip }) => {
    if (environment !== "ready") {
      skip("SKIPPED_ENVIRONMENT_UNAVAILABLE: A13A tables are not on hosted Postgres");
    }
  });

  it("authorized admin mutates connection; engineer reads; other workspace, other tenant, and anonymous deny", async () => {
    connectionId = randomUUID();
    repositoryId = randomUUID();
    sourceId = randomUUID();
    const connection = await rest(
      "engineering_m365_connections",
      {
        method: "POST",
        body: JSON.stringify({
          id: connectionId,
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          display_name: "A13A live connection",
          microsoft_tenant_id: "11111111-2222-3333-4444-555555555555",
          application_id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
          credential_secret_id: "secret:m365-graph-client",
          auth_mode: "CLIENT_SECRET",
          status: "CONFIGURED",
          enabled: true,
        }),
      },
      fixtures.users.aAdmin.jwt,
    );
    expect(connection.status, JSON.stringify(connection.body)).toBeGreaterThanOrEqual(200);
    expect(connection.status).toBeLessThan(300);

    const engineerWrite = await rest(
      "engineering_m365_connections",
      {
        method: "POST",
        body: JSON.stringify({
          id: randomUUID(),
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          display_name: "engineer forged",
          microsoft_tenant_id: "11111111-2222-3333-4444-555555555555",
          application_id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
          credential_secret_id: "secret:forged",
          auth_mode: "CLIENT_SECRET",
          enabled: true,
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(mutationDenied(engineerWrite), JSON.stringify(engineerWrite.body)).toBe(true);

    const otherWorkspaceWrite = await rest(
      "engineering_m365_connections",
      {
        method: "POST",
        body: JSON.stringify({
          id: randomUUID(),
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA2Id,
          display_name: "cross workspace forged",
          microsoft_tenant_id: "11111111-2222-3333-4444-555555555555",
          application_id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
          credential_secret_id: "secret:forged-ws",
          auth_mode: "CLIENT_SECRET",
          enabled: true,
        }),
      },
      fixtures.users.aAdmin.jwt,
    );
    expect(mutationDenied(otherWorkspaceWrite), JSON.stringify(otherWorkspaceWrite.body)).toBe(true);

    const otherTenantWrite = await rest(
      "engineering_m365_connections",
      {
        method: "POST",
        body: JSON.stringify({
          id: randomUUID(),
          tenant_id: fixtures.tenantBId,
          workspace_id: fixtures.workspaceB1Id,
          display_name: "cross tenant forged",
          microsoft_tenant_id: "11111111-2222-3333-4444-555555555555",
          application_id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
          credential_secret_id: "secret:forged-tenant",
          auth_mode: "CLIENT_SECRET",
          enabled: true,
        }),
      },
      fixtures.users.aAdmin.jwt,
    );
    expect(mutationDenied(otherTenantWrite), JSON.stringify(otherTenantWrite.body)).toBe(true);


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
          repository_type: "SHAREPOINT_LIBRARY",
          display_name: "A13A live library",
          enabled: true,
          capture_policy: "MANAGED",
          connection_id: connectionId,
        }),
      },
      fixtures.users.aAdmin.jwt,
    );
    expect(repo.status, JSON.stringify(repo.body)).toBeGreaterThanOrEqual(200);
    expect(repo.status).toBeLessThan(300);

    const source = await rest(
      "engineering_external_source_refs",
      {
        method: "POST",
        body: JSON.stringify({
          id: sourceId,
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          project_id: fixtures.projectA1Id,
          repository_id: repositoryId,
          connection_id: connectionId,
          source_system: "sharepoint",
          site_id: "site-a",
          drive_id: "drive-a",
          item_id: "item-a",
          display_name: "Mechanical Load.xlsx",
          path_within_root: "/Engineering/Mechanical_Load.xlsx",
          availability: "ACTIVE",
          fingerprint: "item-a:etag-1",
          occurred_at: "2026-10-01T00:00:00.000Z",
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(source.status, JSON.stringify(source.body)).toBeGreaterThanOrEqual(200);
    expect(source.status).toBeLessThan(300);

    const own = await rest(`engineering_external_source_refs?select=id,display_name&id=eq.${sourceId}`, {}, fixtures.users.a1.jwt);
    expect(own.status).toBe(200);
    expect(ids(own.body)).toContain(sourceId);

    const a2 = await rest(`engineering_external_source_refs?select=id&id=eq.${sourceId}`, {}, fixtures.users.a2.jwt);
    expect(a2.status).toBe(200);
    expect(ids(a2.body)).toEqual([]);

    const b1 = await rest(`engineering_m365_connections?select=id,display_name&id=eq.${connectionId}`, {}, fixtures.users.b1.jwt);
    expect(b1.status).toBe(200);
    expect(ids(b1.body)).toEqual([]);
    expect(JSON.stringify(b1.body)).not.toContain("A13A live connection");

    const anon = await rest(`engineering_m365_connections?select=id&id=eq.${connectionId}`);
    expect(anonReadDenied(anon), JSON.stringify(anon.body)).toBe(true);
  });
});
