import { createHash } from "node:crypto";

export const STORAGE_KINDS = ["LEGACY_RELATIONAL", "OBJECT_STORAGE", "EXTERNAL_MANAGED"] as const;
export type StorageKind = (typeof STORAGE_KINDS)[number];

export const MIGRATION_STATES = ["NOT_STARTED", "IN_PROGRESS", "VERIFIED", "FAILED", "ROLLED_BACK"] as const;
export type MigrationState = (typeof MIGRATION_STATES)[number];

export const ARTIFACT_SIZE_POLICY = {
  generatedArtifactMaxBytes: 25 * 1024 * 1024,
  templateMaxBytes: 10 * 1024 * 1024,
  connectorOnDemandMaxBytes: 25 * 1024 * 1024,
  returnedUploadMaxBytes: 25 * 1024 * 1024,
  productionConfigurationRequired: true,
  stagingDefaultsOnly: true,
} as const;

export const OBJECT_STORAGE_BACKEND = "CONTRACT_ONLY" as const;
export const OBJECT_STORAGE_PROVIDER = "NONE_FOR_GENERATED_ARTIFACTS; PI document bucket engineering-documents is a different domain";
export const PUBLIC_BUCKET_REQUIRED = false;

export type ArtifactBinaryPointer = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  artifactId: string;
  storageKind: StorageKind;
  objectKey: string;
  contentType: string;
  contentSizeBytes: number;
  contentSha256: string;
  storageVersion: number;
  migrationState: MigrationState;
};

export type AuthorizedDownload =
  | { kind: "bytes"; bytes: Uint8Array; expiresAt: null; permanentLink: false }
  | { kind: "signed_url"; href: string; expiresAt: string; objectKey: string; permanentLink: false };

export interface ArtifactBinaryStore {
  put(pointer: ArtifactBinaryPointer, bytes: Uint8Array): Promise<ArtifactBinaryPointer>;
  openRead(pointer: ArtifactBinaryPointer, auth: { tenantId: string; workspaceId: string; projectId: string }): Promise<Uint8Array>;
  head(pointer: ArtifactBinaryPointer): Promise<{ exists: boolean; size: number; sha256: string; contentType: string }>;
  exists(pointer: ArtifactBinaryPointer): Promise<boolean>;
  generateAuthorizedDownload(
    pointer: ArtifactBinaryPointer,
    auth: { tenantId: string; workspaceId: string; projectId: string },
  ): Promise<AuthorizedDownload>;
}

export const MAX_SIGNED_URL_TTL_MS = 5 * 60 * 1000;
export const PUBLIC_BUCKET_FORBIDDEN = true;

export function hashBytes(bytes: Uint8Array | Buffer): string {
  return createHash("sha256").update(bytes).digest("hex");
}

export function verifyStoredIntegrity(bytes: Uint8Array, expected: { sha256: string; size: number }): void {
  if (bytes.byteLength !== expected.size) throw new Error("CONTENT_SIZE_MISMATCH");
  if (hashBytes(bytes) !== expected.sha256) throw new Error("CONTENT_HASH_MISMATCH");
}

export function createShortLivedSignedAccess(pointer: ArtifactBinaryPointer, ttlMs = MAX_SIGNED_URL_TTL_MS): AuthorizedDownload {
  if (ttlMs > MAX_SIGNED_URL_TTL_MS || ttlMs <= 0) throw new Error("PERMANENT_SIGNED_LINK_PROHIBITED");
  const expiresAt = new Date(Date.now() + ttlMs).toISOString();
  return {
    kind: "signed_url",
    href: `eos-signed://${pointer.objectKey}?exp=${encodeURIComponent(expiresAt)}`,
    expiresAt,
    objectKey: pointer.objectKey,
    permanentLink: false,
  };
}

export function assertSignedDownload(input: {
  expiresAt: string | null;
  objectKey: string;
  expectedObjectKey: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  auth: { tenantId: string; workspaceId: string; projectId: string };
  permanentLink?: boolean;
  nowMs?: number;
}): void {
  if (input.permanentLink) throw new Error("PERMANENT_SIGNED_LINK_PROHIBITED");
  if (!input.expiresAt) throw new Error("SIGNED_URL_EXPIRED");
  const now = input.nowMs ?? Date.now();
  if (Date.parse(input.expiresAt) <= now) throw new Error("SIGNED_URL_EXPIRED");
  if (input.objectKey !== input.expectedObjectKey) throw new Error("SIGNED_URL_OBJECT_MISMATCH");
  if (input.tenantId !== input.auth.tenantId || input.workspaceId !== input.auth.workspaceId || input.projectId !== input.auth.projectId) {
    throw new Error("OBJECT_KEY_SCOPE_DENIED");
  }
}

export function serverObjectKey(input: {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  artifactId: string;
  storageVersion?: number;
}): string {
  const version = input.storageVersion ?? 1;
  return `eos/artifacts/${input.tenantId}/${input.workspaceId}/${input.projectId}/${input.artifactId}/v${version}`;
}

export function assertObjectKeyAuthorization(
  pointer: ArtifactBinaryPointer,
  auth: { tenantId: string; workspaceId: string; projectId: string },
): void {
  if (pointer.tenantId !== auth.tenantId || pointer.workspaceId !== auth.workspaceId || pointer.projectId !== auth.projectId) {
    throw new Error("OBJECT_KEY_SCOPE_DENIED");
  }
  const expectedPrefix = `eos/artifacts/${auth.tenantId}/${auth.workspaceId}/${auth.projectId}/`;
  if (!pointer.objectKey.startsWith(expectedPrefix) || pointer.objectKey.includes("..")) {
    throw new Error("OBJECT_KEY_SCOPE_DENIED");
  }
}

export function assertSizePolicy(bytes: Uint8Array, maxBytes: number): void {
  if (bytes.byteLength > maxBytes) throw new Error("content_too_large");
}

export function pointerFromArtifact(row: {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  id: string;
  mimeType: string;
  sha256: string;
  byteSize: number;
  storageKind?: StorageKind;
  objectKey?: string | null;
  contentSizeBytes?: number | null;
  contentSha256?: string | null;
  contentType?: string | null;
  storageVersion?: number | null;
  migrationState?: MigrationState;
}): ArtifactBinaryPointer {
  return {
    tenantId: row.tenantId,
    workspaceId: row.workspaceId,
    projectId: row.projectId,
    artifactId: row.id,
    storageKind: row.storageKind ?? "LEGACY_RELATIONAL",
    objectKey: row.objectKey ?? serverObjectKey({ tenantId: row.tenantId, workspaceId: row.workspaceId, projectId: row.projectId, artifactId: row.id, storageVersion: row.storageVersion ?? 1 }),
    contentType: row.contentType ?? row.mimeType,
    contentSizeBytes: row.contentSizeBytes ?? row.byteSize,
    contentSha256: row.contentSha256 ?? row.sha256,
    storageVersion: row.storageVersion ?? 1,
    migrationState: row.migrationState ?? "NOT_STARTED",
  };
}
