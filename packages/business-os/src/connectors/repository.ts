import type { SupabaseClient } from "@rtb/database";
import type { BosConnectorId } from "@rtb/types";
import type {
  ConnectorImportBatch,
  ConnectorInstallation,
  ConnectorStagingRecord,
  ConnectorStore,
  ConnectorSyncRun,
} from "./ports";

function table(supabase: SupabaseClient, name: string) {
  return supabase.from(name) as ReturnType<SupabaseClient["from"]>;
}

function mapInstallation(row: Record<string, unknown>): ConnectorInstallation {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    connectorId: row.connector_id as BosConnectorId,
    version: String(row.version),
    requestedMode: row.requested_mode as ConnectorInstallation["requestedMode"],
    effectiveMode: row.effective_mode as ConnectorInstallation["effectiveMode"],
    health: row.health as ConnectorInstallation["health"],
    writeClassification: "read_only",
    secretId: (row.secret_id as string | null) ?? null,
    dataClasses: (row.data_classes as string[]) ?? [],
    mappingVersion: String(row.mapping_version),
    cursor: (row.cursor as string | null) ?? null,
    lastSuccessfulSyncAt: (row.last_successful_sync_at as string | null) ?? null,
    lastSyncAt: (row.last_sync_at as string | null) ?? null,
    recordsProcessed: Number(row.records_processed ?? 0),
    recordsRejected: Number(row.records_rejected ?? 0),
    conflicts: Number(row.conflicts ?? 0),
    rateLimitState: (row.rate_limit_state as ConnectorInstallation["rateLimitState"]) ?? "ok",
    errorCategory: (row.error_category as string | null) ?? null,
    errorMessage: (row.error_message as string | null) ?? null,
    revokedAt: (row.revoked_at as string | null) ?? null,
    configuredBy: String(row.configured_by ?? ""),
    provenance: (row.provenance as Record<string, unknown>) ?? {},
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapRun(row: Record<string, unknown>): ConnectorSyncRun {
  return {
    id: String(row.id),
    installationId: String(row.installation_id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    connectorId: row.connector_id as BosConnectorId,
    status: row.status as ConnectorSyncRun["status"],
    recordsProcessed: Number(row.records_processed ?? 0),
    recordsRejected: Number(row.records_rejected ?? 0),
    conflicts: Number(row.conflicts ?? 0),
    duplicates: Number(row.duplicates ?? 0),
    checkpoint: (row.checkpoint as string | null) ?? null,
    idempotencyKey: String(row.idempotency_key),
    errorCategory: (row.error_category as string | null) ?? null,
    cancelled: Boolean(row.cancelled),
    startedAt: String(row.started_at),
    completedAt: (row.completed_at as string | null) ?? null,
    provenance: (row.provenance as Record<string, unknown>) ?? {},
  };
}

function mapStaging(row: Record<string, unknown>): ConnectorStagingRecord {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    connectorId: row.connector_id as BosConnectorId,
    installationId: String(row.installation_id),
    syncRunId: String(row.sync_run_id),
    provider: String(row.provider),
    externalSourceId: String(row.external_source_id),
    dataClass: String(row.data_class),
    retrievedAt: String(row.retrieved_at),
    sourceUpdatedAt: (row.source_updated_at as string | null) ?? null,
    mappingVersion: String(row.mapping_version),
    freshness: String(row.freshness),
    payload: (row.payload as Record<string, unknown>) ?? {},
    matchStatus: row.match_status as ConnectorStagingRecord["matchStatus"],
    conflictReason: (row.conflict_reason as string | null) ?? null,
    canonicalEntityType: (row.canonical_entity_type as string | null) ?? null,
    canonicalEntityId: (row.canonical_entity_id as string | null) ?? null,
    becomesCanonical: false,
    suppressed: Boolean(row.suppressed),
    provenance: (row.provenance as Record<string, unknown>) ?? {},
  };
}

function mapImport(row: Record<string, unknown>): ConnectorImportBatch {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    filename: String(row.filename),
    entityType: String(row.entity_type),
    status: row.status as ConnectorImportBatch["status"],
    rowCount: Number(row.row_count ?? 0),
    validCount: Number(row.valid_count ?? 0),
    rejectedCount: Number(row.rejected_count ?? 0),
    duplicates: Number(row.duplicates ?? 0),
    conflicts: Number(row.conflicts ?? 0),
    mapping: (row.mapping as Record<string, string>) ?? {},
    mappingVersion: String(row.mapping_version),
    contentHash: String(row.content_hash),
    committedAt: (row.committed_at as string | null) ?? null,
    provenance: (row.provenance as Record<string, unknown>) ?? {},
  };
}

export class BusinessConnectorRepository implements ConnectorStore {
  constructor(private readonly supabase: SupabaseClient) {}

  async listInstallations(scope: { tenantId: string; workspaceId: string }) {
    try {
      const { data } = await table(this.supabase, "business_os_connector_installations")
        .select("*")
        .eq("tenant_id", scope.tenantId)
        .eq("workspace_id", scope.workspaceId);
      return ((data ?? []) as Record<string, unknown>[]).map(mapInstallation);
    } catch {
      return [];
    }
  }

  async getInstallation(scope: { tenantId: string; workspaceId: string }, id: string) {
    return (await this.listInstallations(scope)).find((row) => row.id === id) ?? null;
  }

  async getInstallationByConnector(scope: { tenantId: string; workspaceId: string }, connectorId: BosConnectorId) {
    const rows = await this.listInstallations(scope);
    return rows.find((row) => row.connectorId === connectorId && row.health !== "revoked") ?? rows.find((row) => row.connectorId === connectorId) ?? null;
  }

  async upsertInstallation(row: ConnectorInstallation) {
    await table(this.supabase, "business_os_connector_installations").upsert({
      id: row.id,
      tenant_id: row.tenantId,
      workspace_id: row.workspaceId,
      connector_id: row.connectorId,
      version: row.version,
      requested_mode: row.requestedMode,
      effective_mode: row.effectiveMode,
      health: row.health,
      write_classification: row.writeClassification,
      secret_id: row.secretId,
      data_classes: row.dataClasses,
      mapping_version: row.mappingVersion,
      cursor: row.cursor,
      last_successful_sync_at: row.lastSuccessfulSyncAt,
      last_sync_at: row.lastSyncAt,
      records_processed: row.recordsProcessed,
      records_rejected: row.recordsRejected,
      conflicts: row.conflicts,
      rate_limit_state: row.rateLimitState,
      error_category: row.errorCategory,
      error_message: row.errorMessage,
      revoked_at: row.revokedAt,
      configured_by: row.configuredBy || null,
      provenance: row.provenance,
      updated_at: row.updatedAt,
    } as never);
    return row;
  }

  async listRuns(scope: { tenantId: string; workspaceId: string }) {
    try {
      const { data } = await table(this.supabase, "business_os_connector_sync_runs")
        .select("*")
        .eq("tenant_id", scope.tenantId)
        .eq("workspace_id", scope.workspaceId);
      return ((data ?? []) as Record<string, unknown>[]).map(mapRun);
    } catch {
      return [];
    }
  }

  async getRunByIdempotency(scope: { tenantId: string; workspaceId: string }, key: string) {
    return (await this.listRuns(scope)).find((row) => row.idempotencyKey === key) ?? null;
  }

  async upsertRun(row: ConnectorSyncRun) {
    await table(this.supabase, "business_os_connector_sync_runs").upsert({
      id: row.id,
      installation_id: row.installationId,
      tenant_id: row.tenantId,
      workspace_id: row.workspaceId,
      connector_id: row.connectorId,
      status: row.status,
      records_processed: row.recordsProcessed,
      records_rejected: row.recordsRejected,
      conflicts: row.conflicts,
      duplicates: row.duplicates,
      checkpoint: row.checkpoint,
      idempotency_key: row.idempotencyKey,
      error_category: row.errorCategory,
      cancelled: row.cancelled,
      started_at: row.startedAt,
      completed_at: row.completedAt,
      provenance: row.provenance,
    } as never);
    return row;
  }

  async listStaging(scope: { tenantId: string; workspaceId: string }) {
    try {
      const { data } = await table(this.supabase, "business_os_connector_staging")
        .select("*")
        .eq("tenant_id", scope.tenantId)
        .eq("workspace_id", scope.workspaceId);
      return ((data ?? []) as Record<string, unknown>[]).map(mapStaging);
    } catch {
      return [];
    }
  }

  async upsertStaging(row: ConnectorStagingRecord) {
    await table(this.supabase, "business_os_connector_staging").upsert({
      id: row.id,
      tenant_id: row.tenantId,
      workspace_id: row.workspaceId,
      connector_id: row.connectorId,
      installation_id: row.installationId,
      sync_run_id: row.syncRunId,
      provider: row.provider,
      external_source_id: row.externalSourceId,
      data_class: row.dataClass,
      retrieved_at: row.retrievedAt,
      source_updated_at: row.sourceUpdatedAt,
      mapping_version: row.mappingVersion,
      freshness: row.freshness,
      payload: row.payload,
      match_status: row.matchStatus,
      conflict_reason: row.conflictReason,
      canonical_entity_type: row.canonicalEntityType,
      canonical_entity_id: row.canonicalEntityId,
      becomes_canonical: false,
      suppressed: row.suppressed,
      provenance: row.provenance,
    } as never);
    return row;
  }

  async listImports(scope: { tenantId: string; workspaceId: string }) {
    try {
      const { data } = await table(this.supabase, "business_os_connector_import_batches")
        .select("*")
        .eq("tenant_id", scope.tenantId)
        .eq("workspace_id", scope.workspaceId);
      return ((data ?? []) as Record<string, unknown>[]).map(mapImport);
    } catch {
      return [];
    }
  }

  async getImport(scope: { tenantId: string; workspaceId: string }, id: string) {
    return (await this.listImports(scope)).find((row) => row.id === id) ?? null;
  }

  async upsertImport(row: ConnectorImportBatch) {
    await table(this.supabase, "business_os_connector_import_batches").upsert({
      id: row.id,
      tenant_id: row.tenantId,
      workspace_id: row.workspaceId,
      filename: row.filename,
      entity_type: row.entityType,
      status: row.status,
      row_count: row.rowCount,
      valid_count: row.validCount,
      rejected_count: row.rejectedCount,
      duplicates: row.duplicates,
      conflicts: row.conflicts,
      mapping: row.mapping,
      mapping_version: row.mappingVersion,
      content_hash: row.contentHash,
      committed_at: row.committedAt,
      provenance: row.provenance,
    } as never);
    return row;
  }
}
