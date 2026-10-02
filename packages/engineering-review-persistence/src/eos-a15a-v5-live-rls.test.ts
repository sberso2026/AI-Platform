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

describe.skipIf(!LIVE)("EOS-A15A-V5 live JWT RLS for structural calculations", () => {
  loadLocalEnv();
  const url = resolveSupabaseUrl()!;
  const anonKey = resolveSupabaseAnonKey()!;
  const serviceKey = resolveServiceRoleKey()!;
  let fixtures: ReviewRlsFixtures;
  let environment: "ready" | "unavailable" = "unavailable";
  let calculationId = "";

  async function rest(path: string, options: RequestInit = {}, jwt?: string) {
    return restFetch(url, anonKey, serviceKey, path, options, jwt);
  }

  beforeAll(async () => {
    if (mode === "misconfigured") {
      throw new Error("ENGINEERING_REVIEW_RLS=1 but hosted credentials are missing");
    }
    const applied = await applyHostedSqlFiles([
      "supabase/migrations/20261002140000_eos_a15a_v5_structural_work_generator.sql",
    ]);
    if (applied.failed) {
      throw new Error(`A15A-V5 migration failed: ${applied.failed}`);
    }
    fixtures = await provisionReviewRlsFixtures();
    environment = "ready";
  });

  afterAll(async () => {
    if (environment === "ready" && calculationId) {
      await rest(`engineering_structural_calculations?id=eq.${calculationId}`, { method: "DELETE" }, serviceKey);
      await cleanupTransientReviewPackages();
    }
  });

  beforeEach(({ skip }) => {
    if (environment !== "ready") {
      skip("SKIPPED_ENVIRONMENT_UNAVAILABLE: A15A-V5 tables are not on hosted Postgres");
    }
  });

  it("authorized project member reads own calculation; other project/workspace/tenant/anonymous deny; service role is not user auth", async () => {
    calculationId = randomUUID();
    const inserted = await rest(
      "engineering_structural_calculations",
      {
        method: "POST",
        body: JSON.stringify({
          id: calculationId,
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          project_id: fixtures.projectA1Id,
          work_kind: "STRUCTURAL_MEMBER_CHECK",
          revision: "A",
          status: "REVIEW_REQUIRED",
          review_status: "UNVERIFIED",
          input_fingerprint: "live-rls-struct",
          engine_id: "EOS_STRUCTURAL_DETERMINISTIC_V1",
          engine_version: "1.0.0",
          manifest: { id: calculationId },
          design_basis: { complete: true },
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(inserted.status, JSON.stringify(inserted.body)).toBeGreaterThanOrEqual(200);
    expect(inserted.status).toBeLessThan(300);

    const own = await rest(`engineering_structural_calculations?select=id,revision&id=eq.${calculationId}`, {}, fixtures.users.a1.jwt);
    expect(own.status).toBe(200);
    expect(ids(own.body)).toContain(calculationId);

    const a2 = await rest(`engineering_structural_calculations?select=id&id=eq.${calculationId}`, {}, fixtures.users.a2.jwt);
    expect(a2.status).toBe(200);
    expect(ids(a2.body)).toEqual([]);

    const b1 = await rest(`engineering_structural_calculations?select=id&id=eq.${calculationId}`, {}, fixtures.users.b1.jwt);
    expect(b1.status).toBe(200);
    expect(ids(b1.body)).toEqual([]);

    const anon = await rest(`engineering_structural_calculations?select=id&id=eq.${calculationId}`);
    expect(anon.status).toBe(200);
    expect(ids(anon.body)).toEqual([]);

    const spoofTenant = await rest(
      `engineering_structural_calculations?id=eq.${calculationId}`,
      { method: "PATCH", body: JSON.stringify({ tenant_id: fixtures.tenantBId }) },
      fixtures.users.a1.jwt,
    );
    expect(mutationDenied(spoofTenant) || spoofTenant.status >= 400, JSON.stringify(spoofTenant.body)).toBe(true);

    const serviceRead = await rest(`engineering_structural_calculations?select=id&id=eq.${calculationId}`, {}, serviceKey);
    expect(serviceRead.status).toBe(200);
    expect(ids(serviceRead.body)).toContain(calculationId);
  });

  it("verified calculation mutation is blocked by immutability trigger", async () => {
    const verify = await rest(
      `engineering_structural_calculations?id=eq.${calculationId}`,
      { method: "PATCH", body: JSON.stringify({ review_status: "VERIFIED_BY_ENGINEER", status: "VERIFIED_BY_ENGINEER" }) },
      fixtures.users.a1.jwt,
    );
    expect(verify.status, JSON.stringify(verify.body)).toBeGreaterThanOrEqual(200);
    expect(verify.status).toBeLessThan(300);
    const mutate = await rest(
      `engineering_structural_calculations?id=eq.${calculationId}`,
      { method: "PATCH", body: JSON.stringify({ input_fingerprint: "tampered" }) },
      fixtures.users.a1.jwt,
    );
    expect(mutate.status >= 400 || mutationDenied(mutate), JSON.stringify(mutate.body)).toBe(true);
  });
});
