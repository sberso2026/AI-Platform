import type { SupabaseClient } from "@rtb/database";
import type {
  ConnectorAuditEvent,
  EngineeringConnectorSyncState,
  EngineeringExternalConnection,
  EngineeringExternalObjectRef,
  EngineeringExternalProjectBinding,
} from "./types";
import type { EngineeringConnectorStore } from "./memory-store";

function db(client: SupabaseClient): { from(name: string): any } {
  return client as unknown as { from(name: string): any };
}

function mapConnection(row: Record<string, unknown>): EngineeringExternalConnection {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    displayName: String(row.display_name),
    category: row.category as EngineeringExternalConnection["category"],
    vendor: row.vendor as EngineeringExternalConnection["vendor"],
    credentialSecretId: String(row.credential_secret_id),
    authMode: row.auth_mode as EngineeringExternalConnection["authMode"],
    writePolicy: row.write_policy as EngineeringExternalConnection["writePolicy"],
    status: String(row.status),
    enabled: Boolean(row.enabled),
    createdBy: row.created_by == null ? null : String(row.created_by),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapBinding(row: Record<string, unknown>): EngineeringExternalProjectBinding {
  return {
    id: String(row.id),
    connectionId: String(row.connection_id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    eosProjectId: String(row.eos_project_id),
    externalAccountId: String(row.external_account_id),
    externalProjectId: String(row.external_project_id),
    externalScope: row.external_scope == null ? null : String(row.external_scope),
    repositoryId: row.repository_id == null ? null : String(row.repository_id),
    enabled: Boolean(row.enabled),
  };
}

function mapObject(row: Record<string, unknown>): EngineeringExternalObjectRef {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    projectId: String(row.project_id),
    connectionId: String(row.connection_id),
    bindingId: String(row.binding_id),
    repositoryId: row.repository_id == null ? null : String(row.repository_id),
    sourceSystem: String(row.source_system),
    externalAccountId: String(row.external_account_id),
    externalProjectId: String(row.external_project_id),
    objectType: row.object_type as EngineeringExternalObjectRef["objectType"],
    objectId: String(row.object_id),
    objectNumber: row.object_number == null ? null : String(row.object_number),
    displayName: String(row.display_name),
    webUrl: row.web_url == null ? null : String(row.web_url),
    version: row.version == null ? null : String(row.version),
    etag: row.etag == null ? null : String(row.etag),
    vendorStatus: row.vendor_status == null ? null : String(row.vendor_status),
    eosMappedStatus: row.eos_mapped_status == null ? null : String(row.eos_mapped_status),
    fingerprint: String(row.fingerprint),
    availability: row.availability as EngineeringExternalObjectRef["availability"],
    informationRefId: row.information_ref_id == null ? null : String(row.information_ref_id),
    relatedCanonicalType: row.related_canonical_type == null ? null : String(row.related_canonical_type),
    relatedCanonicalId: row.related_canonical_id == null ? null : String(row.related_canonical_id),
    occurredAt: String(row.occurred_at),
    recordedAt: String(row.recorded_at),
    metadata: (row.metadata as Record<string, unknown>) ?? {},
  };
}

function mapSync(row: Record<string, unknown>): EngineeringConnectorSyncState {
  return {
    id: String(row.id),
    connectionId: String(row.connection_id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    status: String(row.status),
    cursor: row.cursor == null ? null : String(row.cursor),
    lastSuccessfulSyncAt: row.last_successful_sync_at == null ? null : String(row.last_successful_sync_at),
    lastAttemptedSyncAt: row.last_attempted_sync_at == null ? null : String(row.last_attempted_sync_at),
    lastError: row.last_error == null ? null : String(row.last_error),
    itemsScanned: Number(row.items_scanned ?? 0),
    itemsChanged: Number(row.items_changed ?? 0),
    throttleCount: Number(row.throttle_count ?? 0),
    retryCount: Number(row.retry_count ?? 0),
    durationMs: Number(row.duration_ms ?? 0),
    syncMode: (row.sync_mode as EngineeringConnectorSyncState["syncMode"]) ?? "BOUNDED_POLL",
  };
}

export class SupabaseEngineeringConnectorStore implements EngineeringConnectorStore {
  constructor(private readonly supabase: SupabaseClient) {}

  async listConnections(workspaceId: string) {
    const { data, error } = await db(this.supabase).from("engineering_external_connections").select("*").eq("workspace_id", workspaceId);
    if (error) throw error;
    return ((data ?? []) as Record<string, unknown>[]).map(mapConnection);
  }

  async getConnection(id: string) {
    const { data, error } = await db(this.supabase).from("engineering_external_connections").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? mapConnection(data as Record<string, unknown>) : null;
  }

  async saveConnection(row: EngineeringExternalConnection) {
    const { data, error } = await db(this.supabase).from("engineering_external_connections").upsert({
      id: row.id,
      tenant_id: row.tenantId,
      workspace_id: row.workspaceId,
      display_name: row.displayName,
      category: row.category,
      vendor: row.vendor,
      credential_secret_id: row.credentialSecretId,
      auth_mode: row.authMode,
      write_policy: row.writePolicy,
      status: row.status,
      enabled: row.enabled,
      created_by: row.createdBy,
      created_at: row.createdAt,
      updated_at: row.updatedAt,
    }).select("*").single();
    if (error) throw error;
    return mapConnection(data as Record<string, unknown>);
  }

  async listBindings(workspaceId: string) {
    const { data, error } = await db(this.supabase).from("engineering_external_project_bindings").select("*").eq("workspace_id", workspaceId);
    if (error) throw error;
    return ((data ?? []) as Record<string, unknown>[]).map(mapBinding);
  }

  async saveBinding(row: EngineeringExternalProjectBinding) {
    const { data, error } = await db(this.supabase).from("engineering_external_project_bindings").upsert({
      id: row.id,
      connection_id: row.connectionId,
      tenant_id: row.tenantId,
      workspace_id: row.workspaceId,
      eos_project_id: row.eosProjectId,
      external_account_id: row.externalAccountId,
      external_project_id: row.externalProjectId,
      external_scope: row.externalScope,
      repository_id: row.repositoryId,
      enabled: row.enabled,
    }).select("*").single();
    if (error) throw error;
    return mapBinding(data as Record<string, unknown>);
  }

  async getSyncState(connectionId: string) {
    const { data, error } = await db(this.supabase).from("engineering_external_sync_state").select("*").eq("connection_id", connectionId).maybeSingle();
    if (error) throw error;
    return data ? mapSync(data as Record<string, unknown>) : null;
  }

  async saveSyncState(row: EngineeringConnectorSyncState) {
    const { data, error } = await db(this.supabase).from("engineering_external_sync_state").upsert({
      id: row.id,
      connection_id: row.connectionId,
      tenant_id: row.tenantId,
      workspace_id: row.workspaceId,
      status: row.status,
      cursor: row.cursor,
      last_successful_sync_at: row.lastSuccessfulSyncAt,
      last_attempted_sync_at: row.lastAttemptedSyncAt,
      last_error: row.lastError,
      items_scanned: row.itemsScanned,
      items_changed: row.itemsChanged,
      throttle_count: row.throttleCount,
      retry_count: row.retryCount,
      duration_ms: row.durationMs,
      sync_mode: row.syncMode,
    }).select("*").single();
    if (error) throw error;
    return mapSync(data as Record<string, unknown>);
  }

  async listObjects(workspaceId: string, projectId?: string | null) {
    let query = db(this.supabase).from("engineering_external_object_refs").select("*").eq("workspace_id", workspaceId);
    if (projectId) query = query.eq("project_id", projectId);
    const { data, error } = await query;
    if (error) throw error;
    return ((data ?? []) as Record<string, unknown>[]).map(mapObject);
  }

  async findObject(input: { workspaceId: string; connectionId: string; objectType: string; objectId: string }) {
    const { data, error } = await db(this.supabase)
      .from("engineering_external_object_refs")
      .select("*")
      .eq("workspace_id", input.workspaceId)
      .eq("connection_id", input.connectionId)
      .eq("object_type", input.objectType)
      .eq("object_id", input.objectId)
      .maybeSingle();
    if (error) throw error;
    return data ? mapObject(data as Record<string, unknown>) : null;
  }

  async saveObject(row: EngineeringExternalObjectRef) {
    const { data, error } = await db(this.supabase).from("engineering_external_object_refs").upsert({
      id: row.id,
      tenant_id: row.tenantId,
      workspace_id: row.workspaceId,
      project_id: row.projectId,
      connection_id: row.connectionId,
      binding_id: row.bindingId,
      repository_id: row.repositoryId,
      source_system: row.sourceSystem,
      external_account_id: row.externalAccountId,
      external_project_id: row.externalProjectId,
      object_type: row.objectType,
      object_id: row.objectId,
      object_number: row.objectNumber,
      display_name: row.displayName,
      web_url: row.webUrl,
      version: row.version,
      etag: row.etag,
      vendor_status: row.vendorStatus,
      eos_mapped_status: row.eosMappedStatus,
      fingerprint: row.fingerprint,
      availability: row.availability,
      information_ref_id: row.informationRefId,
      related_canonical_type: row.relatedCanonicalType,
      related_canonical_id: row.relatedCanonicalId,
      occurred_at: row.occurredAt,
      recorded_at: row.recordedAt,
      metadata: row.metadata,
    }).select("*").single();
    if (error) throw error;
    return mapObject(data as Record<string, unknown>);
  }

  async saveAudit(row: ConnectorAuditEvent) {
    const { data, error } = await db(this.supabase).from("engineering_connector_audit_events").insert({
      id: row.id,
      tenant_id: row.tenantId,
      workspace_id: row.workspaceId,
      action: row.action,
      actor_id: row.actorId,
      target_type: row.targetType,
      target_id: row.targetId,
      metadata: row.metadata,
      created_at: row.createdAt,
    }).select("*").single();
    if (error) throw error;
    return {
      id: String((data as Record<string, unknown>).id),
      tenantId: row.tenantId,
      workspaceId: row.workspaceId,
      action: row.action,
      actorId: row.actorId,
      targetType: row.targetType,
      targetId: row.targetId,
      metadata: row.metadata,
      createdAt: row.createdAt,
    };
  }
}
