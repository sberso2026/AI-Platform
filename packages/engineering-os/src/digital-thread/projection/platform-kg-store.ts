import type { Json, SupabaseClient } from "@rtb/database";
import { THREAD_KG_NODE_TYPE, THREAD_NODE_SOURCE_PREFIX, THREAD_PROJECTION_FAMILY } from "./types";
import type {
  EngineeringThreadProjectionEdge,
  EngineeringThreadProjectionNode,
  ThreadProjectionStore,
} from "./types";
import { parseThreadNodeSourceRef, threadNodeSourceRef } from "./identity";

function db(client: SupabaseClient): { from(name: string): any } {
  return client as unknown as { from(name: string): any };
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

/**
 * Writes Engineering Digital Thread projection onto existing Platform KG tables.
 * Never writes engineering_object_links or PI KG tables.
 */
export class PlatformKgThreadProjectionStore implements ThreadProjectionStore {
  constructor(private readonly supabase: SupabaseClient) {}

  async upsertNode(node: EngineeringThreadProjectionNode): Promise<void> {
    const sourceRef = threadNodeSourceRef(node.objectType, node.objectId);
    const metadata = {
      family: THREAD_PROJECTION_FAMILY,
      workspace_id: node.workspaceId,
      object_type: node.objectType,
      object_id: node.objectId,
      project_id: node.projectId ?? null,
      object_code: node.objectCode ?? null,
      status: node.status ?? null,
    };
    const title = node.title ?? node.objectCode ?? `${node.objectType}:${node.objectId}`;
    const existing = await db(this.supabase)
      .from("knowledge_nodes")
      .select("id")
      .eq("tenant_id", node.tenantId)
      .eq("node_type", THREAD_KG_NODE_TYPE)
      .eq("source_ref", sourceRef)
      .maybeSingle();
    const row = {
      tenant_id: node.tenantId,
      workspace_id: isUuid(node.workspaceId) ? node.workspaceId : null,
      node_type: THREAD_KG_NODE_TYPE,
      title,
      content: { object_type: node.objectType, object_id: node.objectId } as Json,
      source_ref: sourceRef,
      metadata: metadata as Json,
    };
    if (existing.data?.id) {
      const { error } = await db(this.supabase).from("knowledge_nodes").update(row).eq("id", existing.data.id);
      if (error) throw new Error(`Failed to update thread projection node: ${error.message}`);
      return;
    }
    const { error } = await db(this.supabase).from("knowledge_nodes").insert(row);
    if (error) throw new Error(`Failed to insert thread projection node: ${error.message}`);
  }

  async upsertEdge(edge: EngineeringThreadProjectionEdge): Promise<void> {
    const fromId = await this.requireNodeId(edge.tenantId, edge.sourceObjectType, edge.sourceObjectId);
    const toId = await this.requireNodeId(edge.tenantId, edge.targetObjectType, edge.targetObjectId);
    const metadata = {
      family: THREAD_PROJECTION_FAMILY,
      workspace_id: edge.workspaceId,
      source_link_id: edge.sourceLinkId,
      source_link_ids: edge.sourceLinkIds,
      source_relation_type: edge.sourceRelationType,
      normalized_relation_type: edge.normalizedRelationType,
      projection_version: edge.projectionVersion,
      projected_at: edge.projectedAt,
      projection_key: edge.projectionKey,
    };
    const existing = await db(this.supabase)
      .from("knowledge_edges")
      .select("id, metadata")
      .eq("tenant_id", edge.tenantId)
      .eq("from_node_id", fromId)
      .eq("to_node_id", toId)
      .eq("edge_type", edge.normalizedRelationType)
      .maybeSingle();
    if (existing.data?.id) {
      const prior = (existing.data.metadata as Record<string, unknown> | null) ?? {};
      const priorIds = Array.isArray(prior.source_link_ids) ? (prior.source_link_ids as string[]) : [];
      const sourceLinkIds = [...new Set([...priorIds, ...edge.sourceLinkIds, edge.sourceLinkId])];
      const { error } = await db(this.supabase)
        .from("knowledge_edges")
        .update({
          metadata: {
            ...prior,
            ...metadata,
            source_link_id: typeof prior.source_link_id === "string" ? prior.source_link_id : edge.sourceLinkId,
            source_relation_type:
              typeof prior.source_relation_type === "string" ? prior.source_relation_type : edge.sourceRelationType,
            source_link_ids: sourceLinkIds,
          } as Json,
        })
        .eq("id", existing.data.id);
      if (error) throw new Error(`Failed to update thread projection edge: ${error.message}`);
      return;
    }
    const { error } = await db(this.supabase).from("knowledge_edges").insert({
      tenant_id: edge.tenantId,
      from_node_id: fromId,
      to_node_id: toId,
      edge_type: edge.normalizedRelationType,
      weight: 1,
      metadata: metadata as Json,
    });
    if (error) throw new Error(`Failed to insert thread projection edge: ${error.message}`);
  }

  async removeEdgeBySourceLinkId(tenantId: string, workspaceId: string, linkId: string): Promise<void> {
    const edges = await this.listEdges(tenantId, workspaceId);
    for (const edge of edges) {
      if (edge.sourceLinkId !== linkId && !edge.sourceLinkIds.includes(linkId)) continue;
      const remaining = edge.sourceLinkIds.filter((id) => id !== linkId);
      const fromId = await this.requireNodeId(tenantId, edge.sourceObjectType, edge.sourceObjectId);
      const toId = await this.requireNodeId(tenantId, edge.targetObjectType, edge.targetObjectId);
      const found = await db(this.supabase)
        .from("knowledge_edges")
        .select("id")
        .eq("tenant_id", tenantId)
        .eq("from_node_id", fromId)
        .eq("to_node_id", toId)
        .eq("edge_type", edge.normalizedRelationType)
        .maybeSingle();
      if (!found.data?.id) continue;
      if (remaining.length === 0) {
        const { error } = await db(this.supabase).from("knowledge_edges").delete().eq("id", found.data.id);
        if (error) throw new Error(`Failed to delete thread projection edge: ${error.message}`);
      } else {
        const { error } = await db(this.supabase)
          .from("knowledge_edges")
          .update({
            metadata: {
              family: THREAD_PROJECTION_FAMILY,
              workspace_id: workspaceId,
              source_link_id: remaining[0],
              source_link_ids: remaining,
              source_relation_type: edge.sourceRelationType,
              normalized_relation_type: edge.normalizedRelationType,
              projection_version: edge.projectionVersion,
              projected_at: edge.projectedAt,
              projection_key: edge.projectionKey,
            } as Json,
          })
          .eq("id", found.data.id);
        if (error) throw new Error(`Failed to update thread projection edge after delete: ${error.message}`);
      }
    }
  }

  async listEdges(tenantId: string, workspaceId: string): Promise<EngineeringThreadProjectionEdge[]> {
    const { data, error } = await db(this.supabase)
      .from("knowledge_edges")
      .select("edge_type, metadata, from_node_id, to_node_id")
      .eq("tenant_id", tenantId)
      .limit(5000);
    if (error) throw new Error(`Failed to list thread projection edges: ${error.message}`);
    const nodeIds = new Set<string>();
    for (const row of data ?? []) {
      nodeIds.add(String(row.from_node_id));
      nodeIds.add(String(row.to_node_id));
    }
    const nodes = await this.loadNodesByIds(tenantId, [...nodeIds]);
    const out: EngineeringThreadProjectionEdge[] = [];
    for (const row of data ?? []) {
      const metadata = (row.metadata as Record<string, unknown> | null) ?? {};
      if (metadata.family !== THREAD_PROJECTION_FAMILY) continue;
      if (String(metadata.workspace_id ?? "") !== workspaceId) continue;
      const from = nodes.get(String(row.from_node_id));
      const to = nodes.get(String(row.to_node_id));
      if (!from || !to) continue;
      const sourceLinkIds = Array.isArray(metadata.source_link_ids)
        ? (metadata.source_link_ids as string[])
        : [String(metadata.source_link_id ?? "")];
      out.push({
        tenantId,
        workspaceId,
        sourceObjectType: from.objectType,
        sourceObjectId: from.objectId,
        targetObjectType: to.objectType,
        targetObjectId: to.objectId,
        normalizedRelationType: String(metadata.normalized_relation_type ?? row.edge_type),
        sourceLinkId: String(metadata.source_link_id ?? sourceLinkIds[0] ?? ""),
        sourceRelationType: String(metadata.source_relation_type ?? row.edge_type),
        projectionVersion: String(metadata.projection_version ?? ""),
        projectedAt: String(metadata.projected_at ?? ""),
        projectionKey: String(metadata.projection_key ?? ""),
        sourceLinkIds,
      });
    }
    return out;
  }

  async listNodes(tenantId: string, workspaceId: string): Promise<EngineeringThreadProjectionNode[]> {
    const { data, error } = await db(this.supabase)
      .from("knowledge_nodes")
      .select("tenant_id, workspace_id, source_ref, metadata, title")
      .eq("tenant_id", tenantId)
      .eq("node_type", THREAD_KG_NODE_TYPE)
      .limit(5000);
    if (error) throw new Error(`Failed to list thread projection nodes: ${error.message}`);
    const out: EngineeringThreadProjectionNode[] = [];
    for (const row of data ?? []) {
      const metadata = (row.metadata as Record<string, unknown> | null) ?? {};
      const workspace = String(metadata.workspace_id ?? row.workspace_id ?? "");
      if (workspace !== workspaceId) continue;
      const parsed = parseThreadNodeSourceRef(String(row.source_ref ?? ""));
      if (!parsed) continue;
      out.push({
        tenantId,
        workspaceId,
        objectType: parsed.objectType,
        objectId: parsed.objectId,
        projectId: (metadata.project_id as string | null) ?? null,
        objectCode: (metadata.object_code as string | null) ?? null,
        status: (metadata.status as string | null) ?? null,
        title: (row.title as string | null) ?? null,
      });
    }
    return out;
  }

  async deleteWorkspaceProjection(tenantId: string, workspaceId: string): Promise<void> {
    const edges = await this.listEdges(tenantId, workspaceId);
    for (const edge of edges) {
      const fromId = await this.requireNodeId(tenantId, edge.sourceObjectType, edge.sourceObjectId);
      const toId = await this.requireNodeId(tenantId, edge.targetObjectType, edge.targetObjectId);
      await db(this.supabase)
        .from("knowledge_edges")
        .delete()
        .eq("tenant_id", tenantId)
        .eq("from_node_id", fromId)
        .eq("to_node_id", toId)
        .eq("edge_type", edge.normalizedRelationType);
    }
    const { data: nodes } = await db(this.supabase)
      .from("knowledge_nodes")
      .select("id, source_ref, metadata")
      .eq("tenant_id", tenantId)
      .eq("node_type", THREAD_KG_NODE_TYPE)
      .like("source_ref", `${THREAD_NODE_SOURCE_PREFIX}%`);
    for (const row of nodes ?? []) {
      const metadata = (row.metadata as Record<string, unknown> | null) ?? {};
      if (String(metadata.workspace_id ?? "") !== workspaceId) continue;
      await db(this.supabase).from("knowledge_nodes").delete().eq("id", row.id);
    }
  }

  private async requireNodeId(tenantId: string, objectType: string, objectId: string): Promise<string> {
    const sourceRef = threadNodeSourceRef(objectType, objectId);
    const { data, error } = await db(this.supabase)
      .from("knowledge_nodes")
      .select("id")
      .eq("tenant_id", tenantId)
      .eq("node_type", THREAD_KG_NODE_TYPE)
      .eq("source_ref", sourceRef)
      .maybeSingle();
    if (error || !data?.id) throw new Error(`Thread projection node missing for ${sourceRef}`);
    return String(data.id);
  }

  private async loadNodesByIds(tenantId: string, ids: string[]): Promise<Map<string, EngineeringThreadProjectionNode>> {
    const map = new Map<string, EngineeringThreadProjectionNode>();
    if (ids.length === 0) return map;
    const { data } = await db(this.supabase)
      .from("knowledge_nodes")
      .select("id, tenant_id, source_ref, metadata")
      .eq("tenant_id", tenantId)
      .in("id", ids);
    for (const row of data ?? []) {
      const parsed = parseThreadNodeSourceRef(String(row.source_ref ?? ""));
      if (!parsed) continue;
      const metadata = (row.metadata as Record<string, unknown> | null) ?? {};
      map.set(String(row.id), {
        tenantId,
        workspaceId: String(metadata.workspace_id ?? ""),
        objectType: parsed.objectType,
        objectId: parsed.objectId,
      });
    }
    return map;
  }
}
