/**
 * Version-aware EOS 3 retrieval API foundation.
 * Not exposed to Production users; requires EOS 3 entitlement + enrollment.
 */

import type { Eos3CanonicalObjectStore } from "./eos3-object-store";
import type { Eos3KnowledgeRegistry } from "./eos3-knowledge-registry";
import type { Eos3VectorIndex } from "./eos3-vector-index";
import { retrieveEos3Knowledge, type RetrievalResult } from "./eos3-retrieval-engine";
import type { RetrievalCaller } from "./eos3-retrieval-security";
import { eos3ApiContext, eos2ApiContext } from "../commerce/eos3-api-context";

export function eos3RetrievalApiEnabled(caller: RetrievalCaller): boolean {
  if (caller.productionEnvironment) return false;
  return caller.authenticated && caller.eos3Entitled && caller.eos3Enrolled;
}

export function retrieveViaEos3Api(input: {
  generation: 2 | 3;
  store: Eos3CanonicalObjectStore;
  registry: Eos3KnowledgeRegistry;
  vectorIndex: Eos3VectorIndex;
  caller: RetrievalCaller;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  query: string;
}): { apiContext: ReturnType<typeof eos3ApiContext> | ReturnType<typeof eos2ApiContext>; result: RetrievalResult | null; deniedReason: string | null } {
  if (input.generation !== 3) {
    return {
      apiContext: eos2ApiContext(input.tenantId, input.workspaceId),
      result: null,
      deniedReason: "eos2_ask_ai_path_unchanged",
    };
  }
  if (!eos3RetrievalApiEnabled(input.caller)) {
    return {
      apiContext: eos3ApiContext(input.tenantId, input.workspaceId),
      result: null,
      deniedReason: "eos3_retrieval_denied",
    };
  }
  const result = retrieveEos3Knowledge({
    store: input.store,
    registry: input.registry,
    vectorIndex: input.vectorIndex,
    caller: input.caller,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    query: input.query,
  });
  return {
    apiContext: eos3ApiContext(input.tenantId, input.workspaceId),
    result,
    deniedReason: null,
  };
}
