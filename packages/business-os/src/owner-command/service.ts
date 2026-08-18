import type { SupabaseClient } from "@rtb/database";
import type { PlatformKernel } from "@rtb/platform-kernel";
import { AuditService } from "@rtb/platform-core";
import type {
  AiDailyBriefNarrative,
  BusinessAction,
  BusinessActionStatus,
  BusinessDecision,
  BusinessDecisionStatus,
  BusinessHealthSnapshot,
  BusinessKpi,
  BusinessRecommendationStatus,
  BusinessSignalStatus,
  DeterministicDailyBrief,
} from "@rtb/types";
import { BUSINESS_OS_EVENT_TYPES } from "@rtb/types";
import { computeBusinessHealth } from "./health";
import {
  buildDeterministicBrief,
  isDueSoon,
  isOverdueOrBlocked,
  rankSignals,
  structuredBriefEvidence,
} from "./brief";
import { OwnerCommandRepository } from "./repository";
import { seedOwnerCommandDemo } from "./demo";

export interface OwnerCommandScope {
  tenantId: string;
  workspaceId: string;
  userId: string;
}

function requireWorkspace(scope: { tenantId: string; workspaceId?: string; userId: string }): OwnerCommandScope {
  if (!scope.workspaceId) {
    throw new Error("workspace_not_assigned");
  }
  return { tenantId: scope.tenantId, workspaceId: scope.workspaceId, userId: scope.userId };
}

export class OwnerCommandService {
  readonly repository: OwnerCommandRepository;

  constructor(
    private readonly supabase: SupabaseClient,
    private readonly kernel: PlatformKernel,
    private readonly audit: AuditService,
  ) {
    this.repository = new OwnerCommandRepository(supabase);
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
      // Mutations must not fail closed solely because event persistence failed.
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

  async snapshot(raw: { tenantId: string; workspaceId?: string; userId: string }) {
    const scope = requireWorkspace(raw);
    const [kpis, signals, recommendations, decisions, actions] = await Promise.all([
      this.repository.listKpis(scope),
      this.repository.listSignals(scope),
      this.repository.listRecommendations(scope),
      this.repository.listDecisions(scope),
      this.repository.listActions(scope),
    ]);
    const health = computeBusinessHealth(kpis);
    const openSignals = rankSignals(signals.filter((s) => s.status === "open"));
    const brief = buildDeterministicBrief({ health, kpis, signals, decisions, actions });
    const freshness = kpis
      .map((k) => k.measuredAt)
      .filter((v): v is string => Boolean(v))
      .sort()
      .at(-1) ?? null;
    return {
      scope,
      kpis,
      signals: openSignals,
      recommendations: recommendations.filter((r) => r.status === "proposed" || r.status === "accepted"),
      decisions: decisions.filter((d) => d.status === "pending" || d.status === "approved" || d.status === "deferred"),
      actions: {
        overdue: actions.filter((a) => isOverdueOrBlocked(a) && a.status !== "blocked"),
        blocked: actions.filter((a) => a.status === "blocked"),
        dueSoon: actions.filter((a) => isDueSoon(a)),
      },
      health,
      brief,
      freshness,
      containsDemoData: kpis.some((k) => k.isDemo) || signals.some((s) => s.isDemo),
      disclaimer: health.disclaimer,
    };
  }

  async health(raw: { tenantId: string; workspaceId?: string; userId: string }): Promise<BusinessHealthSnapshot> {
    const scope = requireWorkspace(raw);
    return computeBusinessHealth(await this.repository.listKpis(scope));
  }

  async brief(
    raw: { tenantId: string; workspaceId?: string; userId: string },
    opts: { includeAi?: boolean } = {},
  ): Promise<{
    deterministic: DeterministicDailyBrief;
    narrative: AiDailyBriefNarrative | null;
    health: BusinessHealthSnapshot;
  }> {
    const snap = await this.snapshot(raw);
    let narrative: AiDailyBriefNarrative | null = null;
    if (opts.includeAi) {
      narrative = await this.generateAiNarrative(requireWorkspace(raw), snap.brief);
    }
    return { deterministic: snap.brief, narrative, health: snap.health };
  }

  private async generateAiNarrative(
    scope: OwnerCommandScope,
    brief: DeterministicDailyBrief,
  ): Promise<AiDailyBriefNarrative> {
    const evidence = structuredBriefEvidence(brief);
    try {
      const policy = await this.kernel.intelligence.policies.evaluate({
        tenantId: scope.tenantId,
        operatingSystem: "business",
        intent: "owner_command.daily_brief",
        simulation: false,
      });
      if (policy.allowed === false) {
        return {
          text: "",
          generatedAt: new Date().toISOString(),
          generatedBy: "platform_ai_director",
          evidenceRefs: brief.evidenceRefs,
          advisory: true,
          unavailableReason: "policy_denied",
        };
      }
      const response = await this.kernel.aiDirector.run({
        tenantId: scope.tenantId,
        workspaceId: scope.workspaceId,
        userId: scope.userId,
        message:
          "Write a concise owner daily brief from the structured evidence JSON only. Do not invent numbers, causes, or missing data. Do not expose chain-of-thought.",
        context: { evidence },
      });
      const text = response.message?.trim() ?? "";
      if (!text) {
        return {
          text: "",
          generatedAt: new Date().toISOString(),
          generatedBy: "platform_ai_director",
          evidenceRefs: brief.evidenceRefs,
          advisory: true,
          unavailableReason: "empty_ai_response",
        };
      }
      const provider = response.run.model_provider;
      const model = response.run.model_name;
      return {
        text,
        generatedAt: new Date().toISOString(),
        generatedBy: "platform_ai_director",
        modelProvenance: [provider, model].filter(Boolean).join("/") || "platform-ai-director",
        evidenceRefs: brief.evidenceRefs,
        advisory: true,
      };
    } catch {
      return {
        text: "",
        generatedAt: new Date().toISOString(),
        generatedBy: "platform_ai_director",
        evidenceRefs: brief.evidenceRefs,
        advisory: true,
        unavailableReason: "ai_director_unavailable",
      };
    }
  }

  async seedDemo(raw: { tenantId: string; workspaceId?: string; userId: string }) {
    const scope = requireWorkspace(raw);
    const result = await seedOwnerCommandDemo(this.repository, scope);
    await this.auditMutation(scope, "create", "business_os_demo", "owner-command", {
      fixture: "bos-1-owner-command",
    });
    if (result.created) {
      const [signals, recommendations, kpis] = await Promise.all([
        this.repository.listSignals(scope),
        this.repository.listRecommendations(scope),
        this.repository.listKpis(scope),
      ]);
      for (const kpi of kpis.filter((row) => row.isDemo)) {
        await this.emit(scope, "business_os.kpi.updated", { id: kpi.id, key: kpi.key, demo: true });
      }
      for (const signal of signals.filter((row) => row.isDemo)) {
        await this.emit(scope, "business_os.signal.created", { id: signal.id, demo: true });
      }
      for (const rec of recommendations.filter((row) => row.isDemo)) {
        await this.emit(scope, "business_os.recommendation.created", { id: rec.id, demo: true });
      }
    }
    return result;
  }

  async upsertKpi(
    raw: { tenantId: string; workspaceId?: string; userId: string },
    input: Partial<BusinessKpi> & { key: string; name: string },
  ) {
    const scope = requireWorkspace(raw);
    const kpi = await this.repository.upsertKpi(scope, { ...input, createdBy: scope.userId });
    await this.emit(scope, "business_os.kpi.updated", { id: kpi.id, key: kpi.key, status: kpi.status });
    await this.auditMutation(scope, "update", "business_os_kpi", kpi.id, { key: kpi.key });
    return kpi;
  }

  async updateSignal(
    raw: { tenantId: string; workspaceId?: string; userId: string },
    id: string,
    status: BusinessSignalStatus,
  ) {
    const scope = requireWorkspace(raw);
    const signal = await this.repository.updateSignalStatus(scope, id, status);
    if (status === "resolved") {
      await this.emit(scope, "business_os.signal.resolved", { id: signal.id, status });
    }
    await this.auditMutation(scope, "update", "business_os_signal", signal.id, { status });
    return signal;
  }

  async updateRecommendation(
    raw: { tenantId: string; workspaceId?: string; userId: string },
    id: string,
    status: BusinessRecommendationStatus,
  ) {
    const scope = requireWorkspace(raw);
    const rec = await this.repository.updateRecommendationStatus(scope, id, status);
    await this.auditMutation(scope, "update", "business_os_recommendation", rec.id, { status });
    return rec;
  }

  async createDecision(
    raw: { tenantId: string; workspaceId?: string; userId: string },
    input: { statement: string; context?: string; recommendationId?: string; reviewAt?: string },
  ) {
    const scope = requireWorkspace(raw);
    const decision = await this.repository.insertDecision(scope, {
      recommendationId: input.recommendationId ?? null,
      statement: input.statement,
      context: input.context ?? null,
      ownerId: scope.userId,
      status: "pending",
      decision: null,
      rationale: null,
      decidedAt: null,
      reviewAt: input.reviewAt ?? null,
      isDemo: false,
      createdBy: scope.userId,
    });
    await this.emit(scope, "business_os.decision.created", { id: decision.id });
    await this.auditMutation(scope, "create", "business_os_decision", decision.id, {
      statement: decision.statement,
    });
    return decision;
  }

  async updateDecision(
    raw: { tenantId: string; workspaceId?: string; userId: string },
    id: string,
    patch: { status: BusinessDecisionStatus; decision?: BusinessDecision["decision"]; rationale?: string },
  ) {
    const scope = requireWorkspace(raw);
    const mappedDecision =
      patch.decision ??
      (patch.status === "approved"
        ? "approve"
        : patch.status === "rejected"
          ? "reject"
          : patch.status === "deferred"
            ? "defer"
            : patch.status === "closed"
              ? "close"
              : null);
    const decision = await this.repository.updateDecision(scope, id, {
      status: patch.status,
      decision: mappedDecision,
      rationale: patch.rationale,
      ownerId: scope.userId,
    });
    await this.emit(scope, "business_os.decision.updated", { id: decision.id, status: decision.status });
    await this.auditMutation(scope, "update", "business_os_decision", decision.id, {
      status: decision.status,
    });
    return decision;
  }

  async createAction(
    raw: { tenantId: string; workspaceId?: string; userId: string },
    input: { title: string; decisionId?: string; dueDate?: string; priority?: BusinessAction["priority"] },
  ) {
    const scope = requireWorkspace(raw);
    const action = await this.repository.insertAction(scope, {
      decisionId: input.decisionId ?? null,
      title: input.title,
      ownerId: scope.userId,
      dueDate: input.dueDate ?? null,
      priority: input.priority ?? "medium",
      status: "open",
      completionEvidence: {},
      completedAt: null,
      isDemo: false,
      createdBy: scope.userId,
    });
    await this.emit(scope, "business_os.action.created", { id: action.id });
    await this.auditMutation(scope, "create", "business_os_action", action.id, { title: action.title });
    return action;
  }

  async updateAction(
    raw: { tenantId: string; workspaceId?: string; userId: string },
    id: string,
    patch: { status: BusinessActionStatus; completionEvidence?: Record<string, unknown> },
  ) {
    const scope = requireWorkspace(raw);
    const action = await this.repository.updateAction(scope, id, patch);
    if (action.status === "completed") {
      await this.emit(scope, "business_os.action.completed", { id: action.id });
    }
    await this.auditMutation(scope, "update", "business_os_action", action.id, { status: action.status });
    return action;
  }
}
