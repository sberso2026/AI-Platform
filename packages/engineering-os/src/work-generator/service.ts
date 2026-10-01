import type { SupabaseClient } from "@rtb/database";
import type { CommerceExecutionContext } from "@rtb/types";
import { assertEngineeringService } from "../commerce/service-guard";
import { workspaceScopeId } from "../commerce/workspace-scope";
import type { WorkReadinessResolution } from "../information-requirements/readiness";
import type { LifecycleStage } from "../lifecycle-intelligence/types";
import { A11B_HANDOFF, ENGINEERING_WORK_TEMPLATES, templateFor } from "./catalog";
import { candidateWorkPlanAssurance, emptySnapshot, snapshotFromPlan, WORK_GENERATOR_RECON } from "./compose";
import { compareFingerprints } from "./fingerprint";
import { diffWorkPlans, generateEngineeringWorkPlan } from "./generator";
import type { WorkPlanStore } from "./memory-store";
import { SupabaseWorkPlanStore } from "./supabase-store";
import {
  FUTURE_WORK_PLAN_ASSURANCE_CONDITIONS,
  GENERATOR_WORK_TYPES,
  WORK_GENERATOR_AI_BOUNDARY,
  WORK_GENERATOR_PRIVACY,
  type EngineeringWorkPlan,
  type GeneratorWorkType,
  type WorkPlanContextSnapshot,
} from "./types";

export const CALLER_SUPPLIED_WORK_PLAN_KEYS = ["tenantId", "workspaceId", "aal", "approved", "authoritative"] as const;

export type WorkPlanEventRecorder = (
  commerce: CommerceExecutionContext,
  tenantId: string,
  input: {
    eventType: "ENGINEERING_WORK_PLAN_CREATED" | "ENGINEERING_WORK_STARTED" | "ENGINEERING_WORK_BLOCKED" | "ENGINEERING_WORK_CONTEXT_REFRESHED" | "ENGINEERING_WORK_COMPLETED";
    projectId: string;
    planId: string;
    workType: GeneratorWorkType;
    actorId?: string | null;
    systemId?: string | null;
    lifecycleStage?: string | null;
  },
) => Promise<void>;

export class EngineeringWorkGeneratorService {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly store: WorkPlanStore = new SupabaseWorkPlanStore(supabase),
    private readonly recordEvent?: WorkPlanEventRecorder,
  ) {}

  catalog() {
    return {
      workTypes: GENERATOR_WORK_TYPES,
      templates: ENGINEERING_WORK_TEMPLATES,
      recon: WORK_GENERATOR_RECON,
      aiBoundary: WORK_GENERATOR_AI_BOUNDARY,
      privacy: WORK_GENERATOR_PRIVACY,
      a11b: A11B_HANDOFF,
      futureAssuranceConditions: FUTURE_WORK_PLAN_ASSURANCE_CONDITIONS,
      notAWbsPackage: true,
      notAReviewPackage: true,
      notADeliverable: true,
      notAWorkflowEngine: true,
    };
  }

  rejectCallerClaims(body: Record<string, unknown>) {
    for (const key of CALLER_SUPPLIED_WORK_PLAN_KEYS) {
      if (key in body && body[key] != null && body[key] !== "") return "caller_supplied_authority_rejected";
    }
    return null;
  }

  async listPlans(commerce: CommerceExecutionContext, tenantId: string, projectId: string) {
    assertEngineeringService(commerce, "work.list", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    if (!projectId) throw new Error("project_required");
    return (await this.store.listPlans(workspaceId, projectId)).filter((row) => row.tenantId === tenantId);
  }

  async getPlan(commerce: CommerceExecutionContext, tenantId: string, id: string) {
    assertEngineeringService(commerce, "work.get", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const row = await this.store.getPlan(id);
    if (!row || row.tenantId !== tenantId || row.workspaceId !== workspaceId) return null;
    return row;
  }

  async generatePlan(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: {
      projectId: string;
      workType: GeneratorWorkType;
      lifecycleStage?: LifecycleStage;
      discipline?: string | null;
      systemId?: string | null;
      assetId?: string | null;
      relatedObjectType?: string | null;
      relatedObjectId?: string | null;
      relatedDeliverableId?: string | null;
      relatedInterfaceId?: string | null;
      relatedChangeId?: string | null;
      snapshot?: WorkPlanContextSnapshot;
      readiness?: WorkReadinessResolution | null;
      acknowledged?: boolean;
      unmanagedPath?: string | null;
      supersedesPlanId?: string | null;
    },
  ) {
    assertEngineeringService(commerce, "work.write", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    if (!input.projectId) throw new Error("project_required");
    if (input.unmanagedPath) throw new Error("unmanaged_file_outside_eos");
    const template = templateFor(input.workType, input.lifecycleStage ?? "FEED");
    if (!template) throw new Error("template_not_found");
    const existing = await this.store.listPlans(workspaceId, input.projectId);
    const current = existing.find(
      (row) =>
        row.tenantId === tenantId &&
        row.workType === input.workType &&
        (row.systemId ?? null) === (input.systemId ?? null) &&
        row.status !== "SUPERSEDED" &&
        row.status !== "CANCELLED" &&
        row.status !== "COMPLETED",
    );
    const snapshot = input.snapshot ?? emptySnapshot();
    const plan = generateEngineeringWorkPlan({
      tenantId,
      workspaceId,
      projectId: input.projectId,
      workType: input.workType,
      template,
      snapshot,
      readiness: input.readiness ?? null,
      discipline: input.discipline,
      systemId: input.systemId,
      assetId: input.assetId,
      relatedObjectType: input.relatedObjectType,
      relatedObjectId: input.relatedObjectId,
      relatedDeliverableId: input.relatedDeliverableId,
      relatedInterfaceId: input.relatedInterfaceId,
      relatedChangeId: input.relatedChangeId,
      generatedBy: commerce.actorUserId ?? null,
      acknowledged: input.acknowledged,
      supersedesPlanId: input.supersedesPlanId ?? current?.id ?? null,
    });
    if (current && current.id !== plan.supersedesPlanId && current.inputFingerprint !== plan.inputFingerprint) {
      await this.store.savePlan({ ...current, status: "SUPERSEDED", staleness: "REGENERATE_REQUIRED", updatedAt: plan.updatedAt });
    }
    if (plan.supersedesPlanId) {
      const previous = await this.store.getPlan(plan.supersedesPlanId);
      if (previous && previous.workspaceId === workspaceId && previous.tenantId === tenantId) {
        await this.store.savePlan({
          ...previous,
          status: "SUPERSEDED",
          staleness: previous.inputFingerprint === plan.inputFingerprint ? "CURRENT" : "STALE",
          updatedAt: plan.updatedAt,
        });
      }
    }
    const saved = await this.store.savePlan(plan);
    await this.recordEvent?.(commerce, tenantId, {
      eventType: "ENGINEERING_WORK_PLAN_CREATED",
      projectId: saved.projectId,
      planId: saved.id,
      workType: saved.workType,
      actorId: saved.generatedBy,
      systemId: saved.systemId,
      lifecycleStage: saved.lifecycleStage,
    });
    return saved;
  }

  async startWork(commerce: CommerceExecutionContext, tenantId: string, planId: string, acknowledged = false) {
    assertEngineeringService(commerce, "work.write", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const plan = await this.store.getPlan(planId);
    if (!plan || plan.tenantId !== tenantId || plan.workspaceId !== workspaceId) throw new Error("not_found");
    if (plan.staleness === "STALE" || plan.staleness === "REGENERATE_REQUIRED") {
      throw new Error("work_plan_stale");
    }
    const allowed = plan.startAllowed || (plan.readiness === "READY_WITH_CONDITIONS" && (plan.conditionsAcknowledged || acknowledged));
    if (!allowed) {
      await this.recordEvent?.(commerce, tenantId, {
        eventType: "ENGINEERING_WORK_BLOCKED",
        projectId: plan.projectId,
        planId: plan.id,
        workType: plan.workType,
        actorId: commerce.actorUserId ?? null,
        systemId: plan.systemId,
        lifecycleStage: plan.lifecycleStage,
      });
      return { allowed: false, autoApproved: false, plan, reason: plan.explanations.whyBlocked ?? "Start is blocked." };
    }
    const started = await this.store.savePlan({
      ...plan,
      status: "IN_PROGRESS",
      conditionsAcknowledged: plan.conditionsAcknowledged || acknowledged,
      startAllowed: true,
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    await this.recordEvent?.(commerce, tenantId, {
      eventType: "ENGINEERING_WORK_STARTED",
      projectId: started.projectId,
      planId: started.id,
      workType: started.workType,
      actorId: commerce.actorUserId ?? null,
      systemId: started.systemId,
      lifecycleStage: started.lifecycleStage,
    });
    return { allowed: true, autoApproved: false, plan: started, reason: null };
  }

  private async loadScopedPlan(tenantId: string, workspaceId: string, id: string) {
    const row = await this.store.getPlan(id);
    if (!row || row.tenantId !== tenantId || row.workspaceId !== workspaceId) return null;
    return row;
  }

  async refreshPlan(
    commerce: CommerceExecutionContext,
    tenantId: string,
    planId: string,
    snapshot: WorkPlanContextSnapshot,
    readiness?: WorkReadinessResolution | null,
  ) {
    assertEngineeringService(commerce, "work.write", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const previous = await this.loadScopedPlan(tenantId, workspaceId, planId);
    if (!previous) throw new Error("not_found");
    const regenerated = await this.generatePlan(commerce, tenantId, {
      projectId: previous.projectId,
      workType: previous.workType,
      lifecycleStage: previous.lifecycleStage,
      discipline: previous.discipline,
      systemId: previous.systemId,
      assetId: previous.assetId,
      relatedObjectType: previous.relatedObjectType,
      relatedObjectId: previous.relatedObjectId,
      relatedDeliverableId: previous.relatedDeliverableId,
      relatedInterfaceId: previous.relatedInterfaceId,
      relatedChangeId: previous.relatedChangeId,
      snapshot,
      readiness: readiness ?? null,
      acknowledged: previous.conditionsAcknowledged,
      supersedesPlanId: previous.id,
    });
    const fingerprintState = compareFingerprints(previous.inputFingerprint, regenerated.inputFingerprint);
    if (fingerprintState === "STALE") {
      await this.store.savePlan({
        ...previous,
        status: "SUPERSEDED",
        staleness: "STALE",
        updatedAt: regenerated.updatedAt,
      });
    }
    await this.recordEvent?.(commerce, tenantId, {
      eventType: "ENGINEERING_WORK_CONTEXT_REFRESHED",
      projectId: regenerated.projectId,
      planId: regenerated.id,
      workType: regenerated.workType,
      actorId: commerce.actorUserId ?? null,
      systemId: regenerated.systemId,
      lifecycleStage: regenerated.lifecycleStage,
    });
    return {
      previous,
      next: regenerated,
      diff: diffWorkPlans(previous, regenerated),
      historicalProvenancePreserved: previous.id !== regenerated.id,
    };
  }

  async completeWork(commerce: CommerceExecutionContext, tenantId: string, planId: string) {
    assertEngineeringService(commerce, "work.write", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const plan = await this.loadScopedPlan(tenantId, workspaceId, planId);
    if (!plan) throw new Error("not_found");
    const saved = await this.store.savePlan({
      ...plan,
      status: "COMPLETED",
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    await this.recordEvent?.(commerce, tenantId, {
      eventType: "ENGINEERING_WORK_COMPLETED",
      projectId: saved.projectId,
      planId: saved.id,
      workType: saved.workType,
      actorId: commerce.actorUserId ?? null,
      systemId: saved.systemId,
      lifecycleStage: saved.lifecycleStage,
    });
    return saved;
  }

  evaluateStaleness(plan: EngineeringWorkPlan, snapshot: WorkPlanContextSnapshot) {
    const regenerated = generateEngineeringWorkPlan({
      tenantId: plan.tenantId,
      workspaceId: plan.workspaceId,
      projectId: plan.projectId,
      workType: plan.workType,
      template: ENGINEERING_WORK_TEMPLATES.find((row) => row.code === plan.templateCode && row.version === plan.templateVersion) ??
        templateFor(plan.workType, plan.lifecycleStage)!,
      snapshot,
      readiness: null,
      systemId: plan.systemId,
    });
    const state = compareFingerprints(plan.inputFingerprint, regenerated.inputFingerprint);
    return { state: state === "CURRENT" ? "CURRENT" : "STALE", nextFingerprint: regenerated.inputFingerprint };
  }

  continueWorkSummary(plan: EngineeringWorkPlan) {
    return {
      workType: plan.workType,
      projectId: plan.projectId,
      systemId: plan.systemId,
      assetId: plan.assetId,
      readiness: plan.readiness,
      staleness: plan.staleness,
      expectedOutputs: plan.context.expectedOutputs,
      actions: plan.context.actions,
      templateProvenance: plan.explanations.templateProvenance,
    };
  }

  assurance(plan: EngineeringWorkPlan) {
    return candidateWorkPlanAssurance(plan);
  }

  snapshotFrom(plan: EngineeringWorkPlan) {
    return snapshotFromPlan(plan);
  }
}
