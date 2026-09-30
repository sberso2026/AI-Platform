import type { ThreadAuthorization, ThreadCatalogNode, ThreadGraphInput, ThreadQuery, ThreadRelation } from "../types";
import { traverseThread } from "../traversal";
import type { EngineeringThreadProjectionEdge, EngineeringThreadProjectionNode } from "./types";

export function projectedEdgesToRelations(edges: EngineeringThreadProjectionEdge[]): ThreadRelation[] {
  return edges.map((edge) => ({
    id: edge.sourceLinkId,
    relationship: edge.normalizedRelationType,
    fromType: edge.sourceObjectType,
    fromId: edge.sourceObjectId,
    toType: edge.targetObjectType,
    toId: edge.targetObjectId,
    governed: true,
    metadata: {
      source_relation_type: edge.sourceRelationType,
      projection_version: edge.projectionVersion,
      projection_key: edge.projectionKey,
      source: "platform_kg_projection",
    },
  }));
}

export function projectedNodesToCatalog(
  nodes: EngineeringThreadProjectionNode[],
  catalog?: ThreadCatalogNode[],
): ThreadCatalogNode[] {
  const byKey = new Map((catalog ?? []).map((node) => [`${node.objectType}:${node.objectId}`, node]));
  return nodes.map((node) => {
    const existing = byKey.get(`${node.objectType}:${node.objectId}`);
    return {
      tenantId: node.tenantId,
      workspaceId: node.workspaceId,
      objectType: node.objectType,
      objectId: node.objectId,
      projectId: node.projectId ?? existing?.projectId,
      objectCode: node.objectCode ?? existing?.objectCode,
      title: node.title ?? existing?.title,
      status: node.status ?? existing?.status,
      stale: existing?.stale,
      superseded: existing?.superseded,
      staleReasons: existing?.staleReasons,
      discipline: existing?.discipline,
      capability: existing?.capability,
      blockingReasons: existing?.blockingReasons,
      toolCode: existing?.toolCode,
      provenance: existing?.provenance,
    };
  });
}

export function projectedGraphInput(
  nodes: EngineeringThreadProjectionNode[],
  edges: EngineeringThreadProjectionEdge[],
  catalog?: ThreadCatalogNode[],
): ThreadGraphInput {
  return {
    nodes: projectedNodesToCatalog(nodes, catalog),
    links: projectedEdgesToRelations(edges),
  };
}

export function traverseProjectedThread(
  nodes: EngineeringThreadProjectionNode[],
  edges: EngineeringThreadProjectionEdge[],
  query: ThreadQuery,
  auth?: ThreadAuthorization,
  catalog?: ThreadCatalogNode[],
) {
  return traverseThread(projectedGraphInput(nodes, edges, catalog), query, auth);
}

export function semanticEdgeSignature(edges: EngineeringThreadProjectionEdge[]): string {
  return edges
    .map((edge) => edge.projectionKey)
    .sort()
    .join("|");
}

export function semanticRelationSignature(links: ThreadRelation[]): string {
  return links
    .map((link) => `${link.fromType}:${link.fromId}:${link.relationship}:${link.toType}:${link.toId}`)
    .sort()
    .join("|");
}
