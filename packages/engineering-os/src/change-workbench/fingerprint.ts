import { createHash } from "node:crypto";

export function sha256Json(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

export function candidateEvidenceFingerprint(input: {
  objectType: string;
  objectId: string;
  relationPath: Array<{ objectType: string; objectId: string; relationship?: string; depth: number }>;
  reason: string;
}): string {
  return sha256Json({
    objectType: input.objectType,
    objectId: input.objectId,
    relationPath: input.relationPath,
    reason: input.reason,
  });
}

export function assessmentSourceFingerprint(input: {
  sourceObjectType: string;
  sourceObjectId: string;
  sourceRevision?: string | null;
  sourceTitle?: string | null;
  sourceStatus?: string | null;
  policyVersion: string;
}): string {
  return sha256Json(input);
}

export function graphFingerprint(input: {
  nodes: Array<{ objectType: string; objectId: string }>;
  links: Array<{ fromType: string; fromId: string; relationship: string; toType: string; toId: string }>;
}): string {
  const nodes = [...input.nodes].map((n) => `${n.objectType}:${n.objectId}`).sort();
  const links = [...input.links]
    .map((l) => `${l.fromType}:${l.fromId}:${l.relationship}:${l.toType}:${l.toId}`)
    .sort();
  return sha256Json({ nodes, links });
}
