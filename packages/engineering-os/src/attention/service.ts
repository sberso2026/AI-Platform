import type { SupabaseClient } from "@rtb/database";
import type { CommerceExecutionContext } from "@rtb/types";
import { assertEngineeringService } from "../commerce/service-guard";
import { workspaceScopeId } from "../commerce/workspace-scope";
import type { EngineeringProjectService } from "../services/core-services";
import type { EngineeringWorkGeneratorService } from "../work-generator/service";
import type { EngineeringInformationRequirementService } from "../information-requirements/service";
import type { EngineeringWorkContextService } from "../work-context/service";
import type { EngineeringPreIssueReviewService } from "../pre-issue-review/service";
import type { EngineeringChangeWorkbenchService } from "../change-workbench/service";
import type { EngineeringDecisionService } from "../services/register-services";
import type { EngineeringInterfaceService } from "../systems-intelligence/interface-service";
import { createMemoryAttentionStore, type AttentionStore } from "./memory-store";
import { resolveEngineeringAttention, summarizeEngineeringDay } from "./resolve";
import { SupabaseAttentionStore } from "./supabase-store";
import {
  ATTENTION_AI_BOUNDARY,
  ATTENTION_PRIVACY,
  ATTENTION_RECON,
  ATTENTION_SCALE,
  CALLER_SUPPLIED_ATTENTION_KEYS,
  type AttentionCategory,
  type AttentionProjectSnapshot,
  type AttentionViewerRole,
  type EngineeringDay,
} from "./types";

export type AttentionKernelNotifications = {
  listForUser(userId: string): Promise<Array<{ metadata?: Record<string, unknown> }>>;
  create(input: {
    tenantId: string;
    userId: string;
    type: string;
    title: string;
    body?: string;
    priority?: "low" | "normal" | "high" | "urgent";
    linkTarget?: string;
    metadata?: Record<string, unknown>;
  }): Promise<unknown>;
};

export type AttentionDomainPorts = {
  projects: EngineeringProjectService;
  workGenerator: EngineeringWorkGeneratorService;
  informationRequirements: EngineeringInformationRequirementService;
  work: EngineeringWorkContextService;
  preIssueReview: EngineeringPreIssueReviewService;
  changeWorkbench: EngineeringChangeWorkbenchService;
  decisions?: EngineeringDecisionService;
  interfaces?: EngineeringInterfaceService;
  notifications?: AttentionKernelNotifications;
};

function newId() {
  return crypto.randomUUID();
}

export class EngineeringAttentionService {
  private readonly store: AttentionStore;

  constructor(
    private readonly supabase: SupabaseClient,
    private readonly ports: AttentionDomainPorts,
    store?: AttentionStore,
  ) {
    this.store = store ?? new SupabaseAttentionStore(supabase);
  }

  catalog() {
    return {
      recon: ATTENTION_RECON,
      aiBoundary: ATTENTION_AI_BOUNDARY,
      privacy: ATTENTION_PRIVACY,
      scale: ATTENTION_SCALE,
      projection: "DERIVED",
      persisted: ["acknowledgement", "preference"] as const,
      externalChannels: { EMAIL: "DEFERRED", TEAMS: "DEFERRED", IN_APP: "SUPPORTED" },
    };
  }

  rejectCallerClaims(body: Record<string, unknown>) {
    for (const key of CALLER_SUPPLIED_ATTENTION_KEYS) {
      if (key in body && body[key] != null && body[key] !== "") return "caller_supplied_authority_rejected";
    }
    return null;
  }

  async resolve(
    commerce: CommerceExecutionContext,
    tenantId: string,
    options: {
      projectCommerce: CommerceExecutionContext;
      viewProjectId?: string | null;
      category?: AttentionCategory | "ALL";
      discipline?: string | null;
      lifecycle?: string | null;
      role?: AttentionViewerRole | null;
    },
  ): Promise<EngineeringDay> {
    assertEngineeringService(commerce, "work.list", tenantId);
    assertEngineeringService(options.projectCommerce, "project.list", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const userId = commerce.actorUserId ?? "unknown";
    const projects = (await this.ports.projects.list(options.projectCommerce, tenantId, ATTENTION_SCALE.maxProjects))
      .filter((row) => row.tenant_id === tenantId);
    const authorizedProjectIds = projects.map((row) => row.id);
    const snapshots: AttentionProjectSnapshot[] = [];
    for (const project of projects.slice(0, ATTENTION_SCALE.maxProjects)) {
      snapshots.push(await this.snapshotProject(commerce, tenantId, {
        projectId: project.id,
        projectName: project.project_name ?? project.project_code ?? project.id,
      }));
    }
    const acknowledgements = userId === "unknown" ? [] : await this.store.listAcknowledgements(workspaceId, userId);
    const preferences = userId === "unknown" ? null : await this.store.getPreference(workspaceId, userId);
    const day = resolveEngineeringAttention({
      viewer: {
        userId,
        tenantId,
        workspaceId,
        authorizedProjectIds,
        role: options?.role ?? null,
        discipline: options?.discipline ?? null,
      },
      projects: snapshots,
      acknowledgements,
      preferences: preferences ?? undefined,
      filter: {
        projectId: options?.viewProjectId ?? null,
        category: options?.category ?? "ALL",
        discipline: options?.discipline ?? null,
        lifecycle: options?.lifecycle ?? null,
      },
    });
    await this.syncInApp(commerce, tenantId, userId, day);
    return day;
  }

  async acknowledge(commerce: CommerceExecutionContext, tenantId: string, fingerprint: string, snoozedUntil?: string | null) {
    assertEngineeringService(commerce, "work.write", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const userId = commerce.actorUserId;
    if (!userId) throw new Error("user_required");
    if (!fingerprint) throw new Error("fingerprint_required");
    return this.store.saveAcknowledgement({
      id: newId(),
      tenantId,
      workspaceId,
      userId,
      fingerprint,
      acknowledgedAt: new Date().toISOString(),
      snoozedUntil: snoozedUntil ?? null,
    });
  }

  async savePreferences(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: { fyiDisplay?: boolean; digestMode?: "IMMEDIATE" | "DIGEST"; mutedFyi?: boolean },
  ) {
    assertEngineeringService(commerce, "work.write", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const userId = commerce.actorUserId;
    if (!userId) throw new Error("user_required");
    const existing = await this.store.getPreference(workspaceId, userId);
    return this.store.savePreference({
      userId,
      tenantId,
      workspaceId,
      fyiDisplay: input.fyiDisplay ?? existing?.fyiDisplay ?? true,
      digestMode: input.digestMode ?? existing?.digestMode ?? "IMMEDIATE",
      mutedFyi: input.mutedFyi ?? existing?.mutedFyi ?? false,
      updatedAt: new Date().toISOString(),
    });
  }

  askEosSummary(day: EngineeringDay) {
    return summarizeEngineeringDay(day.counts, day.items);
  }

  private async snapshotProject(
    commerce: CommerceExecutionContext,
    tenantId: string,
    project: { projectId: string; projectName: string },
  ): Promise<AttentionProjectSnapshot> {
    const workPlans = await safeList(() => this.ports.workGenerator.listPlans(commerce, tenantId, project.projectId));
    const requirements = await safeList(() => this.ports.informationRequirements.list(commerce, tenantId, project.projectId));
    const events = await safeList(() => this.ports.work.list(commerce, tenantId, project.projectId));
    const impacts = await safeList(() => this.ports.changeWorkbench.listByProject(commerce, tenantId, project.projectId));
    const decisions = this.ports.decisions
      ? await safeList(() => this.ports.decisions!.list(commerce, tenantId, project.projectId) as Promise<Array<Record<string, unknown>>>)
      : [];
    const interfaces = this.ports.interfaces
      ? await safeList(() => this.ports.interfaces!.list(commerce, tenantId, project.projectId) as Promise<Array<Record<string, unknown>>>)
      : [];
    const reviews = [];
    for (const plan of workPlans.slice(0, ATTENTION_SCALE.maxPlansPerProject)) {
      try {
        const latest = await this.ports.preIssueReview.latest(commerce, tenantId, plan.id);
        if (latest.review) {
          const open = (latest.review.conditions ?? []).filter((row) => row.status === "candidate").length;
          reviews.push({
            id: latest.review.id,
            workPlanId: plan.id,
            resultState: latest.review.resultState,
            openConditionCount: open,
            targetTitle: latest.review.snapshot?.targetArtifactType ?? plan.workType,
          });
        }
      } catch {
        /* latest review is optional per plan */
      }
    }
    let lifecycleStage: string | null = workPlans.find((row) => row.lifecycleStage)?.lifecycleStage ?? null;
    return {
      projectId: project.projectId,
      projectName: project.projectName,
      lifecycleStage,
      workPlans: workPlans.slice(0, ATTENTION_SCALE.maxPlansPerProject).map((plan) => ({
        id: plan.id,
        workType: plan.workType,
        status: plan.status,
        readiness: plan.readiness,
        startAllowed: plan.startAllowed,
        discipline: plan.discipline,
        systemId: plan.systemId,
        relatedObjectType: plan.relatedObjectType,
        relatedObjectId: plan.relatedObjectId,
      })),
      requirements: requirements.map((row) => ({
        id: row.id,
        title: row.title,
        status: row.status,
        blocking: row.blocking,
        providerDiscipline: row.providerDiscipline,
        providerKind: row.providerKind,
        providerRole: row.providerRole,
        consumerDiscipline: row.consumerDiscipline,
        neededBy: row.neededBy,
        requiredForObjectId: row.requiredForObjectId,
        workType: row.workType,
      })),
      reviews,
      impacts: impacts.map((row) => ({
        id: row.id,
        status: row.status,
        workflow: row.workflow,
        workPlanId: workPlans.find((plan) => plan.relatedObjectId === row.sourceObjectId || plan.id === row.sourceObjectId)?.id ?? null,
        optionStudyNeedsDecision: Boolean(row.snapshot.optionStudy && !row.snapshot.optionStudy.humanDecisionRecorded),
        constructionQuery: row.snapshot.construction
          ? { queryId: row.snapshot.construction.queryId, queryType: row.snapshot.construction.queryType, summary: row.snapshot.construction.summary }
          : null,
        sourceObjectId: row.sourceObjectId,
      })),
      decisions: decisions.map((row) => ({
        id: String(row.id ?? ""),
        title: String(row.title ?? "Decision"),
        approvalStatus: String(row.approval_status ?? row.status ?? "pending"),
      })),
      interfaces: interfaces.map((row) => ({
        id: String(row.id ?? ""),
        title: String(row.title ?? row.name ?? "Interface"),
        status: String(row.status ?? ""),
        providerDiscipline: (row.provider_discipline as string | null) ?? (row.from_discipline as string | null) ?? null,
        consumerDiscipline: (row.consumer_discipline as string | null) ?? (row.to_discipline as string | null) ?? null,
        awaitingConsumerConfirmation: Boolean(row.awaiting_consumer_confirmation ?? /await|pending confirm/i.test(String(row.status ?? ""))),
      })),
      events: events.slice(0, ATTENTION_SCALE.maxEventsPerProject).map((row) => ({
        id: row.id,
        eventType: row.eventType,
        sourceObjectType: row.sourceObjectType,
        sourceObjectId: row.sourceObjectId,
        materiality: row.materiality,
        occurredAt: row.occurredAt,
      })),
    };
  }

  private async syncInApp(commerce: CommerceExecutionContext, tenantId: string, userId: string, day: EngineeringDay) {
    if (!this.ports.notifications || userId === "unknown") return;
    const actionable = day.items.filter((row) => row.category === "DO_NOW" || row.category === "REVIEW_REQUIRED" || row.category === "DECISION_REQUIRED").slice(0, 8);
    let existing: Array<{ metadata?: Record<string, unknown> }> = [];
    try {
      existing = await this.ports.notifications.listForUser(userId);
    } catch {
      existing = [];
    }
    const seen = new Set(existing.map((row) => String(row.metadata?.attentionFingerprint ?? "")));
    for (const item of actionable) {
      if (seen.has(item.fingerprint) || item.acknowledged) continue;
      try {
        await this.ports.notifications.create({
          tenantId,
          userId,
          type: "task.assigned",
          title: item.title,
          body: `${item.projectName}: ${item.whatHappened}`,
          priority: item.priority === "ACTION_REQUIRED" ? "high" : item.priority === "FYI" ? "low" : "normal",
          linkTarget: item.action?.href,
          metadata: { attentionFingerprint: item.fingerprint, projectId: item.projectId, sourceObjectId: item.sourceObjectId },
        });
      } catch {
        /* in-app sync is best-effort; domain projection remains authoritative */
      }
    }
    void commerce;
  }
}

async function safeList<T>(load: () => Promise<T[]>, fallback: T[] = []): Promise<T[]> {
  try {
    return await load();
  } catch {
    return fallback;
  }
}

export function createTestAttentionService(input: {
  ports: AttentionDomainPorts;
  store?: AttentionStore;
}): EngineeringAttentionService {
  return new EngineeringAttentionService({ from() { return this; } } as never, input.ports, input.store ?? createMemoryAttentionStore());
}
