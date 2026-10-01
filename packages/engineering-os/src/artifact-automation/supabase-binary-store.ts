import type { SupabaseClient } from "@rtb/database";
import {
  ARTIFACT_SIZE_POLICY,
  ENGINEERING_ARTIFACT_BUCKET,
  MAX_SIGNED_URL_TTL_MS,
  assertObjectKeyAuthorization,
  assertSizePolicy,
  hashBytes,
  verifyStoredIntegrity,
  type ArtifactBinaryPointer,
  type ArtifactBinaryStore,
  type AuthorizedDownload,
} from "./binary-store";

type StorageClient = {
  storage: {
    from(bucket: string): {
      upload(
        path: string,
        body: Buffer | Uint8Array,
        options?: { contentType?: string; upsert?: boolean },
      ): Promise<{ error: { message: string } | null }>;
      download(path: string): Promise<{ data: Blob | ArrayBuffer | Uint8Array | null; error: { message: string } | null }>;
      createSignedUrl(
        path: string,
        expiresIn: number,
      ): Promise<{ data: { signedUrl: string } | null; error: { message: string } | null }>;
    };
  };
};

async function toBytes(data: Blob | ArrayBuffer | Uint8Array): Promise<Uint8Array> {
  if (data instanceof Uint8Array) return data;
  if (data instanceof ArrayBuffer) return new Uint8Array(data);
  const buffer = await data.arrayBuffer();
  return new Uint8Array(buffer);
}

/** Private generated-artifact store. Distinct from PI engineering-documents. Server-mediated. */
export class SupabaseArtifactBinaryStore implements ArtifactBinaryStore {
  constructor(
    private readonly client: StorageClient,
    private readonly bucket = ENGINEERING_ARTIFACT_BUCKET,
  ) {}

  static fromSupabase(client: SupabaseClient, bucket = ENGINEERING_ARTIFACT_BUCKET) {
    return new SupabaseArtifactBinaryStore(client as unknown as StorageClient, bucket);
  }

  async put(pointer: ArtifactBinaryPointer, bytes: Uint8Array) {
    assertSizePolicy(bytes, ARTIFACT_SIZE_POLICY.generatedArtifactMaxBytes);
    if (pointer.objectKey.includes("..") || pointer.objectKey.startsWith("/")) throw new Error("OBJECT_KEY_SCOPE_DENIED");
    const sha = hashBytes(bytes);
    if (pointer.contentSha256 && pointer.contentSha256 !== sha) throw new Error("CONTENT_HASH_MISMATCH");
    const uploaded = await this.client.storage.from(this.bucket).upload(pointer.objectKey, Buffer.from(bytes), {
      contentType: pointer.contentType,
      upsert: false,
    });
    if (uploaded.error && !/already exists|duplicate/i.test(uploaded.error.message)) {
      throw new Error(uploaded.error.message);
    }
    const stored = await this.client.storage.from(this.bucket).download(pointer.objectKey);
    if (stored.error || !stored.data) throw new Error(stored.error?.message ?? "artifact_binary_not_found");
    const read = await toBytes(stored.data);
    verifyStoredIntegrity(read, { sha256: sha, size: bytes.byteLength });
    return {
      ...pointer,
      storageKind: "OBJECT_STORAGE" as const,
      contentSizeBytes: bytes.byteLength,
      contentSha256: sha,
      migrationState: pointer.migrationState === "IN_PROGRESS" ? "IN_PROGRESS" as const : pointer.migrationState,
    };
  }

  async openRead(pointer: ArtifactBinaryPointer, auth: { tenantId: string; workspaceId: string; projectId: string }) {
    assertObjectKeyAuthorization(pointer, auth);
    const stored = await this.client.storage.from(this.bucket).download(pointer.objectKey);
    if (stored.error || !stored.data) throw new Error(stored.error?.message ?? "artifact_binary_not_found");
    const bytes = await toBytes(stored.data);
    if (pointer.contentSha256 && pointer.contentSizeBytes) {
      verifyStoredIntegrity(bytes, { sha256: pointer.contentSha256, size: pointer.contentSizeBytes });
    }
    return bytes;
  }

  async head(pointer: ArtifactBinaryPointer) {
    const stored = await this.client.storage.from(this.bucket).download(pointer.objectKey);
    if (stored.error || !stored.data) return { exists: false, size: 0, sha256: "", contentType: pointer.contentType };
    const bytes = await toBytes(stored.data);
    return { exists: true, size: bytes.byteLength, sha256: hashBytes(bytes), contentType: pointer.contentType };
  }

  async exists(pointer: ArtifactBinaryPointer) {
    return (await this.head(pointer)).exists;
  }

  async generateAuthorizedDownload(
    pointer: ArtifactBinaryPointer,
    auth: { tenantId: string; workspaceId: string; projectId: string },
  ): Promise<AuthorizedDownload> {
    assertObjectKeyAuthorization(pointer, auth);
    const ttlSeconds = Math.floor(MAX_SIGNED_URL_TTL_MS / 1000);
    const signed = await this.client.storage.from(this.bucket).createSignedUrl(pointer.objectKey, ttlSeconds);
    if (signed.error || !signed.data?.signedUrl) throw new Error(signed.error?.message ?? "SIGNED_URL_DENIED");
    return {
      kind: "signed_url",
      href: signed.data.signedUrl,
      expiresAt: new Date(Date.now() + MAX_SIGNED_URL_TTL_MS).toISOString(),
      objectKey: pointer.objectKey,
      permanentLink: false,
    };
  }
}
