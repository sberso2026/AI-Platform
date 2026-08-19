import type { Json, SupabaseClient } from "@rtb/database";
import type { EvidenceItem, KnowledgeEdge, KnowledgeNode } from "@rtb/types";

const BOS_NODE_PREFIX = "bos.";

export type KnowledgeGraphUpsertNodeInput = {
  tenantId: string;
  workspaceId?: string;
  nodeType: string;
  title: string;
  content?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  sourceRef?: string;
  createdBy?: string;
};

export type KnowledgeGraphUpsertEdgeInput = {
  tenantId: string;
  fromNodeId: string;
  toNodeId: string;
  edgeType: string;
  weight?: number;
  metadata?: Record<string, unknown>;
  createdBy?: string;
};

export type KnowledgeGraphSnapshot = {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
};

/**
 * Platform Kernel Knowledge Graph. Operating systems project into this store.
 * Do not create a second graph runtime in an OS package.
 */
export class KnowledgeGraphService {
  constructor(private readonly supabase: SupabaseClient) {}

  async createNode(input: KnowledgeGraphUpsertNodeInput): Promise<KnowledgeNode> {
    const { data, error } = await this.supabase
      .from("knowledge_nodes")
      .insert({
        tenant_id: input.tenantId,
        workspace_id: input.workspaceId ?? null,
        node_type: input.nodeType,
        title: input.title,
        content: (input.content ?? {}) as Json,
        metadata: (input.metadata ?? {}) as Json,
        source_ref: input.sourceRef ?? null,
        created_by: input.createdBy ?? null,
      })
      .select()
      .single();

    if (error || !data) throw new Error(`Failed to create node: ${error?.message}`);
    return mapNode(data);
  }

  async findNodeBySourceRef(
    tenantId: string,
    workspaceId: string | undefined,
    sourceRef: string,
  ): Promise<KnowledgeNode | null> {
    let query = this.supabase
      .from("knowledge_nodes")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("source_ref", sourceRef);
    query = workspaceId ? query.eq("workspace_id", workspaceId) : query.is("workspace_id", null);
    const { data, error } = await query.maybeSingle();
    if (error) throw new Error(`Failed to find node: ${error.message}`);
    return data ? mapNode(data as Record<string, unknown>) : null;
  }

  async upsertNode(input: KnowledgeGraphUpsertNodeInput): Promise<KnowledgeNode> {
    if (!input.sourceRef) throw new Error("source_ref_required");
    const existing = await this.findNodeBySourceRef(input.tenantId, input.workspaceId, input.sourceRef);
    if (!existing) return this.createNode(input);
    const { data, error } = await this.supabase
      .from("knowledge_nodes")
      .update({
        node_type: input.nodeType,
        title: input.title,
        content: (input.content ?? existing.content) as Json,
        metadata: (input.metadata ?? existing.metadata) as Json,
      })
      .eq("id", existing.id)
      .eq("tenant_id", input.tenantId)
      .select()
      .single();
    if (error || !data) throw new Error(`Failed to update node: ${error?.message}`);
    return mapNode(data);
  }

  async deleteNode(tenantId: string, nodeId: string): Promise<void> {
    const { error } = await this.supabase
      .from("knowledge_nodes")
      .delete()
      .eq("id", nodeId)
      .eq("tenant_id", tenantId);
    if (error) throw new Error(`Failed to delete node: ${error.message}`);
  }

  async createEdge(input: KnowledgeGraphUpsertEdgeInput): Promise<KnowledgeEdge> {
    const { data, error } = await this.supabase
      .from("knowledge_edges")
      .insert({
        tenant_id: input.tenantId,
        from_node_id: input.fromNodeId,
        to_node_id: input.toNodeId,
        edge_type: input.edgeType,
        weight: input.weight ?? 1.0,
        metadata: (input.metadata ?? {}) as Json,
        created_by: input.createdBy ?? null,
      })
      .select()
      .single();

    if (error || !data) throw new Error(`Failed to create edge: ${error?.message}`);
    return mapEdge(data);
  }

  async findEdge(
    tenantId: string,
    fromNodeId: string,
    toNodeId: string,
    edgeType: string,
  ): Promise<KnowledgeEdge | null> {
    const { data, error } = await this.supabase
      .from("knowledge_edges")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("from_node_id", fromNodeId)
      .eq("to_node_id", toNodeId)
      .eq("edge_type", edgeType)
      .maybeSingle();
    if (error) throw new Error(`Failed to find edge: ${error.message}`);
    return data ? mapEdge(data as Record<string, unknown>) : null;
  }

  async upsertEdge(input: KnowledgeGraphUpsertEdgeInput): Promise<KnowledgeEdge> {
    const existing = await this.findEdge(input.tenantId, input.fromNodeId, input.toNodeId, input.edgeType);
    if (!existing) return this.createEdge(input);
    const { data, error } = await this.supabase
      .from("knowledge_edges")
      .update({
        weight: input.weight ?? existing.weight ?? 1.0,
        metadata: (input.metadata ?? existing.metadata) as Json,
      })
      .eq("id", existing.id)
      .eq("tenant_id", input.tenantId)
      .select()
      .single();
    if (error || !data) throw new Error(`Failed to update edge: ${error?.message}`);
    return mapEdge(data);
  }

  async deleteEdge(tenantId: string, edgeId: string): Promise<void> {
    const { error } = await this.supabase
      .from("knowledge_edges")
      .delete()
      .eq("id", edgeId)
      .eq("tenant_id", tenantId);
    if (error) throw new Error(`Failed to delete edge: ${error.message}`);
  }

  async addEvidence(input: {
    tenantId: string;
    nodeId?: string;
    sourceType: string;
    sourceId: string;
    excerpt?: string;
    score?: number;
  }): Promise<EvidenceItem> {
    const { data, error } = await this.supabase
      .from("evidence_items")
      .insert({
        tenant_id: input.tenantId,
        node_id: input.nodeId ?? null,
        source_type: input.sourceType,
        source_id: input.sourceId,
        excerpt: input.excerpt ?? null,
        score: input.score ?? null,
      })
      .select()
      .single();

    if (error || !data) throw new Error(`Failed to add evidence: ${error?.message}`);
    return mapEvidence(data);
  }

  async listNodes(tenantId: string, limit = 50): Promise<KnowledgeNode[]> {
    const { data, error } = await this.supabase
      .from("knowledge_nodes")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Failed to list nodes: ${error.message}`);
    return (data ?? []).map(mapNode);
  }

  async listEdges(tenantId: string, limit = 50): Promise<KnowledgeEdge[]> {
    const { data, error } = await this.supabase
      .from("knowledge_edges")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Failed to list edges: ${error.message}`);
    return (data ?? []).map(mapEdge);
  }

  async loadWorkspaceSnapshot(
    tenantId: string,
    workspaceId: string,
    options?: { bosProjectionOnly?: boolean },
  ): Promise<KnowledgeGraphSnapshot> {
    let nodeQuery = this.supabase
      .from("knowledge_nodes")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId);
    if (options?.bosProjectionOnly !== false) {
      nodeQuery = nodeQuery.like("node_type", `${BOS_NODE_PREFIX}%`);
    }
    const { data: nodes, error: nodeError } = await nodeQuery;
    if (nodeError) throw new Error(`Failed to load graph nodes: ${nodeError.message}`);
    const mappedNodes = (nodes ?? []).map(mapNode);
    const ids = mappedNodes.map((n) => n.id);
    if (ids.length === 0) return { nodes: [], edges: [] };
    const { data: edges, error: edgeError } = await this.supabase
      .from("knowledge_edges")
      .select("*")
      .eq("tenant_id", tenantId)
      .in("from_node_id", ids);
    if (edgeError) throw new Error(`Failed to load graph edges: ${edgeError.message}`);
    const scoped = (edges ?? [])
      .map(mapEdge)
      .filter((edge) => ids.includes(edge.to_node_id));
    return { nodes: mappedNodes, edges: scoped };
  }

  async searchNodes(input: {
    tenantId: string;
    workspaceId: string;
    query: string;
    limit?: number;
  }): Promise<KnowledgeNode[]> {
    const limit = Math.min(input.limit ?? 20, 50);
    const { data, error } = await this.supabase
      .from("knowledge_nodes")
      .select("*")
      .eq("tenant_id", input.tenantId)
      .eq("workspace_id", input.workspaceId)
      .like("node_type", `${BOS_NODE_PREFIX}%`)
      .ilike("title", `%${input.query}%`)
      .limit(limit);
    if (error) throw new Error(`Failed to search graph nodes: ${error.message}`);
    return (data ?? []).map(mapNode);
  }
}

function mapNode(row: Record<string, unknown>): KnowledgeNode {
  return {
    id: row.id as string,
    tenant_id: row.tenant_id as string,
    workspace_id: row.workspace_id as string | undefined,
    node_type: row.node_type as string,
    title: row.title as string,
    content: (row.content as Record<string, unknown>) ?? {},
    source_ref: row.source_ref as string | undefined,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    created_by: row.created_by as string | undefined,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

function mapEdge(row: Record<string, unknown>): KnowledgeEdge {
  return {
    id: row.id as string,
    tenant_id: row.tenant_id as string,
    from_node_id: row.from_node_id as string,
    to_node_id: row.to_node_id as string,
    edge_type: row.edge_type as string,
    weight: row.weight as number | undefined,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    created_by: row.created_by as string | undefined,
    created_at: row.created_at as string,
  };
}

function mapEvidence(row: Record<string, unknown>): EvidenceItem {
  return {
    id: row.id as string,
    tenant_id: row.tenant_id as string,
    node_id: row.node_id as string | undefined,
    source_type: row.source_type as string,
    source_id: row.source_id as string,
    excerpt: row.excerpt as string | undefined,
    score: row.score as number | undefined,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    created_at: row.created_at as string,
  };
}
