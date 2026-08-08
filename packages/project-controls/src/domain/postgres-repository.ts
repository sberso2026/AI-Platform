/**
 * Phase 11D — production PostgreSQL/Supabase Project Controls repository.
 * Supabase hosts Postgres; the domain API stays infrastructure-independent.
 *
 * Progress tables are created by batch_62; schedule tables by batch_63; change
 * plus shared project snapshot/timeline tables by batch_64. `project_id` is a
 * foreign key into `engineering_projects`, which this repository never writes.
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
  type PersistedChangeCandidate,
  type PersistedChangeConfidence,
  type PersistedChangeEvidence,
  type PersistedChangeReview,
  type PersistedChangeState,
  type PersistedCostConfidence,
  type PersistedCostEvidence,
  type PersistedCostReview,
  type PersistedCostState,
  type PersistedProductivityConfidence,
  type PersistedProductivityEvidence,
  type PersistedProductivityReview,
  type PersistedProductivityState,
  type PersistedForecastConfidence,
  type PersistedForecastEvidence,
  type PersistedForecastReview,
  type PersistedForecastState,
  type PersistedDecisionConfidence,
  type PersistedDecisionEvidence,
  type PersistedDecisionReview,
  type PersistedDecisionState,
  type PersistedScenarioConfidence,
  type PersistedScenarioEvidence,
  type PersistedScenarioReview,
  type PersistedScenarioState,
  type PersistedRiskOpportunityConfidence,
  type PersistedRiskOpportunityEvidence,
  type PersistedRiskOpportunityReview,
  type PersistedRiskOpportunityState,
  type PersistedAssuranceConfidence,
  type PersistedAssuranceEvidence,
  type PersistedAssuranceReview,
  type PersistedAssuranceState,
  type PersistedExplainabilityConfidence,
  type PersistedExplainabilityEvidence,
  type PersistedExplainabilityReview,
  type PersistedExplainabilityState,
  type PersistedProjectProfile,
  type PersistedProjectSnapshot,
  type PersistedProjectTimelineEvent,
  type PersistedScheduleAssessment,
  type PersistedScheduleEvidence,
  type PersistedScheduleReview,
  type PersistedScheduleSnapshot,
  type PersistedScheduleTimelineEvent,
  type ProjectControlsRepositoryPort,
} from "./persistence";
import type { ChangeClassification } from "./change";
import type { ProjectScopeRef } from "./progress";
import { costStateKey } from "./cost";

type AnyClient = SupabaseClient<any, "public", any>;

const ASSESSMENTS = "project_controls_progress_assessments";
const EVIDENCE = "project_controls_progress_evidence";
const REVIEWS = "project_controls_progress_reviews";
const SNAPSHOTS = "project_controls_progress_snapshots";
const TIMELINE = "project_controls_progress_timeline";
const SCHEDULE_ASSESSMENTS = "project_controls_schedule_assessments";
const SCHEDULE_EVIDENCE = "project_controls_schedule_evidence";
const SCHEDULE_REVIEWS = "project_controls_schedule_reviews";
const SCHEDULE_SNAPSHOTS = "project_controls_schedule_snapshots";
const SCHEDULE_TIMELINE = "project_controls_schedule_timeline";
const CHANGE_STATES = "project_controls_change_states";
const CHANGE_EVIDENCE = "project_controls_change_evidence";
const CHANGE_REVIEWS = "project_controls_change_reviews";
const CHANGE_CONFIDENCE = "project_controls_change_confidence";
const CHANGE_CANDIDATES = "project_controls_change_candidates";
const COST_STATES = "project_controls_cost_states";
const COST_EVIDENCE = "project_controls_cost_evidence";
const COST_REVIEWS = "project_controls_cost_reviews";
const COST_CONFIDENCE = "project_controls_cost_confidence";
const PRODUCTIVITY_STATES = "project_controls_productivity_states";
const PRODUCTIVITY_EVIDENCE = "project_controls_productivity_evidence";
const PRODUCTIVITY_REVIEWS = "project_controls_productivity_reviews";
const PRODUCTIVITY_CONFIDENCE = "project_controls_productivity_confidence";
const FORECAST_STATES = "project_controls_forecast_states";
const FORECAST_EVIDENCE = "project_controls_forecast_evidence";
const FORECAST_REVIEWS = "project_controls_forecast_reviews";
const FORECAST_CONFIDENCE = "project_controls_forecast_confidence";
const DECISION_STATES = "project_controls_decision_states";
const DECISION_EVIDENCE = "project_controls_decision_evidence";
const DECISION_REVIEWS = "project_controls_decision_reviews";
const DECISION_CONFIDENCE = "project_controls_decision_confidence";
const SCENARIO_STATES = "project_controls_scenario_states";
const SCENARIO_EVIDENCE = "project_controls_scenario_evidence";
const SCENARIO_REVIEWS = "project_controls_scenario_reviews";
const SCENARIO_CONFIDENCE = "project_controls_scenario_confidence";
const RISK_OPPORTUNITY_STATES = "project_controls_risk_opportunity_states";
const RISK_OPPORTUNITY_EVIDENCE = "project_controls_risk_opportunity_evidence";
const RISK_OPPORTUNITY_REVIEWS = "project_controls_risk_opportunity_reviews";
const RISK_OPPORTUNITY_CONFIDENCE = "project_controls_risk_opportunity_confidence";
const ASSURANCE_STATES = "project_controls_assurance_states";
const ASSURANCE_EVIDENCE = "project_controls_assurance_evidence";
const ASSURANCE_REVIEWS = "project_controls_assurance_reviews";
const ASSURANCE_CONFIDENCE = "project_controls_assurance_confidence";
const ORGANIZATIONAL_LEARNING_STATES = "project_controls_organizational_learning_states";
const ORGANIZATIONAL_LEARNING_EVIDENCE = "project_controls_organizational_learning_evidence";
const ORGANIZATIONAL_LEARNING_REVIEWS = "project_controls_organizational_learning_reviews";
const ORGANIZATIONAL_LEARNING_CONFIDENCE = "project_controls_organizational_learning_confidence";
const EXPLAINABILITY_STATES = "project_controls_explainability_states";
const EXPLAINABILITY_EVIDENCE = "project_controls_explainability_evidence";
const EXPLAINABILITY_REVIEWS = "project_controls_explainability_reviews";
const EXPLAINABILITY_CONFIDENCE = "project_controls_explainability_confidence";
const PROJECT_SNAPSHOTS = "project_controls_project_snapshots";
const PROJECT_TIMELINE = "project_controls_project_timeline";
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

  // --------------------------------------------------------------- schedule

  async saveScheduleAssessment(
    state: PersistedScheduleAssessment,
  ): Promise<PersistedScheduleAssessment> {
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
      milestone_posture: state.milestonePosture ?? null,
      declared_baseline_date: state.declaredBaselineDate ?? null,
      declared_current_date: state.declaredCurrentDate ?? null,
      declared_date_delta_days: state.declaredDateDeltaDays ?? null,
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
      float_computed: false,
      forward_backward_pass_computed: false,
      cost_integrated: false,
      forecast_produced: false,
      schedule_executed: false,
      resource_levelled: false,
      advisory_only: true,
      mutates_project_identity: false,
      mutates_activity_identity: false,
    };
    const { data, error } = await this.supabase
      .from(SCHEDULE_ASSESSMENTS)
      .insert(row)
      .select("*")
      .single();
    if (error) {
      if (error.code === "23505" || /duplicate key/i.test(error.message)) {
        throw new Error(`optimistic_lock_conflict:${error.message}`);
      }
      throw new Error(`schedule_assessment_persist_failed:${error.message}`);
    }
    return mapScheduleAssessmentRow(data);
  }

  async getScheduleAssessmentById(
    tenantId: string,
    workspaceId: string,
    stateId: string,
  ): Promise<PersistedScheduleAssessment | null> {
    const { data, error } = await this.supabase
      .from(SCHEDULE_ASSESSMENTS)
      .select("*")
      .eq("id", stateId)
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .maybeSingle();
    if (error) throw new Error(`schedule_assessment_read_failed:${error.message}`);
    return data ? mapScheduleAssessmentRow(data) : null;
  }

  async latestScheduleAssessment(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    asOf?: string,
  ): Promise<PersistedScheduleAssessment | undefined> {
    let query = this.supabase
      .from(SCHEDULE_ASSESSMENTS)
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
    if (error) throw new Error(`schedule_assessment_read_failed:${error.message}`);
    const row = (data ?? [])[0];
    return row ? mapScheduleAssessmentRow(row) : undefined;
  }

  async listScheduleAssessments(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedScheduleAssessment[]> {
    const { data, error } = await this.supabase
      .from(SCHEDULE_ASSESSMENTS)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("project_id", projectId)
      .order("recorded_at", { ascending: false });
    if (error) throw new Error(`schedule_assessment_list_failed:${error.message}`);
    return (data ?? []).map(mapScheduleAssessmentRow);
  }

  async nextScheduleAssessmentVersion(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    expectedVersion?: number,
  ): Promise<number> {
    const latest = await this.latestScheduleAssessment(tenantId, workspaceId, scope);
    const current = latest?.version ?? 0;
    if (expectedVersion !== undefined && expectedVersion !== current) {
      throw new Error(`optimistic_lock_conflict:expected=${expectedVersion};actual=${current}`);
    }
    return current + 1;
  }

  async saveScheduleEvidence(
    evidence: readonly PersistedScheduleEvidence[],
  ): Promise<PersistedScheduleEvidence[]> {
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
      declared_baseline_date: item.declaredBaselineDate ?? null,
      declared_current_date: item.declaredCurrentDate ?? null,
      declared_posture: item.declaredPosture ?? null,
      weight: item.weight ?? null,
      review_status: item.reviewStatus ?? "unreviewed",
      revoked: item.revoked ?? false,
      conflicts_with: item.conflictsWith ?? [],
      recorded_at: item.recordedAt,
      created_by: item.createdBy ?? null,
      derived_from_cpm: false,
      derived_from_float: false,
      derived_from_earned_value: false,
      mutates_activity_identity: false,
    }));
    const { data, error } = await this.supabase.from(SCHEDULE_EVIDENCE).insert(rows).select("*");
    if (error) throw new Error(`schedule_evidence_persist_failed:${error.message}`);
    return (data ?? []).map(mapScheduleEvidenceRow);
  }

  async listScheduleEvidence(
    tenantId: string,
    workspaceId: string,
    assessmentStateId: string,
  ): Promise<PersistedScheduleEvidence[]> {
    const { data, error } = await this.supabase
      .from(SCHEDULE_EVIDENCE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("assessment_id", assessmentStateId);
    if (error) throw new Error(`schedule_evidence_read_failed:${error.message}`);
    return (data ?? []).map(mapScheduleEvidenceRow);
  }

  async saveScheduleReview(review: PersistedScheduleReview): Promise<PersistedScheduleReview> {
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
    const { data, error } = await this.supabase.from(SCHEDULE_REVIEWS).insert(row).select("*").single();
    if (error) throw new Error(`schedule_review_persist_failed:${error.message}`);
    return mapScheduleReviewRow(data);
  }

  async listScheduleReviews(
    tenantId: string,
    workspaceId: string,
    assessmentStateId?: string,
  ): Promise<PersistedScheduleReview[]> {
    let query = this.supabase
      .from(SCHEDULE_REVIEWS)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId);
    if (assessmentStateId) query = query.eq("assessment_id", assessmentStateId);
    const { data, error } = await query;
    if (error) throw new Error(`schedule_review_read_failed:${error.message}`);
    return (data ?? []).map(mapScheduleReviewRow);
  }

  async saveScheduleSnapshot(
    snapshot: PersistedScheduleSnapshot,
  ): Promise<PersistedScheduleSnapshot> {
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
      milestone_posture: snapshot.milestonePosture ?? null,
      confidence_class: snapshot.confidenceClass,
      data_sufficiency: snapshot.dataSufficiency,
      evidence_refs: snapshot.evidenceRefs,
      is_project_registry: false,
      mutates_project_identity: false,
      critical_path_computed: false,
      float_computed: false,
    };
    const { data, error } = await this.supabase.from(SCHEDULE_SNAPSHOTS).insert(row).select("*").single();
    if (error) throw new Error(`schedule_snapshot_persist_failed:${error.message}`);
    return mapScheduleSnapshotRow(data);
  }

  async listScheduleSnapshots(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedScheduleSnapshot[]> {
    const { data, error } = await this.supabase
      .from(SCHEDULE_SNAPSHOTS)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("project_id", projectId)
      .order("captured_at", { ascending: false });
    if (error) throw new Error(`schedule_snapshot_read_failed:${error.message}`);
    return (data ?? []).map(mapScheduleSnapshotRow);
  }

  async appendScheduleTimeline(
    entry: PersistedScheduleTimelineEvent,
  ): Promise<PersistedScheduleTimelineEvent> {
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
    const { data, error } = await this.supabase.from(SCHEDULE_TIMELINE).insert(row).select("*").single();
    if (error) throw new Error(`schedule_timeline_persist_failed:${error.message}`);
    return mapScheduleTimelineRow(data);
  }

  async listScheduleTimeline(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedScheduleTimelineEvent[]> {
    const { data, error } = await this.supabase
      .from(SCHEDULE_TIMELINE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("project_id", projectId)
      .order("recorded_at", { ascending: true });
    if (error) throw new Error(`schedule_timeline_read_failed:${error.message}`);
    return (data ?? []).map(mapScheduleTimelineRow);
  }

  // ------------------------------------------------------------------ change

  async saveChangeState(state: PersistedChangeState): Promise<PersistedChangeState> {
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
      change_class: state.changeClass,
      change_status_context: state.changeStatusContext,
      authoritative_change_ref: state.authoritativeChangeRef ?? null,
      candidate_id: state.candidateId ?? null,
      impact_contexts: state.impact,
      confidence_class: state.confidence.confidenceClass,
      confidence_score: state.confidence.score,
      data_sufficiency: state.confidence.dataSufficiency,
      confidence_payload: state.confidence,
      evidence_refs: state.evidenceRefs,
      reasons: state.reasons,
      limitations: state.limitations,
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
      float_computed: false,
      cost_integrated: false,
      budget_mutated: false,
      financial_posting_performed: false,
      forecast_produced: false,
      contingency_drawn: false,
      change_executed: false,
      contractual_approval_claimed: false,
      contractual_authority_claimed: false,
      core_risk_mutated: false,
      advisory_only: true,
      mutates_project_identity: false,
    };
    const { data, error } = await this.supabase
      .from(CHANGE_STATES)
      .insert(row)
      .select("*")
      .single();
    if (error) {
      if (error.code === "23505" || /duplicate key/i.test(error.message)) {
        throw new Error(`optimistic_lock_conflict:${error.message}`);
      }
      throw new Error(`change_state_persist_failed:${error.message}`);
    }
    return mapChangeStateRow(data);
  }

  async getChangeStateById(
    tenantId: string,
    workspaceId: string,
    stateId: string,
  ): Promise<PersistedChangeState | null> {
    const { data, error } = await this.supabase
      .from(CHANGE_STATES)
      .select("*")
      .eq("id", stateId)
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .maybeSingle();
    if (error) throw new Error(`change_state_read_failed:${error.message}`);
    return data ? mapChangeStateRow(data) : null;
  }

  async latestChangeState(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    changeClass: ChangeClassification,
    asOf?: string,
  ): Promise<PersistedChangeState | undefined> {
    let query = this.supabase
      .from(CHANGE_STATES)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("project_id", scope.projectId)
      .eq("scope_kind", scope.kind)
      .eq("change_class", changeClass)
      .order("version", { ascending: false })
      .limit(1);
    query = scope.referenceId
      ? query.eq("scope_reference_id", scope.referenceId)
      : query.is("scope_reference_id", null);
    if (asOf) query = query.lte("recorded_at", asOf);
    const { data, error } = await query;
    if (error) throw new Error(`change_state_read_failed:${error.message}`);
    const row = (data ?? [])[0];
    return row ? mapChangeStateRow(row) : undefined;
  }

  async listChangeStates(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedChangeState[]> {
    const { data, error } = await this.supabase
      .from(CHANGE_STATES)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("project_id", projectId)
      .order("recorded_at", { ascending: false });
    if (error) throw new Error(`change_state_list_failed:${error.message}`);
    return (data ?? []).map(mapChangeStateRow);
  }

  async nextChangeStateVersion(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    changeClass: ChangeClassification,
    expectedVersion?: number,
  ): Promise<number> {
    const latest = await this.latestChangeState(tenantId, workspaceId, scope, changeClass);
    const current = latest?.version ?? 0;
    if (expectedVersion !== undefined && expectedVersion !== current) {
      throw new Error(`optimistic_lock_conflict:expected=${expectedVersion};actual=${current}`);
    }
    return current + 1;
  }

  async saveChangeEvidence(
    evidence: readonly PersistedChangeEvidence[],
  ): Promise<PersistedChangeEvidence[]> {
    if (evidence.length === 0) return [];
    const rows = evidence.map((item) => ({
      id: item.evidenceId,
      tenant_id: item.tenantId,
      workspace_id: item.workspaceId,
      project_id: item.projectId,
      change_state_id: item.changeStateId,
      scope_kind: item.scope.kind,
      scope_reference_id: item.scope.referenceId ?? null,
      evidence_kind: item.kind,
      source_type: item.sourceType,
      source_ref: item.sourceRef,
      source_key: item.sourceKey,
      source_version: item.sourceVersion ?? null,
      provenance: item.provenance,
      review_status: item.reviewStatus,
      observed_at: item.observedAt ?? null,
      confidence: item.confidence ?? null,
      weight: item.weight ?? null,
      declared_change_class: item.declaredChangeClass ?? null,
      declared_status_context: item.declaredStatusContext ?? null,
      narrative: item.narrative ?? null,
      revoked: item.revoked ?? false,
      conflicts_with: item.conflictsWith ?? [],
      recorded_at: item.recordedAt,
      created_by: item.createdBy ?? null,
      derived_from_earned_value: false,
      mutates_core_risk: false,
      mutates_budget: false,
      contractual_approval_claimed: false,
    }));
    const { data, error } = await this.supabase.from(CHANGE_EVIDENCE).insert(rows).select("*");
    if (error) throw new Error(`change_evidence_persist_failed:${error.message}`);
    return (data ?? []).map(mapChangeEvidenceRow);
  }

  async listChangeEvidence(
    tenantId: string,
    workspaceId: string,
    changeStateId: string,
  ): Promise<PersistedChangeEvidence[]> {
    const { data, error } = await this.supabase
      .from(CHANGE_EVIDENCE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("change_state_id", changeStateId);
    if (error) throw new Error(`change_evidence_read_failed:${error.message}`);
    return (data ?? []).map(mapChangeEvidenceRow);
  }

  async saveChangeReview(review: PersistedChangeReview): Promise<PersistedChangeReview> {
    const row = {
      id: review.reviewId,
      tenant_id: review.tenantId,
      workspace_id: review.workspaceId,
      project_id: review.projectId,
      change_state_id: review.changeStateId,
      workflow_instance_id: review.workflowInstanceId,
      workflow_state: review.workflowState,
      outcome: review.outcome ?? null,
      reviewer_id: review.reviewerId ?? null,
      notes: review.notes ?? null,
      created_at: review.createdAt,
      completed_at: review.completedAt ?? null,
      self_approved: false,
      contractual_approval_claimed: false,
    };
    const { data, error } = await this.supabase
      .from(CHANGE_REVIEWS)
      .insert(row)
      .select("*")
      .single();
    if (error) throw new Error(`change_review_persist_failed:${error.message}`);
    return mapChangeReviewRow(data);
  }

  async listChangeReviews(
    tenantId: string,
    workspaceId: string,
    changeStateId?: string,
  ): Promise<PersistedChangeReview[]> {
    let query = this.supabase
      .from(CHANGE_REVIEWS)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId);
    if (changeStateId) query = query.eq("change_state_id", changeStateId);
    const { data, error } = await query;
    if (error) throw new Error(`change_review_read_failed:${error.message}`);
    return (data ?? []).map(mapChangeReviewRow);
  }

  async saveChangeConfidence(
    confidence: PersistedChangeConfidence,
  ): Promise<PersistedChangeConfidence> {
    const row = {
      id: confidence.confidenceId,
      tenant_id: confidence.tenantId,
      workspace_id: confidence.workspaceId,
      project_id: confidence.projectId,
      change_state_id: confidence.changeStateId,
      scope_kind: confidence.scope.kind,
      scope_reference_id: confidence.scope.referenceId ?? null,
      score: confidence.score,
      confidence_class: confidence.confidenceClass,
      data_sufficiency: confidence.dataSufficiency,
      evidence_count: confidence.evidenceCount,
      usable_evidence_count: confidence.usableEvidenceCount,
      source_diversity: confidence.sourceDiversity,
      freshness: confidence.freshness,
      review_completeness: confidence.reviewCompleteness,
      provenance_quality: confidence.provenanceQuality,
      agreement: confidence.agreement,
      conflict_state: confidence.conflictState,
      abstention: confidence.abstention,
      abstention_reason: confidence.abstentionReason ?? null,
      reasons: confidence.reasons,
      method: confidence.method,
      method_version: confidence.methodVersion,
      assessed_at: confidence.assessedAt,
      recorded_at: confidence.recordedAt,
      engineering_correctness_claimed: false,
      contractual_certainty_claimed: false,
    };
    const { data, error } = await this.supabase
      .from(CHANGE_CONFIDENCE)
      .insert(row)
      .select("*")
      .single();
    if (error) throw new Error(`change_confidence_persist_failed:${error.message}`);
    return mapChangeConfidenceRow(data);
  }

  async listChangeConfidence(
    tenantId: string,
    workspaceId: string,
    changeStateId: string,
  ): Promise<PersistedChangeConfidence[]> {
    const { data, error } = await this.supabase
      .from(CHANGE_CONFIDENCE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("change_state_id", changeStateId);
    if (error) throw new Error(`change_confidence_read_failed:${error.message}`);
    return (data ?? []).map(mapChangeConfidenceRow);
  }

  async saveChangeCandidate(
    candidate: PersistedChangeCandidate,
  ): Promise<PersistedChangeCandidate> {
    const row = {
      id: candidate.candidateId,
      tenant_id: candidate.tenantId,
      workspace_id: candidate.workspaceId,
      project_id: candidate.projectId,
      scope_kind: candidate.scope.kind,
      scope_reference_id: candidate.scope.referenceId ?? null,
      change_class: candidate.changeClass,
      status: candidate.status,
      signal_refs: candidate.signalRefs,
      title: candidate.title ?? null,
      narrative: candidate.narrative ?? null,
      created_at: candidate.createdAt,
      created_by: candidate.createdBy ?? null,
      supersedes_id: candidate.supersedesId ?? null,
      is_approved_change: false,
      contractual_approval_claimed: false,
      mutates_budget: false,
      derived_from_earned_value: false,
    };
    const { data, error } = await this.supabase
      .from(CHANGE_CANDIDATES)
      .insert(row)
      .select("*")
      .single();
    if (error) throw new Error(`change_candidate_persist_failed:${error.message}`);
    return mapChangeCandidateRow(data);
  }

  async getChangeCandidateById(
    tenantId: string,
    workspaceId: string,
    candidateId: string,
  ): Promise<PersistedChangeCandidate | null> {
    const { data, error } = await this.supabase
      .from(CHANGE_CANDIDATES)
      .select("*")
      .eq("id", candidateId)
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .maybeSingle();
    if (error) throw new Error(`change_candidate_read_failed:${error.message}`);
    return data ? mapChangeCandidateRow(data) : null;
  }

  async listChangeCandidates(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedChangeCandidate[]> {
    const { data, error } = await this.supabase
      .from(CHANGE_CANDIDATES)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(`change_candidate_list_failed:${error.message}`);
    return (data ?? []).map(mapChangeCandidateRow);
  }

  // ------------------------------------------------------------------ cost

  async saveCostState(state: PersistedCostState): Promise<PersistedCostState> {
    const ctx = state.controlContext;
    const row = {
      id: state.stateId,
      tenant_id: state.tenantId,
      workspace_id: state.workspaceId,
      project_id: state.projectId,
      scope_kind: ctx.scope.kind,
      scope_reference_id: ctx.scope.referenceId ?? null,
      account_id: ctx.accountRef.accountId,
      account_code: ctx.accountRef.accountCode ?? null,
      currency_code: ctx.currencyCode,
      version: state.version,
      status: state.status,
      assessment_class: state.assessmentClass,
      cost_posture: state.costPosture,
      variance_attribution: state.varianceAttribution,
      cost_basis_ref: state.costBasisRef ?? null,
      control_context: ctx,
      change_intelligence_refs: state.changeIntelligenceRefs,
      confidence_class: state.confidence.confidenceClass,
      confidence_score: state.confidence.score,
      data_sufficiency: state.confidence.dataSufficiency,
      confidence_payload: state.confidence,
      evidence_refs: state.evidenceRefs,
      reasons: state.reasons,
      limitations: state.limitations,
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
      float_computed: false,
      budget_mutated: false,
      financial_posting_performed: false,
      forecast_produced: false,
      contingency_drawn: false,
      change_executed: false,
      schedule_executed: false,
      advisory_only: true,
      mutates_project_identity: false,
    };
    const { data, error } = await this.supabase.from(COST_STATES).insert(row).select("*").single();
    if (error) throw new Error(`cost_state_persist_failed:${error.message}`);
    return mapCostStateRow(data);
  }

  async getCostStateById(
    tenantId: string,
    workspaceId: string,
    stateId: string,
  ): Promise<PersistedCostState | null> {
    const { data, error } = await this.supabase
      .from(COST_STATES)
      .select("*")
      .eq("id", stateId)
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .maybeSingle();
    if (error) throw new Error(`cost_state_read_failed:${error.message}`);
    return data ? mapCostStateRow(data) : null;
  }

  async latestCostState(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    accountId: string,
    asOf?: string,
  ): Promise<PersistedCostState | undefined> {
    let query = this.supabase
      .from(COST_STATES)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("project_id", scope.projectId)
      .eq("scope_kind", scope.kind)
      .eq("account_id", accountId)
      .order("version", { ascending: false })
      .limit(1);
    query = scope.referenceId
      ? query.eq("scope_reference_id", scope.referenceId)
      : query.is("scope_reference_id", null);
    if (asOf) query = query.lte("recorded_at", asOf);
    const { data, error } = await query;
    if (error) throw new Error(`cost_state_read_failed:${error.message}`);
    const row = (data ?? [])[0];
    return row ? mapCostStateRow(row) : undefined;
  }

  async listCostStates(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedCostState[]> {
    const { data, error } = await this.supabase
      .from(COST_STATES)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("project_id", projectId)
      .order("recorded_at", { ascending: false });
    if (error) throw new Error(`cost_state_list_failed:${error.message}`);
    return (data ?? []).map(mapCostStateRow);
  }

  async nextCostStateVersion(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    accountId: string,
    expectedVersion?: number,
  ): Promise<number> {
    const latest = await this.latestCostState(tenantId, workspaceId, scope, accountId);
    const current = latest?.version ?? 0;
    if (expectedVersion !== undefined && expectedVersion !== current) {
      throw new Error(`optimistic_lock_conflict:expected=${expectedVersion};actual=${current}`);
    }
    return current + 1;
  }

  async saveCostEvidence(
    evidence: readonly PersistedCostEvidence[],
  ): Promise<PersistedCostEvidence[]> {
    if (evidence.length === 0) return [];
    const rows = evidence.map((item) => ({
      id: item.evidenceId,
      tenant_id: item.tenantId,
      workspace_id: item.workspaceId,
      project_id: item.projectId,
      cost_state_id: item.costStateId,
      evidence_kind: item.kind,
      source_type: item.sourceType,
      source_ref: item.sourceRef,
      source_key: item.sourceKey,
      source_version: item.sourceVersion ?? null,
      provenance: item.provenance,
      review_status: item.reviewStatus,
      observed_at: item.observedAt ?? null,
      currency_code: item.currencyCode,
      declared_direction: item.declaredDirection ?? null,
      confidence: item.confidence ?? null,
      weight: item.weight ?? null,
      narrative: item.narrative ?? null,
      revoked: item.revoked ?? false,
      conflicts_with: item.conflictsWith ?? [],
      recorded_at: item.recordedAt,
      created_by: item.createdBy ?? null,
      derived_from_earned_value: false,
      mutates_core_risk: false,
      mutates_budget: false,
      financial_posting_claimed: false,
      forecast_derived: false,
    }));
    const { data, error } = await this.supabase.from(COST_EVIDENCE).insert(rows).select("*");
    if (error) throw new Error(`cost_evidence_persist_failed:${error.message}`);
    return (data ?? []).map(mapCostEvidenceRow);
  }

  async listCostEvidence(
    tenantId: string,
    workspaceId: string,
    costStateId: string,
  ): Promise<PersistedCostEvidence[]> {
    const { data, error } = await this.supabase
      .from(COST_EVIDENCE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("cost_state_id", costStateId);
    if (error) throw new Error(`cost_evidence_read_failed:${error.message}`);
    return (data ?? []).map(mapCostEvidenceRow);
  }

  async saveCostReview(review: PersistedCostReview): Promise<PersistedCostReview> {
    const row = {
      id: review.reviewId,
      tenant_id: review.tenantId,
      workspace_id: review.workspaceId,
      project_id: review.projectId,
      cost_state_id: review.costStateId,
      workflow_instance_id: review.workflowInstanceId,
      workflow_state: review.workflowState,
      outcome: review.outcome ?? null,
      reviewer_id: review.reviewerId ?? null,
      notes: review.notes ?? null,
      created_at: review.createdAt,
      completed_at: review.completedAt ?? null,
      self_approved: false,
      financial_posting_claimed: false,
    };
    const { data, error } = await this.supabase.from(COST_REVIEWS).insert(row).select("*").single();
    if (error) throw new Error(`cost_review_persist_failed:${error.message}`);
    return mapCostReviewRow(data);
  }

  async listCostReviews(
    tenantId: string,
    workspaceId: string,
    costStateId?: string,
  ): Promise<PersistedCostReview[]> {
    let query = this.supabase
      .from(COST_REVIEWS)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId);
    if (costStateId) query = query.eq("cost_state_id", costStateId);
    const { data, error } = await query;
    if (error) throw new Error(`cost_review_read_failed:${error.message}`);
    return (data ?? []).map(mapCostReviewRow);
  }

  async saveCostConfidence(
    confidence: PersistedCostConfidence,
  ): Promise<PersistedCostConfidence> {
    const row = {
      id: confidence.confidenceId,
      tenant_id: confidence.tenantId,
      workspace_id: confidence.workspaceId,
      project_id: confidence.projectId,
      cost_state_id: confidence.costStateId,
      confidence_payload: confidence,
      recorded_at: confidence.recordedAt,
    };
    const { data, error } = await this.supabase
      .from(COST_CONFIDENCE)
      .insert(row)
      .select("*")
      .single();
    if (error) throw new Error(`cost_confidence_persist_failed:${error.message}`);
    return { ...confidence, costStateId: data.cost_state_id, recordedAt: data.recorded_at };
  }

  async listCostConfidence(
    tenantId: string,
    workspaceId: string,
    costStateId: string,
  ): Promise<PersistedCostConfidence[]> {
    const { data, error } = await this.supabase
      .from(COST_CONFIDENCE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("cost_state_id", costStateId);
    if (error) throw new Error(`cost_confidence_read_failed:${error.message}`);
    return (data ?? []).map((row) => ({
      ...(row.confidence_payload as PersistedCostConfidence),
      costStateId: row.cost_state_id,
      recordedAt: row.recorded_at,
    }));
  }

  // ----------------------------------------------------------- productivity

  async saveProductivityState(
    state: PersistedProductivityState,
  ): Promise<PersistedProductivityState> {
    const ctx = state.controlContext;
    const row = {
      id: state.stateId,
      tenant_id: state.tenantId,
      workspace_id: state.workspaceId,
      project_id: state.projectId,
      scope_kind: ctx.scope.kind,
      scope_reference_id: ctx.scope.referenceId ?? null,
      control_unit_id: ctx.controlUnitId,
      control_unit_label: ctx.controlUnitLabel ?? null,
      version: state.version,
      status: state.status,
      assessment_class: state.assessmentClass,
      productivity_posture: state.productivityPosture,
      control_context: ctx,
      factors: state.factors,
      confidence_class: state.confidence.confidenceClass,
      confidence_score: state.confidence.score,
      data_sufficiency: state.confidence.dataSufficiency,
      confidence_payload: state.confidence,
      evidence_refs: state.evidenceRefs,
      reasons: state.reasons,
      limitations: state.limitations,
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
      float_computed: false,
      workforce_management_performed: false,
      timesheet_processed: false,
      payroll_processed: false,
      resource_planning_performed: false,
      labour_cost_computed: false,
      labour_productivity_percent_computed: false,
      forecast_produced: false,
      financial_posting_performed: false,
      change_executed: false,
      schedule_executed: false,
      advisory_only: true,
      mutates_project_identity: false,
    };
    const { data, error } = await this.supabase
      .from(PRODUCTIVITY_STATES)
      .insert(row)
      .select("*")
      .single();
    if (error) throw new Error(`productivity_state_persist_failed:${error.message}`);
    return mapProductivityStateRow(data);
  }

  async getProductivityStateById(
    tenantId: string,
    workspaceId: string,
    stateId: string,
  ): Promise<PersistedProductivityState | null> {
    const { data, error } = await this.supabase
      .from(PRODUCTIVITY_STATES)
      .select("*")
      .eq("id", stateId)
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .maybeSingle();
    if (error) throw new Error(`productivity_state_read_failed:${error.message}`);
    return data ? mapProductivityStateRow(data) : null;
  }

  async latestProductivityState(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    controlUnitId: string,
    asOf?: string,
  ): Promise<PersistedProductivityState | undefined> {
    let query = this.supabase
      .from(PRODUCTIVITY_STATES)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("project_id", scope.projectId)
      .eq("scope_kind", scope.kind)
      .eq("control_unit_id", controlUnitId)
      .order("version", { ascending: false })
      .limit(1);
    query = scope.referenceId
      ? query.eq("scope_reference_id", scope.referenceId)
      : query.is("scope_reference_id", null);
    if (asOf) query = query.lte("recorded_at", asOf);
    const { data, error } = await query;
    if (error) throw new Error(`productivity_state_read_failed:${error.message}`);
    const row = (data ?? [])[0];
    return row ? mapProductivityStateRow(row) : undefined;
  }

  async listProductivityStates(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedProductivityState[]> {
    const { data, error } = await this.supabase
      .from(PRODUCTIVITY_STATES)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("project_id", projectId)
      .order("recorded_at", { ascending: false });
    if (error) throw new Error(`productivity_state_list_failed:${error.message}`);
    return (data ?? []).map(mapProductivityStateRow);
  }

  async nextProductivityStateVersion(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    controlUnitId: string,
    expectedVersion?: number,
  ): Promise<number> {
    const latest = await this.latestProductivityState(
      tenantId,
      workspaceId,
      scope,
      controlUnitId,
    );
    const current = latest?.version ?? 0;
    if (expectedVersion !== undefined && expectedVersion !== current) {
      throw new Error(`optimistic_lock_conflict:expected=${expectedVersion};actual=${current}`);
    }
    return current + 1;
  }

  async saveProductivityEvidence(
    evidence: readonly PersistedProductivityEvidence[],
  ): Promise<PersistedProductivityEvidence[]> {
    if (evidence.length === 0) return [];
    const rows = evidence.map((item) => ({
      id: item.evidenceId,
      tenant_id: item.tenantId,
      workspace_id: item.workspaceId,
      project_id: item.projectId,
      productivity_state_id: item.productivityStateId,
      evidence_kind: item.kind,
      source_type: item.sourceType,
      source_ref: item.sourceRef,
      source_key: item.sourceKey,
      source_version: item.sourceVersion ?? null,
      provenance: item.provenance,
      review_status: item.reviewStatus,
      observed_at: item.observedAt ?? null,
      declared_trend: item.declaredTrend ?? null,
      confidence: item.confidence ?? null,
      weight: item.weight ?? null,
      narrative: item.narrative ?? null,
      revoked: item.revoked ?? false,
      conflicts_with: item.conflictsWith ?? [],
      recorded_at: item.recordedAt,
      created_by: item.createdBy ?? null,
      derived_from_timesheet: false,
      derived_from_payroll: false,
      labour_productivity_percent_claimed: false,
      resource_planning_claimed: false,
      forecast_derived: false,
      earned_value_derived: false,
    }));
    const { data, error } = await this.supabase.from(PRODUCTIVITY_EVIDENCE).insert(rows).select("*");
    if (error) throw new Error(`productivity_evidence_persist_failed:${error.message}`);
    return (data ?? []).map(mapProductivityEvidenceRow);
  }

  async listProductivityEvidence(
    tenantId: string,
    workspaceId: string,
    productivityStateId: string,
  ): Promise<PersistedProductivityEvidence[]> {
    const { data, error } = await this.supabase
      .from(PRODUCTIVITY_EVIDENCE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("productivity_state_id", productivityStateId);
    if (error) throw new Error(`productivity_evidence_read_failed:${error.message}`);
    return (data ?? []).map(mapProductivityEvidenceRow);
  }

  async saveProductivityReview(
    review: PersistedProductivityReview,
  ): Promise<PersistedProductivityReview> {
    const row = {
      id: review.reviewId,
      tenant_id: review.tenantId,
      workspace_id: review.workspaceId,
      project_id: review.projectId,
      productivity_state_id: review.productivityStateId,
      workflow_instance_id: review.workflowInstanceId,
      workflow_state: review.workflowState,
      outcome: review.outcome ?? null,
      reviewer_id: review.reviewerId ?? null,
      notes: review.notes ?? null,
      created_at: review.createdAt,
      completed_at: review.completedAt ?? null,
      self_approved: false,
      workforce_management_claimed: false,
    };
    const { data, error } = await this.supabase
      .from(PRODUCTIVITY_REVIEWS)
      .insert(row)
      .select("*")
      .single();
    if (error) throw new Error(`productivity_review_persist_failed:${error.message}`);
    return mapProductivityReviewRow(data);
  }

  async listProductivityReviews(
    tenantId: string,
    workspaceId: string,
    productivityStateId?: string,
  ): Promise<PersistedProductivityReview[]> {
    let query = this.supabase
      .from(PRODUCTIVITY_REVIEWS)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId);
    if (productivityStateId) query = query.eq("productivity_state_id", productivityStateId);
    const { data, error } = await query;
    if (error) throw new Error(`productivity_review_read_failed:${error.message}`);
    return (data ?? []).map(mapProductivityReviewRow);
  }

  async saveProductivityConfidence(
    confidence: PersistedProductivityConfidence,
  ): Promise<PersistedProductivityConfidence> {
    const row = {
      id: confidence.confidenceId,
      tenant_id: confidence.tenantId,
      workspace_id: confidence.workspaceId,
      project_id: confidence.projectId,
      productivity_state_id: confidence.productivityStateId,
      confidence_payload: confidence,
      recorded_at: confidence.recordedAt,
    };
    const { data, error } = await this.supabase
      .from(PRODUCTIVITY_CONFIDENCE)
      .insert(row)
      .select("*")
      .single();
    if (error) throw new Error(`productivity_confidence_persist_failed:${error.message}`);
    return {
      ...confidence,
      productivityStateId: data.productivity_state_id,
      recordedAt: data.recorded_at,
    };
  }

  async listProductivityConfidence(
    tenantId: string,
    workspaceId: string,
    productivityStateId: string,
  ): Promise<PersistedProductivityConfidence[]> {
    const { data, error } = await this.supabase
      .from(PRODUCTIVITY_CONFIDENCE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("productivity_state_id", productivityStateId);
    if (error) throw new Error(`productivity_confidence_read_failed:${error.message}`);
    return (data ?? []).map((row) => ({
      ...(row.confidence_payload as PersistedProductivityConfidence),
      productivityStateId: row.productivity_state_id,
      recordedAt: row.recorded_at,
    }));
  }

  // ----------------------------------------------------------- forecast

  async saveForecastState(
    state: PersistedForecastState,
  ): Promise<PersistedForecastState> {
    const ctx = state.controlContext;
    const row = {
      id: state.stateId,
      tenant_id: state.tenantId,
      workspace_id: state.workspaceId,
      project_id: state.projectId,
      scope_kind: ctx.scope.kind,
      scope_reference_id: ctx.scope.referenceId ?? null,
      trajectory_unit_id: ctx.trajectoryUnitId,
      trajectory_unit_label: ctx.trajectoryUnitLabel ?? null,
      version: state.version,
      status: state.status,
      assessment_class: state.assessmentClass,
      forecast_posture: state.forecastPosture,
      control_context: ctx,
      contributingContributors: state.contributing_contributors,
      confidence_class: state.confidence.confidenceClass,
      confidence_score: state.confidence.score,
      data_sufficiency: state.confidence.dataSufficiency,
      confidence_payload: state.confidence,
      evidence_refs: state.evidenceRefs,
      reasons: state.reasons,
      limitations: state.limitations,
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
      float_computed: false,
      completion_date_predicted: false,
      cost_forecast_computed: false,
      predictive_scheduling_performed: false,
      resource_planning_performed: false,
      budget_ledger_mutated: false,
      mutates_upstream_contributors: false,
      financial_posting_performed: false,
      change_executed: false,
      schedule_executed: false,
      advisory_only: true,
      mutates_project_identity: false,
    };
    const { data, error } = await this.supabase
      .from(FORECAST_STATES)
      .insert(row)
      .select("*")
      .single();
    if (error) throw new Error(`forecast_state_persist_failed:${error.message}`);
    return mapForecastStateRow(data);
  }

  async getForecastStateById(
    tenantId: string,
    workspaceId: string,
    stateId: string,
  ): Promise<PersistedForecastState | null> {
    const { data, error } = await this.supabase
      .from(FORECAST_STATES)
      .select("*")
      .eq("id", stateId)
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .maybeSingle();
    if (error) throw new Error(`forecast_state_read_failed:${error.message}`);
    return data ? mapForecastStateRow(data) : null;
  }

  async latestForecastState(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    trajectoryUnitId: string,
    asOf?: string,
  ): Promise<PersistedForecastState | undefined> {
    let query = this.supabase
      .from(FORECAST_STATES)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("project_id", scope.projectId)
      .eq("scope_kind", scope.kind)
      .eq("trajectory_unit_id", trajectoryUnitId)
      .order("version", { ascending: false })
      .limit(1);
    query = scope.referenceId
      ? query.eq("scope_reference_id", scope.referenceId)
      : query.is("scope_reference_id", null);
    if (asOf) query = query.lte("recorded_at", asOf);
    const { data, error } = await query;
    if (error) throw new Error(`forecast_state_read_failed:${error.message}`);
    const row = (data ?? [])[0];
    return row ? mapForecastStateRow(row) : undefined;
  }

  async listForecastStates(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedForecastState[]> {
    const { data, error } = await this.supabase
      .from(FORECAST_STATES)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("project_id", projectId)
      .order("recorded_at", { ascending: false });
    if (error) throw new Error(`forecast_state_list_failed:${error.message}`);
    return (data ?? []).map(mapForecastStateRow);
  }

  async nextForecastStateVersion(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    trajectoryUnitId: string,
    expectedVersion?: number,
  ): Promise<number> {
    const latest = await this.latestForecastState(
      tenantId,
      workspaceId,
      scope,
      trajectoryUnitId,
    );
    const current = latest?.version ?? 0;
    if (expectedVersion !== undefined && expectedVersion !== current) {
      throw new Error(`optimistic_lock_conflict:expected=${expectedVersion};actual=${current}`);
    }
    return current + 1;
  }

  async saveForecastEvidence(
    evidence: readonly PersistedForecastEvidence[],
  ): Promise<PersistedForecastEvidence[]> {
    if (evidence.length === 0) return [];
    const rows = evidence.map((item) => ({
      id: item.evidenceId,
      tenant_id: item.tenantId,
      workspace_id: item.workspaceId,
      project_id: item.projectId,
      forecast_state_id: item.forecastStateId,
      evidence_kind: item.kind,
      source_type: item.sourceType,
      source_ref: item.sourceRef,
      source_key: item.sourceKey,
      source_version: item.sourceVersion ?? null,
      provenance: item.provenance,
      review_status: item.reviewStatus,
      observed_at: item.observedAt ?? null,
      declared_signal: item.declaredSignal ?? null,
      confidence: item.confidence ?? null,
      weight: item.weight ?? null,
      narrative: item.narrative ?? null,
      revoked: item.revoked ?? false,
      conflicts_with: item.conflictsWith ?? [],
      recorded_at: item.recordedAt,
      created_by: item.createdBy ?? null,
      completion_date_claimed: false,
      cost_forecast_claimed: false,
      labour_forecast_percent_claimed: false,
      financial_posting_claimed: false,
      budget_ledger_claimed: false,
      earned_value_derived: false,
    }));
    const { data, error } = await this.supabase.from(FORECAST_EVIDENCE).insert(rows).select("*");
    if (error) throw new Error(`forecast_evidence_persist_failed:${error.message}`);
    return (data ?? []).map(mapForecastEvidenceRow);
  }

  async listForecastEvidence(
    tenantId: string,
    workspaceId: string,
    forecastStateId: string,
  ): Promise<PersistedForecastEvidence[]> {
    const { data, error } = await this.supabase
      .from(FORECAST_EVIDENCE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("forecast_state_id", forecastStateId);
    if (error) throw new Error(`forecast_evidence_read_failed:${error.message}`);
    return (data ?? []).map(mapForecastEvidenceRow);
  }

  async saveForecastReview(
    review: PersistedForecastReview,
  ): Promise<PersistedForecastReview> {
    const row = {
      id: review.reviewId,
      tenant_id: review.tenantId,
      workspace_id: review.workspaceId,
      project_id: review.projectId,
      forecast_state_id: review.forecastStateId,
      workflow_instance_id: review.workflowInstanceId,
      workflow_state: review.workflowState,
      outcome: review.outcome ?? null,
      reviewer_id: review.reviewerId ?? null,
      notes: review.notes ?? null,
      created_at: review.createdAt,
      completed_at: review.completedAt ?? null,
      self_approved: false,
      workforce_management_claimed: false,
    };
    const { data, error } = await this.supabase
      .from(FORECAST_REVIEWS)
      .insert(row)
      .select("*")
      .single();
    if (error) throw new Error(`forecast_review_persist_failed:${error.message}`);
    return mapForecastReviewRow(data);
  }

  async listForecastReviews(
    tenantId: string,
    workspaceId: string,
    forecastStateId?: string,
  ): Promise<PersistedForecastReview[]> {
    let query = this.supabase
      .from(FORECAST_REVIEWS)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId);
    if (forecastStateId) query = query.eq("forecast_state_id", forecastStateId);
    const { data, error } = await query;
    if (error) throw new Error(`forecast_review_read_failed:${error.message}`);
    return (data ?? []).map(mapForecastReviewRow);
  }

  async saveForecastConfidence(
    confidence: PersistedForecastConfidence,
  ): Promise<PersistedForecastConfidence> {
    const row = {
      id: confidence.confidenceId,
      tenant_id: confidence.tenantId,
      workspace_id: confidence.workspaceId,
      project_id: confidence.projectId,
      forecast_state_id: confidence.forecastStateId,
      confidence_payload: confidence,
      recorded_at: confidence.recordedAt,
    };
    const { data, error } = await this.supabase
      .from(FORECAST_CONFIDENCE)
      .insert(row)
      .select("*")
      .single();
    if (error) throw new Error(`forecast_confidence_persist_failed:${error.message}`);
    return {
      ...confidence,
      forecastStateId: data.forecast_state_id,
      recordedAt: data.recorded_at,
    };
  }

  async listForecastConfidence(
    tenantId: string,
    workspaceId: string,
    forecastStateId: string,
  ): Promise<PersistedForecastConfidence[]> {
    const { data, error } = await this.supabase
      .from(FORECAST_CONFIDENCE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("forecast_state_id", forecastStateId);
    if (error) throw new Error(`forecast_confidence_read_failed:${error.message}`);
    return (data ?? []).map((row) => ({
      ...(row.confidence_payload as PersistedForecastConfidence),
      forecastStateId: row.forecast_state_id,
      recordedAt: row.recorded_at,
    }));
  }

  // ----------------------------------------------------------- decision

  async saveDecisionState(
    state: PersistedDecisionState,
  ): Promise<PersistedDecisionState> {
    const ctx = state.controlContext;
    const row = {
      id: state.stateId,
      tenant_id: state.tenantId,
      workspace_id: state.workspaceId,
      project_id: state.projectId,
      scope_kind: ctx.scope.kind,
      scope_reference_id: ctx.scope.referenceId ?? null,
      decision_unit_id: ctx.decisionUnitId,
      decision_unit_label: ctx.decisionUnitLabel ?? null,
      version: state.version,
      status: state.status,
      assessment_class: state.assessmentClass,
      dominant_decision_class: state.dominantDecisionClass ?? null,
      options: state.options,
      recommendations: state.recommendations,
      control_context: ctx,
      contributing_contributors: state.contributingContributors,
      assumptions: state.assumptions,
      confidence_class: state.confidence.confidenceClass,
      confidence_score: state.confidence.score,
      data_sufficiency: state.confidence.dataSufficiency,
      confidence_payload: state.confidence,
      evidence_refs: state.evidenceRefs,
      reasons: state.reasons,
      limitations: state.limitations,
      abstained: state.abstained,
      abstention_reason: state.abstentionReason ?? null,
      narrative: state.narrative ?? null,
      composed_context_id: state.composedContextId ?? null,
      forecast_context_id: state.forecastContextId ?? null,
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
      float_computed: false,
      auto_execution_enabled: false,
      schedule_execution_performed: false,
      cost_execution_performed: false,
      contract_instruction_performed: false,
      approval_authority_claimed: false,
      resource_planning_performed: false,
      budget_ledger_mutated: false,
      financial_posting_performed: false,
      predictive_scheduling_performed: false,
      mutates_upstream_contributors: false,
      advisory_only: true,
      mutates_project_identity: false,
    };
    const { data, error } = await this.supabase
      .from(DECISION_STATES)
      .insert(row)
      .select("*")
      .single();
    if (error) throw new Error(`decision_state_persist_failed:${error.message}`);
    return mapDecisionStateRow(data);
  }

  async getDecisionStateById(
    tenantId: string,
    workspaceId: string,
    stateId: string,
  ): Promise<PersistedDecisionState | null> {
    const { data, error } = await this.supabase
      .from(DECISION_STATES)
      .select("*")
      .eq("id", stateId)
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .maybeSingle();
    if (error) throw new Error(`decision_state_read_failed:${error.message}`);
    return data ? mapDecisionStateRow(data) : null;
  }

  async latestDecisionState(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    decisionUnitId: string,
    asOf?: string,
  ): Promise<PersistedDecisionState | undefined> {
    let query = this.supabase
      .from(DECISION_STATES)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("project_id", scope.projectId)
      .eq("scope_kind", scope.kind)
      .eq("decision_unit_id", decisionUnitId)
      .order("version", { ascending: false })
      .limit(1);
    query = scope.referenceId
      ? query.eq("scope_reference_id", scope.referenceId)
      : query.is("scope_reference_id", null);
    if (asOf) query = query.lte("recorded_at", asOf);
    const { data, error } = await query;
    if (error) throw new Error(`decision_state_read_failed:${error.message}`);
    const row = (data ?? [])[0];
    return row ? mapDecisionStateRow(row) : undefined;
  }

  async listDecisionStates(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedDecisionState[]> {
    const { data, error } = await this.supabase
      .from(DECISION_STATES)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("project_id", projectId)
      .order("recorded_at", { ascending: false });
    if (error) throw new Error(`decision_state_list_failed:${error.message}`);
    return (data ?? []).map(mapDecisionStateRow);
  }

  async nextDecisionStateVersion(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    decisionUnitId: string,
    expectedVersion?: number,
  ): Promise<number> {
    const latest = await this.latestDecisionState(
      tenantId,
      workspaceId,
      scope,
      decisionUnitId,
    );
    const current = latest?.version ?? 0;
    if (expectedVersion !== undefined && expectedVersion !== current) {
      throw new Error(`optimistic_lock_conflict:expected=${expectedVersion};actual=${current}`);
    }
    return current + 1;
  }

  async saveDecisionEvidence(
    evidence: readonly PersistedDecisionEvidence[],
  ): Promise<PersistedDecisionEvidence[]> {
    if (evidence.length === 0) return [];
    const rows = evidence.map((item) => ({
      id: item.evidenceId,
      tenant_id: item.tenantId,
      workspace_id: item.workspaceId,
      project_id: item.projectId,
      decision_state_id: item.decisionStateId,
      evidence_kind: item.kind,
      source_type: item.sourceType,
      source_ref: item.sourceRef,
      source_key: item.sourceKey,
      source_version: item.sourceVersion ?? null,
      provenance: item.provenance,
      review_status: item.reviewStatus,
      observed_at: item.observedAt ?? null,
      declared_signal: item.declaredSignal ?? null,
      contributor_key: item.contributorKey ?? null,
      confidence: item.confidence ?? null,
      weight: item.weight ?? null,
      narrative: item.narrative ?? null,
      revoked: item.revoked ?? false,
      conflicts_with: item.conflictsWith ?? [],
      recorded_at: item.recordedAt,
      created_by: item.createdBy ?? null,
      auto_execution_claimed: false,
      schedule_execution_claimed: false,
      cost_execution_claimed: false,
      contract_instruction_claimed: false,
      approval_authority_claimed: false,
      earned_value_derived: false,
      cpm_derived: false,
      financial_posting_claimed: false,
    }));
    const { data, error } = await this.supabase.from(DECISION_EVIDENCE).insert(rows).select("*");
    if (error) throw new Error(`decision_evidence_persist_failed:${error.message}`);
    return (data ?? []).map(mapDecisionEvidenceRow);
  }

  async listDecisionEvidence(
    tenantId: string,
    workspaceId: string,
    decisionStateId: string,
  ): Promise<PersistedDecisionEvidence[]> {
    const { data, error } = await this.supabase
      .from(DECISION_EVIDENCE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("decision_state_id", decisionStateId);
    if (error) throw new Error(`decision_evidence_read_failed:${error.message}`);
    return (data ?? []).map(mapDecisionEvidenceRow);
  }

  async saveDecisionReview(
    review: PersistedDecisionReview,
  ): Promise<PersistedDecisionReview> {
    const row = {
      id: review.reviewId,
      tenant_id: review.tenantId,
      workspace_id: review.workspaceId,
      project_id: review.projectId,
      decision_state_id: review.decisionStateId,
      workflow_instance_id: review.workflowInstanceId,
      workflow_state: review.workflowState,
      outcome: review.outcome ?? null,
      reviewer_id: review.reviewerId ?? null,
      notes: review.notes ?? null,
      created_at: review.createdAt,
      completed_at: review.completedAt ?? null,
      self_approved: false,
      approval_authority_claimed: false,
    };
    const { data, error } = await this.supabase
      .from(DECISION_REVIEWS)
      .insert(row)
      .select("*")
      .single();
    if (error) throw new Error(`decision_review_persist_failed:${error.message}`);
    return mapDecisionReviewRow(data);
  }

  async listDecisionReviews(
    tenantId: string,
    workspaceId: string,
    decisionStateId?: string,
  ): Promise<PersistedDecisionReview[]> {
    let query = this.supabase
      .from(DECISION_REVIEWS)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId);
    if (decisionStateId) query = query.eq("decision_state_id", decisionStateId);
    const { data, error } = await query;
    if (error) throw new Error(`decision_review_read_failed:${error.message}`);
    return (data ?? []).map(mapDecisionReviewRow);
  }

  async saveDecisionConfidence(
    confidence: PersistedDecisionConfidence,
  ): Promise<PersistedDecisionConfidence> {
    const row = {
      id: confidence.confidenceId,
      tenant_id: confidence.tenantId,
      workspace_id: confidence.workspaceId,
      project_id: confidence.projectId,
      decision_state_id: confidence.decisionStateId,
      confidence_payload: confidence,
      recorded_at: confidence.recordedAt,
    };
    const { data, error } = await this.supabase
      .from(DECISION_CONFIDENCE)
      .insert(row)
      .select("*")
      .single();
    if (error) throw new Error(`decision_confidence_persist_failed:${error.message}`);
    return {
      ...confidence,
      decisionStateId: data.decision_state_id,
      recordedAt: data.recorded_at,
    };
  }

  async listDecisionConfidence(
    tenantId: string,
    workspaceId: string,
    decisionStateId: string,
  ): Promise<PersistedDecisionConfidence[]> {
    const { data, error } = await this.supabase
      .from(DECISION_CONFIDENCE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("decision_state_id", decisionStateId);
    if (error) throw new Error(`decision_confidence_read_failed:${error.message}`);
    return (data ?? []).map((row) => ({
      ...(row.confidence_payload as PersistedDecisionConfidence),
      decisionStateId: row.decision_state_id,
      recordedAt: row.recorded_at,
    }));
  }

  // ----------------------------------------------------------- scenario

  async saveScenarioState(state: PersistedScenarioState): Promise<PersistedScenarioState> {
    const ctx = state.controlContext;
    const row = {
      id: state.stateId,
      tenant_id: state.tenantId,
      workspace_id: state.workspaceId,
      project_id: state.projectId,
      scope_kind: ctx.scope.kind,
      scope_reference_id: ctx.scope.referenceId ?? null,
      scenario_unit_id: ctx.scenarioUnitId,
      scenario_unit_label: ctx.scenarioUnitLabel ?? null,
      version: state.version,
      status: state.status,
      assessment_class: state.assessmentClass,
      comparison: state.comparison,
      scenario_options: state.scenarioOptions,
      control_context: ctx,
      contributing_contributors: state.contributingContributors,
      assumptions: state.assumptions,
      confidence_class: state.confidence.confidenceClass,
      data_sufficiency: state.confidence.dataSufficiency,
      confidence_payload: state.confidence,
      evidence_refs: state.evidenceRefs,
      reasons: state.reasons,
      limitations: state.limitations,
      abstained: state.abstained,
      abstention_reason: state.abstentionReason ?? null,
      narrative: state.narrative ?? null,
      composed_context_id: state.composedContextId ?? null,
      forecast_context_id: state.forecastContextId ?? null,
      decision_context_id: state.decisionContextId ?? null,
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
      float_computed: false,
      auto_execution_enabled: false,
      schedule_execution_performed: false,
      cost_execution_performed: false,
      contract_instruction_performed: false,
      approval_authority_claimed: false,
      resource_planning_performed: false,
      budget_ledger_mutated: false,
      financial_posting_performed: false,
      predictive_scheduling_performed: false,
      preferred_scenario_selected: false,
      optimisation_performed: false,
      monte_carlo_performed: false,
      numerical_precision_claimed: false,
      mutates_upstream_contributors: false,
      advisory_only: true,
      mutates_project_identity: false,
    };
    const { data, error } = await this.supabase.from(SCENARIO_STATES).insert(row).select("*").single();
    if (error) throw new Error(`scenario_state_persist_failed:${error.message}`);
    return mapScenarioStateRow(data);
  }

  async getScenarioStateById(
    tenantId: string,
    workspaceId: string,
    stateId: string,
  ): Promise<PersistedScenarioState | null> {
    const { data, error } = await this.supabase
      .from(SCENARIO_STATES)
      .select("*")
      .eq("id", stateId)
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .maybeSingle();
    if (error) throw new Error(`scenario_state_read_failed:${error.message}`);
    return data ? mapScenarioStateRow(data) : null;
  }

  async latestScenarioState(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    scenarioUnitId: string,
    asOf?: string,
  ): Promise<PersistedScenarioState | undefined> {
    let query = this.supabase
      .from(SCENARIO_STATES)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("project_id", scope.projectId)
      .eq("scope_kind", scope.kind)
      .eq("scenario_unit_id", scenarioUnitId)
      .order("version", { ascending: false })
      .limit(1);
    query = scope.referenceId
      ? query.eq("scope_reference_id", scope.referenceId)
      : query.is("scope_reference_id", null);
    if (asOf) query = query.lte("recorded_at", asOf);
    const { data, error } = await query;
    if (error) throw new Error(`scenario_state_read_failed:${error.message}`);
    const row = (data ?? [])[0];
    return row ? mapScenarioStateRow(row) : undefined;
  }

  async listScenarioStates(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedScenarioState[]> {
    const { data, error } = await this.supabase
      .from(SCENARIO_STATES)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("project_id", projectId)
      .order("recorded_at", { ascending: false });
    if (error) throw new Error(`scenario_state_list_failed:${error.message}`);
    return (data ?? []).map(mapScenarioStateRow);
  }

  async nextScenarioStateVersion(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    scenarioUnitId: string,
    expectedVersion?: number,
  ): Promise<number> {
    const latest = await this.latestScenarioState(tenantId, workspaceId, scope, scenarioUnitId);
    const current = latest?.version ?? 0;
    if (expectedVersion !== undefined && expectedVersion !== current) {
      throw new Error(`optimistic_lock_conflict:expected=${expectedVersion};actual=${current}`);
    }
    return current + 1;
  }

  async saveScenarioEvidence(
    evidence: readonly PersistedScenarioEvidence[],
  ): Promise<PersistedScenarioEvidence[]> {
    if (evidence.length === 0) return [];
    const rows = evidence.map((item) => ({
      id: item.evidenceId,
      tenant_id: item.tenantId,
      workspace_id: item.workspaceId,
      project_id: item.projectId,
      scenario_state_id: item.scenarioStateId,
      evidence_kind: item.kind,
      source_type: item.sourceType,
      source_ref: item.sourceRef,
      source_key: item.sourceKey,
      source_version: item.sourceVersion ?? null,
      provenance: item.provenance,
      review_status: item.reviewStatus,
      observed_at: item.observedAt ?? null,
      declared_signal: item.declaredSignal ?? null,
      contributor_key: item.contributorKey ?? null,
      narrative: item.narrative ?? null,
      revoked: item.revoked ?? false,
      conflicts_with: item.conflictsWith ?? [],
      recorded_at: item.recordedAt,
      created_by: item.createdBy ?? null,
      auto_execution_claimed: false,
      schedule_execution_claimed: false,
      cost_execution_claimed: false,
      contract_instruction_claimed: false,
      approval_authority_claimed: false,
      earned_value_derived: false,
      cpm_derived: false,
      financial_posting_claimed: false,
      monte_carlo_claimed: false,
      numerical_precision_claimed: false,
      preferred_selection_claimed: false,
      optimisation_claimed: false,
    }));
    const { data, error } = await this.supabase.from(SCENARIO_EVIDENCE).insert(rows).select("*");
    if (error) throw new Error(`scenario_evidence_persist_failed:${error.message}`);
    return (data ?? []).map(mapScenarioEvidenceRow);
  }

  async listScenarioEvidence(
    tenantId: string,
    workspaceId: string,
    scenarioStateId: string,
  ): Promise<PersistedScenarioEvidence[]> {
    const { data, error } = await this.supabase
      .from(SCENARIO_EVIDENCE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("scenario_state_id", scenarioStateId);
    if (error) throw new Error(`scenario_evidence_read_failed:${error.message}`);
    return (data ?? []).map(mapScenarioEvidenceRow);
  }

  async saveScenarioReview(review: PersistedScenarioReview): Promise<PersistedScenarioReview> {
    const row = {
      id: review.reviewId,
      tenant_id: review.tenantId,
      workspace_id: review.workspaceId,
      project_id: review.projectId,
      scenario_state_id: review.scenarioStateId,
      workflow_instance_id: review.workflowInstanceId,
      workflow_state: review.workflowState,
      outcome: review.outcome ?? null,
      reviewer_id: review.reviewerId ?? null,
      notes: review.notes ?? null,
      created_at: review.createdAt,
      completed_at: review.completedAt ?? null,
      self_approved: false,
      approval_authority_claimed: false,
    };
    const { data, error } = await this.supabase.from(SCENARIO_REVIEWS).insert(row).select("*").single();
    if (error) throw new Error(`scenario_review_persist_failed:${error.message}`);
    return mapScenarioReviewRow(data);
  }

  async listScenarioReviews(
    tenantId: string,
    workspaceId: string,
    scenarioStateId?: string,
  ): Promise<PersistedScenarioReview[]> {
    let query = this.supabase
      .from(SCENARIO_REVIEWS)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId);
    if (scenarioStateId) query = query.eq("scenario_state_id", scenarioStateId);
    const { data, error } = await query;
    if (error) throw new Error(`scenario_review_read_failed:${error.message}`);
    return (data ?? []).map(mapScenarioReviewRow);
  }

  async saveScenarioConfidence(
    confidence: PersistedScenarioConfidence,
  ): Promise<PersistedScenarioConfidence> {
    const row = {
      id: confidence.confidenceId,
      tenant_id: confidence.tenantId,
      workspace_id: confidence.workspaceId,
      project_id: confidence.projectId,
      scenario_state_id: confidence.scenarioStateId,
      confidence_payload: confidence,
      recorded_at: confidence.recordedAt,
    };
    const { data, error } = await this.supabase.from(SCENARIO_CONFIDENCE).insert(row).select("*").single();
    if (error) throw new Error(`scenario_confidence_persist_failed:${error.message}`);
    return {
      ...(data.confidence_payload as PersistedScenarioConfidence),
      scenarioStateId: data.scenario_state_id,
      recordedAt: data.recorded_at,
    };
  }

  async listScenarioConfidence(
    tenantId: string,
    workspaceId: string,
    scenarioStateId: string,
  ): Promise<PersistedScenarioConfidence[]> {
    const { data, error } = await this.supabase
      .from(SCENARIO_CONFIDENCE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("scenario_state_id", scenarioStateId);
    if (error) throw new Error(`scenario_confidence_read_failed:${error.message}`);
    return (data ?? []).map((row) => ({
      ...(row.confidence_payload as PersistedScenarioConfidence),
      scenarioStateId: row.scenario_state_id,
      recordedAt: row.recorded_at,
    }));
  }

  // ----------------------------------------------------------- risk_opportunity

  async saveRiskOpportunityState(
    state: PersistedRiskOpportunityState,
  ): Promise<PersistedRiskOpportunityState> {
    const ctx = state.controlContext;
    const row = {
      id: state.stateId,
      tenant_id: state.tenantId,
      workspace_id: state.workspaceId,
      project_id: state.projectId,
      scope_kind: ctx.scope.kind,
      scope_reference_id: ctx.scope.referenceId ?? null,
      risk_opportunity_unit_id: ctx.assuranceUnitId,
      risk_opportunity_unit_label: ctx.assuranceUnitLabel ?? null,
      version: state.version,
      status: state.status,
      assessment_class: state.assessmentClass,
      synthesis: state.synthesis,
      risk_signals: state.riskSignals,
      opportunity_signals: state.opportunitySignals,
      control_context: ctx,
      contributing_contributors: state.contributingContributors,
      assumptions: state.assumptions,
      confidence_class: state.confidence.confidenceClass,
      data_sufficiency: state.confidence.dataSufficiency,
      confidence_payload: state.confidence,
      evidence_refs: state.evidenceRefs,
      reasons: state.reasons,
      limitations: state.limitations,
      abstained: state.abstained,
      abstention_reason: state.abstentionReason ?? null,
      narrative: state.narrative ?? null,
      composed_context_id: state.composedContextId ?? null,
      forecast_context_id: state.forecastContextId ?? null,
      decision_context_id: state.decisionContextId ?? null,
      scenario_context_id: state.scenarioContextId ?? null,
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
      float_computed: false,
      auto_execution_enabled: false,
      schedule_execution_performed: false,
      cost_execution_performed: false,
      contract_instruction_performed: false,
      approval_authority_claimed: false,
      resource_planning_performed: false,
      budget_ledger_mutated: false,
      financial_posting_performed: false,
      predictive_scheduling_performed: false,
      risk_register_mutated: false,
      opportunity_register_mutated: false,
      owner_assignment_performed: false,
      treatment_execution_performed: false,
      duplicate_risk_ownership_detected: false,
      monte_carlo_performed: false,
      numerical_precision_claimed: false,
      mutates_upstream_contributors: false,
      advisory_only: true,
      mutates_project_identity: false,
    };
    const { data, error } = await this.supabase
      .from(RISK_OPPORTUNITY_STATES)
      .insert(row)
      .select("*")
      .single();
    if (error) throw new Error(`risk_opportunity_state_persist_failed:${error.message}`);
    return mapRiskOpportunityStateRow(data);
  }

  async getRiskOpportunityStateById(
    tenantId: string,
    workspaceId: string,
    stateId: string,
  ): Promise<PersistedRiskOpportunityState | null> {
    const { data, error } = await this.supabase
      .from(RISK_OPPORTUNITY_STATES)
      .select("*")
      .eq("id", stateId)
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .maybeSingle();
    if (error) throw new Error(`risk_opportunity_state_read_failed:${error.message}`);
    return data ? mapRiskOpportunityStateRow(data) : null;
  }

  async latestRiskOpportunityState(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    riskOpportunityUnitId: string,
    asOf?: string,
  ): Promise<PersistedRiskOpportunityState | undefined> {
    let query = this.supabase
      .from(RISK_OPPORTUNITY_STATES)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("project_id", scope.projectId)
      .eq("scope_kind", scope.kind)
      .eq("risk_opportunity_unit_id", riskOpportunityUnitId)
      .order("version", { ascending: false })
      .limit(1);
    query = scope.referenceId
      ? query.eq("scope_reference_id", scope.referenceId)
      : query.is("scope_reference_id", null);
    if (asOf) query = query.lte("recorded_at", asOf);
    const { data, error } = await query;
    if (error) throw new Error(`risk_opportunity_state_read_failed:${error.message}`);
    const row = (data ?? [])[0];
    return row ? mapRiskOpportunityStateRow(row) : undefined;
  }

  async listRiskOpportunityStates(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedRiskOpportunityState[]> {
    const { data, error } = await this.supabase
      .from(RISK_OPPORTUNITY_STATES)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("project_id", projectId)
      .order("recorded_at", { ascending: false });
    if (error) throw new Error(`risk_opportunity_state_list_failed:${error.message}`);
    return (data ?? []).map(mapRiskOpportunityStateRow);
  }

  async nextRiskOpportunityStateVersion(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    riskOpportunityUnitId: string,
    expectedVersion?: number,
  ): Promise<number> {
    const latest = await this.latestRiskOpportunityState(
      tenantId,
      workspaceId,
      scope,
      riskOpportunityUnitId,
    );
    const current = latest?.version ?? 0;
    if (expectedVersion !== undefined && expectedVersion !== current) {
      throw new Error(`optimistic_lock_conflict:expected=${expectedVersion};actual=${current}`);
    }
    return current + 1;
  }

  async saveRiskOpportunityEvidence(
    evidence: readonly PersistedRiskOpportunityEvidence[],
  ): Promise<PersistedRiskOpportunityEvidence[]> {
    if (evidence.length === 0) return [];
    const rows = evidence.map((item) => ({
      id: item.evidenceId,
      tenant_id: item.tenantId,
      workspace_id: item.workspaceId,
      project_id: item.projectId,
      risk_opportunity_state_id: item.riskOpportunityStateId,
      evidence_kind: item.kind,
      source_type: item.sourceType,
      source_ref: item.sourceRef,
      source_key: item.sourceKey,
      source_version: item.sourceVersion ?? null,
      provenance: item.provenance,
      review_status: item.reviewStatus,
      observed_at: item.observedAt ?? null,
      declared_signal: item.declaredSignal ?? null,
      contributor_key: item.contributorKey ?? null,
      narrative: item.narrative ?? null,
      revoked: item.revoked ?? false,
      conflicts_with: item.conflictsWith ?? [],
      recorded_at: item.recordedAt,
      created_by: item.createdBy ?? null,
      auto_execution_claimed: false,
      schedule_execution_claimed: false,
      cost_execution_claimed: false,
      contract_instruction_claimed: false,
      approval_authority_claimed: false,
      earned_value_derived: false,
      cpm_derived: false,
      financial_posting_claimed: false,
      monte_carlo_claimed: false,
      numerical_precision_claimed: false,
      risk_register_mutation_claimed: false,
      opportunity_register_mutation_claimed: false,
      owner_assignment_claimed: false,
      treatment_execution_claimed: false,
      mutates_core_risk: false,
    }));
    const { data, error } = await this.supabase.from(RISK_OPPORTUNITY_EVIDENCE).insert(rows).select("*");
    if (error) throw new Error(`risk_opportunity_evidence_persist_failed:${error.message}`);
    return (data ?? []).map(mapRiskOpportunityEvidenceRow);
  }

  async listRiskOpportunityEvidence(
    tenantId: string,
    workspaceId: string,
    riskOpportunityStateId: string,
  ): Promise<PersistedRiskOpportunityEvidence[]> {
    const { data, error } = await this.supabase
      .from(RISK_OPPORTUNITY_EVIDENCE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("risk_opportunity_state_id", riskOpportunityStateId);
    if (error) throw new Error(`risk_opportunity_evidence_read_failed:${error.message}`);
    return (data ?? []).map(mapRiskOpportunityEvidenceRow);
  }

  async saveRiskOpportunityReview(
    review: PersistedRiskOpportunityReview,
  ): Promise<PersistedRiskOpportunityReview> {
    const row = {
      id: review.reviewId,
      tenant_id: review.tenantId,
      workspace_id: review.workspaceId,
      project_id: review.projectId,
      risk_opportunity_state_id: review.riskOpportunityStateId,
      workflow_instance_id: review.workflowInstanceId,
      workflow_state: review.workflowState,
      outcome: review.outcome ?? null,
      reviewer_id: review.reviewerId ?? null,
      notes: review.notes ?? null,
      created_at: review.createdAt,
      completed_at: review.completedAt ?? null,
      self_approved: false,
      approval_authority_claimed: false,
    };
    const { data, error } = await this.supabase
      .from(RISK_OPPORTUNITY_REVIEWS)
      .insert(row)
      .select("*")
      .single();
    if (error) throw new Error(`risk_opportunity_review_persist_failed:${error.message}`);
    return mapRiskOpportunityReviewRow(data);
  }

  async listRiskOpportunityReviews(
    tenantId: string,
    workspaceId: string,
    riskOpportunityStateId?: string,
  ): Promise<PersistedRiskOpportunityReview[]> {
    let query = this.supabase
      .from(RISK_OPPORTUNITY_REVIEWS)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId);
    if (riskOpportunityStateId) query = query.eq("risk_opportunity_state_id", riskOpportunityStateId);
    const { data, error } = await query;
    if (error) throw new Error(`risk_opportunity_review_read_failed:${error.message}`);
    return (data ?? []).map(mapRiskOpportunityReviewRow);
  }

  async saveRiskOpportunityConfidence(
    confidence: PersistedRiskOpportunityConfidence,
  ): Promise<PersistedRiskOpportunityConfidence> {
    const row = {
      id: confidence.confidenceId,
      tenant_id: confidence.tenantId,
      workspace_id: confidence.workspaceId,
      project_id: confidence.projectId,
      risk_opportunity_state_id: confidence.riskOpportunityStateId,
      confidence_payload: confidence,
      recorded_at: confidence.recordedAt,
    };
    const { data, error } = await this.supabase
      .from(RISK_OPPORTUNITY_CONFIDENCE)
      .insert(row)
      .select("*")
      .single();
    if (error) throw new Error(`risk_opportunity_confidence_persist_failed:${error.message}`);
    return {
      ...(data.confidence_payload as PersistedRiskOpportunityConfidence),
      riskOpportunityStateId: data.risk_opportunity_state_id,
      recordedAt: data.recorded_at,
    };
  }

  async listRiskOpportunityConfidence(
    tenantId: string,
    workspaceId: string,
    riskOpportunityStateId: string,
  ): Promise<PersistedRiskOpportunityConfidence[]> {
    const { data, error } = await this.supabase
      .from(RISK_OPPORTUNITY_CONFIDENCE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("risk_opportunity_state_id", riskOpportunityStateId);
    if (error) throw new Error(`risk_opportunity_confidence_read_failed:${error.message}`);
    return (data ?? []).map((row) => ({
      ...(row.confidence_payload as PersistedRiskOpportunityConfidence),
      riskOpportunityStateId: row.risk_opportunity_state_id,
      recordedAt: row.recorded_at,
    }));
  }


  // ----------------------------------------------------------- assurance

  async saveAssuranceState(
    state: PersistedAssuranceState,
  ): Promise<PersistedAssuranceState> {
    const ctx = state.controlContext;
    const row = {
      id: state.stateId,
      tenant_id: state.tenantId,
      workspace_id: state.workspaceId,
      project_id: state.projectId,
      scope_kind: ctx.scope.kind,
      scope_reference_id: ctx.scope.referenceId ?? null,
      assurance_unit_id: ctx.assuranceUnitId,
      assurance_unit_label: ctx.assuranceUnitLabel ?? null,
      version: state.version,
      status: state.status,
      assessment_class: state.assessmentClass,
      synthesis: state.synthesis,
      risk_signals: state.riskSignals,
      opportunity_signals: state.opportunitySignals,
      control_context: ctx,
      contributing_contributors: state.contributingContributors,
      assumptions: state.assumptions,
      confidence_class: state.confidence.confidenceClass,
      data_sufficiency: state.confidence.dataSufficiency,
      confidence_payload: state.confidence,
      evidence_refs: state.evidenceRefs,
      reasons: state.reasons,
      limitations: state.limitations,
      abstained: state.abstained,
      abstention_reason: state.abstentionReason ?? null,
      narrative: state.narrative ?? null,
      composed_context_id: state.composedContextId ?? null,
      forecast_context_id: state.forecastContextId ?? null,
      decision_context_id: state.decisionContextId ?? null,
      scenario_context_id: state.scenarioContextId ?? null,
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
      float_computed: false,
      auto_execution_enabled: false,
      schedule_execution_performed: false,
      cost_execution_performed: false,
      contract_instruction_performed: false,
      approval_authority_claimed: false,
      resource_planning_performed: false,
      budget_ledger_mutated: false,
      financial_posting_performed: false,
      predictive_scheduling_performed: false,
      risk_register_mutated: false,
      opportunity_register_mutated: false,
      owner_assignment_performed: false,
      treatment_execution_performed: false,
      duplicate_risk_ownership_detected: false,
      monte_carlo_performed: false,
      numerical_precision_claimed: false,
      mutates_upstream_contributors: false,
      advisory_only: true,
      mutates_project_identity: false,
    };
    const { data, error } = await this.supabase
      .from(ASSURANCE_STATES)
      .insert(row)
      .select("*")
      .single();
    if (error) throw new Error(`assurance_state_persist_failed:${error.message}`);
    return mapAssuranceStateRow(data);
  }

  async getAssuranceStateById(
    tenantId: string,
    workspaceId: string,
    stateId: string,
  ): Promise<PersistedAssuranceState | null> {
    const { data, error } = await this.supabase
      .from(ASSURANCE_STATES)
      .select("*")
      .eq("id", stateId)
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .maybeSingle();
    if (error) throw new Error(`assurance_state_read_failed:${error.message}`);
    return data ? mapAssuranceStateRow(data) : null;
  }

  async latestAssuranceState(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    riskOpportunityUnitId: string,
    asOf?: string,
  ): Promise<PersistedAssuranceState | undefined> {
    let query = this.supabase
      .from(ASSURANCE_STATES)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("project_id", scope.projectId)
      .eq("scope_kind", scope.kind)
      .eq("assurance_unit_id", riskOpportunityUnitId)
      .order("version", { ascending: false })
      .limit(1);
    query = scope.referenceId
      ? query.eq("scope_reference_id", scope.referenceId)
      : query.is("scope_reference_id", null);
    if (asOf) query = query.lte("recorded_at", asOf);
    const { data, error } = await query;
    if (error) throw new Error(`assurance_state_read_failed:${error.message}`);
    const row = (data ?? [])[0];
    return row ? mapAssuranceStateRow(row) : undefined;
  }

  async listAssuranceStates(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedAssuranceState[]> {
    const { data, error } = await this.supabase
      .from(ASSURANCE_STATES)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("project_id", projectId)
      .order("recorded_at", { ascending: false });
    if (error) throw new Error(`assurance_state_list_failed:${error.message}`);
    return (data ?? []).map(mapAssuranceStateRow);
  }

  async nextAssuranceStateVersion(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    riskOpportunityUnitId: string,
    expectedVersion?: number,
  ): Promise<number> {
    const latest = await this.latestAssuranceState(
      tenantId,
      workspaceId,
      scope,
      riskOpportunityUnitId,
    );
    const current = latest?.version ?? 0;
    if (expectedVersion !== undefined && expectedVersion !== current) {
      throw new Error(`optimistic_lock_conflict:expected=${expectedVersion};actual=${current}`);
    }
    return current + 1;
  }

  async saveAssuranceEvidence(
    evidence: readonly PersistedAssuranceEvidence[],
  ): Promise<PersistedAssuranceEvidence[]> {
    if (evidence.length === 0) return [];
    const rows = evidence.map((item) => ({
      id: item.evidenceId,
      tenant_id: item.tenantId,
      workspace_id: item.workspaceId,
      project_id: item.projectId,
      assurance_state_id: item.riskOpportunityStateId,
      evidence_kind: item.kind,
      source_type: item.sourceType,
      source_ref: item.sourceRef,
      source_key: item.sourceKey,
      source_version: item.sourceVersion ?? null,
      provenance: item.provenance,
      review_status: item.reviewStatus,
      observed_at: item.observedAt ?? null,
      declared_signal: item.declaredSignal ?? null,
      contributor_key: item.contributorKey ?? null,
      narrative: item.narrative ?? null,
      revoked: item.revoked ?? false,
      conflicts_with: item.conflictsWith ?? [],
      recorded_at: item.recordedAt,
      created_by: item.createdBy ?? null,
      auto_execution_claimed: false,
      schedule_execution_claimed: false,
      cost_execution_claimed: false,
      contract_instruction_claimed: false,
      approval_authority_claimed: false,
      earned_value_derived: false,
      cpm_derived: false,
      financial_posting_claimed: false,
      monte_carlo_claimed: false,
      numerical_precision_claimed: false,
      risk_register_mutation_claimed: false,
      opportunity_register_mutation_claimed: false,
      owner_assignment_claimed: false,
      treatment_execution_claimed: false,
      mutates_core_risk: false,
    }));
    const { data, error } = await this.supabase.from(ASSURANCE_EVIDENCE).insert(rows).select("*");
    if (error) throw new Error(`assurance_evidence_persist_failed:${error.message}`);
    return (data ?? []).map(mapAssuranceEvidenceRow);
  }

  async listAssuranceEvidence(
    tenantId: string,
    workspaceId: string,
    riskOpportunityStateId: string,
  ): Promise<PersistedAssuranceEvidence[]> {
    const { data, error } = await this.supabase
      .from(ASSURANCE_EVIDENCE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("assurance_state_id", riskOpportunityStateId);
    if (error) throw new Error(`assurance_evidence_read_failed:${error.message}`);
    return (data ?? []).map(mapAssuranceEvidenceRow);
  }

  async saveAssuranceReview(
    review: PersistedAssuranceReview,
  ): Promise<PersistedAssuranceReview> {
    const row = {
      id: review.reviewId,
      tenant_id: review.tenantId,
      workspace_id: review.workspaceId,
      project_id: review.projectId,
      assurance_state_id: review.riskOpportunityStateId,
      workflow_instance_id: review.workflowInstanceId,
      workflow_state: review.workflowState,
      outcome: review.outcome ?? null,
      reviewer_id: review.reviewerId ?? null,
      notes: review.notes ?? null,
      created_at: review.createdAt,
      completed_at: review.completedAt ?? null,
      self_approved: false,
      approval_authority_claimed: false,
    };
    const { data, error } = await this.supabase
      .from(ASSURANCE_REVIEWS)
      .insert(row)
      .select("*")
      .single();
    if (error) throw new Error(`assurance_review_persist_failed:${error.message}`);
    return mapAssuranceReviewRow(data);
  }

  async listAssuranceReviews(
    tenantId: string,
    workspaceId: string,
    riskOpportunityStateId?: string,
  ): Promise<PersistedAssuranceReview[]> {
    let query = this.supabase
      .from(ASSURANCE_REVIEWS)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId);
    if (riskOpportunityStateId) query = query.eq("assurance_state_id", riskOpportunityStateId);
    const { data, error } = await query;
    if (error) throw new Error(`assurance_review_read_failed:${error.message}`);
    return (data ?? []).map(mapAssuranceReviewRow);
  }

  async saveAssuranceConfidence(
    confidence: PersistedAssuranceConfidence,
  ): Promise<PersistedAssuranceConfidence> {
    const row = {
      id: confidence.confidenceId,
      tenant_id: confidence.tenantId,
      workspace_id: confidence.workspaceId,
      project_id: confidence.projectId,
      assurance_state_id: confidence.riskOpportunityStateId,
      confidence_payload: confidence,
      recorded_at: confidence.recordedAt,
    };
    const { data, error } = await this.supabase
      .from(ASSURANCE_CONFIDENCE)
      .insert(row)
      .select("*")
      .single();
    if (error) throw new Error(`assurance_confidence_persist_failed:${error.message}`);
    return {
      ...(data.confidence_payload as PersistedAssuranceConfidence),
      riskOpportunityStateId: data.assurance_state_id,
      recordedAt: data.recorded_at,
    };
  }

  async listAssuranceConfidence(
    tenantId: string,
    workspaceId: string,
    assuranceStateId: string,
  ): Promise<PersistedAssuranceConfidence[]> {
    const { data, error } = await this.supabase
      .from(ASSURANCE_CONFIDENCE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("assurance_state_id", assuranceStateId);
    if (error) throw new Error(`assurance_confidence_read_failed:${error.message}`);
    return (data ?? []).map((row) => ({
      ...(row.confidence_payload as PersistedAssuranceConfidence),
      assuranceStateId: row.assurance_state_id,
      recordedAt: row.recorded_at,
    }));
  }

  // ----------------------------------------------------------- explainability

  async saveExplainabilityState(
    state: PersistedExplainabilityState,
  ): Promise<PersistedExplainabilityState> {
    const ctx = state.controlContext;
    const row = {
      id: state.stateId,
      tenant_id: state.tenantId,
      workspace_id: state.workspaceId,
      project_id: state.projectId,
      scope_kind: ctx.scope.kind,
      scope_reference_id: ctx.scope.referenceId ?? null,
      explainability_unit_id: ctx.explainabilityUnitId,
      explainability_unit_label: ctx.explainabilityUnitLabel ?? null,
      version: state.version,
      status: state.status,
      assessment_class: state.assessmentClass,
      explanation_status: state.explanationStatus,
      synthesis: state.synthesis,
      snapshot_payload: state.snapshot,
      contributor_explanations: state.contributorExplanations,
      control_context: ctx,
      contributing_contributors: state.contributingContributors,
      dependency_traces: state.dependencyTraces,
      provenance_traces: state.provenanceTraces,
      timeline_traces: state.timelineTraces,
      assumption_refs: state.assumptionRefs,
      confidence_source_refs: state.confidenceSourceRefs,
      governance_refs: state.governanceRefs,
      assumptions: state.assumptions,
      confidence_class: state.confidence.confidenceClass,
      data_sufficiency: state.confidence.dataSufficiency,
      confidence_payload: state.confidence,
      evidence_refs: state.evidenceRefs,
      reasons: state.reasons,
      limitations: state.limitations,
      abstained: state.abstained,
      abstention_reason: state.abstentionReason ?? null,
      narrative: state.narrative ?? null,
      composed_context_id: state.composedContextId ?? null,
      assurance_context_id: state.assuranceContextId ?? null,
      forecast_context_id: state.forecastContextId ?? null,
      decision_context_id: state.decisionContextId ?? null,
      scenario_context_id: state.scenarioContextId ?? null,
      risk_opportunity_context_id: state.riskOpportunityContextId ?? null,
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
      float_computed: false,
      auto_execution_enabled: false,
      schedule_execution_performed: false,
      cost_execution_performed: false,
      contract_instruction_performed: false,
      approval_authority_claimed: false,
      verification_claimed: false,
      automatic_evidence_creation_claimed: false,
      automatic_explanation_approval_claimed: false,
      resource_planning_performed: false,
      budget_ledger_mutated: false,
      financial_posting_performed: false,
      predictive_scheduling_performed: false,
      duplicate_explainability_ownership_detected: false,
      chain_of_thought_exposed: false,
      hidden_reasoning_exposed: false,
      fabricated_provenance: false,
      mutates_upstream_contributors: false,
      advisory_only: true,
      mutates_project_identity: false,
    };
    const { data, error } = await this.supabase
      .from(EXPLAINABILITY_STATES)
      .insert(row)
      .select("*")
      .single();
    if (error) throw new Error(`explainability_state_persist_failed:${error.message}`);
    return mapExplainabilityStateRow(data);
  }

  async getExplainabilityStateById(
    tenantId: string,
    workspaceId: string,
    stateId: string,
  ): Promise<PersistedExplainabilityState | null> {
    const { data, error } = await this.supabase
      .from(EXPLAINABILITY_STATES)
      .select("*")
      .eq("id", stateId)
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .maybeSingle();
    if (error) throw new Error(`explainability_state_read_failed:${error.message}`);
    return data ? mapExplainabilityStateRow(data) : null;
  }

  async latestExplainabilityState(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    explainabilityUnitId: string,
    asOf?: string,
  ): Promise<PersistedExplainabilityState | undefined> {
    let query = this.supabase
      .from(EXPLAINABILITY_STATES)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("project_id", scope.projectId)
      .eq("scope_kind", scope.kind)
      .eq("explainability_unit_id", explainabilityUnitId)
      .order("version", { ascending: false })
      .limit(1);
    query = scope.referenceId
      ? query.eq("scope_reference_id", scope.referenceId)
      : query.is("scope_reference_id", null);
    if (asOf) query = query.lte("recorded_at", asOf);
    const { data, error } = await query;
    if (error) throw new Error(`explainability_state_read_failed:${error.message}`);
    const row = (data ?? [])[0];
    return row ? mapExplainabilityStateRow(row) : undefined;
  }

  async listExplainabilityStates(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedExplainabilityState[]> {
    const { data, error } = await this.supabase
      .from(EXPLAINABILITY_STATES)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("project_id", projectId)
      .order("recorded_at", { ascending: false });
    if (error) throw new Error(`explainability_state_list_failed:${error.message}`);
    return (data ?? []).map(mapExplainabilityStateRow);
  }

  async nextExplainabilityStateVersion(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    explainabilityUnitId: string,
    expectedVersion?: number,
  ): Promise<number> {
    const latest = await this.latestExplainabilityState(
      tenantId,
      workspaceId,
      scope,
      explainabilityUnitId,
    );
    const current = latest?.version ?? 0;
    if (expectedVersion !== undefined && expectedVersion !== current) {
      throw new Error(`optimistic_lock_conflict:expected=${expectedVersion};actual=${current}`);
    }
    return current + 1;
  }

  async saveExplainabilityEvidence(
    evidence: readonly PersistedExplainabilityEvidence[],
  ): Promise<PersistedExplainabilityEvidence[]> {
    const rows = evidence.map((item) => ({
      id: item.evidenceId,
      tenant_id: item.tenantId,
      workspace_id: item.workspaceId,
      project_id: item.projectId,
      explainability_state_id: item.explainabilityStateId,
      evidence_kind: item.kind,
      source_type: item.sourceType,
      source_ref: item.sourceRef,
      source_key: item.sourceKey,
      provenance: item.provenance,
      review_status: item.reviewStatus,
      observed_at: item.observedAt ?? null,
      declared_signal: item.declaredSignal ?? null,
      contributor_key: item.contributorKey ?? null,
      narrative: item.narrative ?? null,
      recorded_at: item.recordedAt,
      created_by: item.createdBy ?? null,
      chain_of_thought_exposed: false,
      hidden_reasoning_exposed: false,
      fabricated_provenance: false,
      auto_execution_claimed: false,
      approval_authority_claimed: false,
      verification_claimed: false,
      automatic_evidence_creation_claimed: false,
      earned_value_derived: false,
      cpm_derived: false,
      financial_posting_claimed: false,
      register_mutation_claimed: false,
      mutates_upstream_contributors: false,
    }));
    const { data, error } = await this.supabase
      .from(EXPLAINABILITY_EVIDENCE)
      .insert(rows)
      .select("*");
    if (error) throw new Error(`explainability_evidence_persist_failed:${error.message}`);
    return (data ?? []).map(mapExplainabilityEvidenceRow);
  }

  async listExplainabilityEvidence(
    tenantId: string,
    workspaceId: string,
    explainabilityStateId: string,
  ): Promise<PersistedExplainabilityEvidence[]> {
    const { data, error } = await this.supabase
      .from(EXPLAINABILITY_EVIDENCE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("explainability_state_id", explainabilityStateId);
    if (error) throw new Error(`explainability_evidence_read_failed:${error.message}`);
    return (data ?? []).map(mapExplainabilityEvidenceRow);
  }

  async saveExplainabilityReview(
    review: PersistedExplainabilityReview,
  ): Promise<PersistedExplainabilityReview> {
    const row = {
      id: review.reviewId,
      tenant_id: review.tenantId,
      workspace_id: review.workspaceId,
      project_id: review.projectId,
      explainability_state_id: review.explainabilityStateId,
      workflow_instance_id: review.workflowInstanceId,
      workflow_state: review.workflowState,
      outcome: review.outcome ?? null,
      reviewer_id: review.reviewerId ?? null,
      notes: review.notes ?? null,
      created_at: review.createdAt,
      completed_at: review.completedAt ?? null,
      self_approved: false,
      approval_authority_claimed: false,
      verification_claimed: false,
      chain_of_thought_exposed: false,
    };
    const { data, error } = await this.supabase
      .from(EXPLAINABILITY_REVIEWS)
      .insert(row)
      .select("*")
      .single();
    if (error) throw new Error(`explainability_review_persist_failed:${error.message}`);
    return mapExplainabilityReviewRow(data);
  }

  async listExplainabilityReviews(
    tenantId: string,
    workspaceId: string,
    explainabilityStateId?: string,
  ): Promise<PersistedExplainabilityReview[]> {
    let query = this.supabase
      .from(EXPLAINABILITY_REVIEWS)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId);
    if (explainabilityStateId) query = query.eq("explainability_state_id", explainabilityStateId);
    const { data, error } = await query;
    if (error) throw new Error(`explainability_review_read_failed:${error.message}`);
    return (data ?? []).map(mapExplainabilityReviewRow);
  }

  async saveExplainabilityConfidence(
    confidence: PersistedExplainabilityConfidence,
  ): Promise<PersistedExplainabilityConfidence> {
    const row = {
      tenant_id: confidence.tenantId,
      workspace_id: confidence.workspaceId,
      project_id: confidence.projectId,
      explainability_state_id: confidence.explainabilityStateId,
      confidence_payload: confidence,
      recorded_at: confidence.recordedAt,
    };
    const { data, error } = await this.supabase
      .from(EXPLAINABILITY_CONFIDENCE)
      .insert(row)
      .select("*")
      .single();
    if (error) throw new Error(`explainability_confidence_persist_failed:${error.message}`);
    return {
      ...(data.confidence_payload as PersistedExplainabilityConfidence),
      explainabilityStateId: data.explainability_state_id,
      recordedAt: data.recorded_at,
    };
  }

  async listExplainabilityConfidence(
    tenantId: string,
    workspaceId: string,
    explainabilityStateId: string,
  ): Promise<PersistedExplainabilityConfidence[]> {
    const { data, error } = await this.supabase
      .from(EXPLAINABILITY_CONFIDENCE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("explainability_state_id", explainabilityStateId);
    if (error) throw new Error(`explainability_confidence_read_failed:${error.message}`);
    return (data ?? []).map((row) => ({
      ...(row.confidence_payload as PersistedExplainabilityConfidence),
      explainabilityStateId: row.explainability_state_id,
      recordedAt: row.recorded_at,
    }));
  }


  // ----------------------------------------------------------- organizational_learning

  async saveOrganizationalLearningState(
    state: PersistedOrganizationalLearningState,
  ): Promise<PersistedOrganizationalLearningState> {
    const ctx = state.controlContext;
    const row = {
      id: state.stateId,
      tenant_id: state.tenantId,
      workspace_id: state.workspaceId,
      project_id: state.projectId,
      scope_kind: ctx.scope.kind,
      scope_reference_id: ctx.scope.referenceId ?? null,
      organizational_learning_unit_id: ctx.organizationalLearningUnitId,
      organizational_learning_unit_label: ctx.organizationalLearningUnitLabel ?? null,
      version: state.version,
      status: state.status,
      assessment_class: state.assessmentClass,
      taxonomy_class: state.taxonomyClass,
      synthesis: state.synthesis,
      learning_items: state.learningItems,
      control_context: ctx,
      contributing_contributors: state.contributingContributors,
      assumptions: state.assumptions,
      confidence_class: state.confidence.confidenceClass,
      data_sufficiency: state.confidence.dataSufficiency,
      confidence_payload: state.confidence,
      evidence_refs: state.evidenceRefs,
      reasons: state.reasons,
      limitations: state.limitations,
      abstained: state.abstained,
      abstention_reason: state.abstentionReason ?? null,
      narrative: state.narrative ?? null,
      composed_context_id: state.composedContextId ?? null,
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
      float_computed: false,
      auto_execution_enabled: false,
      schedule_execution_performed: false,
      cost_execution_performed: false,
      contract_instruction_performed: false,
      approval_authority_claimed: false,
      fabricated_lesson: false,
      unsupported_similarity_score: false,
      knowledge_mutation_claimed: false,
      resource_planning_performed: false,
      budget_ledger_mutated: false,
      financial_posting_performed: false,
      predictive_scheduling_performed: false,
      duplicate_knowledge_ownership_detected: false,
      mutates_upstream_contributors: false,
      advisory_only: true,
      mutates_project_identity: false,
    };
    const { data, error } = await this.supabase
      .from(ORGANIZATIONAL_LEARNING_STATES)
      .insert(row)
      .select("*")
      .single();
    if (error) throw new Error(`organizational_learning_state_persist_failed:${error.message}`);
    return mapOrganizationalLearningStateRow(data);
  }

  async getOrganizationalLearningStateById(
    tenantId: string,
    workspaceId: string,
    stateId: string,
  ): Promise<PersistedOrganizationalLearningState | null> {
    const { data, error } = await this.supabase
      .from(ORGANIZATIONAL_LEARNING_STATES)
      .select("*")
      .eq("id", stateId)
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .maybeSingle();
    if (error) throw new Error(`organizational_learning_state_read_failed:${error.message}`);
    return data ? mapOrganizationalLearningStateRow(data) : null;
  }

  async latestOrganizationalLearningState(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    organizationalLearningUnitId: string,
    asOf?: string,
  ): Promise<PersistedOrganizationalLearningState | undefined> {
    let query = this.supabase
      .from(ORGANIZATIONAL_LEARNING_STATES)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("scope_kind", scope.kind)
      .eq("organizational_learning_unit_id", organizationalLearningUnitId)
      .order("version", { ascending: false })
      .limit(1);
    if (scope.referenceId) query = query.eq("scope_reference_id", scope.referenceId);
    else query = query.is("scope_reference_id", null);
    if (asOf) query = query.lte("assessed_at", asOf);
    const { data, error } = await query;
    if (error) throw new Error(`organizational_learning_state_read_failed:${error.message}`);
    const row = (data ?? [])[0];
    return row ? mapOrganizationalLearningStateRow(row) : undefined;
  }

  async listOrganizationalLearningStates(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedOrganizationalLearningState[]> {
    const { data, error } = await this.supabase
      .from(ORGANIZATIONAL_LEARNING_STATES)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("project_id", projectId);
    if (error) throw new Error(`organizational_learning_state_list_failed:${error.message}`);
    return (data ?? []).map(mapOrganizationalLearningStateRow);
  }

  async nextOrganizationalLearningStateVersion(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    organizationalLearningUnitId: string,
    expectedVersion?: number,
  ): Promise<number> {
    const latest = await this.latestOrganizationalLearningState(
      tenantId,
      workspaceId,
      scope,
      organizationalLearningUnitId,
    );
    const current = latest?.version ?? 0;
    if (expectedVersion !== undefined && current !== expectedVersion) {
      throw new Error(`optimistic_lock_conflict:organizational_learning_expected=${expectedVersion}`);
    }
    return current + 1;
  }

  async saveOrganizationalLearningEvidence(
    evidence: readonly PersistedOrganizationalLearningEvidence[],
  ): Promise<PersistedOrganizationalLearningEvidence[]> {
    if (evidence.length === 0) return [];
    const rows = evidence.map((item) => ({
      id: item.evidenceId,
      tenant_id: item.tenantId,
      workspace_id: item.workspaceId,
      project_id: item.projectId,
      organizational_learning_state_id: item.organizationalLearningStateId,
      evidence_kind: item.kind,
      source_type: item.sourceType,
      source_ref: item.sourceRef,
      source_key: item.sourceKey,
      provenance: item.provenance,
      review_status: item.reviewStatus,
      observed_at: item.observedAt ?? null,
      declared_signal: item.declaredSignal ?? null,
      contributor_key: item.contributorKey ?? null,
      narrative: item.narrative ?? null,
      revoked: item.revoked ?? false,
      recorded_at: item.recordedAt,
      created_by: item.createdBy ?? null,
      fabricated_lesson: false,
      unsupported_similarity_score: false,
      knowledge_mutation_claimed: false,
      mutates_upstream_contributors: false,
    }));
    const { data, error } = await this.supabase
      .from(ORGANIZATIONAL_LEARNING_EVIDENCE)
      .insert(rows)
      .select("*");
    if (error) throw new Error(`organizational_learning_evidence_persist_failed:${error.message}`);
    return (data ?? []).map(mapOrganizationalLearningEvidenceRow);
  }

  async listOrganizationalLearningEvidence(
    tenantId: string,
    workspaceId: string,
    organizationalLearningStateId: string,
  ): Promise<PersistedOrganizationalLearningEvidence[]> {
    const { data, error } = await this.supabase
      .from(ORGANIZATIONAL_LEARNING_EVIDENCE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("organizational_learning_state_id", organizationalLearningStateId);
    if (error) throw new Error(`organizational_learning_evidence_read_failed:${error.message}`);
    return (data ?? []).map(mapOrganizationalLearningEvidenceRow);
  }

  async saveOrganizationalLearningReview(
    review: PersistedOrganizationalLearningReview,
  ): Promise<PersistedOrganizationalLearningReview> {
    const row = {
      id: review.reviewId,
      tenant_id: review.tenantId,
      workspace_id: review.workspaceId,
      project_id: review.projectId,
      organizational_learning_state_id: review.organizationalLearningStateId,
      workflow_instance_id: review.workflowInstanceId,
      workflow_state: review.workflowState,
      outcome: review.outcome ?? null,
      reviewer_id: review.reviewerId ?? null,
      notes: review.notes ?? null,
      created_at: review.createdAt,
      completed_at: review.completedAt ?? null,
      self_approved: false,
      approval_authority_claimed: false,
      fabricated_lesson: false,
      unsupported_similarity_score: false,
    };
    const { data, error } = await this.supabase
      .from(ORGANIZATIONAL_LEARNING_REVIEWS)
      .insert(row)
      .select("*")
      .single();
    if (error) throw new Error(`organizational_learning_review_persist_failed:${error.message}`);
    return mapOrganizationalLearningReviewRow(data);
  }

  async listOrganizationalLearningReviews(
    tenantId: string,
    workspaceId: string,
    organizationalLearningStateId?: string,
  ): Promise<PersistedOrganizationalLearningReview[]> {
    let query = this.supabase
      .from(ORGANIZATIONAL_LEARNING_REVIEWS)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId);
    if (organizationalLearningStateId) {
      query = query.eq("organizational_learning_state_id", organizationalLearningStateId);
    }
    const { data, error } = await query;
    if (error) throw new Error(`organizational_learning_review_read_failed:${error.message}`);
    return (data ?? []).map(mapOrganizationalLearningReviewRow);
  }

  async saveOrganizationalLearningConfidence(
    confidence: PersistedOrganizationalLearningConfidence,
  ): Promise<PersistedOrganizationalLearningConfidence> {
    const row = {
      tenant_id: confidence.tenantId,
      workspace_id: confidence.workspaceId,
      project_id: confidence.projectId,
      organizational_learning_state_id: confidence.organizationalLearningStateId,
      confidence_payload: confidence,
      recorded_at: confidence.recordedAt,
    };
    const { data, error } = await this.supabase
      .from(ORGANIZATIONAL_LEARNING_CONFIDENCE)
      .insert(row)
      .select("*")
      .single();
    if (error) throw new Error(`organizational_learning_confidence_persist_failed:${error.message}`);
    return {
      ...(data.confidence_payload as PersistedOrganizationalLearningConfidence),
      organizationalLearningStateId: data.organizational_learning_state_id,
      recordedAt: data.recorded_at,
    };
  }

  async listOrganizationalLearningConfidence(
    tenantId: string,
    workspaceId: string,
    organizationalLearningStateId: string,
  ): Promise<PersistedOrganizationalLearningConfidence[]> {
    const { data, error } = await this.supabase
      .from(ORGANIZATIONAL_LEARNING_CONFIDENCE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("organizational_learning_state_id", organizationalLearningStateId);
    if (error) throw new Error(`organizational_learning_confidence_read_failed:${error.message}`);
    return (data ?? []).map((row) => ({
      ...(row.confidence_payload as PersistedOrganizationalLearningConfidence),
      organizationalLearningStateId: row.organizational_learning_state_id,
      recordedAt: row.recorded_at,
    }));
  }

  // ------------------------------------- shared project snapshot and timeline

  async saveProjectSnapshot(
    snapshot: PersistedProjectSnapshot,
  ): Promise<PersistedProjectSnapshot> {
    const row = {
      id: snapshot.snapshotId,
      tenant_id: snapshot.tenantId,
      workspace_id: snapshot.workspaceId,
      project_id: snapshot.projectId,
      schema_version: snapshot.schemaVersion,
      captured_at: snapshot.capturedAt,
      profile_id: snapshot.profileId ?? null,
      progress_state_ids: snapshot.progressStateIds,
      schedule_state_ids: snapshot.scheduleStateIds,
      change_state_ids: snapshot.changeStateIds,
      cost_state_ids: snapshot.costStateIds,
      productivity_state_ids: snapshot.productivityStateIds,
      forecast_state_ids: snapshot.forecastStateIds,
      decision_state_ids: snapshot.decisionStateIds,
      scenario_state_ids: snapshot.scenarioStateIds,
      risk_opportunity_state_ids: snapshot.riskOpportunityStateIds,
      assurance_state_ids: snapshot.assuranceStateIds,
      explainability_state_ids: snapshot.explainabilityStateIds,
      organizational_learning_state_ids: snapshot.organizationalLearningStateIds,
      created_by: snapshot.createdBy ?? null,
      immutable: true,
      contains_evidence_payloads: false,
      is_project_registry: false,
      mutates_project_identity: false,
      earned_value_computed: false,
      financial_posting_performed: false,
      contractual_approval_claimed: false,
    };
    const { data, error } = await this.supabase
      .from(PROJECT_SNAPSHOTS)
      .insert(row)
      .select("*")
      .single();
    if (error) throw new Error(`project_snapshot_persist_failed:${error.message}`);
    return mapProjectSnapshotRow(data);
  }

  async getProjectSnapshotById(
    tenantId: string,
    workspaceId: string,
    snapshotId: string,
  ): Promise<PersistedProjectSnapshot | null> {
    const { data, error } = await this.supabase
      .from(PROJECT_SNAPSHOTS)
      .select("*")
      .eq("id", snapshotId)
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .maybeSingle();
    if (error) throw new Error(`project_snapshot_read_failed:${error.message}`);
    return data ? mapProjectSnapshotRow(data) : null;
  }

  async listProjectSnapshots(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedProjectSnapshot[]> {
    const { data, error } = await this.supabase
      .from(PROJECT_SNAPSHOTS)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("project_id", projectId)
      .order("captured_at", { ascending: false });
    if (error) throw new Error(`project_snapshot_list_failed:${error.message}`);
    return (data ?? []).map(mapProjectSnapshotRow);
  }

  async appendProjectTimeline(
    entry: PersistedProjectTimelineEvent,
  ): Promise<PersistedProjectTimelineEvent> {
    const row = {
      entry_id: entry.entryId,
      tenant_id: entry.tenantId,
      workspace_id: entry.workspaceId,
      project_id: entry.projectId,
      state_id: entry.stateId ?? null,
      kind: entry.kind,
      event_type: entry.eventType,
      recorded_at: entry.recordedAt,
      source_key: entry.sourceKey,
      actor_id: entry.actorId ?? null,
      detail: entry.detail ?? null,
      governance: entry.governance,
    };
    const { data, error } = await this.supabase
      .from(PROJECT_TIMELINE)
      .insert(row)
      .select("*")
      .single();
    if (error) throw new Error(`project_timeline_persist_failed:${error.message}`);
    return mapProjectTimelineRow(data);
  }

  async listProjectTimeline(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedProjectTimelineEvent[]> {
    const { data, error } = await this.supabase
      .from(PROJECT_TIMELINE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("project_id", projectId)
      .order("recorded_at", { ascending: true });
    if (error) throw new Error(`project_timeline_read_failed:${error.message}`);
    return (data ?? []).map(mapProjectTimelineRow);
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
      schedule_summary: profile.schedule ?? {},
      change_summary: profile.change ?? {},
      cost_summary: profile.cost ?? {},
      productivity_summary: profile.productivity ?? {},
      forecast_summary: profile.forecast ?? {},
      decision_summary: profile.decisionSupport ?? {},
      scenario_summary: profile.scenarioIntelligence ?? {},
      risk_opportunity_summary: profile.riskOpportunityIntelligence ?? {},
      assurance_summary: profile.assuranceIntelligence ?? {},
      explainability_summary: profile.explainabilityIntelligence ?? {},
      organizational_learning_summary: profile.organizationalLearning ?? {},
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
    schedule: row.schedule_summary ?? undefined,
    change: row.change_summary ?? undefined,
    cost: row.cost_summary ?? undefined,
    productivity: row.productivity_summary ?? undefined,
    forecast: row.forecast_summary ?? undefined,
    decisionSupport: row.decision_summary ?? undefined,
    scenarioIntelligence: row.scenario_summary ?? undefined,
    riskOpportunityIntelligence: row.risk_opportunity_summary ?? undefined,
    assuranceIntelligence: row.assurance_summary ?? undefined,
    explainabilityIntelligence: row.explainability_summary ?? undefined,
    organizationalLearning: row.organizational_learning_summary ?? undefined,
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
    floatComputed: false,
    costIntegrated: false,
    financialPostingPerformed: false,
    contractualApprovalClaimed: false,
    forecastProduced: false,
    advisoryOnly: true,
    mutatesProjectIdentity: false,
    isProjectRegistry: false,
  };
}

function mapScheduleAssessmentRow(row: any): PersistedScheduleAssessment {
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
    milestonePosture: row.milestone_posture ?? undefined,
    declaredBaselineDate: row.declared_baseline_date ?? undefined,
    declaredCurrentDate: row.declared_current_date ?? undefined,
    declaredDateDeltaDays: row.declared_date_delta_days ?? undefined,
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
    floatComputed: false,
    forwardBackwardPassComputed: false,
    costIntegrated: false,
    forecastProduced: false,
    scheduleExecuted: false,
    resourceLevelled: false,
    advisoryOnly: true,
    mutatesProjectIdentity: false,
    mutatesActivityIdentity: false,
    autonomousPublication: false,
  };
}

function mapScheduleEvidenceRow(row: any): PersistedScheduleEvidence {
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
    declaredBaselineDate: row.declared_baseline_date ?? undefined,
    declaredCurrentDate: row.declared_current_date ?? undefined,
    declaredPosture: row.declared_posture ?? undefined,
    weight: row.weight ?? undefined,
    reviewStatus: row.review_status ?? undefined,
    revoked: row.revoked ?? false,
    conflictsWith: row.conflicts_with ?? [],
    recordedAt: row.recorded_at,
    createdBy: row.created_by ?? undefined,
    derivedFromCpm: false,
    derivedFromFloat: false,
    derivedFromEarnedValue: false,
    mutatesActivityIdentity: false,
  };
}

function mapScheduleReviewRow(row: any): PersistedScheduleReview {
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

function mapScheduleSnapshotRow(row: any): PersistedScheduleSnapshot {
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
    milestonePosture: row.milestone_posture ?? undefined,
    confidenceClass: row.confidence_class,
    dataSufficiency: row.data_sufficiency,
    evidenceRefs: row.evidence_refs ?? [],
    projectReferenceResolved: true,
    isProjectRegistry: false,
    mutatesProjectIdentity: false,
    criticalPathComputed: false,
    floatComputed: false,
  };
}

function mapScheduleTimelineRow(row: any): PersistedScheduleTimelineEvent {
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
      floatComputed: false,
      mutatesProjectIdentity: false,
    },
  };
}

function mapChangeStateRow(row: any): PersistedChangeState {
  return {
    id: row.id,
    stateId: row.id,
    tenantId: row.tenant_id,
    workspaceId: row.workspace_id,
    projectId: row.project_id,
    scope: scopeFromRow(row),
    version: row.version,
    status: row.status,
    assessmentClass: row.assessment_class,
    changeClass: row.change_class,
    changeStatusContext: row.change_status_context,
    authoritativeChangeRef: row.authoritative_change_ref ?? undefined,
    candidateId: row.candidate_id ?? undefined,
    impact: row.impact_contexts,
    evidenceRefs: row.evidence_refs ?? [],
    confidence: row.confidence_payload,
    reasons: row.reasons ?? [],
    limitations: row.limitations ?? [],
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
    floatComputed: false,
    costIntegrated: false,
    budgetMutated: false,
    financialPostingPerformed: false,
    forecastProduced: false,
    contingencyDrawn: false,
    changeExecuted: false,
    contractualApprovalClaimed: false,
    contractualAuthorityClaimed: false,
    coreRiskMutated: false,
    advisoryOnly: true,
    mutatesProjectIdentity: false,
    autonomousPublication: false,
  };
}

function mapChangeEvidenceRow(row: any): PersistedChangeEvidence {
  return {
    evidenceId: row.id,
    tenantId: row.tenant_id,
    workspaceId: row.workspace_id,
    projectId: row.project_id,
    changeStateId: row.change_state_id,
    scope: scopeFromRow(row),
    kind: row.evidence_kind,
    sourceType: row.source_type,
    sourceRef: row.source_ref,
    sourceKey: row.source_key,
    sourceVersion: row.source_version ?? undefined,
    provenance: row.provenance,
    reviewStatus: row.review_status,
    observedAt: row.observed_at ?? undefined,
    confidence: row.confidence ?? undefined,
    weight: row.weight ?? undefined,
    declaredChangeClass: row.declared_change_class ?? undefined,
    declaredStatusContext: row.declared_status_context ?? undefined,
    narrative: row.narrative ?? undefined,
    revoked: row.revoked ?? false,
    conflictsWith: row.conflicts_with ?? [],
    recordedAt: row.recorded_at,
    createdBy: row.created_by ?? undefined,
    derivedFromEarnedValue: false,
    mutatesCoreRisk: false,
    mutatesBudget: false,
    contractualApprovalClaimed: false,
  };
}

function mapChangeReviewRow(row: any): PersistedChangeReview {
  return {
    reviewId: row.id,
    tenantId: row.tenant_id,
    workspaceId: row.workspace_id,
    projectId: row.project_id,
    changeStateId: row.change_state_id,
    workflowInstanceId: row.workflow_instance_id,
    workflowState: row.workflow_state,
    outcome: row.outcome ?? undefined,
    reviewerId: row.reviewer_id ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    completedAt: row.completed_at ?? undefined,
    selfApproved: false,
    contractualApprovalClaimed: false,
  };
}

function mapChangeConfidenceRow(row: any): PersistedChangeConfidence {
  return {
    confidenceId: row.id,
    changeStateId: row.change_state_id,
    tenantId: row.tenant_id,
    workspaceId: row.workspace_id,
    projectId: row.project_id,
    scope: scopeFromRow(row),
    score: row.score,
    confidenceClass: row.confidence_class,
    dataSufficiency: row.data_sufficiency,
    evidenceCount: row.evidence_count,
    usableEvidenceCount: row.usable_evidence_count,
    sourceDiversity: row.source_diversity,
    freshness: row.freshness,
    reviewCompleteness: row.review_completeness,
    provenanceQuality: row.provenance_quality,
    agreement: row.agreement,
    conflictState: row.conflict_state,
    abstention: row.abstention,
    abstentionReason: row.abstention_reason ?? undefined,
    reasons: row.reasons ?? [],
    method: row.method,
    methodVersion: row.method_version,
    assessedAt: row.assessed_at,
    recordedAt: row.recorded_at,
    engineeringCorrectnessClaimed: false,
    contractualCertaintyClaimed: false,
  };
}

function mapChangeCandidateRow(row: any): PersistedChangeCandidate {
  return {
    candidateId: row.id,
    tenantId: row.tenant_id,
    workspaceId: row.workspace_id,
    projectId: row.project_id,
    scope: scopeFromRow(row),
    changeClass: row.change_class,
    status: row.status,
    signalRefs: row.signal_refs ?? [],
    title: row.title ?? undefined,
    narrative: row.narrative ?? undefined,
    createdAt: row.created_at,
    createdBy: row.created_by ?? undefined,
    supersedesId: row.supersedes_id ?? undefined,
    isApprovedChange: false,
    contractualApprovalClaimed: false,
    mutatesBudget: false,
    derivedFromEarnedValue: false,
  };
}

function mapCostStateRow(row: any): PersistedCostState {
  const ctx = row.control_context;
  return {
    id: row.id,
    stateId: row.id,
    tenantId: row.tenant_id,
    workspaceId: row.workspace_id,
    projectId: row.project_id,
    controlContext: ctx,
    version: row.version,
    status: row.status,
    assessmentClass: row.assessment_class,
    costPosture: row.cost_posture,
    varianceAttribution: row.variance_attribution,
    costBasisRef: row.cost_basis_ref ?? undefined,
    changeIntelligenceRefs: row.change_intelligence_refs ?? [],
    evidenceRefs: row.evidence_refs ?? [],
    confidence: row.confidence_payload,
    reasons: row.reasons ?? [],
    limitations: row.limitations ?? [],
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
    floatComputed: false,
    budgetMutated: false,
    financialPostingPerformed: false,
    forecastProduced: false,
    contingencyDrawn: false,
    changeExecuted: false,
    scheduleExecuted: false,
    advisoryOnly: true,
    mutatesProjectIdentity: false,
    autonomousPublication: false,
  };
}

function mapCostEvidenceRow(row: any): PersistedCostEvidence {
  return {
    evidenceId: row.id,
    tenantId: row.tenant_id,
    workspaceId: row.workspace_id,
    projectId: row.project_id,
    costStateId: row.cost_state_id,
    kind: row.evidence_kind,
    sourceType: row.source_type,
    sourceRef: row.source_ref,
    sourceKey: row.source_key,
    sourceVersion: row.source_version ?? undefined,
    provenance: row.provenance,
    reviewStatus: row.review_status,
    observedAt: row.observed_at ?? undefined,
    currencyCode: row.currency_code,
    declaredDirection: row.declared_direction ?? undefined,
    confidence: row.confidence ?? undefined,
    weight: row.weight ?? undefined,
    narrative: row.narrative ?? undefined,
    revoked: row.revoked ?? false,
    conflictsWith: row.conflicts_with ?? [],
    recordedAt: row.recorded_at,
    createdBy: row.created_by ?? undefined,
    derivedFromEarnedValue: false,
    mutatesCoreRisk: false,
    mutatesBudget: false,
    financialPostingClaimed: false,
    forecastDerived: false,
  };
}

function mapCostReviewRow(row: any): PersistedCostReview {
  return {
    reviewId: row.id,
    tenantId: row.tenant_id,
    workspaceId: row.workspace_id,
    projectId: row.project_id,
    costStateId: row.cost_state_id,
    workflowInstanceId: row.workflow_instance_id,
    workflowState: row.workflow_state,
    outcome: row.outcome ?? undefined,
    reviewerId: row.reviewer_id ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    completedAt: row.completed_at ?? undefined,
    selfApproved: false,
    financialPostingClaimed: false,
  };
}

function mapProductivityStateRow(row: any): PersistedProductivityState {
  const ctx = row.control_context;
  return {
    id: row.id,
    stateId: row.id,
    tenantId: row.tenant_id,
    workspaceId: row.workspace_id,
    projectId: row.project_id,
    controlContext: ctx,
    version: row.version,
    status: row.status,
    assessmentClass: row.assessment_class,
    productivityPosture: row.productivity_posture,
    factors: row.factors ?? [],
    evidenceRefs: row.evidence_refs ?? [],
    confidence: row.confidence_payload,
    reasons: row.reasons ?? [],
    limitations: row.limitations ?? [],
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
    floatComputed: false,
    workforceManagementPerformed: false,
    timesheetProcessed: false,
    payrollProcessed: false,
    resourcePlanningPerformed: false,
    labourCostComputed: false,
    labourProductivityPercentComputed: false,
    forecastProduced: false,
    financialPostingPerformed: false,
    changeExecuted: false,
    scheduleExecuted: false,
    advisoryOnly: true,
    mutatesProjectIdentity: false,
    autonomousPublication: false,
  };
}

function mapProductivityEvidenceRow(row: any): PersistedProductivityEvidence {
  return {
    evidenceId: row.id,
    tenantId: row.tenant_id,
    workspaceId: row.workspace_id,
    projectId: row.project_id,
    productivityStateId: row.productivity_state_id,
    kind: row.evidence_kind,
    sourceType: row.source_type,
    sourceRef: row.source_ref,
    sourceKey: row.source_key,
    sourceVersion: row.source_version ?? undefined,
    provenance: row.provenance,
    reviewStatus: row.review_status,
    observedAt: row.observed_at ?? undefined,
    declaredTrend: row.declared_trend ?? undefined,
    confidence: row.confidence ?? undefined,
    weight: row.weight ?? undefined,
    narrative: row.narrative ?? undefined,
    revoked: row.revoked ?? false,
    conflictsWith: row.conflicts_with ?? [],
    recordedAt: row.recorded_at,
    createdBy: row.created_by ?? undefined,
    derivedFromTimesheet: false,
    derivedFromPayroll: false,
    labourProductivityPercentClaimed: false,
    resourcePlanningClaimed: false,
    forecastDerived: false,
    earnedValueDerived: false,
    mutatesCoreRisk: false,
  };
}

function mapForecastStateRow(row: any): PersistedForecastState {
  const ctx = row.control_context;
  return {
    id: row.id,
    stateId: row.id,
    tenantId: row.tenant_id,
    workspaceId: row.workspace_id,
    projectId: row.project_id,
    controlContext: ctx,
    version: row.version,
    status: row.status,
    assessmentClass: row.assessment_class,
    forecastPosture: row.forecast_posture,
    contributingContributors: row.contributing_contributors ?? [],
    evidenceRefs: row.evidence_refs ?? [],
    confidence: row.confidence_payload,
    assumptions: row.assumptions ?? [],
    reasons: row.reasons ?? [],
    limitations: row.limitations ?? [],
    abstained: row.abstained,
    abstentionReason: row.abstention_reason ?? undefined,
    narrative: row.narrative ?? undefined,
    composedContextId: row.composed_context_id ?? undefined,
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
    floatComputed: false,
    completionDatePredicted: false,
    costForecastComputed: false,
    resourcePlanningPerformed: false,
    budgetLedgerMutated: false,
    financialPostingPerformed: false,
    predictiveSchedulingPerformed: false,
    scheduleExecuted: false,
    changeExecuted: false,
    mutatesUpstreamContributors: false,
    advisoryOnly: true,
    mutatesProjectIdentity: false,
    autonomousPublication: false,
  };
}

function mapForecastEvidenceRow(row: any): PersistedForecastEvidence {
  return {
    evidenceId: row.id,
    tenantId: row.tenant_id,
    workspaceId: row.workspace_id,
    projectId: row.project_id,
    forecastStateId: row.forecast_state_id,
    kind: row.evidence_kind,
    sourceType: row.source_type,
    sourceRef: row.source_ref,
    sourceKey: row.source_key,
    sourceVersion: row.source_version ?? undefined,
    provenance: row.provenance,
    reviewStatus: row.review_status,
    observedAt: row.observed_at ?? undefined,
    declaredSignal: row.declared_signal ?? undefined,
    contributorKey: row.contributor_key ?? undefined,
    confidence: row.confidence ?? undefined,
    weight: row.weight ?? undefined,
    narrative: row.narrative ?? undefined,
    revoked: row.revoked ?? false,
    conflictsWith: row.conflicts_with ?? [],
    recordedAt: row.recorded_at,
    createdBy: row.created_by ?? undefined,
    completionDateClaimed: false,
    costForecastClaimed: false,
    earnedValueDerived: false,
    cpmDerived: false,
    resourcePlanningClaimed: false,
    budgetLedgerClaimed: false,
    financialPostingClaimed: false,
    mutatesCoreRisk: false,
  };
}

function mapForecastReviewRow(row: any): PersistedForecastReview {
  return {
    reviewId: row.id,
    tenantId: row.tenant_id,
    workspaceId: row.workspace_id,
    projectId: row.project_id,
    forecastStateId: row.forecast_state_id,
    workflowInstanceId: row.workflow_instance_id,
    workflowState: row.workflow_state,
    outcome: row.outcome ?? undefined,
    reviewerId: row.reviewer_id ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    completedAt: row.completed_at ?? undefined,
    selfApproved: false,
    completionDateClaimed: false,
  };
}

function mapProductivityReviewRow(row: any): PersistedProductivityReview {
  return {
    reviewId: row.id,
    tenantId: row.tenant_id,
    workspaceId: row.workspace_id,
    projectId: row.project_id,
    productivityStateId: row.productivity_state_id,
    workflowInstanceId: row.workflow_instance_id,
    workflowState: row.workflow_state,
    outcome: row.outcome ?? undefined,
    reviewerId: row.reviewer_id ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    completedAt: row.completed_at ?? undefined,
    selfApproved: false,
    workforceManagementClaimed: false,
  };
}


function mapDecisionStateRow(row: any): PersistedDecisionState {
  const ctx = row.control_context;
  return {
    id: row.id,
    stateId: row.id,
    tenantId: row.tenant_id,
    workspaceId: row.workspace_id,
    projectId: row.project_id,
    controlContext: ctx,
    version: row.version,
    status: row.status,
    assessmentClass: row.assessment_class,
    options: row.options ?? [],
    recommendations: row.recommendations ?? [],
    dominantDecisionClass: row.dominant_decision_class ?? undefined,
    contributingContributors: row.contributing_contributors ?? [],
    evidenceRefs: row.evidence_refs ?? [],
    confidence: row.confidence_payload,
    assumptions: row.assumptions ?? [],
    reasons: row.reasons ?? [],
    limitations: row.limitations ?? [],
    abstained: row.abstained,
    abstentionReason: row.abstention_reason ?? undefined,
    narrative: row.narrative ?? undefined,
    composedContextId: row.composed_context_id ?? undefined,
    forecastContextId: row.forecast_context_id ?? undefined,
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
    floatComputed: false,
    autoExecutionEnabled: false,
    scheduleExecutionPerformed: false,
    costExecutionPerformed: false,
    contractInstructionPerformed: false,
    approvalAuthorityClaimed: false,
    resourcePlanningPerformed: false,
    budgetLedgerMutated: false,
    financialPostingPerformed: false,
    predictiveSchedulingPerformed: false,
    advisoryOnly: true,
    mutatesProjectIdentity: false,
    mutatesUpstreamContributors: false,
    autonomousPublication: false,
  };
}

function mapDecisionEvidenceRow(row: any): PersistedDecisionEvidence {
  return {
    evidenceId: row.id,
    kind: row.evidence_kind,
    sourceType: row.source_type,
    sourceRef: row.source_ref,
    sourceKey: row.source_key,
    sourceVersion: row.source_version ?? undefined,
    provenance: row.provenance,
    reviewStatus: row.review_status,
    observedAt: row.observed_at ?? undefined,
    declaredSignal: row.declared_signal ?? undefined,
    confidence: row.confidence ?? undefined,
    weight: row.weight ?? undefined,
    narrative: row.narrative ?? undefined,
    revoked: row.revoked ?? false,
    conflictsWith: row.conflicts_with ?? [],
    contributorKey: row.contributor_key ?? undefined,
    tenantId: row.tenant_id,
    workspaceId: row.workspace_id,
    projectId: row.project_id,
    decisionStateId: row.decision_state_id,
    recordedAt: row.recorded_at,
    createdBy: row.created_by ?? undefined,
    autoExecutionClaimed: false,
    scheduleExecutionClaimed: false,
    costExecutionClaimed: false,
    contractInstructionClaimed: false,
    approvalAuthorityClaimed: false,
    earnedValueDerived: false,
    cpmDerived: false,
    financialPostingClaimed: false,
    mutatesCoreRisk: false,
  };
}

function mapDecisionReviewRow(row: any): PersistedDecisionReview {
  return {
    reviewId: row.id,
    tenantId: row.tenant_id,
    workspaceId: row.workspace_id,
    projectId: row.project_id,
    decisionStateId: row.decision_state_id,
    workflowInstanceId: row.workflow_instance_id,
    workflowState: row.workflow_state,
    outcome: row.outcome ?? undefined,
    reviewerId: row.reviewer_id ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    completedAt: row.completed_at ?? undefined,
    selfApproved: false,
    approvalAuthorityClaimed: false,
  };
}

function mapProjectSnapshotRow(row: any): PersistedProjectSnapshot {
  return {
    snapshotId: row.id,
    schemaVersion: row.schema_version,
    tenantId: row.tenant_id,
    workspaceId: row.workspace_id,
    projectId: row.project_id,
    capturedAt: row.captured_at,
    profileId: row.profile_id ?? undefined,
    progressStateIds: row.progress_state_ids ?? [],
    scheduleStateIds: row.schedule_state_ids ?? [],
    changeStateIds: row.change_state_ids ?? [],
    costStateIds: row.cost_state_ids ?? [],
    productivityStateIds: row.productivity_state_ids ?? [],
    forecastStateIds: row.forecast_state_ids ?? [],
    decisionStateIds: row.decision_state_ids ?? [],
    scenarioStateIds: row.scenario_state_ids ?? [],
    riskOpportunityStateIds: row.risk_opportunity_state_ids ?? [],
    assuranceStateIds: row.assurance_state_ids ?? [],
    explainabilityStateIds: row.explainability_state_ids ?? [],
    organizationalLearningStateIds: row.organizational_learning_state_ids ?? [],
    createdBy: row.created_by ?? undefined,
    immutable: true,
    containsEvidencePayloads: false,
    projectReferenceResolved: true,
    isProjectRegistry: false,
    mutatesProjectIdentity: false,
    earnedValueComputed: false,
    financialPostingPerformed: false,
    contractualApprovalClaimed: false,
  };
}

function mapProjectTimelineRow(row: any): PersistedProjectTimelineEvent {
  return {
    entryId: row.entry_id,
    tenantId: row.tenant_id,
    workspaceId: row.workspace_id,
    projectId: row.project_id,
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
      floatComputed: false,
      financialPostingPerformed: false,
      contractualApprovalClaimed: false,
      mutatesProjectIdentity: false,
    },
  };
}

function mapScenarioStateRow(row: any): PersistedScenarioState {
  const ctx = row.control_context;
  return {
    id: row.id,
    stateId: row.id,
    tenantId: row.tenant_id,
    workspaceId: row.workspace_id,
    projectId: row.project_id,
    controlContext: ctx,
    version: row.version,
    status: row.status,
    assessmentClass: row.assessment_class,
    comparison: row.comparison ?? {
      comparisonId: row.id,
      scenarioOptions: [],
      comparisonNotes: [],
      preferredScenarioSelected: false,
      optimisationPerformed: false,
    },
    scenarioOptions: row.scenario_options ?? [],
    contributingContributors: row.contributing_contributors ?? [],
    evidenceRefs: row.evidence_refs ?? [],
    confidence: row.confidence_payload,
    assumptions: row.assumptions ?? [],
    reasons: row.reasons ?? [],
    limitations: row.limitations ?? [],
    abstained: row.abstained,
    abstentionReason: row.abstention_reason ?? undefined,
    narrative: row.narrative ?? undefined,
    composedContextId: row.composed_context_id ?? undefined,
    forecastContextId: row.forecast_context_id ?? undefined,
    decisionContextId: row.decision_context_id ?? undefined,
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
    floatComputed: false,
    autoExecutionEnabled: false,
    scheduleExecutionPerformed: false,
    costExecutionPerformed: false,
    contractInstructionPerformed: false,
    approvalAuthorityClaimed: false,
    resourcePlanningPerformed: false,
    budgetLedgerMutated: false,
    financialPostingPerformed: false,
    predictiveSchedulingPerformed: false,
    advisoryOnly: true,
    mutatesProjectIdentity: false,
    mutatesUpstreamContributors: false,
    autonomousPublication: false,
    completionDatePredicted: false,
    costDecisionComputed: false,
    scheduleExecuted: false,
    preferredScenarioSelected: false,
    optimisationPerformed: false,
    monteCarloPerformed: false,
    numericalPrecisionClaimed: false,
  };
}

function mapScenarioEvidenceRow(row: any): PersistedScenarioEvidence {
  return {
    evidenceId: row.id,
    kind: row.evidence_kind,
    sourceType: row.source_type,
    sourceRef: row.source_ref,
    sourceKey: row.source_key,
    sourceVersion: row.source_version ?? undefined,
    provenance: row.provenance,
    reviewStatus: row.review_status,
    observedAt: row.observed_at ?? undefined,
    declaredSignal: row.declared_signal ?? undefined,
    narrative: row.narrative ?? undefined,
    revoked: row.revoked ?? false,
    conflictsWith: row.conflicts_with ?? [],
    contributorKey: row.contributor_key ?? undefined,
    tenantId: row.tenant_id,
    workspaceId: row.workspace_id,
    projectId: row.project_id,
    scenarioStateId: row.scenario_state_id,
    recordedAt: row.recorded_at,
    createdBy: row.created_by ?? undefined,
    autoExecutionClaimed: false,
    scheduleExecutionClaimed: false,
    costExecutionClaimed: false,
    contractInstructionClaimed: false,
    approvalAuthorityClaimed: false,
    earnedValueDerived: false,
    cpmDerived: false,
    financialPostingClaimed: false,
    monteCarloClaimed: false,
    numericalPrecisionClaimed: false,
    preferredSelectionClaimed: false,
    optimisationClaimed: false,
    mutatesCoreRisk: false,
  };
}

function mapScenarioReviewRow(row: any): PersistedScenarioReview {
  return {
    reviewId: row.id,
    tenantId: row.tenant_id,
    workspaceId: row.workspace_id,
    projectId: row.project_id,
    scenarioStateId: row.scenario_state_id,
    workflowInstanceId: row.workflow_instance_id,
    workflowState: row.workflow_state,
    outcome: row.outcome ?? undefined,
    reviewerId: row.reviewer_id ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    completedAt: row.completed_at ?? undefined,
    selfApproved: false,
    approvalAuthorityClaimed: false,
  };
}

function mapRiskOpportunityStateRow(row: any): PersistedRiskOpportunityState {
  const ctx = row.control_context;
  return {
    id: row.id,
    stateId: row.id,
    tenantId: row.tenant_id,
    workspaceId: row.workspace_id,
    projectId: row.project_id,
    controlContext: ctx,
    version: row.version,
    status: row.status,
    assessmentClass: row.assessment_class,
    synthesis: row.synthesis ?? {
      synthesisId: row.id,
      riskSignals: [],
      opportunitySignals: [],
      crossContributorConflicts: [],
      escalationIndicators: [],
      synthesisNotes: [],
      riskRegisterMutated: false,
      opportunityRegisterMutated: false,
      ownerAssignmentPerformed: false,
      treatmentExecutionPerformed: false,
    },
    riskSignals: row.risk_signals ?? [],
    opportunitySignals: row.opportunity_signals ?? [],
    contributingContributors: row.contributing_contributors ?? [],
    evidenceRefs: row.evidence_refs ?? [],
    confidence: row.confidence_payload,
    assumptions: row.assumptions ?? [],
    reasons: row.reasons ?? [],
    limitations: row.limitations ?? [],
    abstained: row.abstained,
    abstentionReason: row.abstention_reason ?? undefined,
    narrative: row.narrative ?? undefined,
    composedContextId: row.composed_context_id ?? undefined,
    forecastContextId: row.forecast_context_id ?? undefined,
    decisionContextId: row.decision_context_id ?? undefined,
    scenarioContextId: row.scenario_context_id ?? undefined,
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
    floatComputed: false,
    autoExecutionEnabled: false,
    scheduleExecutionPerformed: false,
    costExecutionPerformed: false,
    contractInstructionPerformed: false,
    approvalAuthorityClaimed: false,
    resourcePlanningPerformed: false,
    budgetLedgerMutated: false,
    financialPostingPerformed: false,
    predictiveSchedulingPerformed: false,
    advisoryOnly: true,
    mutatesProjectIdentity: false,
    mutatesUpstreamContributors: false,
    autonomousPublication: false,
    riskRegisterMutated: false,
    opportunityRegisterMutated: false,
    ownerAssignmentPerformed: false,
    treatmentExecutionPerformed: false,
    duplicateRiskOwnershipDetected: false,
    monteCarloPerformed: false,
    numericalPrecisionClaimed: false,
  };
}

function mapAssuranceStateRow(row: any): PersistedAssuranceState {
  const ctx = row.control_context;
  return {
    id: row.id,
    stateId: row.id,
    tenantId: row.tenant_id,
    workspaceId: row.workspace_id,
    projectId: row.project_id,
    controlContext: ctx,
    version: row.version,
    status: row.status,
    assessmentClass: row.assessment_class,
    assurancePosture: row.assurance_posture,
    synthesis: row.synthesis ?? {
      synthesisId: row.id,
      integratedPosture: row.assurance_posture ?? "unknown",
      contributorFindings: [],
      crossContributorConflicts: [],
      evidenceGapNotes: [],
      staleSourceNotes: [],
      unsupportedClaimNotes: [],
      synthesisNotes: [],
      certificationClaimed: false,
      verificationClaimed: false,
      approvalClaimed: false,
      evidenceApproved: false,
      mutatesUpstreamContributors: false,
    },
    contributorFindings: row.contributor_findings ?? [],
    contributingContributors: row.contributing_contributors ?? [],
    evidenceRefs: row.evidence_refs ?? [],
    confidence: row.confidence_payload,
    assumptions: row.assumptions ?? [],
    reasons: row.reasons ?? [],
    limitations: row.limitations ?? [],
    abstained: row.abstained,
    abstentionReason: row.abstention_reason ?? undefined,
    narrative: row.narrative ?? undefined,
    composedContextId: row.composed_context_id ?? undefined,
    forecastContextId: row.forecast_context_id ?? undefined,
    decisionContextId: row.decision_context_id ?? undefined,
    scenarioContextId: row.scenario_context_id ?? undefined,
    riskOpportunityContextId: row.risk_opportunity_context_id ?? undefined,
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
    floatComputed: false,
    autoExecutionEnabled: false,
    scheduleExecutionPerformed: false,
    costExecutionPerformed: false,
    contractInstructionPerformed: false,
    approvalAuthorityClaimed: false,
    certificationClaimed: false,
    verificationClaimed: false,
    evidenceApprovalClaimed: false,
    resourcePlanningPerformed: false,
    budgetLedgerMutated: false,
    financialPostingPerformed: false,
    predictiveSchedulingPerformed: false,
    advisoryOnly: true,
    mutatesProjectIdentity: false,
    mutatesUpstreamContributors: false,
    autonomousPublication: false,
    duplicateAssuranceOwnershipDetected: false,
    numericalPrecisionClaimed: false,
  };
}

function mapAssuranceEvidenceRow(row: any): PersistedAssuranceEvidence {
  return {
    evidenceId: row.id,
    kind: row.evidence_kind,
    sourceType: row.source_type,
    sourceRef: row.source_ref,
    sourceKey: row.source_key,
    sourceVersion: row.source_version ?? undefined,
    provenance: row.provenance,
    reviewStatus: row.review_status,
    observedAt: row.observed_at ?? undefined,
    declaredSignal: row.declared_signal ?? undefined,
    narrative: row.narrative ?? undefined,
    revoked: row.revoked ?? false,
    conflictsWith: row.conflicts_with ?? [],
    contributorKey: row.contributor_key ?? undefined,
    tenantId: row.tenant_id,
    workspaceId: row.workspace_id,
    projectId: row.project_id,
    assuranceStateId: row.assurance_state_id,
    recordedAt: row.recorded_at,
    createdBy: row.created_by ?? undefined,
    autoExecutionClaimed: false,
    scheduleExecutionClaimed: false,
    costExecutionClaimed: false,
    contractInstructionClaimed: false,
    approvalAuthorityClaimed: false,
    certificationClaimed: false,
    verificationClaimed: false,
    evidenceApprovalClaimed: false,
    earnedValueDerived: false,
    cpmDerived: false,
    financialPostingClaimed: false,
    numericalPrecisionClaimed: false,
    registerMutationClaimed: false,
    mutatesCoreRisk: false,
    mutatesUpstreamContributors: false,
  };
}

function mapAssuranceReviewRow(row: any): PersistedAssuranceReview {
  return {
    reviewId: row.id,
    tenantId: row.tenant_id,
    workspaceId: row.workspace_id,
    projectId: row.project_id,
    assuranceStateId: row.assurance_state_id,
    workflowInstanceId: row.workflow_instance_id,
    workflowState: row.workflow_state,
    outcome: row.outcome ?? undefined,
    reviewerId: row.reviewer_id ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    completedAt: row.completed_at ?? undefined,
    selfApproved: false,
    approvalAuthorityClaimed: false,
    certificationClaimed: false,
    verificationClaimed: false,
  };
}

function mapRiskOpportunityEvidenceRow(row: any): PersistedRiskOpportunityEvidence {
  return {
    evidenceId: row.id,
    kind: row.evidence_kind,
    sourceType: row.source_type,
    sourceRef: row.source_ref,
    sourceKey: row.source_key,
    sourceVersion: row.source_version ?? undefined,
    provenance: row.provenance,
    reviewStatus: row.review_status,
    observedAt: row.observed_at ?? undefined,
    declaredSignal: row.declared_signal ?? undefined,
    narrative: row.narrative ?? undefined,
    revoked: row.revoked ?? false,
    conflictsWith: row.conflicts_with ?? [],
    contributorKey: row.contributor_key ?? undefined,
    tenantId: row.tenant_id,
    workspaceId: row.workspace_id,
    projectId: row.project_id,
    riskOpportunityStateId: row.risk_opportunity_state_id,
    recordedAt: row.recorded_at,
    createdBy: row.created_by ?? undefined,
    autoExecutionClaimed: false,
    scheduleExecutionClaimed: false,
    costExecutionClaimed: false,
    contractInstructionClaimed: false,
    approvalAuthorityClaimed: false,
    earnedValueDerived: false,
    cpmDerived: false,
    financialPostingClaimed: false,
    monteCarloClaimed: false,
    numericalPrecisionClaimed: false,
    riskRegisterMutationClaimed: false,
    opportunityRegisterMutationClaimed: false,
    ownerAssignmentClaimed: false,
    treatmentExecutionClaimed: false,
    mutatesCoreRisk: false,
  };
}

function mapRiskOpportunityReviewRow(row: any): PersistedRiskOpportunityReview {
  return {
    reviewId: row.id,
    tenantId: row.tenant_id,
    workspaceId: row.workspace_id,
    projectId: row.project_id,
    riskOpportunityStateId: row.risk_opportunity_state_id,
    workflowInstanceId: row.workflow_instance_id,
    workflowState: row.workflow_state,
    outcome: row.outcome ?? undefined,
    reviewerId: row.reviewer_id ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    completedAt: row.completed_at ?? undefined,
    selfApproved: false,
    approvalAuthorityClaimed: false,
  };
}

function mapExplainabilityStateRow(row: any): PersistedExplainabilityState {
  const ctx = row.control_context;
  return {
    id: row.id,
    stateId: row.id,
    tenantId: row.tenant_id,
    workspaceId: row.workspace_id,
    projectId: row.project_id,
    controlContext: ctx,
    version: row.version,
    status: row.status,
    assessmentClass: row.assessment_class,
    explanationStatus: row.explanation_status ?? "unknown",
    synthesis: row.synthesis ?? emptyExplainabilitySynthesis(row.id),
    contributorExplanations: row.contributor_explanations ?? [],
    snapshot: row.snapshot_payload ?? {
      snapshotId: row.id,
      integratedExplanationStatus: row.explanation_status ?? "unknown",
      integratedReason: "unknown",
      reasonSummary: "Explainability basis unavailable.",
      contributorCount: 0,
      evidenceRefCount: 0,
      traceCount: 0,
      abstained: row.abstained ?? false,
      chainOfThoughtExposed: false,
      hiddenReasoningExposed: false,
    },
    dependencyTraces: row.dependency_traces ?? [],
    provenanceTraces: row.provenance_traces ?? [],
    timelineTraces: row.timeline_traces ?? [],
    assumptionRefs: row.assumption_refs ?? [],
    confidenceSourceRefs: row.confidence_source_refs ?? [],
    governanceRefs: row.governance_refs ?? [],
    contributingContributors: row.contributing_contributors ?? [],
    evidenceRefs: row.evidence_refs ?? [],
    confidence: row.confidence_payload,
    assumptions: row.assumptions ?? [],
    reasons: row.reasons ?? [],
    limitations: row.limitations ?? [],
    abstained: row.abstained,
    abstentionReason: row.abstention_reason ?? undefined,
    narrative: row.narrative ?? undefined,
    composedContextId: row.composed_context_id ?? undefined,
    assuranceContextId: row.assurance_context_id ?? undefined,
    forecastContextId: row.forecast_context_id ?? undefined,
    decisionContextId: row.decision_context_id ?? undefined,
    scenarioContextId: row.scenario_context_id ?? undefined,
    riskOpportunityContextId: row.risk_opportunity_context_id ?? undefined,
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
    floatComputed: false,
    autoExecutionEnabled: false,
    scheduleExecutionPerformed: false,
    costExecutionPerformed: false,
    contractInstructionPerformed: false,
    approvalAuthorityClaimed: false,
    verificationClaimed: false,
    automaticEvidenceCreationClaimed: false,
    automaticExplanationApprovalClaimed: false,
    resourcePlanningPerformed: false,
    budgetLedgerMutated: false,
    financialPostingPerformed: false,
    predictiveSchedulingPerformed: false,
    advisoryOnly: true,
    mutatesProjectIdentity: false,
    mutatesUpstreamContributors: false,
    autonomousPublication: false,
    duplicateExplainabilityOwnershipDetected: false,
    chainOfThoughtExposed: false,
    hiddenReasoningExposed: false,
    fabricatedProvenance: false,
  };
}

function emptyExplainabilitySynthesis(id: string) {
  return {
    synthesisId: id,
    integratedExplanationStatus: "unknown" as const,
    integratedReason: "unknown" as const,
    reasonSummary: "Explainability basis unavailable.",
    contributorExplanations: [],
    crossContributorConflictNotes: [],
    missingEvidenceNotes: [],
    unknownNotes: [],
    dependencyTraces: [],
    provenanceTraces: [],
    timelineTraces: [],
    assumptionRefs: [],
    confidenceSourceRefs: [],
    governanceRefs: [],
    chainOfThoughtExposed: false as const,
    hiddenReasoningExposed: false as const,
    fabricatedProvenance: false as const,
    approvalClaimed: false as const,
    verificationClaimed: false as const,
    mutatesUpstreamContributors: false as const,
  };
}

function mapExplainabilityEvidenceRow(row: any): PersistedExplainabilityEvidence {
  return {
    evidenceId: row.id,
    kind: row.evidence_kind,
    sourceType: row.source_type,
    sourceRef: row.source_ref,
    sourceKey: row.source_key,
    sourceVersion: row.source_version ?? undefined,
    provenance: row.provenance,
    reviewStatus: row.review_status,
    observedAt: row.observed_at ?? undefined,
    declaredSignal: row.declared_signal ?? undefined,
    narrative: row.narrative ?? undefined,
    revoked: row.revoked ?? false,
    conflictsWith: row.conflicts_with ?? [],
    contributorKey: row.contributor_key ?? undefined,
    tenantId: row.tenant_id,
    workspaceId: row.workspace_id,
    projectId: row.project_id,
    explainabilityStateId: row.explainability_state_id,
    recordedAt: row.recorded_at,
    createdBy: row.created_by ?? undefined,
    autoExecutionClaimed: false,
    scheduleExecutionClaimed: false,
    costExecutionClaimed: false,
    contractInstructionClaimed: false,
    approvalAuthorityClaimed: false,
    chainOfThoughtExposed: false,
    hiddenReasoningExposed: false,
    automaticEvidenceCreationClaimed: false,
    earnedValueDerived: false,
    cpmDerived: false,
    financialPostingClaimed: false,
    numericalPrecisionClaimed: false,
    registerMutationClaimed: false,
    mutatesCoreRisk: false,
    mutatesUpstreamContributors: false,
  };
}

function mapExplainabilityReviewRow(row: any): PersistedExplainabilityReview {
  return {
    reviewId: row.id,
    tenantId: row.tenant_id,
    workspaceId: row.workspace_id,
    projectId: row.project_id,
    explainabilityStateId: row.explainability_state_id,
    workflowInstanceId: row.workflow_instance_id,
    workflowState: row.workflow_state,
    outcome: row.outcome ?? undefined,
    reviewerId: row.reviewer_id ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    completedAt: row.completed_at ?? undefined,
    selfApproved: false,
    approvalAuthorityClaimed: false,
    chainOfThoughtExposed: false,
    hiddenReasoningExposed: false,
  };
}

function mapOrganizationalLearningStateRow(row: any): PersistedOrganizationalLearningState {
  const ctx = row.control_context;
  return {
    id: row.id,
    stateId: row.id,
    tenantId: row.tenant_id,
    workspaceId: row.workspace_id,
    projectId: row.project_id,
    controlContext: ctx,
    version: row.version,
    status: row.status,
    assessmentClass: row.assessment_class,
    taxonomyClass: row.taxonomy_class,
    synthesis: row.synthesis,
    snapshot: row.synthesis?.snapshot ?? row.snapshot_payload ?? {
      snapshotId: row.id,
      integratedTaxonomyClass: row.taxonomy_class,
      integratedBasisStatus: "unknown",
      reasonSummary: "",
      learningItemCount: 0,
      evidenceRefCount: 0,
      traceCount: 0,
      abstained: row.abstained,
      fabricatedLesson: false,
      unsupportedSimilarityScore: false,
    },
    learningItems: row.learning_items ?? [],
    contributingContributors: row.contributing_contributors ?? [],
    evidenceRefs: row.evidence_refs ?? [],
    historicalSimilarityRefs: row.synthesis?.historicalSimilarityRefs ?? [],
    lessonReferences: row.synthesis?.lessonReferences ?? [],
    patternReferences: row.synthesis?.patternReferences ?? [],
    outcomeReferences: row.synthesis?.outcomeReferences ?? [],
    reusablePracticeReferences: row.synthesis?.reusablePracticeReferences ?? [],
    crossProjectKnowledgeRefs: row.synthesis?.crossProjectKnowledgeRefs ?? [],
    knowledgeProvenanceTraces: row.synthesis?.knowledgeProvenanceTraces ?? [],
    timelineTraces: row.synthesis?.timelineTraces ?? [],
    governanceRefs: row.synthesis?.governanceRefs ?? [],
    confidence: row.confidence_payload,
    assumptions: row.assumptions ?? [],
    limitations: row.limitations ?? [],
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
    composedContextId: row.composed_context_id ?? undefined,
    explainabilityContextId: undefined,
    assuranceContextId: undefined,
    earnedValueComputed: false,
    criticalPathComputed: false,
    floatComputed: false,
    autoExecutionEnabled: false,
    scheduleExecutionPerformed: false,
    costExecutionPerformed: false,
    contractInstructionPerformed: false,
    learningApprovalClaimed: false,
    knowledgeMutationClaimed: false,
    automaticLearningApprovalClaimed: false,
    automaticKnowledgeMutationClaimed: false,
    resourcePlanningPerformed: false,
    budgetLedgerMutated: false,
    financialPostingPerformed: false,
    predictiveSchedulingPerformed: false,
    advisoryOnly: true,
    mutatesProjectIdentity: false,
    mutatesUpstreamContributors: false,
    autonomousPublication: false,
    duplicateKnowledgeOwnershipDetected: false,
    fabricatedLesson: false,
    unsupportedSimilarityScore: false,
    recommendationClaimed: false,
    predictionClaimed: false,
    optimisationClaimed: false,
  };
}

function mapOrganizationalLearningEvidenceRow(row: any): PersistedOrganizationalLearningEvidence {
  return {
    evidenceId: row.id,
    kind: row.evidence_kind,
    sourceType: row.source_type,
    sourceRef: row.source_ref,
    sourceKey: row.source_key,
    provenance: row.provenance,
    reviewStatus: row.review_status,
    observedAt: row.observed_at ?? undefined,
    declaredSignal: row.declared_signal ?? undefined,
    narrative: row.narrative ?? undefined,
    revoked: row.revoked ?? false,
    contributorKey: row.contributor_key ?? undefined,
    tenantId: row.tenant_id,
    workspaceId: row.workspace_id,
    projectId: row.project_id,
    organizationalLearningStateId: row.organizational_learning_state_id,
    recordedAt: row.recorded_at,
    createdBy: row.created_by ?? undefined,
    fabricatedLesson: false,
    unsupportedSimilarityScore: false,
    knowledgeMutationClaimed: false,
    autoExecutionClaimed: false,
    learningApprovalClaimed: false,
    recommendationClaimed: false,
    predictionClaimed: false,
    optimisationClaimed: false,
    earnedValueDerived: false,
    cpmDerived: false,
    financialPostingClaimed: false,
    registerMutationClaimed: false,
    mutatesUpstreamContributors: false,
  };
}

function mapOrganizationalLearningReviewRow(row: any): PersistedOrganizationalLearningReview {
  return {
    reviewId: row.id,
    tenantId: row.tenant_id,
    workspaceId: row.workspace_id,
    projectId: row.project_id,
    organizationalLearningStateId: row.organizational_learning_state_id,
    workflowInstanceId: row.workflow_instance_id,
    workflowState: row.workflow_state,
    outcome: row.outcome ?? undefined,
    reviewerId: row.reviewer_id ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    completedAt: row.completed_at ?? undefined,
    selfApproved: false,
    learningApprovalClaimed: false,
    knowledgeMutationClaimed: false,
  };
}
