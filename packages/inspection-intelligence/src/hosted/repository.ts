/**
 * Hosted Inspection Intelligence repository over existing inspection_* tables.
 * Uses V1 domain factories and state machines. Does not invent CRUD states.
 */
import { createHash, randomUUID } from "node:crypto";
import { assertInspectionTarget, type InspectionTarget } from "../architecture/inspection-target";
import { appendEvidenceVersion, type EvidenceKind } from "../architecture/evidence";
import { createMeasurementEngine, type AcceptanceCriteria } from "../architecture/measurement-engine";
import {
  assertInspectionTransition,
  type InspectionSessionState,
  type TransitionAuth,
} from "../domain/state-machine";
import { createDefect, type DefectTaxonomy, type InspectionDefect } from "../domain/defects";
import {
  createRecommendation,
  issueRecommendation,
  type RecommendationAction,
  type InspectionRecommendation,
} from "../domain/recommendations";
import {
  createCorrectiveAction,
  transitionCorrectiveAction,
  type CorrectiveAction,
  type CorrectiveActionStatus,
} from "../domain/corrective-actions";
import { createHumanAssessment, type EngineeringAssessment } from "../domain/assessments";
import {
  completeVerification,
  requestVerification,
  type InspectionVerification,
  type VerificationKind,
} from "../domain/verification";
import { closeOutInspectionSession, evaluateInspectionCloseOut } from "../domain/close-out";
import {
  createObservedConditionRating,
  type ConditionRatingRecord,
  type ConditionRatingScheme,
} from "../domain/condition-rating";
import { createEngineeringInspectionEvent } from "../domain/engineering-events";
import {
  INSPECTION_HOSTED_TABLE_MAPPING as T,
  notFound,
  rejectCallerTenantOverride,
  type HostedInspectionContext,
  type InspectionAuditPort,
  type InspectionDbClient,
  type InspectionDbRow,
} from "./client";

const measurementEngine = createMeasurementEngine();

const PLAN_UPDATE_STATUSES = new Set(["planned", "scheduled", "assigned", "cancelled"]);

export class HostedInspectionRepository {
  constructor(
    private readonly context: HostedInspectionContext,
    private readonly db: InspectionDbClient,
    private readonly audit?: InspectionAuditPort,
  ) {
    if (!context.tenantId) throw new Error("tenant_required");
    if (!context.workspaceId) throw new Error("workspace_required");
    if (!context.actorUserId) throw new Error("actor_required");
  }

  private auth(action: TransitionAuth["action"] = "inspection.write"): TransitionAuth {
    return { action, actorUserId: this.context.actorUserId };
  }

  private scoped(table: string) {
    return this.db
      .from(table)
      .select("*")
      .eq("tenant_id", this.context.tenantId)
      .eq("workspace_id", this.context.workspaceId);
  }

  private async insert(table: string, row: InspectionDbRow): Promise<InspectionDbRow> {
    const payload = {
      ...row,
      tenant_id: this.context.tenantId,
      workspace_id: this.context.workspaceId,
    };
    const { data, error } = await this.db.from(table).insert(payload).select("*").single();
    if (error || !data) throw new Error(error?.message ?? `${table}_insert_failed`);
    return data;
  }

  private async update(
    table: string,
    id: string,
    patch: InspectionDbRow,
  ): Promise<InspectionDbRow> {
    const { data, error } = await this.db
      .from(table)
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("tenant_id", this.context.tenantId)
      .eq("workspace_id", this.context.workspaceId)
      .select("*")
      .single();
    if (error || !data) notFound(table);
    return data;
  }

  private async requireRow(table: string, id: string): Promise<InspectionDbRow> {
    const { data, error } = await this.scoped(table).eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) notFound(table.replace("inspection_", ""));
    return data;
  }

  private async writeEvent(type: string, entityId: string, payload: Record<string, unknown>): Promise<void> {
    const event = createEngineeringInspectionEvent({
      type: type as never,
      tenantId: this.context.tenantId,
      workspaceId: this.context.workspaceId,
      entityId,
      payload,
    });
    await this.insert(T.events, {
      id: randomUUID(),
      event_type: event.type,
      entity_id: entityId,
      payload,
      pipeline_stage: "platform_event_bus",
      occurred_at: event.occurredAt,
    });
    await this.audit?.log({
      action: `inspection.${type}`,
      resourceType: "inspection",
      resourceId: entityId,
      metadata: {
        actorUserId: this.context.actorUserId,
        tenantId: this.context.tenantId,
        workspaceId: this.context.workspaceId,
        ...payload,
      },
    });
  }

  private async assertTarget(target: InspectionTarget): Promise<void> {
    assertInspectionTarget(target);
    if (!target.canonicalId) return;
    if (target.kind === "project") {
      const { data } = await this.db
        .from("engineering_projects")
        .select("id")
        .eq("id", target.canonicalId)
        .eq("tenant_id", this.context.tenantId)
        .maybeSingle();
      if (!data) notFound("canonical_project");
      if (this.context.projectId && target.canonicalId !== this.context.projectId) {
        notFound("project");
      }
    }
    if (target.kind === "asset") {
      const { data } = await this.db
        .from("engineering_assets")
        .select("id")
        .eq("id", target.canonicalId)
        .eq("tenant_id", this.context.tenantId)
        .maybeSingle();
      if (!data) notFound("canonical_asset");
    }
    if (target.kind === "location") {
      const { data } = await this.db
        .from("engineering_spatial_references")
        .select("id")
        .eq("id", target.canonicalId)
        .eq("tenant_id", this.context.tenantId)
        .maybeSingle();
      if (!data) notFound("canonical_location");
    }
    if (target.kind === "drawing_region" || target.kind === "custom") {
      return;
    }
    if (target.kind === "document" || (target as { kind: string }).kind === "document") {
      const { data } = await this.db
        .from("engineering_documents")
        .select("id")
        .eq("id", target.canonicalId)
        .eq("tenant_id", this.context.tenantId)
        .maybeSingle();
      if (!data) notFound("canonical_document");
    }
  }

  private async assertProjectScope(targets: InspectionTarget[]): Promise<void> {
    if (!this.context.projectId) return;
    const coupled = targets.some(
      (t) => t.kind === "project" && t.canonicalId === this.context.projectId,
    );
    if (!coupled) notFound("project");
  }

  async createPlan(input: {
    tenantId?: string;
    title: string;
    targets: InspectionTarget[];
    checklistItemTypes?: string[];
    templateTitle?: string;
  }) {
    rejectCallerTenantOverride(this.context, input.tenantId);
    for (const target of input.targets) await this.assertTarget(target);
    await this.assertProjectScope(input.targets);

    const template = await this.insert(T.templates, {
      id: randomUUID(),
      pack_id: "generic",
      title: input.templateTitle ?? input.title,
      revision: 1,
      checklist_item_types: input.checklistItemTypes ?? ["pass_fail"],
    });
    const version = await this.insert(T.templateVersions, {
      id: randomUUID(),
      template_id: template.id,
      version: 1,
      checklist_item_types: input.checklistItemTypes ?? ["pass_fail"],
      content: {},
      immutable: true,
    });
    const plan = await this.insert(T.plans, {
      id: randomUUID(),
      template_id: template.id,
      template_version_id: version.id,
      title: input.title,
      status: "planned",
      targets: input.targets,
    });
    for (const target of input.targets) {
      await this.insert(T.targets, {
        id: randomUUID(),
        plan_id: plan.id,
        target,
      });
    }
    await this.writeEvent("InspectionCreated", String(plan.id), { kind: "plan" });
    return { template, version, plan };
  }

  async getPlan(planId: string) {
    return this.requireRow(T.plans, planId);
  }

  async updatePlan(planId: string, patch: { title?: string; status?: string }) {
    const current = await this.requireRow(T.plans, planId);
    if (patch.status && !PLAN_UPDATE_STATUSES.has(patch.status)) {
      throw new Error(`invalid_plan_status:${patch.status}`);
    }
    if (patch.status && !PLAN_UPDATE_STATUSES.has(String(current.status))) {
      throw new Error(`plan_status_not_updatable:${String(current.status)}`);
    }
    return this.update(T.plans, planId, {
      ...(patch.title ? { title: patch.title } : {}),
      ...(patch.status ? { status: patch.status } : {}),
    });
  }

  async startSession(input: { planId: string; tenantId?: string }) {
    rejectCallerTenantOverride(this.context, input.tenantId);
    const plan = await this.requireRow(T.plans, input.planId);
    const targets = (plan.targets as InspectionTarget[]) ?? [];
    await this.assertProjectScope(targets);
    const session = await this.insert(T.sessions, {
      id: randomUUID(),
      plan_id: plan.id,
      status: "assigned",
      targets,
    });
    for (const target of targets) {
      await this.insert(T.targets, {
        id: randomUUID(),
        session_id: session.id,
        target,
      });
    }
    assertInspectionTransition("assigned", "started", this.auth());
    const started = await this.update(T.sessions, String(session.id), {
      status: "started",
      started_at: new Date().toISOString(),
    });
    await this.writeEvent("InspectionStarted", String(started.id), { planId: plan.id });
    return started;
  }

  async getSession(sessionId: string) {
    return this.requireRow(T.sessions, sessionId);
  }

  async transitionSession(sessionId: string, to: InspectionSessionState, auth = this.auth()) {
    const session = await this.requireRow(T.sessions, sessionId);
    assertInspectionTransition(String(session.status) as InspectionSessionState, to, auth);
    const patch: InspectionDbRow = { status: to };
    if (to === "completed") patch.completed_at = new Date().toISOString();
    const updated = await this.update(T.sessions, sessionId, patch);
    if (to === "approved") {
      await this.insert(T.approvals, {
        id: randomUUID(),
        session_id: sessionId,
        status: "approved",
        actor_user_id: auth.actorUserId,
      });
    }
    return updated;
  }

  async recordObservation(input: { sessionId: string; checklistItemType: string; body: string }) {
    await this.requireRow(T.sessions, input.sessionId);
    return this.insert(T.observations, {
      id: randomUUID(),
      session_id: input.sessionId,
      checklist_item_type: input.checklistItemType,
      body: input.body,
      recorded_at: new Date().toISOString(),
    });
  }

  async recordMeasurement(input: {
    sessionId: string;
    observationId?: string;
    measurementType: string;
    observedValue: number | string | boolean;
    expectedValue?: number | string | boolean | null;
    unit?: string;
    criteria?: AcceptanceCriteria;
  }) {
    await this.requireRow(T.sessions, input.sessionId);
    const evaluation = measurementEngine.evaluate(
      {
        measurementType: input.measurementType,
        observedValue: input.observedValue,
        expectedValue: input.expectedValue,
        unit: input.unit,
        source: "human",
        observedAt: new Date().toISOString(),
      },
      input.criteria,
    );
    const row = await this.insert(T.measurements, {
      id: randomUUID(),
      session_id: input.sessionId,
      observation_id: input.observationId ?? null,
      measurement_type: input.measurementType,
      observed_value: input.observedValue,
      expected_value: input.expectedValue ?? null,
      unit: input.unit ?? null,
      evaluation_status: evaluation.status,
      recorded_at: new Date().toISOString(),
    });
    await this.writeEvent("MeasurementRecorded", String(row.id), {
      evaluationStatus: evaluation.status,
    });
    return row;
  }

  async registerEvidence(input: {
    sessionId: string;
    observationId?: string;
    kind: EvidenceKind;
    fileId?: string;
    content?: string;
    contentHash?: string;
  }) {
    await this.requireRow(T.sessions, input.sessionId);
    if (!input.fileId && !input.content && !input.contentHash) {
      throw new Error("evidence_file_or_hash_required");
    }
    const contentHash =
      input.contentHash ??
      createHash("sha256").update(input.content ?? input.fileId ?? "").digest("hex");
    const previous = await this.db
      .from(T.evidence)
      .select("*")
      .eq("tenant_id", this.context.tenantId)
      .eq("workspace_id", this.context.workspaceId)
      .eq("session_id", input.sessionId)
      .maybeSingle();
    const record = appendEvidenceVersion(
      previous.data
        ? {
            id: String(previous.data.id),
            sessionId: input.sessionId,
            kind: input.kind,
            fileId: previous.data.file_id ? String(previous.data.file_id) : undefined,
            contentHash: String(previous.data.content_hash),
            hashAlgorithm: "sha256",
            version: Number(previous.data.version ?? 1),
            provenance: (previous.data.provenance as never) ?? {
              capturedAt: new Date().toISOString(),
              source: "human",
            },
            chainOfCustody: (previous.data.chain_of_custody as never) ?? { custodyEvents: [] },
            immutable: true as const,
          }
        : null,
      {
        id: randomUUID(),
        sessionId: input.sessionId,
        observationId: input.observationId,
        kind: input.kind,
        fileId: input.fileId,
        contentHash,
        hashAlgorithm: "sha256",
        provenance: {
          capturedAt: new Date().toISOString(),
          capturedByPersonId: this.context.actorUserId,
          source: "human",
        },
        chainOfCustody: {
          custodyEvents: [
            {
              at: new Date().toISOString(),
              actorPersonId: this.context.actorUserId,
              action: "created",
            },
          ],
        },
      },
    );
    const row = await this.insert(T.evidence, {
      id: record.id,
      session_id: record.sessionId,
      observation_id: record.observationId ?? null,
      kind: record.kind,
      file_id: record.fileId ?? null,
      content_hash: record.contentHash,
      hash_algorithm: record.hashAlgorithm,
      version: record.version,
      previous_evidence_id: record.previousEvidenceId ?? null,
      provenance: record.provenance,
      chain_of_custody: record.chainOfCustody,
      immutable: true,
    });
    await this.writeEvent("EvidenceUploaded", String(row.id), {
      version: record.version,
      contentHash,
      fileId: record.fileId ?? null,
    });
    return row;
  }

  async createDefect(input: {
    sessionId: string;
    observationId?: string;
    title: string;
    description: string;
    taxonomy: DefectTaxonomy;
  }): Promise<InspectionDefect> {
    await this.requireRow(T.sessions, input.sessionId);
    const defect = createDefect({
      tenantId: this.context.tenantId,
      workspaceId: this.context.workspaceId,
      sessionId: input.sessionId,
      observationId: input.observationId,
      title: input.title,
      description: input.description,
      taxonomy: input.taxonomy,
    });
    await this.insert(T.defects, {
      id: defect.id,
      session_id: defect.sessionId,
      observation_id: defect.observationId ?? null,
      taxonomy: defect.taxonomy,
      status: defect.status,
      title: defect.title,
      description: defect.description,
    });
    await this.writeEvent("FindingCreated", defect.id, { kind: "inspection_defect" });
    return defect;
  }

  async linkRecommendation(input: {
    sessionId: string;
    defectId: string;
    action: RecommendationAction;
    rationale: string;
  }): Promise<InspectionRecommendation> {
    await this.requireRow(T.defects, input.defectId);
    const draft = createRecommendation({
      tenantId: this.context.tenantId,
      workspaceId: this.context.workspaceId,
      sessionId: input.sessionId,
      defectId: input.defectId,
      action: input.action,
      rationale: input.rationale,
    });
    const issued = issueRecommendation(draft);
    await this.insert(T.recommendations, {
      id: issued.id,
      session_id: issued.sessionId,
      defect_id: issued.defectId ?? null,
      action: issued.action,
      rationale: issued.rationale,
      status: issued.status,
    });
    await this.writeEvent("RecommendationIssued", issued.id, { defectId: input.defectId });
    return issued;
  }

  async createCorrectiveAction(input: {
    sessionId: string;
    defectId: string;
    recommendationId?: string;
    ownerPersonId: string;
    dueAt: string;
    description: string;
  }): Promise<CorrectiveAction> {
    await this.requireRow(T.defects, input.defectId);
    const action = createCorrectiveAction({
      tenantId: this.context.tenantId,
      workspaceId: this.context.workspaceId,
      ...input,
    });
    await this.insert(T.correctiveActions, {
      id: action.id,
      session_id: action.sessionId,
      defect_id: action.defectId,
      recommendation_id: action.recommendationId ?? null,
      owner_person_id: action.ownerPersonId,
      due_at: action.dueAt,
      description: action.description,
      status: action.status,
    });
    return action;
  }

  async progressCorrectiveAction(actionId: string, to: CorrectiveActionStatus): Promise<CorrectiveAction> {
    const row = await this.requireRow(T.correctiveActions, actionId);
    const current: CorrectiveAction = {
      id: String(row.id),
      tenantId: this.context.tenantId,
      workspaceId: this.context.workspaceId,
      sessionId: String(row.session_id),
      defectId: String(row.defect_id),
      recommendationId: row.recommendation_id ? String(row.recommendation_id) : undefined,
      ownerPersonId: String(row.owner_person_id),
      dueAt: String(row.due_at),
      description: String(row.description),
      status: row.status as CorrectiveActionStatus,
      createdAt: String(row.created_at),
      updatedAt: String(row.updated_at),
    };
    const next = transitionCorrectiveAction(current, to);
    await this.update(T.correctiveActions, actionId, { status: next.status });
    return next;
  }

  async recordAssessment(input: {
    sessionId: string;
    defectId?: string;
    title: string;
    body: string;
  }): Promise<EngineeringAssessment> {
    await this.requireRow(T.sessions, input.sessionId);
    const assessment = createHumanAssessment({
      tenantId: this.context.tenantId,
      workspaceId: this.context.workspaceId,
      ...input,
    });
    await this.insert(T.assessments, {
      id: assessment.id,
      session_id: assessment.sessionId,
      defect_id: assessment.defectId ?? null,
      title: assessment.title,
      body: assessment.body,
      ai_generated: false,
      status: assessment.status,
    });
    return assessment;
  }

  async persistConditionRating(input: {
    sessionId: string;
    componentScope: string;
    inspectionScope: string;
    observationIds: readonly string[];
    scheme: ConditionRatingScheme;
    ordinalCode?: string;
    numericScore?: number;
    confidence: number;
    uncertainty: number;
    evidenceSufficiency: ConditionRatingRecord["evidenceSufficiency"];
    packId: string;
  }): Promise<ConditionRatingRecord> {
    await this.requireRow(T.sessions, input.sessionId);
    const rating = createObservedConditionRating({
      tenantId: this.context.tenantId,
      workspaceId: this.context.workspaceId,
      sessionId: input.sessionId,
      projectId: this.context.projectId,
      assessorUserId: this.context.actorUserId,
      ...input,
    });
    await this.insert(T.conditionRatings, {
      id: randomUUID(),
      session_id: rating.sessionId,
      rating_id: rating.ratingId,
      pack_id: rating.packId,
      scheme_id: rating.scheme.schemeId,
      scheme_version: rating.scheme.version,
      review_state: rating.reviewState,
      confidence: rating.confidence,
      uncertainty: rating.uncertainty,
      evidence_sufficiency: rating.evidenceSufficiency,
      payload: rating,
    });
    return rating;
  }

  async getConditionRating(ratingId: string): Promise<ConditionRatingRecord | null> {
    const { data, error } = await this.scoped(T.conditionRatings)
      .eq("rating_id", ratingId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    return data.payload as ConditionRatingRecord;
  }

  async requestVerification(input: {
    sessionId: string;
    kind: VerificationKind;
    subjectId: string;
  }): Promise<InspectionVerification> {
    await this.requireRow(T.sessions, input.sessionId);
    const verification = requestVerification({
      tenantId: this.context.tenantId,
      workspaceId: this.context.workspaceId,
      ...input,
    });
    await this.insert(T.verifications, {
      id: verification.id,
      session_id: verification.sessionId,
      kind: verification.kind,
      subject_id: verification.subjectId,
      status: verification.status,
    });
    return verification;
  }

  async completeVerificationRecord(
    verificationId: string,
    input: { status: "passed" | "failed"; notes?: string },
  ): Promise<InspectionVerification> {
    const row = await this.requireRow(T.verifications, verificationId);
    const current: InspectionVerification = {
      id: String(row.id),
      tenantId: this.context.tenantId,
      workspaceId: this.context.workspaceId,
      sessionId: String(row.session_id),
      kind: row.kind as VerificationKind,
      subjectId: String(row.subject_id),
      status: row.status as InspectionVerification["status"],
      verifierPersonId: row.verifier_person_id ? String(row.verifier_person_id) : undefined,
      notes: row.notes ? String(row.notes) : undefined,
      createdAt: String(row.created_at),
      updatedAt: String(row.updated_at),
    };
    const completed = completeVerification(current, {
      status: input.status,
      verifierPersonId: this.context.actorUserId,
      notes: input.notes,
    });
    await this.update(T.verifications, verificationId, {
      status: completed.status,
      verifier_person_id: completed.verifierPersonId,
      notes: completed.notes ?? null,
    });
    await this.writeEvent("VerificationCompleted", verificationId, { status: completed.status });
    return completed;
  }

  async closeOut(sessionId: string) {
    const session = await this.requireRow(T.sessions, sessionId);
    const cas = await this.listBySession(T.correctiveActions, sessionId);
    const vers = await this.listBySession(T.verifications, sessionId);
    const correctiveActions: CorrectiveAction[] = cas.map((row) => ({
      id: String(row.id),
      tenantId: this.context.tenantId,
      workspaceId: this.context.workspaceId,
      sessionId,
      defectId: String(row.defect_id),
      ownerPersonId: String(row.owner_person_id),
      dueAt: String(row.due_at),
      description: String(row.description),
      status: row.status as CorrectiveActionStatus,
      createdAt: String(row.created_at),
      updatedAt: String(row.updated_at),
    }));
    const verifications: InspectionVerification[] = vers.map((row) => ({
      id: String(row.id),
      tenantId: this.context.tenantId,
      workspaceId: this.context.workspaceId,
      sessionId,
      kind: row.kind as VerificationKind,
      subjectId: String(row.subject_id),
      status: row.status as InspectionVerification["status"],
      verifierPersonId: row.verifier_person_id ? String(row.verifier_person_id) : undefined,
      createdAt: String(row.created_at),
      updatedAt: String(row.updated_at),
    }));
    const evaluation = evaluateInspectionCloseOut({
      sessionStatus: String(session.status) as InspectionSessionState,
      correctiveActions,
      verifications,
    });
    const closed = closeOutInspectionSession({
      sessionStatus: String(session.status) as InspectionSessionState,
      correctiveActions,
      verifications,
      auth: this.auth("inspection.approve"),
    });
    if (String(session.status) === "approved") {
      await this.update(T.sessions, sessionId, { status: "verified" });
    }
    const updated = await this.update(T.sessions, sessionId, { status: closed });
    await this.insert(T.reportingOutputs, {
      id: `closeout_${sessionId}`,
      report_key: "inspection_closeout",
      kind: "snapshot",
      entity_type: "inspection_session",
      entity_id: sessionId,
      payload: { evaluation, status: closed },
      mobile_ready: false,
      generated_at: new Date().toISOString(),
    });
    return updated;
  }

  private async listBySession(table: string, sessionId: string): Promise<InspectionDbRow[]> {
    const result = await this.scoped(table).eq("session_id", sessionId);
    if (result.error) throw new Error(result.error.message);
    return result.data ?? [];
  }
}

export function createHostedInspectionRepository(
  context: HostedInspectionContext,
  db: InspectionDbClient,
  audit?: InspectionAuditPort,
): HostedInspectionRepository {
  return new HostedInspectionRepository(context, db, audit);
}
