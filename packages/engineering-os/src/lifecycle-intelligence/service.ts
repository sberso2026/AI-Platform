import type { SupabaseClient } from "@rtb/database";
import type { CommerceExecutionContext } from "@rtb/types";
import { assertEngineeringService } from "../commerce/service-guard";
import { workspaceScopeId } from "../commerce/workspace-scope";
import { createSupabaseCanonicalSource } from "./canonical-source";
import { canAuthorizeTransition, evaluateLifecycleGate } from "./evaluate";
import { composeLifecycleThread } from "./fingerprint";
import {
  buildEvidenceSnapshot,
  createMemoryCanonicalSource,
  fixtureEvidenceToItems,
  harvestCanonicalLifecycleEvidence,
  type CanonicalEvidenceSource,
} from "./harvest";
import { createMemoryLifecycleStore, type LifecycleStore } from "./memory-store";
import {
  DEFAULT_ENGINEERING_LIFECYCLE_PROFILE,
  DEFAULT_LIFECYCLE_PROFILE_ID,
  DEFAULT_LIFECYCLE_PROFILE_VERSION,
  gateForTransition,
  lifecycleProfileById,
  transitionAllowed,
} from "./profile";
import { mixedScopeView, resolveEffectiveStage } from "./resolve";
import { alignScheduleToLifecycle, expectedStageFromLegacyProjectPhase } from "./schedule";
import { effectiveLifecycleProfile, enabledCriterionIds, unknownLifecycleProfileRejected } from "./settings";
import { SupabaseLifecycleStore } from "./supabase-store";
import type {
  GateDecisionStatus,
  LifecycleAssignment,
  LifecycleEvidence,
  LifecycleEvidenceMode,
  LifecycleScheduleMapping,
  LifecycleScopeType,
  LifecycleStage,
  ScheduleMappingType,
} from "./types";
import { LIFECYCLE_AI_BOUNDARY, LIFECYCLE_STAGES } from "./types";
import type { EngineeringDeliverableService } from "../deliverable-intelligence/service";

function db(client: SupabaseClient): { from(name: string): any } {
  return client as unknown as { from(name: string): any };
}

export class EngineeringLifecycleService {
  private readonly store: LifecycleStore;
  private readonly evidenceSource: CanonicalEvidenceSource;
  private readonly deliverables?: EngineeringDeliverableService;

  constructor(
    private readonly supabase: SupabaseClient,
    store?: LifecycleStore,
    evidenceSource?: CanonicalEvidenceSource,
    deliverables?: EngineeringDeliverableService,
  ) {
    this.store = store ?? new SupabaseLifecycleStore(supabase);
    this.evidenceSource = evidenceSource ?? createSupabaseCanonicalSource(supabase);
    this.deliverables = deliverables;
  }

  catalog() {
    const profile = DEFAULT_ENGINEERING_LIFECYCLE_PROFILE;
    return {
      profile,
      stages: LIFECYCLE_STAGES,
      kgRequired: false,
      kgReadsDefault: "OFF",
      automaticTransition: false,
      aiBoundary: LIFECYCLE_AI_BOUNDARY,
      projectControlsAuthority: false,
      evidenceAuthority: "CANONICAL",
      callerSuppliedEvidence: "REJECTED",
      scheduleAutoGateApproval: false,
      scheduleAutoStageTransition: false,
    };
  }

  async profile(commerce: CommerceExecutionContext, tenantId: string) {
    assertEngineeringService(commerce, "lifecycle.get", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) return this.catalog();
    const setting = await this.store.getProfileSetting(workspaceId);
    return {
      ...this.catalog(),
      profile: effectiveLifecycleProfile(setting),
      setting,
    };
  }

  async settingsCatalog(commerce: CommerceExecutionContext, tenantId: string) {
    assertEngineeringService(commerce, "settings.get", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) return this.catalog();
    const setting = await this.store.getProfileSetting(workspaceId);
    return {
      ...this.catalog(),
      profile: effectiveLifecycleProfile(setting),
      setting,
    };
  }

  async updateProfileSetting(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: {
      profileId: string;
      profileVersion: string;
      enabledCriterionIds?: string[] | null;
      omittedStages?: LifecycleStage[];
      actorId: string;
    },
  ) {
    assertEngineeringService(commerce, "settings.update", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    if (unknownLifecycleProfileRejected(input.profileId, input.profileVersion)) {
      throw new Error("unknown_lifecycle_profile");
    }
    const saved = await this.store.saveProfileSetting({
      tenantId,
      workspaceId,
      profileId: input.profileId,
      profileVersion: input.profileVersion,
      enabledCriterionIds: input.enabledCriterionIds ?? null,
      omittedStages: input.omittedStages ?? [],
      configuredBy: input.actorId,
      configuredAt: new Date().toISOString(),
    });
    await this.audit(tenantId, saved.id ?? crypto.randomUUID(), "lifecycle_profile_configured");
    return saved;
  }

  async assignments(commerce: CommerceExecutionContext, tenantId: string, projectId: string) {
    assertEngineeringService(commerce, "lifecycle.get", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) return [];
    return this.store.listAssignments(workspaceId, projectId);
  }

  async effective(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: { projectId: string; scopeType: LifecycleScopeType; scopeId: string; parentScopeType?: LifecycleScopeType | null; parentScopeId?: string | null },
  ) {
    assertEngineeringService(commerce, "lifecycle.get", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) return { stage: "UNKNOWN" as const, source: "UNKNOWN" as const };
    const assignments = await this.store.listAssignments(workspaceId, input.projectId);
    return resolveEffectiveStage({ assignments, ...input });
  }

  async scopedStates(commerce: CommerceExecutionContext, tenantId: string, projectId: string) {
    assertEngineeringService(commerce, "lifecycle.get", tenantId);
    const rows = await this.assignments(commerce, tenantId, projectId);
    return mixedScopeView(rows);
  }

  async assign(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: {
      projectId: string;
      scopeType: LifecycleScopeType;
      scopeId: string;
      stage: LifecycleStage;
      parentScopeType?: LifecycleScopeType | null;
      parentScopeId?: string | null;
      actorId: string;
    },
  ) {
    assertEngineeringService(commerce, "lifecycle.assign", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const existing = (await this.store.listAssignments(workspaceId, input.projectId)).find(
      (row) => row.scopeType === input.scopeType && row.scopeId === input.scopeId,
    );
    if (existing) throw new Error("use_governed_transition");
    const setting = await this.store.getProfileSetting(workspaceId);
    const assignment: LifecycleAssignment = {
      id: crypto.randomUUID(),
      tenantId,
      workspaceId,
      projectId: input.projectId,
      scopeType: input.scopeType,
      scopeId: input.scopeId,
      parentScopeType: input.parentScopeType ?? null,
      parentScopeId: input.parentScopeId ?? null,
      stage: input.stage,
      profileId: setting?.profileId ?? DEFAULT_LIFECYCLE_PROFILE_ID,
      profileVersion: setting?.profileVersion ?? DEFAULT_LIFECYCLE_PROFILE_VERSION,
      version: 1,
      assignedBy: input.actorId,
      assignedAt: new Date().toISOString(),
    };
    const saved = await this.store.upsertAssignment(assignment);
    await this.audit(tenantId, saved.id, "lifecycle_assigned");
    return saved;
  }

  async evaluateGate(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: {
      assignmentId: string;
      gateId: string;
      evidence?: LifecycleEvidence;
      evidenceMode?: LifecycleEvidenceMode;
    },
  ) {
    assertEngineeringService(commerce, "lifecycle.evaluate", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const assignment = await this.store.getAssignment(input.assignmentId);
    if (!assignment || assignment.workspaceId !== workspaceId || assignment.tenantId !== tenantId) {
      throw new Error("assignment_not_found");
    }
    if (input.evidence && input.evidenceMode !== "TEST_FIXTURE") {
      throw new Error("caller_supplied_evidence_rejected");
    }
    const setting = await this.store.getProfileSetting(workspaceId);
    const profile =
      lifecycleProfileById(assignment.profileId, assignment.profileVersion) ?? effectiveLifecycleProfile(setting);
    const query = {
      tenantId,
      workspaceId,
      projectId: assignment.projectId,
      scopeType: assignment.scopeType,
      scopeId: assignment.scopeId,
    };
    let evidence: LifecycleEvidence;
    let items;
    let evidenceSource: LifecycleEvidenceMode;
    if (input.evidenceMode === "TEST_FIXTURE") {
      if (!input.evidence) throw new Error("test_fixture_evidence_required");
      evidence = input.evidence;
      items = fixtureEvidenceToItems(evidence, query);
      evidenceSource = "TEST_FIXTURE";
    } else {
      const harvested = await harvestCanonicalLifecycleEvidence(this.evidenceSource, query);
      evidence = harvested.evidence;
      items = harvested.items;
      evidenceSource = "CANONICAL";
    }
    if (this.deliverables && !evidence.deliverables) {
      evidence = {
        ...evidence,
        deliverables: await this.deliverables.composedSummary(workspaceId, assignment.projectId),
      };
    }
    const previous = await this.store.latestEvaluation(assignment.id, input.gateId);
    const evaluation = evaluateLifecycleGate({
      tenantId,
      workspaceId,
      assignmentId: assignment.id,
      profile,
      gateId: input.gateId,
      evidence,
      enabledCriterionIds: enabledCriterionIds(setting, profile),
    });
    const snapshot = buildEvidenceSnapshot({
      assignment,
      profile,
      gateId: input.gateId,
      evidence,
      items,
      evidenceSource,
    });
    evaluation.evidenceSource = evidenceSource;
    evaluation.harvestedAt = snapshot.harvestedAt;
    evaluation.evidenceSnapshot = snapshot;
    if (previous && previous.evidenceFingerprint !== evaluation.evidenceFingerprint && !previous.stale) {
      await this.store.markEvaluationStale(previous.id);
    }
    const saved = await this.store.saveEvaluation(evaluation);
    await this.audit(tenantId, saved.id, "lifecycle_gate_evaluated");
    return saved;
  }

  async getEvaluation(commerce: CommerceExecutionContext, tenantId: string, evaluationId: string) {
    assertEngineeringService(commerce, "lifecycle.get", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) return null;
    const row = await this.store.getEvaluation(evaluationId);
    if (!row || row.workspaceId !== workspaceId) return null;
    return row;
  }

  async refreshStale(
    commerce: CommerceExecutionContext,
    tenantId: string,
    evaluationId: string,
    evidence?: LifecycleEvidence,
    evidenceMode?: LifecycleEvidenceMode,
  ) {
    assertEngineeringService(commerce, "lifecycle.evaluate", tenantId);
    const evaluation = await this.getEvaluation(commerce, tenantId, evaluationId);
    if (!evaluation) return null;
    if (evidence && evidenceMode !== "TEST_FIXTURE") throw new Error("caller_supplied_evidence_rejected");
    const assignment = await this.store.getAssignment(evaluation.assignmentId);
    if (!assignment) return evaluation;
    return this.evaluateGate(commerce, tenantId, {
      assignmentId: assignment.id,
      gateId: evaluation.gateId,
      evidence,
      evidenceMode,
    });
  }

  async recordGateDecision(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: {
      evaluationId: string;
      decision: GateDecisionStatus;
      rationale: string;
      actorId: string;
      outstandingConditionIds?: string[];
    },
  ) {
    assertEngineeringService(commerce, "lifecycle.decide", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    if (!input.actorId) throw new Error("human_actor_required");
    if (!input.rationale.trim()) throw new Error("rationale_required");
    const evaluation = await this.store.getEvaluation(input.evaluationId);
    if (!evaluation || evaluation.workspaceId !== workspaceId) throw new Error("evaluation_not_found");
    if (evaluation.stale || evaluation.readiness === "STALE") throw new Error("stale_gate_evaluation");
    if (evaluation.completeness !== "COMPLETE") throw new Error("gate_not_ready");
    if (evaluation.readiness !== "READY_FOR_REVIEW") {
      if (input.decision === "APPROVED_TO_TRANSITION" || input.decision === "APPROVED_WITH_CONDITIONS") {
        throw new Error("gate_not_ready");
      }
    }
    const saved = await this.store.saveDecision({
      id: crypto.randomUUID(),
      tenantId,
      workspaceId,
      evaluationId: evaluation.id,
      decision: input.decision,
      rationale: input.rationale,
      outstandingConditionIds: input.outstandingConditionIds ?? [],
      actorId: input.actorId,
      decidedAt: new Date().toISOString(),
    });
    await this.audit(tenantId, saved.id, "lifecycle_gate_decision");
    return {
      decision: saved,
      assuranceResolved: false,
      findingCreated: false,
      issueCreated: false,
      complianceDeclared: false,
      aiApproved: false,
    };
  }

  async transition(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: { assignmentId: string; toStage: LifecycleStage; evaluationId?: string; actorId: string; rationale: string },
  ) {
    assertEngineeringService(commerce, "lifecycle.transition", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    if (!input.actorId) throw new Error("human_actor_required");
    if (!input.rationale.trim()) throw new Error("rationale_required");
    const assignment = await this.store.getAssignment(input.assignmentId);
    if (!assignment || assignment.workspaceId !== workspaceId || assignment.tenantId !== tenantId) {
      throw new Error("assignment_not_found");
    }
    const profile = lifecycleProfileById(assignment.profileId, assignment.profileVersion);
    if (!profile) throw new Error("profile_version_mismatch");
    if (!transitionAllowed(profile, assignment.stage, input.toStage)) throw new Error("transition_not_allowed");
    const gate = gateForTransition(profile, assignment.stage, input.toStage);
    let evaluation = input.evaluationId ? await this.store.getEvaluation(input.evaluationId) : null;
    let decision = evaluation ? await this.store.latestDecision(evaluation.id) : null;
    if (gate?.required) {
      if (!evaluation) evaluation = await this.store.latestEvaluation(assignment.id, gate.gateId);
      if (!evaluation) throw new Error("gate_evaluation_required");
      if (evaluation.workspaceId !== workspaceId) throw new Error("cross_workspace_gate_evidence_denied");
      decision = await this.store.latestDecision(evaluation.id);
      const allowed = canAuthorizeTransition({
        evaluation,
        profileVersion: assignment.profileVersion,
        decision: decision ? { decision: decision.decision, evaluationId: decision.evaluationId } : null,
      });
      if (!allowed.ok) throw new Error(allowed.reason);
    }
    const updated = await this.store.updateAssignmentStage(assignment.id, assignment.stage, assignment.version, input.toStage);
    if (!updated) throw new Error("concurrent_transition_denied");
    const snapshot = {
      fromStage: assignment.stage,
      toStage: input.toStage,
      profileId: assignment.profileId,
      profileVersion: assignment.profileVersion,
      gateId: gate?.gateId ?? null,
      evaluationId: evaluation?.id ?? null,
      completeness: evaluation?.completeness ?? null,
      readiness: evaluation?.readiness ?? null,
      criteria: evaluation?.criteria ?? [],
      digitalThread: composeLifecycleThread({
        projectId: assignment.projectId,
        profileId: assignment.profileId,
        profileVersion: assignment.profileVersion,
        gateId: gate?.gateId ?? "none",
        evaluationId: evaluation?.id ?? "none",
        evidenceSnapshotFingerprint: evaluation?.evidenceFingerprint ?? null,
        decisionId: decision?.id,
        transitionId: "pending",
        toStage: input.toStage,
      }),
    };
    const transition = await this.store.appendTransition({
      id: crypto.randomUUID(),
      tenantId,
      workspaceId,
      assignmentId: assignment.id,
      fromStage: assignment.stage,
      toStage: input.toStage,
      gateId: gate?.gateId ?? null,
      evaluationId: evaluation?.id ?? null,
      decisionId: decision?.id ?? null,
      profileId: assignment.profileId,
      profileVersion: assignment.profileVersion,
      authorizedBy: input.actorId,
      authorizedAt: new Date().toISOString(),
      rationale: input.rationale,
      configurationBaselineId: evaluation?.criteria.find((row) => row.type === "CONFIGURATION_BASELINE_REQUIRED")?.evidenceRefs[0]?.objectId ?? null,
      evidenceFingerprint: evaluation?.evidenceFingerprint ?? "",
      snapshot,
    });
    await this.audit(tenantId, transition.id, "lifecycle_transition");
    return {
      assignment: updated,
      transition,
      thread: composeLifecycleThread({
        projectId: assignment.projectId,
        profileId: assignment.profileId,
        profileVersion: assignment.profileVersion,
        gateId: gate?.gateId ?? "none",
        evaluationId: evaluation?.id ?? "none",
        evidenceSnapshotFingerprint: evaluation?.evidenceFingerprint ?? null,
        decisionId: transition.decisionId,
        transitionId: transition.id,
        toStage: input.toStage,
      }),
      aiApproved: false,
      automaticTransition: false,
    };
  }

  async history(commerce: CommerceExecutionContext, tenantId: string, assignmentId: string) {
    assertEngineeringService(commerce, "lifecycle.get", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) return [];
    const assignment = await this.store.getAssignment(assignmentId);
    if (!assignment || assignment.workspaceId !== workspaceId) return [];
    return this.store.listTransitions(assignmentId);
  }

  async scheduleMappings(commerce: CommerceExecutionContext, tenantId: string, projectId: string) {
    assertEngineeringService(commerce, "lifecycle.get", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) return [];
    return this.store.listScheduleMappings(workspaceId, projectId);
  }

  async saveScheduleMapping(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: {
      projectId: string;
      sourceSystem?: LifecycleScheduleMapping["sourceSystem"];
      scheduleObjectId: string;
      schedulePhaseCode: string;
      expectedLifecycleStage: LifecycleStage;
      mappingType?: ScheduleMappingType;
      scheduleStatus?: LifecycleScheduleMapping["scheduleStatus"];
      active?: boolean;
      actorId: string;
    },
  ) {
    assertEngineeringService(commerce, "settings.update", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const saved = await this.store.saveScheduleMapping({
      id: crypto.randomUUID(),
      tenantId,
      workspaceId,
      projectId: input.projectId,
      sourceSystem: input.sourceSystem ?? "PROJECT_CONTROLS",
      scheduleObjectId: input.scheduleObjectId,
      schedulePhaseCode: input.schedulePhaseCode,
      expectedLifecycleStage: input.expectedLifecycleStage,
      mappingType: input.mappingType ?? "ALIGNS_WITH",
      scheduleStatus: input.scheduleStatus ?? "planned",
      active: input.active ?? true,
      configuredBy: input.actorId,
      configuredAt: new Date().toISOString(),
    });
    await this.audit(tenantId, saved.id, "lifecycle_schedule_mapping_configured");
    return saved;
  }

  async scheduleAlignment(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: { projectId: string; scopeType?: LifecycleScopeType; scopeId?: string; legacyProjectPhase?: string | null },
  ) {
    assertEngineeringService(commerce, "lifecycle.get", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) {
      return alignScheduleToLifecycle({ lifecycleStage: "UNKNOWN", mappings: [] });
    }
    const effective = await this.effective(commerce, tenantId, {
      projectId: input.projectId,
      scopeType: input.scopeType ?? "PROJECT",
      scopeId: input.scopeId ?? input.projectId,
    });
    const mappings = await this.store.listScheduleMappings(workspaceId, input.projectId);
    const alignment = alignScheduleToLifecycle({ lifecycleStage: effective.stage, mappings });
    const legacy = expectedStageFromLegacyProjectPhase(input.legacyProjectPhase);
    return {
      ...alignment,
      legacyProjectPhaseAuthority: false as const,
      legacyExpectedStage: legacy,
      note: "Project Controls activity does not change Engineering Lifecycle authority.",
    };
  }

  static memoryForTests(
    client: SupabaseClient = { from() { return {}; } } as never,
    source?: CanonicalEvidenceSource,
    deliverables?: EngineeringDeliverableService,
  ) {
    return new EngineeringLifecycleService(
      client,
      createMemoryLifecycleStore(),
      source ?? createMemoryCanonicalSource({ records: [] }),
      deliverables,
    );
  }

  private async audit(tenantId: string, objectId: string, action: string) {
    try {
      await db(this.supabase).from("engineering_audit_events").insert({
        tenant_id: tenantId,
        object_type: "lifecycle",
        object_id: objectId,
        action,
        metadata: { domain: "lifecycle-intelligence", aiApproved: false },
      });
    } catch {
      /* audit table may be absent in unit tests */
    }
  }
}
