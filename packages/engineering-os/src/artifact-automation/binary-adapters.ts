import {
  ARTIFACT_SIZE_POLICY,
  assertObjectKeyAuthorization,
  assertSizePolicy,
  createShortLivedSignedAccess,
  hashBytes,
  verifyStoredIntegrity,
  type ArtifactBinaryPointer,
  type ArtifactBinaryStore,
  type AuthorizedDownload,
} from "./binary-store";

/** Compatibility adapter over engineering_generated_artifacts.content_base64. */
export class LegacyRelationalArtifactBinaryStore implements ArtifactBinaryStore {
  constructor(private readonly rows = new Map<string, { pointer: ArtifactBinaryPointer; base64: string }>()) {}

  async put(pointer: ArtifactBinaryPointer, bytes: Uint8Array) {
    assertSizePolicy(bytes, ARTIFACT_SIZE_POLICY.generatedArtifactMaxBytes);
    const next: ArtifactBinaryPointer = {
      ...pointer,
      storageKind: "LEGACY_RELATIONAL",
      contentSizeBytes: bytes.byteLength,
      contentSha256: hashBytes(bytes),
      migrationState: pointer.migrationState === "IN_PROGRESS" ? pointer.migrationState : "NOT_STARTED",
    };
    this.rows.set(pointer.artifactId, { pointer: next, base64: Buffer.from(bytes).toString("base64") });
    return next;
  }

  async openRead(pointer: ArtifactBinaryPointer, auth: { tenantId: string; workspaceId: string; projectId: string }) {
    assertObjectKeyAuthorization(pointer, auth);
    const row = this.rows.get(pointer.artifactId);
    if (!row) throw new Error("artifact_binary_not_found");
    return Uint8Array.from(Buffer.from(row.base64, "base64"));
  }

  async head(pointer: ArtifactBinaryPointer) {
    const row = this.rows.get(pointer.artifactId);
    if (!row) return { exists: false, size: 0, sha256: "", contentType: pointer.contentType };
    return { exists: true, size: row.pointer.contentSizeBytes, sha256: row.pointer.contentSha256, contentType: row.pointer.contentType };
  }

  async exists(pointer: ArtifactBinaryPointer) {
    return this.rows.has(pointer.artifactId);
  }

  async generateAuthorizedDownload(pointer: ArtifactBinaryPointer, auth: { tenantId: string; workspaceId: string; projectId: string }): Promise<AuthorizedDownload> {
    const bytes = await this.openRead(pointer, auth);
    return { kind: "bytes", bytes, expiresAt: null, permanentLink: false };
  }

  compatibilityBase64(artifactId: string): string {
    return this.rows.get(artifactId)?.base64 ?? "";
  }

  loadFromBase64(pointer: ArtifactBinaryPointer, contentBase64: string) {
    this.rows.set(pointer.artifactId, { pointer, base64: contentBase64 });
  }
}

/** In-memory object-store fixture. Not a production storage platform. */
export class MemoryObjectArtifactBinaryStore implements ArtifactBinaryStore {
  constructor(private readonly objects = new Map<string, Uint8Array>()) {}

  async put(pointer: ArtifactBinaryPointer, bytes: Uint8Array) {
    assertSizePolicy(bytes, ARTIFACT_SIZE_POLICY.generatedArtifactMaxBytes);
    const sha = hashBytes(bytes);
    if (pointer.contentSha256 && pointer.contentSha256 !== sha) throw new Error("CONTENT_HASH_MISMATCH");
    this.objects.set(pointer.objectKey, Uint8Array.from(bytes));
    return { ...pointer, storageKind: "OBJECT_STORAGE" as const, contentSizeBytes: bytes.byteLength, contentSha256: sha };
  }

  async openRead(pointer: ArtifactBinaryPointer, auth: { tenantId: string; workspaceId: string; projectId: string }) {
    assertObjectKeyAuthorization(pointer, auth);
    const bytes = this.objects.get(pointer.objectKey);
    if (!bytes) throw new Error("artifact_binary_not_found");
    verifyStoredIntegrity(bytes, { sha256: pointer.contentSha256, size: pointer.contentSizeBytes });
    return bytes;
  }

  async head(pointer: ArtifactBinaryPointer) {
    const bytes = this.objects.get(pointer.objectKey);
    if (!bytes) return { exists: false, size: 0, sha256: "", contentType: pointer.contentType };
    return { exists: true, size: bytes.byteLength, sha256: hashBytes(bytes), contentType: pointer.contentType };
  }

  async exists(pointer: ArtifactBinaryPointer) {
    return this.objects.has(pointer.objectKey);
  }

  async generateAuthorizedDownload(pointer: ArtifactBinaryPointer, auth: { tenantId: string; workspaceId: string; projectId: string }): Promise<AuthorizedDownload> {
    await this.openRead(pointer, auth);
    return createShortLivedSignedAccess(pointer);
  }

  /** Test hook: corrupt stored bytes without changing pointer. */
  corrupt(objectKey: string) {
    const current = this.objects.get(objectKey);
    if (current) this.objects.set(objectKey, Uint8Array.from([1, 2, 3, 4]));
  }
}

/** Routes new writes to object storage while serving legacy relational bytes. */
export class RoutingArtifactBinaryStore implements ArtifactBinaryStore {
  constructor(
    private readonly legacy: LegacyRelationalArtifactBinaryStore,
    private readonly objectStore: ArtifactBinaryStore,
    private readonly writeKind: "OBJECT_STORAGE" | "LEGACY_RELATIONAL" = "OBJECT_STORAGE",
  ) {}

  async put(pointer: ArtifactBinaryPointer, bytes: Uint8Array) {
    if (this.writeKind === "LEGACY_RELATIONAL") return this.legacy.put(pointer, bytes);
    return this.objectStore.put({ ...pointer, storageKind: "OBJECT_STORAGE" }, bytes);
  }

  async openRead(pointer: ArtifactBinaryPointer, auth: { tenantId: string; workspaceId: string; projectId: string }) {
    if (pointer.storageKind === "LEGACY_RELATIONAL") return this.legacy.openRead(pointer, auth);
    return this.objectStore.openRead(pointer, auth);
  }

  async head(pointer: ArtifactBinaryPointer) {
    if (pointer.storageKind === "LEGACY_RELATIONAL") return this.legacy.head(pointer);
    return this.objectStore.head(pointer);
  }

  async exists(pointer: ArtifactBinaryPointer) {
    if (pointer.storageKind === "LEGACY_RELATIONAL") return this.legacy.exists(pointer);
    return this.objectStore.exists(pointer);
  }

  async generateAuthorizedDownload(pointer: ArtifactBinaryPointer, auth: { tenantId: string; workspaceId: string; projectId: string }) {
    if (pointer.storageKind === "LEGACY_RELATIONAL") return this.legacy.generateAuthorizedDownload(pointer, auth);
    return this.objectStore.generateAuthorizedDownload(pointer, auth);
  }

  loadFromBase64(pointer: ArtifactBinaryPointer, contentBase64: string) {
    this.legacy.loadFromBase64(pointer, contentBase64);
  }
}
