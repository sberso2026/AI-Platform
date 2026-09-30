import { normalizeProjectedRelation, isProjectableGovernedLink, semanticSignature } from "./normalize";
import { currentProjectionVersion, threadProjectionKey } from "./identity";
import { resolveThreadProjectionFlags } from "./flags";
import { projectedGraphInput, semanticEdgeSignature, traverseProjectedThread } from "./query-adapter";
import type {
  CanonicalGovernedLink,
  EngineeringThreadProjectionEdge,
  EngineeringThreadProjectionNode,
  ThreadProjectionFlags,
  ThreadProjectionHealth,
  ThreadProjectionHealthStatus,
  ThreadProjectionStore,
  ThreadReconcileReport,
} from "./types";
import { THREAD_PROJECTION_VERSION } from "./types";
import type { ThreadAuthorization, ThreadCatalogNode, ThreadQuery, ThreadTraversalResult } from "../types";

const LAG_DEGRADED_MS = 60_000;

export type ProjectionServiceOptions = {
  flags?: Partial<ThreadProjectionFlags>;
  projectionVersion?: string;
  now?: () => Date;
};

export class EngineeringDigitalThreadProjectionService {
  private pendingFailures = 0;
  private lastProjectedAt: string | null = null;
  private lastReconciledAt: string | null = null;
  private lastCanonicalCommittedAt: string | null = null;

  constructor(
    private readonly store: ThreadProjectionStore,
    private readonly options: ProjectionServiceOptions = {},
  ) {}

  flags(): ThreadProjectionFlags {
    return resolveThreadProjectionFlags(this.options.flags);
  }

  projectionVersion(): string {
    return this.options.projectionVersion ?? currentProjectionVersion();
  }

  async projectLink(link: CanonicalGovernedLink, nodeHints?: EngineeringThreadProjectionNode[]): Promise<EngineeringThreadProjectionEdge | null> {
    if (!this.flags().writesEnabled) return null;
    if (!isProjectableGovernedLink(link)) return null;
    const normalized = normalizeProjectedRelation(link);
    const projectedAt = this.now().toISOString();
    const projectionKey = threadProjectionKey(
      link.tenantId,
      link.fromType,
      link.fromId,
      normalized,
      link.toType,
      link.toId,
    );
    const fromHint = nodeHints?.find((n) => n.objectType === link.fromType && n.objectId === link.fromId);
    const toHint = nodeHints?.find((n) => n.objectType === link.toType && n.objectId === link.toId);
    await this.store.upsertNode({
      tenantId: link.tenantId,
      workspaceId: fromHint?.workspaceId ?? link.workspaceId,
      objectType: link.fromType,
      objectId: link.fromId,
      projectId: fromHint?.projectId,
      objectCode: fromHint?.objectCode,
      status: fromHint?.status,
      title: fromHint?.title,
    });
    await this.store.upsertNode({
      tenantId: link.tenantId,
      workspaceId: toHint?.workspaceId ?? link.workspaceId,
      objectType: link.toType,
      objectId: link.toId,
      projectId: toHint?.projectId,
      objectCode: toHint?.objectCode,
      status: toHint?.status,
      title: toHint?.title,
    });
    const edge: EngineeringThreadProjectionEdge = {
      tenantId: link.tenantId,
      workspaceId: link.workspaceId,
      sourceObjectType: link.fromType,
      sourceObjectId: link.fromId,
      normalizedRelationType: normalized,
      targetObjectType: link.toType,
      targetObjectId: link.toId,
      sourceLinkId: link.id,
      sourceRelationType: link.relationship,
      projectionVersion: this.projectionVersion(),
      projectedAt,
      projectionKey,
      sourceLinkIds: [link.id],
    };
    await this.store.upsertEdge(edge);
    this.lastProjectedAt = projectedAt;
    if (link.createdAt) this.lastCanonicalCommittedAt = link.createdAt;
    return edge;
  }

  async removeProjectedLink(input: { tenantId: string; workspaceId: string; linkId: string }): Promise<void> {
    if (!this.flags().writesEnabled) return;
    await this.store.removeEdgeBySourceLinkId(input.tenantId, input.workspaceId, input.linkId);
    this.lastProjectedAt = this.now().toISOString();
  }

  async reconcileWorkspace(
    tenantId: string,
    workspaceId: string,
    canonicalLinks: CanonicalGovernedLink[],
    nodeHints?: EngineeringThreadProjectionNode[],
  ): Promise<ThreadReconcileReport> {
    const expected = this.expectedEdges(tenantId, workspaceId, canonicalLinks);
    const projected = await this.store.listEdges(tenantId, workspaceId);
    const projectedByKey = new Map<string, EngineeringThreadProjectionEdge[]>();
    for (const edge of projected) {
      const list = projectedByKey.get(edge.projectionKey) ?? [];
      list.push(edge);
      projectedByKey.set(edge.projectionKey, list);
    }
    const missing: EngineeringThreadProjectionEdge[] = [];
    for (const edge of expected.values()) {
      if (!projectedByKey.has(edge.projectionKey)) missing.push(edge);
    }
    const duplicates: string[] = [];
    const orphans: EngineeringThreadProjectionEdge[] = [];
    const staleVersion: EngineeringThreadProjectionEdge[] = [];
    const wrongWorkspace: EngineeringThreadProjectionEdge[] = [];
    for (const [key, edges] of projectedByKey) {
      if (edges.length > 1) duplicates.push(key);
      for (const edge of edges) {
        if (edge.workspaceId !== workspaceId) wrongWorkspace.push(edge);
        if (edge.projectionVersion !== this.projectionVersion()) staleVersion.push(edge);
        if (!expected.has(key)) orphans.push(edge);
      }
    }
    for (const edge of missing) {
      const link = canonicalLinks.find((row) => row.id === edge.sourceLinkId) ?? canonicalLinks.find((row) =>
        semanticSignature(row.fromType, row.fromId, normalizeProjectedRelation(row), row.toType, row.toId) ===
        semanticSignature(edge.sourceObjectType, edge.sourceObjectId, edge.normalizedRelationType, edge.targetObjectType, edge.targetObjectId)
      );
      if (link) await this.projectLink(link, nodeHints);
    }
    for (const orphan of orphans) {
      for (const linkId of orphan.sourceLinkIds.length ? orphan.sourceLinkIds : [orphan.sourceLinkId]) {
        await this.store.removeEdgeBySourceLinkId(tenantId, workspaceId, linkId);
      }
    }
    this.lastReconciledAt = this.now().toISOString();
    return {
      missing,
      duplicates,
      orphans,
      staleVersion,
      wrongWorkspace,
      projected: projected.length,
      canonical: expected.size,
    };
  }

  async rebuildWorkspace(
    tenantId: string,
    workspaceId: string,
    canonicalLinks: CanonicalGovernedLink[],
    nodeHints?: EngineeringThreadProjectionNode[],
  ): Promise<{ signature: string; edgeCount: number }> {
    await this.store.deleteWorkspaceProjection(tenantId, workspaceId);
    const projectable = canonicalLinks.filter((link) => link.tenantId === tenantId && link.workspaceId === workspaceId && isProjectableGovernedLink(link));
    for (const link of projectable) {
      await this.projectLink(link, nodeHints);
    }
    const edges = await this.store.listEdges(tenantId, workspaceId);
    this.lastReconciledAt = this.now().toISOString();
    return { signature: semanticEdgeSignature(edges), edgeCount: edges.length };
  }

  async projectionHealth(
    tenantId: string,
    workspaceId: string,
    canonicalLinks: CanonicalGovernedLink[],
  ): Promise<ThreadProjectionHealth> {
    const expected = this.expectedEdges(tenantId, workspaceId, canonicalLinks);
    let projected: EngineeringThreadProjectionEdge[] = [];
    try {
      projected = await this.store.listEdges(tenantId, workspaceId);
    } catch {
      this.pendingFailures += 1;
      return this.healthResult("FAILED", expected.size, 0, expected.size, 0, 0, 0);
    }
    const report = await this.inspect(expected, projected, workspaceId);
    const lagMs = this.lagMs();
    let status: ThreadProjectionHealthStatus = "HEALTHY";
    if (this.pendingFailures > 0) status = "FAILED";
    else if (report.staleVersion.length > 0) status = "REBUILD_REQUIRED";
    else if (report.missing.length > 0 || report.orphans.length > 0 || report.wrongWorkspace.length > 0 || report.duplicates.length > 0) {
      status = "DEGRADED";
    } else if (lagMs != null && lagMs > LAG_DEGRADED_MS) status = "LAGGING";
    return this.healthResult(
      status,
      expected.size,
      projected.length,
      report.missing.length,
      report.duplicates.length,
      report.orphans.length,
      report.staleVersion.length,
      lagMs,
    );
  }

  async query(
    tenantId: string,
    workspaceId: string,
    query: ThreadQuery,
    auth: ThreadAuthorization,
    catalog?: ThreadCatalogNode[],
  ): Promise<{ ok: true; traversal: ThreadTraversalResult } | { ok: false; reason: "reads_disabled" | "projection_unavailable" }> {
    if (!this.flags().readsEnabled) return { ok: false, reason: "reads_disabled" };
    try {
      const [nodes, edges] = await Promise.all([
        this.store.listNodes(tenantId, workspaceId),
        this.store.listEdges(tenantId, workspaceId),
      ]);
      const scopedNodes = nodes.filter((node) => node.tenantId === tenantId && node.workspaceId === workspaceId);
      const scopedEdges = edges.filter((edge) => edge.tenantId === tenantId && edge.workspaceId === workspaceId);
      return {
        ok: true,
        traversal: traverseProjectedThread(scopedNodes, scopedEdges, query, auth, catalog),
      };
    } catch {
      this.pendingFailures += 1;
      return { ok: false, reason: "projection_unavailable" };
    }
  }

  async projectedGraph(tenantId: string, workspaceId: string, catalog?: ThreadCatalogNode[]): Promise<ReturnType<typeof projectedGraphInput>> {
    const [nodes, edges] = await Promise.all([
      this.store.listNodes(tenantId, workspaceId),
      this.store.listEdges(tenantId, workspaceId),
    ]);
    return projectedGraphInput(
      nodes.filter((node) => node.workspaceId === workspaceId),
      edges.filter((edge) => edge.workspaceId === workspaceId),
      catalog,
    );
  }

  recordFailure(): void {
    this.pendingFailures += 1;
  }

  private expectedEdges(
    tenantId: string,
    workspaceId: string,
    canonicalLinks: CanonicalGovernedLink[],
  ): Map<string, EngineeringThreadProjectionEdge> {
    const expected = new Map<string, EngineeringThreadProjectionEdge>();
    for (const link of canonicalLinks) {
      if (link.tenantId !== tenantId || link.workspaceId !== workspaceId) continue;
      if (!isProjectableGovernedLink(link)) continue;
      const normalized = normalizeProjectedRelation(link);
      const projectionKey = threadProjectionKey(link.tenantId, link.fromType, link.fromId, normalized, link.toType, link.toId);
      const existing = expected.get(projectionKey);
      if (existing) {
        existing.sourceLinkIds = [...new Set([...existing.sourceLinkIds, link.id])];
        continue;
      }
      expected.set(projectionKey, {
        tenantId,
        workspaceId,
        sourceObjectType: link.fromType,
        sourceObjectId: link.fromId,
        normalizedRelationType: normalized,
        targetObjectType: link.toType,
        targetObjectId: link.toId,
        sourceLinkId: link.id,
        sourceRelationType: link.relationship,
        projectionVersion: this.projectionVersion(),
        projectedAt: this.now().toISOString(),
        projectionKey,
        sourceLinkIds: [link.id],
      });
    }
    return expected;
  }

  private inspect(
    expected: Map<string, EngineeringThreadProjectionEdge>,
    projected: EngineeringThreadProjectionEdge[],
    workspaceId: string,
  ) {
    const projectedByKey = new Map<string, EngineeringThreadProjectionEdge[]>();
    for (const edge of projected) {
      const list = projectedByKey.get(edge.projectionKey) ?? [];
      list.push(edge);
      projectedByKey.set(edge.projectionKey, list);
    }
    const missing: EngineeringThreadProjectionEdge[] = [];
    for (const edge of expected.values()) {
      if (!projectedByKey.has(edge.projectionKey)) missing.push(edge);
    }
    const duplicates: string[] = [];
    const orphans: EngineeringThreadProjectionEdge[] = [];
    const staleVersion: EngineeringThreadProjectionEdge[] = [];
    const wrongWorkspace: EngineeringThreadProjectionEdge[] = [];
    for (const [key, edges] of projectedByKey) {
      if (edges.length > 1) duplicates.push(key);
      for (const edge of edges) {
        if (edge.workspaceId !== workspaceId) wrongWorkspace.push(edge);
        if (edge.projectionVersion !== this.projectionVersion()) staleVersion.push(edge);
        if (!expected.has(key)) orphans.push(edge);
      }
    }
    return { missing, duplicates, orphans, staleVersion, wrongWorkspace };
  }

  private lagMs(): number | null {
    if (!this.lastProjectedAt || !this.lastCanonicalCommittedAt) {
      return this.lastProjectedAt && this.lastCanonicalCommittedAt === null ? 0 : null;
    }
    const projected = Date.parse(this.lastProjectedAt);
    const committed = Date.parse(this.lastCanonicalCommittedAt);
    if (!Number.isFinite(projected) || !Number.isFinite(committed)) return null;
    return Math.max(0, projected - committed);
  }

  private healthResult(
    status: ThreadProjectionHealthStatus,
    canonicalEdgeCount: number,
    edgeCount: number,
    missingCount: number,
    duplicateCount: number,
    orphanCount: number,
    semanticVersionMismatch: number,
    lagMs: number | null = null,
  ): ThreadProjectionHealth {
    return {
      status,
      projectionVersion: this.projectionVersion(),
      lastProjectedAt: this.lastProjectedAt,
      lastReconciledAt: this.lastReconciledAt,
      lagMs,
      edgeCount,
      canonicalEdgeCount,
      missingCount,
      duplicateCount,
      orphanCount,
      semanticVersionMismatch,
      pendingFailures: this.pendingFailures,
      source: "platform_kg_projection",
    };
  }

  private now(): Date {
    return this.options.now?.() ?? new Date();
  }
}

export function expectedProjectionVersion(): string {
  return THREAD_PROJECTION_VERSION;
}
