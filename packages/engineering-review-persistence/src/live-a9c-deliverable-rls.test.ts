import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  liveRlsMode,
  loadLocalEnv,
  resolveServiceRoleKey,
  resolveSupabaseAnonKey,
  resolveSupabaseUrl,
} from "./env";
import { ids, mutationDenied, restFetch } from "./live-http";
import { cleanupTransientReviewPackages, provisionReviewRlsFixtures, type ReviewRlsFixtures } from "./fixtures";

const mode = liveRlsMode();
const LIVE = mode === "run";

function entityId(body: unknown): string {
  if (Array.isArray(body) && body[0] && typeof body[0] === "object" && body[0] !== null && "id" in body[0]) {
    return String((body[0] as { id: string }).id);
  }
  if (body && typeof body === "object" && "id" in (body as { id?: string })) {
    return String((body as { id: string }).id);
  }
  return "";
}

describe.skipIf(!LIVE)("EOS-A9C live JWT RLS — deliverable maturity", () => {
  loadLocalEnv();
  const url = resolveSupabaseUrl()!;
  const anonKey = resolveSupabaseAnonKey()!;
  const serviceKey = resolveServiceRoleKey()!;
  let fixtures: ReviewRlsFixtures;
  let environment: "ready" | "unavailable" = "unavailable";
  const settingIds: string[] = [];
  const expectationIds: string[] = [];
  const bindingIds: string[] = [];
  const assessmentIds: string[] = [];
  const waiverIds: string[] = [];

  async function rest(path: string, options: RequestInit = {}, jwt?: string) {
    return restFetch(url, anonKey, serviceKey, path, options, jwt);
  }
  async function svc(path: string, options: RequestInit = {}) {
    return rest(path, options, serviceKey);
  }

  beforeAll(async () => {
    if (mode === "misconfigured") throw new Error("ENGINEERING_REVIEW_RLS=1 but hosted credentials are missing");
    fixtures = await provisionReviewRlsFixtures();
    environment = "ready";
  });

  afterAll(async () => {
    if (environment !== "ready") return;
    if (waiverIds.length) await svc(`engineering_deliverable_waivers?id=in.(${waiverIds.join(",")})`, { method: "DELETE" });
    if (assessmentIds.length) await svc(`engineering_deliverable_assessments?id=in.(${assessmentIds.join(",")})`, { method: "DELETE" });
    if (bindingIds.length) await svc(`engineering_deliverable_artifact_bindings?id=in.(${bindingIds.join(",")})`, { method: "DELETE" });
    if (expectationIds.length) await svc(`engineering_deliverable_expectations?id=in.(${expectationIds.join(",")})`, { method: "DELETE" });
    if (settingIds.length) await svc(`engineering_deliverable_profile_settings?id=in.(${settingIds.join(",")})`, { method: "DELETE" });
    await cleanupTransientReviewPackages();
  });

  beforeEach(({ skip }) => {
    if (environment !== "ready") skip("SKIPPED_ENVIRONMENT_UNAVAILABLE");
  });

  it("isolates deliverable rows and denies ordinary users from mutating catalog or forging waivers", async () => {
    const projectId = `a9c-${crypto.randomUUID()}`;
    const engineerSetting = await rest(
      "engineering_deliverable_profile_settings",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          maturity_profile_id: "EOS-DEFAULT-DELIVERABLE-MATURITY",
          maturity_profile_version: "v1",
          configured_by: fixtures.users.a1.id,
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(mutationDenied(engineerSetting)).toBe(true);

    const existingSetting = await rest(
      `engineering_deliverable_profile_settings?workspace_id=eq.${fixtures.workspaceA1Id}&select=id`,
      {},
      fixtures.users.aAdmin.jwt,
    );
    let settingId = ids(existingSetting.body)[0];
    if (!settingId) {
      const adminSetting = await rest(
        "engineering_deliverable_profile_settings",
        {
          method: "POST",
          body: JSON.stringify({
            tenant_id: fixtures.tenantAId,
            workspace_id: fixtures.workspaceA1Id,
            maturity_profile_id: "EOS-DEFAULT-DELIVERABLE-MATURITY",
            maturity_profile_version: "v1",
            configured_by: fixtures.users.aAdmin.id,
          }),
        },
        fixtures.users.aAdmin.jwt,
      );
      expect(adminSetting.status, JSON.stringify(adminSetting.body)).toBeLessThan(300);
      settingId = entityId(adminSetting.body) || ids(adminSetting.body)[0];
    }
    expect(settingId).toBeTruthy();
    settingIds.push(settingId);

    const created = await rest(
      "engineering_deliverable_expectations",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          project_id: projectId,
          definition_id: "EOS-DLV-STR-ANL-FEED",
          definition_version: "v1",
          definition_code: "STR-ANL-FEED",
          lifecycle_profile_id: "EOS-DEFAULT-ENGINEERING",
          lifecycle_profile_version: "v1",
          lifecycle_stage: "FEED",
          scope_type: "PROJECT",
          scope_id: projectId,
          requirement_state: "REQUIRED",
          intended_purpose: "FOR_ENGINEERING_REVIEW",
          maturity_profile_id: "EOS-DEFAULT-DELIVERABLE-MATURITY",
          maturity_profile_version: "v1",
          responsible_discipline: "STRUCTURAL",
          contributing_disciplines: ["MECHANICAL"],
          origin: "HUMAN_GOVERNED",
          created_by: fixtures.users.a1.id,
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(created.status, JSON.stringify(created.body)).toBeLessThan(300);
    const expectationId = entityId(created.body) || ids(created.body)[0];
    expect(expectationId).toBeTruthy();
    expectationIds.push(expectationId);

    const a1Read = await rest(`engineering_deliverable_expectations?id=eq.${expectationId}&select=id`, {}, fixtures.users.a1.jwt);
    expect(ids(a1Read.body)).toContain(expectationId);
    const a2Read = await rest(`engineering_deliverable_expectations?id=eq.${expectationId}&select=id`, {}, fixtures.users.a2.jwt);
    expect(ids(a2Read.body)).not.toContain(expectationId);
    const b1Read = await rest(`engineering_deliverable_expectations?id=eq.${expectationId}&select=id`, {}, fixtures.users.b1.jwt);
    expect(ids(b1Read.body)).not.toContain(expectationId);
    const anon = await rest(`engineering_deliverable_expectations?id=eq.${expectationId}&select=id`, {});
    expect(ids(anon.body)).not.toContain(expectationId);

    const crossWs = await rest(
      "engineering_deliverable_artifact_bindings",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA2Id,
          expectation_id: expectationId,
          artifact_class: "analysis_result",
          artifact_id: "anl-struct",
          artifact_role: "PRIMARY",
          bound_by: fixtures.users.a2.id,
        }),
      },
      fixtures.users.a2.jwt,
    );
    expect(crossWs.status).toBeGreaterThanOrEqual(400);

    const crossTenant = await rest(
      "engineering_deliverable_artifact_bindings",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantBId,
          workspace_id: fixtures.workspaceB1Id,
          expectation_id: expectationId,
          artifact_class: "analysis_result",
          artifact_id: "anl-struct",
          artifact_role: "PRIMARY",
          bound_by: fixtures.users.b1.id,
        }),
      },
      fixtures.users.b1.jwt,
    );
    expect(crossTenant.status).toBeGreaterThanOrEqual(400);

    const sameWsBind = await rest(
      "engineering_deliverable_artifact_bindings",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          expectation_id: expectationId,
          artifact_class: "analysis_result",
          artifact_id: "anl-struct",
          artifact_role: "PRIMARY",
          bound_by: fixtures.users.a1.id,
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(sameWsBind.status, JSON.stringify(sameWsBind.body)).toBeLessThan(300);
    const bindingId = entityId(sameWsBind.body) || ids(sameWsBind.body)[0];
    bindingIds.push(bindingId);

    const assessment = await rest(
      "engineering_deliverable_assessments",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          expectation_id: expectationId,
          maturity_profile_id: "EOS-DEFAULT-DELIVERABLE-MATURITY",
          maturity_profile_version: "v1",
          intended_purpose: "FOR_ENGINEERING_REVIEW",
          completeness: "COMPLETE",
          readiness: "READY_FOR_CONFIGURED_PURPOSE",
          evidence_source: "CANONICAL",
          evidence_fingerprint: "a".repeat(64),
          dimensions: [],
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(assessment.status, JSON.stringify(assessment.body)).toBeLessThan(300);
    const assessmentId = entityId(assessment.body) || ids(assessment.body)[0];
    assessmentIds.push(assessmentId);

    const engineerWaiver = await rest(
      "engineering_deliverable_waivers",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          expectation_id: expectationId,
          assessment_id: assessmentId,
          dimension: "REVIEW",
          rationale: "forged mature true",
          actor_id: fixtures.users.a1.id,
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(mutationDenied(engineerWaiver)).toBe(true);

    const adminWaiver = await rest(
      "engineering_deliverable_waivers",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          expectation_id: expectationId,
          assessment_id: assessmentId,
          dimension: "REVIEW",
          rationale: "authorized exception recorded; evidence remains NOT_SATISFIED",
          actor_id: fixtures.users.aAdmin.id,
        }),
      },
      fixtures.users.aAdmin.jwt,
    );
    expect(adminWaiver.status, JSON.stringify(adminWaiver.body)).toBeLessThan(300);
    const waiverId = entityId(adminWaiver.body) || ids(adminWaiver.body)[0];
    waiverIds.push(waiverId);
  });
});
