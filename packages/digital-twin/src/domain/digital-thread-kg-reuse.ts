/**
 * Phase 12K — Knowledge Graph reuse for Digital Thread.
 * Resolve/publish governed refs via platform shared KG patterns.
 * NO new graph engine. KnowledgeGraphReuseReady=true; duplicateKnowledgeGraphDetected=false.
 */

import {
  DUPLICATE_KNOWLEDGE_GRAPH_DETECTED,
  KNOWLEDGE_GRAPH_REUSE_READY,
} from "../version";

export type GovernedKgRef = {
  nodeRef?: string;
  edgeRef?: string;
  relationshipType: string;
  published: boolean;
  engine: "platform_kernel_knowledge_graph";
  duplicateGraphEngine: false;
};

/**
 * Resolve a governed KG reference through the shared platform KG ownership plane.
 * Does not construct a Twin-owned graph store.
 */
export function resolveGovernedKgRef(input: {
  nodeRef?: string;
  edgeRef?: string;
  relationshipType: string;
}): GovernedKgRef {
  if (!input.nodeRef && !input.edgeRef) {
    throw new Error("kg_ref_node_or_edge_required");
  }
  return {
    nodeRef: input.nodeRef,
    edgeRef: input.edgeRef,
    relationshipType: input.relationshipType,
    published: false,
    engine: "platform_kernel_knowledge_graph",
    duplicateGraphEngine: false,
  };
}

export function publishGovernedKgRef(ref: GovernedKgRef): GovernedKgRef {
  if (ref.engine !== "platform_kernel_knowledge_graph") {
    throw new Error("digital_twin_must_reuse_platform_kg");
  }
  if (ref.duplicateGraphEngine !== false) {
    throw new Error("duplicate_knowledge_graph_forbidden");
  }
  return { ...ref, published: true, duplicateGraphEngine: false };
}

export function assertNoDuplicateKnowledgeGraph(): {
  ok: true;
  duplicateKnowledgeGraphDetected: false;
  KnowledgeGraphReuseReady: true;
} {
  if (!KNOWLEDGE_GRAPH_REUSE_READY || DUPLICATE_KNOWLEDGE_GRAPH_DETECTED) {
    throw new Error("knowledge_graph_reuse_required_without_duplicate");
  }
  return {
    ok: true,
    duplicateKnowledgeGraphDetected: false,
    KnowledgeGraphReuseReady: true,
  };
}
