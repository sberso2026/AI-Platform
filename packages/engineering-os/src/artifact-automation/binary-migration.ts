import {
  hashBytes,
  serverObjectKey,
  verifyStoredIntegrity,
  type ArtifactBinaryPointer,
  type ArtifactBinaryStore,
  type MigrationState,
} from "./binary-store";
import { LegacyRelationalArtifactBinaryStore } from "./binary-adapters";

export type MigrationStepResult = {
  ok: boolean;
  pointer: ArtifactBinaryPointer;
  switched: boolean;
  reason: string;
};

export function beginMigrationPointer(pointer: ArtifactBinaryPointer): ArtifactBinaryPointer {
  return {
    ...pointer,
    objectKey: serverObjectKey({ ...pointer, storageVersion: pointer.storageVersion + 1 }),
    storageVersion: pointer.storageVersion + 1,
    migrationState: "IN_PROGRESS",
  };
}

export async function migrateLegacyArtifact(input: {
  legacy: LegacyRelationalArtifactBinaryStore;
  objectStore: ArtifactBinaryStore;
  pointer: ArtifactBinaryPointer;
  auth: { tenantId: string; workspaceId: string; projectId: string };
}): Promise<MigrationStepResult> {
  const source = await input.legacy.openRead(input.pointer, input.auth);
  const expectedSha = input.pointer.contentSha256 || hashBytes(source);
  const expectedSize = input.pointer.contentSizeBytes || source.byteLength;
  const inProgress = beginMigrationPointer({
    ...input.pointer,
    contentSha256: expectedSha,
    contentSizeBytes: expectedSize,
  });
  try {
    await input.objectStore.put(inProgress, source);
    const stored = await input.objectStore.openRead(inProgress, input.auth);
    verifyStoredIntegrity(stored, { sha256: expectedSha, size: expectedSize });
    const verified: ArtifactBinaryPointer = { ...inProgress, storageKind: "OBJECT_STORAGE", migrationState: "VERIFIED" };
    return { ok: true, pointer: verified, switched: true, reason: "verified" };
  } catch (error) {
    return {
      ok: false,
      pointer: { ...input.pointer, migrationState: "FAILED" as MigrationState },
      switched: false,
      reason: error instanceof Error ? error.message : "migration_failed",
    };
  }
}

export function rollbackPointer(current: ArtifactBinaryPointer, legacy: ArtifactBinaryPointer): ArtifactBinaryPointer {
  return { ...legacy, storageKind: "LEGACY_RELATIONAL", migrationState: "ROLLED_BACK", objectKey: legacy.objectKey };
}
