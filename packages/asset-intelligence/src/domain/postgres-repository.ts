/**
 * Phase 10B.1 — production PostgreSQL/Supabase Asset Intelligence repository.
 * Supabase hosts Postgres; domain API stays infrastructure-independent.
 */

import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AssetIdentityReference } from "../architecture/identity-state";
import type { AssetHealthIndexState } from "./health-index";
import type { AssetIntelligenceEvent } from "./events";
import type { IntelligenceTimelineEntry } from "./timeline";
import type {
  AssetIntelligenceRepositoryPort,
  IdempotencyRecord,
  OutboxEventRecord,
  PersistedConditionState,
  PersistedCriticalityState,
  PersistedEvidenceConfidence,
  PersistedHealthIndexState,
  PersistedHealthProfile,
  PersistedReliabilityState,
  PersistedSnapshotRecord,
  SourceProvenanceRecord,
} from "./persistence";
import { assertProductionRepositorySafe } from "./persistence";

type AnyClient = SupabaseClient<any, "public", any>;

export class PostgresAssetIntelligenceRepository implements AssetIntelligenceRepositoryPort {
  readonly adapterKind = "postgres" as const;
  private eventLog: AssetIntelligenceEvent[] = [];
  private identityCache: AssetIdentityReference[] = [];

  constructor(private readonly supabase: AnyClient) {
    assertProductionRepositorySafe("postgres");
  }

  newId(_prefix: string): string {
    return randomUUID();
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

  async saveHealthIndex(state: PersistedHealthIndexState): Promise<PersistedHealthIndexState> {
    const { error } = await this.supabase.from("asset_intelligence_health_indexes").insert({
      id: state.stateId,
      tenant_id: state.tenantId,
      workspace_id: state.workspaceId,
      asset_id: state.assetId,
      version: state.version,
      status: state.status,
      health_index: state.healthIndex ?? null,
      health_class: state.healthClass ?? null,
      health_confidence: state.healthConfidence ?? null,
      health_trend: state.healthTrend ?? null,
      health_method: state.healthMethod ?? null,
      health_source_refs: state.healthSourceRefs ?? [],
      factors_used: state.factorsUsed ?? [],
      composed_by: "health_composition_engine",
      evidence_sufficiency: state.evidenceSufficiency ?? null,
      provenance: state.provenance,
      recorded_at: state.recordedAt,
      health_payload: {
        distinctFromConditionRating: true,
        distinctFromCriticalityRating: true,
        distinctFromReliabilityRating: true,
        accuracyClaimsCertified: false,
        rulClaimsCertified: false,
      },
    });
    if (error) {
      if (error.code === "23505") throw new Error(`idempotent_or_version_conflict:${error.message}`);
      throw new Error(`health_persist_failed:${error.message}`);
    }
    return state;
  }

  async latestHealthIndex(
    tenantId: string,
    workspaceId: string,
    assetId: string,
    asOf?: string,
  ): Promise<PersistedHealthIndexState | undefined> {
    let q = this.supabase
      .from("asset_intelligence_health_indexes")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("asset_id", assetId)
      .order("version", { ascending: false })
      .limit(1);
    if (asOf) q = q.lte("recorded_at", asOf);
    const { data, error } = await q.maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapHealthRow(data) : undefined;
  }

  async saveCriticality(state: PersistedCriticalityState): Promise<PersistedCriticalityState> {
    const { error } = await this.supabase.from("asset_intelligence_criticality_states").insert({
      id: state.stateId,
      tenant_id: state.tenantId,
      workspace_id: state.workspaceId,
      asset_id: state.assetId,
      version: state.version,
      status: state.status,
      review_status: state.reviewStatus,
      criticality_rating: state.criticalityRating ?? null,
      safety_criticality: state.safetyCriticality ?? null,
      production_criticality: state.productionCriticality ?? null,
      environmental_criticality: state.environmentalCriticality ?? null,
      financial_criticality: state.financialCriticality ?? null,
      operational_criticality: state.operationalCriticality ?? null,
      regulatory_criticality: state.regulatoryCriticality ?? null,
      criticality_method: state.criticalityMethod ?? null,
      criticality_confidence: state.criticalityConfidence ?? null,
      source_type: state.sourceType,
      source_reference: state.sourceReference ?? null,
      provenance: state.provenance,
      review_instance_id: state.reviewInstanceId ?? null,
      reviewed_at: state.reviewedAt ?? null,
      published_at: state.publishedAt ?? null,
      recorded_at: state.recordedAt,
      created_by: state.createdBy ?? null,
      supersedes_id: state.supersedesId ?? null,
      criticality_payload: {},
    });
    if (error) {
      if (error.code === "23505") throw new Error(`idempotent_or_version_conflict:${error.message}`);
      throw new Error(`criticality_persist_failed:${error.message}`);
    }
    return state;
  }

  async latestCriticality(
    tenantId: string,
    workspaceId: string,
    assetId: string,
    asOf?: string,
  ): Promise<PersistedCriticalityState | undefined> {
    let q = this.supabase
      .from("asset_intelligence_criticality_states")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("asset_id", assetId)
      .order("version", { ascending: false })
      .limit(1);
    if (asOf) q = q.lte("recorded_at", asOf);
    const { data, error } = await q.maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapCriticalityRow(data) : undefined;
  }

  async nextCriticalityVersion(
    tenantId: string,
    workspaceId: string,
    assetId: string,
    expectedCurrentVersion?: number,
  ): Promise<number> {
    const latest = await this.latestCriticality(tenantId, workspaceId, assetId);
    const current = latest?.version ?? 0;
    if (expectedCurrentVersion !== undefined && expectedCurrentVersion !== current) {
      throw new Error(`optimistic_lock_conflict:expected=${expectedCurrentVersion}:actual=${current}`);
    }
    return current + 1;
  }

  async saveReliability(state: PersistedReliabilityState): Promise<PersistedReliabilityState> {
    const { error } = await this.supabase.from("asset_intelligence_reliability_states").insert({
      id: state.stateId,
      tenant_id: state.tenantId,
      workspace_id: state.workspaceId,
      asset_id: state.assetId,
      version: state.version,
      status: state.status,
      review_status: state.reviewStatus,
      assessment_type: state.assessmentType,
      reliability_class: state.reliabilityClass ?? null,
      reliability_score: state.reliabilityScore ?? null,
      reliability_confidence: state.reliabilityConfidence ?? null,
      reliability_method: state.reliabilityMethod ?? null,
      evidence_window: state.evidenceWindow ?? null,
      operating_window: state.operatingWindow ?? null,
      source_type: state.sourceType,
      provenance: state.provenance,
      review_instance_id: state.reviewInstanceId ?? null,
      assessed_at: state.assessedAt,
      reviewed_at: state.reviewedAt ?? null,
      published_at: state.publishedAt ?? null,
      recorded_at: state.recordedAt,
      created_by: state.createdBy ?? null,
      supersedes_id: state.supersedesId ?? null,
      limitations: state.limitations,
      metrics: state.metrics,
      evidence_confidence: state.evidenceConfidence ?? null,
      reliability_payload: {
        qualitativeAsProbabilityForbidden: true,
        quantitativeReliabilityCertified: false,
        probabilityOfFailureCertified: false,
        rulClaimsCertified: false,
      },
    });
    if (error) {
      if (error.code === "23505") throw new Error(`idempotent_or_version_conflict:${error.message}`);
      throw new Error(`reliability_persist_failed:${error.message}`);
    }
    return state;
  }

  async latestReliability(
    tenantId: string,
    workspaceId: string,
    assetId: string,
    asOf?: string,
  ): Promise<PersistedReliabilityState | undefined> {
    let q = this.supabase
      .from("asset_intelligence_reliability_states")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("asset_id", assetId)
      .order("version", { ascending: false })
      .limit(1);
    if (asOf) q = q.lte("recorded_at", asOf);
    const { data, error } = await q.maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapReliabilityRow(data) : undefined;
  }

  async nextReliabilityVersion(
    tenantId: string,
    workspaceId: string,
    assetId: string,
    expectedCurrentVersion?: number,
  ): Promise<number> {
    const latest = await this.latestReliability(tenantId, workspaceId, assetId);
    const current = latest?.version ?? 0;
    if (expectedCurrentVersion !== undefined && expectedCurrentVersion !== current) {
      throw new Error(`optimistic_lock_conflict:expected=${expectedCurrentVersion}:actual=${current}`);
    }
    return current + 1;
  }

  async saveEvidenceConfidence(
    record: PersistedEvidenceConfidence,
  ): Promise<PersistedEvidenceConfidence> {
    const { error } = await this.supabase.from("asset_intelligence_evidence_confidence").insert({
      id: record.assessmentId,
      tenant_id: record.tenantId,
      workspace_id: record.workspaceId,
      asset_id: record.assetId,
      version: record.version,
      scope: record.scope,
      score: record.score,
      confidence_class: record.confidenceClass,
      confidence: record.confidence,
      source_count: record.sourceCount,
      source_diversity: record.sourceDiversity,
      freshness: record.freshness,
      review_completeness: record.reviewCompleteness,
      conflict_state: record.conflictState,
      lineage_integrity: record.lineageIntegrity,
      data_sufficiency: record.dataSufficiency,
      abstention_reason: record.abstentionReason ?? null,
      method: record.method,
      method_version: record.methodVersion,
      assessed_at: record.assessedAt,
      reasons: record.reasons,
      payload: { engineeringCorrectnessClaimed: false },
    });
    if (error && error.code !== "23505") {
      throw new Error(`evidence_confidence_persist_failed:${error.message}`);
    }
    return record;
  }

  async latestEvidenceConfidence(
    tenantId: string,
    workspaceId: string,
    assetId: string,
  ): Promise<PersistedEvidenceConfidence | undefined> {
    const { data, error } = await this.supabase
      .from("asset_intelligence_evidence_confidence")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("asset_id", assetId)
      .order("assessed_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapEvidenceRow(data) : undefined;
  }

  async saveHealthProfile(profile: PersistedHealthProfile): Promise<PersistedHealthProfile> {
    const { error } = await this.supabase.from("asset_intelligence_health_profiles").insert({
      id: profile.profileId,
      tenant_id: profile.tenantId,
      workspace_id: profile.workspaceId,
      asset_id: profile.assetId,
      version: profile.version,
      snapshot_id: profile.snapshotId ?? null,
      composition_method: profile.compositionMethod,
      composition_version: profile.compositionVersion,
      condition_state_ref: profile.conditionStateRef ?? null,
      condition_contribution: profile.conditionContribution ?? null,
      reliability_state_ref: profile.reliabilityStateRef ?? null,
      reliability_contribution:
        profile.reliabilityContribution === "unavailable"
          ? null
          : (profile.reliabilityContribution ?? null),
      reliability_unavailable: profile.reliabilityContribution === "unavailable",
      evidence_confidence_ref: profile.evidenceConfidenceRef ?? null,
      overall_health: profile.overallHealth ?? null,
      overall_health_class: profile.overallHealthClass ?? null,
      overall_health_confidence: profile.overallHealthConfidence ?? null,
      criticality_state_ref: profile.criticalityStateRef ?? null,
      criticality_context: profile.criticalityContext ?? null,
      criticality_is_health_factor: false,
      limitations: profile.limitations,
      review_status: profile.reviewStatus,
      calculated_at: profile.calculatedAt,
      published_at: profile.publishedAt ?? null,
      provenance: profile.provenance,
      evidence_confidence: profile.evidenceConfidence ?? null,
      profile_payload: {
        accuracyClaimsCertified: false,
        rulClaimsCertified: false,
        probabilityOfFailureCertified: false,
      },
    });
    if (error) {
      if (error.code === "23505") throw new Error(`idempotent_or_version_conflict:${error.message}`);
      throw new Error(`health_profile_persist_failed:${error.message}`);
    }
    return profile;
  }

  async latestHealthProfile(
    tenantId: string,
    workspaceId: string,
    assetId: string,
  ): Promise<PersistedHealthProfile | undefined> {
    const { data, error } = await this.supabase
      .from("asset_intelligence_health_profiles")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("asset_id", assetId)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapHealthProfileRow(data) : undefined;
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
  if (kind === "criticality") return "condition_calculated";
  if (kind === "health_index") return "snapshot_created";
  return kind;
}

function mapHealthRow(row: Record<string, unknown>): PersistedHealthIndexState {
  return {
    kind: "health_index",
    stateId: String(row.id),
    assetId: String(row.asset_id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    version: Number(row.version),
    status: row.status as PersistedHealthIndexState["status"],
    recordedAt: String(row.recorded_at),
    provenance: (row.provenance as PersistedHealthIndexState["provenance"]) ?? {
      sourceSystem: "health_composition_engine",
      observedAt: String(row.recorded_at),
    },
    silentIdentityMutationForbidden: true,
    healthIndex:
      row.health_index === null || row.health_index === undefined
        ? undefined
        : Number(row.health_index),
    healthClass: row.health_class ? String(row.health_class) : undefined,
    healthConfidence:
      row.health_confidence === null || row.health_confidence === undefined
        ? undefined
        : Number(row.health_confidence),
    healthTrend: row.health_trend ? String(row.health_trend) : undefined,
    healthMethod: row.health_method ? String(row.health_method) : undefined,
    healthSourceRefs: (row.health_source_refs as string[]) ?? [],
    factorsUsed: (row.factors_used as PersistedHealthIndexState["factorsUsed"]) ?? [],
    composedBy: "health_composition_engine",
    evidenceSufficiency:
      (row.evidence_sufficiency as PersistedHealthIndexState["evidenceSufficiency"]) ?? undefined,
    distinctFromConditionRating: true,
    distinctFromCriticalityRating: true,
    distinctFromReliabilityRating: true,
    accuracyClaimsCertified: false,
    rulClaimsCertified: false,
  };
}

function mapCriticalityRow(row: Record<string, unknown>): PersistedCriticalityState {
  return {
    kind: "criticality",
    stateId: String(row.id),
    assetId: String(row.asset_id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    version: Number(row.version),
    status: row.status as PersistedCriticalityState["status"],
    reviewStatus: row.review_status as PersistedCriticalityState["reviewStatus"],
    recordedAt: String(row.recorded_at),
    provenance: (row.provenance as PersistedCriticalityState["provenance"]) ?? {
      sourceSystem: "manual.engineering_assessment",
      observedAt: String(row.recorded_at),
    },
    silentIdentityMutationForbidden: true,
    criticalityRating: row.criticality_rating ? String(row.criticality_rating) : undefined,
    safetyCriticality: row.safety_criticality ? String(row.safety_criticality) : undefined,
    productionCriticality: row.production_criticality
      ? String(row.production_criticality)
      : undefined,
    environmentalCriticality: row.environmental_criticality
      ? String(row.environmental_criticality)
      : undefined,
    financialCriticality: row.financial_criticality
      ? String(row.financial_criticality)
      : undefined,
    operationalCriticality: row.operational_criticality
      ? String(row.operational_criticality)
      : undefined,
    regulatoryCriticality: row.regulatory_criticality
      ? String(row.regulatory_criticality)
      : undefined,
    criticalityMethod: row.criticality_method ? String(row.criticality_method) : undefined,
    criticalityConfidence:
      row.criticality_confidence === null || row.criticality_confidence === undefined
        ? undefined
        : Number(row.criticality_confidence),
    sourceType: String(row.source_type),
    sourceReference: row.source_reference ? String(row.source_reference) : undefined,
    reviewInstanceId: row.review_instance_id ? String(row.review_instance_id) : undefined,
    reviewedAt: row.reviewed_at ? String(row.reviewed_at) : undefined,
    publishedAt: row.published_at ? String(row.published_at) : undefined,
    createdBy: row.created_by ? String(row.created_by) : undefined,
    supersedesId: row.supersedes_id ? String(row.supersedes_id) : undefined,
  };
}

function mapReliabilityRow(row: Record<string, unknown>): PersistedReliabilityState {
  return {
    kind: "reliability",
    stateId: String(row.id),
    assetId: String(row.asset_id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    version: Number(row.version),
    status: row.status as PersistedReliabilityState["status"],
    reviewStatus: row.review_status as PersistedReliabilityState["reviewStatus"],
    assessmentType: row.assessment_type as PersistedReliabilityState["assessmentType"],
    recordedAt: String(row.recorded_at),
    provenance: (row.provenance as PersistedReliabilityState["provenance"]) ?? {
      sourceSystem: "manual.engineering_assessment",
      observedAt: String(row.recorded_at),
    },
    silentIdentityMutationForbidden: true,
    reliabilityClass: row.reliability_class ? String(row.reliability_class) : undefined,
    reliabilityScore:
      row.reliability_score === null || row.reliability_score === undefined
        ? undefined
        : Number(row.reliability_score),
    reliabilityConfidence:
      row.reliability_confidence === null || row.reliability_confidence === undefined
        ? undefined
        : Number(row.reliability_confidence),
    reliabilityMethod: row.reliability_method ? String(row.reliability_method) : undefined,
    evidenceWindow: row.evidence_window ? String(row.evidence_window) : undefined,
    operatingWindow: row.operating_window ? String(row.operating_window) : undefined,
    sourceType: String(row.source_type),
    reviewInstanceId: row.review_instance_id ? String(row.review_instance_id) : undefined,
    assessedAt: String(row.assessed_at ?? row.recorded_at),
    reviewedAt: row.reviewed_at ? String(row.reviewed_at) : undefined,
    publishedAt: row.published_at ? String(row.published_at) : undefined,
    createdBy: row.created_by ? String(row.created_by) : undefined,
    supersedesId: row.supersedes_id ? String(row.supersedes_id) : undefined,
    limitations: (row.limitations as string[]) ?? [],
    metrics: (row.metrics as PersistedReliabilityState["metrics"]) ?? [],
    evidenceConfidence:
      (row.evidence_confidence as PersistedReliabilityState["evidenceConfidence"]) ?? undefined,
    qualitativeAsProbabilityForbidden: true,
    quantitativeReliabilityCertified: false,
    probabilityOfFailureCertified: false,
    rulClaimsCertified: false,
    accuracyClaimsCertified: false,
  };
}

function mapEvidenceRow(row: Record<string, unknown>): PersistedEvidenceConfidence {
  return {
    assessmentId: String(row.id),
    assetId: String(row.asset_id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    version: Number(row.version ?? 1),
    scope: String(row.scope),
    score: Number(row.score),
    confidenceClass: row.confidence_class as PersistedEvidenceConfidence["confidenceClass"],
    confidence: Number(row.confidence),
    sourceCount: Number(row.source_count),
    sourceDiversity: Number(row.source_diversity),
    freshness: Number(row.freshness),
    reviewCompleteness: Number(row.review_completeness),
    conflictState: row.conflict_state as PersistedEvidenceConfidence["conflictState"],
    lineageIntegrity: row.lineage_integrity as PersistedEvidenceConfidence["lineageIntegrity"],
    dataSufficiency: row.data_sufficiency as PersistedEvidenceConfidence["dataSufficiency"],
    abstentionReason: row.abstention_reason ? String(row.abstention_reason) : undefined,
    method: "evidence_confidence_v1",
    methodVersion: "1",
    assessedAt: String(row.assessed_at),
    reasons: (row.reasons as string[]) ?? [],
    engineeringCorrectnessClaimed: false,
  };
}

function mapHealthProfileRow(row: Record<string, unknown>): PersistedHealthProfile {
  return {
    profileId: String(row.id),
    assetId: String(row.asset_id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    version: Number(row.version),
    snapshotId: row.snapshot_id ? String(row.snapshot_id) : undefined,
    compositionMethod: row.composition_method as PersistedHealthProfile["compositionMethod"],
    compositionVersion: String(row.composition_version),
    conditionStateRef: row.condition_state_ref ? String(row.condition_state_ref) : undefined,
    conditionContribution:
      row.condition_contribution === null || row.condition_contribution === undefined
        ? undefined
        : Number(row.condition_contribution),
    reliabilityStateRef: row.reliability_state_ref ? String(row.reliability_state_ref) : undefined,
    reliabilityContribution: row.reliability_unavailable
      ? "unavailable"
      : row.reliability_contribution === null || row.reliability_contribution === undefined
        ? undefined
        : Number(row.reliability_contribution),
    evidenceConfidenceRef: row.evidence_confidence_ref
      ? String(row.evidence_confidence_ref)
      : undefined,
    evidenceConfidence:
      (row.evidence_confidence as PersistedHealthProfile["evidenceConfidence"]) ?? undefined,
    overallHealth:
      row.overall_health === null || row.overall_health === undefined
        ? undefined
        : Number(row.overall_health),
    overallHealthClass: row.overall_health_class ? String(row.overall_health_class) : undefined,
    overallHealthConfidence:
      row.overall_health_confidence === null || row.overall_health_confidence === undefined
        ? undefined
        : Number(row.overall_health_confidence),
    criticalityStateRef: row.criticality_state_ref ? String(row.criticality_state_ref) : undefined,
    criticalityContext:
      (row.criticality_context as PersistedHealthProfile["criticalityContext"]) ?? undefined,
    priorityContext: { reserved: true, engine: "AssetPriorityEngine" },
    limitations: (row.limitations as string[]) ?? [],
    calculatedAt: String(row.calculated_at),
    reviewStatus: row.review_status as PersistedHealthProfile["reviewStatus"],
    publishedAt: row.published_at ? String(row.published_at) : undefined,
    provenance: (row.provenance as PersistedHealthProfile["provenance"]) ?? {
      sourceSystem: "health_composition_engine",
      observedAt: String(row.calculated_at),
    },
    silentIdentityMutationForbidden: true,
    accuracyClaimsCertified: false,
    rulClaimsCertified: false,
    probabilityOfFailureCertified: false,
    criticalityIsHealthFactor: false,
  };
}
