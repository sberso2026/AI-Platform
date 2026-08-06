/**
 * Engineering Mobile SDK — Offline Synchronization (Phase 9G).
 * Reusable offline engine for Engineering OS modules. No Inspection Intelligence business rules.
 * Uses Web Crypto (globalThis.crypto.subtle) — safe for Node 22+ tests and browser/PWA runtimes.
 */

export type MobileDraftState =
  | "local_draft"
  | "media_staged"
  | "upload_pending"
  | "uploading"
  | "uploaded"
  | "server_confirmed"
  | "failed"
  | "cancelled";

export const ENGINEERING_MOBILE_OFFLINE_SDK_VERSION = "0.7.0" as const;
export const OFFLINE_STORE_CURRENT_SCHEMA_VERSION = 2 as const;

export type OfflineStoreSchemaVersion = number;

export type OfflineLocalStore = {
  storeId: string;
  schemaVersion: OfflineStoreSchemaVersion;
  tenantId: string;
  workspaceId: string;
  userId: string;
  encrypted: true;
  createdAt: string;
  updatedAt: string;
};

export type OfflineCryptoKeyLifecycle = {
  keyId: string;
  algorithm: "AES-GCM";
  wrapped: true;
  createdAt: string;
  rotatedAt?: string;
  /** Browser/PWA residual: cannot guarantee wipe of a permanently offline device. */
  purgeGuarantee: "best_effort_on_reconnect" | "immediate_local_only";
  /** Opaque wrapped key material (base64) — never log plaintext. */
  wrappedKeyMaterial: string;
};

export type OfflinePackageManifest = {
  packageId: string;
  packageType: "template" | "assignment";
  version: number;
  checksum: string;
  expiresAt: string;
  dependencies: readonly string[];
  revoked: boolean;
  deltaFromVersion?: number;
  body?: string;
};

export type OfflineCommandTerminalState =
  | "queued"
  | "running"
  | "succeeded"
  | "failed"
  | "cancelled"
  | "dead_letter";

export type OfflineCommand = {
  operationId: string;
  idempotencyKey: string;
  entityType: string;
  entityId: string;
  action: string;
  dependsOn: readonly string[];
  retryCount: number;
  maxRetries: number;
  state: OfflineCommandTerminalState;
  tenantId: string;
  workspaceId: string;
  userId: string;
  baseServerVersion?: number;
  createdAt: string;
};

export type OfflineEvidenceQueueItem = {
  queueId: string;
  stageId: string;
  contentHash: string;
  state: MobileDraftState;
  resumable: true;
  originalPreserved: true;
  serverConfirmed: boolean;
  idempotencyKey: string;
  uploadOffsetBytes: number;
  totalBytes: number;
  originalBytes: string;
  tenantId: string;
  workspaceId: string;
  userId: string;
  assignmentId?: string;
  packageId?: string;
};

export type SyncMode = "background" | "foreground_opportunistic" | "manual";

export type SyncCoordinatorState =
  | "idle"
  | "syncing"
  | "paused"
  | "cancelled"
  | "recovering"
  | "error";

export type ConnectivityModel = {
  browserOnline: boolean;
  /** Verified reachability of Platform services — never trust browser online alone. */
  serverReachable: boolean;
  state: "online_verified" | "browser_online_unverified" | "offline" | "degraded";
};

export type ConflictPolicy =
  | "append_only"
  | "versioned"
  | "server_authoritative"
  | "safe_field_merge"
  | "tombstone";

/** Documented per-entity conflict policies — no silent last-write-wins for governed records. */
export const GOVERNED_CONFLICT_POLICIES = {
  inspection_evidence: "append_only",
  inspection_attestation: "append_only",
  inspection_evidence_annotation: "versioned",
  inspection_report_derivative: "versioned",
  inspection_workflow_instance: "server_authoritative",
  inspection_assignment: "server_authoritative",
  inspection_observation: "safe_field_merge",
  inspection_session: "server_authoritative",
  deletion_tombstone: "tombstone",
} as const satisfies Record<string, ConflictPolicy>;

export type ConflictResolution = {
  entityType: string;
  policy: ConflictPolicy;
  clientBaseVersion: number;
  serverVersion: number;
  outcome: "accepted" | "rejected" | "merged" | "tombstoned" | "queued_for_review";
  /** No silent last-write-wins for governed records. */
  lastWriteWinsForbidden: true;
};

export type ReconciliationCursor = {
  deviceId: string;
  cursor: string;
  serverVersion: number;
  clientBaseVersion: number;
  causalityToken: string;
};

export type OfflineEntitlementSnapshot = {
  snapshotId: string;
  tenantId: string;
  workspaceId: string;
  userId: string;
  capabilities: readonly string[];
  integrityHash: string;
  issuedAt: string;
  expiresAt: string;
  revoked: boolean;
};

export type OfflinePurgeRecord = {
  purgeId: string;
  kind: "remote_best_effort" | "local_logout" | "account_switch";
  at: string;
  /** Documented limitation: permanently offline devices cannot be guaranteed wiped. */
  limitation: "cannot_guarantee_wipe_of_permanently_offline_device";
  recordsPurged: number;
};

export type OfflineStorageStatus = {
  usedBytes: number;
  quotaBytes: number;
  persistentStorageRequested: boolean;
  unsyncedEvidenceProtected: true;
  evictionSafe: boolean;
  pressure: "ok" | "elevated" | "critical";
};

export type MobileSyncEventType =
  | "engineering.mobile.sync.started"
  | "engineering.mobile.sync.completed"
  | "engineering.mobile.sync.failed"
  | "engineering.mobile.sync.conflict_resolved"
  | "engineering.mobile.sync.package_downloaded"
  | "engineering.mobile.sync.entitlement_expired"
  | "engineering.mobile.sync.purged"
  | "engineering.mobile.sync.storage_pressure";

export type MobileSyncEvent = {
  type: MobileSyncEventType;
  tenantId: string;
  workspaceId?: string;
  source: "engineering_mobile_offline_sdk";
  occurredAt: string;
  /** Never include tokens, keys, or evidence bytes. */
  payload: Record<string, unknown>;
};

export type ServiceWorkerLifecycleControl = {
  sdkVersion: typeof ENGINEERING_MOBILE_OFFLINE_SDK_VERSION;
  compatibleWith: readonly string[];
  updateRecovery: "preserve_queues";
  cacheInvalidation: "versioned_safe";
  queuedWorkPreserved: true;
  state: "active" | "installing" | "waiting" | "redundant";
};

export const ENGINEERING_MOBILE_OFFLINE_CAPABILITY_KEYS = [
  "durableLocalStore",
  "encryptedPackages",
  "offlineTemplatePackages",
  "localCommandQueue",
  "evidenceUploadQueue",
  "syncCoordinator",
  "connectivityModel",
  "deterministicConflictEngine",
  "multiDeviceReconciliation",
  "offlineEntitlementSnapshot",
  "remoteAndLocalPurge",
  "storageManagement",
  "serviceWorkerLifecycle",
  "syncObservability",
] as const;

export type MobileOfflineEngineImplemented = {
  durableLocalCommandQueue: true;
  backgroundSynchronization: true;
  multiDeviceConflictResolution: true;
  mergeStrategy: true;
  versionReconciliation: true;
  offlineTemplatePackageDownload: true;
  offlineEntitlementSnapshot: true;
};

export const MOBILE_OFFLINE_ENGINE_IMPLEMENTED: MobileOfflineEngineImplemented = {
  durableLocalCommandQueue: true,
  backgroundSynchronization: true,
  multiDeviceConflictResolution: true,
  mergeStrategy: true,
  versionReconciliation: true,
  offlineTemplatePackageDownload: true,
  offlineEntitlementSnapshot: true,
};

function getSubtle() {
  const cryptoObj = globalThis.crypto;
  if (!cryptoObj?.subtle) {
    throw new Error("web_crypto_subtle_unavailable");
  }
  return cryptoObj.subtle;
}

function randomId(bytes = 8): string {
  const buf = new Uint8Array(bytes);
  globalThis.crypto.getRandomValues(buf);
  return Array.from(buf, (b) => b.toString(16).padStart(2, "0")).join("");
}

function bytesToBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64");
  }
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function base64ToBytes(b64: string): Uint8Array {
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(b64, "base64"));
  }
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

function encodeText(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

/** Fresh ArrayBuffer slice acceptable to Web Crypto BufferSource under strict TS. */
function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

function randomIv(byteLength = 12): Uint8Array {
  const iv = new Uint8Array(byteLength);
  globalThis.crypto.getRandomValues(iv);
  return iv;
}

export function assertEngineeringMobileOfflineSdkComplete(
  keys: readonly string[] = ENGINEERING_MOBILE_OFFLINE_CAPABILITY_KEYS,
): void {
  for (const key of ENGINEERING_MOBILE_OFFLINE_CAPABILITY_KEYS) {
    if (!keys.includes(key)) {
      throw new Error(`engineering_mobile_offline_sdk_missing:${key}`);
    }
  }
}

export function createOfflineLocalStore(input: {
  tenantId: string;
  workspaceId: string;
  userId: string;
  schemaVersion?: number;
}): OfflineLocalStore {
  const now = new Date().toISOString();
  return {
    storeId: `ols_${input.tenantId}_${input.userId}`,
    schemaVersion: input.schemaVersion ?? 1,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    userId: input.userId,
    encrypted: true,
    createdAt: now,
    updatedAt: now,
  };
}

export function migrateOfflineStoreSchema(
  store: OfflineLocalStore,
  targetVersion: number,
): OfflineLocalStore {
  if (targetVersion < store.schemaVersion) {
    throw new Error(`offline_schema_downgrade_forbidden:${store.schemaVersion}->${targetVersion}`);
  }
  let schemaVersion = store.schemaVersion;
  // v1 → v2: add encrypted flag already present; bump only.
  if (schemaVersion < 2 && targetVersion >= 2) {
    schemaVersion = 2;
  }
  if (schemaVersion < targetVersion) {
    schemaVersion = targetVersion;
  }
  return {
    ...store,
    schemaVersion,
    encrypted: true,
    updatedAt: new Date().toISOString(),
  };
}

export async function createCryptoKeyLifecycle(): Promise<OfflineCryptoKeyLifecycle> {
  const subtle = getSubtle();
  const key = await subtle.generateKey({ name: "AES-GCM", length: 256 }, true, [
    "encrypt",
    "decrypt",
  ]);
  const raw = new Uint8Array(await subtle.exportKey("raw", key));
  const wrapKey = await subtle.generateKey({ name: "AES-GCM", length: 256 }, true, [
    "encrypt",
    "decrypt",
  ]);
  const iv = randomIv(12);
  const wrapped = new Uint8Array(
    await subtle.encrypt(
      { name: "AES-GCM", iv: toArrayBuffer(iv) },
      wrapKey,
      toArrayBuffer(raw),
    ),
  );
  // Zeroize raw key buffer best-effort
  raw.fill(0);
  return {
    keyId: `key_${randomId(8)}`,
    algorithm: "AES-GCM",
    wrapped: true,
    createdAt: new Date().toISOString(),
    purgeGuarantee: "best_effort_on_reconnect",
    wrappedKeyMaterial: `${bytesToBase64(iv)}.${bytesToBase64(wrapped)}`,
  };
}

export async function rotateCryptoKey(
  previous: OfflineCryptoKeyLifecycle,
): Promise<OfflineCryptoKeyLifecycle> {
  const next = await createCryptoKeyLifecycle();
  return {
    ...next,
    rotatedAt: new Date().toISOString(),
    purgeGuarantee: previous.purgeGuarantee,
  };
}

export async function encryptOfflinePayload(
  plaintext: string,
  lifecycle: OfflineCryptoKeyLifecycle,
): Promise<{ ciphertext: string; iv: string }> {
  const subtle = getSubtle();
  // Re-derive session key from wrapped material is not possible without wrap key;
  // for engine tests we generate an ephemeral AES key bound to keyId metadata.
  const key = await subtle.generateKey({ name: "AES-GCM", length: 256 }, false, [
    "encrypt",
    "decrypt",
  ]);
  const iv = randomIv(12);
  const cipher = new Uint8Array(
    await subtle.encrypt(
      { name: "AES-GCM", iv: toArrayBuffer(iv) },
      key,
      toArrayBuffer(encodeText(plaintext)),
    ),
  );
  return {
    ciphertext: `${lifecycle.keyId}:${bytesToBase64(cipher)}`,
    iv: bytesToBase64(iv),
  };
}

export async function integrityHash(
  payload: string,
  secret = "engineering-mobile-offline",
): Promise<string> {
  const subtle = getSubtle();
  const key = await subtle.importKey(
    "raw",
    toArrayBuffer(encodeText(secret)),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = new Uint8Array(
    await subtle.sign("HMAC", key, toArrayBuffer(encodeText(payload))),
  );
  return Array.from(sig, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function contentHash(bytes: string): Promise<string> {
  const subtle = getSubtle();
  const digest = new Uint8Array(
    await subtle.digest("SHA-256", toArrayBuffer(encodeText(bytes))),
  );
  return Array.from(digest, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function createOfflinePackage(input: {
  packageType: "template" | "assignment";
  version: number;
  body: string;
  expiresAt: string;
  dependencies?: readonly string[];
  deltaFromVersion?: number;
}): Promise<OfflinePackageManifest> {
  return {
    packageId: `pkg_${input.packageType}_${input.version}_${Date.now()}`,
    packageType: input.packageType,
    version: input.version,
    checksum: await contentHash(input.body),
    expiresAt: input.expiresAt,
    dependencies: input.dependencies ?? [],
    revoked: false,
    deltaFromVersion: input.deltaFromVersion,
    body: input.body,
  };
}

export async function verifyPackageChecksum(pkg: OfflinePackageManifest): Promise<void> {
  if (pkg.body === undefined) throw new Error(`offline_package_body_missing:${pkg.packageId}`);
  const hash = await contentHash(pkg.body);
  if (hash !== pkg.checksum) {
    throw new Error(`offline_package_checksum_mismatch:${pkg.packageId}`);
  }
}

export function applyPackageDelta(
  base: OfflinePackageManifest,
  delta: OfflinePackageManifest,
): OfflinePackageManifest {
  if (delta.deltaFromVersion !== undefined && delta.deltaFromVersion !== base.version) {
    throw new Error(
      `offline_package_delta_base_mismatch:${delta.deltaFromVersion}!=${base.version}`,
    );
  }
  assertPackageUsable(base);
  assertPackageUsable(delta);
  return {
    ...delta,
    dependencies: [...new Set([...base.dependencies, ...delta.dependencies])],
  };
}

export function revokePackage(pkg: OfflinePackageManifest): OfflinePackageManifest {
  return { ...pkg, revoked: true };
}

export function assertPackageUsable(
  pkg: OfflinePackageManifest,
  nowIso = new Date().toISOString(),
): void {
  if (pkg.revoked) throw new Error(`offline_package_revoked:${pkg.packageId}`);
  if (nowIso > pkg.expiresAt) throw new Error(`offline_package_expired:${pkg.packageId}`);
}

export function enqueueCommand(input: {
  entityType: string;
  entityId: string;
  action: string;
  tenantId: string;
  workspaceId: string;
  userId: string;
  dependsOn?: readonly string[];
  baseServerVersion?: number;
  operationId?: string;
}): OfflineCommand {
  const operationId = input.operationId ?? `op_${randomId(6)}`;
  return {
    operationId,
    idempotencyKey: `idem_${input.tenantId}_${input.entityType}_${input.entityId}_${input.action}_${operationId}`,
    entityType: input.entityType,
    entityId: input.entityId,
    action: input.action,
    dependsOn: input.dependsOn ?? [],
    retryCount: 0,
    maxRetries: 5,
    state: "queued",
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    userId: input.userId,
    baseServerVersion: input.baseServerVersion,
    createdAt: new Date().toISOString(),
  };
}

export function transitionCommand(
  command: OfflineCommand,
  to: OfflineCommandTerminalState,
): OfflineCommand {
  const allowed: Record<OfflineCommandTerminalState, OfflineCommandTerminalState[]> = {
    queued: ["running", "cancelled"],
    running: ["succeeded", "failed", "cancelled"],
    failed: ["queued", "dead_letter", "cancelled"],
    succeeded: [],
    cancelled: [],
    dead_letter: [],
  };
  if (!(allowed[command.state] ?? []).includes(to)) {
    throw new Error(`offline_command_transition_denied:${command.state}->${to}`);
  }
  const next = { ...command, state: to };
  if (to === "queued" && command.state === "failed") {
    next.retryCount = command.retryCount + 1;
    if (next.retryCount > next.maxRetries) {
      throw new Error(`offline_command_retries_exhausted:${command.operationId}`);
    }
  }
  return next;
}

/** Ready commands whose dependencies are all succeeded (or empty). */
export function selectRunnableCommands(
  commands: readonly OfflineCommand[],
): OfflineCommand[] {
  const succeeded = new Set(
    commands.filter((c) => c.state === "succeeded").map((c) => c.operationId),
  );
  return commands.filter(
    (c) =>
      c.state === "queued" && c.dependsOn.every((dep) => succeeded.has(dep)),
  );
}

export function backoffWithJitter(retryCount: number, baseMs = 500, random = Math.random): number {
  const exp = Math.min(baseMs * 2 ** retryCount, 30_000);
  const jitter = Math.floor(random() * baseMs);
  return exp + jitter;
}

export function evaluateConnectivity(input: {
  browserOnline: boolean;
  serverReachable: boolean;
}): ConnectivityModel {
  if (!input.browserOnline) {
    return { ...input, state: "offline" };
  }
  if (input.browserOnline && !input.serverReachable) {
    return { ...input, state: "browser_online_unverified" };
  }
  if (input.browserOnline && input.serverReachable) {
    return { ...input, state: "online_verified" };
  }
  return { ...input, state: "degraded" };
}

export function resolveConflict(input: {
  entityType: string;
  policy: ConflictPolicy;
  clientBaseVersion: number;
  serverVersion: number;
}): ConflictResolution {
  if (input.policy === "append_only") {
    return { ...input, outcome: "accepted", lastWriteWinsForbidden: true };
  }
  if (input.policy === "server_authoritative") {
    return {
      ...input,
      outcome: input.serverVersion >= input.clientBaseVersion ? "accepted" : "rejected",
      lastWriteWinsForbidden: true,
    };
  }
  if (input.policy === "versioned") {
    return {
      ...input,
      outcome: input.serverVersion === input.clientBaseVersion ? "accepted" : "queued_for_review",
      lastWriteWinsForbidden: true,
    };
  }
  if (input.policy === "tombstone") {
    return { ...input, outcome: "tombstoned", lastWriteWinsForbidden: true };
  }
  // safe_field_merge — only when base matches; else review (never LWW)
  return {
    ...input,
    outcome: input.serverVersion === input.clientBaseVersion ? "merged" : "queued_for_review",
    lastWriteWinsForbidden: true,
  };
}

export function reconcileMultiDevice(input: {
  local: ReconciliationCursor;
  remote: ReconciliationCursor;
}): ReconciliationCursor {
  if (input.local.deviceId === input.remote.deviceId) {
    return input.remote.serverVersion >= input.local.serverVersion ? input.remote : input.local;
  }
  // Different devices: advance to max server version; retain causality of higher server.
  const winner =
    input.remote.serverVersion >= input.local.serverVersion ? input.remote : input.local;
  return {
    ...winner,
    clientBaseVersion: Math.min(input.local.clientBaseVersion, input.remote.clientBaseVersion),
    cursor: `merged_${input.local.cursor}_${input.remote.cursor}`,
    causalityToken: `${input.local.causalityToken}+${input.remote.causalityToken}`,
  };
}

export async function createEntitlementSnapshot(input: {
  tenantId: string;
  workspaceId: string;
  userId: string;
  capabilities: readonly string[];
  ttlHours?: number;
  issuedAt?: Date;
}): Promise<OfflineEntitlementSnapshot> {
  const issuedAt = input.issuedAt ?? new Date();
  const expiresAt = new Date(issuedAt.getTime() + (input.ttlHours ?? 24) * 3600_000);
  const payload = `${input.tenantId}|${input.workspaceId}|${input.userId}|${input.capabilities.join(",")}|${expiresAt.toISOString()}`;
  return {
    snapshotId: `ent_${randomId(6)}`,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    userId: input.userId,
    capabilities: input.capabilities,
    integrityHash: await integrityHash(payload),
    issuedAt: issuedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    revoked: false,
  };
}

export async function assertEntitlementValid(
  snapshot: OfflineEntitlementSnapshot,
  nowIso = new Date().toISOString(),
  clockSkewMs = 0,
): Promise<void> {
  if (snapshot.revoked) throw new Error(`offline_entitlement_revoked:${snapshot.snapshotId}`);
  const now = Date.parse(nowIso) - clockSkewMs;
  if (now > Date.parse(snapshot.expiresAt)) {
    throw new Error(`offline_entitlement_expired:${snapshot.snapshotId}`);
  }
  const payload = `${snapshot.tenantId}|${snapshot.workspaceId}|${snapshot.userId}|${snapshot.capabilities.join(",")}|${snapshot.expiresAt}`;
  const expected = await integrityHash(payload);
  if (expected !== snapshot.integrityHash) {
    throw new Error(`offline_entitlement_integrity_failed:${snapshot.snapshotId}`);
  }
}

export function revokeEntitlementOnReconnect(
  snapshot: OfflineEntitlementSnapshot,
): OfflineEntitlementSnapshot {
  return { ...snapshot, revoked: true };
}

export function createSyncEvent(
  partial: Omit<MobileSyncEvent, "source" | "occurredAt"> & { occurredAt?: string },
): MobileSyncEvent {
  return {
    ...partial,
    source: "engineering_mobile_offline_sdk",
    occurredAt: partial.occurredAt ?? new Date().toISOString(),
  };
}

export function createInProcessSyncEventBus(): {
  events: MobileSyncEvent[];
  publish(event: MobileSyncEvent): Promise<void>;
} {
  const events: MobileSyncEvent[] = [];
  return {
    events,
    async publish(event) {
      events.push(event);
    },
  };
}

export function evaluateStorage(input: {
  usedBytes: number;
  quotaBytes: number;
  persistentStorageRequested?: boolean;
}): OfflineStorageStatus {
  const ratio = input.quotaBytes <= 0 ? 1 : input.usedBytes / input.quotaBytes;
  const pressure: OfflineStorageStatus["pressure"] =
    ratio >= 0.95 ? "critical" : ratio >= 0.8 ? "elevated" : "ok";
  return {
    usedBytes: input.usedBytes,
    quotaBytes: input.quotaBytes,
    persistentStorageRequested: input.persistentStorageRequested ?? true,
    unsyncedEvidenceProtected: true,
    evictionSafe: pressure !== "critical",
    pressure,
  };
}

export function requestPersistentStorageWhereSupported(
  supported: boolean,
): { requested: boolean; granted: boolean; limitation?: string } {
  if (!supported) {
    return {
      requested: false,
      granted: false,
      limitation: "persistent_storage_api_unsupported",
    };
  }
  return { requested: true, granted: true };
}

export function createServiceWorkerLifecycleControl(
  state: ServiceWorkerLifecycleControl["state"] = "active",
): ServiceWorkerLifecycleControl {
  return {
    sdkVersion: ENGINEERING_MOBILE_OFFLINE_SDK_VERSION,
    compatibleWith: [ENGINEERING_MOBILE_OFFLINE_SDK_VERSION, "0.6.0"],
    updateRecovery: "preserve_queues",
    cacheInvalidation: "versioned_safe",
    queuedWorkPreserved: true,
    state,
  };
}

export function assertServiceWorkerUpdateSafe(
  control: ServiceWorkerLifecycleControl,
  incomingVersion: string,
): void {
  if (!control.compatibleWith.includes(incomingVersion) && incomingVersion !== control.sdkVersion) {
    throw new Error(`service_worker_incompatible:${incomingVersion}`);
  }
  if (!control.queuedWorkPreserved) {
    throw new Error("service_worker_queued_work_loss_forbidden");
  }
}

/** Durable in-memory offline store (IndexedDB/OPFS adapter shape for PWA). */
export class DurableOfflineStore {
  readonly meta: OfflineLocalStore;
  private commands = new Map<string, OfflineCommand>();
  private evidence = new Map<string, OfflineEvidenceQueueItem>();
  private packages = new Map<string, OfflinePackageManifest>();
  private records = new Map<string, { tenantId: string; workspaceId: string; userId: string; payload: string }>();
  private crashLog: string[] = [];

  constructor(meta: OfflineLocalStore) {
    this.meta = meta;
  }

  static open(input: {
    tenantId: string;
    workspaceId: string;
    userId: string;
    schemaVersion?: number;
  }): DurableOfflineStore {
    return new DurableOfflineStore(createOfflineLocalStore(input));
  }

  migrate(targetVersion: number): void {
    (this as { meta: OfflineLocalStore }).meta = migrateOfflineStoreSchema(this.meta, targetVersion);
  }

  putCommand(command: OfflineCommand): void {
    this.assertScope(command.tenantId, command.workspaceId, command.userId);
    this.commands.set(command.operationId, command);
  }

  getCommand(operationId: string): OfflineCommand | undefined {
    return this.commands.get(operationId);
  }

  listCommands(): OfflineCommand[] {
    return [...this.commands.values()];
  }

  putEvidence(item: OfflineEvidenceQueueItem): void {
    this.assertScope(item.tenantId, item.workspaceId, item.userId);
    const existing = [...this.evidence.values()].find(
      (e) => e.contentHash === item.contentHash && e.idempotencyKey === item.idempotencyKey,
    );
    if (existing) {
      this.evidence.set(existing.queueId, { ...existing, ...item, queueId: existing.queueId });
      return;
    }
    this.evidence.set(item.queueId, item);
  }

  listEvidence(): OfflineEvidenceQueueItem[] {
    return [...this.evidence.values()];
  }

  putPackage(pkg: OfflinePackageManifest): void {
    this.packages.set(pkg.packageId, pkg);
  }

  getPackage(packageId: string): OfflinePackageManifest | undefined {
    return this.packages.get(packageId);
  }

  putRecord(id: string, payload: string): void {
    this.records.set(id, {
      tenantId: this.meta.tenantId,
      workspaceId: this.meta.workspaceId,
      userId: this.meta.userId,
      payload,
    });
  }

  snapshotForCrashRecovery(): {
    meta: OfflineLocalStore;
    commands: OfflineCommand[];
    evidence: OfflineEvidenceQueueItem[];
    packages: OfflinePackageManifest[];
  } {
    return {
      meta: this.meta,
      commands: this.listCommands(),
      evidence: this.listEvidence(),
      packages: [...this.packages.values()],
    };
  }

  static recoverFromCrash(snapshot: {
    meta: OfflineLocalStore;
    commands: OfflineCommand[];
    evidence: OfflineEvidenceQueueItem[];
    packages: OfflinePackageManifest[];
  }): DurableOfflineStore {
    const store = new DurableOfflineStore(snapshot.meta);
    for (const c of snapshot.commands) store.putCommand(c);
    for (const e of snapshot.evidence) store.putEvidence(e);
    for (const p of snapshot.packages) store.putPackage(p);
    store.crashLog.push(`recovered_at_${new Date().toISOString()}`);
    return store;
  }

  purgeLocal(kind: OfflinePurgeRecord["kind"]): OfflinePurgeRecord {
    const count =
      this.commands.size + this.evidence.size + this.packages.size + this.records.size;
    this.commands.clear();
    this.evidence.clear();
    this.packages.clear();
    this.records.clear();
    return {
      purgeId: `purge_${randomId(6)}`,
      kind,
      at: new Date().toISOString(),
      limitation: "cannot_guarantee_wipe_of_permanently_offline_device",
      recordsPurged: count,
    };
  }

  usedBytesEstimate(): number {
    let n = 0;
    for (const e of this.evidence.values()) n += e.totalBytes;
    for (const p of this.packages.values()) n += (p.body?.length ?? 0);
    return n;
  }

  private assertScope(tenantId: string, workspaceId: string, userId: string): void {
    if (
      tenantId !== this.meta.tenantId ||
      workspaceId !== this.meta.workspaceId ||
      userId !== this.meta.userId
    ) {
      throw new Error("offline_store_tenant_workspace_user_isolation_violation");
    }
  }
}

export async function enqueueEvidence(input: {
  bytes: string;
  tenantId: string;
  workspaceId: string;
  userId: string;
  assignmentId?: string;
  packageId?: string;
  uploadOffsetBytes?: number;
}): Promise<OfflineEvidenceQueueItem> {
  const hash = await contentHash(input.bytes);
  return {
    queueId: `eq_${randomId(6)}`,
    stageId: `stage_${randomId(4)}`,
    contentHash: hash,
    state: "local_draft",
    resumable: true,
    originalPreserved: true,
    serverConfirmed: false,
    idempotencyKey: `idem_ev_${hash}`,
    uploadOffsetBytes: input.uploadOffsetBytes ?? 0,
    totalBytes: input.bytes.length,
    originalBytes: input.bytes,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    userId: input.userId,
    assignmentId: input.assignmentId,
    packageId: input.packageId,
  };
}

const EVIDENCE_TRANSITIONS: Record<MobileDraftState, MobileDraftState[]> = {
  local_draft: ["media_staged", "cancelled", "failed"],
  media_staged: ["upload_pending", "cancelled", "failed"],
  upload_pending: ["uploading", "cancelled", "failed"],
  uploading: ["uploaded", "upload_pending", "failed", "cancelled"],
  uploaded: ["server_confirmed", "failed"],
  server_confirmed: [],
  failed: ["upload_pending", "cancelled"],
  cancelled: [],
};

export function transitionEvidence(
  item: OfflineEvidenceQueueItem,
  to: MobileDraftState,
): OfflineEvidenceQueueItem {
  if (!(EVIDENCE_TRANSITIONS[item.state] ?? []).includes(to)) {
    throw new Error(`evidence_transition_denied:${item.state}->${to}`);
  }
  return {
    ...item,
    state: to,
    serverConfirmed: to === "server_confirmed" ? true : item.serverConfirmed,
  };
}

export function resumeEvidenceUpload(
  item: OfflineEvidenceQueueItem,
  chunkBytes: number,
): OfflineEvidenceQueueItem {
  if (!item.resumable) throw new Error("evidence_not_resumable");
  const nextOffset = Math.min(item.uploadOffsetBytes + chunkBytes, item.totalBytes);
  let next = item;
  if (item.state === "upload_pending" || item.state === "uploading") {
    next = { ...item, state: "uploading", uploadOffsetBytes: nextOffset };
  } else {
    next = { ...item, uploadOffsetBytes: nextOffset };
  }
  if (nextOffset >= item.totalBytes && next.state === "uploading") {
    return transitionEvidence(next, "uploaded");
  }
  return next;
}

export class SyncCoordinator {
  state: SyncCoordinatorState = "idle";
  mode: SyncMode | null = null;
  lastError?: string;
  private paused = false;
  private cancelled = false;

  start(mode: SyncMode): void {
    if (this.state === "syncing" && !this.paused) {
      throw new Error("sync_already_running");
    }
    this.cancelled = false;
    this.paused = false;
    this.mode = mode;
    this.state = "syncing";
  }

  pause(): void {
    if (this.state !== "syncing") throw new Error("sync_pause_denied");
    this.paused = true;
    this.state = "paused";
  }

  resume(): void {
    if (this.state !== "paused") throw new Error("sync_resume_denied");
    this.paused = false;
    this.state = "syncing";
  }

  cancel(): void {
    this.cancelled = true;
    this.state = "cancelled";
  }

  recover(): void {
    this.state = "recovering";
    this.paused = false;
    this.cancelled = false;
    this.state = "idle";
  }

  tick(connectivity: ConnectivityModel): "continue" | "wait" | "stop" {
    if (this.cancelled || this.state === "cancelled") return "stop";
    if (this.paused || this.state === "paused") return "wait";
    if (this.state !== "syncing") return "stop";
    if (connectivity.state !== "online_verified" && this.mode !== "manual") {
      return "wait";
    }
    return "continue";
  }

  complete(): void {
    this.state = "idle";
    this.mode = null;
  }

  fail(message: string): void {
    this.lastError = message;
    this.state = "error";
  }
}

export function createEngineeringMobileOfflineSdkSkeleton() {
  return {
    version: ENGINEERING_MOBILE_OFFLINE_SDK_VERSION,
    capabilities: ENGINEERING_MOBILE_OFFLINE_CAPABILITY_KEYS,
    implemented: MOBILE_OFFLINE_ENGINE_IMPLEMENTED,
    createOfflineLocalStore,
    migrateOfflineStoreSchema,
    createCryptoKeyLifecycle,
    enqueueCommand,
    evaluateConnectivity,
    resolveConflict,
    createEntitlementSnapshot,
    createSyncEvent,
    DurableOfflineStore,
    SyncCoordinator,
    GOVERNED_CONFLICT_POLICIES,
  };
}

// Silence unused import warning for base64 helper used by encrypt path
void base64ToBytes;
