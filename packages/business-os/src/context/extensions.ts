import type { BusinessContextGraphContract, AiWorkforceContract } from "@rtb/types";
import { BUSINESS_CONTEXT_GRAPH_ONTOLOGY_VERSION } from "@rtb/types";

export const BUSINESS_CONTEXT_GRAPH_CONTRACT: BusinessContextGraphContract = {
  capability: "business_context",
  implemented: true,
  ontologyVersion: BUSINESS_CONTEXT_GRAPH_ONTOLOGY_VERSION,
  reuses: [
    "platform_kernel_knowledge_graph",
    "platform_kernel_event_bus",
    "platform_kernel_ai_director",
  ],
  projectionOnly: true,
  noSecondGraphRuntime: true,
  noSecondVectorStore: true,
  noSecondSearchStack: true,
  noSecondMemoryService: true,
  adjacencyIsNotCausation: true,
  engineeringOsReferenceOnly: true,
  implementsOwnAiStack: false,
  note: "BOS-10 Business Context Graph. Projection of canonical BOS records into the Platform Kernel Knowledge Graph. Graph adjacency is not causation. Not a second graph, search, vector, or memory stack. Engineering OS remains reference-only.",
};

export function businessContextGraphStatus() {
  return {
    available: true as const,
    reason: "business_context_implemented" as const,
    contract: BUSINESS_CONTEXT_GRAPH_CONTRACT.capability,
  };
}

export const AI_WORKFORCE_CONTRACT: AiWorkforceContract = {
  capability: "ai_workforce",
  implemented: false,
  note: "BOS-10 extension boundary only. Do not start BOS-11.",
};

export function aiWorkforceStatus() {
  return {
    available: false as const,
    reason: "ai_workforce_not_implemented" as const,
    contract: AI_WORKFORCE_CONTRACT.capability,
  };
}
