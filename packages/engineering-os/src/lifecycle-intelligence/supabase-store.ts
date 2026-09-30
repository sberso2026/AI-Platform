import type { SupabaseClient } from "@rtb/database";
import type { LifecycleStore } from "./memory-store";
import type {
  LifecycleAssignment,
  LifecycleEvaluation,
  LifecycleGateDecision,
  LifecycleProfileSetting,
  LifecycleStage,
  LifecycleTransition,
} from "./types";

function db(client: SupabaseClient): { from(name: string): any } {
  return client as unknown as { from(name: string): any };
}

function fromAssignment(row: Record<string, unknown>): LifecycleAssignment {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    projectId: String(row.project_id),
    scopeType: row.scope_type as LifecycleAssignment["scopeType"],
    scopeId: String(row.scope_id),
    parentScopeType: (row.parent_scope_type as LifecycleAssignment["parentScopeType"]) ?? null,
    parentScopeId: (row.parent_scope_id as string | null) ?? null,
    stage: row.stage as LifecycleStage,
    profileId: String(row.profile_id),
    profileVersion: String(row.profile_version),
    version: Number(row.version ?? 1),
    assignedBy: (row.assigned_by as string | null) ?? null,
    assignedAt: String(row.assigned_at),
  };
}

function toAssignment(row: LifecycleAssignment): Record<string, unknown> {
  return {
    id: row.id,
    tenant_id: row.tenantId,
    workspace_id: row.workspaceId,
    project_id: row.projectId,
    scope_type: row.scopeType,
    scope_id: row.scopeId,
    parent_scope_type: row.parentScopeType ?? null,
    parent_scope_id: row.parentScopeId ?? null,
    stage: row.stage,
    profile_id: row.profileId,
    profile_version: row.profileVersion,
    version: row.version,
    assigned_by: row.assignedBy ?? null,
    assigned_at: row.assignedAt,
  };
}

function fromEvaluation(row: Record<string, unknown>): LifecycleEvaluation {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    assignmentId: String(row.assignment_id),
    gateId: String(row.gate_id),
    profileId: String(row.profile_id),
    profileVersion: String(row.profile_version),
    completeness: row.completeness as LifecycleEvaluation["completeness"],
    readiness: row.readiness as LifecycleEvaluation["readiness"],
    truncated: Boolean(row.truncated),
    remainingScopeUnknown: Boolean(row.remaining_scope_unknown),
    reason: (row.reason as string | null) ?? null,
    criteria: Array.isArray(row.criteria) ? (row.criteria as LifecycleEvaluation["criteria"]) : [],
    evidenceFingerprint: String(row.evidence_fingerprint ?? ""),
    createdAt: String(row.created_at),
    stale: Boolean(row.stale),
  };
}

function toEvaluation(row: LifecycleEvaluation): Record<string, unknown> {
  return {
    id: row.id,
    tenant_id: row.tenantId,
    workspace_id: row.workspaceId,
    assignment_id: row.assignmentId,
    gate_id: row.gateId,
    profile_id: row.profileId,
    profile_version: row.profileVersion,
    completeness: row.completeness,
    readiness: row.readiness,
    truncated: row.truncated,
    remaining_scope_unknown: row.remainingScopeUnknown,
    reason: row.reason ?? null,
    criteria: row.criteria,
    evidence_fingerprint: row.evidenceFingerprint,
    stale: row.stale,
    created_at: row.createdAt,
  };
}

function fromDecision(row: Record<string, unknown>): LifecycleGateDecision {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    evaluationId: String(row.evaluation_id),
    decision: row.decision as LifecycleGateDecision["decision"],
    rationale: String(row.rationale ?? ""),
    outstandingConditionIds: Array.isArray(row.outstanding_condition_ids)
      ? (row.outstanding_condition_ids as string[])
      : [],
    actorId: String(row.actor_id),
    decidedAt: String(row.decided_at),
  };
}

function fromTransition(row: Record<string, unknown>): LifecycleTransition {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    assignmentId: String(row.assignment_id),
    fromStage: row.from_stage as LifecycleStage,
    toStage: row.to_stage as LifecycleStage,
    gateId: (row.gate_id as string | null) ?? null,
    evaluationId: (row.evaluation_id as string | null) ?? null,
    decisionId: (row.decision_id as string | null) ?? null,
    profileId: String(row.profile_id),
    profileVersion: String(row.profile_version),
    authorizedBy: String(row.authorized_by),
    authorizedAt: String(row.authorized_at),
    rationale: String(row.rationale ?? ""),
    configurationBaselineId: (row.configuration_baseline_id as string | null) ?? null,
    evidenceFingerprint: String(row.evidence_fingerprint ?? ""),
    snapshot: (row.snapshot as Record<string, unknown>) ?? {},
  };
}

function fromSetting(row: Record<string, unknown>): LifecycleProfileSetting {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    projectId: (row.project_id as string | null) ?? null,
    profileId: String(row.profile_id),
    profileVersion: String(row.profile_version),
    enabledCriterionIds: Array.isArray(row.enabled_criterion_ids) ? (row.enabled_criterion_ids as string[]) : null,
    omittedStages: Array.isArray(row.omitted_stages) ? (row.omitted_stages as LifecycleStage[]) : [],
    configuredBy: String(row.configured_by ?? ""),
    configuredAt: String(row.configured_at),
  };
}

export class SupabaseLifecycleStore implements LifecycleStore {
  constructor(private readonly supabase: SupabaseClient) {}

  async getProfileSetting(workspaceId: string): Promise<LifecycleProfileSetting | null> {
    const { data, error } = await db(this.supabase)
      .from("engineering_lifecycle_profile_settings")
      .select("*")
      .eq("workspace_id", workspaceId)
      .maybeSingle();
    if (error || !data) return null;
    return fromSetting(data as Record<string, unknown>);
  }

  async saveProfileSetting(setting: LifecycleProfileSetting): Promise<LifecycleProfileSetting> {
    const { data, error } = await db(this.supabase)
      .from("engineering_lifecycle_profile_settings")
      .upsert({
        id: setting.id ?? crypto.randomUUID(),
        tenant_id: setting.tenantId,
        workspace_id: setting.workspaceId,
        project_id: setting.projectId ?? null,
        profile_id: setting.profileId,
        profile_version: setting.profileVersion,
        enabled_criterion_ids: setting.enabledCriterionIds,
        omitted_stages: setting.omittedStages,
        configured_by: setting.configuredBy,
        configured_at: setting.configuredAt,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return fromSetting(data as Record<string, unknown>);
  }

  async listAssignments(workspaceId: string, projectId: string): Promise<LifecycleAssignment[]> {
    const { data, error } = await db(this.supabase)
      .from("engineering_lifecycle_assignments")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("project_id", projectId)
      .order("assigned_at", { ascending: true });
    if (error) throw new Error(error.message);
    return ((data ?? []) as Record<string, unknown>[]).map(fromAssignment);
  }

  async getAssignment(id: string): Promise<LifecycleAssignment | null> {
    const { data, error } = await db(this.supabase)
      .from("engineering_lifecycle_assignments")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error || !data) return null;
    return fromAssignment(data as Record<string, unknown>);
  }

  async upsertAssignment(assignment: LifecycleAssignment): Promise<LifecycleAssignment> {
    const { data, error } = await db(this.supabase)
      .from("engineering_lifecycle_assignments")
      .upsert(toAssignment(assignment))
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return fromAssignment(data as Record<string, unknown>);
  }

  async updateAssignmentStage(
    id: string,
    fromStage: LifecycleStage,
    version: number,
    toStage: LifecycleStage,
  ): Promise<LifecycleAssignment | null> {
    const { data, error } = await db(this.supabase)
      .from("engineering_lifecycle_assignments")
      .update({ stage: toStage, version: version + 1 })
      .eq("id", id)
      .eq("stage", fromStage)
      .eq("version", version)
      .select("*")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    return fromAssignment(data as Record<string, unknown>);
  }

  async saveEvaluation(evaluation: LifecycleEvaluation): Promise<LifecycleEvaluation> {
    const { data, error } = await db(this.supabase)
      .from("engineering_lifecycle_evaluations")
      .insert(toEvaluation(evaluation))
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return fromEvaluation(data as Record<string, unknown>);
  }

  async getEvaluation(id: string): Promise<LifecycleEvaluation | null> {
    const { data, error } = await db(this.supabase)
      .from("engineering_lifecycle_evaluations")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error || !data) return null;
    return fromEvaluation(data as Record<string, unknown>);
  }

  async latestEvaluation(assignmentId: string, gateId: string): Promise<LifecycleEvaluation | null> {
    const { data, error } = await db(this.supabase)
      .from("engineering_lifecycle_evaluations")
      .select("*")
      .eq("assignment_id", assignmentId)
      .eq("gate_id", gateId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error || !data) return null;
    return fromEvaluation(data as Record<string, unknown>);
  }

  async markEvaluationStale(id: string): Promise<void> {
    const { error } = await db(this.supabase)
      .from("engineering_lifecycle_evaluations")
      .update({ stale: true, readiness: "STALE" })
      .eq("id", id);
    if (error) throw new Error(error.message);
  }

  async saveDecision(decision: LifecycleGateDecision): Promise<LifecycleGateDecision> {
    const { data, error } = await db(this.supabase)
      .from("engineering_lifecycle_gate_decisions")
      .insert({
        id: decision.id,
        tenant_id: decision.tenantId,
        workspace_id: decision.workspaceId,
        evaluation_id: decision.evaluationId,
        decision: decision.decision,
        rationale: decision.rationale,
        outstanding_condition_ids: decision.outstandingConditionIds ?? [],
        actor_id: decision.actorId,
        decided_at: decision.decidedAt,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return fromDecision(data as Record<string, unknown>);
  }

  async latestDecision(evaluationId: string): Promise<LifecycleGateDecision | null> {
    const { data, error } = await db(this.supabase)
      .from("engineering_lifecycle_gate_decisions")
      .select("*")
      .eq("evaluation_id", evaluationId)
      .order("decided_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error || !data) return null;
    return fromDecision(data as Record<string, unknown>);
  }

  async appendTransition(transition: LifecycleTransition): Promise<LifecycleTransition> {
    const { data, error } = await db(this.supabase)
      .from("engineering_lifecycle_transitions")
      .insert({
        id: transition.id,
        tenant_id: transition.tenantId,
        workspace_id: transition.workspaceId,
        assignment_id: transition.assignmentId,
        from_stage: transition.fromStage,
        to_stage: transition.toStage,
        gate_id: transition.gateId ?? null,
        evaluation_id: transition.evaluationId ?? null,
        decision_id: transition.decisionId ?? null,
        profile_id: transition.profileId,
        profile_version: transition.profileVersion,
        authorized_by: transition.authorizedBy,
        authorized_at: transition.authorizedAt,
        rationale: transition.rationale,
        configuration_baseline_id: transition.configurationBaselineId ?? null,
        evidence_fingerprint: transition.evidenceFingerprint,
        snapshot: transition.snapshot,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return fromTransition(data as Record<string, unknown>);
  }

  async listTransitions(assignmentId: string): Promise<LifecycleTransition[]> {
    const { data, error } = await db(this.supabase)
      .from("engineering_lifecycle_transitions")
      .select("*")
      .eq("assignment_id", assignmentId)
      .order("authorized_at", { ascending: true });
    if (error) throw new Error(error.message);
    return ((data ?? []) as Record<string, unknown>[]).map(fromTransition);
  }
}
