import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
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
const TAG = { eos_a5: true };

type JsonRow = Record<string, unknown> & { id: string };

function asRow(body: unknown): JsonRow {
  if (Array.isArray(body) && body[0] && typeof body[0] === "object" && body[0] !== null && "id" in body[0]) {
    return body[0] as JsonRow;
  }
  if (body && typeof body === "object" && "id" in body) return body as JsonRow;
  throw new Error(`expected id in ${JSON.stringify(body)}`);
}

describe.skipIf(!LIVE)("EOS-A5 live JWT RLS — Optimization Intelligence", () => {
  loadLocalEnv();
  const url = resolveSupabaseUrl()!;
  const anonKey = resolveSupabaseAnonKey()!;
  const serviceKey = resolveServiceRoleKey()!;
  let fixtures: ReviewRlsFixtures;
  let environment: "ready" | "unavailable" = "unavailable";
  const studyIds: string[] = [];
  const objectiveIds: string[] = [];
  const alternativeIds: string[] = [];
  const runIds: string[] = [];
  const baselineIds: string[] = [];
  const systemIds: string[] = [];
  const decisionIds: string[] = [];

  async function rest(path: string, options: RequestInit = {}, jwt?: string) {
    return restFetch(url, anonKey, serviceKey, path, options, jwt);
  }
  async function svc(path: string, options: RequestInit = {}) {
    return rest(path, options, serviceKey);
  }

  async function seedStudy(input: {
    tenantId: string;
    workspaceId: string;
    projectId: string;
    title: string;
  }) {
    const created = await svc("engineering_optimization_studies", {
      method: "POST",
      body: JSON.stringify({
        tenant_id: input.tenantId,
        workspace_id: input.workspaceId,
        project_id: input.projectId,
        study_code: `OPT-A5-${randomUUID().slice(0, 8)}`,
        title: input.title,
        lifecycle_stage: "FEED",
        status: "draft",
        metadata: TAG,
      }),
    });
    expect(created.status, JSON.stringify(created.body)).toBeLessThan(300);
    const row = asRow(created.body);
    studyIds.push(row.id);
    return row;
  }

  async function seedBaseline(input: {
    tenantId: string;
    workspaceId: string;
    projectId: string;
    name: string;
  }) {
    const created = await svc("engineering_configuration_baselines", {
      method: "POST",
      body: JSON.stringify({
        tenant_id: input.tenantId,
        workspace_id: input.workspaceId,
        project_id: input.projectId,
        baseline_code: `BL-A5-${randomUUID().slice(0, 8)}`,
        name: input.name,
        baseline_type: "FEED",
        status: "draft",
        metadata: TAG,
      }),
    });
    expect(created.status, JSON.stringify(created.body)).toBeLessThan(300);
    const row = asRow(created.body);
    baselineIds.push(row.id);
    return row;
  }

  async function seedSystem(input: {
    tenantId: string;
    workspaceId: string;
    projectId: string;
    name: string;
  }) {
    const created = await svc("engineering_systems", {
      method: "POST",
      body: JSON.stringify({
        tenant_id: input.tenantId,
        workspace_id: input.workspaceId,
        project_id: input.projectId,
        system_code: `SYS-A5-${randomUUID().slice(0, 8)}`,
        name: input.name,
        status: "draft",
        metadata: TAG,
      }),
    });
    expect(created.status, JSON.stringify(created.body)).toBeLessThan(300);
    const row = asRow(created.body);
    systemIds.push(row.id);
    return row;
  }

  async function seedDecision(input: {
    tenantId: string;
    workspaceId: string;
    projectId: string;
    title: string;
  }) {
    const created = await svc("engineering_decisions", {
      method: "POST",
      body: JSON.stringify({
        tenant_id: input.tenantId,
        workspace_id: input.workspaceId,
        project_id: input.projectId,
        decision_number: `A5-${randomUUID().slice(0, 8)}`,
        title: input.title,
        status: "draft",
        decision_question: `${input.title}?`,
        metadata: TAG,
      }),
    });
    expect(created.status, JSON.stringify(created.body)).toBeLessThan(300);
    const row = asRow(created.body);
    decisionIds.push(row.id);
    return row;
  }

  beforeAll(async () => {
    if (mode === "misconfigured") throw new Error("ENGINEERING_REVIEW_RLS=1 but hosted credentials are missing");
    fixtures = await provisionReviewRlsFixtures();
    environment = "ready";
  });

  afterAll(async () => {
    if (environment !== "ready") return;
    const studies = studyIds.length ? `(${studyIds.join(",")})` : null;
    const runs = runIds.length ? `(${runIds.join(",")})` : null;
    if (runs) {
      await svc(`engineering_optimization_run_manifests?run_id=in.${runs}`, { method: "DELETE" });
      await svc(`engineering_optimization_constraint_evaluations?run_id=in.${runs}`, { method: "DELETE" });
      await svc(`engineering_optimization_result_metrics?run_id=in.${runs}`, { method: "DELETE" });
      await svc(`engineering_optimization_run_inputs?run_id=in.${runs}`, { method: "DELETE" });
      await svc(`engineering_optimization_runs?id=in.${runs}`, { method: "DELETE" });
    }
    if (studies) {
      await svc(`engineering_object_links?from_id=in.${studies}`, { method: "DELETE" });
      await svc(`engineering_object_links?to_id=in.${studies}`, { method: "DELETE" });
      await svc(`engineering_optimization_alternative_values?study_id=in.${studies}`, { method: "DELETE" });
      await svc(`engineering_optimization_alternatives?study_id=in.${studies}`, { method: "DELETE" });
      await svc(`engineering_optimization_objectives?study_id=in.${studies}`, { method: "DELETE" });
      await svc(`engineering_optimization_constraints?study_id=in.${studies}`, { method: "DELETE" });
      await svc(`engineering_optimization_design_variables?study_id=in.${studies}`, { method: "DELETE" });
      await svc(`engineering_optimization_scenarios?study_id=in.${studies}`, { method: "DELETE" });
      await svc(`engineering_optimization_studies?id=in.${studies}`, { method: "DELETE" });
    }
    if (systemIds.length) {
      const sys = `(${systemIds.join(",")})`;
      await svc(`engineering_object_links?from_id=in.${sys}`, { method: "DELETE" });
      await svc(`engineering_object_links?to_id=in.${sys}`, { method: "DELETE" });
      await svc(`engineering_systems?id=in.${sys}`, { method: "DELETE" });
    }
    if (baselineIds.length) {
      const bl = `(${baselineIds.join(",")})`;
      await svc(`engineering_configuration_items?baseline_id=in.${bl}`, { method: "DELETE" });
      await svc(`engineering_configuration_baselines?id=in.${bl}`, { method: "DELETE" });
    }
    if (decisionIds.length) {
      await svc(`engineering_decisions?id=in.(${decisionIds.join(",")})`, { method: "DELETE" });
    }
    await cleanupTransientReviewPackages();
  });

  beforeEach(({ skip }) => {
    if (environment !== "ready") skip("SKIPPED_ENVIRONMENT_UNAVAILABLE");
  });

  it("study workspace fail-closed matrix", async () => {
    const a1 = await seedStudy({
      tenantId: fixtures.tenantAId,
      workspaceId: fixtures.workspaceA1Id,
      projectId: fixtures.projectA1Id,
      title: "A1 study",
    });
    const a2 = await seedStudy({
      tenantId: fixtures.tenantAId,
      workspaceId: fixtures.workspaceA2Id,
      projectId: fixtures.projectA2Id,
      title: "A2 study",
    });
    const b1 = await seedStudy({
      tenantId: fixtures.tenantBId,
      workspaceId: fixtures.workspaceB1Id,
      projectId: fixtures.projectB1Id,
      title: "B1 study",
    });

    expect(ids((await rest(`engineering_optimization_studies?id=eq.${a1.id}`, {}, fixtures.users.a1.jwt)).body)).toEqual([
      a1.id,
    ]);
    expect(ids((await rest(`engineering_optimization_studies?id=eq.${a2.id}`, {}, fixtures.users.a1.jwt)).body)).toEqual([]);
    expect(ids((await rest(`engineering_optimization_studies?id=eq.${b1.id}`, {}, fixtures.users.a1.jwt)).body)).toEqual([]);
    expect(ids((await rest(`engineering_optimization_studies?id=eq.${a1.id}`)).body)).toEqual([]);
    expect(ids((await svc(`engineering_optimization_studies?id=eq.${a2.id}`)).body)).toContain(a2.id);
    expect(
      mutationDenied(
        await rest(
          `engineering_optimization_studies?id=eq.${a2.id}`,
          { method: "PATCH", body: JSON.stringify({ title: "hijack" }) },
          fixtures.users.a1.jwt,
        ),
      ),
    ).toBe(true);
  });

  it("denies cross-workspace baseline, system, decision, and child writes", async () => {
    const studyA1 = await seedStudy({
      tenantId: fixtures.tenantAId,
      workspaceId: fixtures.workspaceA1Id,
      projectId: fixtures.projectA1Id,
      title: "A1 context",
    });
    const studyA2 = await seedStudy({
      tenantId: fixtures.tenantAId,
      workspaceId: fixtures.workspaceA2Id,
      projectId: fixtures.projectA2Id,
      title: "A2 context",
    });
    const blA2 = await seedBaseline({
      tenantId: fixtures.tenantAId,
      workspaceId: fixtures.workspaceA2Id,
      projectId: fixtures.projectA2Id,
      name: "A2 FEED",
    });
    const sysA2 = await seedSystem({
      tenantId: fixtures.tenantAId,
      workspaceId: fixtures.workspaceA2Id,
      projectId: fixtures.projectA2Id,
      name: "A2 sys",
    });
    const decA2 = await seedDecision({
      tenantId: fixtures.tenantAId,
      workspaceId: fixtures.workspaceA2Id,
      projectId: fixtures.projectA2Id,
      title: "A2 decision",
    });

    expect(
      (
        await rest(
          `engineering_optimization_studies?id=eq.${studyA1.id}`,
          { method: "PATCH", body: JSON.stringify({ configuration_baseline_id: blA2.id }) },
          fixtures.users.a1.jwt,
        )
      ).status,
    ).toBeGreaterThanOrEqual(400);
    expect(
      (
        await rest(
          `engineering_optimization_studies?id=eq.${studyA1.id}`,
          { method: "PATCH", body: JSON.stringify({ decision_id: decA2.id }) },
          fixtures.users.a1.jwt,
        )
      ).status,
    ).toBeGreaterThanOrEqual(400);

    const scoped = await rest(
      "engineering_object_links",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantAId,
          from_type: "optimization_study",
          from_id: studyA1.id,
          to_type: "system",
          to_id: sysA2.id,
          relationship: "SCOPED_TO",
          relationship_governed: true,
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(scoped.status).toBeGreaterThanOrEqual(400);

    const child = await rest(
      "engineering_optimization_objectives",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          study_id: studyA2.id,
          objective_code: `O-${randomUUID().slice(0, 6)}`,
          name: "hijack",
          metric_key: "MASS",
          direction: "MINIMIZE",
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(child.status).toBeGreaterThanOrEqual(400);
    if (child.status < 300) {
      objectiveIds.push(asRow(child.body).id);
    }
  });

  it("denies cross-workspace run and result reads", async () => {
    const blA1 = await seedBaseline({
      tenantId: fixtures.tenantAId,
      workspaceId: fixtures.workspaceA1Id,
      projectId: fixtures.projectA1Id,
      name: "A1 FEED",
    });
    const blA2 = await seedBaseline({
      tenantId: fixtures.tenantAId,
      workspaceId: fixtures.workspaceA2Id,
      projectId: fixtures.projectA2Id,
      name: "A2 FEED run",
    });
    const studyA1 = await seedStudy({
      tenantId: fixtures.tenantAId,
      workspaceId: fixtures.workspaceA1Id,
      projectId: fixtures.projectA1Id,
      title: "A1 run study",
    });
    const studyA2 = await seedStudy({
      tenantId: fixtures.tenantAId,
      workspaceId: fixtures.workspaceA2Id,
      projectId: fixtures.projectA2Id,
      title: "A2 run study",
    });
    const altA1 = asRow(
      (
        await svc("engineering_optimization_alternatives", {
          method: "POST",
          body: JSON.stringify({
            tenant_id: fixtures.tenantAId,
            workspace_id: fixtures.workspaceA1Id,
            project_id: fixtures.projectA1Id,
            study_id: studyA1.id,
            alternative_code: `ALT-${randomUUID().slice(0, 6)}`,
            name: "A1 alt",
            status: "active",
          }),
        })
      ).body,
    );
    alternativeIds.push(altA1.id);
    const altA2 = asRow(
      (
        await svc("engineering_optimization_alternatives", {
          method: "POST",
          body: JSON.stringify({
            tenant_id: fixtures.tenantAId,
            workspace_id: fixtures.workspaceA2Id,
            project_id: fixtures.projectA2Id,
            study_id: studyA2.id,
            alternative_code: `ALT-${randomUUID().slice(0, 6)}`,
            name: "A2 alt",
            status: "active",
          }),
        })
      ).body,
    );
    alternativeIds.push(altA2.id);
    const runA1 = asRow(
      (
        await svc("engineering_optimization_runs", {
          method: "POST",
          body: JSON.stringify({
            tenant_id: fixtures.tenantAId,
            workspace_id: fixtures.workspaceA1Id,
            project_id: fixtures.projectA1Id,
            study_id: studyA1.id,
            alternative_id: altA1.id,
            status: "queued",
            configuration_baseline_id: blA1.id,
            baseline_fingerprint: "a".repeat(64),
          }),
        })
      ).body,
    );
    runIds.push(runA1.id);
    const runA2 = asRow(
      (
        await svc("engineering_optimization_runs", {
          method: "POST",
          body: JSON.stringify({
            tenant_id: fixtures.tenantAId,
            workspace_id: fixtures.workspaceA2Id,
            project_id: fixtures.projectA2Id,
            study_id: studyA2.id,
            alternative_id: altA2.id,
            status: "queued",
            configuration_baseline_id: blA2.id,
            baseline_fingerprint: "b".repeat(64),
          }),
        })
      ).body,
    );
    runIds.push(runA2.id);

    expect(ids((await rest(`engineering_optimization_runs?id=eq.${runA1.id}`, {}, fixtures.users.a1.jwt)).body)).toEqual([
      runA1.id,
    ]);
    expect(ids((await rest(`engineering_optimization_runs?id=eq.${runA2.id}`, {}, fixtures.users.a1.jwt)).body)).toEqual([]);
    expect(ids((await rest(`engineering_optimization_result_metrics?run_id=eq.${runA2.id}`, {}, fixtures.users.a1.jwt)).body)).toEqual(
      [],
    );
  });
});
