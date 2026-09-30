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

function totalFromRange(contentRange: string | null): number | null {
  if (!contentRange) return null;
  const match = contentRange.match(/\/(\d+|\*)$/);
  if (!match) return null;
  if (match[1] === "*") return null;
  return Number(match[1]);
}

describe.skipIf(!LIVE)("EOS-A8B-C live JWT RLS — Platform KG workspace security", () => {
  loadLocalEnv();
  const url = resolveSupabaseUrl()!;
  const anonKey = resolveSupabaseAnonKey()!;
  const serviceKey = resolveServiceRoleKey()!;
  let fixtures: ReviewRlsFixtures;
  let environment: "ready" | "unavailable" = "unavailable";
  const nodeIds: string[] = [];
  const edgeIds: string[] = [];

  async function rest(path: string, options: RequestInit = {}, jwt?: string) {
    return restFetch(url, anonKey, serviceKey, path, options, jwt);
  }
  async function svc(path: string, options: RequestInit = {}) {
    return rest(path, options, serviceKey);
  }

  async function insertNode(input: {
    tenantId: string;
    workspaceId: string | null;
    nodeType: string;
    title: string;
    sourceRef: string;
    metadata?: Record<string, unknown>;
  }) {
    const created = await svc("knowledge_nodes", {
      method: "POST",
      body: JSON.stringify({
        tenant_id: input.tenantId,
        workspace_id: input.workspaceId,
        node_type: input.nodeType,
        title: input.title,
        source_ref: input.sourceRef,
        content: { eos_a8bc: true },
        metadata: input.metadata ?? {},
      }),
    });
    expect(created.status, JSON.stringify(created.body)).toBeLessThan(300);
    const id = entityId(created.body) || ids(created.body)[0];
    expect(id).toBeTruthy();
    nodeIds.push(id);
    return id;
  }

  beforeAll(async () => {
    if (mode === "misconfigured") throw new Error("ENGINEERING_REVIEW_RLS=1 but hosted credentials are missing");
    fixtures = await provisionReviewRlsFixtures();
    environment = "ready";
  });

  afterAll(async () => {
    if (environment !== "ready") return;
    if (edgeIds.length) await svc(`knowledge_edges?id=in.(${edgeIds.join(",")})`, { method: "DELETE" });
    if (nodeIds.length) await svc(`knowledge_nodes?id=in.(${nodeIds.join(",")})`, { method: "DELETE" });
    await cleanupTransientReviewPackages();
  });

  beforeEach(({ skip }) => {
    if (environment !== "ready") skip("SKIPPED_ENVIRONMENT_UNAVAILABLE");
  });

  it("allows A1 workspace nodes, denies A2/B1/anonymous, and blocks count leakage", async () => {
    const a1Node = await insertNode({
      tenantId: fixtures.tenantAId,
      workspaceId: fixtures.workspaceA1Id,
      nodeType: "engineering_thread_object",
      title: "A8BC hidden-from-a2",
      sourceRef: `eos-thread:requirement:${crypto.randomUUID()}`,
      metadata: { family: "engineering-thread-projection", workspace_id: fixtures.workspaceA1Id },
    });

    const a1 = await rest(`knowledge_nodes?id=eq.${a1Node}&select=id,title`, {}, fixtures.users.a1.jwt);
    expect(ids(a1.body)).toContain(a1Node);

    const a2 = await rest(`knowledge_nodes?id=eq.${a1Node}&select=id,title,workspace_id`, {}, fixtures.users.a2.jwt);
    expect(ids(a2.body)).not.toContain(a1Node);
    expect(JSON.stringify(a2.body)).not.toMatch(/A8BC hidden-from-a2/);

    const b1 = await rest(`knowledge_nodes?id=eq.${a1Node}&select=id`, {}, fixtures.users.b1.jwt);
    expect(ids(b1.body)).not.toContain(a1Node);

    const anon = await rest(`knowledge_nodes?id=eq.${a1Node}&select=id`, {});
    expect(ids(anon.body)).not.toContain(a1Node);

    const a2Count = await rest(
      `knowledge_nodes?id=eq.${a1Node}&select=id`,
      { headers: { Prefer: "count=exact" } },
      fixtures.users.a2.jwt,
    );
    const a2Total = totalFromRange(a2Count.contentRange);
    expect(a2Total === null || a2Total === 0).toBe(true);
    expect(ids(a2Count.body)).toHaveLength(0);

    const userInsert = await rest(
      "knowledge_nodes",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          node_type: "engineering_thread_object",
          title: "user write denied",
          source_ref: `eos-thread:system:${crypto.randomUUID()}`,
          metadata: { family: "engineering-thread-projection" },
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(mutationDenied(userInsert)).toBe(true);
  });

  it("hides edges unless both endpoints are visible and denies cross-workspace/cross-tenant edges", async () => {
    const a1Source = await insertNode({
      tenantId: fixtures.tenantAId,
      workspaceId: fixtures.workspaceA1Id,
      nodeType: "engineering_thread_object",
      title: "A8BC src",
      sourceRef: `eos-thread:system:${crypto.randomUUID()}`,
      metadata: { family: "engineering-thread-projection", workspace_id: fixtures.workspaceA1Id },
    });
    const a1Target = await insertNode({
      tenantId: fixtures.tenantAId,
      workspaceId: fixtures.workspaceA1Id,
      nodeType: "engineering_thread_object",
      title: "A8BC tgt",
      sourceRef: `eos-thread:requirement:${crypto.randomUUID()}`,
      metadata: { family: "engineering-thread-projection", workspace_id: fixtures.workspaceA1Id },
    });
    const a2Target = await insertNode({
      tenantId: fixtures.tenantAId,
      workspaceId: fixtures.workspaceA2Id,
      nodeType: "engineering_thread_object",
      title: "A8BC other-ws-tgt",
      sourceRef: `eos-thread:requirement:${crypto.randomUUID()}`,
      metadata: { family: "engineering-thread-projection", workspace_id: fixtures.workspaceA2Id },
    });
    const b1Target = await insertNode({
      tenantId: fixtures.tenantBId,
      workspaceId: fixtures.workspaceB1Id,
      nodeType: "engineering_thread_object",
      title: "A8BC other-tenant-tgt",
      sourceRef: `eos-thread:requirement:${crypto.randomUUID()}`,
      metadata: { family: "engineering-thread-projection", workspace_id: fixtures.workspaceB1Id },
    });

    const visibleEdge = await svc("knowledge_edges", {
      method: "POST",
      body: JSON.stringify({
        tenant_id: fixtures.tenantAId,
        from_node_id: a1Source,
        to_node_id: a1Target,
        edge_type: "ALLOCATED_TO",
        metadata: { family: "engineering-thread-projection", workspace_id: fixtures.workspaceA1Id },
      }),
    });
    expect(visibleEdge.status, JSON.stringify(visibleEdge.body)).toBeLessThan(300);
    const visibleId = entityId(visibleEdge.body) || ids(visibleEdge.body)[0];
    edgeIds.push(visibleId);

    const hiddenTargetEdge = await svc("knowledge_edges", {
      method: "POST",
      body: JSON.stringify({
        tenant_id: fixtures.tenantAId,
        from_node_id: a1Source,
        to_node_id: a2Target,
        edge_type: "DEPENDS_ON",
        metadata: { family: "engineering-thread-projection", workspace_id: fixtures.workspaceA1Id },
      }),
    });
    expect(hiddenTargetEdge.status, JSON.stringify(hiddenTargetEdge.body)).toBeLessThan(300);
    const hiddenTargetId = entityId(hiddenTargetEdge.body) || ids(hiddenTargetEdge.body)[0];
    edgeIds.push(hiddenTargetId);

    const crossTenantEdge = await svc("knowledge_edges", {
      method: "POST",
      body: JSON.stringify({
        tenant_id: fixtures.tenantAId,
        from_node_id: a1Source,
        to_node_id: b1Target,
        edge_type: "DEPENDS_ON",
        metadata: { family: "engineering-thread-projection" },
      }),
    });
    expect(crossTenantEdge.status, JSON.stringify(crossTenantEdge.body)).toBeLessThan(300);
    const crossTenantId = entityId(crossTenantEdge.body) || ids(crossTenantEdge.body)[0];
    edgeIds.push(crossTenantId);

    const a1Visible = await rest(`knowledge_edges?id=eq.${visibleId}&select=id,edge_type`, {}, fixtures.users.a1.jwt);
    expect(ids(a1Visible.body)).toContain(visibleId);

    const a1Hidden = await rest(`knowledge_edges?id=eq.${hiddenTargetId}&select=id,from_node_id,to_node_id`, {}, fixtures.users.a1.jwt);
    expect(ids(a1Hidden.body)).not.toContain(hiddenTargetId);
    expect(JSON.stringify(a1Hidden.body)).not.toContain(a2Target);

    const a2Visible = await rest(`knowledge_edges?id=eq.${visibleId}&select=id`, {}, fixtures.users.a2.jwt);
    expect(ids(a2Visible.body)).not.toContain(visibleId);

    const a1Cross = await rest(`knowledge_edges?id=eq.${crossTenantId}&select=id,to_node_id`, {}, fixtures.users.a1.jwt);
    expect(ids(a1Cross.body)).not.toContain(crossTenantId);
    expect(JSON.stringify(a1Cross.body)).not.toContain(b1Target);

    const anon = await rest(`knowledge_edges?id=eq.${visibleId}&select=id`, {});
    expect(ids(anon.body)).not.toContain(visibleId);

    const userEdge = await rest(
      "knowledge_edges",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantAId,
          from_node_id: a1Source,
          to_node_id: a1Target,
          edge_type: "USES",
          metadata: { family: "engineering-thread-projection" },
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(mutationDenied(userEdge)).toBe(true);
  });
});
