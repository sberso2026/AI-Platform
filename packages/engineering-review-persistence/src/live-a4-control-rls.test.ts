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
const TAG = { eos_a4: true };

type JsonRow = Record<string, unknown> & { id: string };

function asRow(body: unknown): JsonRow {
  if (Array.isArray(body) && body[0] && typeof body[0] === "object" && body[0] !== null && "id" in body[0]) {
    return body[0] as JsonRow;
  }
  if (body && typeof body === "object" && "id" in body) return body as JsonRow;
  throw new Error(`expected id in ${JSON.stringify(body)}`);
}

describe.skipIf(!LIVE)("EOS-A4 live JWT RLS — Requirements, Change, Impact, Configuration", () => {
  loadLocalEnv();
  const url = resolveSupabaseUrl()!;
  const anonKey = resolveSupabaseAnonKey()!;
  const serviceKey = resolveServiceRoleKey()!;
  let fixtures: ReviewRlsFixtures;
  let environment: "ready" | "unavailable" = "unavailable";
  const requirementIds: string[] = [];
  const changeIds: string[] = [];
  const impactIds: string[] = [];
  const baselineIds: string[] = [];
  const itemIds: string[] = [];
  const systemIds: string[] = [];

  async function rest(path: string, options: RequestInit = {}, jwt?: string) {
    return restFetch(url, anonKey, serviceKey, path, options, jwt);
  }
  async function svc(path: string, options: RequestInit = {}) {
    return rest(path, options, serviceKey);
  }

  async function seedRequirement(input: {
    tenantId: string;
    workspaceId: string;
    projectId: string;
    title: string;
  }) {
    const created = await svc("engineering_requirements", {
      method: "POST",
      body: JSON.stringify({
        tenant_id: input.tenantId,
        workspace_id: input.workspaceId,
        project_id: input.projectId,
        requirement_code: `REQ-A4-${randomUUID().slice(0, 8)}`,
        title: input.title,
        statement: `${input.title} shall be satisfied.`,
        requirement_type: "PERFORMANCE",
        status: "draft",
        metadata: TAG,
      }),
    });
    expect(created.status, JSON.stringify(created.body)).toBeLessThan(300);
    const row = asRow(created.body);
    requirementIds.push(row.id);
    return row;
  }

  async function seedChange(input: {
    tenantId: string;
    workspaceId: string;
    projectId: string;
    title: string;
  }) {
    const created = await svc("engineering_changes", {
      method: "POST",
      body: JSON.stringify({
        tenant_id: input.tenantId,
        workspace_id: input.workspaceId,
        project_id: input.projectId,
        change_code: `CHG-A4-${randomUUID().slice(0, 8)}`,
        title: input.title,
        change_type: "DESIGN",
        status: "proposed",
        metadata: TAG,
      }),
    });
    expect(created.status, JSON.stringify(created.body)).toBeLessThan(300);
    const row = asRow(created.body);
    changeIds.push(row.id);
    return row;
  }

  async function seedImpact(input: {
    tenantId: string;
    workspaceId: string;
    projectId: string;
    title: string;
  }) {
    const created = await svc("engineering_impacts", {
      method: "POST",
      body: JSON.stringify({
        tenant_id: input.tenantId,
        workspace_id: input.workspaceId,
        project_id: input.projectId,
        impact_code: `IMP-A4-${randomUUID().slice(0, 8)}`,
        title: input.title,
        impact_type: "TECHNICAL",
        status: "candidate",
        metadata: TAG,
      }),
    });
    expect(created.status, JSON.stringify(created.body)).toBeLessThan(300);
    const row = asRow(created.body);
    impactIds.push(row.id);
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
        baseline_code: `BL-A4-${randomUUID().slice(0, 8)}`,
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
        system_code: `SYS-A4-${randomUUID().slice(0, 8)}`,
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

  beforeAll(async () => {
    if (mode === "misconfigured") throw new Error("ENGINEERING_REVIEW_RLS=1 but hosted credentials are missing");
    fixtures = await provisionReviewRlsFixtures();
    environment = "ready";
  });

  afterAll(async () => {
    if (environment !== "ready") return;
    const req = requirementIds.length ? `(${requirementIds.join(",")})` : null;
    const chg = changeIds.length ? `(${changeIds.join(",")})` : null;
    const imp = impactIds.length ? `(${impactIds.join(",")})` : null;
    const bl = baselineIds.length ? `(${baselineIds.join(",")})` : null;
    const sys = systemIds.length ? `(${systemIds.join(",")})` : null;
    if (req) {
      await svc(`engineering_object_links?from_id=in.${req}`, { method: "DELETE" });
      await svc(`engineering_object_links?to_id=in.${req}`, { method: "DELETE" });
    }
    if (chg) {
      await svc(`engineering_object_links?from_id=in.${chg}`, { method: "DELETE" });
      await svc(`engineering_object_links?to_id=in.${chg}`, { method: "DELETE" });
    }
    if (imp) {
      await svc(`engineering_object_links?from_id=in.${imp}`, { method: "DELETE" });
      await svc(`engineering_object_links?to_id=in.${imp}`, { method: "DELETE" });
    }
    if (bl) {
      await svc(`engineering_object_links?from_id=in.${bl}`, { method: "DELETE" });
      await svc(`engineering_object_links?to_id=in.${bl}`, { method: "DELETE" });
      await svc(`engineering_configuration_items?baseline_id=in.${bl}`, { method: "DELETE" });
    }
    if (itemIds.length) {
      await svc(`engineering_configuration_items?id=in.(${itemIds.join(",")})`, { method: "DELETE" });
    }
    if (imp) await svc(`engineering_impacts?id=in.${imp}`, { method: "DELETE" });
    if (chg) await svc(`engineering_changes?id=in.${chg}`, { method: "DELETE" });
    if (req) await svc(`engineering_requirements?id=in.${req}`, { method: "DELETE" });
    if (bl) await svc(`engineering_configuration_baselines?id=in.${bl}`, { method: "DELETE" });
    if (sys) {
      await svc(`engineering_object_links?from_id=in.${sys}`, { method: "DELETE" });
      await svc(`engineering_object_links?to_id=in.${sys}`, { method: "DELETE" });
      await svc(`engineering_systems?id=in.${sys}`, { method: "DELETE" });
    }
    await cleanupTransientReviewPackages();
  });

  beforeEach(({ skip }) => {
    if (environment !== "ready") skip("SKIPPED_ENVIRONMENT_UNAVAILABLE");
  });

  it("requirement/change/impact/configuration workspace fail-closed matrix", async () => {
    const reqA1 = await seedRequirement({
      tenantId: fixtures.tenantAId,
      workspaceId: fixtures.workspaceA1Id,
      projectId: fixtures.projectA1Id,
      title: "A1 bearing",
    });
    const reqA2 = await seedRequirement({
      tenantId: fixtures.tenantAId,
      workspaceId: fixtures.workspaceA2Id,
      projectId: fixtures.projectA2Id,
      title: "A2 bearing",
    });
    const reqB1 = await seedRequirement({
      tenantId: fixtures.tenantBId,
      workspaceId: fixtures.workspaceB1Id,
      projectId: fixtures.projectB1Id,
      title: "B1 bearing",
    });
    const chgA1 = await seedChange({
      tenantId: fixtures.tenantAId,
      workspaceId: fixtures.workspaceA1Id,
      projectId: fixtures.projectA1Id,
      title: "A1 change",
    });
    const chgA2 = await seedChange({
      tenantId: fixtures.tenantAId,
      workspaceId: fixtures.workspaceA2Id,
      projectId: fixtures.projectA2Id,
      title: "A2 change",
    });
    const impA1 = await seedImpact({
      tenantId: fixtures.tenantAId,
      workspaceId: fixtures.workspaceA1Id,
      projectId: fixtures.projectA1Id,
      title: "A1 impact",
    });
    const impB1 = await seedImpact({
      tenantId: fixtures.tenantBId,
      workspaceId: fixtures.workspaceB1Id,
      projectId: fixtures.projectB1Id,
      title: "B1 impact",
    });
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
      name: "A2 FEED",
    });

    expect(ids((await rest(`engineering_requirements?id=eq.${reqA1.id}`, {}, fixtures.users.a1.jwt)).body)).toEqual([
      reqA1.id,
    ]);
    expect(ids((await rest(`engineering_requirements?id=eq.${reqA2.id}`, {}, fixtures.users.a1.jwt)).body)).toEqual([]);
    expect(ids((await rest(`engineering_requirements?id=eq.${reqB1.id}`, {}, fixtures.users.a1.jwt)).body)).toEqual([]);
    expect(ids((await rest(`engineering_requirements?id=eq.${reqA1.id}`)).body)).toEqual([]);
    expect(ids((await svc(`engineering_requirements?id=eq.${reqA2.id}`)).body)).toContain(reqA2.id);

    expect(ids((await rest(`engineering_changes?id=eq.${chgA1.id}`, {}, fixtures.users.a1.jwt)).body)).toEqual([chgA1.id]);
    expect(ids((await rest(`engineering_changes?id=eq.${chgA2.id}`, {}, fixtures.users.a1.jwt)).body)).toEqual([]);
    expect(ids((await rest(`engineering_impacts?id=eq.${impA1.id}`, {}, fixtures.users.a1.jwt)).body)).toEqual([impA1.id]);
    expect(ids((await rest(`engineering_impacts?id=eq.${impB1.id}`, {}, fixtures.users.a1.jwt)).body)).toEqual([]);
    expect(ids((await rest(`engineering_configuration_baselines?id=eq.${blA1.id}`, {}, fixtures.users.a1.jwt)).body)).toEqual([
      blA1.id,
    ]);
    expect(ids((await rest(`engineering_configuration_baselines?id=eq.${blA2.id}`, {}, fixtures.users.a1.jwt)).body)).toEqual(
      [],
    );

    expect(
      mutationDenied(
        await rest(
          `engineering_requirements?id=eq.${reqA2.id}`,
          { method: "PATCH", body: JSON.stringify({ title: "hijack" }) },
          fixtures.users.a1.jwt,
        ),
      ),
    ).toBe(true);
    expect(
      (
        await rest(
          `engineering_requirements?id=eq.${reqA1.id}`,
          { method: "PATCH", body: JSON.stringify({ title: "authorized" }) },
          fixtures.users.a1.jwt,
        )
      ).status,
    ).toBeLessThan(400);
  });

  it("cross-workspace and cross-tenant ALLOCATED_TO / AFFECTS / CAUSED_BY fail", async () => {
    const reqA1 = await seedRequirement({
      tenantId: fixtures.tenantAId,
      workspaceId: fixtures.workspaceA1Id,
      projectId: fixtures.projectA1Id,
      title: "A1 alloc req",
    });
    const sysA1 = await seedSystem({
      tenantId: fixtures.tenantAId,
      workspaceId: fixtures.workspaceA1Id,
      projectId: fixtures.projectA1Id,
      name: "A1 sys",
    });
    const sysA2 = await seedSystem({
      tenantId: fixtures.tenantAId,
      workspaceId: fixtures.workspaceA2Id,
      projectId: fixtures.projectA2Id,
      name: "A2 sys",
    });
    const sysB1 = await seedSystem({
      tenantId: fixtures.tenantBId,
      workspaceId: fixtures.workspaceB1Id,
      projectId: fixtures.projectB1Id,
      name: "B1 sys",
    });
    const chgA1 = await seedChange({
      tenantId: fixtures.tenantAId,
      workspaceId: fixtures.workspaceA1Id,
      projectId: fixtures.projectA1Id,
      title: "A1 affect",
    });
    const chgA2 = await seedChange({
      tenantId: fixtures.tenantAId,
      workspaceId: fixtures.workspaceA2Id,
      projectId: fixtures.projectA2Id,
      title: "A2 affect",
    });
    const impA1 = await seedImpact({
      tenantId: fixtures.tenantAId,
      workspaceId: fixtures.workspaceA1Id,
      projectId: fixtures.projectA1Id,
      title: "A1 cause",
    });

    const allocOk = await rest(
      "engineering_object_links",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantAId,
          from_type: "requirement",
          from_id: reqA1.id,
          to_type: "system",
          to_id: sysA1.id,
          relationship: "ALLOCATED_TO",
          relationship_governed: true,
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(allocOk.status, JSON.stringify(allocOk.body)).toBeLessThan(400);

    expect(
      (
        await rest(
          "engineering_object_links",
          {
            method: "POST",
            body: JSON.stringify({
              tenant_id: fixtures.tenantAId,
              from_type: "requirement",
              from_id: reqA1.id,
              to_type: "system",
              to_id: sysA2.id,
              relationship: "ALLOCATED_TO",
              relationship_governed: true,
            }),
          },
          fixtures.users.a1.jwt,
        )
      ).status,
    ).toBeGreaterThanOrEqual(400);

    expect(
      (
        await rest(
          "engineering_object_links",
          {
            method: "POST",
            body: JSON.stringify({
              tenant_id: fixtures.tenantAId,
              from_type: "requirement",
              from_id: reqA1.id,
              to_type: "system",
              to_id: sysB1.id,
              relationship: "ALLOCATED_TO",
              relationship_governed: true,
            }),
          },
          fixtures.users.a1.jwt,
        )
      ).status,
    ).toBeGreaterThanOrEqual(400);

    expect(
      (
        await rest(
          "engineering_object_links",
          {
            method: "POST",
            body: JSON.stringify({
              tenant_id: fixtures.tenantAId,
              from_type: "change",
              from_id: chgA1.id,
              to_type: "requirement",
              to_id: reqA1.id,
              relationship: "AFFECTS",
              relationship_governed: true,
            }),
          },
          fixtures.users.a1.jwt,
        )
      ).status,
    ).toBeLessThan(400);

    expect(
      (
        await rest(
          "engineering_object_links",
          {
            method: "POST",
            body: JSON.stringify({
              tenant_id: fixtures.tenantAId,
              from_type: "change",
              from_id: chgA1.id,
              to_type: "change",
              to_id: chgA2.id,
              relationship: "AFFECTS",
              relationship_governed: true,
            }),
          },
          fixtures.users.a1.jwt,
        )
      ).status,
    ).toBeGreaterThanOrEqual(400);

    expect(
      (
        await rest(
          "engineering_object_links",
          {
            method: "POST",
            body: JSON.stringify({
              tenant_id: fixtures.tenantAId,
              from_type: "impact",
              from_id: impA1.id,
              to_type: "change",
              to_id: chgA1.id,
              relationship: "CAUSED_BY",
              relationship_governed: true,
            }),
          },
          fixtures.users.a1.jwt,
        )
      ).status,
    ).toBeLessThan(400);

    expect(
      (
        await rest(
          "engineering_object_links",
          {
            method: "POST",
            body: JSON.stringify({
              tenant_id: fixtures.tenantAId,
              from_type: "impact",
              from_id: impA1.id,
              to_type: "change",
              to_id: chgA2.id,
              relationship: "CAUSED_BY",
              relationship_governed: true,
            }),
          },
          fixtures.users.a1.jwt,
        )
      ).status,
    ).toBeGreaterThanOrEqual(400);
  });

  it("configuration item cannot snapshot an unauthorized workspace or tenant object", async () => {
    const blA1 = await seedBaseline({
      tenantId: fixtures.tenantAId,
      workspaceId: fixtures.workspaceA1Id,
      projectId: fixtures.projectA1Id,
      name: "A1 snapshot",
    });
    const sysA1 = await seedSystem({
      tenantId: fixtures.tenantAId,
      workspaceId: fixtures.workspaceA1Id,
      projectId: fixtures.projectA1Id,
      name: "A1 snap sys",
    });
    const sysA2 = await seedSystem({
      tenantId: fixtures.tenantAId,
      workspaceId: fixtures.workspaceA2Id,
      projectId: fixtures.projectA2Id,
      name: "A2 snap sys",
    });
    const sysB1 = await seedSystem({
      tenantId: fixtures.tenantBId,
      workspaceId: fixtures.workspaceB1Id,
      projectId: fixtures.projectB1Id,
      name: "B1 snap sys",
    });

    const ok = await rest(
      "engineering_configuration_items",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          baseline_id: blA1.id,
          object_type: "system",
          object_id: sysA1.id,
          object_code_snapshot: "SYS-A1",
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(ok.status, JSON.stringify(ok.body)).toBeLessThan(400);
    itemIds.push(asRow(ok.body).id);

    expect(
      (
        await rest(
          "engineering_configuration_items",
          {
            method: "POST",
            body: JSON.stringify({
              tenant_id: fixtures.tenantAId,
              workspace_id: fixtures.workspaceA1Id,
              baseline_id: blA1.id,
              object_type: "system",
              object_id: sysA2.id,
            }),
          },
          fixtures.users.a1.jwt,
        )
      ).status,
    ).toBeGreaterThanOrEqual(400);

    expect(
      (
        await rest(
          "engineering_configuration_items",
          {
            method: "POST",
            body: JSON.stringify({
              tenant_id: fixtures.tenantAId,
              workspace_id: fixtures.workspaceA1Id,
              baseline_id: blA1.id,
              object_type: "system",
              object_id: sysB1.id,
            }),
          },
          fixtures.users.a1.jwt,
        )
      ).status,
    ).toBeGreaterThanOrEqual(400);
  });
});
