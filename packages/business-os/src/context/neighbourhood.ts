import {
  BUSINESS_CONTEXT_DEFAULT_DEPTH,
  BUSINESS_CONTEXT_MAX_DEPTH,
  BUSINESS_CONTEXT_MAX_NEIGHBOURS,
  BUSINESS_CONTEXT_RELATIONSHIP_TYPES,
  type BusinessContextNeighbour,
  type BusinessContextNodeIdentity,
  type BusinessContextQueryResult,
  type BusinessContextRelationshipEvidence,
  type BusinessContextRelationshipType,
} from "@rtb/types";
import type { KnowledgeEdge, KnowledgeNode } from "@rtb/types";
import { identityFromContent, SUPPRESSED_CONTACT_LABEL } from "./identity";
import { parseKernelNodeType } from "./ontology";
import type { GraphSnapshot } from "./graph-port";
import { emptyQuality } from "./diagnostics";

const CONTACT_TYPES = new Set(["contact"]);

export type NeighbourhoodOptions = {
  depth?: number;
  allowlist?: readonly BusinessContextRelationshipType[];
  includeSuppressedContacts?: boolean;
  maxNeighbours?: number;
};

function asEvidence(meta: Record<string, unknown> | undefined): BusinessContextRelationshipEvidence {
  return {
    sourceDomain: (meta?.sourceDomain as BusinessContextRelationshipEvidence["sourceDomain"]) ?? "platform",
    sourceEntityRef: String(meta?.sourceEntityRef ?? "unknown"),
    sourceEvent: (meta?.sourceEvent as string | null | undefined) ?? null,
    provenance: (meta?.provenance as Record<string, unknown>) ?? {},
    projectedAt: String(meta?.projectedAt ?? new Date(0).toISOString()),
    relationshipVersion: "business_context_graph.v1",
    confidence: typeof meta?.confidence === "number" ? meta.confidence : null,
    status: (meta?.status as BusinessContextRelationshipEvidence["status"]) ?? "active",
  };
}

function visibleIdentity(node: KnowledgeNode, includeSuppressedContacts: boolean): BusinessContextNodeIdentity | null {
  const identity = identityFromContent(node.content ?? {}, node.title);
  if (!identity) return null;
  if (identity.deleted) return null;
  if (identity.suppressed && CONTACT_TYPES.has(identity.entityType) && !includeSuppressedContacts) {
    return null;
  }
  if (identity.suppressed && identity.entityType === "contact") {
    return { ...identity, displayName: SUPPRESSED_CONTACT_LABEL, sourceRef: null };
  }
  return identity;
}

export function queryNeighbourhood(
  snapshot: GraphSnapshot,
  start: { entityType: string; entityId: string },
  options: NeighbourhoodOptions = {},
): BusinessContextQueryResult {
  const depth = options.depth ?? BUSINESS_CONTEXT_DEFAULT_DEPTH;
  if (depth > BUSINESS_CONTEXT_MAX_DEPTH) throw new Error("graph_depth_exceeded");
  const maxNeighbours = options.maxNeighbours ?? BUSINESS_CONTEXT_MAX_NEIGHBOURS;
  const allow = new Set(
    (options.allowlist ?? BUSINESS_CONTEXT_RELATIONSHIP_TYPES) as readonly string[],
  );
  const includeSuppressedContacts = options.includeSuppressedContacts === true;

  const startNode = snapshot.nodes.find((n) => {
    const content = n.content ?? {};
    return content.entityType === start.entityType && String(content.entityId) === start.entityId;
  });
  const entity = startNode ? visibleIdentity(startNode, includeSuppressedContacts) : null;
  if (!startNode || !entity) {
    return {
      entity: null,
      neighbours: [],
      missingLinks: [`${start.entityType}:${start.entityId}`],
      unknown: ["source_entity_missing"],
      truncated: false,
      adjacencyIsNotCausation: true,
      freshness: null,
      dataQuality: emptyQuality(),
    };
  }

  const byId = new Map(snapshot.nodes.map((n) => [n.id, n]));
  const adjacency: Array<{ edge: KnowledgeEdge; from: KnowledgeNode; to: KnowledgeNode }> = [];
  for (const edge of snapshot.edges) {
    const from = byId.get(edge.from_node_id);
    const to = byId.get(edge.to_node_id);
    if (!from || !to) continue;
    if (!allow.has(edge.edge_type)) continue;
    adjacency.push({ edge, from, to });
  }

  const neighbours: BusinessContextNeighbour[] = [];
  const visited = new Set<string>([startNode.id]);
  let frontier: KnowledgeNode[] = [startNode];
  let truncated = false;

  for (let d = 1; d <= depth; d += 1) {
    const next: KnowledgeNode[] = [];
    for (const node of frontier) {
      for (const rel of adjacency) {
        let other: KnowledgeNode | null = null;
        let direction: "outbound" | "inbound" = "outbound";
        if (rel.from.id === node.id) {
          other = rel.to;
          direction = "outbound";
        } else if (rel.to.id === node.id) {
          other = rel.from;
          direction = "inbound";
        }
        if (!other || visited.has(other.id)) continue;
        const identity = visibleIdentity(other, includeSuppressedContacts);
        if (!identity) continue;
        if (parseKernelNodeType(other.node_type) == null) continue;
        visited.add(other.id);
        next.push(other);
        if (neighbours.length >= maxNeighbours) {
          truncated = true;
          break;
        }
        neighbours.push({
          node: identity,
          relationshipType: rel.edge.edge_type as BusinessContextRelationshipType,
          direction,
          evidence: asEvidence(rel.edge.metadata),
          depth: d,
        });
      }
      if (truncated) break;
    }
    frontier = next;
    if (truncated) break;
  }

  const freshness = neighbours.reduce<string | null>((latest, row) => {
    const at = row.evidence.projectedAt;
    if (!latest || at > latest) return at;
    return latest;
  }, entity.effectiveAt);

  return {
    entity,
    neighbours,
    missingLinks: [],
    unknown: [],
    truncated,
    adjacencyIsNotCausation: true,
    freshness,
    dataQuality: emptyQuality(),
  };
}
