import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createReviewPackage } from "@rtb/engineering-review";
import { applyHostedReviewMigrations } from "../scripts/apply-hosted-migration";
import { bindTrustedReviewAudit } from "./audit-bind";
import { createAuthenticatedReviewClient, createServiceReviewClient } from "./client";
import {
  liveRlsMode,
  loadLocalEnv,
  resolveServiceRoleKey,
  resolveSupabaseAnonKey,
  resolveSupabaseUrl,
} from "./env";
import { restFetch } from "./live-http";
import {
  cleanupTransientReviewPackages,
  provisionReviewRlsFixtures,
  type ReviewRlsFixtures,
} from "./fixtures";
import { createSupabaseEngineeringReviewStore } from "./supabase-store";

const mode = liveRlsMode();
const LIVE = mode === "run";

describe.skipIf(!LIVE)("ERA-6 trusted audit live attestation", () => {
  loadLocalEnv();
  const url = resolveSupabaseUrl()!;
  const anonKey = resolveSupabaseAnonKey()!;
  const serviceKey = resolveServiceRoleKey()!;
  let fixtures: ReviewRlsFixtures;
  let environment: "ready" | "unavailable" = "unavailable";

  async function rest(path: string, options: RequestInit = {}, jwt?: string) {
    return restFetch(url, anonKey, serviceKey, path, options, jwt);
  }

  beforeAll(async () => {
    if (mode === "misconfigured") {
      throw new Error("ENGINEERING_REVIEW_RLS=1 but hosted credentials are missing");
    }
    const applied = await applyHostedReviewMigrations();
    if (!applied.hostedTablesReady) {
      environment = "unavailable";
      return;
    }
    fixtures = await provisionReviewRlsFixtures();
    environment = "ready";
  });

  afterAll(async () => {
    if (environment === "ready") {
      await cleanupTransientReviewPackages();
    }
  });

  beforeEach(({ skip }) => {
    if (environment !== "ready") {
      skip("SKIPPED_ENVIRONMENT_UNAVAILABLE");
    }
  });

  it("user JWT cannot arbitrarily INSERT audit_events", async () => {
    const forged = await rest(
      "audit_events",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          user_id: fixtures.users.a1.id,
          action: "review_package.created",
          resource_type: "engineering_review_package",
          resource_id: fixtures.packageA1Id,
          metadata: { forged: true, extracted_text: "should never land" },
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(forged.status).toBeGreaterThanOrEqual(400);
  });

  it("trusted service boundary writes package/run/disposition audit with correct context", async () => {
    const user = createAuthenticatedReviewClient(url, anonKey, fixtures.users.a1.jwt);
    const service = createServiceReviewClient(url, serviceKey);
    const store = createSupabaseEngineeringReviewStore({
      client: user,
      kind: "authenticated",
      audit: bindTrustedReviewAudit(service),
    });

    const pkg = await store.saveReviewPackage(
      createReviewPackage({
        id: randomUUID(),
        tenantId: fixtures.tenantAId,
        workspaceId: fixtures.workspaceA1Id,
        projectId: fixtures.projectA1Id,
        name: `ERA-6 audit ${randomUUID().slice(0, 8)}`,
        createdBy: fixtures.users.a1.id,
      }),
    );

    await new Promise((resolve) => setTimeout(resolve, 400));

    const listed = await rest(
      `audit_events?select=id,tenant_id,workspace_id,user_id,action,resource_type,resource_id,metadata&resource_id=eq.${pkg.id}&action=eq.review_package.created`,
      {},
      serviceKey,
    );
    expect(listed.status).toBe(200);
    const rows = Array.isArray(listed.body) ? listed.body : [];
    expect(rows.length).toBeGreaterThan(0);
    const row = rows[0] as {
      tenant_id: string;
      workspace_id: string;
      user_id: string;
      action: string;
      resource_type: string;
      metadata: Record<string, unknown>;
    };
    expect(row.tenant_id).toBe(fixtures.tenantAId);
    expect(row.workspace_id).toBe(fixtures.workspaceA1Id);
    expect(row.user_id).toBe(fixtures.users.a1.id);
    expect(row.action).toBe("review_package.created");
    expect(JSON.stringify(row.metadata ?? {})).not.toMatch(/extracted_text|service_role|password/i);
  });

  it("does not expose the service-role key in audit payloads", async () => {
    const listed = await rest(
      `audit_events?select=metadata&tenant_id=eq.${fixtures.tenantAId}&limit=5`,
      {},
      serviceKey,
    );
    expect(JSON.stringify(listed.body)).not.toContain(serviceKey.slice(0, 12));
  });
});
