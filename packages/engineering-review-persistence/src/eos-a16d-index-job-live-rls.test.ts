import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { applyHostedSqlFiles } from "../../engineering-os/scripts/apply-hosted-sql";
import {
  certUserPassword,
  liveRlsMode,
  loadLocalEnv,
  resolveServiceRoleKey,
  resolveSupabaseAnonKey,
  resolveSupabaseUrl,
} from "./env";
import { mutationDenied, restFetch } from "./live-http";
import { createServiceReviewClient, signInAccessToken } from "./client";
import {
  cleanupTransientReviewPackages,
  provisionReviewRlsFixtures,
  type ReviewRlsFixtures,
} from "./fixtures";

const mode = liveRlsMode();
const LIVE = mode === "run";
const JOB_TYPE = "engineering.m365.sharepoint.sync";
const PAYLOAD_REPO = "repo-a16d";

describe.skipIf(!LIVE)("EOS-A16D live JWT SharePoint index job INSERT", () => {
  loadLocalEnv();
  const url = resolveSupabaseUrl()!;
  const anonKey = resolveSupabaseAnonKey()!;
  const serviceKey = resolveServiceRoleKey()!;
  let fixtures: ReviewRlsFixtures;
  let environment: "ready" | "unavailable" = "unavailable";
  let engineeringOwner: { id: string; jwt: string };

  async function rest(path: string, options: RequestInit = {}, jwt?: string) {
    return restFetch(url, anonKey, serviceKey, path, options, jwt);
  }

  function jobRow(actorId: string, overrides: Record<string, unknown> = {}) {
    return {
      tenant_id: fixtures.tenantAId,
      workspace_id: fixtures.workspaceA1Id,
      job_type: JOB_TYPE,
      payload: { repositoryId: PAYLOAD_REPO, mode: "initial" },
      status: "pending",
      created_by: actorId,
      ...overrides,
    };
  }

  beforeAll(async () => {
    if (mode === "misconfigured") {
      throw new Error("ENGINEERING_REVIEW_RLS=1 but hosted credentials are missing");
    }
    const applied = await applyHostedSqlFiles([
      "supabase/migrations/20261004180000_eos_a16d_sharepoint_sync_job_insert.sql",
    ]);
    if (applied.failed) {
      throw new Error(`A16D index-job migration failed: ${applied.failed}`);
    }
    fixtures = await provisionReviewRlsFixtures();
    await rest(`background_jobs?payload->>repositoryId=eq.${PAYLOAD_REPO}`, { method: "DELETE" }, serviceKey);
    const admin = createServiceReviewClient(url, serviceKey);
    const password = certUserPassword();
    const email = "cert-er-a-eng-owner@rtb-cert.test";
    const listed = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (listed.error) throw new Error(`listUsers: ${listed.error.message}`);
    const existing = listed.data.users.find((user) => user.email === email);
    let userId: string;
    if (existing) {
      const updated = await admin.auth.admin.updateUserById(existing.id, { password, email_confirm: true });
      if (updated.error) throw new Error(`update ${email}: ${updated.error.message}`);
      userId = existing.id;
    } else {
      const created = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          cert_fixture: true,
          invited_tenant_id: fixtures.tenantAId,
          invited_role_slug: "engineering-owner",
          invited_workspace_id: fixtures.workspaceA1Id,
        },
      });
      if (created.error || !created.data.user) throw new Error(`create ${email}: ${created.error?.message}`);
      userId = created.data.user.id;
    }
    let { data: role, error: roleError } = await admin
      .from("roles")
      .select("id")
      .eq("tenant_id", fixtures.tenantAId)
      .eq("slug", "engineering-owner")
      .maybeSingle();
    if (roleError) throw new Error(`engineering-owner role: ${roleError.message}`);
    if (!role?.id) {
      const inserted = await admin
        .from("roles")
        .insert({
          tenant_id: fixtures.tenantAId,
          name: "Engineering Owner",
          slug: "engineering-owner",
          description: "A16D index-job fixture",
          permissions: [
            { resource: "engineering", action: "admin" },
            { resource: "engineering", action: "execute" },
            { resource: "engineering", action: "read" },
          ],
          is_system: true,
        })
        .select("id")
        .single();
      if (inserted.error || !inserted.data?.id) throw new Error(`insert engineering-owner: ${inserted.error?.message}`);
      role = inserted.data;
    }
    const membership = await admin.from("tenant_memberships").upsert(
      {
        tenant_id: fixtures.tenantAId,
        user_id: userId,
        role_id: role.id,
        status: "active",
        joined_at: new Date().toISOString(),
      },
      { onConflict: "tenant_id,user_id" },
    ).select("id").single();
    if (membership.error) throw new Error(`tenant membership: ${membership.error.message}`);
    const workspaceMembership = await admin.from("workspace_memberships").upsert(
      { workspace_id: fixtures.workspaceA1Id, user_id: userId, role_id: role.id },
      { onConflict: "workspace_id,user_id" },
    ).select("id").single();
    if (workspaceMembership.error) throw new Error(`workspace membership: ${workspaceMembership.error.message}`);
    engineeringOwner = { id: userId, jwt: await signInAccessToken(url, anonKey, email, password) };
    environment = "ready";
  });

  afterAll(async () => {
    if (environment === "ready") {
      await rest(`background_jobs?payload->>repositoryId=eq.${PAYLOAD_REPO}`, { method: "DELETE" }, serviceKey);
      await cleanupTransientReviewPackages();
    }
  });

  beforeEach(({ skip }) => {
    if (environment !== "ready") {
      skip("SKIPPED_ENVIRONMENT_UNAVAILABLE: A16D index-job policy is not on hosted Postgres");
    }
  });

  it("authorized engineering-owner inserts the SharePoint sync job; unauthorized, cross-scope, and malformed inserts deny", async () => {
    const authorized = await rest(
      "background_jobs",
      { method: "POST", body: JSON.stringify(jobRow(engineeringOwner.id)) },
      engineeringOwner.jwt,
    );
    expect(authorized.status, JSON.stringify(authorized.body)).toBeGreaterThanOrEqual(200);
    expect(authorized.status).toBeLessThan(300);

    const unauthorized = await rest(
      "background_jobs",
      { method: "POST", body: JSON.stringify(jobRow(fixtures.users.a1.id)) },
      fixtures.users.a1.jwt,
    );
    expect(mutationDenied(unauthorized), JSON.stringify(unauthorized.body)).toBe(true);

    const crossTenant = await rest(
      "background_jobs",
      {
        method: "POST",
        body: JSON.stringify(jobRow(fixtures.users.b1.id, {
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
        })),
      },
      fixtures.users.b1.jwt,
    );
    expect(mutationDenied(crossTenant), JSON.stringify(crossTenant.body)).toBe(true);

    const crossWorkspace = await rest(
      "background_jobs",
      {
        method: "POST",
        body: JSON.stringify(jobRow(engineeringOwner.id, { workspace_id: fixtures.workspaceA2Id })),
      },
      engineeringOwner.jwt,
    );
    expect(mutationDenied(crossWorkspace), JSON.stringify(crossWorkspace.body)).toBe(true);

    const malformedType = await rest(
      "background_jobs",
      {
        method: "POST",
        body: JSON.stringify(jobRow(engineeringOwner.id, { job_type: "engineering.optimization.evaluate" })),
      },
      engineeringOwner.jwt,
    );
    expect(mutationDenied(malformedType), JSON.stringify(malformedType.body)).toBe(true);

    const malformedScope = await rest(
      "background_jobs",
      {
        method: "POST",
        body: JSON.stringify(jobRow(engineeringOwner.id, { workspace_id: null })),
      },
      engineeringOwner.jwt,
    );
    expect(mutationDenied(malformedScope), JSON.stringify(malformedScope.body)).toBe(true);

    const anonymous = await rest(
      "background_jobs",
      { method: "POST", body: JSON.stringify(jobRow(engineeringOwner.id, { id: randomUUID() })) },
    );
    expect(mutationDenied(anonymous), JSON.stringify(anonymous.body)).toBe(true);
  });
});
