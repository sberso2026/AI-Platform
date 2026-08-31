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
import { createDefect, transitionDefect, type DefectLifecycleState, type DefectTaxonomy, type InspectionDefect } from "../domain/defects";
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
import { PLAN_UPDATE_STATUSES } from "../domain/plan-statuses";
import { computeDeterministicIntelligence } from "../domain/deterministic-intelligence";
import { composeInspectionCommandCentre } from "../command-centre/compose";
import {
  buildTargetTimeline,
  computeChangeOverTime,
  computeHistoryIntelligence,
  projectInspectionHistory,
  type HistoryFilter,
} from "../domain/inspection-history";
import {
  assertReportAuthorityTransition,
  composeGovernedReport,
  II_GOVERNED_REPORT_TYPES,
  II_PDF_EXPORT_AVAILABLE,
  renderReportMarkdown,
  type ReportAuthorityState,
} from "../domain/governed-reporting";
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

export { PLAN_UPDATE_STATUSES };

const PLAN_ACTIVE_STATUSES = new Set(["planned", "scheduled", "assigned"]);
const SESSION_IN_PROGRESS_STATUSES = new Set(["assigned", "started", "paused"]);
const SESSION_RECENT_STATUSES = new Set([
  "completed",
  "submitted",
  "reviewed",
  "approved",
  "verified",
  "closed",
]);

function asTargets(value: unknown): InspectionTarget[] {
  return Array.isArray(value) ? (value as InspectionTarget[]) : [];
}

function coupledToProject(targets: InspectionTarget[], projectId?: string): boolean {
  if (!projectId) return true;
  return targets.some((target) => target.kind === "project" && target.canonicalId === projectId);
}

function payloadStats(rows: InspectionDbRow[] | InspectionDbRow | null | undefined) {
  const list = !rows ? [] : Array.isArray(rows) ? rows : [rows];
  return { rows: list.length, bytes: Buffer.byteLength(JSON.stringify(list)) };
}

export class HostedInspectionRepository {
  private sessionsPromise?: Promise<InspectionDbRow[]>;
  private sessionIdsPromise?: Promise<Set<string> | null>;

  constructor(
    private readonly context: HostedInspectionContext,
    private readonly db: InspectionDbClient,
    private readonly audit?: InspectionAuditPort,
  ) {
    if (!context.tenantId) throw new Error("tenant_required");
    if (!context.workspaceId) throw new Error("workspace_required");
    if (!context.actorUserId) throw new Error("actor_required");
  }

  private invalidateSessionCache(): void {
    this.sessionsPromise = undefined;
    this.sessionIdsPromise = undefined;
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
    if (table === T.sessions || table === T.plans) this.invalidateSessionCache();
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
    if (table === T.sessions || table === T.plans) this.invalidateSessionCache();
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
    await Promise.all([
      this.insert(T.events, {
        id: randomUUID(),
        event_type: event.type,
        entity_id: entityId,
        payload,
        pipeline_stage: "platform_event_bus",
        occurred_at: event.occurredAt,
      }),
      this.audit?.log({
        action: `inspection.${type}`,
        resourceType: "inspection",
        resourceId: entityId,
        metadata: {
          actorUserId: this.context.actorUserId,
          tenantId: this.context.tenantId,
          workspaceId: this.context.workspaceId,
          ...payload,
        },
      }) ?? Promise.resolve(),
    ]);
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
        .select("spatial_reference_id")
        .eq("spatial_reference_id", target.canonicalId)
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
    templateId?: string;
    templateVersionId?: string;
    nextDueAt?: string;
    frequency?: string;
  }) {
    rejectCallerTenantOverride(this.context, input.tenantId);
    for (const target of input.targets) await this.assertTarget(target);
    await this.assertProjectScope(input.targets);

    let template: InspectionDbRow;
    let version: InspectionDbRow;
    if (input.templateId) {
      template = await this.requireRow(T.templates, input.templateId);
      if (input.templateVersionId) {
        version = await this.requireRow(T.templateVersions, input.templateVersionId);
        if (String(version.template_id) !== String(template.id)) notFound("template_version");
      } else {
        const versions = await this.listEq(T.templateVersions, "template_id", String(template.id));
        version = [...versions].sort((a, b) => Number(b.version) - Number(a.version))[0];
        if (!version) notFound("template_version");
      }
    } else {
      template = await this.insert(T.templates, {
        id: randomUUID(),
        pack_id: "generic",
        title: input.templateTitle ?? input.title,
        revision: 1,
        checklist_item_types: input.checklistItemTypes ?? ["pass_fail"],
      });
      version = await this.insert(T.templateVersions, {
        id: randomUUID(),
        template_id: template.id,
        version: 1,
        checklist_item_types: input.checklistItemTypes ?? ["pass_fail"],
        content: {},
        immutable: true,
      });
    }
    const plan = await this.insert(T.plans, {
      id: randomUUID(),
      template_id: template.id,
      template_version_id: version.id,
      title: input.title,
      status: "planned",
      targets: input.targets,
      next_due_at: input.nextDueAt ?? null,
      frequency: input.frequency ?? null,
    });
    await Promise.all(
      input.targets.map((target) =>
        this.insert(T.targets, {
          id: randomUUID(),
          plan_id: plan.id,
          target,
        }),
      ),
    );
    await this.writeEvent("InspectionCreated", String(plan.id), { kind: "plan" });
    return { template, version, plan };
  }

  async getPlan(planId: string) {
    return this.requireRow(T.plans, planId);
  }

  async listPlans() {
    const rows = (await this.listScoped(T.plans)).filter((row) =>
      coupledToProject(asTargets(row.targets), this.context.projectId),
    );
    return rows.sort((a, b) => String(b.updated_at ?? "").localeCompare(String(a.updated_at ?? "")));
  }

  async listTemplates() {
    return (await this.listScoped(T.templates)).sort((a, b) =>
      String(b.updated_at ?? "").localeCompare(String(a.updated_at ?? "")),
    );
  }

  async listSessions() {
    this.sessionsPromise ??= this.listScoped(T.sessions).then((rows) =>
      rows
        .filter((row) => coupledToProject(asTargets(row.targets), this.context.projectId))
        .sort((a, b) => String(b.updated_at ?? "").localeCompare(String(a.updated_at ?? ""))),
    );
    return this.sessionsPromise;
  }

  async getOverview() {
    const [plans, sessions, evidence] = await Promise.all([
      this.listPlans(),
      this.listSessions(),
      this.listScoped(T.evidence),
    ]);
    const evidenceBySession = new Map<string, number>();
    for (const row of evidence) {
      const sessionId = String(row.session_id ?? "");
      evidenceBySession.set(sessionId, (evidenceBySession.get(sessionId) ?? 0) + 1);
    }
    const inProgress = sessions.filter((row) => SESSION_IN_PROGRESS_STATUSES.has(String(row.status)));
    return {
      planned: plans.filter((row) => PLAN_ACTIVE_STATUSES.has(String(row.status))),
      inProgress,
      recentlyCompleted: sessions
        .filter((row) => SESSION_RECENT_STATUSES.has(String(row.status)))
        .slice(0, 20),
      sessionsWithoutRegisteredEvidence: inProgress
        .filter((row) => (evidenceBySession.get(String(row.id)) ?? 0) === 0)
        .map((row) => String(row.id)),
    };
  }

  async getSessionWorkspace(sessionId: string, options?: { profile?: boolean }) {
    const started = Date.now();
    const session = await this.requireRow(T.sessions, sessionId);
    const afterSession = Date.now();
    if (!coupledToProject(asTargets(session.targets), this.context.projectId)) notFound("session");
    const [
      observations,
      measurements,
      evidence,
      defects,
      recommendations,
      correctiveActions,
      assessments,
      conditionRatings,
      verifications,
      plan,
    ] = await Promise.all([
      this.listBySession(T.observations, sessionId),
      this.listBySession(T.measurements, sessionId),
      this.listBySession(T.evidence, sessionId),
      this.listBySession(T.defects, sessionId),
      this.listBySession(T.recommendations, sessionId),
      this.listBySession(T.correctiveActions, sessionId),
      this.listBySession(T.assessments, sessionId),
      this.listBySession(T.conditionRatings, sessionId),
      this.listBySession(T.verifications, sessionId),
      session.plan_id
        ? this.requireRow(T.plans, String(session.plan_id)).catch(() => null)
        : Promise.resolve(null),
    ]);
    const afterReads = Date.now();
    const data = {
      session,
      plan,
      observations,
      measurements,
      evidence,
      defects,
      recommendations,
      correctiveActions,
      assessments,
      conditionRatings,
      verifications,
    };
    if (!options?.profile) return data;
    return {
      ...data,
      profile: {
        requireSessionMs: afterSession - started,
        parallelReadsMs: afterReads - afterSession,
        totalMs: afterReads - started,
        readCount: 10,
      },
    };
  }

  async listDefects(sessionId?: string) {
    const sessionIds = await this.sessionIdsInScope();
    const rows = sessionId ? await this.listBySession(T.defects, sessionId) : await this.listScoped(T.defects);
    return rows
      .filter((row) => !sessionIds || sessionIds.has(String(row.session_id)))
      .sort((a, b) => String(b.updated_at ?? "").localeCompare(String(a.updated_at ?? "")));
  }

  async getDefectWorkspace(defectId: string) {
    const defect = await this.requireRow(T.defects, defectId);
    const session = await this.requireRow(T.sessions, String(defect.session_id));
    if (!coupledToProject(asTargets(session.targets), this.context.projectId)) notFound("defect");
    const [recommendations, correctiveActions, assessments, verifications, evidence, observation] = await Promise.all([
      this.listEq(T.recommendations, "defect_id", defectId),
      this.listEq(T.correctiveActions, "defect_id", defectId),
      this.listEq(T.assessments, "defect_id", defectId),
      this.listEq(T.verifications, "subject_id", defectId),
      defect.observation_id
        ? this.listEq(T.evidence, "observation_id", String(defect.observation_id))
        : this.listBySession(T.evidence, String(defect.session_id)),
      defect.observation_id ? this.requireRow(T.observations, String(defect.observation_id)).catch(() => null) : Promise.resolve(null),
    ]);
    return {
      defect,
      session,
      observation,
      recommendations,
      correctiveActions,
      assessments,
      verifications,
      evidence,
      ownership: {
        inspectionDefect: true,
        projectIntelligenceFinding: false,
        engineeringCoreAction: false,
        assetDefect: false,
      },
    };
  }

  async listRecommendations(sessionId?: string) {
    return this.listScopedBySession(T.recommendations, sessionId);
  }

  async listCorrectiveActions(sessionId?: string) {
    return this.listScopedBySession(T.correctiveActions, sessionId);
  }

  async listAssessments(sessionId?: string) {
    return this.listScopedBySession(T.assessments, sessionId);
  }

  async listConditionRatings(sessionId?: string) {
    return this.listScopedBySession(T.conditionRatings, sessionId);
  }

  async listVerifications(sessionId?: string) {
    return this.listScopedBySession(T.verifications, sessionId);
  }

  async listEvidence(sessionId?: string) {
    return this.listScopedBySession(T.evidence, sessionId);
  }

  async getIntelligence() {
    const [defects, correctiveActions, verifications, sessions, evidence, conditionRatings] = await Promise.all([
      this.listDefects(),
      this.listCorrectiveActions(),
      this.listVerifications(),
      this.listSessions(),
      this.listEvidence(),
      this.listConditionRatings(),
    ]);
    return computeDeterministicIntelligence({
      defects,
      correctiveActions,
      verifications,
      sessions,
      evidence,
      conditionRatings,
    });
  }

  async getCommandCentre(options?: { canWrite?: boolean }) {
    const started = Date.now();
    const stages: Record<string, number> = {};
    const timed = async <T>(name: string, work: Promise<T>): Promise<T> => {
      const began = Date.now();
      try {
        return await work;
      } finally {
        stages[name] = Date.now() - began;
      }
    };
    const [plans, sessions, evidence, defects, correctiveActions, verifications, conditionRatings, reports] =
      await Promise.all([
        timed("plans", this.listPlans()),
        timed("sessions", this.listSessions()),
        timed("evidence", this.listScoped(T.evidence)),
        timed("defects", this.listScoped(T.defects)),
        timed("correctiveActions", this.listScoped(T.correctiveActions)),
        timed("verifications", this.listScoped(T.verifications)),
        timed("conditionRatings", this.listScoped(T.conditionRatings)),
        timed("reports", this.listScoped(T.reportingOutputs)),
      ]);
    const afterReads = Date.now();
    const sessionIds = this.context.projectId ? new Set(sessions.map((row) => String(row.id))) : null;
    const inSessionScope = (rows: InspectionDbRow[]) =>
      sessionIds ? rows.filter((row) => sessionIds.has(String(row.session_id))) : rows;
    const composeStarted = Date.now();
    const view = composeInspectionCommandCentre({
      plans,
      sessions,
      evidence: inSessionScope(evidence),
      defects: inSessionScope(defects),
      correctiveActions: inSessionScope(correctiveActions),
      verifications: inSessionScope(verifications),
      conditionRatings: inSessionScope(conditionRatings),
      reports: sessionIds
        ? reports.filter((row) => sessionIds.has(String(row.entity_id)))
        : reports,
      canWrite: options?.canWrite,
    });
    return {
      ...view,
      profile: {
        totalMs: Date.now() - started,
        parallelReadsMs: afterReads - started,
        compositionMs: Date.now() - composeStarted,
        readCount: 8,
        stages,
        payload: {
          plans: payloadStats(plans),
          sessions: payloadStats(sessions),
          evidence: payloadStats(evidence),
          defects: payloadStats(defects),
          correctiveActions: payloadStats(correctiveActions),
          verifications: payloadStats(verifications),
          conditionRatings: payloadStats(conditionRatings),
          reports: payloadStats(reports),
        },
      },
    };
  }

  async listHistory(filter: HistoryFilter = {}) {
    const started = Date.now();
    const [sessions, plans, templates] = await Promise.all([
      this.listSessions(),
      this.listPlans(),
      this.listTemplates(),
    ]);
    const data = projectInspectionHistory({ sessions, plans, templates, filter });
    return { ...data, profile: { totalMs: Date.now() - started, sessionCount: data.rows.length } };
  }

  async getTargetHistory(input: { kind: string; canonicalId: string }) {
    const started = Date.now();
    if (!input.kind || !input.canonicalId) notFound("target");
    const stages: Record<string, number> = {};
    const timed = async <T>(name: string, work: Promise<T>): Promise<T> => {
      const began = Date.now();
      try {
        return await work;
      } finally {
        stages[name] = Date.now() - began;
      }
    };
    const [
      allSessions,
      observationsAll,
      measurementsAll,
      evidenceAll,
      defectsAll,
      recommendationsAll,
      correctiveActionsAll,
      assessmentsAll,
      conditionRatingsAll,
      verificationsAll,
    ] = await Promise.all([
      timed("sessions", this.listSessions()),
      timed("observations", this.listScoped(T.observations)),
      timed("measurements", this.listScoped(T.measurements)),
      timed("evidence", this.listScoped(T.evidence)),
      timed("defects", this.listScoped(T.defects)),
      timed("recommendations", this.listScoped(T.recommendations)),
      timed("correctiveActions", this.listScoped(T.correctiveActions)),
      timed("assessments", this.listScoped(T.assessments)),
      timed("conditionRatings", this.listScoped(T.conditionRatings)),
      timed("verifications", this.listScoped(T.verifications)),
    ]);
    const sessions = allSessions.filter((row) =>
      asTargets(row.targets).some((target) => target.kind === input.kind && target.canonicalId === input.canonicalId),
    );
    const sessionIdSet = new Set(sessions.map((row) => String(row.id)));
    const inSessionScope = (rows: InspectionDbRow[]) =>
      rows.filter((row) => sessionIdSet.has(String(row.session_id)));
    const observations = inSessionScope(observationsAll);
    const measurements = inSessionScope(measurementsAll);
    const evidence = inSessionScope(evidenceAll);
    const defects = inSessionScope(defectsAll);
    const recommendations = inSessionScope(recommendationsAll);
    const correctiveActions = inSessionScope(correctiveActionsAll);
    const assessments = inSessionScope(assessmentsAll);
    const conditionRatings = inSessionScope(conditionRatingsAll);
    const verifications = inSessionScope(verificationsAll);
    const scoped = {
      sessions,
      observations,
      measurements,
      evidence,
      defects,
      recommendations,
      correctiveActions,
      assessments,
      conditionRatings,
      verifications,
    };
    return {
      target: { kind: input.kind, canonicalId: input.canonicalId },
      sessions,
      timeline: buildTargetTimeline(scoped),
      changeOverTime: computeChangeOverTime(scoped),
      missingContinuity: sessions.length === 0,
      profile: {
        totalMs: Date.now() - started,
        sessionCount: sessions.length,
        parallelAfterSessionScope: true,
        parallelWithSessionScope: true,
        stages,
        payload: {
          sessions: payloadStats(sessions),
          observations: payloadStats(observations),
          measurements: payloadStats(measurements),
          evidence: payloadStats(evidence),
          defects: payloadStats(defects),
          recommendations: payloadStats(recommendations),
          correctiveActions: payloadStats(correctiveActions),
          assessments: payloadStats(assessments),
          conditionRatings: payloadStats(conditionRatings),
          verifications: payloadStats(verifications),
        },
      },
    };
  }

  async getHistoryIntelligence(filter: HistoryFilter = {}) {
    const [sessions, defects, correctiveActions, verifications, evidence, conditionRatings] = await Promise.all([
      this.listSessions(),
      this.listDefects(),
      this.listCorrectiveActions(),
      this.listVerifications(),
      this.listEvidence(),
      this.listConditionRatings(),
    ]);
    const history = projectInspectionHistory({ sessions, filter });
    const sessionIds = new Set(history.rows.map((row) => row.sessionId));
    const inHistory = (rows: InspectionDbRow[]) => rows.filter((row) => sessionIds.has(String(row.session_id ?? row.id)));
    return computeHistoryIntelligence({
      sessions: sessions.filter((row) => sessionIds.has(String(row.id))),
      defects: inHistory(defects),
      correctiveActions: inHistory(correctiveActions),
      verifications: inHistory(verifications),
      evidence: inHistory(evidence),
      conditionRatings: inHistory(conditionRatings),
      from: filter.from,
      to: filter.to,
    });
  }

  async listReports() {
    const rows = await this.listScoped(T.reportingOutputs);
    const sessionIds = await this.sessionIdsInScope();
    return rows
      .filter((row) => !sessionIds || sessionIds.has(String(row.entity_id)))
      .sort((a, b) => String(b.generated_at ?? "").localeCompare(String(a.generated_at ?? "")));
  }

  async getReport(outputId: string) {
    const row = await this.requireRow(T.reportingOutputs, outputId);
    await this.assertReportInScope(row);
    return row;
  }

  async composeReport(input: { sessionId: string; reportKey: string }) {
    const started = Date.now();
    const type = II_GOVERNED_REPORT_TYPES.find((item) => item.reportKey === input.reportKey);
    if (!type) throw new Error(`unsupported_report_key:${input.reportKey}`);
    const workspace = await this.getSessionWorkspace(input.sessionId, { profile: true });
    const afterWorkspace = Date.now();
    const plan = workspace.plan;
    const afterPlan = Date.now();
    const template = plan?.template_id
      ? await this.requireRow(T.templates, String(plan.template_id)).catch(() => null)
      : null;
    const afterTemplate = Date.now();
    const snapshot = composeGovernedReport({
      reportKey: input.reportKey,
      workspace: {
        session: workspace.session,
        plan,
        template,
        observations: workspace.observations,
        measurements: workspace.measurements,
        evidence: workspace.evidence,
        defects: workspace.defects ?? [],
        recommendations: workspace.recommendations ?? [],
        correctiveActions: workspace.correctiveActions ?? [],
        assessments: workspace.assessments ?? [],
        conditionRatings: workspace.conditionRatings ?? [],
        verifications: workspace.verifications ?? [],
      },
      actorUserId: this.context.actorUserId,
    });
    const afterCompose = Date.now();
    const row = await this.insert(T.reportingOutputs, {
      id: `rpt_${type.kind}_${input.sessionId}_${Date.now()}`,
      report_key: snapshot.reportKey,
      kind: snapshot.kind,
      entity_type: snapshot.entityType,
      entity_id: snapshot.entityId,
      payload: snapshot,
      mobile_ready: false,
      generated_at: snapshot.generatedAt,
    });
    const afterInsert = Date.now();
    await this.audit?.log({
      action: "inspection.report.composed",
      resourceType: "inspection",
      resourceId: String(row.id),
      metadata: {
        sessionId: input.sessionId,
        reportKey: snapshot.reportKey,
        actorUserId: this.context.actorUserId,
        authority: snapshot.authority.state,
      },
    });
    return {
      ...row,
      profile: {
        composeMs: Date.now() - started,
        sourceReadsMs: afterWorkspace - started,
        planMs: afterPlan - afterWorkspace,
        templateMs: afterTemplate - afterPlan,
        snapshotMs: afterCompose - afterTemplate,
        insertMs: afterInsert - afterCompose,
        auditMs: Date.now() - afterInsert,
        workspace: (workspace as { profile?: unknown }).profile,
      },
      pdfAvailable: II_PDF_EXPORT_AVAILABLE,
    };
  }

  async transitionReport(outputId: string, to: ReportAuthorityState) {
    const row = await this.requireRow(T.reportingOutputs, outputId);
    await this.assertReportInScope(row);
    const payload = (row.payload && typeof row.payload === "object" ? row.payload : {}) as {
      authority?: { state?: ReportAuthorityState };
    };
    const from = payload.authority?.state ?? "draft";
    assertReportAuthorityTransition(from, to);
    const nextPayload = {
      ...payload,
      authority: { state: to, actorUserId: this.context.actorUserId, at: new Date().toISOString() },
    };
    const { data, error } = await this.db
      .from(T.reportingOutputs)
      .update({ payload: nextPayload })
      .eq("id", outputId)
      .eq("tenant_id", this.context.tenantId)
      .eq("workspace_id", this.context.workspaceId)
      .select("*")
      .single();
    if (error || !data) notFound("report");
    const updated = data;
    await this.audit?.log({
      action: "inspection.report.authority",
      resourceType: "inspection",
      resourceId: outputId,
      metadata: { from, to, actorUserId: this.context.actorUserId },
    });
    return updated;
  }

  exportReportMarkdown(row: InspectionDbRow): { markdown: string; pdfAvailable: false } {
    const payload = row.payload && typeof row.payload === "object" ? row.payload : null;
    if (!payload || typeof (payload as { reportKey?: string }).reportKey !== "string") {
      throw new Error("report_snapshot_missing");
    }
    return {
      markdown: renderReportMarkdown(payload as Parameters<typeof renderReportMarkdown>[0]),
      pdfAvailable: II_PDF_EXPORT_AVAILABLE,
    };
  }

  async listSpatialLocations() {
    const { data, error } = await this.db
      .from("engineering_spatial_references")
      .select("spatial_reference_id, name, code, reference_type")
      .eq("tenant_id", this.context.tenantId)
      .eq("workspace_id", this.context.workspaceId);
    if (error) return [];
    return data ?? [];
  }

  async updatePlan(
    planId: string,
    patch: { title?: string; status?: string; nextDueAt?: string; frequency?: string },
  ) {
    const current = await this.requireRow(T.plans, planId);
    if (patch.status && !PLAN_UPDATE_STATUSES.has(patch.status)) {
      throw new Error(`invalid_plan_status:${patch.status}`);
    }
    if (patch.status && !PLAN_UPDATE_STATUSES.has(String(current.status))) {
      throw new Error(`plan_status_not_updatable:${String(current.status)}`);
    }
    const updated = await this.update(T.plans, planId, {
      ...(patch.title ? { title: patch.title } : {}),
      ...(patch.status ? { status: patch.status } : {}),
      ...(patch.nextDueAt !== undefined ? { next_due_at: patch.nextDueAt || null } : {}),
      ...(patch.frequency !== undefined ? { frequency: patch.frequency || null } : {}),
    });
    await this.audit?.log({
      action: "inspection.plan.updated",
      resourceType: "inspection",
      resourceId: planId,
      metadata: {
        actorUserId: this.context.actorUserId,
        tenantId: this.context.tenantId,
        workspaceId: this.context.workspaceId,
        title: patch.title,
        status: patch.status,
      },
    });
    return updated;
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
    const started = Date.now();
    await this.requireRow(T.sessions, input.sessionId);
    const afterSession = Date.now();
    const row = await this.insert(T.observations, {
      id: randomUUID(),
      session_id: input.sessionId,
      checklist_item_type: input.checklistItemType,
      body: input.body,
      recorded_at: new Date().toISOString(),
    });
    const afterInsert = Date.now();
    await this.writeEvent("ObservationRecorded", String(row.id), {
      sessionId: input.sessionId,
      checklistItemType: input.checklistItemType,
    });
    return {
      ...row,
      profile: {
        sessionLookupMs: afterSession - started,
        insertMs: afterInsert - afterSession,
        eventAuditMs: Date.now() - afterInsert,
        totalMs: Date.now() - started,
      },
    };
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
    const existing = await this.listBySession(T.evidence, input.sessionId);
    const previousRow = [...existing].sort(
      (a, b) => Number(b.version ?? 1) - Number(a.version ?? 1),
    )[0];
    const record = appendEvidenceVersion(
      previousRow
        ? {
            id: String(previousRow.id),
            sessionId: input.sessionId,
            kind: input.kind,
            fileId: previousRow.file_id ? String(previousRow.file_id) : undefined,
            contentHash: String(previousRow.content_hash),
            hashAlgorithm: "sha256",
            version: Number(previousRow.version ?? 1),
            provenance: (previousRow.provenance as never) ?? {
              capturedAt: new Date().toISOString(),
              source: "human",
            },
            chainOfCustody: (previousRow.chain_of_custody as never) ?? { custodyEvents: [] },
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

  async transitionDefectRecord(defectId: string, to: DefectLifecycleState): Promise<InspectionDefect> {
    const row = await this.requireRow(T.defects, defectId);
    const current: InspectionDefect = {
      id: String(row.id),
      tenantId: this.context.tenantId,
      workspaceId: this.context.workspaceId,
      sessionId: String(row.session_id),
      observationId: row.observation_id ? String(row.observation_id) : undefined,
      taxonomy: row.taxonomy as DefectTaxonomy,
      status: row.status as DefectLifecycleState,
      title: String(row.title),
      description: String(row.description),
      createdAt: String(row.created_at),
      updatedAt: String(row.updated_at),
    };
    const next = transitionDefect(current, to);
    await this.update(T.defects, defectId, { status: next.status });
    await this.audit?.log({
      action: "inspection.defect.transitioned",
      resourceType: "inspection",
      resourceId: defectId,
      metadata: { from: current.status, to, actorUserId: this.context.actorUserId },
    });
    return next;
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
    await this.audit?.log({
      action: "inspection.corrective_action.created",
      resourceType: "inspection",
      resourceId: action.id,
      metadata: { sessionId: action.sessionId, defectId: action.defectId, actorUserId: this.context.actorUserId },
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
    await this.audit?.log({
      action: "inspection.corrective_action.progressed",
      resourceType: "inspection",
      resourceId: actionId,
      metadata: { from: current.status, to, actorUserId: this.context.actorUserId },
    });
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
    await this.audit?.log({
      action: "inspection.assessment.recorded",
      resourceType: "inspection",
      resourceId: assessment.id,
      metadata: {
        sessionId: assessment.sessionId,
        defectId: assessment.defectId,
        aiGenerated: false,
        actorUserId: this.context.actorUserId,
      },
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
    await this.audit?.log({
      action: "inspection.condition_rating.persisted",
      resourceType: "inspection",
      resourceId: rating.ratingId,
      metadata: {
        sessionId: rating.sessionId,
        assessorUserId: rating.assessorUserId,
        evidenceSufficiency: rating.evidenceSufficiency,
        reviewState: rating.reviewState,
      },
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
    await this.audit?.log({
      action: "inspection.verification.requested",
      resourceType: "inspection",
      resourceId: verification.id,
      metadata: { sessionId: verification.sessionId, kind: verification.kind, subjectId: verification.subjectId },
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

  private async sessionIdsInScope(): Promise<Set<string> | null> {
    if (!this.context.projectId) return null;
    this.sessionIdsPromise ??= this.listSessions().then(
      (sessions) => new Set(sessions.map((row) => String(row.id))),
    );
    return this.sessionIdsPromise;
  }

  private async assertReportInScope(row: InspectionDbRow): Promise<void> {
    const sessionIds = await this.sessionIdsInScope();
    if (sessionIds && !sessionIds.has(String(row.entity_id))) notFound("report");
  }

  private async listInSessionIds(table: string, sessionIds: string[]): Promise<InspectionDbRow[]> {
    if (sessionIds.length === 0) return [];
    const chunkSize = 80;
    const chunks: string[][] = [];
    for (let index = 0; index < sessionIds.length; index += chunkSize) {
      chunks.push(sessionIds.slice(index, index + chunkSize));
    }
    const parts = await Promise.all(
      chunks.map(async (ids) => {
        const result = await this.scoped(table).in("session_id", ids);
        if (result.error) throw new Error(result.error.message);
        return result.data ?? [];
      }),
    );
    return parts.flat();
  }

  private async listScopedBySession(table: string, sessionId?: string): Promise<InspectionDbRow[]> {
    const sessionIds = await this.sessionIdsInScope();
    const rows = sessionId ? await this.listBySession(table, sessionId) : await this.listScoped(table);
    return rows
      .filter((row) => !sessionIds || sessionIds.has(String(row.session_id)))
      .sort((a, b) => String(b.updated_at ?? b.recorded_at ?? "").localeCompare(String(a.updated_at ?? a.recorded_at ?? "")));
  }

  private async listBySession(table: string, sessionId: string): Promise<InspectionDbRow[]> {
    const result = await this.scoped(table).eq("session_id", sessionId);
    if (result.error) throw new Error(result.error.message);
    return result.data ?? [];
  }

  private async listScoped(table: string): Promise<InspectionDbRow[]> {
    const result = await this.scoped(table);
    if (result.error) throw new Error(result.error.message);
    return result.data ?? [];
  }

  private async listEq(table: string, column: string, value: string): Promise<InspectionDbRow[]> {
    const result = await this.scoped(table).eq(column, value);
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
