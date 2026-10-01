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

describe.skipIf(!LIVE)("EOS-A11C live JWT RLS", () => {
  loadLocalEnv();
  const url = resolveSupabaseUrl()!;
  const anonKey = resolveSupabaseAnonKey()!;
  const serviceKey = resolveServiceRoleKey()!;
  let fixtures: ReviewRlsFixtures;
  let environment: "ready" | "unavailable" = "unavailable";
  let planId = "";
  let artifactId = "";
  let handoffId = "";

  async function rest(path: string, options: RequestInit = {}, jwt?: string) {
    return restFetch(url, anonKey, serviceKey, path, options, jwt);
  }

  beforeAll(async () => {
    if (mode === "misconfigured") {
      throw new Error("ENGINEERING_REVIEW_RLS=1 but hosted credentials are missing");
    }
    const applied = await applyHostedSqlFiles([
      "supabase/migrations/20260930180000_eos_a11c_engineering_tool_orchestration.sql",
    ]);
    if (applied.failed) {
      throw new Error(`A11C migration failed: ${applied.failed}`);
    }
    fixtures = await provisionReviewRlsFixtures();
    environment = "ready";
  });

  afterAll(async () => {
    if (environment === "ready") {
      await cleanupTransientReviewPackages();
      if (handoffId) await rest(`engineering_tool_handoffs?id=eq.${handoffId}`, { method: "DELETE" }, serviceKey);
      if (artifactId) await rest(`engineering_generated_artifacts?id=eq.${artifactId}`, { method: "DELETE" }, serviceKey);
      if (planId) await rest(`engineering_work_plans?id=eq.${planId}`, { method: "DELETE" }, serviceKey);
    }
  });

  beforeEach(({ skip }) => {
    if (environment !== "ready") {
      skip("SKIPPED_ENVIRONMENT_UNAVAILABLE: A11C tables are not on hosted Postgres");
    }
  });

  it("authorized engineer inserts and reads own workspace handoffs; other workspace, other tenant, and anonymous deny", async () => {
    planId = randomUUID();
    artifactId = randomUUID();
    handoffId = randomUUID();
    const plan = await rest(
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
          readiness: "READY",
          start_allowed: true,
          staleness: "CURRENT",
          input_fingerprint: "live-rls-a11c",
          context: { information: [], gaps: [], requirements: [], actions: [], expectedOutputs: [] },
          explanations: { engineeringApproved: false, optionWinnerSelected: false, templateProvenance: "EWT-DD-FOUNDATION@v1" },
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(plan.status, JSON.stringify(plan.body)).toBeGreaterThanOrEqual(200);
    expect(plan.status).toBeLessThan(300);

    const inserted = await rest(
      "engineering_tool_handoffs",
      {
        method: "POST",
        body: JSON.stringify({
          id: handoffId,
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          project_id: fixtures.projectA1Id,
          work_plan_id: planId,
          tool_code: "microsoft-excel",
          capability: "OPEN_XLSX",
          handoff_mode: "BROWSER_DOWNLOAD",
          status: "HANDED_OFF",
          expires_at: new Date(Date.now() + 600000).toISOString(),
          token_hash: "a".repeat(64),
          explanation: "live rls",
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(inserted.status, JSON.stringify(inserted.body)).toBeGreaterThanOrEqual(200);
    expect(inserted.status).toBeLessThan(300);

    const own = await rest(`engineering_tool_handoffs?select=id,tool_code&id=eq.${handoffId}`, {}, fixtures.users.a1.jwt);
    expect(own.status).toBe(200);
    expect(ids(own.body)).toContain(handoffId);

    const a2 = await rest(`engineering_tool_handoffs?select=id&id=eq.${handoffId}`, {}, fixtures.users.a2.jwt);
    expect(a2.status).toBe(200);
    expect(ids(a2.body)).toEqual([]);

    const b1 = await rest(`engineering_tool_handoffs?select=id,tool_code&id=eq.${handoffId}`, {}, fixtures.users.b1.jwt);
    expect(b1.status).toBe(200);
    expect(ids(b1.body)).toEqual([]);
    expect(JSON.stringify(b1.body)).not.toContain("microsoft-excel");

    const anon = await rest(`engineering_tool_handoffs?select=id&id=eq.${handoffId}`);
    expect(anon.status).toBe(200);
    expect(ids(anon.body)).toEqual([]);
  });

  it("normal engineer cannot delete tool handoffs", async () => {
    const engineerDelete = await rest(
      `engineering_tool_handoffs?id=eq.${handoffId}`,
      { method: "DELETE" },
      fixtures.users.a1.jwt,
    );
    expect(mutationDenied(engineerDelete) || ids(engineerDelete.body).length === 0, JSON.stringify(engineerDelete.body)).toBe(true);
    const stillThere = await rest(`engineering_tool_handoffs?select=id&id=eq.${handoffId}`, {}, fixtures.users.a1.jwt);
    expect(ids(stillThere.body)).toContain(handoffId);
  });
});
