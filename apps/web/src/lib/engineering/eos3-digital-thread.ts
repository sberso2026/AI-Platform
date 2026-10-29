/**
 * EOS 3.2 digital-thread query service.
 * Authoritative graph = structured canonical relationships (not embeddings/LLM).
 */

import type { Eos3CanonicalObject, Eos3ObjectRevision } from "./eos3-canonical-objects";
import type { Eos3CanonicalRelationship } from "./eos3-relationships";

export const EOS3_GRAPH_AUTHORITY_MODEL = "STRUCTURED_CANONICAL_STATE" as const;

export type DigitalThreadStoreView = {
  objects: Map<string, Eos3CanonicalObject>;
  revisions: Map<string, Eos3ObjectRevision>;
  relationships: Eos3CanonicalRelationship[];
};

function outgoing(store: DigitalThreadStoreView, fromId: string, types?: string[]) {
  return store.relationships.filter(
    (r) => r.fromObjectId === fromId && (!types || types.includes(r.relationshipType)),
  );
}

function incoming(store: DigitalThreadStoreView, toId: string, types?: string[]) {
  return store.relationships.filter(
    (r) => r.toObjectId === toId && (!types || types.includes(r.relationshipType)),
  );
}

export function requirementsDrivingObject(
  store: DigitalThreadStoreView,
  objectId: string,
): Eos3CanonicalObject[] {
  const reqIds = new Set<string>();
  for (const r of incoming(store, objectId, [
    "REQUIREMENT_ALLOCATED_TO_SYSTEM",
    "REQUIREMENT_ALLOCATED_TO_DISCIPLINE_OBJECT",
    "INTERFACE_TRACES_REQUIREMENT",
  ])) {
    reqIds.add(r.fromObjectId);
  }
  // Also walk system parents
  for (const r of incoming(store, objectId, ["SYSTEM_CONTAINS_DISCIPLINE_OBJECT"])) {
    for (const rr of incoming(store, r.fromObjectId, ["REQUIREMENT_ALLOCATED_TO_SYSTEM"])) {
      reqIds.add(rr.fromObjectId);
    }
  }
  return [...reqIds].map((id) => store.objects.get(id)).filter(Boolean) as Eos3CanonicalObject[];
}

export function currentRevisionOf(
  store: DigitalThreadStoreView,
  objectId: string,
): Eos3ObjectRevision | null {
  const obj = store.objects.get(objectId);
  if (!obj?.currentRevisionId) return null;
  return store.revisions.get(obj.currentRevisionId) ?? null;
}

export function interfacesDependingOnRevision(
  store: DigitalThreadStoreView,
  revisionId: string,
): Eos3CanonicalObject[] {
  const ids = incoming(store, revisionId ? revisionId : "", []).length;
  void ids;
  const ifaceIds = store.relationships
    .filter(
      (r) =>
        r.relationshipType === "INTERFACE_SOURCE_REVISION" &&
        (r.toRevisionId === revisionId || r.toObjectId === revisionId),
    )
    .map((r) => r.fromObjectId);
  return [...new Set(ifaceIds)]
    .map((id) => store.objects.get(id))
    .filter(Boolean) as Eos3CanonicalObject[];
}

export function changesAffectingDeliverable(
  store: DigitalThreadStoreView,
  deliverableId: string,
): Eos3CanonicalObject[] {
  const revLinks = incoming(store, deliverableId, ["DELIVERABLE_SNAPSHOT_OF_REVISION"]);
  const objectIds = new Set<string>();
  for (const link of revLinks) {
    const rev = store.revisions.get(link.fromObjectId) ?? store.revisions.get(link.fromRevisionId ?? "");
    if (rev) objectIds.add(rev.objectId);
    objectIds.add(link.fromObjectId);
  }
  const changeIds = new Set<string>();
  for (const oid of objectIds) {
    for (const r of incoming(store, oid, ["CHANGE_AFFECTS_OBJECT", "IMPACT_ON_OBJECT"])) {
      if (r.relationshipType === "CHANGE_AFFECTS_OBJECT") changeIds.add(r.fromObjectId);
      if (r.relationshipType === "IMPACT_ON_OBJECT") {
        for (const c of incoming(store, r.fromObjectId, ["CHANGE_PRODUCES_IMPACT"])) {
          changeIds.add(c.fromObjectId);
        }
      }
    }
  }
  return [...changeIds].map((id) => store.objects.get(id)).filter(Boolean) as Eos3CanonicalObject[];
}

export function assumptionsSupportingCalculation(
  store: DigitalThreadStoreView,
  calculationId: string,
): Eos3CanonicalObject[] {
  return incoming(store, calculationId, ["ASSUMPTION_SUPPORTS_CALCULATION"])
    .map((r) => store.objects.get(r.fromObjectId))
    .filter(Boolean) as Eos3CanonicalObject[];
}

export function evidenceSupportingDecision(
  store: DigitalThreadStoreView,
  decisionId: string,
): Eos3CanonicalObject[] {
  return outgoing(store, decisionId, ["DECISION_HAS_EVIDENCE"])
    .map((r) => store.objects.get(r.toObjectId))
    .filter(Boolean) as Eos3CanonicalObject[];
}

export function baselinesContainingRevision(
  store: DigitalThreadStoreView,
  revisionId: string,
): Eos3CanonicalObject[] {
  return store.relationships
    .filter(
      (r) =>
        r.relationshipType === "BASELINE_INCLUDES_REVISION" &&
        (r.toRevisionId === revisionId || r.toObjectId === revisionId),
    )
    .map((r) => store.objects.get(r.fromObjectId))
    .filter(Boolean) as Eos3CanonicalObject[];
}

export function assetsOriginatedFromSystem(
  store: DigitalThreadStoreView,
  systemId: string,
): Eos3CanonicalObject[] {
  return outgoing(store, systemId, ["ASSET_ORIGINATED_FROM_SYSTEM"])
    .map((r) => store.objects.get(r.toObjectId))
    .filter(Boolean) as Eos3CanonicalObject[];
}

/** Full bounded thread walk from a starting object id. */
export function traceDigitalThread(
  store: DigitalThreadStoreView,
  startObjectId: string,
): Array<{ objectId: string; objectType: string; stableObjectId: string; via: string | null }> {
  const visited = new Set<string>();
  const out: Array<{
    objectId: string;
    objectType: string;
    stableObjectId: string;
    via: string | null;
  }> = [];
  const queue: Array<{ id: string; via: string | null }> = [{ id: startObjectId, via: null }];
  while (queue.length) {
    const cur = queue.shift()!;
    if (visited.has(cur.id)) continue;
    visited.add(cur.id);
    const obj = store.objects.get(cur.id);
    if (!obj) continue;
    out.push({
      objectId: obj.id,
      objectType: obj.objectType,
      stableObjectId: obj.stableObjectId,
      via: cur.via,
    });
    for (const r of store.relationships) {
      if (r.fromObjectId === cur.id && !visited.has(r.toObjectId)) {
        queue.push({ id: r.toObjectId, via: r.relationshipType });
      }
      if (r.toObjectId === cur.id && !visited.has(r.fromObjectId)) {
        queue.push({ id: r.fromObjectId, via: r.relationshipType });
      }
    }
  }
  return out;
}

export function embeddingsAreGraphAuthority(): false {
  return false;
}
