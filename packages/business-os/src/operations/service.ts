import type { SupabaseClient } from "@rtb/database";
import type { PlatformKernel } from "@rtb/platform-kernel";
import { AuditService } from "@rtb/platform-core";
import type {
  AiDailyBriefNarrative,
  BusinessCustomerOperationsEvidence,
  BusinessKpi,
  BusinessKpiCategory,
  BusinessWorkActionLinkIngestInput,
  BusinessWorkCapacityIngestInput,
  BusinessWorkCostIngestInput,
  BusinessWorkHealth,
  BusinessWorkItem,
  BusinessWorkItemIngestInput,
  BusinessWorkMilestoneIngestInput,
} from "@rtb/types";
import {
  BUSINESS_OPERATIONS_DEFAULT_THRESHOLDS,
  BUSINESS_OPERATIONS_KPI_KEYS,
  BUSINESS_OS_EVENT_TYPES,
  BUSINESS_WORK_COST_TYPES,
  BUSINESS_WORK_STATUSES,
  BUSINESS_WORK_TYPES,
  BUSINESS_WORK_VALUE_STATES,
  BUSINESS_WORK_MILESTONE_STATUSES,
  BUSINESS_WORK_CAPACITY_DIMENSIONS,
} from "@rtb/types";
import { computeBusinessHealth } from "../owner-command/health";
import type { OwnerCommandService, OwnerCommandScope } from "../owner-command/service";
import { CustomerIntelligenceService } from "../customers/service";
import { GrowthIntelligenceService } from "../growth/service";
import { ProfitIntelligenceService } from "../profit/service";
import { parseMinor, toSafeNumber } from "../finance/money";
import { computeCapacityMetrics } from "./capacity";
import { computeCostProgress, mixedCurrency, sumFacts } from "./cost-progress";
import {
  OPERATIONS_DEMO_CAPACITY,
  OPERATIONS_DEMO_COSTS,
  OPERATIONS_DEMO_FIXTURE,
  OPERATIONS_DEMO_MILESTONES,
  OPERATIONS_DEMO_WORK,
} from "./demo";
import {
  DECISION_ACTION_INTELLIGENCE_CONTRACT,
  ENGINEERING_PROJECT_LINK_CONTRACT,
  decisionActionIntelligenceStatus,
} from "./extensions";
import { computeWorkHealth } from "./health";
import { asJson, minorCol, WorkOperationsRepository } from "./repository";
import { computeWorkProgress } from "./progress";
import { isMilestoneOverdue, isOpenWorkStatus, isWorkOverdue, scheduleVarianceDays } from "./schedule";
import { detectOperationalSignals } from "./signals";

function requireWorkspace(scope: { tenantId: string; workspaceId?: string; userId: string }): OwnerCommandScope {
  if (!scope.workspaceId) throw new Error("workspace_not_assigned");
  return { tenantId: scope.tenantId, workspaceId: scope.workspaceId, userId: scope.userId };
}

function integerMetric(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  return toSafeNumber(BigInt(value));
}

const DISCLAIMER =
  "Work & Operations is business execution context. Progress and capacity are never invented. Actual, forecast, budget, and derived costs stay distinct. Advisory only — no autonomous assignment or external project-system writes.";

const OPERATIONS_KPI_META: Record<
  (typeof BUSINESS_OPERATIONS_KPI_KEYS)[number],
  { name: string; category: BusinessKpiCategory; unit: string; direction: BusinessKpi["direction"] }
> = {
  active_work: { name: "Active work", category: "operations", unit: "count", direction: "higher_is_better" },
  overdue_work: { name: "Overdue work", category: "operations", unit: "count", direction: "lower_is_better" },
  blocked_work: { name: "Blocked work", category: "operations", unit: "count", direction: "lower_is_better" },
  milestone_on_time_rate: {
    name: "Milestone on-time rate",
    category: "operations",
    unit: "bps",
    direction: "higher_is_better",
  },
  work_completion_rate: {
    name: "Work completion rate",
    category: "operations",
    unit: "bps",
    direction: "higher_is_better",
  },
  cost_progress_variance_count: {
    name: "Cost vs progress exceptions",
    category: "operations",
    unit: "count",
    direction: "lower_is_better",
  },
  capacity_utilization: {
    name: "Capacity utilization",
    category: "operations",
    unit: "bps",
    direction: "lower_is_better",
  },
  overcommitted_capacity: {
    name: "Overcommitted capacity",
    category: "operations",
    unit: "count",
    direction: "lower_is_better",
  },
  operational_data_coverage: {
    name: "Operational data coverage",
    category: "operations",
    unit: "bps",
    direction: "higher_is_better",
  },
};

export class WorkOperationsService {
  readonly repository: WorkOperationsRepository;

  constructor(
    private readonly supabase: SupabaseClient,
    private readonly kernel: PlatformKernel,
    private readonly audit: AuditService,
    private readonly ownerCommand: OwnerCommandService,
    private readonly customerIntelligence: CustomerIntelligenceService,
    private readonly growthIntelligence: GrowthIntelligenceService,
    private readonly profitIntelligence: ProfitIntelligenceService,
  ) {
    this.repository = new WorkOperationsRepository(supabase);
  }

  allocateResourcesAutonomously(): never {
    throw new Error("autonomous_assignment_forbidden");
  }

  writeExternalProjectSystem(): never {
    throw new Error("external_project_write_forbidden");
  }

  approveCompletionAutonomously(): never {
    throw new Error("autonomous_completion_forbidden");
  }

  engineeringLink() {
    return ENGINEERING_PROJECT_LINK_CONTRACT;
  }

  decisionAction() {
    return decisionActionIntelligenceStatus();
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

  async ingestWork(raw: { tenantId: string; workspaceId?: string; userId: string }, input: BusinessWorkItemIngestInput) {
    const scope = requireWorkspace(raw);
    if (!input.name?.trim()) throw new Error("work_name_required");
    if (!input.reference?.trim()) throw new Error("work_name_required");
    if (!input.sourceType) throw new Error("invalid_source_type");
    if (!BUSINESS_WORK_TYPES.includes(input.workType)) throw new Error("invalid_work_type");
    const status = input.status ?? "planned";
    if (!BUSINESS_WORK_STATUSES.includes(status)) throw new Error("invalid_work_status");
    const currency = input.currency.trim().toUpperCase();
    if (currency.length !== 3) throw new Error("currency_required");
    const scale = input.scale ?? 2;
    if (!Number.isInteger(scale) || scale < 0 || scale > 6) throw new Error("invalid_scale");
    const progressBps = minorCol(input.progressBps ?? null);
    if (progressBps !== null) {
      const n = BigInt(progressBps);
      if (n < 0n || n > 10000n) throw new Error("invalid_progress_bps");
    }

    const existing =
      input.sourceRef != null && input.sourceRef !== ""
        ? await this.repository.getWorkBySourceRef(scope, input.sourceType, input.sourceRef)
        : null;
    const lastStatusAt =
      input.lastStatusAt ??
      (existing && existing.status === status ? existing.lastStatusAt : new Date().toISOString());
    const payload = {
      tenant_id: scope.tenantId,
      workspace_id: scope.workspaceId,
      reference: input.reference.trim(),
      name: input.name.trim(),
      description: input.description ?? null,
      work_type: input.workType,
      customer_id: input.customerId ?? null,
      linked_opportunity_id: input.linkedOpportunityId ?? null,
      linked_proposal_id: input.linkedProposalId ?? null,
      linked_engineering_project_id: input.linkedEngineeringProjectId ?? null,
      linked_engineering_project_ref: input.linkedEngineeringProjectRef ?? null,
      owner_label: input.owner ?? null,
      status,
      planned_start: input.plannedStart ?? null,
      planned_finish: input.plannedFinish ?? null,
      actual_start: input.actualStart ?? null,
      actual_finish: input.actualFinish ?? null,
      progress_bps: progressBps,
      progress_source: progressBps !== null ? "user_supplied" : "unknown",
      currency,
      scale,
      contracted_value_minor: minorCol(input.contractedValueMinor ?? null),
      budget_cost_minor: minorCol(input.budgetCostMinor ?? null),
      last_status_at: lastStatusAt,
      source_type: input.sourceType,
      source_ref: input.sourceRef,
      provenance: asJson({
        ...(input.provenance ?? {}),
        domain: "operations",
        engineeringLinkMode: ENGINEERING_PROJECT_LINK_CONTRACT.mode,
        writesEngineeringOs: false,
      }),
      is_demo: input.isDemo ?? false,
      created_by: scope.userId,
    };

    const work = existing
      ? await this.repository.updateWork(scope, existing.id, payload)
      : await this.repository.insertWork(payload);

    await this.audit.log({
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
      userId: scope.userId,
      action: existing ? "update" : "create",
      resourceType: "business_os_work_item",
      resourceId: work.id,
      metadata: {
        status: work.status,
        idempotent: Boolean(existing),
        engineeringLinked: Boolean(work.linkedEngineeringProjectId || work.linkedEngineeringProjectRef),
      },
    });
    await this.emit(scope, existing ? "business_os.operations.work_updated" : "business_os.operations.work_created", {
      id: work.id,
      status: work.status,
    });
    if (work.status === "completed") {
      await this.emit(scope, "business_os.operations.work_completed", { id: work.id });
    }
    await this.publishToOwnerCommand(scope);
    return { work, created: !existing };
  }

  async ingestMilestone(
    raw: { tenantId: string; workspaceId?: string; userId: string },
    input: BusinessWorkMilestoneIngestInput,
  ) {
    const scope = requireWorkspace(raw);
    if (!input.workId) throw new Error("work_id_required");
    if (!input.name?.trim()) throw new Error("work_name_required");
    if (!input.sourceType) throw new Error("invalid_source_type");
    const status = input.status ?? "not_started";
    if (!BUSINESS_WORK_MILESTONE_STATUSES.includes(status)) throw new Error("invalid_milestone_status");
    const work = await this.repository.getWork(scope, input.workId);
    if (!work) throw new Error("Work not found");
    const weightBps = minorCol(input.weightBps ?? null);
    const existing =
      input.sourceRef != null && input.sourceRef !== ""
        ? await this.repository.getMilestoneBySourceRef(scope, input.sourceType, input.sourceRef)
        : null;
    const payload = {
      tenant_id: scope.tenantId,
      workspace_id: scope.workspaceId,
      work_id: input.workId,
      name: input.name.trim(),
      due_at: input.dueAt ?? null,
      completed_at: input.completedAt ?? null,
      status,
      weight_bps: weightBps,
      owner_label: input.owner ?? null,
      source_type: input.sourceType,
      source_ref: input.sourceRef,
      provenance: asJson({ ...(input.provenance ?? {}), domain: "operations" }),
      is_demo: input.isDemo ?? false,
      created_by: scope.userId,
    };
    const milestone = existing
      ? await this.repository.updateMilestone(scope, existing.id, payload)
      : await this.repository.insertMilestone(payload);
    await this.audit.log({
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
      userId: scope.userId,
      action: existing ? "update" : "create",
      resourceType: "business_os_work_milestone",
      resourceId: milestone.id,
      metadata: { workId: work.id, status: milestone.status, idempotent: Boolean(existing) },
    });
    await this.emit(scope, "business_os.operations.milestone_updated", { id: milestone.id, workId: work.id });
    await this.refreshDerivedProgress(scope, work.id);
    await this.publishToOwnerCommand(scope);
    return { milestone, created: !existing };
  }

  async linkAction(
    raw: { tenantId: string; workspaceId?: string; userId: string },
    input: BusinessWorkActionLinkIngestInput,
  ) {
    const scope = requireWorkspace(raw);
    if (!input.workId || !input.actionId) throw new Error("work_id_required");
    if (!input.sourceType) throw new Error("invalid_source_type");
    const work = await this.repository.getWork(scope, input.workId);
    if (!work) throw new Error("Work not found");
    const existing =
      input.sourceRef != null && input.sourceRef !== ""
        ? await this.repository.getActionLinkBySourceRef(scope, input.sourceType, input.sourceRef)
        : null;
    if (existing) return { link: existing, created: false };
    const link = await this.repository.insertActionLink({
      tenant_id: scope.tenantId,
      workspace_id: scope.workspaceId,
      work_id: input.workId,
      action_id: input.actionId,
      source_type: input.sourceType,
      source_ref: input.sourceRef,
      provenance: asJson({ ...(input.provenance ?? {}), domain: "operations", reusesBos1Actions: true }),
      is_demo: input.isDemo ?? false,
      created_by: scope.userId,
    });
    await this.audit.log({
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
      userId: scope.userId,
      action: "create",
      resourceType: "business_os_work_action_link",
      resourceId: link.id,
      metadata: { workId: work.id, actionId: input.actionId },
    });
    return { link, created: true };
  }

  async ingestCost(
    raw: { tenantId: string; workspaceId?: string; userId: string },
    input: BusinessWorkCostIngestInput,
  ) {
    const scope = requireWorkspace(raw);
    if (!input.workId) throw new Error("work_id_required");
    if (!input.periodStart || !input.periodEnd) throw new Error("invalid_period");
    if (input.periodEnd < input.periodStart) throw new Error("invalid_period");
    if (!input.sourceType) throw new Error("invalid_source_type");
    if (!BUSINESS_WORK_COST_TYPES.includes(input.costType)) throw new Error("invalid_cost_type");
    const valueState = input.valueState ?? "actual";
    if (!BUSINESS_WORK_VALUE_STATES.includes(valueState)) throw new Error("invalid_value_state");
    const currency = input.currency.trim().toUpperCase();
    if (currency.length !== 3) throw new Error("currency_required");
    const scale = input.scale ?? 2;
    if (!Number.isInteger(scale) || scale < 0 || scale > 6) throw new Error("invalid_scale");
    const amountMinor = minorCol(input.amountMinor);
    if (amountMinor === null) throw new Error("monetary_value_not_integer");
    const work = await this.repository.getWork(scope, input.workId);
    if (!work) throw new Error("Work not found");
    const existing =
      input.sourceRef != null && input.sourceRef !== ""
        ? await this.repository.getCostFactBySourceRef(scope, input.sourceType, input.sourceRef)
        : null;
    const payload = {
      tenant_id: scope.tenantId,
      workspace_id: scope.workspaceId,
      work_id: input.workId,
      period_start: input.periodStart,
      period_end: input.periodEnd,
      cost_type: input.costType,
      amount_minor: amountMinor,
      currency,
      scale,
      value_state: valueState,
      source_type: input.sourceType,
      source_ref: input.sourceRef,
      provenance: asJson({
        ...(input.provenance ?? {}),
        domain: "operations",
        valueState,
        payrollCalculated: false,
        labourRateInvented: false,
      }),
      is_demo: input.isDemo ?? false,
      created_by: scope.userId,
    };
    const fact = existing
      ? await this.repository.updateCostFact(scope, existing.id, payload)
      : await this.repository.insertCostFact(payload);
    await this.audit.log({
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
      userId: scope.userId,
      action: existing ? "update" : "create",
      resourceType: "business_os_work_cost_fact",
      resourceId: fact.id,
      metadata: { workId: work.id, valueState, idempotent: Boolean(existing) },
    });
    await this.emit(scope, "business_os.operations.cost_fact_ingested", {
      id: fact.id,
      workId: work.id,
      valueState,
    });
    await this.refreshWorkActualCostAndProfit(scope, work);
    await this.publishToOwnerCommand(scope);
    return { fact, created: !existing };
  }

  async ingestCapacity(
    raw: { tenantId: string; workspaceId?: string; userId: string },
    input: BusinessWorkCapacityIngestInput,
  ) {
    const scope = requireWorkspace(raw);
    if (!input.sourceType) throw new Error("invalid_source_type");
    if (!BUSINESS_WORK_CAPACITY_DIMENSIONS.includes(input.dimensionType)) throw new Error("invalid_source_type");
    if (!input.periodStart || !input.periodEnd) throw new Error("invalid_period");
    const metrics = computeCapacityMetrics({
      availableHoursMinor: input.availableHoursMinor,
      committedHoursMinor: input.committedHoursMinor,
    });
    const existing =
      input.sourceRef != null && input.sourceRef !== ""
        ? await this.repository.getCapacityFactBySourceRef(scope, input.sourceType, input.sourceRef)
        : null;
    const payload = {
      tenant_id: scope.tenantId,
      workspace_id: scope.workspaceId,
      dimension_type: input.dimensionType,
      dimension_ref: input.dimensionRef,
      dimension_name: input.dimensionName,
      work_id: input.workId ?? null,
      period_start: input.periodStart,
      period_end: input.periodEnd,
      available_hours_minor: minorCol(input.availableHoursMinor ?? null),
      committed_hours_minor: minorCol(input.committedHoursMinor ?? null),
      utilization_bps: metrics.utilizationBps,
      capacity_status: metrics.capacityStatus,
      source_type: input.sourceType,
      source_ref: input.sourceRef,
      provenance: asJson({
        ...(input.provenance ?? {}),
        domain: "operations",
        unknownReasons: metrics.unknownReasons,
        fabricated: false,
      }),
      is_demo: input.isDemo ?? false,
      created_by: scope.userId,
    };
    const fact = existing
      ? await this.repository.updateCapacityFact(scope, existing.id, payload)
      : await this.repository.insertCapacityFact(payload);
    await this.audit.log({
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
      userId: scope.userId,
      action: existing ? "update" : "create",
      resourceType: "business_os_work_capacity_fact",
      resourceId: fact.id,
      metadata: { capacityStatus: fact.capacityStatus, idempotent: Boolean(existing) },
    });
    await this.emit(scope, "business_os.operations.capacity_updated", { id: fact.id, status: fact.capacityStatus });
    await this.publishToOwnerCommand(scope);
    return { fact, created: !existing };
  }

  async listWork(raw: { tenantId: string; workspaceId?: string; userId: string }) {
    const scope = requireWorkspace(raw);
    const work = await this.repository.listWork(scope);
    const customers = await this.customerIntelligence.repository.listCustomers(scope);
    const byCustomer = new Map(customers.map((row) => [row.id, row.organisationName]));
    const rows = [];
    for (const item of work) {
      const snapshot = await this.evaluateWork(scope, item);
      rows.push({
        ...item,
        customerName: item.customerId ? byCustomer.get(item.customerId) ?? null : null,
        health: snapshot.health.status,
        progress: snapshot.progress,
        freshness: item.lastStatusAt,
      });
    }
    return { work: rows };
  }

  async detail(raw: { tenantId: string; workspaceId?: string; userId: string }, workId: string) {
    const scope = requireWorkspace(raw);
    const work = await this.repository.getWork(scope, workId);
    if (!work) throw new Error("Work not found");
    const snapshot = await this.evaluateWork(scope, work);
    const customer = work.customerId
      ? await this.customerIntelligence.repository.getCustomerById(scope, work.customerId)
      : null;
    const actions = await this.ownerCommand.repository.listActions(scope);
    const linkedActions = snapshot.actionLinks.map((link) => ({
      ...link,
      action: actions.find((row) => row.id === link.actionId) ?? null,
    }));
    return {
      work,
      customer,
      milestones: snapshot.milestones,
      actions: linkedActions,
      costs: snapshot.costs,
      capacity: snapshot.capacity,
      progress: snapshot.progress,
      costProgress: snapshot.costProgress,
      health: snapshot.health,
      scheduleVarianceDays: snapshot.scheduleVarianceDays,
      engineering: {
        contract: ENGINEERING_PROJECT_LINK_CONTRACT,
        linkedEngineeringProjectId: work.linkedEngineeringProjectId,
        linkedEngineeringProjectRef: work.linkedEngineeringProjectRef,
      },
      decisionAction: DECISION_ACTION_INTELLIGENCE_CONTRACT,
      dataQuality: {
        missingProgress: snapshot.progress.progressBps == null,
        missingCost: snapshot.costs.filter((c) => c.valueState === "actual").length === 0,
        missingCapacity: snapshot.capacity.length === 0,
        mixedCurrencyActual: mixedCurrency(snapshot.costs, "actual"),
        unknownHealthComponents: snapshot.health.missingComponents,
      },
      disclaimer: DISCLAIMER,
    };
  }

  async healthFor(raw: { tenantId: string; workspaceId?: string; userId: string }, workId: string): Promise<BusinessWorkHealth> {
    const detail = await this.detail(raw, workId);
    return detail.health;
  }

  async summary(raw: { tenantId: string; workspaceId?: string; userId: string }) {
    const scope = requireWorkspace(raw);
    const metrics = await this.computeMetrics(scope);
    const kpis = (await this.ownerCommand.repository.listKpis(scope)).filter((k) => k.provenance?.domain === "operations");
    return {
      ...metrics,
      kpis,
      health: computeBusinessHealth(kpis),
      engineering: ENGINEERING_PROJECT_LINK_CONTRACT,
      decisionAction: DECISION_ACTION_INTELLIGENCE_CONTRACT,
      disclaimer: DISCLAIMER,
      generatedAt: new Date().toISOString(),
    };
  }

  async customerEvidence(
    raw: { tenantId: string; workspaceId?: string; userId: string },
    customerId: string,
  ): Promise<BusinessCustomerOperationsEvidence> {
    const scope = requireWorkspace(raw);
    const work = (await this.repository.listWork(scope)).filter((row) => row.customerId === customerId);
    if (!work.length) {
      return { available: true, activeWorkCount: 0, completedWorkCount: 0, atRiskWorkCount: 0, work: [], signalTypes: [] };
    }
    const rows = [];
    let atRisk = 0;
    for (const item of work) {
      const snapshot = await this.evaluateWork(scope, item);
      if (snapshot.health.status === "at_risk" || snapshot.health.status === "critical") atRisk += 1;
      rows.push({
        id: item.id,
        reference: item.reference,
        name: item.name,
        status: item.status,
        progressBps: snapshot.progress.progressBps,
        health: snapshot.health.status,
        plannedFinish: item.plannedFinish ?? null,
      });
    }
    return {
      available: true,
      activeWorkCount: work.filter((row) => isOpenWorkStatus(row.status)).length,
      completedWorkCount: work.filter((row) => row.status === "completed").length,
      atRiskWorkCount: atRisk,
      work: rows,
      signalTypes: ["operations.work_overdue", "operations.work_blocked", "operations.customer_work_at_risk"],
    };
  }

  async explain(raw: { tenantId: string; workspaceId?: string; userId: string }): Promise<AiDailyBriefNarrative> {
    const scope = requireWorkspace(raw);
    const summary = await this.summary(scope);
    try {
      const policy = await this.kernel.intelligence.policies.evaluate({
        tenantId: scope.tenantId,
        operatingSystem: "business",
        intent: "work_operations.explain",
        simulation: false,
      });
      if (policy.allowed === false) return emptyNarrative("policy_denied");
      const response = await this.kernel.aiDirector.run({
        tenantId: scope.tenantId,
        workspaceId: scope.workspaceId,
        userId: scope.userId,
        message:
          "Summarise deterministic work and operations intelligence for an owner. Do not invent progress or costs. Do not assign staff or write to external project systems.",
        context: {
          evidence: {
            kind: "business_os.operations.evidence",
            activeWork: summary.activeWorkCount,
            overdueWork: summary.overdueWorkCount,
            blockedWork: summary.blockedWorkCount,
            costProgressExceptions: summary.costProgressVarianceCount,
            instructions: [
              "Use only structured evidence.",
              "Do not invent progress, costs, or labour rates.",
              "Do not assign staff autonomously.",
              "Do not claim final overrun certainty.",
              "Unknown evidence stays unknown.",
            ],
          },
        },
      });
      const text = response.message?.trim() ?? "";
      if (!text) return emptyNarrative("empty_ai_response");
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
    const created: string[] = [];
    for (const item of OPERATIONS_DEMO_WORK) {
      const customerRef = typeof item.provenance?.customerSourceRef === "string" ? item.provenance.customerSourceRef : null;
      const opportunityRef =
        typeof item.provenance?.opportunitySourceRef === "string" ? item.provenance.opportunitySourceRef : null;
      const customer = customerRef
        ? await this.customerIntelligence.repository.getCustomerBySourceRef(scope, "demo", customerRef)
        : null;
      const opportunity = opportunityRef
        ? await this.growthIntelligence.repository.findOpportunityBySourceRef(scope, opportunityRef)
        : null;
      const lastStatusAt = item.provenance?.stale ? "2026-07-01T00:00:00.000Z" : undefined;
      const result = await this.ingestWork(scope, {
        ...item,
        customerId: customer?.id ?? null,
        linkedOpportunityId: opportunity?.id ?? null,
        lastStatusAt,
      });
      created.push(result.work.id);
    }

    const byRef = new Map(
      (await this.repository.listWork(scope))
        .filter((row) => row.sourceRef)
        .map((row) => [row.sourceRef as string, row]),
    );
    for (const milestone of OPERATIONS_DEMO_MILESTONES) {
      const work = byRef.get(milestone.workSourceRef);
      if (!work) continue;
      await this.ingestMilestone(scope, { ...milestone, workId: work.id });
    }
    for (const cost of OPERATIONS_DEMO_COSTS) {
      const work = byRef.get(cost.workSourceRef);
      if (!work) continue;
      await this.ingestCost(scope, { ...cost, workId: work.id });
    }
    for (const capacity of OPERATIONS_DEMO_CAPACITY) {
      const workId =
        capacity.dimensionType === "work_item" ? byRef.get(capacity.dimensionRef)?.id ?? null : capacity.workId ?? null;
      await this.ingestCapacity(scope, { ...capacity, workId });
    }

    const metro = byRef.get("bos-7-demo-work-metro");
    if (metro) {
      const existingLink = await this.repository.getActionLinkBySourceRef(
        scope,
        "demo",
        "bos-7-demo-action-metro-punch",
      );
      if (!existingLink) {
        const action = await this.ownerCommand.repository.insertAction(scope, {
          title: "Close Metro punch-list",
          status: "open",
          priority: "medium",
          completionEvidence: { fixture: OPERATIONS_DEMO_FIXTURE },
          isDemo: true,
          createdBy: scope.userId,
        });
        await this.linkAction(scope, {
          workId: metro.id,
          actionId: action.id,
          sourceType: "demo",
          sourceRef: "bos-7-demo-action-metro-punch",
          isDemo: true,
          provenance: { fixture: OPERATIONS_DEMO_FIXTURE, unresolvedOnCompletedWork: true },
        });
      }
    }

    await this.audit.log({
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
      userId: scope.userId,
      action: "create",
      resourceType: "business_os_work_demo",
      resourceId: scope.workspaceId,
      metadata: { fixture: OPERATIONS_DEMO_FIXTURE, count: created.length },
    });
    return { created: created.length, fixture: OPERATIONS_DEMO_FIXTURE, isDemo: true };
  }

  private async refreshDerivedProgress(scope: OwnerCommandScope, workId: string) {
    const work = await this.repository.getWork(scope, workId);
    if (!work) return;
    if (work.progressBps !== null) return;
    const milestones = await this.repository.listMilestones(scope, workId);
    const progress = computeWorkProgress(work, milestones);
    if (progress.method === "weighted_milestones" && progress.progressBps !== null) {
      await this.repository.updateWork(scope, workId, {
        progress_source: "weighted_milestones",
      });
    }
  }

  private async refreshWorkActualCostAndProfit(scope: OwnerCommandScope, work: BusinessWorkItem) {
    const facts = await this.repository.listCostFacts(scope, work.id);
    const mixed = mixedCurrency(facts, "actual");
    const actual = mixed ? null : sumFacts(facts, "actual", work.currency, work.scale);
    await this.repository.updateWork(scope, work.id, {
      actual_cost_minor: actual?.toString() ?? null,
    });
    if (actual === null || mixed) return;
    const periodEnd = facts.filter((row) => row.valueState === "actual").sort((a, b) => b.periodEnd.localeCompare(a.periodEnd))[0];
    if (!periodEnd) return;
    try {
      await this.profitIntelligence.ingestFact(scope, {
      periodStart: periodEnd.periodStart,
      periodEnd: periodEnd.periodEnd,
      dimensionType: "work",
      dimensionId: work.id,
      dimensionRef: work.reference,
      dimensionName: work.name,
      revenueMinor: work.contractedValueMinor,
      directCostMinor: actual.toString(),
      currency: work.currency,
      scale: work.scale,
      valueState: "actual",
      attributionMethod: "operations_fact",
      attributionConfidence: "high",
      sourceType: "derived",
      sourceRef: `derived:operations-work:${work.id}`,
      provenance: {
        domain: "operations",
        attributionMethod: "operations_fact",
        allocatedInvented: false,
        realized: true,
      },
      isDemo: work.isDemo,
    });
    } catch {
      // Profit feed must not fail-close operational cost ingestion.
    }
  }

  private async evaluateWork(scope: OwnerCommandScope, work: BusinessWorkItem) {
    const [milestones, actionLinks, costs, capacityAll, actions, thresholds] = await Promise.all([
      this.repository.listMilestones(scope, work.id),
      this.repository.listActionLinks(scope, work.id),
      this.repository.listCostFacts(scope, work.id),
      this.repository.listCapacityFacts(scope),
      this.ownerCommand.repository.listActions(scope),
      this.repository.getSettings(scope),
    ]);
    const capacity = capacityAll.filter((row) => !row.workId || row.workId === work.id);
    const progress = computeWorkProgress(work, milestones);
    const costProgress = computeCostProgress({
      work,
      facts: costs,
      progressBps: progress.progressBps,
      thresholdBps: thresholds.costProgressVarianceBps,
    });
    const linked = actionLinks.map((link) => ({
      ...link,
      actionStatus: actions.find((row) => row.id === link.actionId)?.status,
    }));
    const asOf = new Date().toISOString().slice(0, 10);
    const health = computeWorkHealth({
      work: { ...work, progressBps: progress.method === "user_supplied" ? work.progressBps : progress.progressBps },
      milestones,
      actionLinks: linked,
      progress,
      costProgress,
      capacity,
      asOf,
      thresholds,
    });
    return {
      milestones,
      actionLinks,
      costs,
      capacity,
      progress,
      costProgress,
      health,
      scheduleVarianceDays: scheduleVarianceDays(work, asOf),
      asOf,
      thresholds,
    };
  }

  private async computeMetrics(scope: OwnerCommandScope) {
    const work = await this.repository.listWork(scope);
    const capacity = await this.repository.listCapacityFacts(scope);
    const asOf = new Date().toISOString().slice(0, 10);
    let overdue = 0;
    let blocked = 0;
    let atRisk = 0;
    let completed = 0;
    let costExceptions = 0;
    let knownProgress = 0;
    let knownCost = 0;
    let knownCapacity = capacity.filter((row) => row.capacityStatus !== "unknown").length;
    const snapshots = [];
    for (const item of work) {
      const snapshot = await this.evaluateWork(scope, item);
      snapshots.push({ item, snapshot });
      if (isWorkOverdue(item, asOf)) overdue += 1;
      if (item.status === "on_hold" || snapshot.milestones.some((m) => m.status === "blocked")) blocked += 1;
      if (snapshot.health.status === "at_risk" || snapshot.health.status === "critical") atRisk += 1;
      if (item.status === "completed") completed += 1;
      if (snapshot.costProgress.signal) costExceptions += 1;
      if (snapshot.progress.progressBps !== null) knownProgress += 1;
      if (snapshot.costs.some((c) => c.valueState === "actual")) knownCost += 1;
    }
    const milestones = snapshots.flatMap((row) => row.snapshot.milestones);
    const dueMilestones = milestones.filter((row) => row.dueAt);
    const onTime =
      dueMilestones.length === 0
        ? null
        : dueMilestones.filter((row) => row.status === "completed" || !isMilestoneOverdue(row, asOf)).length;
    const utilizationKnown = capacity.filter((row) => row.utilizationBps !== null);
    let utilizationSum = 0n;
    for (const row of utilizationKnown) {
      utilizationSum += parseMinor(row.utilizationBps) ?? 0n;
    }
    const coverageDenom = work.length * 3 + 1;
    const coverageNumer = knownProgress + knownCost + (work.length ? knownCapacity > 0 ? work.length : 0 : 0);
    return {
      activeWorkCount: work.filter((row) => isOpenWorkStatus(row.status)).length,
      overdueWorkCount: overdue,
      blockedWorkCount: blocked,
      atRiskWorkCount: atRisk,
      completedWorkCount: completed,
      milestoneOnTimeRateBps:
        onTime === null || dueMilestones.length === 0 ? null : Math.round((onTime / dueMilestones.length) * 10000),
      workCompletionRateBps: work.length === 0 ? null : Math.round((completed / work.length) * 10000),
      costProgressVarianceCount: costExceptions,
      capacityUtilizationBps:
        utilizationKnown.length === 0 ? null : integerMetric((utilizationSum / BigInt(utilizationKnown.length)).toString()),
      overcommittedCapacityCount: capacity.filter((row) => row.capacityStatus === "overcommitted").length,
      operationalDataCoverageBps: Math.round((coverageNumer / coverageDenom) * 10000),
      containsDemoData: work.some((row) => row.isDemo) || capacity.some((row) => row.isDemo),
    };
  }

  private async publishToOwnerCommand(scope: OwnerCommandScope) {
    const metrics = await this.computeMetrics(scope);
    const work = await this.repository.listWork(scope);
    const isDemo = work.some((row) => row.isDemo);
    const values: Record<(typeof BUSINESS_OPERATIONS_KPI_KEYS)[number], number | null> = {
      active_work: metrics.activeWorkCount,
      overdue_work: metrics.overdueWorkCount,
      blocked_work: metrics.blockedWorkCount,
      milestone_on_time_rate: metrics.milestoneOnTimeRateBps,
      work_completion_rate: metrics.workCompletionRateBps,
      cost_progress_variance_count: metrics.costProgressVarianceCount,
      capacity_utilization: metrics.capacityUtilizationBps,
      overcommitted_capacity: metrics.overcommittedCapacityCount,
      operational_data_coverage: metrics.operationalDataCoverageBps,
    };
    const extras: Record<string, { warning?: number; critical?: number }> = {
      overdue_work: { warning: 1, critical: 3 },
      blocked_work: { warning: 1, critical: 2 },
      cost_progress_variance_count: { warning: 1, critical: 3 },
      overcommitted_capacity: { warning: 1, critical: 2 },
      operational_data_coverage: { warning: 7000, critical: 4000 },
    };
    for (const key of BUSINESS_OPERATIONS_KPI_KEYS) {
      const meta = OPERATIONS_KPI_META[key];
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
        sourceRef: "work_operations",
        provenance: { domain: "operations", live: false },
        isDemo,
      });
    }

    const existing = await this.ownerCommand.repository.listSignals(scope);
    const recs = await this.ownerCommand.repository.listRecommendations(scope);
    const asOf = new Date().toISOString().slice(0, 10);
    for (const item of work) {
      const snapshot = await this.evaluateWork(scope, item);
      const drafts = detectOperationalSignals({
        work: item,
        milestones: snapshot.milestones,
        progress: snapshot.progress,
        costProgress: snapshot.costProgress,
        health: snapshot.health,
        capacity: snapshot.capacity,
        highValue: Boolean(item.customerId) && (parseMinor(item.contractedValueMinor) ?? 0n) >= 50_000_000n,
        asOf,
        staleDays: snapshot.thresholds.staleDays,
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
          sourceRef: "work_operations",
          evidence: draft.evidence,
          provenance: draft.provenance,
          detectedAt: new Date().toISOString(),
          status: "open",
          businessImpact: draft.businessImpact,
          isDemo,
          createdBy: scope.userId,
        });
        existing.push(created);
        await this.emit(scope, "business_os.signal.created", { id: created.id, type: created.type });
        await this.emit(scope, "business_os.operations.risk_detected", { id: created.id, ruleId: draft.ruleId });
        const recAlready = recs.some((r) => r.title === draft.recommendationTitle && r.status === "proposed");
        if (recAlready) continue;
        const createdRec = await this.ownerCommand.repository.insertRecommendation(scope, {
          signalId: created.id,
          title: draft.recommendationTitle,
          recommendationText: draft.recommendationText,
          rationaleSummary: draft.summary,
          expectedImpact: draft.businessImpact,
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
    await this.emit(scope, "business_os.operations.metrics_updated", { workCount: work.length });
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
