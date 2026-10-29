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

describe.skipIf(!LIVE)("EOS-A11D live JWT RLS", () => {
  loadLocalEnv();
  const url = resolveSupabaseUrl()!;
  const anonKey = resolveSupabaseAnonKey()!;
  const serviceKey = resolveServiceRoleKey()!;
  let fixtures: ReviewRlsFixtures;
  let environment: "ready" | "unavailable" = "unavailable";
  let planId = "";
  let reviewId = "";

  async function rest(path: string, options: RequestInit = {}, jwt?: string) {
    return restFetch(url, anonKey, serviceKey, path, options, jwt);
  }

  beforeAll(async () => {
    if (mode === "misconfigured") {
      throw new Error("ENGINEERING_REVIEW_RLS=1 but hosted credentials are missing");
    }
    const applied = await applyHostedSqlFiles([
      "supabase/migrations/20260930190000_eos_a11d_pre_issue_engineering_review.sql",
    ]);
    if (applied.failed) {
      throw new Error(`A11D migration applied failed: ${applied.failed}`);
    }
    fixtures = await provisionReviewRlsFixtures();
    environment = "ready";
  });

  afterAll(async () => {
    if (environment === "ready") {
      await cleanupTransientReviewPackages();
      if (reviewId) await rest(`engineering_pre_issue_reviews?id=eq.${reviewId}`, { method: "DELETE" }, serviceKey);
      if (planId) await rest(`engineering_work_plans?id=eq.${planId}`, { method: "DELETE" }, serviceKey);
    }
  });

  beforeEach(({ skip }) => {
    if (environment !== "ready") {
      skip("SKIPPED_ENVIRONMENT_UNAVAILABLE: A11D tables are not on hosted Postgres");
    }
  });

  it("authorized engineer inserts and reads own workspace pre-issue reviews; other workspace, other tenant, and anonymous deny", async () => {
    planId = randomUUID();
    reviewId = randomUUID();
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
          input_fingerprint: "live-rls-a11d",
          context: { information: [], gaps: [], requirements: [], actions: [], expectedOutputs: [] },
          explanations: { engineeringApproved: false, optionWinnerSelected: false, templateProvenance: "EWT-DD-FOUNDATION@v1" },
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(plan.status, JSON.stringify(plan.body)).toBeGreaterThanOrEqual(200);
    expect(plan.status).toBeLessThan(300);

    const inserted = await rest(
      "engineering_pre_issue_reviews",
      {
        method: "POST",
        body: JSON.stringify({
          id: reviewId,
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          project_id: fixtures.projectA1Id,
          work_plan_id: planId,
          review_package_id: randomUUID(),
          review_run_id: randomUUID(),
          policy_code: "EOS-PRE-ISSUE-REVIEW",
          policy_version: "1.0.0",
          snapshot: { binaryContentCopied: false, workPlanFingerprint: "live-rls-a11d" },
          target_artifact_hash: "abc",
          target_lineage_kind: "GENERATED_DRAFT",
          result_state: "ATTENTION_REQUIRED",
          staleness: "CURRENT",
          semantic_ai_review: "unavailable",
          conditions: [],
          passed_checks: [],
          not_evaluated: [],
          performance: { deterministicDurationMs: 1 },
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(inserted.status, JSON.stringify(inserted.body)).toBeGreaterThanOrEqual(200);
    expect(inserted.status).toBeLessThan(300);

    const own = await rest(`engineering_pre_issue_reviews?select=id,policy_code&id=eq.${reviewId}`, {}, fixtures.users.a1.jwt);
    expect(own.status).toBe(200);
    expect(ids(own.body)).toContain(reviewId);

    const a2 = await rest(`engineering_pre_issue_reviews?select=id&id=eq.${reviewId}`, {}, fixtures.users.a2.jwt);
    expect(a2.status).toBe(200);
    expect(ids(a2.body)).toEqual([]);

    const b1 = await rest(`engineering_pre_issue_reviews?select=id,policy_code&id=eq.${reviewId}`, {}, fixtures.users.b1.jwt);
    expect(b1.status).toBe(200);
    expect(ids(b1.body)).toEqual([]);
    expect(JSON.stringify(b1.body)).not.toContain("EOS-PRE-ISSUE-REVIEW");

    const anon = await rest(`engineering_pre_issue_reviews?select=id&id=eq.${reviewId}`);
    expect(anonReadDenied(anon), JSON.stringify(anon.body)).toBe(true);
  });

  it("normal engineer cannot delete pre-issue reviews", async () => {
    const engineerDelete = await rest(
      `engineering_pre_issue_reviews?id=eq.${reviewId}`,
      { method: "DELETE" },
      fixtures.users.a1.jwt,
    );
    expect(mutationDenied(engineerDelete) || ids(engineerDelete.body).length === 0, JSON.stringify(engineerDelete.body)).toBe(true);
    const stillThere = await rest(`engineering_pre_issue_reviews?select=id&id=eq.${reviewId}`, {}, fixtures.users.a1.jwt);
    expect(ids(stillThere.body)).toContain(reviewId);
  });
});
