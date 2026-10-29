import type { SupabaseClient } from "@rtb/database";
import type { EngineeringWorkEvent, ManagedEngineeringRepository } from "./types";
import type { WorkContextStore } from "./memory-store";

function db(client: SupabaseClient): { from(name: string): any } {
  return client as unknown as { from(name: string): any };
}

function mapRepository(row: Record<string, unknown>): ManagedEngineeringRepository {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    projectId: (row.project_id as string | null) ?? null,
    scope: row.scope as ManagedEngineeringRepository["scope"],
    repositoryType: row.repository_type as ManagedEngineeringRepository["repositoryType"],
    externalRepositoryId: (row.external_repository_id as string | null) ?? null,
    displayName: String(row.display_name),
    approvedRoot: (row.approved_root as string | null) ?? null,
    connectionId: (row.connection_id as string | null) ?? null,
    enabled: Boolean(row.enabled),
    capturePolicy: row.capture_policy as ManagedEngineeringRepository["capturePolicy"],
    createdBy: (row.created_by as string | null) ?? null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapEvent(row: Record<string, unknown>): EngineeringWorkEvent {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    projectId: String(row.project_id),
    eventType: row.event_type as EngineeringWorkEvent["eventType"],
    sourceSystem: String(row.source_system),
    sourceObjectType: String(row.source_object_type),
    sourceObjectId: String(row.source_object_id),
    sourceEventId: String(row.source_event_id),
    informationRefId: (row.information_ref_id as string | null) ?? null,
    disciplineId: (row.discipline_id as string | null) ?? null,
    systemId: (row.system_id as string | null) ?? null,
    assetId: (row.asset_id as string | null) ?? null,
    deliverableId: (row.deliverable_id as string | null) ?? null,
    lifecycleStage: (row.lifecycle_stage as string | null) ?? null,
    actorId: (row.actor_id as string | null) ?? null,
    occurredAt: String(row.occurred_at),
    recordedAt: String(row.recorded_at),
    managedRepositoryId: (row.managed_repository_id as string | null) ?? null,
    materiality: row.materiality as EngineeringWorkEvent["materiality"],
    confirmationState: row.confirmation_state as EngineeringWorkEvent["confirmationState"],
    captureReason: String(row.capture_reason),
    provenance: (row.provenance as Record<string, unknown>) ?? {},
    publishedToEventBus: Boolean(row.published_to_event_bus),
  };
}

export class SupabaseWorkContextStore implements WorkContextStore {
  constructor(private readonly supabase: SupabaseClient) {}

  async listRepositories(workspaceId: string, projectId?: string | null) {
    const { data, error } = await db(this.supabase).from("engineering_managed_repositories").select("*").eq("workspace_id", workspaceId);
    if (error) throw new Error(error.message);
    const rows = ((data ?? []) as Record<string, unknown>[]).map(mapRepository);
    if (!projectId) return rows;
    return rows.filter((row) => row.projectId === projectId || row.projectId == null);
  }

  async getRepository(id: string) {
    const { data, error } = await db(this.supabase).from("engineering_managed_repositories").select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapRepository(data as Record<string, unknown>) : null;
  }

  async saveRepository(row: ManagedEngineeringRepository) {
    const { data, error } = await db(this.supabase)
      .from("engineering_managed_repositories")
      .upsert({
        id: row.id,
        tenant_id: row.tenantId,
        workspace_id: row.workspaceId,
        project_id: row.projectId,
        scope: row.scope,
        repository_type: row.repositoryType,
        external_repository_id: row.externalRepositoryId,
        display_name: row.displayName,
        approved_root: row.approvedRoot,
        connection_id: row.connectionId,
        enabled: row.enabled,
        capture_policy: row.capturePolicy,
        created_by: row.createdBy,
        created_at: row.createdAt,
        updated_at: row.updatedAt,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return mapRepository(data as Record<string, unknown>);
  }

  async listEvents(workspaceId: string, projectId: string) {
    const { data, error } = await db(this.supabase)
      .from("engineering_work_events")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("project_id", projectId)
      .order("occurred_at", { ascending: false });
    if (error) throw new Error(error.message);
    return ((data ?? []) as Record<string, unknown>[]).map(mapEvent);
  }

  async getEvent(id: string) {
    const { data, error } = await db(this.supabase).from("engineering_work_events").select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapEvent(data as Record<string, unknown>) : null;
  }

  async findEventBySource(input: { tenantId: string; workspaceId: string; sourceSystem: string; sourceEventId: string }) {
    const { data, error } = await db(this.supabase)
      .from("engineering_work_events")
      .select("*")
      .eq("tenant_id", input.tenantId)
      .eq("workspace_id", input.workspaceId)
      .eq("source_system", input.sourceSystem)
      .eq("source_event_id", input.sourceEventId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapEvent(data as Record<string, unknown>) : null;
  }

  async saveEvent(row: EngineeringWorkEvent) {
    const { data, error } = await db(this.supabase)
      .from("engineering_work_events")
      .upsert({
        id: row.id,
        tenant_id: row.tenantId,
        workspace_id: row.workspaceId,
        project_id: row.projectId,
        event_type: row.eventType,
        source_system: row.sourceSystem,
        source_object_type: row.sourceObjectType,
        source_object_id: row.sourceObjectId,
        source_event_id: row.sourceEventId,
        information_ref_id: row.informationRefId,
        discipline_id: row.disciplineId,
        system_id: row.systemId,
        asset_id: row.assetId,
        deliverable_id: row.deliverableId,
        lifecycle_stage: row.lifecycleStage,
        actor_id: row.actorId,
        occurred_at: row.occurredAt,
        recorded_at: row.recordedAt,
        managed_repository_id: row.managedRepositoryId,
        materiality: row.materiality,
        confirmation_state: row.confirmationState,
        capture_reason: row.captureReason,
        provenance: row.provenance,
        published_to_event_bus: row.publishedToEventBus,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return mapEvent(data as Record<string, unknown>);
  }
}
