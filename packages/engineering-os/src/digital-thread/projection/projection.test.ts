import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  analysisTrace,
  changeTrace,
  configurationTrace,
  decisionTrace,
  requirementTrace,
} from "../traces";
import { traverseThread } from "../traversal";
import {
  authorizedMemberContext,
  CRUSHER_FEED_OTHER_TENANT,
  CRUSHER_FEED_OTHER_WORKSPACE,
  CRUSHER_FEED_TENANT,
  CRUSHER_FEED_WORKSPACE,
  crusherExpansionFeedFixture,
} from "../fixture";
import type { CanonicalGovernedLink, EngineeringThreadProjectionEdge, EngineeringThreadProjectionNode, ThreadProjectionStore } from "./types";
import { THREAD_KG_PROJECTION_FLAG, THREAD_KG_READS_FLAG, THREAD_PROJECTION_VERSION } from "./types";
import { EngineeringDigitalThreadProjectionService } from "./service";
import { MemoryThreadProjectionStore } from "./memory-store";
import { normalizeProjectedRelation, isProjectableGovernedLink } from "./normalize";
import { threadProjectionKey, threadNodeSourceRef } from "./identity";
import { semanticEdgeSignature, semanticRelationSignature } from "./query-adapter";
import {
  AI_INFERRED_THREAD_EDGES,
  GRAPH_WRITEBACK_TO_ENGINEERING_CORE,
  PI_KG_DUAL_WRITE_ENGINEERING_THREAD,
  assertProjectionSourceHasNoWriteback,
} from "./writeback";
import { resolveThreadProjectionFlags } from "./flags";
import { createThreadProjectionJobHandler } from "./job-handler";
import type { ThreadCatalogNode, ThreadGraphInput, ThreadRelation, ThreadTraversalResult } from "../types";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../../..");

function visibility(result: ThreadTraversalResult) {
  return {
    nodes: result.nodes.map((n) => `${n.objectType}:${n.objectId}`).sort(),
    edges: result.relationships
      .map((r) => `${r.fromType}:${r.fromId}:${r.relationship}:${r.toType}:${r.toId}`)
      .sort(),
  };
}

function canonicalLinksFromGraph(graph: ThreadGraphInput): CanonicalGovernedLink[] {
  return graph.links.map((link, index) => {
    const from = graph.nodes.find((n) => n.objectType === link.fromType && n.objectId === link.fromId);
    return {
      id: link.id ?? `link-${index}`,
      tenantId: from?.tenantId ?? CRUSHER_FEED_TENANT,
      workspaceId: from?.workspaceId ?? CRUSHER_FEED_WORKSPACE,
      fromType: link.fromType,
      fromId: link.fromId,
      toType: link.toType,
      toId: link.toId,
      relationship: link.relationship,
      governed: link.governed !== false,
      createdBy: link.createdBy ?? null,
      createdAt: link.createdAt ?? "2026-09-01T00:00:00.000Z",
    };
  });
}

function nodeHints(graph: ThreadGraphInput): ThreadCatalogNode[] {
  return graph.nodes;
}

function hints(graph: ThreadGraphInput) {
  return graph.nodes.map((n) => ({
    tenantId: n.tenantId,
    workspaceId: n.workspaceId,
    objectType: n.objectType,
    objectId: n.objectId,
    projectId: n.projectId,
    objectCode: n.objectCode,
    status: n.status,
    title: n.title,
  }));
}

class FailingStore implements ThreadProjectionStore {
  async upsertNode(): Promise<void> {}
  async upsertEdge(): Promise<void> {}
  async removeEdgeBySourceLinkId(): Promise<void> {}
  async listEdges(): Promise<EngineeringThreadProjectionEdge[]> {
    throw new Error("platform kg unavailable");
  }
  async listNodes(): Promise<EngineeringThreadProjectionNode[]> {
    throw new Error("platform kg unavailable");
  }
  async deleteWorkspaceProjection(): Promise<void> {}
}

describe("EOS-A8B Platform KG projection", () => {
  const graph = crusherExpansionFeedFixture();
  const auth = authorizedMemberContext(graph);
  const query = {
    tenantId: CRUSHER_FEED_TENANT,
    workspaceId: CRUSHER_FEED_WORKSPACE,
    root: { objectType: "requirement" as const, objectId: "req-r001" },
    maxDepth: 8,
  };

  function service(flags?: { writesEnabled?: boolean; readsEnabled?: boolean }, version?: string) {
    return new EngineeringDigitalThreadProjectionService(new MemoryThreadProjectionStore(), {
      flags: { writesEnabled: true, readsEnabled: true, ...flags },
      projectionVersion: version,
    });
  }

  it("derives deterministic edge identity from endpoints and normalized relation, not labels", () => {
    const keyA = threadProjectionKey(CRUSHER_FEED_TENANT, "requirement", "req-r001", "ALLOCATED_TO", "system", "sys-primary-crushing");
    const keyB = threadProjectionKey(CRUSHER_FEED_TENANT, "requirement", "req-r001", "ALLOCATED_TO", "system", "sys-primary-crushing");
    expect(keyA).toBe(keyB);
    expect(keyA).not.toMatch(/Support primary crusher/i);
    expect(threadNodeSourceRef("requirement", "req-r001")).toBe("eos-thread:requirement:req-r001");
  });

  it("normalizes historical analysis USED_BY to USES without mutating source rows or duplicating meaning", async () => {
    const svc = service();
    const historical: CanonicalGovernedLink = {
      id: "hist-used-by",
      tenantId: CRUSHER_FEED_TENANT,
      workspaceId: CRUSHER_FEED_WORKSPACE,
      fromType: "analysis_request",
      fromId: "ar-down",
      toType: "analysis_result",
      toId: "res-up",
      relationship: "USED_BY",
      governed: true,
    };
    const current: CanonicalGovernedLink = { ...historical, id: "current-uses", relationship: "USES" };
    expect(normalizeProjectedRelation(historical)).toBe("USES");
    expect(historical.relationship).toBe("USED_BY");
    await svc.projectLink(historical);
    await svc.projectLink(current);
    const edges = await svc.projectedGraph(CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE);
    expect(edges.links).toHaveLength(1);
    expect(edges.links[0]?.relationship).toBe("USES");
    expect(edges.links[0]?.metadata?.source_relation_type).toBe("USED_BY");
    expect(isProjectableGovernedLink({ relationship: "USED_BY", governed: true })).toBe(true);
  });

  it("does not project ungoverned, inferred, or UI relationships", async () => {
    const svc = service();
    await svc.projectLink({
      id: "ui-1",
      tenantId: CRUSHER_FEED_TENANT,
      workspaceId: CRUSHER_FEED_WORKSPACE,
      fromType: "requirement",
      fromId: "a",
      toType: "system",
      toId: "b",
      relationship: "SIMILAR_TO",
      governed: false,
    });
    const graphOut = await svc.projectedGraph(CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE);
    expect(graphOut.links).toHaveLength(0);
  });

  it("upserts idempotently and retains tenant/workspace authorization labels", async () => {
    const svc = service();
    const link = canonicalLinksFromGraph(graph).find((row) => row.relationship === "ALLOCATED_TO" && row.fromId === "req-r001" && row.toType === "system")!;
    await svc.projectLink(link, hints(graph));
    await svc.projectLink(link, hints(graph));
    const projected = await svc.projectedGraph(CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE);
    expect(projected.links.filter((l) => l.fromId === "req-r001" && l.toType === "system")).toHaveLength(1);
    expect(projected.nodes.every((n) => n.tenantId === CRUSHER_FEED_TENANT)).toBe(true);
    expect(projected.nodes.some((n) => n.workspaceId === CRUSHER_FEED_WORKSPACE)).toBe(true);
  });

  it("propagates canonical delete into the projection without deleting canonical objects", async () => {
    const svc = service();
    const link = canonicalLinksFromGraph(graph)[0]!;
    await svc.projectLink(link, hints(graph));
    await svc.removeProjectedLink({ tenantId: CRUSHER_FEED_TENANT, workspaceId: CRUSHER_FEED_WORKSPACE, linkId: link.id });
    const after = await svc.projectedGraph(CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE);
    expect(after.links.find((l) => l.id === link.id)).toBeUndefined();
    expect(graph.links.length).toBeGreaterThan(0);
  });

  it("rebuilds a disposable projection to a semantically equivalent signature", async () => {
    const svc = service();
    const links = canonicalLinksFromGraph(graph);
    const first = await svc.rebuildWorkspace(CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE, links, hints(graph));
    const before = await svc.projectedGraph(CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE, nodeHints(graph));
    const second = await svc.rebuildWorkspace(CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE, links, hints(graph));
    const after = await svc.projectedGraph(CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE, nodeHints(graph));
    expect(first.signature).toBe(second.signature);
    expect(semanticRelationSignature(before.links)).toBe(semanticRelationSignature(after.links));
    expect(first.edgeCount).toBe(second.edgeCount);
    expect(graph.links.length).toBeGreaterThan(0);
  });

  it("detects missing, orphan, and stale semantic-version edges and converges on reconcile", async () => {
    const store = new MemoryThreadProjectionStore();
    const svc = new EngineeringDigitalThreadProjectionService(store, {
      flags: { writesEnabled: true, readsEnabled: true },
    });
    const links = canonicalLinksFromGraph(graph).filter((l) => l.workspaceId === CRUSHER_FEED_WORKSPACE);
    await svc.rebuildWorkspace(CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE, links.slice(0, 3), hints(graph));
    const extra: CanonicalGovernedLink = {
      id: "orphan-link",
      tenantId: CRUSHER_FEED_TENANT,
      workspaceId: CRUSHER_FEED_WORKSPACE,
      fromType: "requirement",
      fromId: "req-r001",
      toType: "document",
      toId: "doc-bod",
      relationship: "BASED_ON",
      governed: true,
    };
    await svc.projectLink(extra, hints(graph));
    const report = await svc.reconcileWorkspace(CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE, links, hints(graph));
    expect(report.missing.length).toBeGreaterThan(0);
    expect(report.orphans.some((o) => o.sourceLinkId === "orphan-link")).toBe(true);
    const health = await svc.projectionHealth(CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE, links);
    expect(health.orphanCount).toBe(0);
    expect(["HEALTHY", "LAGGING"]).toContain(health.status);

    const staleSvc = new EngineeringDigitalThreadProjectionService(store, {
      flags: { writesEnabled: true, readsEnabled: true },
      projectionVersion: "engineering-thread-projection/v2",
    });
    const staleHealth = await staleSvc.projectionHealth(CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE, links);
    expect(staleHealth.status).toBe("REBUILD_REQUIRED");
    expect(staleHealth.semanticVersionMismatch).toBeGreaterThan(0);
  });

  it("keeps SUPERSEDES historical edges visible", async () => {
    const svc = service();
    await svc.rebuildWorkspace(CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE, canonicalLinksFromGraph(graph), hints(graph));
    const projected = await svc.projectedGraph(CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE, nodeHints(graph));
    expect(projected.links.some((l) => l.relationship === "SUPERSEDES" && l.toId === "dec-superseded")).toBe(true);
    expect(projected.links.some((l) => l.relationship === "SUPERSEDES" && l.toId === "bl-feed-01")).toBe(true);
  });

  it("matches relational vs KG traversal for requirement, analysis, decision, configuration, change, and cross-discipline traces", async () => {
    const svc = service();
    await svc.rebuildWorkspace(CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE, canonicalLinksFromGraph(graph), hints(graph));
    const projected = await svc.projectedGraph(CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE, nodeHints(graph));

    const relReq = requirementTrace(graph, query, auth);
    const kgReq = requirementTrace(projected, query, auth);
    expect(visibility(kgReq.traversal)).toEqual(visibility(relReq.traversal));

    const analysisQuery = { ...query, root: { objectType: "analysis_request" as const, objectId: "ar-structural-blocked" } };
    const relAn = analysisTrace(graph, analysisQuery, auth);
    const kgAn = analysisTrace(projected, analysisQuery, auth);
    expect(visibility(kgAn.traversal)).toEqual(visibility(relAn.traversal));
    expect(kgAn.blockedAnalysis?.fabricatedResult).toBe(false);
    expect(projected.nodes.some((n) => n.objectType === "analysis_result" && n.objectId.startsWith("res-structural-blocked"))).toBe(false);
    expect(projected.links.some((l) => l.fromId === "ar-structural-blocked" && l.toType === "analysis_result" && l.relationship === "USES" && l.toId.includes("blocked"))).toBe(false);

    const decisionQuery = { ...query, root: { objectType: "decision" as const, objectId: "dec-support-frame" } };
    expect(visibility(decisionTrace(projected, decisionQuery, auth).traversal)).toEqual(
      visibility(decisionTrace(graph, decisionQuery, auth).traversal),
    );

    const configQuery = { ...query, root: { objectType: "configuration_baseline" as const, objectId: "bl-feed-02" } };
    expect(visibility(configurationTrace(projected, configQuery, auth).traversal)).toEqual(
      visibility(configurationTrace(graph, configQuery, auth).traversal),
    );

    const changeQuery = { ...query, root: { objectType: "change" as const, objectId: "chg-vendor-mass" } };
    expect(visibility(changeTrace(projected, changeQuery, auth).traversal)).toEqual(
      visibility(changeTrace(graph, changeQuery, auth).traversal),
    );

    const processRoot = { ...query, root: { objectType: "requirement" as const, objectId: "req-process" } };
    const relXd = traverseThread(graph, processRoot, auth);
    const kgXd = traverseThread(projected, processRoot, auth);
    expect(visibility(kgXd)).toEqual(visibility(relXd));
    expect(kgXd.nodes.some((n) => n.objectId === "sys-process")).toBe(true);
    expect(kgXd.nodes.some((n) => n.objectId === "ifc-process-mech" || n.objectId === "ifc-mech-struct")).toBe(true);
  });

  it("enforces authorization parity and does not leak hidden objects, counts, or titles", async () => {
    const svc = service();
    await svc.rebuildWorkspace(CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE, canonicalLinksFromGraph(graph), hints(graph));
    const projected = await svc.projectedGraph(CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE, nodeHints(graph));

    const member = traverseThread(projected, query, auth);
    const rel = traverseThread(graph, query, auth);
    expect(member.nodes.length).toBe(rel.nodes.length);
    expect(member.relationships.length).toBe(rel.relationships.length);
    expect(member.nodes.map((n) => n.objectId)).not.toContain("req-hidden-ws");
    expect(member.nodes.map((n) => n.objectId)).not.toContain("sys-other-tenant");

    const otherWs = traverseThread(projected, query, { ...auth, allowedWorkspaceIds: [CRUSHER_FEED_OTHER_WORKSPACE] });
    expect(otherWs.nodes).toEqual([]);
    expect(otherWs.relationships).toEqual([]);

    const otherTenant = traverseThread(projected, query, { ...auth, tenantId: CRUSHER_FEED_OTHER_TENANT });
    expect(otherTenant.nodes).toEqual([]);

    const anon = traverseThread(projected, query, { ...auth, role: "anonymous", allowedWorkspaceIds: [] });
    expect(anon.nodes).toEqual([]);
    expect(anon.relationships).toEqual([]);

    const admin = traverseThread(projected, query, { ...auth, role: "admin" });
    expect(admin.nodes.some((n) => n.objectId === "req-hidden-ws")).toBe(false);
    expect(admin.relationships.length).toBe(member.relationships.length);
  });

  it("does not use KG reads when the read flag is off and reports projection unavailable on KG failure", async () => {
    const disabled = service({ writesEnabled: true, readsEnabled: false });
    await disabled.rebuildWorkspace(CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE, canonicalLinksFromGraph(graph), hints(graph));
    const skipped = await disabled.query(CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE, query, auth);
    expect(skipped.ok).toBe(false);
    if (!skipped.ok) expect(skipped.reason).toBe("reads_disabled");

    const failing = new EngineeringDigitalThreadProjectionService(new FailingStore(), {
      flags: { writesEnabled: true, readsEnabled: true },
    });
    const down = await failing.query(CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE, query, auth);
    expect(down.ok).toBe(false);
    if (!down.ok) expect(down.reason).toBe("projection_unavailable");
    const health = await failing.projectionHealth(CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE, canonicalLinksFromGraph(graph));
    expect(health.status).toBe("FAILED");
  });

  it("records projection version, flags, lag, and job-handler rebuild", async () => {
    expect(THREAD_PROJECTION_VERSION).toBe("engineering-thread-projection/v1");
    expect(THREAD_KG_PROJECTION_FLAG).toBe("engineering_digital_thread_kg_projection");
    expect(THREAD_KG_READS_FLAG).toBe("engineering_digital_thread_kg_reads");
    expect(resolveThreadProjectionFlags({ writesEnabled: true, readsEnabled: false })).toEqual({
      writesEnabled: true,
      readsEnabled: false,
    });
    const svc = service();
    const links = canonicalLinksFromGraph(graph);
    const started = Date.now();
    await svc.rebuildWorkspace(CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE, links, hints(graph));
    const health = await svc.projectionHealth(CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE, links);
    expect(health.projectionVersion).toBe(THREAD_PROJECTION_VERSION);
    expect(health.lagMs == null || health.lagMs >= 0).toBe(true);
    const relMs = Date.now();
    traverseThread(graph, query, auth);
    const relLatency = Date.now() - relMs;
    const kgMs = Date.now();
    const projected = await svc.projectedGraph(CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE, nodeHints(graph));
    traverseThread(projected, query, auth);
    const kgLatency = Date.now() - kgMs;
    expect(relLatency).toBeLessThan(250);
    expect(kgLatency).toBeLessThan(250);
    expect(Date.now() - started).toBeLessThan(2000);

    const handler = createThreadProjectionJobHandler(svc, {
      async loadWorkspaceLinks() {
        return links;
      },
    });
    const result = await handler.handle({
      id: "job-1",
      tenant_id: CRUSHER_FEED_TENANT,
      workspace_id: CRUSHER_FEED_WORKSPACE,
      job_type: "engineering.thread.project",
      status: "running",
      priority: 100,
      payload: { mode: "rebuild", tenantId: CRUSHER_FEED_TENANT, workspaceId: CRUSHER_FEED_WORKSPACE },
      retry_count: 0,
      max_retries: 3,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    expect(result.edgeCount).toBe(health.canonicalEdgeCount);
  });

  it("forbids graph writeback, AI-inferred edges, PI dual-write, and a new graph store", () => {
    expect(GRAPH_WRITEBACK_TO_ENGINEERING_CORE).toBe(false);
    expect(AI_INFERRED_THREAD_EDGES).toBe(false);
    expect(PI_KG_DUAL_WRITE_ENGINEERING_THREAD).toBe(false);
    const dir = join(ROOT, "packages/engineering-os/src/digital-thread/projection");
    for (const file of readdirSync(dir)) {
      if (!file.endsWith(".ts") || file.endsWith(".test.ts")) continue;
      const source = readFileSync(join(dir, file), "utf8");
      assertProjectionSourceHasNoWriteback(source);
      expect(source).not.toMatch(/CREATE TABLE EngineeringDigitalThreadGraph/i);
      expect(source).not.toMatch(/embedding similarity|semantic-nearest-neighbor|llm inferred/i);
    }
    const serviceSrc = readFileSync(join(ROOT, "packages/engineering-os/src/digital-thread/service.ts"), "utf8");
    expect(serviceSrc).toContain("engineering_object_links");
    expect(serviceSrc).toContain("projectionUnavailable");
    expect(serviceSrc).not.toMatch(/from\("project_intelligence_knowledge_/);
  });
});
