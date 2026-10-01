import type { ArtifactBinaryPointer, ArtifactBinaryStore } from "./binary-store";
import { verifyStoredIntegrity } from "./binary-store";

export const OBJECT_CONSISTENCY_STATES = [
  "CONSISTENT",
  "OBJECT_MISSING",
  "METADATA_MISSING",
  "HASH_MISMATCH",
  "SIZE_MISMATCH",
] as const;
export type ObjectConsistencyState = (typeof OBJECT_CONSISTENCY_STATES)[number];

export type StorageReconciliationReport = {
  consistent: string[];
  metadataWithoutObject: string[];
  objectWithoutMetadata: string[];
  incompleteMigration: string[];
  hashMismatch: string[];
  autoDeleted: false;
};

export async function assessObjectConsistency(input: {
  pointer: ArtifactBinaryPointer | null;
  objectStore: ArtifactBinaryStore;
  auth?: { tenantId: string; workspaceId: string; projectId: string };
}): Promise<ObjectConsistencyState> {
  if (!input.pointer) return "METADATA_MISSING";
  const exists = await input.objectStore.exists(input.pointer);
  if (!exists) return "OBJECT_MISSING";
  if (!input.auth) return "CONSISTENT";
  try {
    const bytes = await input.objectStore.openRead(input.pointer, input.auth);
    verifyStoredIntegrity(bytes, { sha256: input.pointer.contentSha256, size: input.pointer.contentSizeBytes });
    return "CONSISTENT";
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "CONTENT_HASH_MISMATCH") return "HASH_MISMATCH";
    if (message === "CONTENT_SIZE_MISMATCH") return "SIZE_MISMATCH";
    if (message === "artifact_binary_not_found") return "OBJECT_MISSING";
    throw error;
  }
}

/** Bounded report only. Never deletes orphans. */
export function reconcileArtifactStorage(input: {
  metadataKeys: string[];
  objectKeys: string[];
  incompleteMigrationArtifactIds?: string[];
}): StorageReconciliationReport {
  const metadata = new Set(input.metadataKeys);
  const objects = new Set(input.objectKeys);
  return {
    consistent: input.metadataKeys.filter((key) => objects.has(key)),
    metadataWithoutObject: input.metadataKeys.filter((key) => !objects.has(key)),
    objectWithoutMetadata: input.objectKeys.filter((key) => !metadata.has(key)),
    incompleteMigration: [...(input.incompleteMigrationArtifactIds ?? [])],
    hashMismatch: [],
    autoDeleted: false,
  };
}
