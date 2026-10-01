import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  liveRlsMode,
  loadLocalEnv,
  resolveServiceRoleKey,
  resolveSupabaseAnonKey,
  resolveSupabaseUrl,
} from "./env";
import { ids, restFetch } from "./live-http";
import {
  cleanupTransientReviewPackages,
  provisionReviewRlsFixtures,
  type ReviewRlsFixtures,
} from "./fixtures";

const mode = liveRlsMode();
const LIVE = mode === "run";

describe.skipIf(!LIVE)("EOS-A14B live metadata restore rehearsal", () => {
  loadLocalEnv();
  const url = resolveSupabaseUrl()!;
  const anonKey = resolveSupabaseAnonKey()!;
  const serviceKey = resolveServiceRoleKey()!;
  let fixtures: ReviewRlsFixtures;
  let environment: "ready" | "unavailable" = "unavailable";
  let artifactId = "";
  let runId = "";
  let planId = "";

  async function rest(path: string, options: RequestInit = {}, jwt?: string) {
    return restFetch(url, anonKey, serviceKey, path, options, jwt);
  }

  beforeAll(async () => {
    if (mode === "misconfigured") throw new Error("ENGINEERING_REVIEW_RLS=1 but hosted credentials are missing");
    fixtures = await provisionReviewRlsFixtures();
    environment = "ready";
  });

  afterAll(async () => {
    if (environment === "ready") {
      if (artifactId) await rest(`engineering_generated_artifacts?id=eq.${artifactId}`, { method: "DELETE" }, serviceKey);
      if (runId) await rest(`engineering_artifact_generation_runs?id=eq.${runId}`, { method: "DELETE" }, serviceKey);
      if (planId) await rest(`engineering_work_plans?id=eq.${planId}`, { method: "DELETE" }, serviceKey);
      await cleanupTransientReviewPackages();
    }
  });

  beforeEach(({ skip }) => {
    if (environment !== "ready") skip("SKIPPED_ENVIRONMENT_UNAVAILABLE");
  });

  it("exports, deletes, and restores a disposable generated-artifact metadata row without selecting file bodies", async () => {
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
          input_fingerprint: "live-restore-a14b",
          context: { information: [], gaps: [], requirements: [], actions: [], expectedOutputs: [] },
          explanations: { engineeringApproved: false, optionWinnerSelected: false, templateProvenance: "EWT-DD-FOUNDATION@v1" },
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(plan.status).toBeGreaterThanOrEqual(200);
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
          work_plan_input_fingerprint: "live-restore-a14b",
          artifact_id: artifactId,
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(run.status).toBeGreaterThanOrEqual(200);
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
          file_name: "ER-A1_STR_A14B_Restore_DRAFT.xlsx",
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
    expect(inserted.status).toBeGreaterThanOrEqual(200);
    expect(inserted.status).toBeLessThan(300);

    const snapshot = await rest(
      `engineering_generated_artifacts?select=id,storage_kind,object_key,byte_size,sha256,migration_state&id=eq.${artifactId}`,
      {},
      serviceKey,
    );
    expect(snapshot.status).toBe(200);
    expect(JSON.stringify(snapshot.body)).not.toContain("content_base64");
    expect(ids(snapshot.body)).toContain(artifactId);

    const deleted = await rest(`engineering_generated_artifacts?id=eq.${artifactId}`, { method: "DELETE" }, serviceKey);
    expect(deleted.status).toBeGreaterThanOrEqual(200);
    expect(deleted.status).toBeLessThan(300);
    const missing = await rest(`engineering_generated_artifacts?select=id&id=eq.${artifactId}`, {}, serviceKey);
    expect(ids(missing.body)).toEqual([]);

    const restored = await rest(
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
          file_name: "ER-A1_STR_A14B_Restore_DRAFT.xlsx",
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
      serviceKey,
    );
    expect(restored.status).toBeGreaterThanOrEqual(200);
    expect(restored.status).toBeLessThan(300);

    const own = await rest(`engineering_generated_artifacts?select=id,storage_kind&id=eq.${artifactId}`, {}, fixtures.users.a1.jwt);
    expect(ids(own.body)).toContain(artifactId);
    const a2 = await rest(`engineering_generated_artifacts?select=id&id=eq.${artifactId}`, {}, fixtures.users.a2.jwt);
    expect(ids(a2.body)).toEqual([]);
    const inventory = await rest(
      "engineering_generated_artifacts?select=id,storage_kind,output_format,byte_size,migration_state",
      {},
      serviceKey,
    );
    expect(inventory.status).toBe(200);
    expect(JSON.stringify(inventory.body)).not.toContain("content_base64");
  });
});
