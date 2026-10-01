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

describe.skipIf(!LIVE)("EOS-A11A live JWT RLS", () => {
  loadLocalEnv();
  const url = resolveSupabaseUrl()!;
  const anonKey = resolveSupabaseAnonKey()!;
  const serviceKey = resolveServiceRoleKey()!;
  let fixtures: ReviewRlsFixtures;
  let environment: "ready" | "unavailable" = "unavailable";
  let planId = "";

  async function rest(path: string, options: RequestInit = {}, jwt?: string) {
    return restFetch(url, anonKey, serviceKey, path, options, jwt);
  }

  beforeAll(async () => {
    if (mode === "misconfigured") {
      throw new Error("ENGINEERING_REVIEW_RLS=1 but hosted credentials are missing");
    }
    const applied = await applyHostedSqlFiles([
      "supabase/migrations/20260930160000_eos_a11a_engineering_work_generator.sql",
    ]);
    if (applied.failed) {
      throw new Error(`A11A migration failed: ${applied.failed}`);
    }
    fixtures = await provisionReviewRlsFixtures();
    environment = "ready";
  });

  afterAll(async () => {
    if (environment === "ready") {
      await cleanupTransientReviewPackages();
      if (planId) {
        await rest(`engineering_work_plans?id=eq.${planId}`, { method: "DELETE" }, serviceKey);
      }
    }
  });

  beforeEach(({ skip }) => {
    if (environment !== "ready") {
      skip("SKIPPED_ENVIRONMENT_UNAVAILABLE: A11A tables are not on hosted Postgres");
    }
  });

  it("authorized engineer creates and reads own workspace plans; other workspace, other tenant, and anonymous deny", async () => {
    planId = randomUUID();
    const inserted = await rest(
      "engineering_work_plans",
      {
        method: "POST",
        body: JSON.stringify({
          id: planId,
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          project_id: fixtures.projectA1Id,
          work_type: "DESIGN_CALCULATION",
          template_code: "EWT-DD-FOUNDATION",
          template_version: "v1",
          lifecycle_stage: "DETAILED_DESIGN",
          status: "DRAFT",
          readiness: "BLOCKED_INFORMATION_MISSING",
          start_allowed: false,
          staleness: "CURRENT",
          input_fingerprint: "live-rls-fingerprint",
          context: { information: [], gaps: [], requirements: [], actions: [], expectedOutputs: [] },
          explanations: { engineeringApproved: false, optionWinnerSelected: false, templateProvenance: "EWT-DD-FOUNDATION@v1" },
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(inserted.status, JSON.stringify(inserted.body)).toBeGreaterThanOrEqual(200);
    expect(inserted.status).toBeLessThan(300);

    const own = await rest(`engineering_work_plans?select=id,template_code&id=eq.${planId}`, {}, fixtures.users.a1.jwt);
    expect(own.status).toBe(200);
    expect(ids(own.body)).toContain(planId);

    const a2 = await rest(`engineering_work_plans?select=id&id=eq.${planId}`, {}, fixtures.users.a2.jwt);
    expect(a2.status).toBe(200);
    expect(ids(a2.body)).toEqual([]);

    const b1 = await rest(`engineering_work_plans?select=id,template_code&id=eq.${planId}`, {}, fixtures.users.b1.jwt);
    expect(b1.status).toBe(200);
    expect(ids(b1.body)).toEqual([]);
    expect(JSON.stringify(b1.body)).not.toContain("EWT-DD-FOUNDATION");

    const anon = await rest(`engineering_work_plans?select=id&id=eq.${planId}`);
    expect(anon.status).toBe(200);
    expect(ids(anon.body)).toEqual([]);
  });

  it("normal engineer may update a plan; admin-only delete is retained", async () => {
    const update = await rest(
      `engineering_work_plans?id=eq.${planId}`,
      { method: "PATCH", body: JSON.stringify({ status: "BLOCKED" }) },
      fixtures.users.a1.jwt,
    );
    expect(update.status, JSON.stringify(update.body)).toBeGreaterThanOrEqual(200);
    expect(update.status).toBeLessThan(300);
    const engineerDelete = await rest(
      `engineering_work_plans?id=eq.${planId}`,
      { method: "DELETE" },
      fixtures.users.a1.jwt,
    );
    expect(mutationDenied(engineerDelete) || ids(engineerDelete.body).length === 0, JSON.stringify(engineerDelete.body)).toBe(true);
    const stillThere = await rest(`engineering_work_plans?select=id&id=eq.${planId}`, {}, fixtures.users.a1.jwt);
    expect(ids(stillThere.body)).toContain(planId);
  });
});
