import type { KnowledgeEdge, KnowledgeNode } from "@rtb/types";
import type { KnowledgeGraphService } from "@rtb/platform-kernel";

export type GraphSnapshot = {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
};

export interface GraphPort {
  upsertNode(input: {
    tenantId: string;
    workspaceId: string;
    nodeType: string;
    title: string;
    content?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
    sourceRef: string;
    createdBy?: string;
  }): Promise<KnowledgeNode>;
  findNodeBySourceRef(
    tenantId: string,
    workspaceId: string,
    sourceRef: string,
  ): Promise<KnowledgeNode | null>;
  deleteNode(tenantId: string, nodeId: string): Promise<void>;
  upsertEdge(input: {
    tenantId: string;
    fromNodeId: string;
    toNodeId: string;
    edgeType: string;
    metadata?: Record<string, unknown>;
    createdBy?: string;
  }): Promise<KnowledgeEdge>;
  findEdge(
    tenantId: string,
    fromNodeId: string,
    toNodeId: string,
    edgeType: string,
  ): Promise<KnowledgeEdge | null>;
  deleteEdge(tenantId: string, edgeId: string): Promise<void>;
  loadSnapshot(tenantId: string, workspaceId: string): Promise<GraphSnapshot>;
  searchNodes(tenantId: string, workspaceId: string, query: string, limit?: number): Promise<KnowledgeNode[]>;
}

export function kernelGraphPort(knowledgeGraph: KnowledgeGraphService): GraphPort {
  return {
    upsertNode: (input) => knowledgeGraph.upsertNode(input),
    findNodeBySourceRef: (tenantId, workspaceId, sourceRef) =>
      knowledgeGraph.findNodeBySourceRef(tenantId, workspaceId, sourceRef),
    deleteNode: (tenantId, nodeId) => knowledgeGraph.deleteNode(tenantId, nodeId),
    upsertEdge: (input) => knowledgeGraph.upsertEdge(input),
    findEdge: (tenantId, fromNodeId, toNodeId, edgeType) =>
      knowledgeGraph.findEdge(tenantId, fromNodeId, toNodeId, edgeType),
    deleteEdge: (tenantId, edgeId) => knowledgeGraph.deleteEdge(tenantId, edgeId),
    loadSnapshot: (tenantId, workspaceId) =>
      knowledgeGraph.loadWorkspaceSnapshot(tenantId, workspaceId, { bosProjectionOnly: true }),
    searchNodes: (tenantId, workspaceId, query, limit) =>
      knowledgeGraph.searchNodes({ tenantId, workspaceId, query, limit }),
  };
}

export function createMemoryGraphPort(): GraphPort & { snapshot: GraphSnapshot } {
  const nodes = new Map<string, KnowledgeNode>();
  const edges = new Map<string, KnowledgeEdge>();
  const now = () => new Date().toISOString();
  const key = (tenantId: string, workspaceId: string, sourceRef: string) =>
    `${tenantId}|${workspaceId}|${sourceRef}`;
  const edgeKey = (tenantId: string, from: string, to: string, type: string) =>
    `${tenantId}|${from}|${to}|${type}`;

  const port: GraphPort & { snapshot: GraphSnapshot } = {
    snapshot: { nodes: [], edges: [] },
    async upsertNode(input) {
      const existing = [...nodes.values()].find(
        (n) =>
          n.tenant_id === input.tenantId &&
          n.workspace_id === input.workspaceId &&
          n.source_ref === input.sourceRef,
      );
      const id = existing?.id ?? `node-${key(input.tenantId, input.workspaceId, input.sourceRef)}`;
      const node: KnowledgeNode = {
        id,
        tenant_id: input.tenantId,
        workspace_id: input.workspaceId,
        node_type: input.nodeType,
        title: input.title,
        content: input.content ?? {},
        source_ref: input.sourceRef,
        metadata: input.metadata ?? {},
        created_by: input.createdBy,
        created_at: existing?.created_at ?? now(),
        updated_at: now(),
      };
      nodes.set(id, node);
      return node;
    },
    async findNodeBySourceRef(tenantId, workspaceId, sourceRef) {
      return (
        [...nodes.values()].find(
          (n) => n.tenant_id === tenantId && n.workspace_id === workspaceId && n.source_ref === sourceRef,
        ) ?? null
      );
    },
    async deleteNode(tenantId, nodeId) {
      const node = nodes.get(nodeId);
      if (node && node.tenant_id !== tenantId) throw new Error("cross_tenant_graph_forbidden");
      nodes.delete(nodeId);
      for (const [id, edge] of edges) {
        if (edge.from_node_id === nodeId || edge.to_node_id === nodeId) edges.delete(id);
      }
    },
    async upsertEdge(input) {
      if (input.fromNodeId === input.toNodeId) {
        // Self-loop allowed only if explicit; still stored.
      }
      const from = nodes.get(input.fromNodeId);
      const to = nodes.get(input.toNodeId);
      if (from && to && from.tenant_id !== to.tenant_id) throw new Error("cross_tenant_graph_forbidden");
      if (from && from.tenant_id !== input.tenantId) throw new Error("cross_tenant_graph_forbidden");
      const existing = [...edges.values()].find(
        (e) =>
          e.tenant_id === input.tenantId &&
          e.from_node_id === input.fromNodeId &&
          e.to_node_id === input.toNodeId &&
          e.edge_type === input.edgeType,
      );
      const id = existing?.id ?? `edge-${edgeKey(input.tenantId, input.fromNodeId, input.toNodeId, input.edgeType)}`;
      const edge: KnowledgeEdge = {
        id,
        tenant_id: input.tenantId,
        from_node_id: input.fromNodeId,
        to_node_id: input.toNodeId,
        edge_type: input.edgeType,
        weight: 1,
        metadata: input.metadata ?? {},
        created_by: input.createdBy,
        created_at: existing?.created_at ?? now(),
      };
      edges.set(id, edge);
      return edge;
    },
    async findEdge(tenantId, fromNodeId, toNodeId, edgeType) {
      return (
        [...edges.values()].find(
          (e) =>
            e.tenant_id === tenantId &&
            e.from_node_id === fromNodeId &&
            e.to_node_id === toNodeId &&
            e.edge_type === edgeType,
        ) ?? null
      );
    },
    async deleteEdge(tenantId, edgeId) {
      const edge = edges.get(edgeId);
      if (edge && edge.tenant_id !== tenantId) throw new Error("cross_tenant_graph_forbidden");
      edges.delete(edgeId);
    },
    async loadSnapshot(tenantId, workspaceId) {
      const scopedNodes = [...nodes.values()].filter(
        (n) => n.tenant_id === tenantId && n.workspace_id === workspaceId,
      );
      const ids = new Set(scopedNodes.map((n) => n.id));
      const scopedEdges = [...edges.values()].filter(
        (e) => e.tenant_id === tenantId && ids.has(e.from_node_id) && ids.has(e.to_node_id),
      );
      return { nodes: scopedNodes, edges: scopedEdges };
    },
    async searchNodes(tenantId, workspaceId, query, limit = 20) {
      const q = query.toLowerCase();
      return [...nodes.values()]
        .filter(
          (n) =>
            n.tenant_id === tenantId &&
            n.workspace_id === workspaceId &&
            n.title.toLowerCase().includes(q),
        )
        .slice(0, limit);
    },
  };
  Object.defineProperty(port, "snapshot", {
    get() {
      return { nodes: [...nodes.values()], edges: [...edges.values()] };
    },
  });
  return port;
}
