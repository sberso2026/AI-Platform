import type { SupabaseClient } from "@rtb/database";
import type {
  ConnectorAuditEvent,
  ConnectorSyncState,
  ExternalSourceRef,
  M365Connection,
  SharePointScope,
} from "./types";
import type { M365Store } from "./memory-store";

function db(client: SupabaseClient): { from(name: string): any } {
  return client as unknown as { from(name: string): any };
}

function mapConnection(row: Record<string, unknown>): M365Connection {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    displayName: String(row.display_name),
    microsoftTenantId: String(row.microsoft_tenant_id),
    applicationId: String(row.application_id),
    credentialSecretId: String(row.credential_secret_id),
    authMode: row.auth_mode as M365Connection["authMode"],
    status: row.status as M365Connection["status"],
    enabled: Boolean(row.enabled),
    createdBy: row.created_by == null ? null : String(row.created_by),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapScope(row: Record<string, unknown>): SharePointScope {
  return {
    id: String(row.id),
    repositoryId: String(row.repository_id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    connectionId: String(row.connection_id),
    externalSiteId: String(row.external_site_id),
    externalDriveId: String(row.external_drive_id),
    approvedRootItemId: row.approved_root_item_id == null ? null : String(row.approved_root_item_id),
    contentAccessPolicy: row.content_access_policy as SharePointScope["contentAccessPolicy"],
    publicationEnabled: Boolean(row.publication_enabled),
  };
}

function mapSync(row: Record<string, unknown>): ConnectorSyncState {
  return {
    id: String(row.id),
    repositoryId: String(row.repository_id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    status: row.status as ConnectorSyncState["status"],
    deltaToken: row.delta_token == null ? null : String(row.delta_token),
    lastSuccessfulSyncAt: row.last_successful_sync_at == null ? null : String(row.last_successful_sync_at),
    lastAttemptedSyncAt: row.last_attempted_sync_at == null ? null : String(row.last_attempted_sync_at),
    lastError: row.last_error == null ? null : String(row.last_error),
    itemsScanned: Number(row.items_scanned ?? 0),
    itemsChanged: Number(row.items_changed ?? 0),
    throttleCount: Number(row.throttle_count ?? 0),
    retryCount: Number(row.retry_count ?? 0),
    nextRetryAt: row.next_retry_at == null ? null : String(row.next_retry_at),
    resyncRequired: Boolean(row.resync_required),
    durationMs: Number(row.duration_ms ?? 0),
  };
}

function mapSource(row: Record<string, unknown>): ExternalSourceRef {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    projectId: String(row.project_id),
    repositoryId: String(row.repository_id),
    connectionId: String(row.connection_id),
    sourceSystem: "sharepoint",
    microsoftTenantId: String(row.microsoft_tenant_id ?? ""),
    siteId: String(row.site_id),
    driveId: String(row.drive_id),
    itemId: String(row.item_id),
    listItemId: row.list_item_id == null ? null : String(row.list_item_id),
    parentItemId: row.parent_item_id == null ? null : String(row.parent_item_id),
    displayName: String(row.display_name ?? ""),
    webUrl: row.web_url == null ? null : String(row.web_url),
    pathWithinRoot: String(row.path_within_root ?? ""),
    mimeType: row.mime_type == null ? null : String(row.mime_type),
    sizeBytes: row.size_bytes == null ? null : Number(row.size_bytes),
    etag: row.etag == null ? null : String(row.etag),
    ctag: row.ctag == null ? null : String(row.ctag),
    versionLabel: row.version_label == null ? null : String(row.version_label),
    lastModifiedAt: row.last_modified_at == null ? null : String(row.last_modified_at),
    lastModifiedBy: row.last_modified_by == null ? null : String(row.last_modified_by),
    availability: row.availability as ExternalSourceRef["availability"],
    fingerprint: String(row.fingerprint),
    informationRefId: row.information_ref_id == null ? null : String(row.information_ref_id),
    occurredAt: String(row.occurred_at),
    recordedAt: String(row.recorded_at),
  };
}

function mapAudit(row: Record<string, unknown>): ConnectorAuditEvent {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    action: String(row.action),
    actorId: row.actor_id == null ? null : String(row.actor_id),
    targetType: String(row.target_type),
    targetId: String(row.target_id),
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    createdAt: String(row.created_at),
  };
}

export class SupabaseM365Store implements M365Store {
  constructor(private readonly supabase: SupabaseClient) {}

  async listConnections(workspaceId: string) {
    const { data, error } = await db(this.supabase).from("engineering_m365_connections").select("*").eq("workspace_id", workspaceId);
    if (error) throw new Error(error.message);
    return ((data ?? []) as Record<string, unknown>[]).map(mapConnection);
  }

  async getConnection(id: string) {
    const { data, error } = await db(this.supabase).from("engineering_m365_connections").select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapConnection(data as Record<string, unknown>) : null;
  }

  async saveConnection(row: M365Connection) {
    const { data, error } = await db(this.supabase)
      .from("engineering_m365_connections")
      .upsert({
        id: row.id,
        tenant_id: row.tenantId,
        workspace_id: row.workspaceId,
        display_name: row.displayName,
        microsoft_tenant_id: row.microsoftTenantId,
        application_id: row.applicationId,
        credential_secret_id: row.credentialSecretId,
        auth_mode: row.authMode,
        status: row.status,
        enabled: row.enabled,
        created_by: row.createdBy,
        created_at: row.createdAt,
        updated_at: row.updatedAt,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return mapConnection(data as Record<string, unknown>);
  }

  async listScopes(workspaceId: string) {
    const { data, error } = await db(this.supabase).from("engineering_sharepoint_scopes").select("*").eq("workspace_id", workspaceId);
    if (error) throw new Error(error.message);
    return ((data ?? []) as Record<string, unknown>[]).map(mapScope);
  }

  async getScopeByRepository(repositoryId: string) {
    const { data, error } = await db(this.supabase).from("engineering_sharepoint_scopes").select("*").eq("repository_id", repositoryId).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapScope(data as Record<string, unknown>) : null;
  }

  async saveScope(row: SharePointScope) {
    const { data, error } = await db(this.supabase)
      .from("engineering_sharepoint_scopes")
      .upsert({
        id: row.id,
        repository_id: row.repositoryId,
        tenant_id: row.tenantId,
        workspace_id: row.workspaceId,
        connection_id: row.connectionId,
        external_site_id: row.externalSiteId,
        external_drive_id: row.externalDriveId,
        approved_root_item_id: row.approvedRootItemId,
        content_access_policy: row.contentAccessPolicy,
        publication_enabled: row.publicationEnabled,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return mapScope(data as Record<string, unknown>);
  }

  async getSyncState(repositoryId: string) {
    const { data, error } = await db(this.supabase).from("engineering_connector_sync_state").select("*").eq("repository_id", repositoryId).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapSync(data as Record<string, unknown>) : null;
  }

  async saveSyncState(row: ConnectorSyncState) {
    const { data, error } = await db(this.supabase)
      .from("engineering_connector_sync_state")
      .upsert({
        id: row.id,
        repository_id: row.repositoryId,
        tenant_id: row.tenantId,
        workspace_id: row.workspaceId,
        status: row.status,
        delta_token: row.deltaToken,
        last_successful_sync_at: row.lastSuccessfulSyncAt,
        last_attempted_sync_at: row.lastAttemptedSyncAt,
        last_error: row.lastError,
        items_scanned: row.itemsScanned,
        items_changed: row.itemsChanged,
        throttle_count: row.throttleCount,
        retry_count: row.retryCount,
        next_retry_at: row.nextRetryAt,
        resync_required: row.resyncRequired,
        duration_ms: row.durationMs,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return mapSync(data as Record<string, unknown>);
  }

  async listSources(workspaceId: string, projectId?: string | null) {
    let query = db(this.supabase).from("engineering_external_source_refs").select("*").eq("workspace_id", workspaceId);
    if (projectId) query = query.eq("project_id", projectId);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return ((data ?? []) as Record<string, unknown>[]).map(mapSource);
  }

  async getSource(id: string) {
    const { data, error } = await db(this.supabase).from("engineering_external_source_refs").select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapSource(data as Record<string, unknown>) : null;
  }

  async findSourceByItem(input: { workspaceId: string; driveId: string; itemId: string }) {
    const { data, error } = await db(this.supabase)
      .from("engineering_external_source_refs")
      .select("*")
      .eq("workspace_id", input.workspaceId)
      .eq("drive_id", input.driveId)
      .eq("item_id", input.itemId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapSource(data as Record<string, unknown>) : null;
  }

  async saveSource(row: ExternalSourceRef) {
    const { data, error } = await db(this.supabase)
      .from("engineering_external_source_refs")
      .upsert({
        id: row.id,
        tenant_id: row.tenantId,
        workspace_id: row.workspaceId,
        project_id: row.projectId,
        repository_id: row.repositoryId,
        connection_id: row.connectionId,
        source_system: row.sourceSystem,
        microsoft_tenant_id: row.microsoftTenantId,
        site_id: row.siteId,
        drive_id: row.driveId,
        item_id: row.itemId,
        list_item_id: row.listItemId,
        parent_item_id: row.parentItemId,
        display_name: row.displayName,
        web_url: row.webUrl,
        path_within_root: row.pathWithinRoot,
        mime_type: row.mimeType,
        size_bytes: row.sizeBytes,
        etag: row.etag,
        ctag: row.ctag,
        version_label: row.versionLabel,
        last_modified_at: row.lastModifiedAt,
        last_modified_by: row.lastModifiedBy,
        availability: row.availability,
        fingerprint: row.fingerprint,
        information_ref_id: row.informationRefId,
        occurred_at: row.occurredAt,
        recorded_at: row.recordedAt,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return mapSource(data as Record<string, unknown>);
  }

  async saveAudit(row: ConnectorAuditEvent) {
    const { data, error } = await db(this.supabase)
      .from("engineering_connector_audit_events")
      .upsert({
        id: row.id,
        tenant_id: row.tenantId,
        workspace_id: row.workspaceId,
        action: row.action,
        actor_id: row.actorId,
        target_type: row.targetType,
        target_id: row.targetId,
        metadata: row.metadata,
        created_at: row.createdAt,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return mapAudit(data as Record<string, unknown>);
  }

  async listAudit(workspaceId: string) {
    const { data, error } = await db(this.supabase).from("engineering_connector_audit_events").select("*").eq("workspace_id", workspaceId);
    if (error) throw new Error(error.message);
    return ((data ?? []) as Record<string, unknown>[]).map(mapAudit);
  }
}
