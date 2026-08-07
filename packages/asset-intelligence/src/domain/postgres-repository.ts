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
import type { TaxonomyEntryKind } from "./failure-taxonomy";
import type { LifecycleTaxonomyKind } from "./lifecycle-taxonomy";
import type { AssetLifecycleReference } from "./lifecycle-reference";
import type {
  AssetIntelligenceRepositoryPort,
  IdempotencyRecord,
  OutboxEventRecord,
  PersistedConditionState,
  PersistedCriticalityState,
  PersistedEvidenceConfidence,
  PersistedFailureCauseState,
  PersistedFailureConsequenceState,
  PersistedFailureEffectState,
  PersistedFailureMechanismState,
  PersistedFailureModeState,
  PersistedFailureRelationship,
  PersistedFailureReview,
  PersistedFailureTaxonomyEntry,
  PersistedHealthIndexState,
  PersistedHealthProfile,
  PersistedReliabilityState,
  PersistedSnapshotRecord,
  PersistedTimeSeries,
  PersistedTrendConfidence,
  PersistedChangeDetection,
  PersistedTrendState,
  PersistedDegradationState,
  PersistedDegradationReview,
  PersistedLifecycleIntelligenceState,
  PersistedLifecycleReview,
  PersistedLifecycleTransitionCandidate,
  PersistedLifecycleTaxonomyEntry,
  PersistedDecisionContext,
  PersistedRiskSignalState,
  PersistedRiskReview,
  PersistedRiskCandidate,
  PersistedMaintenanceRecommendationState,
  PersistedMaintenanceRecommendationReview,
  PersistedMaintenanceTaxonomyEntry,
  PersistedPriorityProfile,
  PersistedPriorityReview,
  PersistedFusionState,
  PersistedFusionReview,
  PersistedReconciliationRecord,
  PersistedPredictiveReadinessState,
  PersistedPredictiveReadinessReview,
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

  async saveFailureMode(state: PersistedFailureModeState): Promise<PersistedFailureModeState> {
    const { error } = await this.supabase.from("asset_intelligence_failure_modes").insert({
      id: state.stateId,
      tenant_id: state.tenantId,
      workspace_id: state.workspaceId,
      asset_id: state.assetId,
      version: state.version,
      taxonomy_version: state.taxonomyVersion,
      failure_mode_code: state.failureModeCode,
      failure_mode_label: state.failureModeLabel,
      status: state.status,
      review_status: state.reviewStatus,
      assessment_type: state.assessmentType,
      confidence: state.confidence ?? null,
      method: state.method ?? null,
      evidence_confidence_ref: state.evidenceConfidenceRef ?? null,
      evidence_refs: state.evidenceRefs ?? [],
      source_refs: state.sourceRefs ?? [],
      detection_method_code: state.detectionMethodCode ?? null,
      review_instance_id: state.reviewInstanceId ?? null,
      source_type: state.sourceType ?? "manual_engineering_assessment",
      detected_at: state.detectedAt ?? null,
      assessed_at: state.assessedAt,
      reviewed_at: state.reviewedAt ?? null,
      published_at: state.publishedAt ?? null,
      provenance: state.provenance,
      limitations: state.limitations,
      evidence_confidence: state.evidenceConfidence ?? null,
      recorded_at: state.recordedAt,
      created_by: state.createdBy ?? null,
      supersedes_id: state.supersedesId ?? null,
      payload: {
        probabilityOfFailureCertified: false,
        accuracyClaimsCertified: false,
        rulClaimsCertified: false,
        aiMayPublishForbidden: true,
      },
    });
    if (error) {
      if (error.code === "23505") throw new Error(`idempotent_or_version_conflict:${error.message}`);
      throw new Error(`failure_mode_persist_failed:${error.message}`);
    }
    return state;
  }

  async latestFailureMode(
    tenantId: string,
    workspaceId: string,
    assetId: string,
    asOf?: string,
  ): Promise<PersistedFailureModeState | undefined> {
    let q = this.supabase
      .from("asset_intelligence_failure_modes")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("asset_id", assetId)
      .order("version", { ascending: false })
      .limit(1);
    if (asOf) q = q.lte("recorded_at", asOf);
    const { data, error } = await q.maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapFailureModeRow(data) : undefined;
  }

  async nextFailureModeVersion(
    tenantId: string,
    workspaceId: string,
    assetId: string,
    expectedCurrentVersion?: number,
  ): Promise<number> {
    const latest = await this.latestFailureMode(tenantId, workspaceId, assetId);
    const current = latest?.version ?? 0;
    if (expectedCurrentVersion !== undefined && expectedCurrentVersion !== current) {
      throw new Error(`optimistic_lock_conflict:expected=${expectedCurrentVersion}:actual=${current}`);
    }
    return current + 1;
  }

  async listFailureModeHistory(
    tenantId: string,
    workspaceId: string,
    assetId: string,
  ): Promise<PersistedFailureModeState[]> {
    const { data, error } = await this.supabase
      .from("asset_intelligence_failure_modes")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("asset_id", assetId)
      .order("version", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapFailureModeRow);
  }

  async saveFailureMechanism(
    state: PersistedFailureMechanismState,
  ): Promise<PersistedFailureMechanismState> {
    const { error } = await this.supabase.from("asset_intelligence_failure_mechanisms").insert({
      id: state.stateId,
      tenant_id: state.tenantId,
      workspace_id: state.workspaceId,
      asset_id: state.assetId,
      version: state.version,
      taxonomy_version: state.taxonomyVersion,
      mechanism_code: state.mechanismCode,
      mechanism_label: state.mechanismLabel,
      mechanism_category: state.mechanismCategory ?? null,
      related_failure_mode_codes: state.relatedFailureModeCodes ?? [],
      confidence: state.confidence ?? null,
      method: state.method ?? null,
      evidence_refs: state.evidenceRefs ?? [],
      evidence_confidence_ref: state.evidenceConfidenceRef ?? null,
      source_refs: state.sourceRefs ?? [],
      review_status: state.reviewStatus,
      source_type: state.sourceType ?? "manual_engineering_assessment",
      assessed_at: state.assessedAt,
      reviewed_at: state.reviewedAt ?? null,
      published_at: state.publishedAt ?? null,
      provenance: state.provenance,
      limitations: state.limitations,
      evidence_confidence: state.evidenceConfidence ?? null,
      recorded_at: state.recordedAt,
      created_by: state.createdBy ?? null,
      supersedes_id: state.supersedesId ?? null,
      payload: { probabilityOfFailureCertified: false },
    });
    if (error) {
      if (error.code === "23505") throw new Error(`idempotent_or_version_conflict:${error.message}`);
      throw new Error(`failure_mechanism_persist_failed:${error.message}`);
    }
    return state;
  }

  async latestFailureMechanism(
    tenantId: string,
    workspaceId: string,
    assetId: string,
    asOf?: string,
  ): Promise<PersistedFailureMechanismState | undefined> {
    let q = this.supabase
      .from("asset_intelligence_failure_mechanisms")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("asset_id", assetId)
      .order("version", { ascending: false })
      .limit(1);
    if (asOf) q = q.lte("recorded_at", asOf);
    const { data, error } = await q.maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapFailureMechanismRow(data) : undefined;
  }

  async saveFailureRelationship(
    record: PersistedFailureRelationship,
  ): Promise<PersistedFailureRelationship> {
    const { error } = await this.supabase.from("asset_intelligence_failure_relationships").insert({
      id: record.relationshipId,
      tenant_id: record.tenantId,
      workspace_id: record.workspaceId,
      asset_id: record.assetId,
      version: record.version,
      taxonomy_version: record.taxonomyVersion,
      relationship_type: record.relationshipType,
      from_kind: record.fromKind,
      from_code: record.fromCode,
      to_kind: record.toKind,
      to_code: record.toCode,
      recorded_at: record.recordedAt,
      payload: {},
    });
    if (error) {
      if (error.code === "23505") return record;
      throw new Error(`failure_relationship_persist_failed:${error.message}`);
    }
    return record;
  }

  async saveFailureCause(state: PersistedFailureCauseState): Promise<PersistedFailureCauseState> {
    const { error } = await this.supabase.from("asset_intelligence_failure_causes").insert({
      id: state.stateId,
      tenant_id: state.tenantId,
      workspace_id: state.workspaceId,
      asset_id: state.assetId,
      version: state.version,
      taxonomy_version: state.taxonomyVersion,
      cause_code: state.causeCode,
      cause_label: state.causeLabel,
      classification: state.classification,
      related_failure_mode_codes: state.relatedFailureModeCodes ?? [],
      related_mechanism_codes: state.relatedMechanismCodes ?? [],
      confidence: state.confidence ?? null,
      method: state.method ?? null,
      evidence_refs: state.evidenceRefs ?? [],
      evidence_confidence_ref: state.evidenceConfidenceRef ?? null,
      alternative_causes: state.alternativeCauses ?? [],
      root_cause_confidence: state.rootCauseConfidence ?? null,
      root_cause_method: state.rootCauseMethod ?? null,
      supporting_evidence: state.supportingEvidence ?? [],
      review_status: state.reviewStatus,
      source_type: state.sourceType ?? "manual_engineering_assessment",
      assessed_at: state.assessedAt,
      reviewed_at: state.reviewedAt ?? null,
      published_at: state.publishedAt ?? null,
      provenance: state.provenance,
      limitations: state.limitations,
      recorded_at: state.recordedAt,
      created_by: state.createdBy ?? null,
      supersedes_id: state.supersedesId ?? null,
      payload: {
        rootCauseRequiresHumanApproval: true,
        aiAutonomousRootCauseForbidden: true,
        probabilityOfFailureCertified: false,
      },
    });
    if (error) {
      if (error.code === "23505") throw new Error(`idempotent_or_version_conflict:${error.message}`);
      throw new Error(`failure_cause_persist_failed:${error.message}`);
    }
    return state;
  }

  async saveFailureEffect(
    state: PersistedFailureEffectState,
  ): Promise<PersistedFailureEffectState> {
    const { error } = await this.supabase.from("asset_intelligence_failure_effects").insert({
      id: state.stateId,
      tenant_id: state.tenantId,
      workspace_id: state.workspaceId,
      asset_id: state.assetId,
      version: state.version,
      taxonomy_version: state.taxonomyVersion,
      effect_code: state.effectCode,
      effect_label: state.effectLabel,
      effect_kind: state.effectKind,
      related_failure_mode_codes: state.relatedFailureModeCodes ?? [],
      review_status: state.reviewStatus,
      source_type: state.sourceType ?? "manual_engineering_assessment",
      assessed_at: state.assessedAt,
      provenance: state.provenance,
      limitations: state.limitations,
      recorded_at: state.recordedAt,
      payload: {},
    });
    if (error) {
      if (error.code === "23505") throw new Error(`idempotent_or_version_conflict:${error.message}`);
      throw new Error(`failure_effect_persist_failed:${error.message}`);
    }
    return state;
  }

  async saveFailureConsequence(
    state: PersistedFailureConsequenceState,
  ): Promise<PersistedFailureConsequenceState> {
    const { error } = await this.supabase.from("asset_intelligence_failure_consequences").insert({
      id: state.stateId,
      tenant_id: state.tenantId,
      workspace_id: state.workspaceId,
      asset_id: state.assetId,
      version: state.version,
      taxonomy_version: state.taxonomyVersion,
      consequence_code: state.consequenceCode,
      consequence_label: state.consequenceLabel,
      dimensions: state.dimensions ?? [],
      related_failure_mode_codes: state.relatedFailureModeCodes ?? [],
      creates_canonical_risk_record: false,
      review_status: state.reviewStatus,
      source_type: state.sourceType ?? "manual_engineering_assessment",
      assessed_at: state.assessedAt,
      provenance: state.provenance,
      limitations: state.limitations,
      recorded_at: state.recordedAt,
      payload: {},
    });
    if (error) {
      if (error.code === "23505") throw new Error(`idempotent_or_version_conflict:${error.message}`);
      throw new Error(`failure_consequence_persist_failed:${error.message}`);
    }
    return state;
  }

  async saveFailureReview(
    record: PersistedFailureReviewRecord,
  ): Promise<PersistedFailureReviewRecord> {
    const { error } = await this.supabase.from("asset_intelligence_failure_reviews").insert({
      id: record.id,
      tenant_id: record.tenantId,
      workspace_id: record.workspaceId,
      asset_id: record.assetId,
      failure_mode_id: record.failureModeId,
      review_instance_id: record.reviewInstanceId ?? null,
      action: record.action,
      reviewer_id: record.reviewerId ?? null,
      reason: record.reason ?? null,
      state_version: record.stateVersion,
      taxonomy_version: record.taxonomyVersion,
      evidence_confidence: record.evidenceConfidence ?? null,
      content_hash: record.contentHash ?? null,
      correlation_id: record.correlationId ?? null,
      created_at: record.createdAt,
    });
    if (error) throw new Error(`failure_review_persist_failed:${error.message}`);
    return record;
  }

  async upsertFailureTaxonomy(
    entry: PersistedFailureTaxonomyEntry,
  ): Promise<PersistedFailureTaxonomyEntry> {
    const { data, error } = await this.supabase
      .from("asset_intelligence_failure_taxonomy")
      .upsert(
        {
          taxonomy_id: entry.taxonomyId,
          taxonomy_version: entry.taxonomyVersion,
          kind: entry.kind,
          code: entry.code,
          name: entry.name,
          description: entry.description ?? "",
          category: entry.category ?? null,
          parent_code: entry.parentCode ?? null,
          applicable_asset_classes: entry.applicableAssetClasses ?? ["*"],
          source_standard: entry.sourceStandard ?? null,
          pack_owner: entry.packOwner,
          status: entry.status,
          effective_from: entry.effectiveFrom,
          deprecated_at: entry.deprecatedAt ?? null,
          replacement_code: entry.replacementCode ?? null,
          payload: {},
        },
        { onConflict: "kind,code,taxonomy_version" },
      )
      .select("*")
      .single();
    if (error) throw new Error(`failure_taxonomy_persist_failed:${error.message}`);
    return mapFailureTaxonomyRow(data);
  }

  async listFailureTaxonomy(
    kind?: TaxonomyEntryKind,
    packOwner?: string,
  ): Promise<PersistedFailureTaxonomyEntry[]> {
    let q = this.supabase.from("asset_intelligence_failure_taxonomy").select("*");
    if (kind) q = q.eq("kind", kind);
    if (packOwner) q = q.eq("pack_owner", packOwner);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapFailureTaxonomyRow);
  }

  async nextTimeSeriesVersion(
    tenantId: string,
    workspaceId: string,
    assetId: string,
    attributeKey: string,
    expectedCurrentVersion?: number,
  ): Promise<number> {
    const latest = await this.latestTimeSeries(tenantId, workspaceId, assetId, attributeKey);
    const current = latest?.version ?? 0;
    if (expectedCurrentVersion !== undefined && expectedCurrentVersion !== current) {
      throw new Error(`optimistic_lock_conflict:expected=${expectedCurrentVersion}:actual=${current}`);
    }
    return current + 1;
  }

  async saveTimeSeries(series: PersistedTimeSeries): Promise<PersistedTimeSeries> {
    const { error } = await this.supabase.from("asset_intelligence_time_series").insert({
      id: series.seriesId,
      tenant_id: series.tenantId,
      workspace_id: series.workspaceId,
      asset_id: series.assetId,
      version: series.version,
      attribute_key: series.attributeKey,
      attribute_label: series.attributeLabel ?? null,
      unit: series.unit,
      orientation: series.orientation,
      points: series.points,
      window_start: series.windowStart ?? null,
      window_end: series.windowEnd ?? null,
      sampling_hint: series.samplingHint ?? null,
      status: series.status,
      source_refs: series.sourceRefs ?? [],
      evidence_refs: series.evidenceRefs ?? [],
      provenance: series.provenance,
      limitations: series.limitations,
      recorded_at: series.recordedAt,
      payload: { isSensorRegistry: false, isShmRuntime: false },
    });
    if (error) throw new Error(`time_series_persist_failed:${error.message}`);
    return series;
  }

  async latestTimeSeries(
    tenantId: string,
    workspaceId: string,
    assetId: string,
    attributeKey: string,
  ): Promise<PersistedTimeSeries | undefined> {
    const { data, error } = await this.supabase
      .from("asset_intelligence_time_series")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("asset_id", assetId)
      .eq("attribute_key", attributeKey)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapTimeSeriesRow(data) : undefined;
  }

  async saveTrendConfidence(
    record: PersistedTrendConfidence,
  ): Promise<PersistedTrendConfidence> {
    const { error } = await this.supabase.from("asset_intelligence_trend_confidence").insert({
      id: record.assessmentId,
      tenant_id: record.tenantId,
      workspace_id: record.workspaceId,
      asset_id: record.assetId,
      series_id: record.seriesId ?? null,
      scope: record.scope,
      score: record.score,
      confidence_class: record.confidenceClass,
      point_count: record.pointCount,
      window_coverage: record.windowCoverage,
      freshness: record.freshness,
      source_diversity: record.sourceDiversity,
      conflict_state: record.conflictState,
      data_sufficiency: record.dataSufficiency,
      abstention_reason: record.abstentionReason ?? null,
      method: record.method,
      assessed_at: record.assessedAt,
      reasons: record.reasons,
      payload: { predictiveMlUsed: false, rulClaimsCertified: false },
    });
    if (error) throw new Error(`trend_confidence_persist_failed:${error.message}`);
    return record;
  }

  async saveChangeDetection(
    record: PersistedChangeDetection,
  ): Promise<PersistedChangeDetection> {
    const { error } = await this.supabase.from("asset_intelligence_change_detections").insert({
      id: record.detectionId,
      tenant_id: record.tenantId,
      workspace_id: record.workspaceId,
      asset_id: record.assetId,
      series_id: null, // logical seriesId retained in payload; avoid FK type friction in cert inserts
      signals: record.signals,
      method: record.method,
      trend_confidence_ref: record.trendConfidenceRef ?? null,
      abstained: record.abstained,
      abstention_reason: record.abstentionReason ?? null,
      assessed_at: record.assessedAt,
      payload: {
        seriesId: record.seriesId,
        predictiveMlUsed: false,
        probabilityOfFailureCertified: false,
        rulClaimsCertified: false,
        limitations: record.limitations,
      },
    });
    if (error) throw new Error(`change_detection_persist_failed:${error.message}`);
    return record;
  }

  async nextTrendVersion(
    tenantId: string,
    workspaceId: string,
    assetId: string,
    expectedCurrentVersion?: number,
  ): Promise<number> {
    const latest = await this.latestTrendState(tenantId, workspaceId, assetId);
    const current = latest?.version ?? 0;
    if (expectedCurrentVersion !== undefined && expectedCurrentVersion !== current) {
      throw new Error(`optimistic_lock_conflict:expected=${expectedCurrentVersion}:actual=${current}`);
    }
    return current + 1;
  }

  async saveTrendState(state: PersistedTrendState): Promise<PersistedTrendState> {
    const { error } = await this.supabase.from("asset_intelligence_trend_states").insert({
      id: state.stateId,
      tenant_id: state.tenantId,
      workspace_id: state.workspaceId,
      asset_id: state.assetId,
      version: state.version,
      series_id: state.seriesId,
      attribute_key: state.attributeKey,
      trend_direction: state.trendDirection,
      trend_class: state.trendClass,
      slope_hint: state.slopeHint ?? null,
      window_start: state.windowStart ?? null,
      window_end: state.windowEnd ?? null,
      method: state.method,
      confidence: state.confidence ?? null,
      trend_confidence_ref: state.trendConfidenceRef ?? null,
      change_detection_ref: state.changeDetectionRef ?? null,
      evidence_refs: state.evidenceRefs ?? [],
      source_refs: state.sourceRefs ?? [],
      review_status: state.reviewStatus,
      assessed_at: state.assessedAt,
      reviewed_at: state.reviewedAt ?? null,
      published_at: state.publishedAt ?? null,
      recorded_at: state.recordedAt,
      provenance: state.provenance,
      limitations: state.limitations,
      payload: {
        predictiveMlUsed: false,
        probabilityOfFailureCertified: false,
        rulClaimsCertified: false,
        aiMayPublishForbidden: true,
      },
    });
    if (error) throw new Error(`trend_state_persist_failed:${error.message}`);
    return state;
  }

  async latestTrendState(
    tenantId: string,
    workspaceId: string,
    assetId: string,
  ): Promise<PersistedTrendState | undefined> {
    const { data, error } = await this.supabase
      .from("asset_intelligence_trend_states")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("asset_id", assetId)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapTrendRow(data) : undefined;
  }

  async nextDegradationVersion(
    tenantId: string,
    workspaceId: string,
    assetId: string,
    expectedCurrentVersion?: number,
  ): Promise<number> {
    const latest = await this.latestDegradationState(tenantId, workspaceId, assetId);
    const current = latest?.version ?? 0;
    if (expectedCurrentVersion !== undefined && expectedCurrentVersion !== current) {
      throw new Error(`optimistic_lock_conflict:expected=${expectedCurrentVersion}:actual=${current}`);
    }
    return current + 1;
  }

  async saveDegradationState(
    state: PersistedDegradationState,
  ): Promise<PersistedDegradationState> {
    const { error } = await this.supabase.from("asset_intelligence_degradation_states").insert({
      id: state.stateId,
      tenant_id: state.tenantId,
      workspace_id: state.workspaceId,
      asset_id: state.assetId,
      version: state.version,
      series_id: state.seriesId ?? null,
      trend_state_id: state.trendStateId ?? null,
      change_detection_id: state.changeDetectionId ?? null,
      related_failure_mode_codes: state.relatedFailureModeCodes ?? [],
      degradation_direction: state.degradationDirection,
      degradation_class: state.degradationClass,
      severity_hint: state.severityHint ?? null,
      mechanism_context: state.mechanismContext ?? null,
      method: state.method,
      confidence: state.confidence ?? null,
      trend_confidence_ref: state.trendConfidenceRef ?? null,
      evidence_confidence_ref: state.evidenceConfidenceRef ?? null,
      evidence_refs: state.evidenceRefs ?? [],
      source_refs: state.sourceRefs ?? [],
      review_status: state.reviewStatus,
      review_instance_id: state.reviewInstanceId ?? null,
      assessed_at: state.assessedAt,
      reviewed_at: state.reviewedAt ?? null,
      published_at: state.publishedAt ?? null,
      recorded_at: state.recordedAt,
      created_by: state.createdBy ?? null,
      supersedes_id: state.supersedesId ?? null,
      provenance: state.provenance,
      limitations: state.limitations,
      payload: {
        predictiveMlUsed: false,
        probabilityOfFailureCertified: false,
        rulClaimsCertified: false,
        aiMayPublishForbidden: true,
        isFailureModeClaim: false,
      },
    });
    if (error) throw new Error(`degradation_persist_failed:${error.message}`);
    return state;
  }

  async latestDegradationState(
    tenantId: string,
    workspaceId: string,
    assetId: string,
  ): Promise<PersistedDegradationState | undefined> {
    const { data, error } = await this.supabase
      .from("asset_intelligence_degradation_states")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("asset_id", assetId)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapDegradationRow(data) : undefined;
  }

  async listDegradationHistory(
    tenantId: string,
    workspaceId: string,
    assetId: string,
  ): Promise<PersistedDegradationState[]> {
    const { data, error } = await this.supabase
      .from("asset_intelligence_degradation_states")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("asset_id", assetId)
      .order("version", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapDegradationRow);
  }

  async saveDegradationReview(
    review: PersistedDegradationReview,
  ): Promise<PersistedDegradationReview> {
    const { error } = await this.supabase.from("asset_intelligence_degradation_reviews").insert({
      id: review.reviewId,
      tenant_id: review.tenantId,
      workspace_id: review.workspaceId,
      asset_id: review.assetId,
      degradation_state_id: review.degradationStateId,
      review_instance_id: review.reviewInstanceId,
      action: review.action,
      reviewer_id: review.reviewerId,
      reason: review.reason ?? null,
      state_version: review.stateVersion,
      correlation_id: review.correlationId ?? null,
      created_at: review.createdAt,
    });
    if (error) throw new Error(`degradation_review_persist_failed:${error.message}`);
    return review;
  }

  async nextLifecycleVersion(
    tenantId: string,
    workspaceId: string,
    assetId: string,
    expectedCurrentVersion?: number,
  ): Promise<number> {
    const latest = await this.latestLifecycleState(tenantId, workspaceId, assetId);
    const current = latest?.version ?? 0;
    if (expectedCurrentVersion !== undefined && expectedCurrentVersion !== current) {
      throw new Error(`optimistic_lock_conflict:expected=${expectedCurrentVersion}:actual=${current}`);
    }
    return current + 1;
  }

  async saveLifecycleState(
    state: PersistedLifecycleIntelligenceState,
  ): Promise<PersistedLifecycleIntelligenceState> {
    const { error } = await this.supabase.from("asset_intelligence_lifecycle_states").insert({
      id: state.stateId,
      tenant_id: state.tenantId,
      workspace_id: state.workspaceId,
      asset_id: state.assetId,
      version: state.version,
      canonical_lifecycle_stage: state.canonicalLifecycleRef.canonicalLifecycleStage,
      canonical_lifecycle_version: state.canonicalLifecycleRef.stageVersion,
      canonical_lifecycle_effective_at: state.canonicalLifecycleRef.effectiveAt ?? null,
      canonical_source_owner: state.canonicalLifecycleRef.sourceOwner,
      lifecycle_context_class: state.lifecycleContextClass,
      lifecycle_context_code: state.lifecycleContextCode,
      lifecycle_context_rationale: state.lifecycleContextRationale,
      operating_state: state.operatingState ?? null,
      maintenance_state: state.maintenanceState ?? null,
      condition_state_ref: state.conditionStateRef ?? null,
      reliability_state_ref: state.reliabilityStateRef ?? null,
      failure_state_refs: state.failureStateRefs ?? [],
      trend_state_refs: state.trendStateRefs ?? [],
      degradation_state_refs: state.degradationStateRefs ?? [],
      contributing_slices: state.contributingSlices ?? [],
      missing_slices: state.missingSlices ?? [],
      conflicting_slices: state.conflictingSlices ?? [],
      evidence_confidence_ref: state.evidenceConfidenceRef ?? null,
      trend_confidence_ref: state.trendConfidenceRef ?? null,
      confidence: state.confidence ?? null,
      method: state.method,
      method_version: state.methodVersion,
      review_status: state.reviewStatus,
      review_instance_id: state.reviewInstanceId ?? null,
      assessed_at: state.assessedAt,
      reviewed_at: state.reviewedAt ?? null,
      published_at: state.publishedAt ?? null,
      recorded_at: state.recordedAt,
      created_by: state.createdBy ?? null,
      supersedes_id: state.supersedesId ?? null,
      provenance: state.provenance,
      limitations: state.limitations,
      service_age_context: state.serviceAgeContext ?? null,
      evidence_confidence: state.evidenceConfidence ?? null,
      trend_confidence: state.trendConfidence ?? null,
      mutates_canonical_lifecycle: false,
      is_health_factor: false,
      payload: {
        sourceReference: state.canonicalLifecycleRef.sourceReference ?? null,
        writeBackForbidden: true,
        predictiveMlUsed: false,
        probabilityOfFailureCertified: false,
        rulClaimsCertified: false,
        accuracyClaimsCertified: false,
        aiMayPublishForbidden: true,
      },
    });
    if (error) {
      if (error.code === "23505") throw new Error(`idempotent_or_version_conflict:${error.message}`);
      throw new Error(`lifecycle_state_persist_failed:${error.message}`);
    }
    return state;
  }

  async latestLifecycleState(
    tenantId: string,
    workspaceId: string,
    assetId: string,
  ): Promise<PersistedLifecycleIntelligenceState | undefined> {
    const { data, error } = await this.supabase
      .from("asset_intelligence_lifecycle_states")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("asset_id", assetId)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapLifecycleRow(data) : undefined;
  }

  async listLifecycleHistory(
    tenantId: string,
    workspaceId: string,
    assetId: string,
  ): Promise<PersistedLifecycleIntelligenceState[]> {
    const { data, error } = await this.supabase
      .from("asset_intelligence_lifecycle_states")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("asset_id", assetId)
      .order("version", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapLifecycleRow);
  }

  async saveLifecycleReview(
    review: PersistedLifecycleReview,
  ): Promise<PersistedLifecycleReview> {
    const { error } = await this.supabase.from("asset_intelligence_lifecycle_reviews").insert({
      id: review.reviewId,
      tenant_id: review.tenantId,
      workspace_id: review.workspaceId,
      asset_id: review.assetId,
      lifecycle_state_id: review.lifecycleStateId,
      review_instance_id: review.reviewInstanceId,
      action: review.action,
      reviewer_id: review.reviewerId,
      reason: review.reason ?? null,
      state_version: review.stateVersion,
      canonical_lifecycle_version: review.canonicalLifecycleVersion ?? null,
      evidence_confidence_ref: review.evidenceConfidenceRef ?? null,
      trend_confidence_ref: review.trendConfidenceRef ?? null,
      correlation_id: review.correlationId ?? null,
      created_at: review.createdAt,
    });
    if (error) throw new Error(`lifecycle_review_persist_failed:${error.message}`);
    return review;
  }

  async saveLifecycleTransitionCandidate(
    candidate: PersistedLifecycleTransitionCandidate,
  ): Promise<PersistedLifecycleTransitionCandidate> {
    const { error } = await this.supabase
      .from("asset_intelligence_lifecycle_transition_candidates")
      .insert({
        id: candidate.candidateId,
        tenant_id: candidate.tenantId,
        workspace_id: candidate.workspaceId,
        asset_id: candidate.assetId,
        lifecycle_state_id: candidate.lifecycleIntelligenceStateId,
        code: candidate.code,
        label: candidate.label,
        rationale: candidate.rationale,
        recommended_review: candidate.recommendedReview ?? null,
        status: candidate.status,
        mutates_canonical_lifecycle: false,
        created_at: candidate.createdAt,
        decided_at: candidate.decidedAt ?? null,
        decided_by: candidate.decidedBy ?? null,
        decision_reason: candidate.decisionReason ?? null,
        payload: {},
      });
    if (error) {
      throw new Error(`lifecycle_transition_candidate_persist_failed:${error.message}`);
    }
    return candidate;
  }

  async listLifecycleTransitionCandidates(
    tenantId: string,
    workspaceId: string,
    assetId: string,
  ): Promise<PersistedLifecycleTransitionCandidate[]> {
    const { data, error } = await this.supabase
      .from("asset_intelligence_lifecycle_transition_candidates")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("asset_id", assetId)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapLifecycleTransitionCandidateRow);
  }

  async upsertLifecycleTaxonomy(
    entry: PersistedLifecycleTaxonomyEntry,
  ): Promise<PersistedLifecycleTaxonomyEntry> {
    const { data, error } = await this.supabase
      .from("asset_intelligence_lifecycle_taxonomy")
      .upsert(
        {
          taxonomy_id: entry.taxonomyId,
          taxonomy_version: entry.taxonomyVersion,
          kind: entry.kind,
          code: entry.code,
          name: entry.name,
          description: entry.description ?? "",
          category: entry.category ?? null,
          applicable_asset_classes: entry.applicableAssetClasses ?? ["*"],
          status: entry.status,
          source_standard: entry.sourceStandard ?? null,
          pack_owner: entry.packOwner,
          effective_from: entry.effectiveFrom,
          deprecated_at: entry.deprecatedAt ?? null,
          replacement_code: entry.replacementCode ?? null,
          tenant_id: entry.tenantId ?? null,
          workspace_id: entry.workspaceId ?? null,
          payload: {},
        },
        { onConflict: "kind,code,taxonomy_version" },
      )
      .select("*")
      .single();
    if (error) throw new Error(`lifecycle_taxonomy_persist_failed:${error.message}`);
    return mapLifecycleTaxonomyRow(data);
  }

  async listLifecycleTaxonomy(
    kind?: LifecycleTaxonomyKind,
    packOwner?: string,
  ): Promise<PersistedLifecycleTaxonomyEntry[]> {
    let q = this.supabase.from("asset_intelligence_lifecycle_taxonomy").select("*");
    if (kind) q = q.eq("kind", kind);
    if (packOwner) q = q.eq("pack_owner", packOwner);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapLifecycleTaxonomyRow);
  }

  async saveDecisionContext(
    context: PersistedDecisionContext,
  ): Promise<PersistedDecisionContext> {
    const { error } = await this.supabase
      .from("asset_intelligence_decision_contexts")
      .insert({
        id: context.id,
        tenant_id: context.tenantId,
        workspace_id: context.workspaceId,
        asset_id: context.assetId,
        snapshot_id: context.snapshotId ?? null,
        health_profile_ref: context.healthProfileRef ?? null,
        criticality_state_ref: context.criticalityStateRef ?? null,
        condition_state_ref: context.conditionStateRef ?? null,
        reliability_state_ref: context.reliabilityStateRef ?? null,
        failure_state_refs: context.failureStateRefs ?? [],
        trend_state_refs: context.trendStateRefs ?? [],
        degradation_state_refs: context.degradationStateRefs ?? [],
        lifecycle_intelligence_ref: context.lifecycleIntelligenceRef ?? null,
        evidence_confidence_ref: context.evidenceConfidenceRef ?? null,
        trend_confidence_ref: context.trendConfidenceRef ?? null,
        available_dimensions: context.availableDimensions ?? [],
        missing_dimensions: context.missingDimensions ?? [],
        conflicting_dimensions: context.conflictingDimensions ?? [],
        contributing_slices: context.contributingSlices ?? [],
        decision_context_class: context.decisionContextClass,
        method: context.method,
        method_version: context.methodVersion,
        confidence: context.confidence ?? null,
        limitations: context.limitations ?? [],
        provenance: context.provenance ?? {},
        evidence_confidence: context.evidenceConfidence ?? null,
        trend_confidence: context.trendConfidence ?? null,
        calculated_at: context.calculatedAt,
        created_by: context.createdBy ?? null,
        autonomous_decision_authority: false,
        creates_core_risk: false,
        creates_work_order: false,
        calculates_pof: false,
        calculates_rul: false,
        is_health_factor: false,
        payload: { publishedSlicePolicy: "published_or_approved_only" },
      });
    if (error) throw new Error(`decision_context_persist_failed:${error.message}`);
    return context;
  }

  async latestDecisionContext(
    tenantId: string,
    workspaceId: string,
    assetId: string,
  ): Promise<PersistedDecisionContext | undefined> {
    const { data, error } = await this.supabase
      .from("asset_intelligence_decision_contexts")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("asset_id", assetId)
      .order("calculated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapDecisionContextRow(data) : undefined;
  }

  async listDecisionContexts(
    tenantId: string,
    workspaceId: string,
    assetId: string,
  ): Promise<PersistedDecisionContext[]> {
    const { data, error } = await this.supabase
      .from("asset_intelligence_decision_contexts")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("asset_id", assetId)
      .order("calculated_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapDecisionContextRow);
  }

  async nextRiskVersion(
    tenantId: string,
    workspaceId: string,
    assetId: string,
    expectedCurrentVersion?: number,
  ): Promise<number> {
    const latest = await this.latestRiskSignal(tenantId, workspaceId, assetId);
    return nextVersionOrConflict(latest?.version ?? 0, expectedCurrentVersion);
  }

  async saveRiskSignal(state: PersistedRiskSignalState): Promise<PersistedRiskSignalState> {
    const { error } = await this.supabase
      .from("asset_intelligence_risk_signal_states")
      .insert({
        id: state.id,
        tenant_id: state.tenantId,
        workspace_id: state.workspaceId,
        asset_id: state.assetId,
        version: state.version,
        risk_signal_class: state.riskSignalClass,
        risk_signal_category: state.riskSignalCategory,
        decision_context_ref: state.decisionContextRef,
        health_context_ref: state.healthContextRef ?? null,
        criticality_context_ref: state.criticalityContextRef ?? null,
        failure_context_refs: state.failureContextRefs ?? [],
        degradation_context_refs: state.degradationContextRefs ?? [],
        lifecycle_context_ref: state.lifecycleContextRef ?? null,
        evidence_confidence_ref: state.evidenceConfidenceRef ?? null,
        trend_confidence_ref: state.trendConfidenceRef ?? null,
        consequence_context: state.consequenceContext ?? null,
        exposure_context: state.exposureContext ?? null,
        confidence: state.confidence ?? null,
        method: state.method,
        method_version: state.methodVersion,
        review_status: state.reviewStatus,
        review_instance_id: state.reviewInstanceId ?? null,
        assessed_at: state.assessedAt,
        reviewed_at: state.reviewedAt ?? null,
        published_at: state.publishedAt ?? null,
        created_by: state.createdBy ?? null,
        supersedes_id: state.supersedesId ?? null,
        provenance: state.provenance ?? {},
        limitations: state.limitations ?? [],
        evidence_confidence: state.evidenceConfidence ?? null,
        trend_confidence: state.trendConfidence ?? null,
        probability_of_failure_certified: false,
        creates_core_risk: false,
        is_health_factor: false,
        mutates_canonical_lifecycle: false,
        payload: {
          canonicalEngineeringRiskOwnership: "engineering_core",
          riskCoreAutoMutationAllowed: false,
          aiMayPublishForbidden: true,
        },
      });
    if (error) {
      if (error.code === "23505") throw new Error(`idempotent_or_version_conflict:${error.message}`);
      throw new Error(`risk_signal_persist_failed:${error.message}`);
    }
    return state;
  }

  async latestRiskSignal(
    tenantId: string,
    workspaceId: string,
    assetId: string,
  ): Promise<PersistedRiskSignalState | undefined> {
    const { data, error } = await this.supabase
      .from("asset_intelligence_risk_signal_states")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("asset_id", assetId)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapRiskSignalRow(data) : undefined;
  }

  async listRiskHistory(
    tenantId: string,
    workspaceId: string,
    assetId: string,
  ): Promise<PersistedRiskSignalState[]> {
    const { data, error } = await this.supabase
      .from("asset_intelligence_risk_signal_states")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("asset_id", assetId)
      .order("version", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapRiskSignalRow);
  }

  async saveRiskReview(review: PersistedRiskReview): Promise<PersistedRiskReview> {
    const { error } = await this.supabase.from("asset_intelligence_risk_reviews").insert({
      id: review.reviewId,
      tenant_id: review.tenantId,
      workspace_id: review.workspaceId,
      asset_id: review.assetId,
      risk_signal_id: review.riskSignalStateId,
      review_instance_id: review.reviewInstanceId,
      action: review.action,
      reviewer_id: review.reviewerId,
      reason: review.reason ?? null,
      state_version: review.stateVersion,
      evidence_confidence_ref: review.evidenceConfidenceRef ?? null,
      trend_confidence_ref: review.trendConfidenceRef ?? null,
      content_hash: review.contentHash ?? null,
      correlation_id: review.correlationId ?? null,
      created_at: review.createdAt,
    });
    if (error) throw new Error(`risk_review_persist_failed:${error.message}`);
    return review;
  }

  async saveRiskCandidate(candidate: PersistedRiskCandidate): Promise<PersistedRiskCandidate> {
    const { error } = await this.supabase.from("asset_intelligence_risk_candidates").insert({
      tenant_id: candidate.tenantId,
      workspace_id: candidate.workspaceId,
      asset_id: candidate.assetId,
      candidate_id: candidate.candidateId,
      risk_signal_ref: candidate.riskSignalRef,
      title: candidate.title,
      description: candidate.description,
      consequence_context: candidate.consequenceContext ?? null,
      evidence_refs: candidate.evidenceRefs ?? [],
      confidence: candidate.confidence ?? null,
      limitations: candidate.limitations ?? [],
      status: candidate.status,
      auto_mutates_core_risk: false,
      requires_human_gated_adapter: true,
      created_at: candidate.createdAt,
      payload: { canonicalEngineeringRiskOwnership: "engineering_core" },
    });
    if (error) throw new Error(`risk_candidate_persist_failed:${error.message}`);
    return candidate;
  }

  async listRiskCandidates(
    tenantId: string,
    workspaceId: string,
    assetId: string,
  ): Promise<PersistedRiskCandidate[]> {
    const { data, error } = await this.supabase
      .from("asset_intelligence_risk_candidates")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("asset_id", assetId)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapRiskCandidateRow);
  }

  async nextMaintenanceRecommendationVersion(
    tenantId: string,
    workspaceId: string,
    assetId: string,
    expectedCurrentVersion?: number,
  ): Promise<number> {
    const latest = await this.latestMaintenanceRecommendation(tenantId, workspaceId, assetId);
    return nextVersionOrConflict(latest?.version ?? 0, expectedCurrentVersion);
  }

  async saveMaintenanceRecommendation(
    state: PersistedMaintenanceRecommendationState,
  ): Promise<PersistedMaintenanceRecommendationState> {
    const { error } = await this.supabase
      .from("asset_intelligence_maintenance_recommendation_states")
      .insert({
        id: state.id,
        tenant_id: state.tenantId,
        workspace_id: state.workspaceId,
        asset_id: state.assetId,
        version: state.version,
        recommendation_code: state.recommendationCode,
        recommendation_class: state.recommendationClass,
        decision_context_ref: state.decisionContextRef,
        risk_signal_ref: state.riskSignalRef ?? null,
        rationale: state.rationale ?? [],
        evidence_refs: state.evidenceRefs ?? [],
        confidence: state.confidence ?? null,
        urgency_context: state.urgencyContext ?? null,
        review_status: state.reviewStatus,
        review_instance_id: state.reviewInstanceId ?? null,
        method: state.method,
        method_version: state.methodVersion,
        assessed_at: state.assessedAt,
        reviewed_at: state.reviewedAt ?? null,
        published_at: state.publishedAt ?? null,
        created_by: state.createdBy ?? null,
        supersedes_id: state.supersedesId ?? null,
        provenance: state.provenance ?? {},
        limitations: state.limitations ?? [],
        evidence_confidence: state.evidenceConfidence ?? null,
        trend_confidence: state.trendConfidence ?? null,
        creates_work_order: false,
        is_health_factor: false,
        calculates_rul: false,
        mutates_canonical_lifecycle: false,
        payload: { cmmsWorkOrderOwnership: "none_in_asset_intelligence" },
      });
    if (error) {
      if (error.code === "23505") throw new Error(`idempotent_or_version_conflict:${error.message}`);
      throw new Error(`maintenance_recommendation_persist_failed:${error.message}`);
    }
    return state;
  }

  async latestMaintenanceRecommendation(
    tenantId: string,
    workspaceId: string,
    assetId: string,
  ): Promise<PersistedMaintenanceRecommendationState | undefined> {
    const { data, error } = await this.supabase
      .from("asset_intelligence_maintenance_recommendation_states")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("asset_id", assetId)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapMaintenanceRecommendationRow(data) : undefined;
  }

  async listMaintenanceRecommendationHistory(
    tenantId: string,
    workspaceId: string,
    assetId: string,
  ): Promise<PersistedMaintenanceRecommendationState[]> {
    const { data, error } = await this.supabase
      .from("asset_intelligence_maintenance_recommendation_states")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("asset_id", assetId)
      .order("version", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapMaintenanceRecommendationRow);
  }

  async saveMaintenanceRecommendationReview(
    review: PersistedMaintenanceRecommendationReview,
  ): Promise<PersistedMaintenanceRecommendationReview> {
    const { error } = await this.supabase
      .from("asset_intelligence_maintenance_recommendation_reviews")
      .insert({
        id: review.reviewId,
        tenant_id: review.tenantId,
        workspace_id: review.workspaceId,
        asset_id: review.assetId,
        recommendation_id: review.recommendationStateId,
        review_instance_id: review.reviewInstanceId,
        action: review.action,
        reviewer_id: review.reviewerId,
        reason: review.reason ?? null,
        state_version: review.stateVersion,
        evidence_confidence_ref: review.evidenceConfidenceRef ?? null,
        trend_confidence_ref: review.trendConfidenceRef ?? null,
        content_hash: review.contentHash ?? null,
        correlation_id: review.correlationId ?? null,
        created_at: review.createdAt,
      });
    if (error) {
      throw new Error(`maintenance_recommendation_review_persist_failed:${error.message}`);
    }
    return review;
  }

  async upsertMaintenanceTaxonomy(
    entry: PersistedMaintenanceTaxonomyEntry,
  ): Promise<PersistedMaintenanceTaxonomyEntry> {
    const { data, error } = await this.supabase
      .from("asset_intelligence_maintenance_recommendation_taxonomy")
      .upsert(
        {
          code: entry.code,
          name: entry.name,
          description: entry.description ?? "",
          category: entry.category ?? null,
          version: entry.version,
          status: entry.status,
          applicable_asset_classes: entry.applicableAssetClasses ?? ["*"],
          pack_owner: entry.packOwner,
          replacement_code: entry.replacementCode ?? null,
          redefines_shared_semantics: false,
          tenant_id: entry.tenantId ?? null,
          workspace_id: entry.workspaceId ?? null,
          payload: {},
        },
        { onConflict: "code,version" },
      )
      .select("*")
      .single();
    if (error) throw new Error(`maintenance_taxonomy_persist_failed:${error.message}`);
    return mapMaintenanceTaxonomyRow(data);
  }

  async listMaintenanceTaxonomy(
    category?: string,
    packOwner?: string,
  ): Promise<PersistedMaintenanceTaxonomyEntry[]> {
    let q = this.supabase
      .from("asset_intelligence_maintenance_recommendation_taxonomy")
      .select("*");
    if (category) q = q.eq("category", category);
    if (packOwner) q = q.eq("pack_owner", packOwner);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapMaintenanceTaxonomyRow);
  }

  async nextPriorityVersion(
    tenantId: string,
    workspaceId: string,
    assetId: string,
    expectedCurrentVersion?: number,
  ): Promise<number> {
    const latest = await this.latestPriorityProfile(tenantId, workspaceId, assetId);
    return nextVersionOrConflict(latest?.version ?? 0, expectedCurrentVersion);
  }

  async savePriorityProfile(
    profile: PersistedPriorityProfile,
  ): Promise<PersistedPriorityProfile> {
    const { error } = await this.supabase
      .from("asset_intelligence_priority_profiles")
      .insert({
        id: profile.id,
        tenant_id: profile.tenantId,
        workspace_id: profile.workspaceId,
        asset_id: profile.assetId,
        version: profile.version,
        snapshot_id: profile.snapshotId ?? null,
        health_ref: profile.healthRef ?? null,
        criticality_ref: profile.criticalityRef ?? null,
        risk_signal_ref: profile.riskSignalRef ?? null,
        failure_refs: profile.failureRefs ?? [],
        degradation_refs: profile.degradationRefs ?? [],
        lifecycle_ref: profile.lifecycleRef ?? null,
        maintenance_recommendation_refs: profile.maintenanceRecommendationRefs ?? [],
        decision_context_ref: profile.decisionContextRef,
        dimension_states: profile.dimensionStates ?? [],
        missing_dimensions: profile.missingDimensions ?? [],
        conflicting_dimensions: profile.conflictingDimensions ?? [],
        priority_class: profile.priorityClass,
        priority_rationale: profile.priorityRationale ?? [],
        priority_confidence: profile.priorityConfidence ?? null,
        method: profile.method,
        method_version: profile.methodVersion,
        review_status: profile.reviewStatus,
        review_instance_id: profile.reviewInstanceId ?? null,
        assessed_at: profile.assessedAt,
        reviewed_at: profile.reviewedAt ?? null,
        published_at: profile.publishedAt ?? null,
        created_by: profile.createdBy ?? null,
        supersedes_id: profile.supersedesId ?? null,
        provenance: profile.provenance ?? {},
        limitations: profile.limitations ?? [],
        evidence_confidence: profile.evidenceConfidence ?? null,
        trend_confidence: profile.trendConfidence ?? null,
        is_health_factor: false,
        implies_pof: false,
        creates_work_order: false,
        mutates_canonical_lifecycle: false,
        payload: { numericPriorityScoreRequired: false, dimensionsPreserved: true },
      });
    if (error) {
      if (error.code === "23505") throw new Error(`idempotent_or_version_conflict:${error.message}`);
      throw new Error(`priority_profile_persist_failed:${error.message}`);
    }
    return profile;
  }

  async latestPriorityProfile(
    tenantId: string,
    workspaceId: string,
    assetId: string,
  ): Promise<PersistedPriorityProfile | undefined> {
    const { data, error } = await this.supabase
      .from("asset_intelligence_priority_profiles")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("asset_id", assetId)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapPriorityProfileRow(data) : undefined;
  }

  async listPriorityHistory(
    tenantId: string,
    workspaceId: string,
    assetId: string,
  ): Promise<PersistedPriorityProfile[]> {
    const { data, error } = await this.supabase
      .from("asset_intelligence_priority_profiles")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("asset_id", assetId)
      .order("version", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapPriorityProfileRow);
  }

  async savePriorityReview(review: PersistedPriorityReview): Promise<PersistedPriorityReview> {
    const { error } = await this.supabase.from("asset_intelligence_priority_reviews").insert({
      id: review.reviewId,
      tenant_id: review.tenantId,
      workspace_id: review.workspaceId,
      asset_id: review.assetId,
      priority_profile_id: review.priorityProfileId,
      review_instance_id: review.reviewInstanceId,
      action: review.action,
      reviewer_id: review.reviewerId,
      reason: review.reason ?? null,
      state_version: review.stateVersion,
      evidence_confidence_ref: review.evidenceConfidenceRef ?? null,
      trend_confidence_ref: review.trendConfidenceRef ?? null,
      content_hash: review.contentHash ?? null,
      correlation_id: review.correlationId ?? null,
      created_at: review.createdAt,
    });
    if (error) throw new Error(`priority_review_persist_failed:${error.message}`);
    return review;
  }

  async nextFusionVersion(
    tenantId: string,
    workspaceId: string,
    assetId: string,
    expectedCurrentVersion?: number,
  ): Promise<number> {
    const latest = await this.latestFusionState(tenantId, workspaceId, assetId);
    return nextVersionOrConflict(latest?.version ?? 0, expectedCurrentVersion);
  }

  async saveFusionState(state: PersistedFusionState): Promise<PersistedFusionState> {
    const { error } = await this.supabase.from("asset_intelligence_fusion_states").insert({
      id: state.id,
      tenant_id: state.tenantId,
      workspace_id: state.workspaceId,
      asset_id: state.assetId,
      version: state.version,
      contributing_sources: state.contributingSources ?? [],
      missing_sources: state.missingSources ?? [],
      conflicting_sources: state.conflictingSources ?? [],
      reconciliation_ref: state.reconciliationRef ?? null,
      predictive_readiness_ref: state.predictiveReadinessRef ?? null,
      evidence_confidence_ref: state.evidenceConfidenceRef ?? null,
      trend_confidence_ref: state.trendConfidenceRef ?? null,
      fusion_class: state.fusionClass,
      method: state.method,
      method_version: state.methodVersion,
      confidence: state.confidence ?? null,
      review_status: state.reviewStatus,
      review_instance_id: state.reviewInstanceId ?? null,
      assessed_at: state.assessedAt,
      reviewed_at: state.reviewedAt ?? null,
      published_at: state.publishedAt ?? null,
      created_by: state.createdBy ?? null,
      supersedes_id: state.supersedesId ?? null,
      provenance: state.provenance ?? {},
      limitations: state.limitations ?? [],
      evidence_confidence: state.evidenceConfidence ?? null,
      trend_confidence: state.trendConfidence ?? null,
      predictive_ml_executed: false,
      probability_of_failure_certified: false,
      rul_claims_certified: false,
      is_health_factor: false,
      creates_core_risk: false,
      creates_work_order: false,
      mutates_canonical_lifecycle: false,
      payload: {
        fusionHealthContributionEnabled: false,
        predictiveMlEnabled: false,
        predictiveMethodsCertified: false,
        aiMayPublishForbidden: true,
      },
    });
    if (error) {
      if (error.code === "23505") throw new Error(`idempotent_or_version_conflict:${error.message}`);
      throw new Error(`fusion_state_persist_failed:${error.message}`);
    }
    return state;
  }

  async latestFusionState(
    tenantId: string,
    workspaceId: string,
    assetId: string,
  ): Promise<PersistedFusionState | undefined> {
    const { data, error } = await this.supabase
      .from("asset_intelligence_fusion_states")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("asset_id", assetId)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapFusionStateRow(data) : undefined;
  }

  async listFusionHistory(
    tenantId: string,
    workspaceId: string,
    assetId: string,
  ): Promise<PersistedFusionState[]> {
    const { data, error } = await this.supabase
      .from("asset_intelligence_fusion_states")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("asset_id", assetId)
      .order("version", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapFusionStateRow);
  }

  async saveFusionReview(review: PersistedFusionReview): Promise<PersistedFusionReview> {
    const { error } = await this.supabase.from("asset_intelligence_fusion_reviews").insert({
      id: review.reviewId,
      tenant_id: review.tenantId,
      workspace_id: review.workspaceId,
      asset_id: review.assetId,
      fusion_state_id: review.fusionStateId,
      review_instance_id: review.reviewInstanceId,
      action: review.action,
      reviewer_id: review.reviewerId,
      reason: review.reason ?? null,
      state_version: review.stateVersion,
      evidence_confidence_ref: review.evidenceConfidenceRef ?? null,
      trend_confidence_ref: review.trendConfidenceRef ?? null,
      content_hash: review.contentHash ?? null,
      correlation_id: review.correlationId ?? null,
      created_at: review.createdAt,
    });
    if (error) throw new Error(`fusion_review_persist_failed:${error.message}`);
    return review;
  }

  async saveReconciliationRecord(
    record: PersistedReconciliationRecord,
  ): Promise<PersistedReconciliationRecord> {
    const { error } = await this.supabase
      .from("asset_intelligence_reconciliation_records")
      .insert({
        id: record.id,
        tenant_id: record.tenantId,
        workspace_id: record.workspaceId,
        asset_id: record.assetId,
        fusion_state_ref: record.fusionStateRef,
        conflicts: record.conflicts ?? [],
        method: record.method,
        method_version: record.methodVersion,
        reconciled_at: record.reconciledAt,
        limitations: record.limitations ?? [],
        autonomous_resolution_forbidden: true,
        payload: { autonomousResolutionForbidden: true },
      });
    if (error) throw new Error(`reconciliation_record_persist_failed:${error.message}`);
    return record;
  }

  async listReconciliationRecords(
    tenantId: string,
    workspaceId: string,
    assetId: string,
  ): Promise<PersistedReconciliationRecord[]> {
    const { data, error } = await this.supabase
      .from("asset_intelligence_reconciliation_records")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("asset_id", assetId)
      .order("reconciled_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapReconciliationRow);
  }

  async nextPredictiveReadinessVersion(
    tenantId: string,
    workspaceId: string,
    assetId: string,
    expectedCurrentVersion?: number,
  ): Promise<number> {
    const latest = await this.latestPredictiveReadiness(tenantId, workspaceId, assetId);
    return nextVersionOrConflict(latest?.version ?? 0, expectedCurrentVersion);
  }

  async savePredictiveReadiness(
    state: PersistedPredictiveReadinessState,
  ): Promise<PersistedPredictiveReadinessState> {
    const { error } = await this.supabase
      .from("asset_intelligence_predictive_readiness_states")
      .insert({
        id: state.id,
        tenant_id: state.tenantId,
        workspace_id: state.workspaceId,
        asset_id: state.assetId,
        version: state.version,
        fusion_state_ref: state.fusionStateRef,
        reconciliation_ref: state.reconciliationRef ?? null,
        readiness_class: state.readinessClass,
        readiness_rationale: state.readinessRationale ?? [],
        evidence_confidence_ref: state.evidenceConfidenceRef ?? null,
        trend_confidence_ref: state.trendConfidenceRef ?? null,
        method: state.method,
        method_version: state.methodVersion,
        review_status: state.reviewStatus,
        review_instance_id: state.reviewInstanceId ?? null,
        assessed_at: state.assessedAt,
        reviewed_at: state.reviewedAt ?? null,
        published_at: state.publishedAt ?? null,
        created_by: state.createdBy ?? null,
        supersedes_id: state.supersedesId ?? null,
        provenance: state.provenance ?? {},
        limitations: state.limitations ?? [],
        predictive_ml_enabled: false,
        predictive_methods_certified: false,
        predictive_ml_executed: false,
        probability_of_failure_certified: false,
        rul_claims_certified: false,
        is_health_factor: false,
        payload: { predictiveReadinessOnly: true, aiMayPublishForbidden: true },
      });
    if (error) {
      if (error.code === "23505") throw new Error(`idempotent_or_version_conflict:${error.message}`);
      throw new Error(`predictive_readiness_persist_failed:${error.message}`);
    }
    return state;
  }

  async latestPredictiveReadiness(
    tenantId: string,
    workspaceId: string,
    assetId: string,
  ): Promise<PersistedPredictiveReadinessState | undefined> {
    const { data, error } = await this.supabase
      .from("asset_intelligence_predictive_readiness_states")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("asset_id", assetId)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapPredictiveReadinessRow(data) : undefined;
  }

  async listPredictiveReadinessHistory(
    tenantId: string,
    workspaceId: string,
    assetId: string,
  ): Promise<PersistedPredictiveReadinessState[]> {
    const { data, error } = await this.supabase
      .from("asset_intelligence_predictive_readiness_states")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("asset_id", assetId)
      .order("version", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapPredictiveReadinessRow);
  }

  async savePredictiveReadinessReview(
    review: PersistedPredictiveReadinessReview,
  ): Promise<PersistedPredictiveReadinessReview> {
    const { error } = await this.supabase
      .from("asset_intelligence_predictive_readiness_reviews")
      .insert({
        id: review.reviewId,
        tenant_id: review.tenantId,
        workspace_id: review.workspaceId,
        asset_id: review.assetId,
        readiness_state_id: review.readinessStateId,
        review_instance_id: review.reviewInstanceId,
        action: review.action,
        reviewer_id: review.reviewerId,
        reason: review.reason ?? null,
        state_version: review.stateVersion,
        evidence_confidence_ref: review.evidenceConfidenceRef ?? null,
        content_hash: review.contentHash ?? null,
        correlation_id: review.correlationId ?? null,
        created_at: review.createdAt,
      });
    if (error) throw new Error(`predictive_readiness_review_persist_failed:${error.message}`);
    return review;
  }
}

function mapFusionStateRow(row: Record<string, unknown>): PersistedFusionState {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    assetId: String(row.asset_id),
    version: Number(row.version),
    contributingSources: (row.contributing_sources ??
      []) as PersistedFusionState["contributingSources"],
    missingSources: (row.missing_sources ?? []) as PersistedFusionState["missingSources"],
    conflictingSources: (row.conflicting_sources ??
      []) as PersistedFusionState["conflictingSources"],
    reconciliationRef: strOrUndefined(row.reconciliation_ref),
    predictiveReadinessRef: strOrUndefined(row.predictive_readiness_ref),
    evidenceConfidenceRef: strOrUndefined(row.evidence_confidence_ref),
    trendConfidenceRef: strOrUndefined(row.trend_confidence_ref),
    fusionClass: row.fusion_class as PersistedFusionState["fusionClass"],
    method: "multi_source_fusion_v1",
    methodVersion: "1",
    confidence: numOrUndefined(row.confidence),
    reviewStatus: String(row.review_status),
    reviewInstanceId: strOrUndefined(row.review_instance_id),
    provenance: (row.provenance ?? {}) as Record<string, unknown>,
    limitations: strArray(row.limitations),
    assessedAt: String(row.assessed_at),
    reviewedAt: strOrUndefined(row.reviewed_at),
    publishedAt: strOrUndefined(row.published_at),
    createdBy: strOrUndefined(row.created_by),
    supersedesId: strOrUndefined(row.supersedes_id),
    evidenceConfidence: (row.evidence_confidence ??
      undefined) as PersistedFusionState["evidenceConfidence"],
    trendConfidence: (row.trend_confidence ??
      undefined) as PersistedFusionState["trendConfidence"],
    predictiveMlExecuted: false,
    probabilityOfFailureCertified: false,
    rulClaimsCertified: false,
    isHealthFactor: false,
    createsCoreRisk: false,
    createsWorkOrder: false,
    mutatesCanonicalLifecycle: false,
  };
}

function mapReconciliationRow(row: Record<string, unknown>): PersistedReconciliationRecord {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    assetId: String(row.asset_id),
    fusionStateRef: String(row.fusion_state_ref),
    conflicts: (row.conflicts ?? []) as PersistedReconciliationRecord["conflicts"],
    method: "source_reconciliation_v1",
    methodVersion: "1",
    reconciledAt: String(row.reconciled_at),
    limitations: strArray(row.limitations),
    autonomousResolutionForbidden: true,
  };
}

function mapPredictiveReadinessRow(
  row: Record<string, unknown>,
): PersistedPredictiveReadinessState {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    assetId: String(row.asset_id),
    version: Number(row.version),
    fusionStateRef: String(row.fusion_state_ref),
    reconciliationRef: strOrUndefined(row.reconciliation_ref),
    readinessClass: row.readiness_class as PersistedPredictiveReadinessState["readinessClass"],
    readinessRationale: strArray(row.readiness_rationale),
    evidenceConfidenceRef: strOrUndefined(row.evidence_confidence_ref),
    trendConfidenceRef: strOrUndefined(row.trend_confidence_ref),
    method: "predictive_readiness_v1",
    methodVersion: "1",
    reviewStatus: String(row.review_status),
    reviewInstanceId: strOrUndefined(row.review_instance_id),
    provenance: (row.provenance ?? {}) as Record<string, unknown>,
    limitations: strArray(row.limitations),
    assessedAt: String(row.assessed_at),
    reviewedAt: strOrUndefined(row.reviewed_at),
    publishedAt: strOrUndefined(row.published_at),
    createdBy: strOrUndefined(row.created_by),
    supersedesId: strOrUndefined(row.supersedes_id),
    predictiveMlEnabled: false,
    predictiveMethodsCertified: false,
    predictiveMlExecuted: false,
    probabilityOfFailureCertified: false,
    rulClaimsCertified: false,
    isHealthFactor: false,
  };
}

function nextVersionOrConflict(current: number, expectedCurrentVersion?: number): number {
  if (expectedCurrentVersion !== undefined && expectedCurrentVersion !== current) {
    throw new Error(
      `optimistic_lock_conflict:expected=${expectedCurrentVersion}:actual=${current}`,
    );
  }
  return current + 1;
}

function strOrUndefined(value: unknown): string | undefined {
  return value === null || value === undefined ? undefined : String(value);
}

function numOrUndefined(value: unknown): number | undefined {
  return value === null || value === undefined ? undefined : Number(value);
}

function strArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map((v) => String(v)) : [];
}

function mapDecisionContextRow(row: Record<string, unknown>): PersistedDecisionContext {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    assetId: String(row.asset_id),
    snapshotId: strOrUndefined(row.snapshot_id),
    healthProfileRef: strOrUndefined(row.health_profile_ref),
    criticalityStateRef: strOrUndefined(row.criticality_state_ref),
    conditionStateRef: strOrUndefined(row.condition_state_ref),
    reliabilityStateRef: strOrUndefined(row.reliability_state_ref),
    failureStateRefs: strArray(row.failure_state_refs),
    trendStateRefs: strArray(row.trend_state_refs),
    degradationStateRefs: strArray(row.degradation_state_refs),
    lifecycleIntelligenceRef: strOrUndefined(row.lifecycle_intelligence_ref),
    evidenceConfidenceRef: strOrUndefined(row.evidence_confidence_ref),
    trendConfidenceRef: strOrUndefined(row.trend_confidence_ref),
    availableDimensions: (row.available_dimensions ??
      []) as PersistedDecisionContext["availableDimensions"],
    missingDimensions: (row.missing_dimensions ??
      []) as PersistedDecisionContext["missingDimensions"],
    conflictingDimensions: (row.conflicting_dimensions ??
      []) as PersistedDecisionContext["conflictingDimensions"],
    contributingSlices: (row.contributing_slices ??
      []) as PersistedDecisionContext["contributingSlices"],
    decisionContextClass:
      row.decision_context_class as PersistedDecisionContext["decisionContextClass"],
    method: "decision_context_compose_v1",
    methodVersion: "1",
    confidence: numOrUndefined(row.confidence),
    limitations: strArray(row.limitations),
    provenance: (row.provenance ?? {}) as Record<string, unknown>,
    evidenceConfidence: (row.evidence_confidence ??
      undefined) as PersistedDecisionContext["evidenceConfidence"],
    trendConfidence: (row.trend_confidence ??
      undefined) as PersistedDecisionContext["trendConfidence"],
    calculatedAt: String(row.calculated_at),
    createdBy: strOrUndefined(row.created_by),
    autonomousDecisionAuthority: false,
    mutatesCanonicalLifecycle: false,
    createsCoreRisk: false,
    createsWorkOrder: false,
    calculatesPoF: false,
    calculatesRul: false,
    isHealthFactor: false,
  };
}

function mapRiskSignalRow(row: Record<string, unknown>): PersistedRiskSignalState {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    assetId: String(row.asset_id),
    version: Number(row.version),
    riskSignalClass: row.risk_signal_class as PersistedRiskSignalState["riskSignalClass"],
    riskSignalCategory: "advisory_context",
    decisionContextRef: String(row.decision_context_ref),
    healthContextRef: strOrUndefined(row.health_context_ref),
    criticalityContextRef: strOrUndefined(row.criticality_context_ref),
    failureContextRefs: strArray(row.failure_context_refs),
    degradationContextRefs: strArray(row.degradation_context_refs),
    lifecycleContextRef: strOrUndefined(row.lifecycle_context_ref),
    evidenceConfidenceRef: strOrUndefined(row.evidence_confidence_ref),
    trendConfidenceRef: strOrUndefined(row.trend_confidence_ref),
    consequenceContext: strOrUndefined(row.consequence_context),
    exposureContext: strOrUndefined(row.exposure_context),
    confidence: numOrUndefined(row.confidence),
    method: "risk_signal_compose_v1",
    methodVersion: "1",
    reviewStatus: String(row.review_status),
    reviewInstanceId: strOrUndefined(row.review_instance_id),
    provenance: (row.provenance ?? {}) as Record<string, unknown>,
    limitations: strArray(row.limitations),
    assessedAt: String(row.assessed_at),
    reviewedAt: strOrUndefined(row.reviewed_at),
    publishedAt: strOrUndefined(row.published_at),
    createdBy: strOrUndefined(row.created_by),
    supersedesId: strOrUndefined(row.supersedes_id),
    evidenceConfidence: (row.evidence_confidence ??
      undefined) as PersistedRiskSignalState["evidenceConfidence"],
    trendConfidence: (row.trend_confidence ??
      undefined) as PersistedRiskSignalState["trendConfidence"],
    probabilityOfFailureCertified: false,
    createsCoreRisk: false,
    isHealthFactor: false,
    mutatesCanonicalLifecycle: false,
  };
}

function mapRiskCandidateRow(row: Record<string, unknown>): PersistedRiskCandidate {
  return {
    candidateId: String(row.candidate_id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    assetId: String(row.asset_id),
    riskSignalRef: String(row.risk_signal_ref),
    title: String(row.title),
    description: String(row.description),
    consequenceContext: strOrUndefined(row.consequence_context),
    evidenceRefs: strArray(row.evidence_refs),
    confidence: numOrUndefined(row.confidence),
    limitations: strArray(row.limitations),
    createdAt: String(row.created_at),
    status: row.status as PersistedRiskCandidate["status"],
    autoMutatesCoreRisk: false,
    requiresHumanGatedAdapter: true,
  };
}

function mapMaintenanceRecommendationRow(
  row: Record<string, unknown>,
): PersistedMaintenanceRecommendationState {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    assetId: String(row.asset_id),
    version: Number(row.version),
    recommendationCode: String(row.recommendation_code),
    recommendationClass: String(row.recommendation_class),
    decisionContextRef: String(row.decision_context_ref),
    riskSignalRef: strOrUndefined(row.risk_signal_ref),
    rationale: strArray(row.rationale),
    evidenceRefs: strArray(row.evidence_refs),
    confidence: numOrUndefined(row.confidence),
    urgencyContext: strOrUndefined(row.urgency_context),
    reviewStatus: String(row.review_status),
    reviewInstanceId: strOrUndefined(row.review_instance_id),
    method: "maintenance_recommendation_compose_v1",
    methodVersion: "1",
    provenance: (row.provenance ?? {}) as Record<string, unknown>,
    limitations: strArray(row.limitations),
    assessedAt: String(row.assessed_at),
    reviewedAt: strOrUndefined(row.reviewed_at),
    publishedAt: strOrUndefined(row.published_at),
    createdBy: strOrUndefined(row.created_by),
    supersedesId: strOrUndefined(row.supersedes_id),
    evidenceConfidence: (row.evidence_confidence ??
      undefined) as PersistedMaintenanceRecommendationState["evidenceConfidence"],
    trendConfidence: (row.trend_confidence ??
      undefined) as PersistedMaintenanceRecommendationState["trendConfidence"],
    createsWorkOrder: false,
    isHealthFactor: false,
    calculatesRul: false,
    mutatesCanonicalLifecycle: false,
  };
}

function mapMaintenanceTaxonomyRow(
  row: Record<string, unknown>,
): PersistedMaintenanceTaxonomyEntry {
  return {
    code: String(row.code),
    name: String(row.name),
    description: String(row.description ?? ""),
    category: (row.category ?? "assessment") as PersistedMaintenanceTaxonomyEntry["category"],
    version: String(row.version),
    status: row.status as PersistedMaintenanceTaxonomyEntry["status"],
    applicableAssetClasses: strArray(row.applicable_asset_classes),
    packOwner: String(row.pack_owner),
    replacementCode: strOrUndefined(row.replacement_code),
    redefinesSharedSemantics: false,
    tenantId: strOrUndefined(row.tenant_id),
    workspaceId: strOrUndefined(row.workspace_id),
  };
}

function mapPriorityProfileRow(row: Record<string, unknown>): PersistedPriorityProfile {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    assetId: String(row.asset_id),
    version: Number(row.version),
    snapshotId: strOrUndefined(row.snapshot_id),
    healthRef: strOrUndefined(row.health_ref),
    criticalityRef: strOrUndefined(row.criticality_ref),
    riskSignalRef: strOrUndefined(row.risk_signal_ref),
    failureRefs: strArray(row.failure_refs),
    degradationRefs: strArray(row.degradation_refs),
    lifecycleRef: strOrUndefined(row.lifecycle_ref),
    maintenanceRecommendationRefs: strArray(row.maintenance_recommendation_refs),
    decisionContextRef: String(row.decision_context_ref),
    dimensionStates: (row.dimension_states ??
      []) as PersistedPriorityProfile["dimensionStates"],
    missingDimensions: strArray(row.missing_dimensions),
    conflictingDimensions: strArray(row.conflicting_dimensions),
    priorityClass: row.priority_class as PersistedPriorityProfile["priorityClass"],
    priorityRationale: strArray(row.priority_rationale),
    priorityConfidence: numOrUndefined(row.priority_confidence),
    method: "priority_context_compose_v1",
    methodVersion: "1",
    reviewStatus: String(row.review_status),
    reviewInstanceId: strOrUndefined(row.review_instance_id),
    provenance: (row.provenance ?? {}) as Record<string, unknown>,
    limitations: strArray(row.limitations),
    assessedAt: String(row.assessed_at),
    reviewedAt: strOrUndefined(row.reviewed_at),
    publishedAt: strOrUndefined(row.published_at),
    createdBy: strOrUndefined(row.created_by),
    supersedesId: strOrUndefined(row.supersedes_id),
    evidenceConfidence: (row.evidence_confidence ??
      undefined) as PersistedPriorityProfile["evidenceConfidence"],
    trendConfidence: (row.trend_confidence ??
      undefined) as PersistedPriorityProfile["trendConfidence"],
    isHealthFactor: false,
    impliesPoF: false,
    createsWorkOrder: false,
    mutatesCanonicalLifecycle: false,
  };
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

function mapFailureModeRow(row: Record<string, unknown>): PersistedFailureModeState {
  return {
    kind: "failure_mode",
    stateId: String(row.id),
    assetId: String(row.asset_id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    version: Number(row.version),
    recordedAt: String(row.recorded_at),
    provenance: (row.provenance as PersistedFailureModeState["provenance"]) ?? {
      sourceSystem: "manual.engineering_assessment",
      observedAt: String(row.recorded_at),
    },
    silentIdentityMutationForbidden: true,
    failureModeCode: String(row.failure_mode_code),
    failureModeLabel: String(row.failure_mode_label),
    taxonomyVersion: String(row.taxonomy_version),
    status: row.status as PersistedFailureModeState["status"],
    confidence:
      row.confidence === null || row.confidence === undefined ? undefined : Number(row.confidence),
    method: row.method ? String(row.method) : undefined,
    evidenceConfidenceRef: row.evidence_confidence_ref
      ? String(row.evidence_confidence_ref)
      : undefined,
    evidenceRefs: (row.evidence_refs as string[]) ?? [],
    sourceRefs: (row.source_refs as string[]) ?? [],
    detectionMethodCode: row.detection_method_code ? String(row.detection_method_code) : undefined,
    assessmentType: row.assessment_type as PersistedFailureModeState["assessmentType"],
    reviewStatus: row.review_status as PersistedFailureModeState["reviewStatus"],
    reviewInstanceId: row.review_instance_id ? String(row.review_instance_id) : undefined,
    detectedAt: row.detected_at ? String(row.detected_at) : undefined,
    assessedAt: String(row.assessed_at ?? row.recorded_at),
    reviewedAt: row.reviewed_at ? String(row.reviewed_at) : undefined,
    publishedAt: row.published_at ? String(row.published_at) : undefined,
    limitations: (row.limitations as string[]) ?? [],
    supersedesId: row.supersedes_id ? String(row.supersedes_id) : undefined,
    evidenceConfidence:
      (row.evidence_confidence as PersistedFailureModeState["evidenceConfidence"]) ?? undefined,
    probabilityOfFailureCertified: false,
    accuracyClaimsCertified: false,
    rulClaimsCertified: false,
    aiMayPublishForbidden: true,
    sourceType: row.source_type ? String(row.source_type) : undefined,
    createdBy: row.created_by ? String(row.created_by) : undefined,
  };
}

function mapFailureMechanismRow(row: Record<string, unknown>): PersistedFailureMechanismState {
  return {
    kind: "failure_mechanism",
    stateId: String(row.id),
    assetId: String(row.asset_id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    version: Number(row.version),
    recordedAt: String(row.recorded_at),
    provenance: (row.provenance as PersistedFailureMechanismState["provenance"]) ?? {
      sourceSystem: "manual.engineering_assessment",
      observedAt: String(row.recorded_at),
    },
    silentIdentityMutationForbidden: true,
    mechanismCode: String(row.mechanism_code),
    mechanismLabel: String(row.mechanism_label),
    mechanismCategory: row.mechanism_category ? String(row.mechanism_category) : undefined,
    taxonomyVersion: String(row.taxonomy_version),
    relatedFailureModeCodes: (row.related_failure_mode_codes as string[]) ?? [],
    confidence:
      row.confidence === null || row.confidence === undefined ? undefined : Number(row.confidence),
    method: row.method ? String(row.method) : undefined,
    evidenceRefs: (row.evidence_refs as string[]) ?? [],
    evidenceConfidenceRef: row.evidence_confidence_ref
      ? String(row.evidence_confidence_ref)
      : undefined,
    sourceRefs: (row.source_refs as string[]) ?? [],
    reviewStatus: row.review_status as PersistedFailureMechanismState["reviewStatus"],
    limitations: (row.limitations as string[]) ?? [],
    assessedAt: String(row.assessed_at ?? row.recorded_at),
    reviewedAt: row.reviewed_at ? String(row.reviewed_at) : undefined,
    publishedAt: row.published_at ? String(row.published_at) : undefined,
    evidenceConfidence:
      (row.evidence_confidence as PersistedFailureMechanismState["evidenceConfidence"]) ??
      undefined,
    probabilityOfFailureCertified: false,
    sourceType: row.source_type ? String(row.source_type) : undefined,
    createdBy: row.created_by ? String(row.created_by) : undefined,
    supersedesId: row.supersedes_id ? String(row.supersedes_id) : undefined,
  };
}

function mapFailureTaxonomyRow(row: Record<string, unknown>): PersistedFailureTaxonomyEntry {
  return {
    taxonomyId: String(row.taxonomy_id),
    taxonomyVersion: String(row.taxonomy_version),
    kind: row.kind as PersistedFailureTaxonomyEntry["kind"],
    code: String(row.code),
    name: String(row.name),
    description: String(row.description ?? ""),
    category: row.category ? String(row.category) : undefined,
    parentCode: row.parent_code ? String(row.parent_code) : undefined,
    applicableAssetClasses: (row.applicable_asset_classes as string[]) ?? ["*"],
    sourceStandard: row.source_standard ? String(row.source_standard) : undefined,
    packOwner: String(row.pack_owner),
    status: row.status as PersistedFailureTaxonomyEntry["status"],
    effectiveFrom: String(row.effective_from),
    deprecatedAt: row.deprecated_at ? String(row.deprecated_at) : undefined,
    replacementCode: row.replacement_code ? String(row.replacement_code) : undefined,
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

function mapTimeSeriesRow(row: Record<string, unknown>): PersistedTimeSeries {
  return {
    kind: "engineering_time_series",
    seriesId: String(row.id),
    assetId: String(row.asset_id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    recordedAt: String(row.recorded_at),
    provenance: (row.provenance as PersistedTimeSeries["provenance"]) ?? {
      sourceSystem: "manual.engineering_assessment",
      observedAt: String(row.recorded_at),
    },
    silentIdentityMutationForbidden: true,
    attributeKey: String(row.attribute_key),
    attributeLabel: row.attribute_label ? String(row.attribute_label) : undefined,
    unit: String(row.unit),
    orientation: row.orientation as PersistedTimeSeries["orientation"],
    points: (row.points as PersistedTimeSeries["points"]) ?? [],
    windowStart: row.window_start ? String(row.window_start) : undefined,
    windowEnd: row.window_end ? String(row.window_end) : undefined,
    samplingHint: row.sampling_hint ? String(row.sampling_hint) : undefined,
    sourceRefs: (row.source_refs as string[]) ?? [],
    evidenceRefs: (row.evidence_refs as string[]) ?? [],
    status: row.status as PersistedTimeSeries["status"],
    version: Number(row.version),
    limitations: (row.limitations as string[]) ?? [],
    isSensorRegistry: false,
    isShmRuntime: false,
  };
}

function mapTrendRow(row: Record<string, unknown>): PersistedTrendState {
  return {
    kind: "trend",
    stateId: String(row.id),
    assetId: String(row.asset_id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    version: Number(row.version),
    recordedAt: String(row.recorded_at),
    provenance: (row.provenance as PersistedTrendState["provenance"]) ?? {
      sourceSystem: "manual.engineering_assessment",
      observedAt: String(row.recorded_at),
    },
    silentIdentityMutationForbidden: true,
    seriesId: String(row.series_id ?? ""),
    attributeKey: String(row.attribute_key),
    trendDirection: row.trend_direction as PersistedTrendState["trendDirection"],
    trendClass: row.trend_class as PersistedTrendState["trendClass"],
    slopeHint: row.slope_hint === null || row.slope_hint === undefined ? undefined : Number(row.slope_hint),
    windowStart: row.window_start ? String(row.window_start) : undefined,
    windowEnd: row.window_end ? String(row.window_end) : undefined,
    method: String(row.method ?? "governed_trend_v1"),
    confidence: row.confidence === null || row.confidence === undefined ? undefined : Number(row.confidence),
    trendConfidenceRef: row.trend_confidence_ref ? String(row.trend_confidence_ref) : undefined,
    changeDetectionRef: row.change_detection_ref ? String(row.change_detection_ref) : undefined,
    evidenceRefs: (row.evidence_refs as string[]) ?? [],
    sourceRefs: (row.source_refs as string[]) ?? [],
    reviewStatus: row.review_status as PersistedTrendState["reviewStatus"],
    assessedAt: String(row.assessed_at),
    reviewedAt: row.reviewed_at ? String(row.reviewed_at) : undefined,
    publishedAt: row.published_at ? String(row.published_at) : undefined,
    limitations: (row.limitations as string[]) ?? [],
    predictiveMlUsed: false,
    probabilityOfFailureCertified: false,
    rulClaimsCertified: false,
    accuracyClaimsCertified: false,
    aiMayPublishForbidden: true,
  };
}

function mapDegradationRow(row: Record<string, unknown>): PersistedDegradationState {
  return {
    kind: "degradation",
    stateId: String(row.id),
    assetId: String(row.asset_id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    version: Number(row.version),
    recordedAt: String(row.recorded_at),
    provenance: (row.provenance as PersistedDegradationState["provenance"]) ?? {
      sourceSystem: "manual.engineering_assessment",
      observedAt: String(row.recorded_at),
    },
    silentIdentityMutationForbidden: true,
    seriesId: row.series_id ? String(row.series_id) : undefined,
    trendStateId: row.trend_state_id ? String(row.trend_state_id) : undefined,
    changeDetectionId: row.change_detection_id ? String(row.change_detection_id) : undefined,
    relatedFailureModeCodes: (row.related_failure_mode_codes as string[]) ?? [],
    degradationDirection: row.degradation_direction as PersistedDegradationState["degradationDirection"],
    degradationClass: row.degradation_class as PersistedDegradationState["degradationClass"],
    severityHint: row.severity_hint as PersistedDegradationState["severityHint"],
    mechanismContext: row.mechanism_context ? String(row.mechanism_context) : undefined,
    method: String(row.method ?? "governed_trend_v1"),
    confidence: row.confidence === null || row.confidence === undefined ? undefined : Number(row.confidence),
    trendConfidenceRef: row.trend_confidence_ref ? String(row.trend_confidence_ref) : undefined,
    evidenceConfidenceRef: row.evidence_confidence_ref ? String(row.evidence_confidence_ref) : undefined,
    evidenceRefs: (row.evidence_refs as string[]) ?? [],
    sourceRefs: (row.source_refs as string[]) ?? [],
    reviewStatus: row.review_status as PersistedDegradationState["reviewStatus"],
    reviewInstanceId: row.review_instance_id ? String(row.review_instance_id) : undefined,
    assessedAt: String(row.assessed_at),
    reviewedAt: row.reviewed_at ? String(row.reviewed_at) : undefined,
    publishedAt: row.published_at ? String(row.published_at) : undefined,
    limitations: (row.limitations as string[]) ?? [],
    supersedesId: row.supersedes_id ? String(row.supersedes_id) : undefined,
    createdBy: row.created_by ? String(row.created_by) : undefined,
    predictiveMlUsed: false,
    probabilityOfFailureCertified: false,
    rulClaimsCertified: false,
    accuracyClaimsCertified: false,
    aiMayPublishForbidden: true,
    isFailureModeClaim: false,
  };
}

function mapLifecycleRow(row: Record<string, unknown>): PersistedLifecycleIntelligenceState {
  const payload = (row.payload as Record<string, unknown> | null) ?? {};
  const canonicalLifecycleRef: AssetLifecycleReference = {
    kind: "canonical_lifecycle_reference",
    assetId: String(row.asset_id),
    canonicalLifecycleStage: row.canonical_lifecycle_stage as AssetLifecycleReference["canonicalLifecycleStage"],
    stageVersion: Number(row.canonical_lifecycle_version),
    effectiveAt: row.canonical_lifecycle_effective_at
      ? String(row.canonical_lifecycle_effective_at)
      : String(row.recorded_at),
    sourceOwner: "engineering_os_shared_domain",
    sourceReference: payload.sourceReference ? String(payload.sourceReference) : undefined,
    writeBackForbidden: true,
  };
  return {
    kind: "lifecycle_intelligence",
    stateId: String(row.id),
    assetId: String(row.asset_id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    version: Number(row.version),
    recordedAt: String(row.recorded_at),
    provenance: (row.provenance as PersistedLifecycleIntelligenceState["provenance"]) ?? {
      sourceSystem: "manual.engineering_assessment",
      observedAt: String(row.recorded_at),
    },
    silentIdentityMutationForbidden: true,
    canonicalLifecycleRef,
    lifecycleContextClass:
      row.lifecycle_context_class as PersistedLifecycleIntelligenceState["lifecycleContextClass"],
    lifecycleContextCode: String(row.lifecycle_context_code),
    lifecycleContextRationale: (row.lifecycle_context_rationale as string[]) ?? [],
    operatingState: row.operating_state
      ? (String(row.operating_state) as PersistedLifecycleIntelligenceState["operatingState"])
      : undefined,
    maintenanceState: row.maintenance_state
      ? (String(row.maintenance_state) as PersistedLifecycleIntelligenceState["maintenanceState"])
      : undefined,
    conditionStateRef: row.condition_state_ref ? String(row.condition_state_ref) : undefined,
    reliabilityStateRef: row.reliability_state_ref ? String(row.reliability_state_ref) : undefined,
    failureStateRefs: (row.failure_state_refs as string[]) ?? [],
    trendStateRefs: (row.trend_state_refs as string[]) ?? [],
    degradationStateRefs: (row.degradation_state_refs as string[]) ?? [],
    contributingSlices:
      (row.contributing_slices as PersistedLifecycleIntelligenceState["contributingSlices"]) ?? [],
    missingSlices: (row.missing_slices as string[]) ?? [],
    conflictingSlices: (row.conflicting_slices as string[]) ?? [],
    evidenceConfidenceRef: row.evidence_confidence_ref ? String(row.evidence_confidence_ref) : undefined,
    trendConfidenceRef: row.trend_confidence_ref ? String(row.trend_confidence_ref) : undefined,
    confidence:
      row.confidence === null || row.confidence === undefined ? undefined : Number(row.confidence),
    method: String(row.method),
    methodVersion: String(row.method_version ?? "1"),
    reviewStatus: row.review_status as PersistedLifecycleIntelligenceState["reviewStatus"],
    reviewInstanceId: row.review_instance_id ? String(row.review_instance_id) : undefined,
    evidenceConfidence:
      (row.evidence_confidence as PersistedLifecycleIntelligenceState["evidenceConfidence"]) ??
      undefined,
    trendConfidence:
      (row.trend_confidence as PersistedLifecycleIntelligenceState["trendConfidence"]) ?? undefined,
    assessedAt: String(row.assessed_at ?? row.recorded_at),
    reviewedAt: row.reviewed_at ? String(row.reviewed_at) : undefined,
    publishedAt: row.published_at ? String(row.published_at) : undefined,
    limitations: (row.limitations as string[]) ?? [],
    supersedesId: row.supersedes_id ? String(row.supersedes_id) : undefined,
    serviceAgeContext:
      (row.service_age_context as PersistedLifecycleIntelligenceState["serviceAgeContext"]) ??
      undefined,
    mutatesCanonicalLifecycle: false,
    isHealthFactor: false,
    predictiveMlUsed: false,
    probabilityOfFailureCertified: false,
    rulClaimsCertified: false,
    accuracyClaimsCertified: false,
    aiMayPublishForbidden: true,
    createdBy: row.created_by ? String(row.created_by) : undefined,
  };
}

function mapLifecycleTransitionCandidateRow(
  row: Record<string, unknown>,
): PersistedLifecycleTransitionCandidate {
  return {
    kind: "lifecycle_transition_candidate",
    candidateId: String(row.id),
    assetId: String(row.asset_id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    code: String(row.code),
    label: String(row.label),
    rationale: (row.rationale as string[]) ?? [],
    lifecycleIntelligenceStateId: String(row.lifecycle_state_id ?? ""),
    recommendedReview: row.recommended_review ? String(row.recommended_review) : undefined,
    status: row.status as PersistedLifecycleTransitionCandidate["status"],
    mutatesCanonicalLifecycle: false,
    createdAt: String(row.created_at),
    decidedAt: row.decided_at ? String(row.decided_at) : undefined,
    decidedBy: row.decided_by ? String(row.decided_by) : undefined,
    decisionReason: row.decision_reason ? String(row.decision_reason) : undefined,
  };
}

function mapLifecycleTaxonomyRow(row: Record<string, unknown>): PersistedLifecycleTaxonomyEntry {
  return {
    taxonomyId: String(row.taxonomy_id),
    taxonomyVersion: String(row.taxonomy_version),
    kind: row.kind as PersistedLifecycleTaxonomyEntry["kind"],
    code: String(row.code),
    name: String(row.name),
    description: String(row.description ?? ""),
    category: row.category ? String(row.category) : undefined,
    applicableAssetClasses: (row.applicable_asset_classes as string[]) ?? ["*"],
    status: row.status as PersistedLifecycleTaxonomyEntry["status"],
    sourceStandard: row.source_standard ? String(row.source_standard) : undefined,
    packOwner: String(row.pack_owner),
    effectiveFrom: String(row.effective_from),
    deprecatedAt: row.deprecated_at ? String(row.deprecated_at) : undefined,
    replacementCode: row.replacement_code ? String(row.replacement_code) : undefined,
    tenantId: row.tenant_id ? String(row.tenant_id) : undefined,
    workspaceId: row.workspace_id ? String(row.workspace_id) : undefined,
  };
}
