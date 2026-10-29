/**
 * Bounded structured retrieval interface for later Knowledge Intelligence.
 * Structured canonical state outranks vector retrieval.
 */

import type { Eos3CanonicalObject } from "./eos3-canonical-objects";
import type { Eos3CanonicalObjectStore } from "./eos3-object-store";
import { EOS3_GRAPH_AUTHORITY_MODEL } from "./eos3-digital-thread";

export type StructuredRetrievalRecord = {
  objectId: string;
  objectType: string;
  stableObjectId: string;
  projectId: string;
  generation: 3;
  displayName: string;
  lifecycleState: string;
  governedState: string;
  currentRevisionId: string | null;
  jurisdictionProfileRef: string | null;
  provenance: Record<string, unknown>;
  authorityRank: "canonical_structured_engineering_state";
};

export function toStructuredRetrievalRecord(obj: Eos3CanonicalObject): StructuredRetrievalRecord {
  return {
    objectId: obj.id,
    objectType: obj.objectType,
    stableObjectId: obj.stableObjectId,
    projectId: obj.projectId,
    generation: 3,
    displayName: obj.displayName,
    lifecycleState: obj.lifecycleState,
    governedState: obj.governedState,
    currentRevisionId: obj.currentRevisionId,
    jurisdictionProfileRef: obj.jurisdictionProfileRef,
    provenance: obj.provenance,
    authorityRank: "canonical_structured_engineering_state",
  };
}

export function listStructuredObjects(
  store: Eos3CanonicalObjectStore,
  filter?: { objectType?: string; projectId?: string },
): StructuredRetrievalRecord[] {
  const out: StructuredRetrievalRecord[] = [];
  for (const obj of store.objects.values()) {
    if (filter?.objectType && obj.objectType !== filter.objectType) continue;
    if (filter?.projectId && obj.projectId !== filter.projectId) continue;
    out.push(toStructuredRetrievalRecord(obj));
  }
  return out;
}

export function structuredOutranksVector(): true {
  return true;
}

export function graphAuthorityForRetrieval(): typeof EOS3_GRAPH_AUTHORITY_MODEL {
  return EOS3_GRAPH_AUTHORITY_MODEL;
}
