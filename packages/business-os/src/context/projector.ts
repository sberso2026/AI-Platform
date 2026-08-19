import {
  BUSINESS_CONTEXT_GRAPH_ONTOLOGY_VERSION,
  type BusinessContextCanonicalRecord,
  type BusinessContextRelationshipEvidence,
} from "@rtb/types";
import { assertSameTenant, assertSameWorkspace, redactSuppressedContactContent } from "./identity";
import { kernelNodeType } from "./ontology";
import { assertRelationshipType } from "./taxonomy";
import type { GraphPort } from "./graph-port";

export type ProjectionResult = {
  nodesProjected: number;
  relationshipsProjected: number;
  unresolved: Array<{
    fromCanonicalRef: string;
    toEntityId: string;
    relationshipType: string;
    reason: string;
  }>;
};

function evidenceMetadata(evidence: BusinessContextRelationshipEvidence): Record<string, unknown> {
  return {
    sourceDomain: evidence.sourceDomain,
    sourceEntityRef: evidence.sourceEntityRef,
    sourceEvent: evidence.sourceEvent ?? null,
    provenance: evidence.provenance,
    projectedAt: evidence.projectedAt,
    relationshipVersion: evidence.relationshipVersion,
    confidence: evidence.confidence ?? null,
    status: evidence.status,
    ontologyVersion: BUSINESS_CONTEXT_GRAPH_ONTOLOGY_VERSION,
  };
}

export async function projectRecords(
  graph: GraphPort,
  records: BusinessContextCanonicalRecord[],
  actorId?: string,
): Promise<ProjectionResult> {
  const unresolved: ProjectionResult["unresolved"] = [];

  let nodesProjected = 0;
  for (const record of records) {
    const identity = record.identity;
    if (identity.deleted) {
      const existing = await graph.findNodeBySourceRef(
        identity.tenantId,
        identity.workspaceId,
        identity.canonicalRef,
      );
      if (existing) await graph.deleteNode(identity.tenantId, existing.id);
      continue;
    }
    const content = redactSuppressedContactContent(identity);
    await graph.upsertNode({
      tenantId: identity.tenantId,
      workspaceId: identity.workspaceId,
      nodeType: kernelNodeType(identity.entityType),
      title: String(content.displayName ?? identity.displayName),
      sourceRef: identity.canonicalRef,
      createdBy: actorId,
      content,
      metadata: {
        ontologyVersion: BUSINESS_CONTEXT_GRAPH_ONTOLOGY_VERSION,
        projection: true,
        sourceOfTruth: identity.domain,
      },
    });
    nodesProjected += 1;
  }

  const snapshots = new Map<string, Awaited<ReturnType<GraphPort["loadSnapshot"]>>>();
  const loadSnapshotOnce = async (tenantId: string, workspaceId: string) => {
    const key = `${tenantId}:${workspaceId}`;
    const existing = snapshots.get(key);
    if (existing) return existing;
    const snapshot = await graph.loadSnapshot(tenantId, workspaceId);
    snapshots.set(key, snapshot);
    return snapshot;
  };

  let relationshipsProjected = 0;
  for (const record of records) {
    if (record.identity.deleted) continue;
    const from = await graph.findNodeBySourceRef(
      record.identity.tenantId,
      record.identity.workspaceId,
      record.identity.canonicalRef,
    );
    if (!from) continue;
    const snapshot = await loadSnapshotOnce(record.identity.tenantId, record.identity.workspaceId);
    for (const link of record.links) {
      const type = assertRelationshipType(link.relationshipType);
      const targetTenant = link.toTenantId ?? record.identity.tenantId;
      const targetWorkspace = link.toWorkspaceId ?? record.identity.workspaceId;
      assertSameTenant(record.identity.tenantId, targetTenant);
      assertSameWorkspace(record.identity.workspaceId, targetWorkspace);
      if (!link.evidence.sourceDomain || !link.evidence.sourceEntityRef) {
        unresolved.push({
          fromCanonicalRef: record.identity.canonicalRef,
          toEntityId: link.toEntityId,
          relationshipType: type,
          reason: "missing_relationship_evidence",
        });
        continue;
      }
      const resolved =
        snapshot.nodes.find((n) => {
          const content = n.content ?? {};
          return content.entityType === link.toEntityType && String(content.entityId) === link.toEntityId;
        }) ?? null;
      if (!resolved || resolved.content?.deleted) {
        unresolved.push({
          fromCanonicalRef: record.identity.canonicalRef,
          toEntityId: link.toEntityId,
          relationshipType: type,
          reason: "unresolved_link",
        });
        continue;
      }
      if (link.evidence.status === "deleted" || link.evidence.status === "reversed") {
        const existing = await graph.findEdge(record.identity.tenantId, from.id, resolved.id, type);
        if (existing) await graph.deleteEdge(record.identity.tenantId, existing.id);
        continue;
      }
      await graph.upsertEdge({
        tenantId: record.identity.tenantId,
        fromNodeId: from.id,
        toNodeId: resolved.id,
        edgeType: type,
        metadata: evidenceMetadata(link.evidence),
        createdBy: actorId,
      });
      relationshipsProjected += 1;
    }
  }

  return { nodesProjected, relationshipsProjected, unresolved };
}
