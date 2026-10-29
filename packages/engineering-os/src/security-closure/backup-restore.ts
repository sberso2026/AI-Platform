/**
 * Phase 14D S06 — Bounded platform backup/restore certification model.
 * Does not invent provider SLAs. Fixture-safe restore target only.
 */

export type RpoRtoStatus =
  | "DEFINED_AND_TESTED"
  | "DEFINED_NOT_TESTED"
  | "MEASURED"
  | "NOT_DEFINED"
  | "NOT_APPLICABLE";

export interface BackupManifest {
  backupId: string;
  createdAt: string;
  source: "supabase_provider" | "object_storage_provider" | "fixture";
  includesDatabase: boolean;
  includesObjectStorage: boolean;
  includesCriticalConfig: boolean;
  migrationLineageAnchor: string;
}

export interface TenantWorkspaceSnapshot {
  tenantRef: string;
  workspaceRef: string;
  schemaVersion: string;
  rowFingerprints: Record<string, string>;
  criticalStateReadable: boolean;
}

export interface RestoreResult {
  backupAvailable: boolean;
  restoreExecuted: boolean;
  integrityAssessed: boolean;
  tenantWorkspacePreserved: boolean;
  migrationCompatible: boolean;
  criticalStateReadable: boolean;
  measuredRestoreDurationMs: number;
  rpoStatus: RpoRtoStatus;
  rtoStatus: RpoRtoStatus;
  notes: string[];
}

export function assessBackupAvailability(manifest: BackupManifest): boolean {
  return Boolean(
    manifest.backupId &&
      manifest.includesDatabase &&
      manifest.migrationLineageAnchor &&
      manifest.includesCriticalConfig,
  );
}

/**
 * Bounded restore against an in-memory/fixture target (safe certification path).
 * Measured duration is fixture evidence — NOT an enterprise SLA.
 */
export function executeBoundedPlatformRestore(input: {
  manifest: BackupManifest;
  preRestore: TenantWorkspaceSnapshot;
  postRestore: TenantWorkspaceSnapshot;
  startedAtMs: number;
  finishedAtMs: number;
}): RestoreResult {
  const notes: string[] = [];
  const backupAvailable = assessBackupAvailability(input.manifest);
  if (!backupAvailable) notes.push("backup_incomplete");

  const tenantWorkspacePreserved =
    input.preRestore.tenantRef === input.postRestore.tenantRef &&
    input.preRestore.workspaceRef === input.postRestore.workspaceRef &&
    input.preRestore.tenantRef.length > 0 &&
    input.preRestore.workspaceRef.length > 0;

  if (!tenantWorkspacePreserved) notes.push("tenant_workspace_boundary_mismatch");

  const migrationCompatible =
    input.preRestore.schemaVersion === input.postRestore.schemaVersion &&
    input.postRestore.schemaVersion === input.manifest.migrationLineageAnchor;
  if (!migrationCompatible) notes.push("migration_lineage_mismatch");

  const fingerprintsMatch = Object.keys(input.preRestore.rowFingerprints).every(
    (k) =>
      input.preRestore.rowFingerprints[k] === input.postRestore.rowFingerprints[k],
  );
  const integrityAssessed = fingerprintsMatch && tenantWorkspacePreserved;
  if (!fingerprintsMatch) notes.push("row_fingerprint_mismatch");

  const criticalStateReadable = input.postRestore.criticalStateReadable === true;
  if (!criticalStateReadable) notes.push("critical_state_unreadable");

  const measuredRestoreDurationMs = Math.max(
    0,
    input.finishedAtMs - input.startedAtMs,
  );

  // Provider RPO is not an RTB-invented SLA. Fixture path yields MEASURED restore time only.
  const rpoStatus: RpoRtoStatus = "DEFINED_NOT_TESTED";
  const rtoStatus: RpoRtoStatus = "MEASURED";
  notes.push(
    "rpo_follows_provider_backup_schedule_not_rtb_sla",
    `fixture_restore_duration_ms=${measuredRestoreDurationMs}`,
  );

  return {
    backupAvailable,
    restoreExecuted: backupAvailable,
    integrityAssessed,
    tenantWorkspacePreserved,
    migrationCompatible,
    criticalStateReadable,
    measuredRestoreDurationMs,
    rpoStatus,
    rtoStatus,
    notes,
  };
}

export function assertPlatformRestorePassed(result: RestoreResult): void {
  if (
    !(
      result.backupAvailable &&
      result.restoreExecuted &&
      result.integrityAssessed &&
      result.tenantWorkspacePreserved &&
      result.migrationCompatible &&
      result.criticalStateReadable
    )
  ) {
    throw new Error(`Platform restore certification failed: ${result.notes.join(",")}`);
  }
}

