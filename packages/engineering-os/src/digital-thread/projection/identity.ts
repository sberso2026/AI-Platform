import { THREAD_NODE_SOURCE_PREFIX, THREAD_PROJECTION_VERSION } from "./types";
import { semanticSignature } from "./normalize";

export function threadNodeSourceRef(objectType: string, objectId: string): string {
  return `${THREAD_NODE_SOURCE_PREFIX}${objectType}:${objectId}`;
}

export function threadProjectionKey(
  tenantId: string,
  fromType: string,
  fromId: string,
  normalizedRelationType: string,
  toType: string,
  toId: string,
): string {
  return `eos-thread-edge:${tenantId}:${semanticSignature(fromType, fromId, normalizedRelationType, toType, toId)}`;
}

export function parseThreadNodeSourceRef(sourceRef: string): { objectType: string; objectId: string } | null {
  if (!sourceRef.startsWith(THREAD_NODE_SOURCE_PREFIX)) return null;
  const rest = sourceRef.slice(THREAD_NODE_SOURCE_PREFIX.length);
  const idx = rest.indexOf(":");
  if (idx <= 0) return null;
  return { objectType: rest.slice(0, idx), objectId: rest.slice(idx + 1) };
}

export function currentProjectionVersion(): string {
  return THREAD_PROJECTION_VERSION;
}
