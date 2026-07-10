import type { Json, SupabaseClient } from "@rtb/database";
import type { EvidenceItem, KnowledgeEdge, KnowledgeNode } from "@rtb/types";

export class KnowledgeGraphService {
  constructor(private readonly supabase: SupabaseClient) {}

  async createNode(input: {
    tenantId: string;
    workspaceId?: string;
    nodeType: string;
    title: string;
    content?: Record<string, unknown>;
    sourceRef?: string;
    createdBy?: string;
  }): Promise<KnowledgeNode> {
    const { data, error } = await this.supabase
      .from("knowledge_nodes")
      .insert({
        tenant_id: input.tenantId,
        workspace_id: input.workspaceId ?? null,
        node_type: input.nodeType,
        title: input.title,
        content: (input.content ?? {}) as Json,
        source_ref: input.sourceRef ?? null,
        created_by: input.createdBy ?? null,
      })
      .select()
      .single();

    if (error || !data) throw new Error(`Failed to create node: ${error?.message}`);
    return mapNode(data);
  }

  async createEdge(input: {
    tenantId: string;
    fromNodeId: string;
    toNodeId: string;
    edgeType: string;
    weight?: number;
    createdBy?: string;
  }): Promise<KnowledgeEdge> {
    const { data, error } = await this.supabase
      .from("knowledge_edges")
      .insert({
        tenant_id: input.tenantId,
        from_node_id: input.fromNodeId,
        to_node_id: input.toNodeId,
        edge_type: input.edgeType,
        weight: input.weight ?? 1.0,
        created_by: input.createdBy ?? null,
      })
      .select()
      .single();

    if (error || !data) throw new Error(`Failed to create edge: ${error?.message}`);
    return mapEdge(data);
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
