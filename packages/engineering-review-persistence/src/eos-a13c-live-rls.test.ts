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

describe.skipIf(!LIVE)("EOS-A13C live JWT RLS", () => {
  loadLocalEnv();
  const url = resolveSupabaseUrl()!;
  const anonKey = resolveSupabaseAnonKey()!;
  const serviceKey = resolveServiceRoleKey()!;
  let fixtures: ReviewRlsFixtures;
  let environment: "ready" | "unavailable" = "unavailable";
  let planId = "";
  let runId = "";
  let artifactId = "";
  let connectionId = "";

  async function rest(path: string, options: RequestInit = {}, jwt?: string) {
    return restFetch(url, anonKey, serviceKey, path, options, jwt);
  }

  beforeAll(async () => {
    if (mode === "misconfigured") {
      throw new Error("ENGINEERING_REVIEW_RLS=1 but hosted credentials are missing");
    }
    const applied = await applyHostedSqlFiles([
      "supabase/migrations/20261001200000_eos_a13c_platform_consolidation_binary_storage.sql",
    ]);
    if (applied.failed) {
      throw new Error(`A13C migration failed: ${applied.failed}`);
    }
    fixtures = await provisionReviewRlsFixtures();
    environment = "ready";
  });

  afterAll(async () => {
    if (environment === "ready") {
      if (artifactId) await rest(`engineering_generated_artifacts?id=eq.${artifactId}`, { method: "DELETE" }, serviceKey);
      if (runId) await rest(`engineering_artifact_generation_runs?id=eq.${runId}`, { method: "DELETE" }, serviceKey);
      if (planId) await rest(`engineering_work_plans?id=eq.${planId}`, { method: "DELETE" }, serviceKey);
      if (connectionId) await rest(`engineering_external_connections?id=eq.${connectionId}`, { method: "DELETE" }, serviceKey);
      await cleanupTransientReviewPackages();
    }
  });

  beforeEach(({ skip }) => {
    if (environment !== "ready") {
      skip("SKIPPED_ENVIRONMENT_UNAVAILABLE: A13C columns are not on hosted Postgres");
    }
  });

  it("authorized workspace reads storage metadata; other workspace, other tenant, and anonymous deny", async () => {
    planId = randomUUID();
    runId = randomUUID();
    artifactId = randomUUID();
    connectionId = randomUUID();
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
          input_fingerprint: "live-rls-a13c",
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
          status: "READY_FOR_ENGINEER_REVIEW",
          work_plan_input_fingerprint: "live-rls-a13c",
          artifact_id: artifactId,
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
          file_name: "ER-A1_STR_A13C_Storage_DRAFT.xlsx",
          mime_type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          sha256: "abc",
          byte_size: 4,
          status: "READY_FOR_ENGINEER_REVIEW",
          content_base64: "UEs=",
          provenance: { engineeringApproved: false, draft: true },
          storage_kind: "LEGACY_RELATIONAL",
          object_key: `eos/artifacts/${fixtures.tenantAId}/${fixtures.workspaceA1Id}/${fixtures.projectA1Id}/${artifactId}/v1`,
          content_size_bytes: 4,
          content_sha256: "abc",
          content_type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          storage_version: 1,
          migration_state: "NOT_STARTED",
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(inserted.status, JSON.stringify(inserted.body)).toBeGreaterThanOrEqual(200);
    expect(inserted.status).toBeLessThan(300);

    const own = await rest(
      `engineering_generated_artifacts?select=id,storage_kind,object_key,migration_state&id=eq.${artifactId}`,
      {},
      fixtures.users.a1.jwt,
    );
    expect(own.status).toBe(200);
    expect(ids(own.body)).toContain(artifactId);
    expect(JSON.stringify(own.body)).toContain("LEGACY_RELATIONAL");

    const a2 = await rest(`engineering_generated_artifacts?select=id,object_key&id=eq.${artifactId}`, {}, fixtures.users.a2.jwt);
    expect(a2.status).toBe(200);
    expect(ids(a2.body)).toEqual([]);

    const b1 = await rest(`engineering_generated_artifacts?select=id,object_key&id=eq.${artifactId}`, {}, fixtures.users.b1.jwt);
    expect(b1.status).toBe(200);
    expect(ids(b1.body)).toEqual([]);
    expect(JSON.stringify(b1.body)).not.toContain("ER-A1_STR_A13C_Storage_DRAFT.xlsx");

    const anon = await rest(`engineering_generated_artifacts?select=id&id=eq.${artifactId}`);
    expect(anon.status).toBe(200);
    expect(ids(anon.body)).toEqual([]);

    const connection = await rest(
      "engineering_external_connections",
      {
        method: "POST",
        body: JSON.stringify({
          id: connectionId,
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          display_name: "A13C live cert matrix",
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

    const patched = await rest(
      `engineering_external_connections?id=eq.${connectionId}`,
      {
        method: "PATCH",
        body: JSON.stringify({ write_policy: "PUBLISH_DOCUMENT" }),
      },
      fixtures.users.a1.jwt,
    );
    expect(mutationDenied(patched), JSON.stringify(patched.body)).toBe(true);
  });
});
