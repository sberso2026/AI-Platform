import type {
  EngineeringThreadProjectionEdge,
  EngineeringThreadProjectionNode,
  ThreadProjectionStore,
} from "./types";
import { threadNodeSourceRef } from "./identity";

export class MemoryThreadProjectionStore implements ThreadProjectionStore {
  readonly nodes = new Map<string, EngineeringThreadProjectionNode>();
  readonly edges = new Map<string, EngineeringThreadProjectionEdge>();

  private nodeKey(node: EngineeringThreadProjectionNode): string {
    return `${node.tenantId}:${threadNodeSourceRef(node.objectType, node.objectId)}`;
  }

  async upsertNode(node: EngineeringThreadProjectionNode): Promise<void> {
    this.nodes.set(this.nodeKey(node), { ...node });
  }

  async upsertEdge(edge: EngineeringThreadProjectionEdge): Promise<void> {
    const existing = this.edges.get(edge.projectionKey);
    if (!existing) {
      this.edges.set(edge.projectionKey, { ...edge, sourceLinkIds: [...edge.sourceLinkIds] });
      return;
    }
    const sourceLinkIds = [...new Set([...existing.sourceLinkIds, ...edge.sourceLinkIds, edge.sourceLinkId])];
    this.edges.set(edge.projectionKey, {
      ...existing,
      ...edge,
      sourceLinkId: existing.sourceLinkId,
      sourceRelationType: existing.sourceRelationType,
      sourceLinkIds,
      projectedAt: edge.projectedAt,
    });
  }

  async removeEdgeBySourceLinkId(tenantId: string, workspaceId: string, linkId: string): Promise<void> {
    for (const [key, edge] of this.edges) {
      if (edge.tenantId !== tenantId || edge.workspaceId !== workspaceId) continue;
      if (edge.sourceLinkId !== linkId && !edge.sourceLinkIds.includes(linkId)) continue;
      const remaining = edge.sourceLinkIds.filter((id) => id !== linkId);
      if (remaining.length === 0 || edge.sourceLinkId === linkId && remaining.length === 0) {
        this.edges.delete(key);
      } else {
        this.edges.set(key, {
          ...edge,
          sourceLinkId: remaining[0] ?? edge.sourceLinkId,
          sourceLinkIds: remaining,
        });
      }
    }
  }

  async listEdges(tenantId: string, workspaceId: string): Promise<EngineeringThreadProjectionEdge[]> {
    return [...this.edges.values()].filter((edge) => edge.tenantId === tenantId && edge.workspaceId === workspaceId);
  }

  async listNodes(tenantId: string, workspaceId: string): Promise<EngineeringThreadProjectionNode[]> {
    return [...this.nodes.values()].filter((node) => node.tenantId === tenantId && node.workspaceId === workspaceId);
  }

  async deleteWorkspaceProjection(tenantId: string, workspaceId: string): Promise<void> {
    for (const [key, edge] of this.edges) {
      if (edge.tenantId === tenantId && edge.workspaceId === workspaceId) this.edges.delete(key);
    }
    for (const [key, node] of this.nodes) {
      if (node.tenantId === tenantId && node.workspaceId === workspaceId) this.nodes.delete(key);
    }
  }
}
