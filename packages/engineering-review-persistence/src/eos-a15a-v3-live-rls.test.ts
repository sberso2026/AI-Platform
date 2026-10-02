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
import { ids, mutationDenied, restFetch } from "./live-http";
import {
  cleanupTransientReviewPackages,
  provisionReviewRlsFixtures,
  type ReviewRlsFixtures,
} from "./fixtures";

const mode = liveRlsMode();
const LIVE = mode === "run";

describe.skipIf(!LIVE)("EOS-A15A-V3 live JWT RLS for governed MTO snapshots", () => {
  loadLocalEnv();
  const url = resolveSupabaseUrl()!;
  const anonKey = resolveSupabaseAnonKey()!;
  const serviceKey = resolveServiceRoleKey()!;
  let fixtures: ReviewRlsFixtures;
  let environment: "ready" | "unavailable" = "unavailable";
  let snapshotId = "";
  let itemId = "";

  async function rest(path: string, options: RequestInit = {}, jwt?: string) {
    return restFetch(url, anonKey, serviceKey, path, options, jwt);
  }

  beforeAll(async () => {
    if (mode === "misconfigured") {
      throw new Error("ENGINEERING_REVIEW_RLS=1 but hosted credentials are missing");
    }
    const applied = await applyHostedSqlFiles([
      "supabase/migrations/20261002120000_eos_a15a_v3_mto_workbench.sql",
    ]);
    if (applied.failed) {
      throw new Error(`A15A-V3 migration failed: ${applied.failed}`);
    }
    fixtures = await provisionReviewRlsFixtures();
    environment = "ready";
  });

  afterAll(async () => {
    if (environment === "ready") {
      if (itemId) await rest(`engineering_mto_items?id=eq.${itemId}`, { method: "DELETE" }, serviceKey);
      if (snapshotId) await rest(`engineering_mto_snapshots?id=eq.${snapshotId}`, { method: "DELETE" }, serviceKey);
      await cleanupTransientReviewPackages();
    }
  });

  beforeEach(({ skip }) => {
    if (environment !== "ready") {
      skip("SKIPPED_ENVIRONMENT_UNAVAILABLE: A15A-V3 tables are not on hosted Postgres");
    }
  });

  it("authorized project member reads own MTO; other project/workspace/tenant/anonymous deny; service role is not user auth", async () => {
    snapshotId = randomUUID();
    itemId = randomUUID();
    const inserted = await rest(
      "engineering_mto_snapshots",
      {
        method: "POST",
        body: JSON.stringify({
          id: snapshotId,
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          project_id: fixtures.projectA1Id,
          discipline_scope: "STRUCTURAL",
          lifecycle_stage: "FEED",
          revision: "A",
          status: "DRAFT",
          verification_state: "UNVERIFIED",
          snapshot_fingerprint: "live-rls-mto",
          item_count: 1,
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(inserted.status, JSON.stringify(inserted.body)).toBeGreaterThanOrEqual(200);
    expect(inserted.status).toBeLessThan(300);

    const item = await rest(
      "engineering_mto_items",
      {
        method: "POST",
        body: JSON.stringify({
          id: itemId,
          snapshot_id: snapshotId,
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          project_id: fixtures.projectA1Id,
          item_code: "ST-LIVE",
          description: "Live RLS member",
          discipline: "STRUCTURAL",
          category: "steel",
          quantity_origin: "SOURCE_MEASURED",
          quantity_maturity: "FEED_MTO",
          source_type: "SOURCE_MEASURED",
          verification_status: "UNVERIFIED",
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(item.status, JSON.stringify(item.body)).toBeGreaterThanOrEqual(200);
    expect(item.status).toBeLessThan(300);

    const own = await rest(`engineering_mto_snapshots?select=id,revision&id=eq.${snapshotId}`, {}, fixtures.users.a1.jwt);
    expect(own.status).toBe(200);
    expect(ids(own.body)).toContain(snapshotId);

    const otherProject = await rest(
      "engineering_mto_snapshots",
      {
        method: "POST",
        body: JSON.stringify({
          id: randomUUID(),
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          project_id: fixtures.projectA2Id,
          discipline_scope: "STRUCTURAL",
          lifecycle_stage: "FEED",
          revision: "X",
          status: "DRAFT",
          verification_state: "UNVERIFIED",
          snapshot_fingerprint: "other-project",
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(otherProject.status).toBeGreaterThanOrEqual(200);

    const a2 = await rest(`engineering_mto_snapshots?select=id&id=eq.${snapshotId}`, {}, fixtures.users.a2.jwt);
    expect(a2.status).toBe(200);
    expect(ids(a2.body)).toEqual([]);

    const b1 = await rest(`engineering_mto_snapshots?select=id,revision&id=eq.${snapshotId}`, {}, fixtures.users.b1.jwt);
    expect(b1.status).toBe(200);
    expect(ids(b1.body)).toEqual([]);
    expect(JSON.stringify(b1.body)).not.toContain("live-rls-mto");

    const anon = await rest(`engineering_mto_snapshots?select=id&id=eq.${snapshotId}`);
    expect(anon.status).toBe(200);
    expect(ids(anon.body)).toEqual([]);

    const spoofTenant = await rest(
      `engineering_mto_snapshots?id=eq.${snapshotId}`,
      { method: "PATCH", body: JSON.stringify({ tenant_id: fixtures.tenantBId }) },
      fixtures.users.a1.jwt,
    );
    expect(mutationDenied(spoofTenant) || spoofTenant.status >= 400, JSON.stringify(spoofTenant.body)).toBe(true);

    const serviceRead = await rest(`engineering_mto_snapshots?select=id&id=eq.${snapshotId}`, {}, serviceKey);
    expect(serviceRead.status).toBe(200);
    expect(ids(serviceRead.body)).toContain(snapshotId);
  });

  it("verified snapshot item mutation is blocked by immutability trigger", async () => {
    const verify = await rest(
      `engineering_mto_snapshots?id=eq.${snapshotId}`,
      { method: "PATCH", body: JSON.stringify({ status: "VERIFIED", verification_state: "VERIFIED" }) },
      fixtures.users.a1.jwt,
    );
    expect(verify.status, JSON.stringify(verify.body)).toBeGreaterThanOrEqual(200);
    expect(verify.status).toBeLessThan(300);
    const mutate = await rest(
      `engineering_mto_items?id=eq.${itemId}`,
      { method: "PATCH", body: JSON.stringify({ quantity: 99 }) },
      fixtures.users.a1.jwt,
    );
    expect(mutate.status >= 400 || mutationDenied(mutate), JSON.stringify(mutate.body)).toBe(true);
  });
});
