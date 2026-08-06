/**
 * Phase 8G — In-memory / domain knowledge graph (relationship refs only).
 */
import { KnowledgeIntelligenceError } from "./errors";
import type {
  KnowledgeEdgeRef,
  KnowledgeEdgeType,
  KnowledgeNodeRef,
} from "./types";
import { KNOWLEDGE_EDGE_TYPES } from "./types";

export class EngineeringKnowledgeGraph {
  private readonly nodes = new Map<string, KnowledgeNodeRef>();
  private readonly edges = new Map<string, KnowledgeEdgeRef>();

  upsertNode(node: KnowledgeNodeRef): KnowledgeNodeRef {
    if (node.storesBusinessRecord !== false) {
      throw new KnowledgeIntelligenceError(
        "knowledge_duplicate_ownership",
        "Knowledge nodes must not store business records",
        403,
      );
    }
    if (!node.tenantId || !node.workspaceId) {
      throw new KnowledgeIntelligenceError(
        "knowledge_scope_required",
        "tenantId and workspaceId are required",
        400,
      );
    }
    this.nodes.set(node.refId, node);
    return node;
  }

  link(input: {
    edgeId: string;
    fromRefId: string;
    toRefId: string;
    edgeType: KnowledgeEdgeType;
    tenantId: string;
    workspaceId: string;
    weight?: number;
  }): KnowledgeEdgeRef {
    if (!(KNOWLEDGE_EDGE_TYPES as readonly string[]).includes(input.edgeType)) {
      throw new KnowledgeIntelligenceError("knowledge_edge_invalid", "Invalid edge type", 400);
    }
    if (!this.nodes.has(input.fromRefId) || !this.nodes.has(input.toRefId)) {
      throw new KnowledgeIntelligenceError(
        "knowledge_node_missing",
        "Both endpoints must be registered as refs",
        404,
      );
    }
    const edge: KnowledgeEdgeRef = {
      edgeId: input.edgeId,
      fromRefId: input.fromRefId,
      toRefId: input.toRefId,
      edgeType: input.edgeType,
      weight: input.weight ?? 1,
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      storesBusinessRecord: false,
    };
    this.edges.set(edge.edgeId, edge);
    return edge;
  }

  getNode(refId: string): KnowledgeNodeRef | undefined {
    return this.nodes.get(refId);
  }

  listNodes(scope: { tenantId: string; workspaceId: string }): KnowledgeNodeRef[] {
    return [...this.nodes.values()].filter(
      (n) => n.tenantId === scope.tenantId && n.workspaceId === scope.workspaceId,
    );
  }

  neighbors(
    refId: string,
    scope: { tenantId: string; workspaceId: string },
    depth = 1,
  ): { nodes: KnowledgeNodeRef[]; edges: KnowledgeEdgeRef[] } {
    const seen = new Set<string>([refId]);
    const edgeAcc: KnowledgeEdgeRef[] = [];
    let frontier = [refId];
    for (let d = 0; d < depth; d += 1) {
      const next: string[] = [];
      for (const id of frontier) {
        for (const edge of this.edges.values()) {
          if (edge.tenantId !== scope.tenantId || edge.workspaceId !== scope.workspaceId) continue;
          const other =
            edge.fromRefId === id ? edge.toRefId : edge.toRefId === id ? edge.fromRefId : null;
          if (!other || seen.has(other)) continue;
          seen.add(other);
          next.push(other);
          edgeAcc.push(edge);
        }
      }
      frontier = next;
    }
    return {
      nodes: [...seen]
        .filter((id) => id !== refId)
        .map((id) => this.nodes.get(id))
        .filter((n): n is KnowledgeNodeRef => Boolean(n)),
      edges: edgeAcc,
    };
  }

  /** Impact / dependency: outbound and inbound related refs. */
  impactAnalysis(
    refId: string,
    scope: { tenantId: string; workspaceId: string },
  ): {
    dependsOn: KnowledgeNodeRef[];
    impactedBy: KnowledgeNodeRef[];
  } {
    const dependsOn: KnowledgeNodeRef[] = [];
    const impactedBy: KnowledgeNodeRef[] = [];
    for (const edge of this.edges.values()) {
      if (edge.tenantId !== scope.tenantId || edge.workspaceId !== scope.workspaceId) continue;
      if (edge.fromRefId === refId) {
        const n = this.nodes.get(edge.toRefId);
        if (n) dependsOn.push(n);
      }
      if (edge.toRefId === refId) {
        const n = this.nodes.get(edge.fromRefId);
        if (n) impactedBy.push(n);
      }
    }
    return { dependsOn, impactedBy };
  }

  assertNoDuplicateOwnership(): void {
    for (const node of this.nodes.values()) {
      if (node.storesBusinessRecord !== false) {
        throw new Error(`Node ${node.refId} illegally stores a business record`);
      }
    }
    for (const edge of this.edges.values()) {
      if (edge.storesBusinessRecord !== false) {
        throw new Error(`Edge ${edge.edgeId} illegally stores a business record`);
      }
    }
  }
}

export function drillDownPathFor(
  kind: KnowledgeNodeRef["kind"],
  refId: string,
): string {
  switch (kind) {
    case "document":
      return `/engineering/apps/project-intelligence/documents/${refId}`;
    case "meeting":
      return `/engineering/apps/project-intelligence/meetings/${refId}`;
    case "finding":
      return `/engineering/apps/project-intelligence/findings`;
    case "risk":
      return `/engineering/risks`;
    case "issue":
      return `/engineering/issues`;
    case "action":
      return `/engineering/actions`;
    case "decision":
      return `/engineering/decisions`;
    case "technical_query":
      return `/engineering/technical-queries`;
    case "lesson":
      return `/engineering/lessons`;
    case "project":
      return `/engineering/projects/${refId}`;
    case "report":
      return `/engineering/apps/project-intelligence/reports/executive`;
    default:
      return `/engineering/apps/project-intelligence/knowledge?ref=${encodeURIComponent(refId)}`;
  }
}
