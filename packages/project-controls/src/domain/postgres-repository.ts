/**
 * Phase 11B — production PostgreSQL/Supabase Project Controls repository.
 * Supabase hosts Postgres; the domain API stays infrastructure-independent.
 *
 * Every table written here is created by batch_62. `project_id` is a foreign key
 * into `engineering_projects`, which this repository never writes.
 */

import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  assertProductionRepositorySafe,
  type IdempotencyRecord,
  type OutboxEventRecord,
  type PersistedProgressAssessment,
  type PersistedProgressEvidence,
  type PersistedProgressReview,
  type PersistedProgressSnapshot,
  type PersistedProgressTimelineEvent,
  type PersistedProjectProfile,
  type ProjectControlsRepositoryPort,
} from "./persistence";
import type { ProjectScopeRef } from "./progress";

type AnyClient = SupabaseClient<any, "public", any>;

const ASSESSMENTS = "project_controls_progress_assessments";
const EVIDENCE = "project_controls_progress_evidence";
const REVIEWS = "project_controls_progress_reviews";
const SNAPSHOTS = "project_controls_progress_snapshots";
const TIMELINE = "project_controls_progress_timeline";
const PROFILES = "project_controls_project_profiles";
const IDEMPOTENCY = "project_controls_idempotency";
const OUTBOX = "project_controls_outbox_events";

export class PostgresProjectControlsRepository implements ProjectControlsRepositoryPort {
  readonly adapterKind = "postgres" as const;

  constructor(private readonly supabase: AnyClient) {
    assertProductionRepositorySafe("postgres");
  }

  newId(_prefix: string): string {
    return randomUUID();
  }

  // ------------------------------------------------------------- assessments

  async saveProgressAssessment(
    state: PersistedProgressAssessment,
  ): Promise<PersistedProgressAssessment> {
    const row = {
      id: state.stateId,
      tenant_id: state.tenantId,
      workspace_id: state.workspaceId,
      project_id: state.projectId,
      scope_kind: state.scope.kind,
      scope_reference_id: state.scope.referenceId ?? null,
      version: state.version,
      status: state.status,
      assessment_class: state.assessmentClass,
      indicated_completion: state.indicatedCompletion ?? null,
      progress_band: state.band ?? null,
      trend_direction: state.trendDirection,
      confidence_class: state.confidence.confidenceClass,
      confidence_score: state.confidence.score,
      data_sufficiency: state.confidence.dataSufficiency,
      confidence_payload: state.confidence,
      evidence_refs: state.evidenceRefs,
      reasons: state.reasons,
      abstained: state.abstained,
      abstention_reason: state.abstentionReason ?? null,
      narrative: state.narrative ?? null,
      method: state.method,
      method_version: state.methodVersion,
      assessed_at: state.assessedAt,
      recorded_at: state.recordedAt,
      reviewed_at: state.reviewedAt ?? null,
      published_at: state.publishedAt ?? null,
      created_by: state.createdBy ?? null,
      supersedes_id: state.supersedesId ?? null,
      workflow_instance_id: state.workflowInstanceId ?? null,
      earned_value_computed: false,
      critical_path_computed: false,
      cost_integrated: false,
      forecast_produced: false,
      schedule_executed: false,
      resource_levelled: false,
      physical_percent_complete_certified: false,
      advisory_only: true,
      mutates_project_identity: false,
    };
    const { data, error } = await this.supabase.from(ASSESSMENTS).insert(row).select("*").single();
    if (error) {
      if (error.code === "23505" || /duplicate key/i.test(error.message)) {
        throw new Error(`optimistic_lock_conflict:${error.message}`);
      }
      throw new Error(`progress_assessment_persist_failed:${error.message}`);
    }
    return mapAssessmentRow(data);
  }

  async getProgressAssessmentById(
    tenantId: string,
    workspaceId: string,
    stateId: string,
  ): Promise<PersistedProgressAssessment | null> {
    const { data, error } = await this.supabase
      .from(ASSESSMENTS)
      .select("*")
      .eq("id", stateId)
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .maybeSingle();
    if (error) throw new Error(`progress_assessment_read_failed:${error.message}`);
    return data ? mapAssessmentRow(data) : null;
  }

  async latestProgressAssessment(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    asOf?: string,
  ): Promise<PersistedProgressAssessment | undefined> {
    let query = this.supabase
      .from(ASSESSMENTS)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("project_id", scope.projectId)
      .eq("scope_kind", scope.kind)
      .order("version", { ascending: false })
      .limit(1);
    query = scope.referenceId
      ? query.eq("scope_reference_id", scope.referenceId)
      : query.is("scope_reference_id", null);
    if (asOf) query = query.lte("recorded_at", asOf);
    const { data, error } = await query;
    if (error) throw new Error(`progress_assessment_read_failed:${error.message}`);
    const row = (data ?? [])[0];
    return row ? mapAssessmentRow(row) : undefined;
  }

  async listProgressAssessments(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedProgressAssessment[]> {
    const { data, error } = await this.supabase
      .from(ASSESSMENTS)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("project_id", projectId)
      .order("recorded_at", { ascending: false });
    if (error) throw new Error(`progress_assessment_list_failed:${error.message}`);
    return (data ?? []).map(mapAssessmentRow);
  }

  async nextProgressAssessmentVersion(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    expectedVersion?: number,
  ): Promise<number> {
    const latest = await this.latestProgressAssessment(tenantId, workspaceId, scope);
    const current = latest?.version ?? 0;
    if (expectedVersion !== undefined && expectedVersion !== current) {
      throw new Error(`optimistic_lock_conflict:expected=${expectedVersion};actual=${current}`);
    }
    return current + 1;
  }

  // ---------------------------------------------------------------- evidence

  async saveProgressEvidence(
    evidence: readonly PersistedProgressEvidence[],
  ): Promise<PersistedProgressEvidence[]> {
    if (evidence.length === 0) return [];
    const rows = evidence.map((item) => ({
      id: item.evidenceId,
      tenant_id: item.tenantId,
      workspace_id: item.workspaceId,
      project_id: item.projectId,
      assessment_id: item.assessmentStateId,
      scope_kind: item.scope.kind,
      scope_reference_id: item.scope.referenceId ?? null,
      evidence_kind: item.kind,
      source_type: item.sourceType,
      source_key: item.sourceKey,
      source_reference: item.sourceReference ?? null,
      observed_at: item.observedAt ?? null,
      narrative: item.narrative ?? null,
      indicated_completion: item.indicatedCompletion ?? null,
      weight: item.weight ?? null,
      review_status: item.reviewStatus ?? "unreviewed",
      revoked: item.revoked ?? false,
      conflicts_with: item.conflictsWith ?? [],
      recorded_at: item.recordedAt,
      created_by: item.createdBy ?? null,
      derived_from_earned_value: false,
      derived_from_cost_data: false,
    }));
    const { data, error } = await this.supabase.from(EVIDENCE).insert(rows).select("*");
    if (error) throw new Error(`progress_evidence_persist_failed:${error.message}`);
    return (data ?? []).map(mapEvidenceRow);
  }

  async listProgressEvidence(
    tenantId: string,
    workspaceId: string,
    assessmentStateId: string,
  ): Promise<PersistedProgressEvidence[]> {
    const { data, error } = await this.supabase
      .from(EVIDENCE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("assessment_id", assessmentStateId);
    if (error) throw new Error(`progress_evidence_read_failed:${error.message}`);
    return (data ?? []).map(mapEvidenceRow);
  }

  // ----------------------------------------------------------------- reviews

  async saveProgressReview(review: PersistedProgressReview): Promise<PersistedProgressReview> {
    const row = {
      id: review.reviewId,
      tenant_id: review.tenantId,
      workspace_id: review.workspaceId,
      project_id: review.projectId,
      assessment_id: review.assessmentStateId,
      workflow_instance_id: review.workflowInstanceId,
      workflow_state: review.workflowState,
      outcome: review.outcome ?? null,
      reviewer_id: review.reviewerId ?? null,
      notes: review.notes ?? null,
      created_at: review.createdAt,
      completed_at: review.completedAt ?? null,
      self_approved: false,
    };
    const { data, error } = await this.supabase.from(REVIEWS).insert(row).select("*").single();
    if (error) throw new Error(`progress_review_persist_failed:${error.message}`);
    return mapReviewRow(data);
  }

  async listProgressReviews(
    tenantId: string,
    workspaceId: string,
    assessmentStateId?: string,
  ): Promise<PersistedProgressReview[]> {
    let query = this.supabase
      .from(REVIEWS)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId);
    if (assessmentStateId) query = query.eq("assessment_id", assessmentStateId);
    const { data, error } = await query;
    if (error) throw new Error(`progress_review_read_failed:${error.message}`);
    return (data ?? []).map(mapReviewRow);
  }

  // --------------------------------------------------------------- snapshots

  async saveProgressSnapshot(
    snapshot: PersistedProgressSnapshot,
  ): Promise<PersistedProgressSnapshot> {
    const row = {
      id: snapshot.snapshotId,
      tenant_id: snapshot.tenantId,
      workspace_id: snapshot.workspaceId,
      project_id: snapshot.projectId,
      schema_version: snapshot.schemaVersion,
      scope_kind: snapshot.scope.kind,
      scope_reference_id: snapshot.scope.referenceId ?? null,
      captured_at: snapshot.capturedAt,
      assessment_id: snapshot.assessmentStateId,
      status: snapshot.status,
      assessment_class: snapshot.assessmentClass,
      indicated_completion: snapshot.indicatedCompletion ?? null,
      progress_band: snapshot.band ?? null,
      confidence_class: snapshot.confidenceClass,
      data_sufficiency: snapshot.dataSufficiency,
      evidence_refs: snapshot.evidenceRefs,
      is_project_registry: false,
      mutates_project_identity: false,
    };
    const { data, error } = await this.supabase.from(SNAPSHOTS).insert(row).select("*").single();
    if (error) throw new Error(`progress_snapshot_persist_failed:${error.message}`);
    return mapSnapshotRow(data);
  }

  async listProgressSnapshots(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedProgressSnapshot[]> {
    const { data, error } = await this.supabase
      .from(SNAPSHOTS)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("project_id", projectId)
      .order("captured_at", { ascending: false });
    if (error) throw new Error(`progress_snapshot_read_failed:${error.message}`);
    return (data ?? []).map(mapSnapshotRow);
  }

  // ---------------------------------------------------------------- timeline

  async appendProgressTimeline(
    entry: PersistedProgressTimelineEvent,
  ): Promise<PersistedProgressTimelineEvent> {
    const row = {
      tenant_id: entry.tenantId,
      workspace_id: entry.workspaceId,
      project_id: entry.projectId,
      entry_id: entry.entryId,
      state_id: entry.stateId ?? null,
      scope_kind: entry.scope.kind,
      scope_reference_id: entry.scope.referenceId ?? null,
      kind: entry.kind,
      event_type: entry.eventType,
      recorded_at: entry.recordedAt,
      source_key: entry.sourceKey,
      actor_id: entry.actorId ?? null,
      detail: entry.detail ?? null,
      governance: entry.governance,
    };
    const { data, error } = await this.supabase.from(TIMELINE).insert(row).select("*").single();
    if (error) throw new Error(`progress_timeline_persist_failed:${error.message}`);
    return mapTimelineRow(data);
  }

  async listProgressTimeline(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedProgressTimelineEvent[]> {
    const { data, error } = await this.supabase
      .from(TIMELINE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("project_id", projectId)
      .order("recorded_at", { ascending: true });
    if (error) throw new Error(`progress_timeline_read_failed:${error.message}`);
    return (data ?? []).map(mapTimelineRow);
  }

  // ---------------------------------------------------------------- profiles

  async saveProjectProfile(profile: PersistedProjectProfile): Promise<PersistedProjectProfile> {
    const row = {
      id: profile.profileId,
      tenant_id: profile.tenantId,
      workspace_id: profile.workspaceId,
      project_id: profile.projectId,
      version: profile.version,
      profile_class: profile.profileClass,
      composed_at: profile.composedAt,
      recorded_at: profile.recordedAt,
      project_code: profile.projectCode,
      project_name: profile.projectName,
      project_phase: profile.projectPhase,
      project_status: profile.projectStatus,
      progress_summary: profile.progress,
      contributors: profile.contributors,
      active_contributor_keys: profile.activeContributorKeys,
      reserved_contributor_keys: profile.reservedContributorKeys,
      reasons: profile.reasons,
      abstained: profile.abstained,
      abstention_reason: profile.abstentionReason ?? null,
      created_by: profile.createdBy ?? null,
      supersedes_id: profile.supersedesId ?? null,
      earned_value_computed: false,
      critical_path_computed: false,
      cost_integrated: false,
      forecast_produced: false,
      advisory_only: true,
      mutates_project_identity: false,
      is_project_registry: false,
    };
    const { data, error } = await this.supabase.from(PROFILES).insert(row).select("*").single();
    if (error) {
      if (error.code === "23505" || /duplicate key/i.test(error.message)) {
        throw new Error(`optimistic_lock_conflict:${error.message}`);
      }
      throw new Error(`project_profile_persist_failed:${error.message}`);
    }
    return mapProfileRow(data);
  }

  async latestProjectProfile(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedProjectProfile | undefined> {
    const { data, error } = await this.supabase
      .from(PROFILES)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("project_id", projectId)
      .order("version", { ascending: false })
      .limit(1);
    if (error) throw new Error(`project_profile_read_failed:${error.message}`);
    const row = (data ?? [])[0];
    return row ? mapProfileRow(row) : undefined;
  }

  async nextProjectProfileVersion(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<number> {
    const latest = await this.latestProjectProfile(tenantId, workspaceId, projectId);
    return (latest?.version ?? 0) + 1;
  }

  // ------------------------------------------------- idempotency and outbox

  async findIdempotency(
    tenantId: string,
    workspaceId: string,
    idempotencyKey: string,
  ): Promise<IdempotencyRecord | null> {
    const { data, error } = await this.supabase
      .from(IDEMPOTENCY)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle();
    if (error) throw new Error(`idempotency_read_failed:${error.message}`);
    if (!data) return null;
    return {
      tenantId: data.tenant_id,
      workspaceId: data.workspace_id,
      idempotencyKey: data.idempotency_key,
      operation: data.operation,
      resourceId: data.resource_id ?? undefined,
      responsePayload: data.response_payload ?? {},
      createdAt: data.created_at,
    };
  }

  async saveIdempotency(record: IdempotencyRecord): Promise<IdempotencyRecord> {
    const { error } = await this.supabase.from(IDEMPOTENCY).insert({
      tenant_id: record.tenantId,
      workspace_id: record.workspaceId,
      idempotency_key: record.idempotencyKey,
      operation: record.operation,
      resource_id: record.resourceId ?? null,
      response_payload: record.responsePayload,
      created_at: record.createdAt,
    });
    if (error) throw new Error(`idempotency_persist_failed:${error.message}`);
    return record;
  }

  async enqueueOutbox(record: OutboxEventRecord): Promise<OutboxEventRecord> {
    const { error } = await this.supabase.from(OUTBOX).insert({
      id: record.outboxId,
      tenant_id: record.tenantId,
      workspace_id: record.workspaceId,
      project_id: record.projectId,
      event_type: record.eventType,
      payload: record.payload,
      correlation_id: record.correlationId ?? null,
      state_id: record.stateId ?? null,
      published: record.published,
      created_at: record.createdAt,
      published_at: record.publishedAt ?? null,
    });
    if (error) throw new Error(`outbox_persist_failed:${error.message}`);
    return record;
  }

  async listOutbox(tenantId: string, workspaceId: string): Promise<OutboxEventRecord[]> {
    const { data, error } = await this.supabase
      .from(OUTBOX)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId);
    if (error) throw new Error(`outbox_read_failed:${error.message}`);
    return (data ?? []).map((row: any) => ({
      outboxId: row.id,
      tenantId: row.tenant_id,
      workspaceId: row.workspace_id,
      projectId: row.project_id,
      eventType: row.event_type,
      payload: row.payload ?? {},
      correlationId: row.correlation_id ?? undefined,
      stateId: row.state_id ?? undefined,
      published: row.published,
      createdAt: row.created_at,
      publishedAt: row.published_at ?? undefined,
    }));
  }
}

export function createPostgresProjectControlsRepository(
  supabase: AnyClient,
): PostgresProjectControlsRepository {
  return new PostgresProjectControlsRepository(supabase);
}

// ---------------------------------------------------------------------------
// Row mappers
// ---------------------------------------------------------------------------

function scopeFromRow(row: any): ProjectScopeRef {
  return {
    kind: row.scope_kind,
    projectId: row.project_id,
    referenceId: row.scope_reference_id ?? undefined,
  };
}

function mapAssessmentRow(row: any): PersistedProgressAssessment {
  return {
    stateId: row.id,
    assessmentId: row.id,
    tenantId: row.tenant_id,
    workspaceId: row.workspace_id,
    projectId: row.project_id,
    scope: scopeFromRow(row),
    version: row.version,
    status: row.status,
    assessmentClass: row.assessment_class,
    indicatedCompletion: row.indicated_completion ?? undefined,
    band: row.progress_band ?? undefined,
    trendDirection: row.trend_direction,
    confidence: row.confidence_payload,
    evidenceRefs: row.evidence_refs ?? [],
    reasons: row.reasons ?? [],
    abstained: row.abstained,
    abstentionReason: row.abstention_reason ?? undefined,
    narrative: row.narrative ?? undefined,
    method: row.method,
    methodVersion: row.method_version,
    assessedAt: row.assessed_at,
    recordedAt: row.recorded_at,
    reviewedAt: row.reviewed_at ?? undefined,
    publishedAt: row.published_at ?? undefined,
    createdBy: row.created_by ?? undefined,
    supersedesId: row.supersedes_id ?? undefined,
    workflowInstanceId: row.workflow_instance_id ?? undefined,
    earnedValueComputed: false,
    criticalPathComputed: false,
    costIntegrated: false,
    forecastProduced: false,
    scheduleExecuted: false,
    resourceLevelled: false,
    physicalPercentCompleteCertified: false,
    paymentCertificationClaimed: false,
    advisoryOnly: true,
    mutatesProjectIdentity: false,
    autonomousPublication: false,
  };
}

function mapEvidenceRow(row: any): PersistedProgressEvidence {
  return {
    evidenceId: row.id,
    tenantId: row.tenant_id,
    workspaceId: row.workspace_id,
    projectId: row.project_id,
    assessmentStateId: row.assessment_id,
    scope: scopeFromRow(row),
    kind: row.evidence_kind,
    sourceType: row.source_type,
    sourceKey: row.source_key,
    sourceReference: row.source_reference ?? undefined,
    observedAt: row.observed_at ?? undefined,
    narrative: row.narrative ?? undefined,
    indicatedCompletion: row.indicated_completion ?? undefined,
    weight: row.weight ?? undefined,
    reviewStatus: row.review_status ?? undefined,
    revoked: row.revoked ?? false,
    conflictsWith: row.conflicts_with ?? [],
    recordedAt: row.recorded_at,
    createdBy: row.created_by ?? undefined,
    derivedFromEarnedValue: false,
    derivedFromCostData: false,
  };
}

function mapReviewRow(row: any): PersistedProgressReview {
  return {
    reviewId: row.id,
    tenantId: row.tenant_id,
    workspaceId: row.workspace_id,
    projectId: row.project_id,
    assessmentStateId: row.assessment_id,
    workflowInstanceId: row.workflow_instance_id,
    workflowState: row.workflow_state,
    outcome: row.outcome ?? undefined,
    reviewerId: row.reviewer_id ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    completedAt: row.completed_at ?? undefined,
    selfApproved: false,
  };
}

function mapSnapshotRow(row: any): PersistedProgressSnapshot {
  return {
    snapshotId: row.id,
    schemaVersion: row.schema_version,
    tenantId: row.tenant_id,
    workspaceId: row.workspace_id,
    projectId: row.project_id,
    scope: scopeFromRow(row),
    capturedAt: row.captured_at,
    assessmentStateId: row.assessment_id,
    status: row.status,
    assessmentClass: row.assessment_class,
    indicatedCompletion: row.indicated_completion ?? undefined,
    band: row.progress_band ?? undefined,
    confidenceClass: row.confidence_class,
    dataSufficiency: row.data_sufficiency,
    evidenceRefs: row.evidence_refs ?? [],
    projectReferenceResolved: true,
    isProjectRegistry: false,
    mutatesProjectIdentity: false,
  };
}

function mapTimelineRow(row: any): PersistedProgressTimelineEvent {
  return {
    entryId: row.entry_id,
    tenantId: row.tenant_id,
    workspaceId: row.workspace_id,
    projectId: row.project_id,
    scope: scopeFromRow(row),
    stateId: row.state_id ?? undefined,
    kind: row.kind,
    eventType: row.event_type,
    recordedAt: row.recorded_at,
    sourceKey: row.source_key,
    actorId: row.actor_id ?? undefined,
    detail: row.detail ?? undefined,
    governance: {
      advisoryOnly: true,
      earnedValueComputed: false,
      criticalPathComputed: false,
      mutatesProjectIdentity: false,
    },
  };
}

function mapProfileRow(row: any): PersistedProjectProfile {
  return {
    profileId: row.id,
    tenantId: row.tenant_id,
    workspaceId: row.workspace_id,
    projectId: row.project_id,
    version: row.version,
    profileClass: row.profile_class,
    composedAt: row.composed_at,
    recordedAt: row.recorded_at,
    projectCode: row.project_code,
    projectName: row.project_name,
    projectPhase: row.project_phase,
    projectStatus: row.project_status,
    progress: row.progress_summary,
    contributors: row.contributors ?? [],
    activeContributorKeys: row.active_contributor_keys ?? [],
    reservedContributorKeys: row.reserved_contributor_keys ?? [],
    reasons: row.reasons ?? [],
    abstained: row.abstained,
    abstentionReason: row.abstention_reason ?? undefined,
    createdBy: row.created_by ?? undefined,
    supersedesId: row.supersedes_id ?? undefined,
    earnedValueComputed: false,
    criticalPathComputed: false,
    costIntegrated: false,
    forecastProduced: false,
    advisoryOnly: true,
    mutatesProjectIdentity: false,
    isProjectRegistry: false,
  };
}
