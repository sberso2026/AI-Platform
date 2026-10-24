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

describe.skipIf(!LIVE)("EOS-A9A live JWT RLS — Lifecycle Intelligence", () => {
  loadLocalEnv();
  const url = resolveSupabaseUrl()!;
  const anonKey = resolveSupabaseAnonKey()!;
  const serviceKey = resolveServiceRoleKey()!;
  let fixtures: ReviewRlsFixtures;
  let environment: "ready" | "unavailable" = "unavailable";
  const assignmentIds: string[] = [];
  const evaluationIds: string[] = [];
  const decisionIds: string[] = [];
  const transitionIds: string[] = [];
  const settingIds: string[] = [];

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
    if (transitionIds.length) {
      await svc(`engineering_lifecycle_transitions?id=in.(${transitionIds.join(",")})`, { method: "DELETE" });
    }
    if (decisionIds.length) {
      await svc(`engineering_lifecycle_gate_decisions?id=in.(${decisionIds.join(",")})`, { method: "DELETE" });
    }
    if (evaluationIds.length) {
      await svc(`engineering_lifecycle_evaluations?id=in.(${evaluationIds.join(",")})`, { method: "DELETE" });
    }
    if (assignmentIds.length) {
      await svc(`engineering_lifecycle_assignments?id=in.(${assignmentIds.join(",")})`, { method: "DELETE" });
    }
    if (settingIds.length) {
      await svc(`engineering_lifecycle_profile_settings?id=in.(${settingIds.join(",")})`, { method: "DELETE" });
    }
    await cleanupTransientReviewPackages();
  });

  beforeEach(({ skip }) => {
    if (environment !== "ready") skip("SKIPPED_ENVIRONMENT_UNAVAILABLE");
  });

  it("isolates lifecycle assignments, denies unauthorized transitions, and keeps history immutable", async () => {
    const projectId = `a9a-${crypto.randomUUID()}`;
    const created = await rest(
      "engineering_lifecycle_assignments",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          project_id: projectId,
          scope_type: "PROJECT",
          scope_id: projectId,
          stage: "FEED",
          profile_id: "EOS-DEFAULT-ENGINEERING",
          profile_version: "v1",
          assigned_by: fixtures.users.a1.id,
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(created.status, JSON.stringify(created.body)).toBeLessThan(300);
    const assignmentId = entityId(created.body) || ids(created.body)[0];
    expect(assignmentId).toBeTruthy();
    assignmentIds.push(assignmentId);

    const a1Read = await rest(
      `engineering_lifecycle_assignments?id=eq.${assignmentId}&select=id,stage`,
      {},
      fixtures.users.a1.jwt,
    );
    expect(ids(a1Read.body)).toContain(assignmentId);

    const a2Read = await rest(
      `engineering_lifecycle_assignments?id=eq.${assignmentId}&select=id`,
      {},
      fixtures.users.a2.jwt,
    );
    expect(ids(a2Read.body)).not.toContain(assignmentId);

    const b1Read = await rest(
      `engineering_lifecycle_assignments?id=eq.${assignmentId}&select=id`,
      {},
      fixtures.users.b1.jwt,
    );
    expect(ids(b1Read.body)).not.toContain(assignmentId);

    const anon = await rest(`engineering_lifecycle_assignments?id=eq.${assignmentId}&select=id`, {});
    expect(ids(anon.body)).not.toContain(assignmentId);

    const a1Setting = await rest(
      "engineering_lifecycle_profile_settings",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          profile_id: "EOS-DEFAULT-ENGINEERING",
          profile_version: "v1",
          configured_by: fixtures.users.a1.id,
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(mutationDenied(a1Setting)).toBe(true);

    const adminSetting = await rest(
      "engineering_lifecycle_profile_settings",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          profile_id: "EOS-DEFAULT-ENGINEERING",
          profile_version: "v1",
          configured_by: fixtures.users.aAdmin.id,
        }),
      },
      fixtures.users.aAdmin.jwt,
    );
    expect(adminSetting.status, JSON.stringify(adminSetting.body)).toBeLessThan(300);
    settingIds.push(entityId(adminSetting.body) || ids(adminSetting.body)[0]);

    const a1Stage = await rest(
      `engineering_lifecycle_assignments?id=eq.${assignmentId}`,
      { method: "PATCH", body: JSON.stringify({ stage: "DETAILED_DESIGN" }) },
      fixtures.users.a1.jwt,
    );
    expect(mutationDenied(a1Stage)).toBe(true);

    const evaluation = await rest(
      "engineering_lifecycle_evaluations",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          assignment_id: assignmentId,
          gate_id: "FEED_EXIT",
          profile_id: "EOS-DEFAULT-ENGINEERING",
          profile_version: "v1",
          completeness: "COMPLETE",
          readiness: "READY_FOR_REVIEW",
          evidence_fingerprint: `a9a-${crypto.randomUUID()}`,
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(evaluation.status, JSON.stringify(evaluation.body)).toBeLessThan(300);
    const evaluationId = entityId(evaluation.body) || ids(evaluation.body)[0];
    evaluationIds.push(evaluationId);

    const a1Decision = await rest(
      "engineering_lifecycle_gate_decisions",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          evaluation_id: evaluationId,
          decision: "APPROVED_TO_TRANSITION",
          rationale: "Unauthorized engineer attempt",
          actor_id: fixtures.users.a1.id,
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(mutationDenied(a1Decision)).toBe(true);

    const adminDecision = await rest(
      "engineering_lifecycle_gate_decisions",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          evaluation_id: evaluationId,
          decision: "APPROVED_TO_TRANSITION",
          rationale: "Authorized FEED exit",
          actor_id: fixtures.users.aAdmin.id,
        }),
      },
      fixtures.users.aAdmin.jwt,
    );
    expect(adminDecision.status, JSON.stringify(adminDecision.body)).toBeLessThan(300);
    const decisionId = entityId(adminDecision.body) || ids(adminDecision.body)[0];
    decisionIds.push(decisionId);

    const a1Transition = await rest(
      "engineering_lifecycle_transitions",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          assignment_id: assignmentId,
          from_stage: "FEED",
          to_stage: "DETAILED_DESIGN",
          evaluation_id: evaluationId,
          decision_id: decisionId,
          profile_id: "EOS-DEFAULT-ENGINEERING",
          profile_version: "v1",
          authorized_by: fixtures.users.a1.id,
          rationale: "Unauthorized transition",
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(mutationDenied(a1Transition)).toBe(true);

    const crossWs = await rest(
      "engineering_lifecycle_evaluations",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA2Id,
          assignment_id: assignmentId,
          gate_id: "FEED_EXIT",
          profile_id: "EOS-DEFAULT-ENGINEERING",
          profile_version: "v1",
          completeness: "COMPLETE",
          readiness: "READY_FOR_REVIEW",
          evidence_fingerprint: "cross-ws",
        }),
      },
      fixtures.users.a2.jwt,
    );
    expect(crossWs.status).toBeGreaterThanOrEqual(400);

    const adminTransition = await rest(
      "engineering_lifecycle_transitions",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          assignment_id: assignmentId,
          from_stage: "FEED",
          to_stage: "DETAILED_DESIGN",
          gate_id: "FEED_EXIT",
          evaluation_id: evaluationId,
          decision_id: decisionId,
          profile_id: "EOS-DEFAULT-ENGINEERING",
          profile_version: "v1",
          authorized_by: fixtures.users.aAdmin.id,
          rationale: "Authorized FEED exit",
          snapshot: { fromStage: "FEED", toStage: "DETAILED_DESIGN", profileVersion: "v1" },
        }),
      },
      fixtures.users.aAdmin.jwt,
    );
    expect(adminTransition.status, JSON.stringify(adminTransition.body)).toBeLessThan(300);
    const transitionId = entityId(adminTransition.body) || ids(adminTransition.body)[0];
    transitionIds.push(transitionId);

    const mutateHistory = await rest(
      `engineering_lifecycle_transitions?id=eq.${transitionId}`,
      { method: "PATCH", body: JSON.stringify({ rationale: "rewritten" }) },
      fixtures.users.aAdmin.jwt,
    );
    expect(mutationDenied(mutateHistory)).toBe(true);

    const crossTenant = await rest(
      "engineering_lifecycle_transitions",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantBId,
          workspace_id: fixtures.workspaceB1Id,
          assignment_id: assignmentId,
          from_stage: "FEED",
          to_stage: "DETAILED_DESIGN",
          profile_id: "EOS-DEFAULT-ENGINEERING",
          profile_version: "v1",
          authorized_by: fixtures.users.b1.id,
          rationale: "cross tenant",
        }),
      },
      fixtures.users.b1.jwt,
    );
    expect(crossTenant.status).toBeGreaterThanOrEqual(400);
  });
});
