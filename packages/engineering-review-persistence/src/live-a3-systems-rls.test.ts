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
const TAG = { eos_a3: true };

type JsonRow = Record<string, unknown> & { id: string };

function asRow(body: unknown): JsonRow {
  if (Array.isArray(body) && body[0] && typeof body[0] === "object" && body[0] !== null && "id" in body[0]) {
    return body[0] as JsonRow;
  }
  if (body && typeof body === "object" && "id" in body) return body as JsonRow;
  throw new Error(`expected id in ${JSON.stringify(body)}`);
}

describe.skipIf(!LIVE)("EOS-A3 live JWT RLS — Systems & Interfaces", () => {
  loadLocalEnv();
  const url = resolveSupabaseUrl()!;
  const anonKey = resolveSupabaseAnonKey()!;
  const serviceKey = resolveServiceRoleKey()!;
  let fixtures: ReviewRlsFixtures;
  let environment: "ready" | "unavailable" = "unavailable";
  const systemIds: string[] = [];
  const interfaceIds: string[] = [];
  const assetIds: string[] = [];

  async function rest(path: string, options: RequestInit = {}, jwt?: string) {
    return restFetch(url, anonKey, serviceKey, path, options, jwt);
  }
  async function svc(path: string, options: RequestInit = {}) {
    return rest(path, options, serviceKey);
  }

  async function seedSystem(input: {
    tenantId: string;
    workspaceId: string;
    projectId: string;
    name: string;
    parentId?: string;
  }) {
    const created = await svc("engineering_systems", {
      method: "POST",
      body: JSON.stringify({
        tenant_id: input.tenantId,
        workspace_id: input.workspaceId,
        project_id: input.projectId,
        parent_system_id: input.parentId ?? null,
        system_code: `SYS-A3-${randomUUID().slice(0, 8)}`,
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

  async function seedInterface(input: {
    tenantId: string;
    workspaceId: string;
    projectId: string;
    name: string;
  }) {
    const created = await svc("engineering_interfaces", {
      method: "POST",
      body: JSON.stringify({
        tenant_id: input.tenantId,
        workspace_id: input.workspaceId,
        project_id: input.projectId,
        interface_code: `IF-A3-${randomUUID().slice(0, 8)}`,
        name: input.name,
        interface_type: "PHYSICAL",
        status: "identified",
        metadata: TAG,
      }),
    });
    expect(created.status, JSON.stringify(created.body)).toBeLessThan(300);
    const row = asRow(created.body);
    interfaceIds.push(row.id);
    return row;
  }

  async function seedAsset(input: {
    tenantId: string;
    workspaceId: string;
    projectId: string;
    tag: string;
  }) {
    const created = await svc("engineering_assets", {
      method: "POST",
      body: JSON.stringify({
        tenant_id: input.tenantId,
        workspace_id: input.workspaceId,
        engineering_project_id: input.projectId,
        asset_tag: input.tag,
        asset_name: input.tag,
        status: "active",
        metadata: TAG,
      }),
    });
    expect(created.status, JSON.stringify(created.body)).toBeLessThan(300);
    const row = asRow(created.body);
    assetIds.push(row.id);
    return row;
  }

  beforeAll(async () => {
    if (mode === "misconfigured") throw new Error("ENGINEERING_REVIEW_RLS=1 but hosted credentials are missing");
    fixtures = await provisionReviewRlsFixtures();
    environment = "ready";
  });

  afterAll(async () => {
    if (environment !== "ready") return;
    const sys = systemIds.length ? `(${systemIds.join(",")})` : null;
    const ifc = interfaceIds.length ? `(${interfaceIds.join(",")})` : null;
    const ast = assetIds.length ? `(${assetIds.join(",")})` : null;
    if (sys) {
      await svc(`engineering_object_links?from_id=in.${sys}`, { method: "DELETE" });
      await svc(`engineering_object_links?to_id=in.${sys}`, { method: "DELETE" });
      await svc(`engineering_systems?id=in.${sys}`, {
        method: "PATCH",
        body: JSON.stringify({ parent_system_id: null }),
      });
    }
    if (ifc) {
      await svc(`engineering_object_links?from_id=in.${ifc}`, { method: "DELETE" });
      await svc(`engineering_object_links?to_id=in.${ifc}`, { method: "DELETE" });
    }
    if (ifc) await svc(`engineering_interfaces?id=in.${ifc}`, { method: "DELETE" });
    if (sys) await svc(`engineering_systems?id=in.${sys}`, { method: "DELETE" });
    if (ast) await svc(`engineering_assets?id=in.${ast}`, { method: "DELETE" });
    await cleanupTransientReviewPackages();
  });

  beforeEach(({ skip }) => {
    if (environment !== "ready") skip("SKIPPED_ENVIRONMENT_UNAVAILABLE");
  });

  it("system read/write matrix", async () => {
    const a1 = await seedSystem({
      tenantId: fixtures.tenantAId,
      workspaceId: fixtures.workspaceA1Id,
      projectId: fixtures.projectA1Id,
      name: "A1 Crushing",
    });
    const a2 = await seedSystem({
      tenantId: fixtures.tenantAId,
      workspaceId: fixtures.workspaceA2Id,
      projectId: fixtures.projectA2Id,
      name: "A2 Conveying",
    });
    const b1 = await seedSystem({
      tenantId: fixtures.tenantBId,
      workspaceId: fixtures.workspaceB1Id,
      projectId: fixtures.projectB1Id,
      name: "B1 Water",
    });

    expect(ids((await rest(`engineering_systems?id=eq.${a1.id}`, {}, fixtures.users.a1.jwt)).body)).toEqual([a1.id]);
    expect(ids((await rest(`engineering_systems?id=eq.${a2.id}`, {}, fixtures.users.a1.jwt)).body)).toEqual([]);
    expect(ids((await rest(`engineering_systems?id=eq.${b1.id}`, {}, fixtures.users.a1.jwt)).body)).toEqual([]);
    expect(ids((await rest(`engineering_systems?id=eq.${a1.id}`)).body)).toEqual([]);
    expect(ids((await svc(`engineering_systems?id=eq.${a2.id}`)).body)).toContain(a2.id);

    const patchOk = await rest(
      `engineering_systems?id=eq.${a1.id}`,
      { method: "PATCH", body: JSON.stringify({ description: "authorized" }) },
      fixtures.users.a1.jwt,
    );
    expect(patchOk.status).toBeLessThan(400);
    expect(
      mutationDenied(
        await rest(
          `engineering_systems?id=eq.${a2.id}`,
          { method: "PATCH", body: JSON.stringify({ description: "hijack" }) },
          fixtures.users.a1.jwt,
        ),
      ),
    ).toBe(true);
  });

  it("hierarchy cannot parent across workspace or tenant and rejects cycles", async () => {
    const a = await seedSystem({
      tenantId: fixtures.tenantAId,
      workspaceId: fixtures.workspaceA1Id,
      projectId: fixtures.projectA1Id,
      name: "A1 parent A",
    });
    const b = await seedSystem({
      tenantId: fixtures.tenantAId,
      workspaceId: fixtures.workspaceA1Id,
      projectId: fixtures.projectA1Id,
      name: "A1 child B",
    });
    const c = await seedSystem({
      tenantId: fixtures.tenantAId,
      workspaceId: fixtures.workspaceA1Id,
      projectId: fixtures.projectA1Id,
      name: "A1 child C",
    });
    const a2 = await seedSystem({
      tenantId: fixtures.tenantAId,
      workspaceId: fixtures.workspaceA2Id,
      projectId: fixtures.projectA2Id,
      name: "A2 foreign parent",
    });
    const b1 = await seedSystem({
      tenantId: fixtures.tenantBId,
      workspaceId: fixtures.workspaceB1Id,
      projectId: fixtures.projectB1Id,
      name: "B1 foreign parent",
    });

    expect(
      (
        await rest(
          `engineering_systems?id=eq.${b.id}`,
          { method: "PATCH", body: JSON.stringify({ parent_system_id: a.id }) },
          fixtures.users.a1.jwt,
        )
      ).status,
    ).toBeLessThan(400);

    expect(
      (
        await rest(
          `engineering_systems?id=eq.${a.id}`,
          { method: "PATCH", body: JSON.stringify({ parent_system_id: a2.id }) },
          fixtures.users.a1.jwt,
        )
      ).status,
    ).toBeGreaterThanOrEqual(400);

    expect(
      (
        await rest(
          `engineering_systems?id=eq.${a.id}`,
          { method: "PATCH", body: JSON.stringify({ parent_system_id: b1.id }) },
          fixtures.users.a1.jwt,
        )
      ).status,
    ).toBeGreaterThanOrEqual(400);

    expect(
      (
        await rest(
          `engineering_systems?id=eq.${a.id}`,
          { method: "PATCH", body: JSON.stringify({ parent_system_id: a.id }) },
          fixtures.users.a1.jwt,
        )
      ).status,
    ).toBeGreaterThanOrEqual(400);

    expect(
      (
        await rest(
          `engineering_systems?id=eq.${c.id}`,
          { method: "PATCH", body: JSON.stringify({ parent_system_id: b.id }) },
          fixtures.users.a1.jwt,
        )
      ).status,
    ).toBeLessThan(400);
    expect(
      (
        await rest(
          `engineering_systems?id=eq.${a.id}`,
          { method: "PATCH", body: JSON.stringify({ parent_system_id: c.id }) },
          fixtures.users.a1.jwt,
        )
      ).status,
    ).toBeGreaterThanOrEqual(400);
  });

  it("interface isolation and endpoint/system-asset boundary", async () => {
    const sysA1 = await seedSystem({
      tenantId: fixtures.tenantAId,
      workspaceId: fixtures.workspaceA1Id,
      projectId: fixtures.projectA1Id,
      name: "A1 process",
    });
    const sysA2 = await seedSystem({
      tenantId: fixtures.tenantAId,
      workspaceId: fixtures.workspaceA2Id,
      projectId: fixtures.projectA2Id,
      name: "A2 process",
    });
    const ifA1 = await seedInterface({
      tenantId: fixtures.tenantAId,
      workspaceId: fixtures.workspaceA1Id,
      projectId: fixtures.projectA1Id,
      name: "A1 IF",
    });
    const ifA2 = await seedInterface({
      tenantId: fixtures.tenantAId,
      workspaceId: fixtures.workspaceA2Id,
      projectId: fixtures.projectA2Id,
      name: "A2 IF",
    });
    const ifB1 = await seedInterface({
      tenantId: fixtures.tenantBId,
      workspaceId: fixtures.workspaceB1Id,
      projectId: fixtures.projectB1Id,
      name: "B1 IF",
    });
    const assetA1 = await seedAsset({
      tenantId: fixtures.tenantAId,
      workspaceId: fixtures.workspaceA1Id,
      projectId: fixtures.projectA1Id,
      tag: `CR-${randomUUID().slice(0, 6)}`,
    });
    const assetA2 = await seedAsset({
      tenantId: fixtures.tenantAId,
      workspaceId: fixtures.workspaceA2Id,
      projectId: fixtures.projectA2Id,
      tag: `CV-${randomUUID().slice(0, 6)}`,
    });
    const assetB1 = await seedAsset({
      tenantId: fixtures.tenantBId,
      workspaceId: fixtures.workspaceB1Id,
      projectId: fixtures.projectB1Id,
      tag: `WT-${randomUUID().slice(0, 6)}`,
    });

    expect(ids((await rest(`engineering_interfaces?id=eq.${ifA1.id}`, {}, fixtures.users.a1.jwt)).body)).toEqual([
      ifA1.id,
    ]);
    expect(ids((await rest(`engineering_interfaces?id=eq.${ifA2.id}`, {}, fixtures.users.a1.jwt)).body)).toEqual([]);
    expect(ids((await rest(`engineering_interfaces?id=eq.${ifB1.id}`, {}, fixtures.users.a1.jwt)).body)).toEqual([]);

    const okLink = await rest(
      "engineering_object_links",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantAId,
          from_type: "interface",
          from_id: ifA1.id,
          to_type: "system",
          to_id: sysA1.id,
          relationship: "CONNECTS",
          relationship_governed: true,
          metadata: { endpoint_role: "participant", eos_a3: true },
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(okLink.status, JSON.stringify(okLink.body)).toBeLessThan(400);

    const crossWsEndpoint = await rest(
      "engineering_object_links",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantAId,
          from_type: "interface",
          from_id: ifA1.id,
          to_type: "system",
          to_id: sysA2.id,
          relationship: "CONNECTS",
          relationship_governed: true,
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(crossWsEndpoint.status).toBeGreaterThanOrEqual(400);

    const containOk = await rest(
      "engineering_object_links",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantAId,
          from_type: "system",
          from_id: sysA1.id,
          to_type: "asset",
          to_id: assetA1.id,
          relationship: "CONTAINS",
          relationship_governed: true,
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(containOk.status, JSON.stringify(containOk.body)).toBeLessThan(400);

    const containA2 = await rest(
      "engineering_object_links",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantAId,
          from_type: "system",
          from_id: sysA1.id,
          to_type: "asset",
          to_id: assetA2.id,
          relationship: "CONTAINS",
          relationship_governed: true,
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(containA2.status).toBeGreaterThanOrEqual(400);

    const containB1 = await rest(
      "engineering_object_links",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantAId,
          from_type: "system",
          from_id: sysA1.id,
          to_type: "asset",
          to_id: assetB1.id,
          relationship: "CONTAINS",
          relationship_governed: true,
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(containB1.status).toBeGreaterThanOrEqual(400);
  });
});
