import type { SupabaseClient } from "@rtb/database";
import type { PlatformKernel } from "@rtb/platform-kernel";
import { AuditService } from "@rtb/platform-core";
import type {
  AiDailyBriefNarrative,
  BusinessDecision,
  BusinessDecisionContextInput,
  BusinessDecisionEvidenceInput,
  BusinessDecisionImpactInput,
  BusinessDecisionKpiKey,
  BusinessDecisionLessonInput,
  BusinessDecisionOptionInput,
  BusinessDecisionOptionStatus,
  BusinessDecisionOutcomeInput,
  BusinessKpi,
  BusinessKpiCategory,
} from "@rtb/types";
import {
  BUSINESS_DECISION_DEFAULT_THRESHOLDS,
  BUSINESS_DECISION_DOMAINS,
  BUSINESS_DECISION_IMPACT_DIMENSIONS,
  BUSINESS_DECISION_KPI_KEYS,
  BUSINESS_DECISION_OPTION_STATUSES,
  BUSINESS_DECISION_OUTCOME_STATUSES,
  BUSINESS_OS_EVENT_TYPES,
} from "@rtb/types";
import { computeBusinessHealth } from "../owner-command/health";
import type { OwnerCommandService, OwnerCommandScope } from "../owner-command/service";
import { actionCompletionRateBps, computeActionIntelligence, meanCycleTimeDays } from "./action-intelligence";
import { buildDecisionBrief, evidenceCompletenessBps } from "./brief";
import { compareOptions } from "./comparison";
import { seedDecisionActionDemo } from "./demo";
import { assessEffectiveness } from "./effectiveness";
import {
  BUSINESS_RISK_CONTRACT,
  DECISION_ACTION_INTELLIGENCE_CONTRACT,
  businessRiskStatus,
} from "./extensions";
import { normalizeImpactQuantification } from "./impact";
import { assertOutcomeEvidence, compareExpectedVsActual } from "./outcomes";
import { computeDecisionPriority } from "./priority";
import { asJson, DecisionActionRepository, minorCol } from "./repository";
import { detectDecisionSignals } from "./signals";

function requireWorkspace(scope: { tenantId: string; workspaceId?: string; userId: string }): OwnerCommandScope {
  if (!scope.workspaceId) throw new Error("workspace_not_assigned");
  return { tenantId: scope.tenantId, workspaceId: scope.workspaceId, userId: scope.userId };
}

const DISCLAIMER =
  "Decision & Action Intelligence is advisory. Final approval remains human. Unknown impact stays unknown. No autonomous approval or external execution.";

const KPI_META: Record<
  BusinessDecisionKpiKey,
  { name: string; category: BusinessKpiCategory; unit: string; direction: BusinessKpi["direction"] }
> = {
  pending_decisions: { name: "Pending decisions", category: "decision", unit: "count", direction: "lower_is_better" },
  overdue_decisions: { name: "Overdue decisions", category: "decision", unit: "count", direction: "lower_is_better" },
  critical_decisions: { name: "Critical decisions", category: "decision", unit: "count", direction: "lower_is_better" },
  decisions_without_evidence: {
    name: "Decisions without evidence",
    category: "decision",
    unit: "count",
    direction: "lower_is_better",
  },
  decision_cycle_time: { name: "Decision cycle time", category: "decision", unit: "days", direction: "lower_is_better" },
  action_completion_rate: {
    name: "Action completion rate",
    category: "decision",
    unit: "bps",
    direction: "higher_is_better",
  },
  overdue_actions: { name: "Overdue actions", category: "decision", unit: "count", direction: "lower_is_better" },
  blocked_actions: { name: "Blocked actions", category: "decision", unit: "count", direction: "lower_is_better" },
  outcome_measurement_coverage: {
    name: "Outcome measurement coverage",
    category: "decision",
    unit: "bps",
    direction: "higher_is_better",
  },
  decision_effectiveness_coverage: {
    name: "Decision effectiveness coverage",
    category: "decision",
    unit: "bps",
    direction: "higher_is_better",
  },
};

export class DecisionActionIntelligenceService {
  readonly repository: DecisionActionRepository;

  constructor(
    private readonly supabase: SupabaseClient,
    private readonly kernel: PlatformKernel,
    private readonly audit: AuditService,
    private readonly ownerCommand: OwnerCommandService,
  ) {
    this.repository = new DecisionActionRepository(supabase);
  }

  private contextGraphSuggest?: (
    scope: OwnerCommandScope,
    decisionId: string,
  ) => Promise<{
    suggestions: Array<Record<string, unknown>>;
    included: false;
    adjacencyIsNotCausation: true;
    note: string;
  }>;

  bindContextGraph(
    fn: NonNullable<DecisionActionIntelligenceService["contextGraphSuggest"]>,
  ) {
    this.contextGraphSuggest = fn;
  }

  async suggestGraphEvidence(raw: { tenantId: string; workspaceId?: string; userId: string }, decisionId: string) {
    const scope = requireWorkspace(raw);
    if (!this.contextGraphSuggest) {
      return {
        suggestions: [],
        included: false as const,
        adjacencyIsNotCausation: true as const,
        note: "Graph context may suggest evidence; evidence inclusion remains explicit and auditable.",
      };
    }
    return this.contextGraphSuggest(scope, decisionId);
  }

  approveAutonomously(): never {
    throw new Error("autonomous_approval_forbidden");
  }

  executeExternalAction(): never {
    throw new Error("external_execution_forbidden");
  }

  rewriteHistoricalEvidence(): never {
    throw new Error("historical_evidence_rewrite_forbidden");
  }

  contract() {
    return DECISION_ACTION_INTELLIGENCE_CONTRACT;
  }

  businessRisk() {
    return businessRiskStatus();
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

  private async requireDecision(scope: OwnerCommandScope, decisionId: string): Promise<BusinessDecision> {
    const decision = (await this.ownerCommand.repository.listDecisions(scope)).find((row) => row.id === decisionId);
    if (!decision) throw new Error("Decision not found");
    return decision;
  }

  async upsertContext(raw: { tenantId: string; workspaceId?: string; userId: string }, input: BusinessDecisionContextInput) {
    const scope = requireWorkspace(raw);
    await this.requireDecision(scope, input.decisionId);
    if (!input.question?.trim()) throw new Error("decision_question_required");
    if (!input.sourceType) throw new Error("invalid_source_type");
    const domain = input.domain ?? "general";
    if (!BUSINESS_DECISION_DOMAINS.includes(domain)) throw new Error("invalid_decision_domain");
    const existing =
      (await this.repository.getContext(scope, input.decisionId)) ??
      (input.sourceRef ? await this.repository.getContextBySourceRef(scope, input.sourceType, input.sourceRef) : null);
    const payload = {
      tenant_id: scope.tenantId,
      workspace_id: scope.workspaceId,
      decision_id: input.decisionId,
      question: input.question.trim(),
      problem_statement: input.problemStatement ?? null,
      originating_signal_id: input.originatingSignalId ?? null,
      originating_recommendation_id: input.originatingRecommendationId ?? null,
      domain,
      owner_label: input.ownerLabel ?? null,
      stakeholders: asJson(input.stakeholders ?? []),
      urgency: input.urgency ?? "normal",
      due_at: input.dueAt ?? null,
      assumptions: asJson(input.assumptions ?? []),
      constraints: asJson(input.constraints ?? []),
      source_type: input.sourceType,
      source_ref: input.sourceRef ?? input.decisionId,
      provenance: asJson(input.provenance ?? {}),
      is_demo: input.isDemo ?? false,
      created_by: scope.userId,
    };
    const row = existing
      ? await this.repository.updateContext(scope, existing.id, payload)
      : await this.repository.insertContext(payload);
    await this.auditMutation(scope, existing ? "update" : "create", "business_os_decision_context", row.id, {
      decisionId: input.decisionId,
    });
    return row;
  }

  async addEvidence(raw: { tenantId: string; workspaceId?: string; userId: string }, input: BusinessDecisionEvidenceInput) {
    const scope = requireWorkspace(raw);
    await this.requireDecision(scope, input.decisionId);
    if (!input.sourceType || !input.sourceRef) throw new Error("invalid_source_type");
    if (!BUSINESS_DECISION_DOMAINS.includes(input.sourceDomain)) throw new Error("invalid_decision_domain");
    const existing = await this.repository.getEvidenceBySource(scope, input.decisionId, input.sourceType, input.sourceRef);
    if (existing) {
      throw new Error("historical_evidence_rewrite_forbidden");
    }
    const snapshot = {
      ...(input.snapshot ?? {}),
      summary: input.summary,
      valueState: input.valueState ?? "unknown",
      valueText: input.valueText ?? null,
      valueMinor: input.valueMinor ?? null,
      capturedAt: new Date().toISOString(),
    };
    const row = await this.repository.insertEvidence({
      tenant_id: scope.tenantId,
      workspace_id: scope.workspaceId,
      decision_id: input.decisionId,
      option_id: input.optionId ?? null,
      source_type: input.sourceType,
      source_domain: input.sourceDomain,
      source_id: input.sourceId ?? null,
      source_ref: input.sourceRef,
      summary: input.summary,
      value_state: input.valueState ?? (input.valueMinor != null ? "known" : input.valueText ? "qualitative" : "unknown"),
      value_text: input.valueText ?? null,
      value_minor: minorCol(input.valueMinor ?? null),
      currency: input.currency ?? null,
      scale: input.scale ?? null,
      unit: input.unit ?? null,
      observed_at: input.observedAt ?? null,
      freshness: input.freshness ?? "point_in_time",
      confidence: input.confidence ?? "unavailable",
      evidence_quality: input.evidenceQuality ?? input.confidence ?? "unavailable",
      snapshot: asJson(snapshot),
      generated_by: input.generatedBy ?? "user",
      provenance: asJson({ ...(input.provenance ?? {}), pointInTime: true }),
      is_demo: input.isDemo ?? false,
      created_by: scope.userId,
    });
    const completeness = evidenceCompletenessBps(await this.repository.listEvidence(scope, input.decisionId));
    const context = await this.repository.getContext(scope, input.decisionId);
    if (context) await this.repository.updateContext(scope, context.id, { evidence_completeness_bps: completeness });
    await this.emit(scope, "business_os.decision.evidence_updated", { id: row.id, decisionId: input.decisionId });
    await this.auditMutation(scope, "create", "business_os_decision_evidence", row.id, {
      decisionId: input.decisionId,
      sourceRef: input.sourceRef,
    });
    return row;
  }

  async createOption(raw: { tenantId: string; workspaceId?: string; userId: string }, input: BusinessDecisionOptionInput) {
    const scope = requireWorkspace(raw);
    await this.requireDecision(scope, input.decisionId);
    if (!input.title?.trim()) throw new Error("option_title_required");
    const status = input.status ?? "candidate";
    if (!BUSINESS_DECISION_OPTION_STATUSES.includes(status)) throw new Error("invalid_option_status");
    const generatedBy = input.generatedBy ?? "user";
    if (input.sourceRef) {
      const existing = await this.repository.getOptionBySourceRef(scope, input.sourceType, input.sourceRef);
      if (existing) return existing;
    }
    const row = await this.repository.insertOption({
      tenant_id: scope.tenantId,
      workspace_id: scope.workspaceId,
      decision_id: input.decisionId,
      title: input.title.trim(),
      description: input.description ?? null,
      status,
      assumptions: asJson(input.assumptions ?? []),
      constraints: asJson(input.constraints ?? []),
      expected_benefits: input.expectedBenefits ?? null,
      expected_costs: input.expectedCosts ?? null,
      expected_risks: input.expectedRisks ?? null,
      reversibility: input.reversibility ?? "unknown",
      generated_by: generatedBy,
      ai_generated: generatedBy === "platform_ai_director",
      source_type: input.sourceType,
      source_ref: input.sourceRef ?? `${input.decisionId}:${input.title}`,
      provenance: asJson({
        ...(input.provenance ?? {}),
        aiGenerated: generatedBy === "platform_ai_director",
      }),
      is_demo: input.isDemo ?? false,
      created_by: scope.userId,
    });
    await this.emit(scope, "business_os.decision.option_created", { id: row.id, decisionId: input.decisionId });
    await this.auditMutation(scope, "create", "business_os_decision_option", row.id, {
      title: row.title,
      generatedBy,
    });
    return row;
  }

  async updateOptionStatus(
    raw: { tenantId: string; workspaceId?: string; userId: string },
    optionId: string,
    status: BusinessDecisionOptionStatus,
  ) {
    const scope = requireWorkspace(raw);
    if (!BUSINESS_DECISION_OPTION_STATUSES.includes(status)) throw new Error("invalid_option_status");
    const option = await this.repository.getOption(scope, optionId);
    if (!option) throw new Error("Option not found");
    const updated = await this.repository.updateOption(scope, optionId, { status });
    if (status === "selected") {
      const context = await this.repository.getContext(scope, option.decisionId);
      if (context) await this.repository.updateContext(scope, context.id, { selected_option_id: optionId });
      await this.emit(scope, "business_os.decision.selected", { decisionId: option.decisionId, optionId });
    }
    await this.auditMutation(scope, "update", "business_os_decision_option", optionId, { status });
    return updated;
  }

  async recordImpact(raw: { tenantId: string; workspaceId?: string; userId: string }, input: BusinessDecisionImpactInput) {
    const scope = requireWorkspace(raw);
    const option = await this.repository.getOption(scope, input.optionId);
    if (!option) throw new Error("Option not found");
    if (!BUSINESS_DECISION_IMPACT_DIMENSIONS.includes(input.dimension)) throw new Error("invalid_impact_dimension");
    const normalized = normalizeImpactQuantification(input);
    const payload = {
      tenant_id: scope.tenantId,
      workspace_id: scope.workspaceId,
      option_id: input.optionId,
      dimension: input.dimension,
      quantification: normalized.quantification,
      value_minor: normalized.valueMinor,
      currency: normalized.quantification === "quantitative" ? input.currency ?? null : null,
      scale: normalized.quantification === "quantitative" ? input.scale ?? 2 : null,
      unit: input.unit ?? null,
      period: input.period ?? null,
      qualitative_label: normalized.qualitativeOnly ? input.qualitativeLabel ?? null : null,
      qualitative_only: normalized.qualitativeOnly,
      source_domain: input.sourceDomain ?? null,
      source_ref: input.sourceRef ?? null,
      rule_version: input.ruleVersion ?? null,
      source_type: "derived",
      provenance: asJson({ ...(input.provenance ?? {}), deterministic: true, llmAuthoritative: false }),
      is_demo: input.isDemo ?? false,
      created_by: scope.userId,
    };
    const existing = await this.repository.getImpact(scope, input.optionId, input.dimension);
    const row = existing
      ? await this.repository.updateImpact(scope, existing.id, payload)
      : await this.repository.insertImpact(payload);
    await this.auditMutation(scope, existing ? "update" : "create", "business_os_decision_impact", row.id, {
      dimension: input.dimension,
      quantification: normalized.quantification,
    });
    return row;
  }

  async recordOutcome(raw: { tenantId: string; workspaceId?: string; userId: string }, input: BusinessDecisionOutcomeInput) {
    const scope = requireWorkspace(raw);
    await this.requireDecision(scope, input.decisionId);
    const status = input.status ?? "pending";
    if (!BUSINESS_DECISION_OUTCOME_STATUSES.includes(status)) throw new Error("invalid_outcome_status");
    const comparison = compareExpectedVsActual(input);
    const evidenceRefs = input.evidenceRefs ?? [];
    assertOutcomeEvidence({
      status,
      evidenceRefs,
      explanation: input.explanation ?? null,
      actualValue: input.actualValue != null ? String(input.actualValue) : null,
      actualOutcome: input.actualOutcome ?? null,
    });
    const payload = {
      tenant_id: scope.tenantId,
      workspace_id: scope.workspaceId,
      decision_id: input.decisionId,
      selected_option_id: input.selectedOptionId ?? null,
      expected_outcome: input.expectedOutcome ?? null,
      expected_metric_key: input.expectedMetricKey ?? null,
      expected_value: input.expectedValue ?? null,
      expected_unit: input.expectedUnit ?? null,
      expected_currency: input.expectedCurrency ?? null,
      expected_scale: input.expectedScale ?? null,
      expected_period: input.expectedPeriod ?? null,
      actual_outcome: input.actualOutcome ?? null,
      actual_metric_key: input.actualMetricKey ?? null,
      actual_value: input.actualValue ?? null,
      actual_unit: input.actualUnit ?? null,
      actual_currency: input.actualCurrency ?? null,
      actual_scale: input.actualScale ?? null,
      actual_period: input.actualPeriod ?? null,
      measurement_date: input.measurementDate ?? null,
      measurement_window_start: input.measurementWindowStart ?? null,
      measurement_window_end: input.measurementWindowEnd ?? null,
      status,
      variance_value: comparison.varianceValue,
      variance_state: comparison.varianceState,
      explanation: input.explanation ?? (comparison.comparable ? null : comparison.reason ?? null),
      evidence_refs: asJson(evidenceRefs),
      source_type: input.sourceType,
      source_ref: input.sourceRef ?? input.decisionId,
      provenance: asJson({ ...(input.provenance ?? {}), comparisonReason: comparison.reason ?? "computed" }),
      is_demo: input.isDemo ?? false,
      created_by: scope.userId,
    };
    const existing = input.sourceRef
      ? await this.repository.getOutcomeBySourceRef(scope, input.sourceType, input.sourceRef)
      : (await this.repository.listOutcomes(scope, input.decisionId))[0] ?? null;
    const row = existing
      ? await this.repository.updateOutcome(scope, existing.id, payload)
      : await this.repository.insertOutcome(payload);
    await this.emit(scope, "business_os.decision.outcome_recorded", { id: row.id, decisionId: input.decisionId });
    if (status !== "pending" && status !== "measuring") {
      await this.emit(scope, "business_os.decision.outcome_reviewed", { id: row.id, decisionId: input.decisionId });
    }
    await this.auditMutation(scope, existing ? "update" : "create", "business_os_decision_outcome", row.id, {
      status,
      varianceState: comparison.varianceState,
    });
    return row;
  }

  async draftLesson(raw: { tenantId: string; workspaceId?: string; userId: string }, input: BusinessDecisionLessonInput) {
    const scope = requireWorkspace(raw);
    await this.requireDecision(scope, input.decisionId);
    const draftSource = input.draftSource ?? "user";
    const status = draftSource === "platform_ai_director" ? "proposed_ai" : "draft";
    if (input.sourceRef) {
      const existing = await this.repository.getLessonBySourceRef(scope, input.sourceType, input.sourceRef);
      if (existing) return existing;
    }
    const row = await this.repository.insertLesson({
      tenant_id: scope.tenantId,
      workspace_id: scope.workspaceId,
      decision_id: input.decisionId,
      selected_option_id: input.selectedOptionId ?? null,
      assumptions_snapshot: asJson(input.assumptionsSnapshot ?? []),
      evidence_snapshot: asJson(input.evidenceSnapshot ?? {}),
      expected_outcome: input.expectedOutcome ?? null,
      actual_outcome: input.actualOutcome ?? null,
      lesson_text: input.lessonText,
      draft_source: draftSource,
      status,
      review_status: "pending",
      source_type: input.sourceType,
      source_ref: input.sourceRef ?? `${input.decisionId}:${Date.now()}`,
      provenance: asJson({ ...(input.provenance ?? {}), organisationalKnowledge: false }),
      is_demo: input.isDemo ?? false,
      created_by: scope.userId,
    });
    await this.emit(scope, "business_os.decision.lesson_recorded", { id: row.id, status });
    await this.auditMutation(scope, "create", "business_os_decision_lesson", row.id, { status, draftSource });
    return row;
  }

  async acceptLesson(raw: { tenantId: string; workspaceId?: string; userId: string }, lessonId: string) {
    const scope = requireWorkspace(raw);
    const lessons = await this.repository.listLessons(scope);
    const lesson = lessons.find((row) => row.id === lessonId);
    if (!lesson) throw new Error("Lesson not found");
    let memoryId: string | null = lesson.memoryId ?? null;
    try {
      const stored = await this.kernel.memory.store({
        tenantId: scope.tenantId,
        scopeKey: "workspace",
        scopeRefId: scope.workspaceId,
        content: lesson.lessonText,
        classification: "general",
        createdBy: scope.userId,
      });
      memoryId = stored.id;
    } catch {
      // Fail-soft: organisational knowledge can be accepted without MemoryService.
    }
    const updated = await this.repository.updateLesson(scope, lessonId, {
      status: "accepted",
      accepted_at: new Date().toISOString(),
      accepted_by: scope.userId,
      memory_id: memoryId,
      review_status: "reviewed",
      provenance: asJson({ ...lesson.provenance, organisationalKnowledge: true, humanAccepted: true }),
    });
    await this.auditMutation(scope, "update", "business_os_decision_lesson", lessonId, {
      status: "accepted",
      humanAccepted: true,
    });
    return updated;
  }

  async rejectLesson(raw: { tenantId: string; workspaceId?: string; userId: string }, lessonId: string) {
    const scope = requireWorkspace(raw);
    const updated = await this.repository.updateLesson(scope, lessonId, {
      status: "rejected",
      review_status: "reviewed",
      provenance: asJson({ organisationalKnowledge: false, humanRejected: true }),
    });
    await this.auditMutation(scope, "update", "business_os_decision_lesson", lessonId, { status: "rejected" });
    return updated;
  }

  private async assemble(scope: OwnerCommandScope, decision: BusinessDecision) {
    const [context, evidence, options, actions, outcomes, lessons, settings, signals] = await Promise.all([
      this.repository.getContext(scope, decision.id),
      this.repository.listEvidence(scope, decision.id),
      this.repository.listOptions(scope, decision.id),
      this.ownerCommand.repository.listActions(scope),
      this.repository.listOutcomes(scope, decision.id),
      this.repository.listLessons(scope, decision.id),
      this.repository.getSettings(scope),
      this.ownerCommand.repository.listSignals(scope),
    ]);
    const impacts = await this.repository.listImpacts(scope, options.map((row) => row.id));
    const comparison = compareOptions({
      options,
      impacts,
      scoringEnabled: Boolean(settings.comparisonScoringEnabled),
      decisionEvidence: evidence.map((item) => ({
        sourceType: item.sourceType,
        sourceRef: item.sourceRef,
        title: item.summary,
      })),
    });
    const originating = signals.find((s) => s.id === context?.originatingSignalId);
    const financial = impacts.find((row) => row.dimension === "financial" && row.quantification === "quantitative");
    const customerImpact = impacts.find((row) => row.dimension === "customer");
    const operationalImpact = impacts.find((row) => row.dimension === "operational");
    const selected = options.find((row) => row.status === "selected" || row.id === context?.selectedOptionId);
    const priority = computeDecisionPriority({
      pending: decision.status === "pending" || decision.status === "deferred",
      dueAt: context?.dueAt ?? decision.reviewAt,
      originatingSignalSeverity: originating?.severity ?? null,
      financialImpactMinor: financial?.valueMinor ?? null,
      customerImpact:
        customerImpact?.quantification === "unknown"
          ? "unknown"
          : customerImpact
            ? "medium"
            : null,
      operationalImpact:
        operationalImpact?.quantification === "unknown"
          ? "unknown"
          : operationalImpact
            ? "medium"
            : null,
      reversibility: selected?.reversibility ?? options[0]?.reversibility ?? null,
      thresholds: settings,
      evidence: evidence.map((item) => ({ sourceType: item.sourceType, sourceRef: item.sourceRef, title: item.summary })),
    });
    const outcome = outcomes[0] ?? null;
    const effectiveness = assessEffectiveness(outcome, evidence.map((item) => ({
      sourceType: item.sourceType,
      sourceRef: item.sourceRef,
      title: item.summary,
    })));
    const brief = buildDecisionBrief({ decision, context, evidence, options, comparison });
    const linkedActions = actions.filter((a) => a.decisionId === decision.id);
    return {
      decision,
      context,
      evidence,
      options,
      impacts,
      comparison,
      priority,
      outcome,
      outcomes,
      effectiveness,
      brief,
      lessons,
      actions: linkedActions,
      settings,
    };
  }

  async queue(raw: { tenantId: string; workspaceId?: string; userId: string }) {
    const scope = requireWorkspace(raw);
    const decisions = await this.ownerCommand.repository.listDecisions(scope);
    const items = [];
    for (const decision of decisions) {
      const assembled = await this.assemble(scope, decision);
      items.push({
        id: decision.id,
        statement: decision.statement,
        question: assembled.context?.question ?? decision.statement,
        domain: assembled.context?.domain ?? "unknown",
        priority: assembled.priority,
        ownerId: decision.ownerId ?? null,
        ownerLabel: assembled.context?.ownerLabel ?? null,
        dueAt: assembled.context?.dueAt ?? decision.reviewAt ?? null,
        originatingSignalId: assembled.context?.originatingSignalId ?? null,
        evidenceCompletenessBps: assembled.context?.evidenceCompletenessBps ?? (assembled.evidence.length ? evidenceCompletenessBps(assembled.evidence) : "0"),
        status: decision.status,
        isDemo: decision.isDemo,
      });
    }
    return items.sort((a, b) => {
      const order = ["critical", "urgent", "high", "normal", "low", "unknown"];
      return order.indexOf(a.priority.priority) - order.indexOf(b.priority.priority);
    });
  }

  async detail(raw: { tenantId: string; workspaceId?: string; userId: string }, decisionId: string) {
    const scope = requireWorkspace(raw);
    const decision = await this.requireDecision(scope, decisionId);
    const assembled = await this.assemble(scope, decision);
    return {
      ...assembled,
      contract: DECISION_ACTION_INTELLIGENCE_CONTRACT,
      businessRisk: BUSINESS_RISK_CONTRACT,
      disclaimer: DISCLAIMER,
    };
  }

  async comparison(raw: { tenantId: string; workspaceId?: string; userId: string }, decisionId: string) {
    const detail = await this.detail(raw, decisionId);
    return detail.comparison;
  }

  async brief(raw: { tenantId: string; workspaceId?: string; userId: string }, decisionId: string, opts: { includeAi?: boolean } = {}) {
    const detail = await this.detail(raw, decisionId);
    const scope = requireWorkspace(raw);
    let narrative: AiDailyBriefNarrative | null = null;
    if (opts.includeAi) narrative = await this.explainDecision(scope, detail.brief);
    await this.emit(scope, "business_os.decision.brief_prepared", { decisionId, ai: Boolean(narrative && !narrative.unavailableReason) });
    return { deterministic: detail.brief, narrative, disclaimer: DISCLAIMER };
  }

  async summary(raw: { tenantId: string; workspaceId?: string; userId: string }) {
    const scope = requireWorkspace(raw);
    const metrics = await this.computeMetrics(scope);
    const queue = await this.queue(scope);
    const actions = await this.ownerCommand.repository.listActions(scope);
    const decisions = await this.ownerCommand.repository.listDecisions(scope);
    const actionIntel = computeActionIntelligence({ actions, decisions });
    const kpis = (await this.ownerCommand.repository.listKpis(scope)).filter((k) => k.provenance?.domain === "decision");
    return {
      ...metrics,
      queue,
      actionIntelligence: actionIntel,
      criticalPending: queue.filter((row) => row.status === "pending" && (row.priority.priority === "critical" || row.priority.priority === "urgent")),
      overdue: queue.filter((row) => row.status === "pending" && row.dueAt && new Date(row.dueAt).getTime() < Date.now()),
      missingEvidence: queue.filter((row) => row.status === "pending" && (row.evidenceCompletenessBps === "0" || row.evidenceCompletenessBps == null)),
      blockedDecisionActions: actionIntel.blocked.filter((a) => a.decisionId),
      outcomeReviewsDue: queue.filter((row) => {
        const decision = decisions.find((d) => d.id === row.id);
        return Boolean(decision?.reviewAt && new Date(decision.reviewAt).getTime() < Date.now() && decision.status === "approved");
      }),
      kpis,
      health: computeBusinessHealth(kpis),
      contract: DECISION_ACTION_INTELLIGENCE_CONTRACT,
      businessRisk: BUSINESS_RISK_CONTRACT,
      disclaimer: DISCLAIMER,
      generatedAt: new Date().toISOString(),
    };
  }

  async explain(raw: { tenantId: string; workspaceId?: string; userId: string }): Promise<AiDailyBriefNarrative> {
    const scope = requireWorkspace(raw);
    const summary = await this.summary(scope);
    return this.explainDecision(scope, {
      kind: "summary",
      pending: summary.pendingDecisions,
      overdue: summary.overdueDecisions,
      missingEvidence: summary.decisionsWithoutEvidence,
      blocked: summary.blockedActions,
    });
  }

  private async explainDecision(scope: OwnerCommandScope, evidence: unknown): Promise<AiDailyBriefNarrative> {
    try {
      const policy = await this.kernel.intelligence.policies.evaluate({
        tenantId: scope.tenantId,
        operatingSystem: "business",
        intent: "decision_action.explain",
        simulation: false,
      });
      if (policy.allowed === false) return emptyNarrative("policy_denied");
      const response = await this.kernel.aiDirector.run({
        tenantId: scope.tenantId,
        workspaceId: scope.workspaceId,
        userId: scope.userId,
        message:
          "Summarise deterministic decision intelligence for an owner. Do not invent evidence or quantitative impacts. Do not approve, reject, or execute external actions. Do not expose chain-of-thought.",
        context: {
          evidence: {
            kind: "business_os.decision.evidence",
            payload: evidence,
            instructions: [
              "Use only structured evidence.",
              "Do not fabricate evidence or quantitative impacts.",
              "Do not choose a final option authoritatively.",
              "Do not approve or execute.",
              "Unknown stays unknown.",
              "Do not expose chain-of-thought.",
            ],
          },
        },
      });
      const text = response.message?.trim() ?? "";
      if (!text) return emptyNarrative("empty_ai_response");
      await this.auditMutation(scope, "create", "business_os_decision_ai_brief", scope.workspaceId, {
        generatedBy: "platform_ai_director",
      });
      return {
        text,
        generatedAt: new Date().toISOString(),
        generatedBy: "platform_ai_director",
        modelProvenance:
          [response.run.model_provider, response.run.model_name].filter(Boolean).join("/") || "platform-ai-director",
        evidenceRefs: [],
        advisory: true,
      };
    } catch {
      return emptyNarrative("ai_director_unavailable");
    }
  }

  async seedDemo(raw: { tenantId: string; workspaceId?: string; userId: string }) {
    const scope = requireWorkspace(raw);
    await this.ownerCommand.seedDemo(scope);
    const result = await seedDecisionActionDemo(this.repository, this.ownerCommand.repository, scope);
    await this.publishToOwnerCommand(scope);
    await this.auditMutation(scope, "create", "business_os_demo", "decision-action", {
      fixture: "bos-8-decision-action",
    });
    return result;
  }

  private async computeMetrics(scope: OwnerCommandScope) {
    const [decisions, actions, contexts, evidence, outcomes] = await Promise.all([
      this.ownerCommand.repository.listDecisions(scope),
      this.ownerCommand.repository.listActions(scope),
      this.repository.listContexts(scope),
      this.repository.listEvidence(scope),
      this.repository.listOutcomes(scope),
    ]);
    const asOf = Date.now();
    const pending = decisions.filter((d) => d.status === "pending");
    const contextByDecision = new Map(contexts.map((c) => [c.decisionId, c]));
    const evidenceByDecision = new Set(evidence.map((e) => e.decisionId));
    const overdue = pending.filter((d) => {
      const due = contextByDecision.get(d.id)?.dueAt ?? d.reviewAt;
      return Boolean(due && new Date(due).getTime() < asOf);
    });
    const queue = [];
    for (const decision of pending) {
      const ctx = contextByDecision.get(decision.id);
      if (ctx?.urgency === "critical" || ctx?.urgency === "urgent") queue.push(decision);
    }
    const withoutEvidence = pending.filter((d) => !evidenceByDecision.has(d.id));
    const intel = computeActionIntelligence({ actions, decisions });
    const approvedOrClosed = decisions.filter((d) => d.status === "approved" || d.status === "closed");
    const measured = approvedOrClosed.filter((d) =>
      outcomes.some((o) => o.decisionId === d.id && o.status !== "pending" && o.status !== "measuring" && o.status !== "cancelled"),
    );
    const effectivenessCovered = approvedOrClosed.filter((d) =>
      outcomes.some((o) => o.decisionId === d.id && o.status !== "pending" && o.status !== "measuring"),
    );
    return {
      pendingDecisions: pending.length,
      overdueDecisions: overdue.length,
      criticalDecisions: queue.length,
      decisionsWithoutEvidence: withoutEvidence.length,
      decisionCycleTimeDays: meanCycleTimeDays(decisions),
      actionCompletionRateBps: actionCompletionRateBps(actions),
      overdueActions: intel.overdue.length,
      blockedActions: intel.blocked.length,
      outcomeMeasurementCoverageBps: approvedOrClosed.length
        ? Math.round((measured.length / approvedOrClosed.length) * 10000)
        : null,
      decisionEffectivenessCoverageBps: approvedOrClosed.length
        ? Math.round((effectivenessCovered.length / approvedOrClosed.length) * 10000)
        : null,
      containsDemoData: decisions.some((d) => d.isDemo) || actions.some((a) => a.isDemo),
    };
  }

  private async publishToOwnerCommand(scope: OwnerCommandScope) {
    const metrics = await this.computeMetrics(scope);
    const isDemo = metrics.containsDemoData;
    const values: Record<BusinessDecisionKpiKey, number | null> = {
      pending_decisions: metrics.pendingDecisions,
      overdue_decisions: metrics.overdueDecisions,
      critical_decisions: metrics.criticalDecisions,
      decisions_without_evidence: metrics.decisionsWithoutEvidence,
      decision_cycle_time: metrics.decisionCycleTimeDays,
      action_completion_rate: metrics.actionCompletionRateBps,
      overdue_actions: metrics.overdueActions,
      blocked_actions: metrics.blockedActions,
      outcome_measurement_coverage: metrics.outcomeMeasurementCoverageBps,
      decision_effectiveness_coverage: metrics.decisionEffectivenessCoverageBps,
    };
    const extras: Record<string, { warning?: number; critical?: number }> = {
      overdue_decisions: { warning: 1, critical: 3 },
      critical_decisions: { warning: 1, critical: 2 },
      decisions_without_evidence: { warning: 1, critical: 3 },
      overdue_actions: { warning: 1, critical: 3 },
      blocked_actions: { warning: 1, critical: 2 },
      outcome_measurement_coverage: { warning: 7000, critical: 4000 },
      decision_effectiveness_coverage: { warning: 7000, critical: 4000 },
    };
    for (const key of BUSINESS_DECISION_KPI_KEYS) {
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
        sourceRef: "decision_action",
        provenance: { domain: "decision", live: false },
        isDemo,
      });
    }

    const decisions = await this.ownerCommand.repository.listDecisions(scope);
    const actions = await this.ownerCommand.repository.listActions(scope);
    const existing = await this.ownerCommand.repository.listSignals(scope);
    const recs = await this.ownerCommand.repository.listRecommendations(scope);
    const asOf = new Date().toISOString();
    for (const decision of decisions) {
      const assembled = await this.assemble(scope, decision);
      const sameDomain = decisions.filter((d) => {
        return assembled.context?.domain && d.id !== decision.id;
      });
      const drafts = detectDecisionSignals({
        decision,
        context: assembled.context,
        evidence: assembled.evidence,
        actions,
        outcome: assembled.outcome,
        effectiveness: assembled.effectiveness,
        asOf,
        categoryRepeats: sameDomain.length,
        repeatSampleThreshold: assembled.settings.ineffectiveRepeatSample ?? BUSINESS_DECISION_DEFAULT_THRESHOLDS.ineffectiveRepeatSample,
      });
      for (const draft of drafts) {
        const already = existing.some((s) => s.type === draft.type && s.title === draft.title && s.status === "open");
        if (already) continue;
        const created = await this.ownerCommand.repository.insertSignal(scope, {
          type: draft.type,
          severity: draft.severity,
          title: draft.title,
          summary: draft.summary,
          sourceType: isDemo ? "demo" : "derived",
          sourceRef: "decision_action",
          evidence: draft.evidence,
          provenance: draft.provenance,
          detectedAt: asOf,
          status: "open",
          businessImpact: draft.businessImpact,
          isDemo,
          createdBy: scope.userId,
        });
        existing.push(created);
        await this.emit(scope, "business_os.signal.created", { id: created.id, type: created.type });
        const recAlready = recs.some((r) => r.title === draft.recommendationTitle && r.status === "proposed");
        if (recAlready) continue;
        const createdRec = await this.ownerCommand.repository.insertRecommendation(scope, {
          signalId: created.id,
          title: draft.recommendationTitle,
          recommendationText: draft.recommendationText,
          rationaleSummary: draft.summary,
          expectedImpact: "Advisory only.",
          confidence: "medium",
          evidenceRefs: draft.evidence,
          status: "proposed",
          generatedBy: "deterministic_rule",
          isDemo,
          createdBy: scope.userId,
        });
        recs.push(createdRec);
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
