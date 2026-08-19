import type { BusinessContextAiAssembly, BusinessContextQueryResult } from "@rtb/types";

export const GRAPH_CAUSATION_DISCLAIMER =
  "Graph adjacency is not causation. A linked customer and risk does not mean the customer caused the risk unless explicit source semantics say so.";

export function assembleStructuredContext(result: BusinessContextQueryResult): BusinessContextAiAssembly {
  return {
    entity: result.entity,
    neighbours: result.neighbours.map((row) => ({
      nodeType: row.node.entityType,
      displayName: row.node.displayName,
      relationshipType: row.relationshipType,
      evidence: row.evidence,
      freshness: row.evidence.projectedAt,
      sourceRefs: [row.evidence.sourceEntityRef, row.node.canonicalRef],
    })),
    dataQuality: result.dataQuality,
    unknown: result.unknown,
    missingLinks: result.missingLinks,
    adjacencyIsNotCausation: true,
    narrativeSeparate: true,
  };
}

export function causationGuardNote(): string {
  return GRAPH_CAUSATION_DISCLAIMER;
}
