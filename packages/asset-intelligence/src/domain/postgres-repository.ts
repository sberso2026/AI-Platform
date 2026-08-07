/**
 * Phase 10B.1 — production PostgreSQL/Supabase Asset Intelligence repository.
 * Supabase hosts Postgres; domain API stays infrastructure-independent.
 */

import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AssetCriticalityState, AssetIdentityReference } from "../architecture/identity-state";
import type { AssetHealthIndexState } from "./health-index";
import type { AssetIntelligenceEvent } from "./events";
import type { IntelligenceTimelineEntry } from "./timeline";
import type {
  AssetIntelligenceRepositoryPort,
  IdempotencyRecord,
  OutboxEventRecord,
  PersistedConditionState,
  PersistedSnapshotRecord,
  SourceProvenanceRecord,
} from "./persistence";
import { assertProductionRepositorySafe } from "./persistence";

type AnyClient = SupabaseClient<any, "public", any>;

export class PostgresAssetIntelligenceRepository implements AssetIntelligenceRepositoryPort {
  readonly adapterKind = "postgres" as const;
  private healthCache = new Map<string, AssetHealthIndexState>();
  private criticalityCache = new Map<string, AssetCriticalityState>();
  private identityCache: AssetIdentityReference[] = [];
  private eventLog: AssetIntelligenceEvent[] = [];

  constructor(private readonly supabase: AnyClient) {
    assertProductionRepositorySafe("postgres");
  }

  newId(prefix: string): string {
    return `${prefix}_${randomUUID()}`;
  }

  async saveCondition(state: PersistedConditionState): Promise<PersistedConditionState> {
    const row = {
      id: state.stateId,
      tenant_id: state.tenantId,
      workspace_id: state.workspaceId,
      asset_id: state.assetId,
      version: state.version,
      status: state.status,
      condition_rating: state.conditionRating ?? null,
      condition_index: state.conditionIndex ?? null,
      confidence: state.conditionConfidence ?? null,
      method: state.provenance.method ?? null,
      source_type: state.sourceType,
      source_key: state.conditionSource ?? state.provenance.sourceSystem,
      source_reference: state.sourceReference ?? null,
      provenance: state.provenance,
      observed_at: state.observedAt ?? null,
      calculated_at: state.calculatedAt ?? null,
      reviewed_at: state.reviewedAt ?? null,
      published_at: state.publishedAt ?? null,
      recorded_at: state.recordedAt,
      created_by: state.createdBy ?? null,
      supersedes_id: state.supersedesId ?? null,
      condition_payload: {
        conditionTrend: state.conditionTrend,
        silentIdentityMutationForbidden: true,
      },
    };
    const { data, error } = await this.supabase
      .from("asset_intelligence_condition_states")
      .insert(row)
      .select("*")
      .single();
    if (error) {
      if (error.code === "23505") throw new Error(`idempotent_or_version_conflict:${error.message}`);
      throw new Error(`condition_persist_failed:${error.message}`);
    }
    return mapConditionRow(data);
  }

  async getConditionById(
    tenantId: string,
    workspaceId: string,
    id: string,
  ): Promise<PersistedConditionState | null> {
    const { data, error } = await this.supabase
      .from("asset_intelligence_condition_states")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapConditionRow(data) : null;
  }

  async latestCondition(
    tenantId: string,
    workspaceId: string,
    assetId: string,
    asOf?: string,
  ): Promise<PersistedConditionState | undefined> {
    let q = this.supabase
      .from("asset_intelligence_condition_states")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("asset_id", assetId)
      .order("version", { ascending: false })
      .limit(1);
    if (asOf) q = q.lte("recorded_at", asOf);
    const { data, error } = await q.maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapConditionRow(data) : undefined;
  }

  async listConditionHistory(
    tenantId: string,
    workspaceId: string,
    assetId: string,
  ): Promise<PersistedConditionState[]> {
    const { data, error } = await this.supabase
      .from("asset_intelligence_condition_states")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("asset_id", assetId)
      .order("version", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapConditionRow);
  }

  async saveHealthIndex(state: AssetHealthIndexState): Promise<AssetHealthIndexState> {
    this.healthCache.set(`${state.assetId}:${state.stateId}`, state);
    return state;
  }

  async latestHealthIndex(
    assetId: string,
    asOf?: string,
  ): Promise<AssetHealthIndexState | undefined> {
    const items = [...this.healthCache.values()]
      .filter((s) => s.assetId === assetId)
      .filter((s) => !asOf || s.recordedAt <= asOf)
      .sort((a, b) => a.recordedAt.localeCompare(b.recordedAt));
    return items[items.length - 1];
  }

  async saveCriticality(state: AssetCriticalityState): Promise<AssetCriticalityState> {
    this.criticalityCache.set(state.stateId, state);
    return state;
  }

  async latestCriticality(
    assetId: string,
    asOf?: string,
  ): Promise<AssetCriticalityState | undefined> {
    const items = [...this.criticalityCache.values()]
      .filter((s) => s.assetId === assetId)
      .filter((s) => !asOf || s.recordedAt <= asOf)
      .sort((a, b) => a.recordedAt.localeCompare(b.recordedAt));
    return items[items.length - 1];
  }

  async appendTimeline(entry: IntelligenceTimelineEntry): Promise<IntelligenceTimelineEntry> {
    const { error } = await this.supabase.from("asset_intelligence_timeline").insert({
      id: randomUUID(),
      tenant_id: entry.tenantId,
      workspace_id: entry.workspaceId,
      asset_id: entry.assetId,
      entry_id: entry.entryId,
      state_id: entry.stateId,
      kind: entry.kind,
      event_type: mapTimelineEventType(entry.kind),
      recorded_at: entry.recordedAt,
      source_key: entry.sourceKey,
      provenance: entry.provenance,
      governance: entry.governance,
    });
    if (error) {
      if (error.code === "23505") return entry;
      throw new Error(`timeline_persist_failed:${error.message}`);
    }
    return entry;
  }

  async listTimeline(assetId: string, asOf?: string): Promise<IntelligenceTimelineEntry[]> {
    let q = this.supabase
      .from("asset_intelligence_timeline")
      .select("*")
      .eq("asset_id", assetId)
      .order("recorded_at", { ascending: true });
    if (asOf) q = q.lte("recorded_at", asOf);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapTimelineRow);
  }

  async saveSnapshot(record: PersistedSnapshotRecord): Promise<PersistedSnapshotRecord> {
    const { error } = await this.supabase.from("asset_intelligence_snapshots").insert({
      id: record.id,
      tenant_id: record.tenantId,
      workspace_id: record.workspaceId,
      asset_id: record.assetId,
      schema_version: record.schemaVersion,
      captured_at: record.capturedAt,
      condition_state_id: record.conditionStateId ?? null,
      health_index: record.healthIndex ?? null,
      identity_reference: record.identityReference,
      source_set: record.sourceSet,
      timeline_position: record.timelinePosition ?? null,
      snapshot_payload: record.snapshot,
      is_asset_registry: false,
      mutates_identity: false,
    });
    if (error) throw new Error(`snapshot_persist_failed:${error.message}`);
    return record;
  }

  async getSnapshot(
    tenantId: string,
    workspaceId: string,
    id: string,
  ): Promise<PersistedSnapshotRecord | null> {
    const { data, error } = await this.supabase
      .from("asset_intelligence_snapshots")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapSnapshotRow(data) : null;
  }

  async latestSnapshot(
    tenantId: string,
    workspaceId: string,
    assetId: string,
  ): Promise<PersistedSnapshotRecord | undefined> {
    const { data, error } = await this.supabase
      .from("asset_intelligence_snapshots")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("asset_id", assetId)
      .order("captured_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapSnapshotRow(data) : undefined;
  }

  async registerSourceProvenance(
    record: SourceProvenanceRecord,
  ): Promise<SourceProvenanceRecord> {
    const { error } = await this.supabase.from("asset_intelligence_source_provenance").insert({
      id: record.id,
      tenant_id: record.tenantId,
      workspace_id: record.workspaceId,
      asset_id: record.assetId,
      source_key: record.sourceKey,
      source_type: record.sourceType,
      contract_family: record.contractFamily ?? null,
      contract_version: record.contractVersion ?? null,
      ownership: record.ownership,
      evidence_duplication_forbidden: true,
      writeback_identity_forbidden: true,
      metadata: record.metadata ?? {},
      created_at: record.createdAt,
    });
    if (error) throw new Error(`source_provenance_persist_failed:${error.message}`);
    return record;
  }

  async findIdempotency(
    tenantId: string,
    workspaceId: string,
    key: string,
  ): Promise<IdempotencyRecord | null> {
    const { data, error } = await this.supabase
      .from("asset_intelligence_idempotency")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("idempotency_key", key)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    return {
      tenantId: data.tenant_id,
      workspaceId: data.workspace_id,
      idempotencyKey: data.idempotency_key,
      operation: data.operation,
      resourceId: data.resource_id ?? undefined,
      requestHash: data.request_hash ?? undefined,
      responsePayload: data.response_payload ?? {},
    };
  }

  async saveIdempotency(record: IdempotencyRecord): Promise<IdempotencyRecord> {
    const { error } = await this.supabase.from("asset_intelligence_idempotency").insert({
      tenant_id: record.tenantId,
      workspace_id: record.workspaceId,
      idempotency_key: record.idempotencyKey,
      operation: record.operation,
      resource_id: record.resourceId ?? null,
      request_hash: record.requestHash ?? null,
      response_payload: record.responsePayload,
    });
    if (error) {
      if (error.code === "23505") {
        const existing = await this.findIdempotency(
          record.tenantId,
          record.workspaceId,
          record.idempotencyKey,
        );
        if (existing) return existing;
      }
      throw new Error(`idempotency_persist_failed:${error.message}`);
    }
    return record;
  }

  async appendOutbox(event: OutboxEventRecord): Promise<OutboxEventRecord> {
    const { error } = await this.supabase.from("asset_intelligence_outbox_events").insert({
      id: event.id,
      tenant_id: event.tenantId,
      workspace_id: event.workspaceId,
      asset_id: event.assetId,
      event_type: event.eventType,
      payload: event.payload,
      correlation_id: event.correlationId ?? null,
      state_id: event.stateId ?? null,
      published: event.published,
      created_at: event.createdAt,
      published_at: event.publishedAt ?? null,
    });
    if (error) throw new Error(`outbox_persist_failed:${error.message}`);
    return event;
  }

  async markOutboxPublished(id: string, publishedAt: string): Promise<void> {
    const { error } = await this.supabase
      .from("asset_intelligence_outbox_events")
      .update({ published: true, published_at: publishedAt })
      .eq("id", id);
    if (error) throw new Error(error.message);
  }

  async appendEvent(event: AssetIntelligenceEvent): Promise<AssetIntelligenceEvent> {
    this.eventLog.push(event);
    return event;
  }

  async cacheIdentity(identity: AssetIdentityReference): Promise<void> {
    const idx = this.identityCache.findIndex(
      (i) =>
        i.tenantId === identity.tenantId &&
        i.workspaceId === identity.workspaceId &&
        i.assetId === identity.assetId,
    );
    if (idx >= 0) this.identityCache[idx] = identity;
    else this.identityCache.push(identity);
  }

  async nextConditionVersion(
    tenantId: string,
    workspaceId: string,
    assetId: string,
    expectedCurrentVersion?: number,
  ): Promise<number> {
    const latest = await this.latestCondition(tenantId, workspaceId, assetId);
    const current = latest?.version ?? 0;
    if (expectedCurrentVersion !== undefined && expectedCurrentVersion !== current) {
      throw new Error(`optimistic_lock_conflict:expected=${expectedCurrentVersion}:actual=${current}`);
    }
    return current + 1;
  }
}

export function createPostgresAssetIntelligenceRepository(
  supabase: AnyClient,
): PostgresAssetIntelligenceRepository {
  return new PostgresAssetIntelligenceRepository(supabase);
}

function mapConditionRow(row: Record<string, unknown>): PersistedConditionState {
  const provenance = (row.provenance as PersistedConditionState["provenance"]) ?? {
    sourceSystem: String(row.source_key ?? "unknown"),
    observedAt: String(row.observed_at ?? row.recorded_at),
  };
  return {
    kind: "condition",
    stateId: String(row.id),
    assetId: String(row.asset_id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    version: Number(row.version),
    status: row.status as PersistedConditionState["status"],
    sourceType: String(row.source_type),
    sourceReference: row.source_reference ? String(row.source_reference) : undefined,
    recordedAt: String(row.recorded_at),
    provenance,
    silentIdentityMutationForbidden: true,
    conditionRating: row.condition_rating ? String(row.condition_rating) : undefined,
    conditionIndex:
      row.condition_index === null || row.condition_index === undefined
        ? undefined
        : Number(row.condition_index),
    conditionConfidence:
      row.confidence === null || row.confidence === undefined ? undefined : Number(row.confidence),
    conditionSource: String(row.source_key ?? ""),
    conditionTrend: (row.condition_payload as { conditionTrend?: string } | null)?.conditionTrend,
    observedAt: row.observed_at ? String(row.observed_at) : undefined,
    calculatedAt: row.calculated_at ? String(row.calculated_at) : undefined,
    reviewedAt: row.reviewed_at ? String(row.reviewed_at) : undefined,
    publishedAt: row.published_at ? String(row.published_at) : undefined,
    createdBy: row.created_by ? String(row.created_by) : undefined,
    supersedesId: row.supersedes_id ? String(row.supersedes_id) : undefined,
  };
}

function mapTimelineRow(row: Record<string, unknown>): IntelligenceTimelineEntry {
  return {
    entryId: String(row.entry_id),
    assetId: String(row.asset_id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    stateId: String(row.state_id ?? ""),
    kind: row.kind as IntelligenceTimelineEntry["kind"],
    recordedAt: String(row.recorded_at),
    sourceKey: String(row.source_key),
    provenance: row.provenance as IntelligenceTimelineEntry["provenance"],
    governance: (row.governance as IntelligenceTimelineEntry["governance"]) ?? {
      silentIdentityMutationForbidden: true,
      rawEvidenceForbidden: true,
      secretsForbidden: true,
    },
  };
}

function mapSnapshotRow(row: Record<string, unknown>): PersistedSnapshotRecord {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    assetId: String(row.asset_id),
    schemaVersion: String(row.schema_version),
    capturedAt: String(row.captured_at),
    conditionStateId: row.condition_state_id ? String(row.condition_state_id) : undefined,
    healthIndex: (row.health_index as AssetHealthIndexState) ?? undefined,
    identityReference: row.identity_reference as AssetIdentityReference,
    sourceSet: (row.source_set as string[]) ?? [],
    timelinePosition: row.timeline_position ? String(row.timeline_position) : undefined,
    snapshot: row.snapshot_payload as PersistedSnapshotRecord["snapshot"],
  };
}

function mapTimelineEventType(kind: string): string {
  if (kind === "condition") return "condition_observed";
  if (kind === "health_index") return "snapshot_created";
  return kind;
}
