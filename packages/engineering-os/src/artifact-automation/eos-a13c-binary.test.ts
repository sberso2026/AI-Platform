import { describe, expect, it } from "vitest";
import { LegacyRelationalArtifactBinaryStore, MemoryObjectArtifactBinaryStore } from "./binary-adapters";
import { migrateLegacyArtifact, rollbackPointer } from "./binary-migration";
import {
  ARTIFACT_SIZE_POLICY,
  OBJECT_STORAGE_BACKEND,
  PUBLIC_BUCKET_REQUIRED,
  STORAGE_KINDS,
  assertObjectKeyAuthorization,
  assertSignedDownload,
  createShortLivedSignedAccess,
  hashBytes,
  pointerFromArtifact,
  serverObjectKey,
  type ArtifactBinaryPointer,
} from "./binary-store";

const TENANT = "tenant-a";
const WORKSPACE = "workspace-a";
const PROJECT_A = "project-a";
const PROJECT_B = "project-b";

function pointer(overrides: Partial<ArtifactBinaryPointer> = {}): ArtifactBinaryPointer {
  const artifactId = overrides.artifactId ?? "artifact-1";
  const projectId = overrides.projectId ?? PROJECT_A;
  return {
    tenantId: TENANT,
    workspaceId: WORKSPACE,
    projectId,
    artifactId,
    storageKind: "LEGACY_RELATIONAL",
    objectKey: serverObjectKey({ tenantId: TENANT, workspaceId: WORKSPACE, projectId, artifactId }),
    contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    contentSizeBytes: 0,
    contentSha256: "",
    storageVersion: 1,
    migrationState: "NOT_STARTED",
    ...overrides,
  };
}

describe("EOS-A13C ArtifactBinaryStore", () => {
  it("reports object storage honestly and keeps explicit storage kinds", () => {
    expect(OBJECT_STORAGE_BACKEND).toBe("EXISTING_IMPLEMENTED");
    expect(PUBLIC_BUCKET_REQUIRED).toBe(false);
    expect([...STORAGE_KINDS]).toEqual(["LEGACY_RELATIONAL", "OBJECT_STORAGE", "EXTERNAL_MANAGED"]);
    expect(ARTIFACT_SIZE_POLICY.stagingDefaultsOnly).toBe(true);
    expect(ARTIFACT_SIZE_POLICY.productionConfigurationRequired).toBe(true);
  });

  it("legacy adapter stores OpenXML bytes without exposing a public bucket", async () => {
    const store = new LegacyRelationalArtifactBinaryStore();
    const xlsx = Uint8Array.from(Buffer.from("PK\u0003\u0004xlsx-fixture"));
    const stored = await store.put(pointer(), xlsx);
    expect(stored.storageKind).toBe("LEGACY_RELATIONAL");
    const read = await store.openRead(stored, { tenantId: TENANT, workspaceId: WORKSPACE, projectId: PROJECT_A });
    expect(Buffer.from(read).toString("utf8")).toContain("xlsx-fixture");
    expect(hashBytes(read)).toBe(stored.contentSha256);
  });

  it("memory object store streams bytes without JSON/base64 and denys cross-project keys", async () => {
    const store = new MemoryObjectArtifactBinaryStore();
    const bytes = Uint8Array.from(Buffer.alloc(64 * 1024, 7));
    const stored = await store.put(pointer({ artifactId: "large-1" }), bytes);
    expect(JSON.stringify(Object.fromEntries(Object.entries(stored)))).not.toMatch(/contentBase64/);
    const read = await store.openRead(stored, { tenantId: TENANT, workspaceId: WORKSPACE, projectId: PROJECT_A });
    expect(read.byteLength).toBe(64 * 1024);
    await expect(
      store.openRead(stored, { tenantId: TENANT, workspaceId: WORKSPACE, projectId: PROJECT_B }),
    ).rejects.toThrow("OBJECT_KEY_SCOPE_DENIED");
    expect(() => assertObjectKeyAuthorization(stored, { tenantId: TENANT, workspaceId: WORKSPACE, projectId: PROJECT_B })).toThrow("OBJECT_KEY_SCOPE_DENIED");
  });

  it("fails closed on hash mismatch and does not switch the metadata pointer", async () => {
    const legacy = new LegacyRelationalArtifactBinaryStore();
    const objectStore = new MemoryObjectArtifactBinaryStore();
    const bytes = Uint8Array.from(Buffer.from("PK\u0003\u0004docx-fixture"));
    const source = await legacy.put(pointer({ artifactId: "mig-1" }), bytes);
    objectStore.corrupt = objectStore.corrupt.bind(objectStore);
    const originalPut = objectStore.put.bind(objectStore);
    objectStore.put = async (next, payload) => {
      const written = await originalPut(next, payload);
      objectStore.corrupt(written.objectKey);
      return written;
    };
    const failed = await migrateLegacyArtifact({
      legacy,
      objectStore,
      pointer: source,
      auth: { tenantId: TENANT, workspaceId: WORKSPACE, projectId: PROJECT_A },
    });
    expect(failed.ok).toBe(false);
    expect(failed.switched).toBe(false);
    expect(failed.pointer.storageKind).toBe("LEGACY_RELATIONAL");
    expect(failed.pointer.migrationState).toBe("FAILED");
  });

  it("migrates idempotently, verifies size/hash, and supports rollback without purge", async () => {
    const legacy = new LegacyRelationalArtifactBinaryStore();
    const objectStore = new MemoryObjectArtifactBinaryStore();
    const bytes = Uint8Array.from(Buffer.from("PK\u0003\u0004pptx-fixture"));
    const source = await legacy.put(pointer({ artifactId: "mig-ok" }), bytes);
    const first = await migrateLegacyArtifact({
      legacy,
      objectStore,
      pointer: source,
      auth: { tenantId: TENANT, workspaceId: WORKSPACE, projectId: PROJECT_A },
    });
    expect(first.ok).toBe(true);
    expect(first.switched).toBe(true);
    expect(first.pointer.storageKind).toBe("OBJECT_STORAGE");
    expect(first.pointer.migrationState).toBe("VERIFIED");
    const second = await migrateLegacyArtifact({
      legacy,
      objectStore,
      pointer: source,
      auth: { tenantId: TENANT, workspaceId: WORKSPACE, projectId: PROJECT_A },
    });
    expect(second.ok).toBe(true);
    const rolled = rollbackPointer(first.pointer, source);
    expect(rolled.storageKind).toBe("LEGACY_RELATIONAL");
    expect(rolled.migrationState).toBe("ROLLED_BACK");
    expect(await legacy.exists(source)).toBe(true);
  });

  it("rejects expired, wrong-object, cross-project, and permanent signed access", () => {
    const p = pointerFromArtifact({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT_A,
      id: "art-signed",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      sha256: "abc",
      byteSize: 12,
    });
    const signed = createShortLivedSignedAccess(p, 60_000);
    expect(signed.permanentLink).toBe(false);
    expect(() => createShortLivedSignedAccess(p, 24 * 60 * 60 * 1000)).toThrow("PERMANENT_SIGNED_LINK_PROHIBITED");
    expect(() => assertSignedDownload({
      expiresAt: signed.expiresAt,
      objectKey: signed.kind === "signed_url" ? signed.objectKey : p.objectKey,
      expectedObjectKey: p.objectKey,
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT_A,
      auth: { tenantId: TENANT, workspaceId: WORKSPACE, projectId: PROJECT_A },
      permanentLink: true,
    })).toThrow("PERMANENT_SIGNED_LINK_PROHIBITED");
    expect(() => assertSignedDownload({
      expiresAt: "2000-01-01T00:00:00.000Z",
      objectKey: p.objectKey,
      expectedObjectKey: p.objectKey,
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT_A,
      auth: { tenantId: TENANT, workspaceId: WORKSPACE, projectId: PROJECT_A },
    })).toThrow("SIGNED_URL_EXPIRED");
    expect(() => assertSignedDownload({
      expiresAt: signed.expiresAt,
      objectKey: "other-key",
      expectedObjectKey: p.objectKey,
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT_A,
      auth: { tenantId: TENANT, workspaceId: WORKSPACE, projectId: PROJECT_A },
    })).toThrow("SIGNED_URL_OBJECT_MISMATCH");
    expect(() => assertSignedDownload({
      expiresAt: signed.expiresAt,
      objectKey: p.objectKey,
      expectedObjectKey: p.objectKey,
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT_A,
      auth: { tenantId: TENANT, workspaceId: WORKSPACE, projectId: PROJECT_B },
    })).toThrow("OBJECT_KEY_SCOPE_DENIED");
  });
});
