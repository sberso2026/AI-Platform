import type { SupabaseClient } from "@rtb/database";
import type { PlatformKernel } from "@rtb/platform-kernel";
import { AuditService } from "@rtb/platform-core";
import type {
  AiDailyBriefNarrative,
  BusinessKpi,
  BusinessKpiCategory,
  BusinessRiskAssessmentInput,
  BusinessRiskControlInput,
  BusinessRiskEvidenceInput,
  BusinessRiskEvidenceFreshness,
  BusinessRiskIncidentInput,
  BusinessRiskInput,
  BusinessRiskKpiKey,
  BusinessRiskObligationInput,
  BusinessRiskSettingsInput,
  BusinessRiskTreatmentInput,
} from "@rtb/types";
import {
  BUSINESS_OS_EVENT_TYPES,
  BUSINESS_RISK_ASSESSMENT_METHOD,
  BUSINESS_RISK_CATEGORIES,
  BUSINESS_RISK_CONTROL_EFFECTIVENESS,
  BUSINESS_RISK_CONTROL_STATUSES,
  BUSINESS_RISK_CONTROL_TYPES,
  BUSINESS_RISK_DISCLAIMER,
  BUSINESS_RISK_EVIDENCE_SOURCE_TYPES,
  BUSINESS_RISK_IMPACTS,
  BUSINESS_RISK_INCIDENT_SEVERITIES,
  BUSINESS_RISK_KPI_KEYS,
  BUSINESS_RISK_LIKELIHOODS,
  BUSINESS_RISK_OBLIGATION_STATUSES,
  BUSINESS_RISK_RESIDUAL_METHOD,
  BUSINESS_RISK_STATUSES,
  BUSINESS_RISK_TREATMENT_STRATEGIES,
} from "@rtb/types";
import type { OwnerCommandService, OwnerCommandScope } from "../owner-command/service";
import { assessInherent } from "./assessment";
import { seedBusinessRiskDemo } from "./demo";
import { financialExposure } from "./exposure";
import {
  BUSINESS_CONTEXT_GRAPH_CONTRACT,
  BUSINESS_RISK_CONTRACT,
  businessContextGraphStatus,
  businessRiskStatus,
} from "./extensions";
import { assertObligationComplianceAllowed, obligationOverdue } from "./obligations";
import { computeRiskPriority } from "./priority";
import { asJson, BusinessRiskRepository } from "./repository";
import { assertControlEffectivenessAllowed, computeResidual, controlReducesResidual } from "./residual";
import { detectRiskSignals } from "./signals";
import { defaultRiskSettings, resolveMaxAcceptableLevel, toleranceStatus } from "./tolerance";

function requireWorkspace(scope: { tenantId: string; workspaceId?: string; userId: string }): OwnerCommandScope {
  if (!scope.workspaceId) throw new Error("workspace_not_assigned");
  return { tenantId: scope.tenantId, workspaceId: scope.workspaceId, userId: scope.userId };
}

function includes<T extends string>(allowed: readonly T[], value: string, code: string): T {
  if ((allowed as readonly string[]).includes(value)) return value as T;
  throw new Error(code);
}

const KPI_META: Record<
  BusinessRiskKpiKey,
  { name: string; category: BusinessKpiCategory; unit: string; direction: BusinessKpi["direction"] }
> = {
  open_high_risks: { name: "Open high risks", category: "risk", unit: "count", direction: "lower_is_better" },
  extreme_residual_risks: { name: "Extreme residual risks", category: "risk", unit: "count", direction: "lower_is_better" },
  overdue_risk_reviews: { name: "Overdue risk reviews", category: "risk", unit: "count", direction: "lower_is_better" },
  risks_without_owner: { name: "Risks without owner", category: "risk", unit: "count", direction: "lower_is_better" },
  ineffective_controls: { name: "Ineffective controls", category: "risk", unit: "count", direction: "lower_is_better" },
  untested_controls: { name: "Untested controls", category: "risk", unit: "count", direction: "lower_is_better" },
  overdue_obligations: { name: "Overdue obligations", category: "risk", unit: "count", direction: "lower_is_better" },
  treatment_actions_overdue: {
    name: "Treatment actions overdue",
    category: "risk",
    unit: "count",
    direction: "lower_is_better",
  },
  risks_outside_tolerance: {
    name: "Risks outside tolerance",
    category: "risk",
    unit: "count",
    direction: "lower_is_better",
  },
  risk_data_coverage: { name: "Risk data coverage", category: "risk", unit: "bps", direction: "higher_is_better" },
};

export class BusinessRiskService {
  readonly repository: BusinessRiskRepository;

  constructor(
    private readonly supabase: SupabaseClient,
    private readonly kernel: PlatformKernel,
    private readonly audit: AuditService,
    private readonly ownerCommand: OwnerCommandService,
  ) {
    this.repository = new BusinessRiskRepository(supabase);
  }

  contract() {
    return BUSINESS_RISK_CONTRACT;
  }

  status() {
    return businessRiskStatus();
  }

  businessContextGraph() {
    return businessContextGraphStatus();
  }

  acceptRiskAutonomously(): never {
    throw new Error("autonomous_risk_acceptance_forbidden");
  }

  declareStatutoryCompliance(): never {
    throw new Error("statutory_compliance_claim_forbidden");
  }

  writeExternalRegulator(): never {
    throw new Error("external_regulator_write_forbidden");
  }

  rewriteHistoricalEvidence(): never {
    throw new Error("historical_evidence_rewrite_forbidden");
  }

  provideLegalAdvice(): never {
    throw new Error("legal_advice_forbidden");
  }

  private async emit(
    scope: OwnerCommandScope,
    eventType: (typeof BUSINESS_OS_EVENT_TYPES)[number],
    payload: Record<string, unknown>,
  ) {
    try {
      await this.kernel.eventBus.publish({
        tenantId: scope.tenantId,
        workspaceId: scope.workspaceId,
        eventType,
        source: "business-os",
        payload,
      });
    } catch {
      // Event persistence must not fail-close the mutation.
    }
  }

  private async auditMutation(
    scope: OwnerCommandScope,
    action: string,
    resourceType: string,
    resourceId: string,
    metadata: Record<string, unknown>,
  ) {
    await this.audit.log({
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
      userId: scope.userId,
      action,
      resourceType,
      resourceId,
      metadata,
    });
  }

  private async nextReference(scope: OwnerCommandScope): Promise<string> {
    const existing = await this.repository.listRisks(scope);
    return `RSK-${String(existing.length + 1).padStart(4, "0")}`;
  }

  async createRisk(raw: { tenantId: string; workspaceId?: string; userId: string }, input: BusinessRiskInput) {
    const scope = requireWorkspace(raw);
    if (!input.title?.trim()) throw new Error("risk_title_required");
    const category = includes(BUSINESS_RISK_CATEGORIES, input.category ?? "other", "invalid_risk_category");
    const status = includes(BUSINESS_RISK_STATUSES, input.status ?? "identified", "invalid_risk_status");
    const sourceRef = input.sourceRef ?? `manual:${crypto.randomUUID()}`;
    const risk = await this.repository.insertRisk({
      tenant_id: scope.tenantId,
      workspace_id: scope.workspaceId,
      reference: await this.nextReference(scope),
      title: input.title.trim(),
      description: input.description ?? null,
      category,
      domain: input.domain ?? null,
      nature: "threat",
      owner_label: input.ownerLabel ?? null,
      status,
      source_type: input.sourceType,
      source_ref: sourceRef,
      identified_at: input.identifiedAt ?? new Date().toISOString(),
      review_at: input.reviewAt ?? null,
      linked_decision_id: input.linkedDecisionId ?? null,
      provenance: asJson(input.provenance ?? {}),
      is_demo: Boolean(input.isDemo),
      created_by: scope.userId,
    });
    await this.emit(scope, "business_os.risk.created", { id: risk.id, reference: risk.reference });
    await this.auditMutation(scope, "create", "business_os_risk", risk.id, { title: risk.title });
    await this.publishToOwnerCommand(scope);
    return risk;
  }

  async updateRisk(
    raw: { tenantId: string; workspaceId?: string; userId: string },
    id: string,
    patch: Partial<BusinessRiskInput> & { status?: string; ownerLabel?: string | null; reviewAt?: string | null },
  ) {
    const scope = requireWorkspace(raw);
    const current = await this.requireRisk(scope, id);
    const next: Record<string, unknown> = {};
    if (patch.title !== undefined) next.title = patch.title;
    if (patch.description !== undefined) next.description = patch.description;
    if (patch.category !== undefined) next.category = includes(BUSINESS_RISK_CATEGORIES, patch.category, "invalid_risk_category");
    if (patch.domain !== undefined) next.domain = patch.domain;
    if (patch.ownerLabel !== undefined) next.owner_label = patch.ownerLabel;
    if (patch.status !== undefined) next.status = includes(BUSINESS_RISK_STATUSES, patch.status, "invalid_risk_status");
    if (patch.reviewAt !== undefined) next.review_at = patch.reviewAt;
    if (patch.linkedDecisionId !== undefined) next.linked_decision_id = patch.linkedDecisionId;
    if (patch.status === "closed" || patch.status === "archived") next.closed_at = new Date().toISOString();
    const updated = await this.repository.updateRisk(scope, current.id, next);
    await this.auditMutation(scope, "update", "business_os_risk", updated.id, next);
    await this.publishToOwnerCommand(scope);
    return updated;
  }

  async list(raw: { tenantId: string; workspaceId?: string; userId: string }) {
    const scope = requireWorkspace(raw);
    return this.buildRegister(scope);
  }

  async summary(raw: { tenantId: string; workspaceId?: string; userId: string }) {
    const scope = requireWorkspace(raw);
    const intel = await this.intelligence(scope);
    return intel.summary;
  }

  async settings(raw: { tenantId: string; workspaceId?: string; userId: string }) {
    const scope = requireWorkspace(raw);
    return (await this.repository.getSettings(scope)) ?? {
      id: "default",
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
      ...defaultRiskSettings(),
      effectiveAt: new Date().toISOString(),
      provenance: { default: true },
      updatedAt: new Date().toISOString(),
    };
  }

  async upsertSettings(raw: { tenantId: string; workspaceId?: string; userId: string }, input: BusinessRiskSettingsInput) {
    const scope = requireWorkspace(raw);
    const current = await this.repository.getSettings(scope);
    const saved = await this.repository.upsertSettings({
      tenant_id: scope.tenantId,
      workspace_id: scope.workspaceId,
      version: input.version ?? (current?.version ?? 0) + 1,
      effective_at: input.effectiveAt ?? new Date().toISOString(),
      default_max_acceptable_level: input.defaultMaxAcceptableLevel ?? current?.defaultMaxAcceptableLevel ?? "high",
      rules: asJson(input.rules ?? current?.rules ?? []),
      provenance: asJson(input.provenance ?? { updatedBy: scope.userId }),
      created_by: scope.userId,
    });
    await this.auditMutation(scope, "update", "business_os_risk_settings", saved.id, {
      version: saved.version,
      defaultMaxAcceptableLevel: saved.defaultMaxAcceptableLevel,
    });
    await this.publishToOwnerCommand(scope);
    return saved;
  }

  async detail(raw: { tenantId: string; workspaceId?: string; userId: string }, id: string) {
    const scope = requireWorkspace(raw);
    const risk = await this.requireRisk(scope, id);
    const [assessments, controls, links, treatments, actionLinks, obligations, incidents, evidence, actions, decisions] =
      await Promise.all([
        this.repository.listAssessments(scope, risk.id),
        this.repository.listControls(scope),
        this.repository.listControlLinks(scope, risk.id),
        this.repository.listTreatments(scope, risk.id),
        this.repository.listActionLinks(scope, risk.id),
        this.repository.listObligations(scope, risk.id),
        this.repository.listIncidents(scope, risk.id),
        this.repository.listEvidence(scope, risk.id),
        this.ownerCommand.repository.listActions(scope),
        this.ownerCommand.repository.listDecisions(scope),
      ]);
    const register = await this.buildRegister(scope);
    const row = register.find((item) => item.risk.id === risk.id);
    const linkedControlIds = new Set(links.map((link) => link.controlId));
    const linkedActionIds = new Set(actionLinks.map((link) => link.actionId));
    const linkedDecisionIds = new Set(
      [risk.linkedDecisionId, ...treatments.map((t) => t.decisionId)].filter((value): value is string => Boolean(value)),
    );
    return {
      risk,
      assessments,
      latestAssessment: assessments[0] ?? null,
      controls: controls.filter((control) => linkedControlIds.has(control.id)),
      controlLinks: links,
      treatments,
      actionLinks,
      actions: actions.filter((action) => linkedActionIds.has(action.id)),
      obligations,
      incidents,
      evidence,
      decisions: decisions.filter((decision) => linkedDecisionIds.has(decision.id)),
      priority: row?.priority ?? computeRiskPriority({ residualLevel: "unknown" }),
      toleranceStatus: row?.toleranceStatus ?? "unknown",
      evidenceFreshness: row?.evidenceFreshness ?? "missing",
      disclaimer: BUSINESS_RISK_DISCLAIMER,
    };
  }

  async assess(raw: { tenantId: string; workspaceId?: string; userId: string }, input: BusinessRiskAssessmentInput) {
    const scope = requireWorkspace(raw);
    const risk = await this.requireRisk(scope, input.riskId);
    const likelihood = includes(BUSINESS_RISK_LIKELIHOODS, input.likelihood, "invalid_likelihood");
    const impact = includes(BUSINESS_RISK_IMPACTS, input.impact, "invalid_impact");
    const inherent = assessInherent(likelihood, impact);
    const residual = await this.residualForRisk(scope, risk.id, inherent.level);
    const previous = await this.repository.listAssessments(scope, risk.id);
    const version = (previous[0]?.version ?? 0) + 1;
    const assessment = await this.repository.insertAssessment({
      tenant_id: scope.tenantId,
      workspace_id: scope.workspaceId,
      risk_id: risk.id,
      version,
      method: BUSINESS_RISK_ASSESSMENT_METHOD,
      likelihood,
      impact,
      inherent_level: inherent.level,
      residual_level: residual.residualLevel,
      inherent_score: inherent.score,
      residual_score: residual.residualScore,
      assessor_label: input.assessorLabel ?? null,
      rationale: input.rationale ?? inherent.note,
      assumptions: asJson(input.assumptions ?? []),
      evidence_refs: asJson(input.evidenceRefs ?? []),
      residual_method: BUSINESS_RISK_RESIDUAL_METHOD,
      residual_rationale: residual.rationale,
      assessed_at: input.assessedAt ?? new Date().toISOString(),
      provenance: asJson(input.provenance ?? { method: inherent.method }),
      is_demo: Boolean(input.isDemo),
      created_by: scope.userId,
    });
    if (risk.status === "identified") {
      await this.repository.updateRisk(scope, risk.id, { status: "assessing" });
    }
    await this.emit(scope, "business_os.risk.assessed", { id: risk.id, assessmentId: assessment.id, version });
    if (previous[0] && previous[0].residualLevel !== residual.residualLevel) {
      await this.emit(scope, "business_os.risk.residual_updated", {
        id: risk.id,
        residualLevel: residual.residualLevel,
      });
    }
    await this.auditMutation(scope, "create", "business_os_risk_assessment", assessment.id, {
      likelihood,
      impact,
      inherentLevel: inherent.level,
      residualLevel: residual.residualLevel,
    });
    await this.publishToOwnerCommand(scope);
    return assessment;
  }

  async createControl(raw: { tenantId: string; workspaceId?: string; userId: string }, input: BusinessRiskControlInput) {
    const scope = requireWorkspace(raw);
    if (!input.name?.trim()) throw new Error("control_name_required");
    const effectiveness = includes(
      BUSINESS_RISK_CONTROL_EFFECTIVENESS,
      input.effectiveness ?? "untested",
      "invalid_control_effectiveness",
    );
    assertControlEffectivenessAllowed(effectiveness, input.evidenceRefs ?? []);
    const control = await this.repository.insertControl({
      tenant_id: scope.tenantId,
      workspace_id: scope.workspaceId,
      name: input.name.trim(),
      description: input.description ?? null,
      control_type: includes(BUSINESS_RISK_CONTROL_TYPES, input.controlType ?? "preventive", "invalid_control_type"),
      owner_label: input.ownerLabel ?? null,
      status: includes(BUSINESS_RISK_CONTROL_STATUSES, input.status ?? "planned", "invalid_control_status"),
      effectiveness,
      frequency: input.frequency ?? null,
      evidence_refs: asJson(input.evidenceRefs ?? []),
      tested_at: input.testedAt ?? null,
      review_at: input.reviewAt ?? null,
      provenance: asJson(input.provenance ?? {}),
      is_demo: Boolean(input.isDemo),
      created_by: scope.userId,
    });
    if (input.riskId) {
      await this.repository.insertControlLink({
        tenant_id: scope.tenantId,
        workspace_id: scope.workspaceId,
        risk_id: input.riskId,
        control_id: control.id,
        applicable: input.applicable ?? true,
      });
      await this.refreshResidual(scope, input.riskId);
    }
    await this.emit(scope, "business_os.risk.control_updated", { id: control.id, effectiveness: control.effectiveness });
    await this.auditMutation(scope, "create", "business_os_risk_control", control.id, { name: control.name });
    await this.publishToOwnerCommand(scope);
    return control;
  }

  async updateControl(
    raw: { tenantId: string; workspaceId?: string; userId: string },
    id: string,
    patch: Partial<BusinessRiskControlInput>,
  ) {
    const scope = requireWorkspace(raw);
    const current = await this.repository.getControl(scope, id);
    if (!current) throw new Error("Control not found");
    const effectiveness = patch.effectiveness
      ? includes(BUSINESS_RISK_CONTROL_EFFECTIVENESS, patch.effectiveness, "invalid_control_effectiveness")
      : current.effectiveness;
    const evidenceRefs = patch.evidenceRefs ?? current.evidenceRefs;
    assertControlEffectivenessAllowed(effectiveness, evidenceRefs);
    const updated = await this.repository.updateControl(scope, id, {
      ...(patch.name !== undefined ? { name: patch.name } : {}),
      ...(patch.description !== undefined ? { description: patch.description } : {}),
      ...(patch.controlType
        ? { control_type: includes(BUSINESS_RISK_CONTROL_TYPES, patch.controlType, "invalid_control_type") }
        : {}),
      ...(patch.ownerLabel !== undefined ? { owner_label: patch.ownerLabel } : {}),
      ...(patch.status
        ? { status: includes(BUSINESS_RISK_CONTROL_STATUSES, patch.status, "invalid_control_status") }
        : {}),
      effectiveness,
      ...(patch.frequency !== undefined ? { frequency: patch.frequency } : {}),
      evidence_refs: asJson(evidenceRefs),
      ...(patch.testedAt !== undefined ? { tested_at: patch.testedAt } : {}),
      ...(patch.reviewAt !== undefined ? { review_at: patch.reviewAt } : {}),
    });
    const links = await this.repository.listControlLinks(scope);
    for (const link of links.filter((item) => item.controlId === id)) {
      await this.refreshResidual(scope, link.riskId);
    }
    await this.emit(scope, "business_os.risk.control_updated", { id: updated.id, effectiveness: updated.effectiveness });
    await this.auditMutation(scope, "update", "business_os_risk_control", updated.id, {
      effectiveness: updated.effectiveness,
      status: updated.status,
    });
    await this.publishToOwnerCommand(scope);
    return updated;
  }

  async createTreatment(raw: { tenantId: string; workspaceId?: string; userId: string }, input: BusinessRiskTreatmentInput) {
    const scope = requireWorkspace(raw);
    const risk = await this.requireRisk(scope, input.riskId);
    const strategy = includes(BUSINESS_RISK_TREATMENT_STRATEGIES, input.strategy, "invalid_treatment_strategy");
    const treatment = await this.repository.insertTreatment({
      tenant_id: scope.tenantId,
      workspace_id: scope.workspaceId,
      risk_id: risk.id,
      strategy,
      decision_id: input.decisionId ?? null,
      expected_residual_level: input.expectedResidualLevel ?? null,
      notes: input.notes ?? null,
      provenance: asJson(input.provenance ?? {}),
      is_demo: Boolean(input.isDemo),
      created_by: scope.userId,
    });
    if (input.actionId) {
      await this.repository.insertActionLink({
        tenant_id: scope.tenantId,
        workspace_id: scope.workspaceId,
        risk_id: risk.id,
        treatment_id: treatment.id,
        action_id: input.actionId,
      });
    }
    if (risk.status === "open" || risk.status === "assessing" || risk.status === "identified") {
      await this.repository.updateRisk(scope, risk.id, { status: "treating" });
    }
    await this.emit(scope, "business_os.risk.treatment_updated", { id: treatment.id, strategy });
    await this.auditMutation(scope, "create", "business_os_risk_treatment", treatment.id, { strategy });
    await this.publishToOwnerCommand(scope);
    return treatment;
  }

  async acceptRisk(
    raw: { tenantId: string; workspaceId?: string; userId: string },
    id: string,
    input: { rationale?: string } = {},
  ) {
    const scope = requireWorkspace(raw);
    const risk = await this.requireRisk(scope, id);
    const accepted = await this.repository.updateRisk(scope, risk.id, {
      status: "accepted",
      accepted_at: new Date().toISOString(),
      accepted_by: scope.userId,
    });
    const treatments = await this.repository.listTreatments(scope, risk.id);
    const acceptTreatment = treatments.find((row) => row.strategy === "accept");
    if (acceptTreatment) {
      await this.repository.updateTreatment(scope, acceptTreatment.id, {
        accepted_at: accepted.acceptedAt,
        accepted_by: scope.userId,
        notes: input.rationale ?? acceptTreatment.notes,
      });
    }
    await this.auditMutation(scope, "update", "business_os_risk_acceptance", accepted.id, {
      acceptedBy: scope.userId,
      rationale: input.rationale ?? null,
      humanOnly: true,
    });
    await this.publishToOwnerCommand(scope);
    return accepted;
  }

  async recordToleranceException(
    raw: { tenantId: string; workspaceId?: string; userId: string },
    id: string,
    rationale: string,
  ) {
    const scope = requireWorkspace(raw);
    const risk = await this.requireRisk(scope, id);
    const updated = await this.repository.updateRisk(scope, risk.id, {
      tolerance_exception_at: new Date().toISOString(),
      tolerance_exception_by: scope.userId,
      tolerance_exception_rationale: rationale,
    });
    await this.auditMutation(scope, "update", "business_os_risk_tolerance_exception", updated.id, {
      rationale,
      humanOnly: true,
    });
    await this.publishToOwnerCommand(scope);
    return updated;
  }

  async createObligation(
    raw: { tenantId: string; workspaceId?: string; userId: string },
    input: BusinessRiskObligationInput,
  ) {
    const scope = requireWorkspace(raw);
    if (!input.title?.trim()) throw new Error("obligation_title_required");
    const status = includes(BUSINESS_RISK_OBLIGATION_STATUSES, input.status ?? "identified", "invalid_obligation_status");
    assertObligationComplianceAllowed(status, input.evidenceRefs ?? [], Boolean(input.authorizedConfirmation));
    const obligation = await this.repository.insertObligation({
      tenant_id: scope.tenantId,
      workspace_id: scope.workspaceId,
      risk_id: input.riskId ?? null,
      control_id: input.controlId ?? null,
      action_id: input.actionId ?? null,
      title: input.title.trim(),
      source_ref: input.sourceRef ?? null,
      jurisdiction: input.jurisdiction ?? null,
      owner_label: input.ownerLabel ?? null,
      due_at: input.dueAt ?? null,
      review_at: input.reviewAt ?? null,
      status,
      evidence_refs: asJson(input.evidenceRefs ?? []),
      authorized_confirmation: Boolean(input.authorizedConfirmation),
      confirmation_by: input.authorizedConfirmation ? input.confirmationBy ?? scope.userId : null,
      confirmation_at: input.authorizedConfirmation ? new Date().toISOString() : null,
      provenance: asJson(input.provenance ?? { notLegalAdvice: true }),
      is_demo: Boolean(input.isDemo),
      created_by: scope.userId,
    });
    await this.auditMutation(scope, "create", "business_os_risk_obligation", obligation.id, { status });
    await this.publishToOwnerCommand(scope);
    return obligation;
  }

  async updateObligation(
    raw: { tenantId: string; workspaceId?: string; userId: string },
    id: string,
    patch: Partial<BusinessRiskObligationInput>,
  ) {
    const scope = requireWorkspace(raw);
    const current = (await this.repository.listObligations(scope)).find((row) => row.id === id);
    if (!current) throw new Error("Obligation not found");
    const status = patch.status
      ? includes(BUSINESS_RISK_OBLIGATION_STATUSES, patch.status, "invalid_obligation_status")
      : current.status;
    const evidenceRefs = patch.evidenceRefs ?? current.evidenceRefs;
    const authorized = patch.authorizedConfirmation ?? current.authorizedConfirmation;
    assertObligationComplianceAllowed(status, evidenceRefs, Boolean(authorized));
    const updated = await this.repository.updateObligation(scope, id, {
      ...(patch.title !== undefined ? { title: patch.title } : {}),
      status,
      evidence_refs: asJson(evidenceRefs),
      authorized_confirmation: Boolean(authorized),
      confirmation_by: authorized ? patch.confirmationBy ?? scope.userId : current.confirmationBy,
      confirmation_at: authorized ? current.confirmationAt ?? new Date().toISOString() : null,
    });
    await this.auditMutation(scope, "update", "business_os_risk_obligation", updated.id, { status });
    await this.publishToOwnerCommand(scope);
    return updated;
  }

  async createIncident(raw: { tenantId: string; workspaceId?: string; userId: string }, input: BusinessRiskIncidentInput) {
    const scope = requireWorkspace(raw);
    if (!input.title?.trim()) throw new Error("incident_title_required");
    const incident = await this.repository.insertIncident({
      tenant_id: scope.tenantId,
      workspace_id: scope.workspaceId,
      risk_id: input.riskId ?? null,
      action_id: input.actionId ?? null,
      title: input.title.trim(),
      description: input.description ?? null,
      occurred_at: input.occurredAt ?? new Date().toISOString(),
      severity: includes(BUSINESS_RISK_INCIDENT_SEVERITIES, input.severity ?? "unknown", "invalid_incident_severity"),
      source_type: input.sourceType,
      source_ref: input.sourceRef ?? `incident:${crypto.randomUUID()}`,
      impact: input.impact ?? null,
      evidence_refs: asJson(input.evidenceRefs ?? []),
      provenance: asJson(input.provenance ?? {}),
      is_demo: Boolean(input.isDemo),
      created_by: scope.userId,
    });
    await this.auditMutation(scope, "create", "business_os_risk_incident", incident.id, { title: incident.title });
    return incident;
  }

  async linkEvidence(raw: { tenantId: string; workspaceId?: string; userId: string }, input: BusinessRiskEvidenceInput) {
    const scope = requireWorkspace(raw);
    await this.requireRisk(scope, input.riskId);
    const sourceType = includes(
      BUSINESS_RISK_EVIDENCE_SOURCE_TYPES,
      input.sourceType,
      "invalid_risk_evidence_source",
    );
    const evidence = await this.repository.insertEvidence({
      tenant_id: scope.tenantId,
      workspace_id: scope.workspaceId,
      risk_id: input.riskId,
      source_type: sourceType,
      source_ref: input.sourceRef,
      snapshot: asJson(input.snapshot ?? {}),
      captured_at: input.capturedAt ?? new Date().toISOString(),
      provenance: asJson(input.provenance ?? {}),
    });
    await this.auditMutation(scope, "create", "business_os_risk_evidence", evidence.id, {
      sourceType,
      sourceRef: input.sourceRef,
    });
    return evidence;
  }

  async openMaterialRiskDecision(raw: { tenantId: string; workspaceId?: string; userId: string }, id: string) {
    const scope = requireWorkspace(raw);
    const risk = await this.requireRisk(scope, id);
    const register = await this.buildRegister(scope);
    const row = register.find((item) => item.risk.id === risk.id);
    const material =
      row?.residualLevel === "high" ||
      row?.residualLevel === "extreme" ||
      row?.toleranceStatus === "outside";
    if (!material) throw new Error("risk_not_material");
    const decision = await this.ownerCommand.createDecision(scope, {
      statement: `Treat material risk ${risk.reference}: ${risk.title}`,
      context: `BOS-9 material risk. Residual ${row?.residualLevel ?? "unknown"}. Human treatment/acceptance required.`,
      reviewAt: risk.reviewAt ?? undefined,
    });
    const updated = await this.repository.updateRisk(scope, risk.id, { linked_decision_id: decision.id });
    await this.auditMutation(scope, "update", "business_os_risk_decision_link", updated.id, {
      decisionId: decision.id,
    });
    return { risk: updated, decision };
  }

  async customerEvidence(raw: { tenantId: string; workspaceId?: string; userId: string }, customerId: string) {
    const scope = requireWorkspace(raw);
    const register = await this.buildRegister(scope);
    const related = register.filter(
      (row) =>
        row.risk.domain === "customer" ||
        row.risk.category === "customer" ||
        row.risk.sourceRef.includes(customerId),
    );
    return {
      customerId,
      risks: related.map((row) => ({
        id: row.risk.id,
        reference: row.risk.reference,
        title: row.risk.title,
        residualLevel: row.residualLevel,
        status: row.risk.status,
      })),
      note: "Customer Health is not mapped to a risk score. These are explicit customer-related risk records.",
    };
  }

  async intelligence(raw: { tenantId: string; workspaceId?: string; userId: string }) {
    const scope = requireWorkspace(raw);
    const register = await this.buildRegister(scope);
    const asOf = new Date().toISOString();
    const [controls, obligations, actionLinks, actions, signals, recs, kpis] = await Promise.all([
      this.repository.listControls(scope),
      this.repository.listObligations(scope),
      this.repository.listActionLinks(scope),
      this.ownerCommand.repository.listActions(scope),
      this.ownerCommand.repository.listSignals(scope),
      this.ownerCommand.repository.listRecommendations(scope),
      this.ownerCommand.repository.listKpis(scope),
    ]);
    const open = register.filter((row) => row.risk.status !== "closed" && row.risk.status !== "archived");
    const overdueReviews = open.filter((row) => row.risk.reviewAt && new Date(row.risk.reviewAt).getTime() < Date.parse(asOf));
    const treatmentActionIds = new Set(actionLinks.map((link) => link.actionId));
    const treatmentOverdue = actions.filter(
      (action) =>
        treatmentActionIds.has(action.id) &&
        action.status !== "completed" &&
        action.status !== "cancelled" &&
        action.dueDate &&
        new Date(action.dueDate).getTime() < Date.parse(asOf),
    );
    const overdueObligations = obligations.filter((row) => obligationOverdue(row.status, row.dueAt, asOf));
    const assessed = register.filter((row) => row.latestAssessment).length;
    const coverage = register.length ? Math.round((assessed / register.length) * 10000) : null;
    const summary = {
      generatedAt: asOf,
      openHighRisks: open.filter((row) => row.residualLevel === "high" || row.residualLevel === "extreme").length,
      extremeResidualRisks: open.filter((row) => row.residualLevel === "extreme").length,
      outsideTolerance: open.filter((row) => row.toleranceStatus === "outside" && !row.toleranceException).length,
      overdueReviews: overdueReviews.length,
      ineffectiveControls: controls.filter((c) => c.effectiveness === "ineffective" || c.status === "ineffective").length,
      untestedControls: controls.filter((c) => c.effectiveness === "untested").length,
      overdueObligations: overdueObligations.length,
      risksWithoutOwner: open.filter((row) => !row.risk.ownerLabel).length,
      treatmentActionsOverdue: treatmentOverdue.length,
      materialRisksRequiringDecision: open.filter(
        (row) =>
          (row.residualLevel === "high" || row.residualLevel === "extreme" || row.toleranceStatus === "outside") &&
          !row.risk.linkedDecisionId,
      ).length,
      containsDemoData: register.some((row) => row.risk.isDemo),
      disclaimer: BUSINESS_RISK_DISCLAIMER,
    };
    const missingEvidence = [
      ...new Set(register.flatMap((row) => row.priority.missingInputs)),
    ];
    return {
      generatedAt: asOf,
      method: "business_risk.v1" as const,
      summary,
      register,
      signals: signals.filter((s) => s.provenance?.domain === "risk"),
      recommendations: recs.filter((r) => r.generatedBy === "deterministic_rule"),
      kpis: kpis.filter((k) => k.category === "risk"),
      missingEvidence,
      disclaimer: BUSINESS_RISK_DISCLAIMER,
    };
  }

  async explain(raw: { tenantId: string; workspaceId?: string; userId: string }) {
    const scope = requireWorkspace(raw);
    const intel = await this.intelligence(scope);
    const evidence = {
      summary: intel.summary,
      register: intel.register.map((row) => ({
        reference: row.risk.reference,
        title: row.risk.title,
        residual: row.residualLevel,
        inherent: row.inherentLevel,
        tolerance: row.toleranceStatus,
        priority: row.priority.priority,
      })),
      disclaimer: BUSINESS_RISK_DISCLAIMER,
    };
    try {
      const policy = await this.kernel.intelligence.policies.evaluate({
        tenantId: scope.tenantId,
        operatingSystem: "business",
        intent: "business_risk.explain",
        simulation: false,
      });
      if (policy.allowed === false) return emptyNarrative("policy_denied");
      const response = await this.kernel.aiDirector.run({
        tenantId: scope.tenantId,
        workspaceId: scope.workspaceId,
        userId: scope.userId,
        message:
          "Summarise deterministic business risk intelligence for an owner. Do not provide legal advice, declare regulatory compliance, accept risk, approve controls, or invent exposures. Do not expose chain-of-thought.",
        context: {
          evidence: {
            kind: "business_os.risk.evidence",
            payload: evidence,
            instructions: [
              "Use only structured evidence.",
              "Do not fabricate risks or exposures.",
              "Do not accept risk or approve control effectiveness.",
              "Do not declare statutory compliance.",
              "Do not provide legal advice.",
              "Unknown stays unknown.",
              "Do not expose chain-of-thought.",
            ],
          },
        },
      });
      const text = response.message?.trim() ?? "";
      if (!text) return emptyNarrative("empty_ai_response");
      await this.auditMutation(scope, "create", "business_os_risk_ai_brief", scope.workspaceId, {
        generatedBy: "platform_ai_director",
      });
      return {
        text,
        generatedAt: new Date().toISOString(),
        generatedBy: "platform_ai_director" as const,
        modelProvenance:
          [response.run.model_provider, response.run.model_name].filter(Boolean).join("/") || "platform-ai-director",
        evidenceRefs: [],
        advisory: true,
      } satisfies AiDailyBriefNarrative;
    } catch {
      return emptyNarrative("ai_director_unavailable");
    }
  }

  async seedDemo(raw: { tenantId: string; workspaceId?: string; userId: string }) {
    const scope = requireWorkspace(raw);
    await this.ownerCommand.seedDemo(scope);
    const result = await seedBusinessRiskDemo(this.repository, this.ownerCommand.repository, scope);
    await this.publishToOwnerCommand(scope);
    await this.auditMutation(scope, "create", "business_os_demo", "business-risk", {
      fixture: "bos-9-business-risk",
    });
    return result;
  }

  private async requireRisk(scope: OwnerCommandScope, id: string) {
    const risk = await this.repository.getRisk(scope, id);
    if (!risk) throw new Error("Risk not found");
    return risk;
  }

  private async residualForRisk(scope: OwnerCommandScope, riskId: string, inherentLevel: import("@rtb/types").BusinessRiskLevel) {
    const [controls, links] = await Promise.all([
      this.repository.listControls(scope),
      this.repository.listControlLinks(scope, riskId),
    ]);
    const linked = links
      .filter((link) => link.applicable)
      .map((link) => controls.find((control) => control.id === link.controlId))
      .filter((control): control is NonNullable<typeof control> => Boolean(control))
      .map((control) => ({
        applicable: true,
        status: control.status,
        effectiveness: control.effectiveness,
        evidenceRefs: control.evidenceRefs,
      }));
    return computeResidual(inherentLevel, linked);
  }

  private async refreshResidual(scope: OwnerCommandScope, riskId: string) {
    const assessments = await this.repository.listAssessments(scope, riskId);
    const latest = assessments[0];
    if (!latest) return;
    const residual = await this.residualForRisk(scope, riskId, latest.inherentLevel);
    if (residual.residualLevel === latest.residualLevel) return;
    await this.repository.insertAssessment({
      tenant_id: scope.tenantId,
      workspace_id: scope.workspaceId,
      risk_id: riskId,
      version: latest.version + 1,
      method: BUSINESS_RISK_ASSESSMENT_METHOD,
      likelihood: latest.likelihood,
      impact: latest.impact,
      inherent_level: latest.inherentLevel,
      residual_level: residual.residualLevel,
      inherent_score: latest.inherentScore,
      residual_score: residual.residualScore,
      assessor_label: latest.assessorLabel,
      rationale: latest.rationale,
      assumptions: asJson(latest.assumptions),
      evidence_refs: asJson(latest.evidenceRefs),
      residual_method: BUSINESS_RISK_RESIDUAL_METHOD,
      residual_rationale: residual.rationale,
      assessed_at: new Date().toISOString(),
      provenance: asJson({ refreshedFromControl: true, priorAssessmentId: latest.id }),
      is_demo: latest.isDemo,
      created_by: scope.userId,
    });
    await this.emit(scope, "business_os.risk.residual_updated", { id: riskId, residualLevel: residual.residualLevel });
  }

  private async buildRegister(scope: OwnerCommandScope) {
    const [risks, assessments, controls, links, treatments, evidence, settings] = await Promise.all([
      this.repository.listRisks(scope),
      this.repository.listAssessments(scope),
      this.repository.listControls(scope),
      this.repository.listControlLinks(scope),
      this.repository.listTreatments(scope),
      this.repository.listEvidence(scope),
      this.repository.getSettings(scope),
    ]);
    const asOf = new Date().toISOString();
    const staleMs = 90 * 86_400_000;
    return risks.map((risk) => {
      const latestAssessment = assessments.filter((row) => row.riskId === risk.id).sort((a, b) => b.version - a.version)[0] ?? null;
      const riskLinks = links.filter((link) => link.riskId === risk.id && link.applicable);
      const riskControls = riskLinks
        .map((link) => controls.find((control) => control.id === link.controlId))
        .filter((control): control is NonNullable<typeof control> => Boolean(control));
      const evidencedControlCount = riskControls.filter((control) =>
        controlReducesResidual({
          applicable: true,
          status: control.status,
          effectiveness: control.effectiveness,
          evidenceRefs: control.evidenceRefs,
        }),
      ).length;
      const residual = latestAssessment
        ? computeResidual(
            latestAssessment.inherentLevel,
            riskControls.map((control) => ({
              applicable: true,
              status: control.status,
              effectiveness: control.effectiveness,
              evidenceRefs: control.evidenceRefs,
            })),
          )
        : computeResidual("unknown", []);
      const maxAcceptable = resolveMaxAcceptableLevel(settings, risk);
      const tolerance = toleranceStatus(residual.residualLevel, maxAcceptable);
      const riskEvidence = evidence.filter((item) => item.riskId === risk.id);
      const newest = riskEvidence[0]?.capturedAt ?? null;
      const evidenceFreshness: BusinessRiskEvidenceFreshness =
        riskEvidence.length === 0
          ? "missing"
          : newest && Date.parse(asOf) - Date.parse(newest) > staleMs
            ? "stale"
            : "fresh";
      const exposure = financialExposure(
        riskEvidence.map((item) => ({
          amountMinor:
            typeof item.snapshot.amountMinor === "string" || typeof item.snapshot.amountMinor === "number"
              ? item.snapshot.amountMinor
              : null,
          currency: typeof item.snapshot.currency === "string" ? item.snapshot.currency : null,
        })),
      );
      const worstEffectiveness =
        riskControls.find((c) => c.effectiveness === "ineffective")?.effectiveness ??
        riskControls.find((c) => c.effectiveness === "untested")?.effectiveness ??
        riskControls.find((c) => c.effectiveness === "partially_effective")?.effectiveness ??
        riskControls[0]?.effectiveness ??
        null;
      const priority = computeRiskPriority({
        residualLevel: residual.residualLevel,
        financialExposureKnown: exposure.known,
        financialExposureHigh: exposure.high,
        mixedCurrency: exposure.mixedCurrency,
        reviewAt: risk.reviewAt,
        asOf,
        ownerLabel: risk.ownerLabel,
        controlEffectiveness: worstEffectiveness,
        outsideTolerance: tolerance === "unknown" ? "unknown" : tolerance === "outside",
        evidence: riskEvidence.map((item) => ({
          sourceType: item.sourceType,
          sourceRef: item.sourceRef,
          title: item.sourceRef,
        })),
      });
      const latestTreatment = treatments.filter((row) => row.riskId === risk.id)[0] ?? null;
      return {
        risk,
        latestAssessment,
        inherentLevel: latestAssessment?.inherentLevel ?? "unknown",
        residualLevel: residual.residualLevel,
        toleranceStatus: tolerance,
        toleranceException: Boolean(risk.toleranceExceptionAt),
        treatmentStrategy: latestTreatment?.strategy ?? null,
        controlCount: riskControls.length,
        evidencedControlCount,
        evidenceFreshness,
        priority,
      };
    });
  }

  private async publishToOwnerCommand(scope: OwnerCommandScope) {
    const intel = await this.intelligence(scope);
    const isDemo = intel.summary.containsDemoData;
    const values: Record<BusinessRiskKpiKey, number | null> = {
      open_high_risks: intel.summary.openHighRisks,
      extreme_residual_risks: intel.summary.extremeResidualRisks,
      overdue_risk_reviews: intel.summary.overdueReviews,
      risks_without_owner: intel.summary.risksWithoutOwner,
      ineffective_controls: intel.summary.ineffectiveControls,
      untested_controls: intel.summary.untestedControls,
      overdue_obligations: intel.summary.overdueObligations,
      treatment_actions_overdue: intel.summary.treatmentActionsOverdue,
      risks_outside_tolerance: intel.summary.outsideTolerance,
      risk_data_coverage: intel.register.length
        ? Math.round((intel.register.filter((row) => row.latestAssessment).length / intel.register.length) * 10000)
        : null,
    };
    const extras: Record<string, { warning?: number; critical?: number }> = {
      open_high_risks: { warning: 1, critical: 3 },
      extreme_residual_risks: { warning: 1, critical: 1 },
      overdue_risk_reviews: { warning: 1, critical: 3 },
      risks_without_owner: { warning: 1, critical: 3 },
      ineffective_controls: { warning: 1, critical: 2 },
      untested_controls: { warning: 2, critical: 5 },
      overdue_obligations: { warning: 1, critical: 3 },
      treatment_actions_overdue: { warning: 1, critical: 3 },
      risks_outside_tolerance: { warning: 1, critical: 2 },
      risk_data_coverage: { warning: 7000, critical: 4000 },
    };
    for (const key of BUSINESS_RISK_KPI_KEYS) {
      const meta = KPI_META[key];
      await this.ownerCommand.upsertKpi(scope, {
        key,
        name: meta.name,
        category: meta.category,
        unit: meta.unit,
        direction: meta.direction,
        value: values[key] ?? null,
        warningThreshold: extras[key]?.warning ?? null,
        criticalThreshold: extras[key]?.critical ?? null,
        measuredAt: new Date().toISOString(),
        sourceType: isDemo ? "demo" : "derived",
        sourceRef: "business_risk",
        provenance: { domain: "risk", live: false },
        isDemo,
      });
    }

    const [controls, obligations, actionLinks, actions, existing, recs] = await Promise.all([
      this.repository.listControls(scope),
      this.repository.listObligations(scope),
      this.repository.listActionLinks(scope),
      this.ownerCommand.repository.listActions(scope),
      this.ownerCommand.repository.listSignals(scope),
      this.ownerCommand.repository.listRecommendations(scope),
    ]);
    const asOf = new Date().toISOString();
    const openSignals = [...existing];
    const openRecs = [...recs];
    const allControlLinks = await this.repository.listControlLinks(scope);
    for (const row of intel.register) {
      const linkedControlIds = new Set(
        allControlLinks.filter((link) => link.riskId === row.risk.id).map((link) => link.controlId),
      );
      const riskActions = actions.filter((action) =>
        actionLinks.some((link) => link.riskId === row.risk.id && link.actionId === action.id),
      );
      const drafts = detectRiskSignals({
        row,
        controls: controls.filter((control) => linkedControlIds.has(control.id)),
        obligations: obligations.filter((item) => item.riskId === row.risk.id),
        actions: riskActions,
        asOf,
      });
      for (const draft of drafts) {
        if (draft.type === "risk.outside_tolerance") {
          await this.emit(scope, "business_os.risk.outside_tolerance", { id: row.risk.id, ruleId: draft.ruleId });
        }
        if (draft.type === "risk.obligation_overdue") {
          await this.emit(scope, "business_os.risk.obligation_overdue", { id: row.risk.id, ruleId: draft.ruleId });
        }
        if (draft.type === "risk.review_overdue") {
          await this.emit(scope, "business_os.risk.review_due", { id: row.risk.id, ruleId: draft.ruleId });
        }
        const already = openSignals.some((s) => s.type === draft.type && s.title === draft.title && s.status === "open");
        if (already) continue;
        const created = await this.ownerCommand.repository.insertSignal(scope, {
          type: draft.type,
          severity: draft.severity,
          title: draft.title,
          summary: draft.summary,
          sourceType: isDemo ? "demo" : "derived",
          sourceRef: "business_risk",
          evidence: draft.evidence,
          provenance: draft.provenance,
          detectedAt: asOf,
          status: "open",
          businessImpact: draft.businessImpact,
          isDemo,
          createdBy: scope.userId,
        });
        openSignals.push(created);
        await this.emit(scope, "business_os.signal.created", { id: created.id, type: created.type });
        const recAlready = openRecs.some((r) => r.title === draft.recommendationTitle && r.status === "proposed");
        if (recAlready) continue;
        const createdRec = await this.ownerCommand.repository.insertRecommendation(scope, {
          signalId: created.id,
          title: draft.recommendationTitle,
          recommendationText: draft.recommendationText,
          rationaleSummary: draft.summary,
          expectedImpact: "Advisory only. No autonomous risk acceptance.",
          confidence: "medium",
          evidenceRefs: draft.evidence,
          status: "proposed",
          generatedBy: "deterministic_rule",
          isDemo,
          createdBy: scope.userId,
        });
        openRecs.push(createdRec);
        await this.emit(scope, "business_os.recommendation.created", { id: createdRec.id });
      }
    }
  }
}

function emptyNarrative(reason: string): AiDailyBriefNarrative {
  return {
    text: "",
    generatedAt: new Date().toISOString(),
    generatedBy: "platform_ai_director",
    evidenceRefs: [],
    advisory: true,
    unavailableReason: reason,
  };
}
