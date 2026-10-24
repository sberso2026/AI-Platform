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

describe.skipIf(!LIVE)("EOS-A11B live JWT RLS", () => {
  loadLocalEnv();
  const url = resolveSupabaseUrl()!;
  const anonKey = resolveSupabaseAnonKey()!;
  const serviceKey = resolveServiceRoleKey()!;
  let fixtures: ReviewRlsFixtures;
  let environment: "ready" | "unavailable" = "unavailable";
  let planId = "";
  let runId = "";
  let artifactId = "";

  async function rest(path: string, options: RequestInit = {}, jwt?: string) {
    return restFetch(url, anonKey, serviceKey, path, options, jwt);
  }

  beforeAll(async () => {
    if (mode === "misconfigured") {
      throw new Error("ENGINEERING_REVIEW_RLS=1 but hosted credentials are missing");
    }
    const applied = await applyHostedSqlFiles([
      "supabase/migrations/20260930170000_eos_a11b_engineering_artifact_automation.sql",
    ]);
    if (applied.failed) {
      throw new Error(`A11B migration failed: ${applied.failed}`);
    }
    fixtures = await provisionReviewRlsFixtures();
    environment = "ready";
  });

  afterAll(async () => {
    if (environment === "ready") {
      await cleanupTransientReviewPackages();
      if (artifactId) await rest(`engineering_generated_artifacts?id=eq.${artifactId}`, { method: "DELETE" }, serviceKey);
      if (runId) await rest(`engineering_artifact_generation_runs?id=eq.${runId}`, { method: "DELETE" }, serviceKey);
      if (planId) await rest(`engineering_work_plans?id=eq.${planId}`, { method: "DELETE" }, serviceKey);
    }
  });

  beforeEach(({ skip }) => {
    if (environment !== "ready") {
      skip("SKIPPED_ENVIRONMENT_UNAVAILABLE: A11B tables are not on hosted Postgres");
    }
  });

  it("authorized engineer generates and reads own workspace artifacts; other workspace, other tenant, and anonymous deny", async () => {
    planId = randomUUID();
    runId = randomUUID();
    artifactId = randomUUID();
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
          input_fingerprint: "live-rls-a11b",
          context: { information: [], gaps: [], requirements: [], actions: [], expectedOutputs: [] },
          explanations: { engineeringApproved: false, optionWinnerSelected: false, templateProvenance: "EWT-DD-FOUNDATION@v1" },
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(plan.status, JSON.stringify(plan.body)).toBeGreaterThanOrEqual(200);
    expect(plan.status).toBeLessThan(300);

    const run = await rest(
      "engineering_artifact_generation_runs",
      {
        method: "POST",
        body: JSON.stringify({
          id: runId,
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          project_id: fixtures.projectA1Id,
          work_plan_id: planId,
          template_code: "EAT-CALC-EXAMPLE-BEARING",
          template_version: "1.0.0",
          artifact_type: "CALCULATION_WORKBOOK",
          output_format: "XLSX",
          work_plan_input_fingerprint: "live-rls-a11b",
          artifact_id: artifactId,
          status: "READY_FOR_ENGINEER_REVIEW",
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(run.status, JSON.stringify(run.body)).toBeGreaterThanOrEqual(200);
    expect(run.status).toBeLessThan(300);

    const inserted = await rest(
      "engineering_generated_artifacts",
      {
        method: "POST",
        body: JSON.stringify({
          id: artifactId,
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          project_id: fixtures.projectA1Id,
          generation_run_id: runId,
          work_plan_id: planId,
          template_code: "EAT-CALC-EXAMPLE-BEARING",
          template_version: "1.0.0",
          artifact_type: "CALCULATION_WORKBOOK",
          output_format: "XLSX",
          file_name: "ER-A1_STR_Foundation_Calculation_DRAFT.xlsx",
          mime_type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          sha256: "abc",
          byte_size: 4,
          status: "READY_FOR_ENGINEER_REVIEW",
          content_base64: "UEs=",
          provenance: { engineeringApproved: false, draft: true },
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(inserted.status, JSON.stringify(inserted.body)).toBeGreaterThanOrEqual(200);
    expect(inserted.status).toBeLessThan(300);

    const own = await rest(`engineering_generated_artifacts?select=id,file_name&id=eq.${artifactId}`, {}, fixtures.users.a1.jwt);
    expect(own.status).toBe(200);
    expect(ids(own.body)).toContain(artifactId);

    const a2 = await rest(`engineering_generated_artifacts?select=id&id=eq.${artifactId}`, {}, fixtures.users.a2.jwt);
    expect(a2.status).toBe(200);
    expect(ids(a2.body)).toEqual([]);

    const b1 = await rest(`engineering_generated_artifacts?select=id,file_name&id=eq.${artifactId}`, {}, fixtures.users.b1.jwt);
    expect(b1.status).toBe(200);
    expect(ids(b1.body)).toEqual([]);
    expect(JSON.stringify(b1.body)).not.toContain("ER-A1_STR_Foundation_Calculation_DRAFT.xlsx");

    const anon = await rest(`engineering_generated_artifacts?select=id&id=eq.${artifactId}`);
    expect(anonReadDenied(anon), JSON.stringify(anon.body)).toBe(true);
  });

  it("normal engineer cannot delete generated artifacts; no artifact-template table to mutate", async () => {
    const engineerDelete = await rest(
      `engineering_generated_artifacts?id=eq.${artifactId}`,
      { method: "DELETE" },
      fixtures.users.a1.jwt,
    );
    expect(mutationDenied(engineerDelete) || ids(engineerDelete.body).length === 0, JSON.stringify(engineerDelete.body)).toBe(true);
    const stillThere = await rest(`engineering_generated_artifacts?select=id&id=eq.${artifactId}`, {}, fixtures.users.a1.jwt);
    expect(ids(stillThere.body)).toContain(artifactId);
    const templates = await rest("engineering_artifact_templates?select=id", {}, fixtures.users.a1.jwt);
    expect(templates.status === 404 || ids(templates.body).length === 0 || JSON.stringify(templates.body).toLowerCase().includes("could not find")).toBe(true);
  });
});
