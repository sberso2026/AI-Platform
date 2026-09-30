import type { SupabaseClient } from "@rtb/database";
import type { DeliverableStore } from "./memory-store";
import type {
  DeliverableAssessment,
  DeliverableArtifactBinding,
  DeliverableExpectation,
  DeliverableProfileSetting,
  DeliverableWaiver,
  LifecycleStage,
  MaturityPurpose,
} from "./types";

function db(client: SupabaseClient): { from(name: string): any } {
  return client as unknown as { from(name: string): any };
}

function fromExpectation(row: Record<string, unknown>): DeliverableExpectation {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    projectId: String(row.project_id),
    definitionId: String(row.definition_id),
    definitionVersion: String(row.definition_version),
    definitionCode: String(row.definition_code),
    lifecycleProfileId: String(row.lifecycle_profile_id),
    lifecycleProfileVersion: String(row.lifecycle_profile_version),
    lifecycleStage: row.lifecycle_stage as LifecycleStage,
    scopeType: row.scope_type as DeliverableExpectation["scopeType"],
    scopeId: String(row.scope_id),
    requirementState: row.requirement_state as DeliverableExpectation["requirementState"],
    intendedPurpose: row.intended_purpose as MaturityPurpose,
    maturityProfileId: String(row.maturity_profile_id),
    maturityProfileVersion: String(row.maturity_profile_version),
    responsibleDiscipline: String(row.responsible_discipline),
    contributingDisciplines: Array.isArray(row.contributing_disciplines) ? (row.contributing_disciplines as string[]) : [],
    scheduleObjectId: (row.schedule_object_id as string | null) ?? null,
    scheduleStatus: (row.schedule_status as DeliverableExpectation["scheduleStatus"]) ?? null,
    origin: row.origin as DeliverableExpectation["origin"],
    createdBy: String(row.created_by ?? ""),
    createdAt: String(row.created_at),
  };
}

export class SupabaseDeliverableStore implements DeliverableStore {
  constructor(private readonly supabase: SupabaseClient) {}

  async getProfileSetting(workspaceId: string): Promise<DeliverableProfileSetting | null> {
    const { data, error } = await db(this.supabase)
      .from("engineering_deliverable_profile_settings")
      .select("*")
      .eq("workspace_id", workspaceId)
      .maybeSingle();
    if (error || !data) return null;
    const row = data as Record<string, unknown>;
    return {
      id: String(row.id),
      tenantId: String(row.tenant_id),
      workspaceId: String(row.workspace_id),
      enabledDefinitionIds: Array.isArray(row.enabled_definition_ids) ? (row.enabled_definition_ids as string[]) : null,
      maturityProfileId: String(row.maturity_profile_id),
      maturityProfileVersion: String(row.maturity_profile_version),
      configuredBy: String(row.configured_by ?? ""),
      configuredAt: String(row.configured_at),
    };
  }

  async saveProfileSetting(setting: DeliverableProfileSetting): Promise<DeliverableProfileSetting> {
    const { data, error } = await db(this.supabase)
      .from("engineering_deliverable_profile_settings")
      .upsert({
        id: setting.id ?? crypto.randomUUID(),
        tenant_id: setting.tenantId,
        workspace_id: setting.workspaceId,
        enabled_definition_ids: setting.enabledDefinitionIds,
        maturity_profile_id: setting.maturityProfileId,
        maturity_profile_version: setting.maturityProfileVersion,
        configured_by: setting.configuredBy,
        configured_at: setting.configuredAt,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return (await this.getProfileSetting(setting.workspaceId))!;
  }

  async listExpectations(workspaceId: string, projectId: string): Promise<DeliverableExpectation[]> {
    const { data, error } = await db(this.supabase)
      .from("engineering_deliverable_expectations")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return ((data ?? []) as Record<string, unknown>[]).map(fromExpectation);
  }

  async getExpectation(id: string): Promise<DeliverableExpectation | null> {
    const { data, error } = await db(this.supabase).from("engineering_deliverable_expectations").select("*").eq("id", id).maybeSingle();
    if (error || !data) return null;
    return fromExpectation(data as Record<string, unknown>);
  }

  async saveExpectation(row: DeliverableExpectation): Promise<DeliverableExpectation> {
    const { data, error } = await db(this.supabase)
      .from("engineering_deliverable_expectations")
      .upsert({
        id: row.id,
        tenant_id: row.tenantId,
        workspace_id: row.workspaceId,
        project_id: row.projectId,
        definition_id: row.definitionId,
        definition_version: row.definitionVersion,
        definition_code: row.definitionCode,
        lifecycle_profile_id: row.lifecycleProfileId,
        lifecycle_profile_version: row.lifecycleProfileVersion,
        lifecycle_stage: row.lifecycleStage,
        scope_type: row.scopeType,
        scope_id: row.scopeId,
        requirement_state: row.requirementState,
        intended_purpose: row.intendedPurpose,
        maturity_profile_id: row.maturityProfileId,
        maturity_profile_version: row.maturityProfileVersion,
        responsible_discipline: row.responsibleDiscipline,
        contributing_disciplines: row.contributingDisciplines,
        schedule_object_id: row.scheduleObjectId ?? null,
        schedule_status: row.scheduleStatus ?? null,
        origin: row.origin,
        created_by: row.createdBy,
        created_at: row.createdAt,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return fromExpectation(data as Record<string, unknown>);
  }

  async listBindings(expectationId: string): Promise<DeliverableArtifactBinding[]> {
    const { data, error } = await db(this.supabase)
      .from("engineering_deliverable_artifact_bindings")
      .select("*")
      .eq("expectation_id", expectationId);
    if (error) throw new Error(error.message);
    return ((data ?? []) as Record<string, unknown>[]).map((row) => ({
      id: String(row.id),
      tenantId: String(row.tenant_id),
      workspaceId: String(row.workspace_id),
      expectationId: String(row.expectation_id),
      artifactClass: row.artifact_class as DeliverableArtifactBinding["artifactClass"],
      artifactId: String(row.artifact_id),
      artifactRole: row.artifact_role as DeliverableArtifactBinding["artifactRole"],
      revisionRef: (row.revision_ref as string | null) ?? null,
      boundBy: String(row.bound_by ?? ""),
      boundAt: String(row.bound_at),
    }));
  }

  async saveBinding(row: DeliverableArtifactBinding): Promise<DeliverableArtifactBinding> {
    const { error } = await db(this.supabase).from("engineering_deliverable_artifact_bindings").insert({
      id: row.id,
      tenant_id: row.tenantId,
      workspace_id: row.workspaceId,
      expectation_id: row.expectationId,
      artifact_class: row.artifactClass,
      artifact_id: row.artifactId,
      artifact_role: row.artifactRole,
      revision_ref: row.revisionRef ?? null,
      bound_by: row.boundBy,
      bound_at: row.boundAt,
    });
    if (error) throw new Error(error.message);
    return row;
  }

  async saveAssessment(row: DeliverableAssessment): Promise<DeliverableAssessment> {
    const { error } = await db(this.supabase).from("engineering_deliverable_assessments").insert({
      id: row.id,
      tenant_id: row.tenantId,
      workspace_id: row.workspaceId,
      expectation_id: row.expectationId,
      maturity_profile_id: row.maturityProfileId,
      maturity_profile_version: row.maturityProfileVersion,
      intended_purpose: row.intendedPurpose,
      completeness: row.completeness,
      readiness: row.readiness,
      truncated: row.truncated,
      stale: row.stale,
      evidence_source: row.evidenceSource,
      evidence_fingerprint: row.evidenceFingerprint,
      dimensions: row.dimensions,
      artifact_refs: row.artifactRefs,
      assurance_signals: row.assuranceSignals,
      digital_thread: row.digitalThread,
      waiver_ids: row.waiverIds,
      reason: row.reason ?? null,
      assessed_at: row.assessedAt,
      harvested_at: row.harvestedAt,
    });
    if (error) throw new Error(error.message);
    return row;
  }

  async getAssessment(id: string): Promise<DeliverableAssessment | null> {
    const { data, error } = await db(this.supabase).from("engineering_deliverable_assessments").select("*").eq("id", id).maybeSingle();
    if (error || !data) return null;
    return this.mapAssessment(data as Record<string, unknown>);
  }

  async latestAssessment(expectationId: string): Promise<DeliverableAssessment | null> {
    const { data, error } = await db(this.supabase)
      .from("engineering_deliverable_assessments")
      .select("*")
      .eq("expectation_id", expectationId)
      .order("assessed_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error || !data) return null;
    return this.mapAssessment(data as Record<string, unknown>);
  }

  async markAssessmentStale(id: string): Promise<void> {
    const { error } = await db(this.supabase)
      .from("engineering_deliverable_assessments")
      .update({ stale: true, readiness: "STALE" })
      .eq("id", id);
    if (error) throw new Error(error.message);
  }

  async saveWaiver(row: DeliverableWaiver): Promise<DeliverableWaiver> {
    const { error } = await db(this.supabase).from("engineering_deliverable_waivers").insert({
      id: row.id,
      tenant_id: row.tenantId,
      workspace_id: row.workspaceId,
      expectation_id: row.expectationId,
      assessment_id: row.assessmentId,
      dimension: row.dimension,
      rationale: row.rationale,
      actor_id: row.actorId,
      supporting_decision_id: row.supportingDecisionId ?? null,
      supporting_review_id: row.supportingReviewId ?? null,
      waived_at: row.waivedAt,
    });
    if (error) throw new Error(error.message);
    return row;
  }

  async listWaivers(expectationId: string): Promise<DeliverableWaiver[]> {
    const { data, error } = await db(this.supabase)
      .from("engineering_deliverable_waivers")
      .select("*")
      .eq("expectation_id", expectationId);
    if (error) throw new Error(error.message);
    return ((data ?? []) as Record<string, unknown>[]).map((row) => ({
      id: String(row.id),
      tenantId: String(row.tenant_id),
      workspaceId: String(row.workspace_id),
      expectationId: String(row.expectation_id),
      assessmentId: String(row.assessment_id),
      dimension: row.dimension as DeliverableWaiver["dimension"],
      rationale: String(row.rationale ?? ""),
      actorId: String(row.actor_id),
      supportingDecisionId: (row.supporting_decision_id as string | null) ?? null,
      supportingReviewId: (row.supporting_review_id as string | null) ?? null,
      waivedAt: String(row.waived_at),
    }));
  }

  async overlayWaiver(assessmentId: string, dimensions: DeliverableAssessment["dimensions"], waiverIds: string[]): Promise<void> {
    const { error } = await db(this.supabase)
      .from("engineering_deliverable_assessments")
      .update({ dimensions, waiver_ids: waiverIds })
      .eq("id", assessmentId);
    if (error) throw new Error(error.message);
  }

  private mapAssessment(row: Record<string, unknown>): DeliverableAssessment {
    return {
      id: String(row.id),
      tenantId: String(row.tenant_id),
      workspaceId: String(row.workspace_id),
      expectationId: String(row.expectation_id),
      maturityProfileId: String(row.maturity_profile_id),
      maturityProfileVersion: String(row.maturity_profile_version),
      intendedPurpose: row.intended_purpose as MaturityPurpose,
      completeness: row.completeness as DeliverableAssessment["completeness"],
      readiness: row.readiness as DeliverableAssessment["readiness"],
      truncated: Boolean(row.truncated),
      stale: Boolean(row.stale),
      evidenceSource: row.evidence_source as DeliverableAssessment["evidenceSource"],
      evidenceFingerprint: String(row.evidence_fingerprint ?? ""),
      dimensions: Array.isArray(row.dimensions) ? (row.dimensions as DeliverableAssessment["dimensions"]) : [],
      artifactRefs: Array.isArray(row.artifact_refs) ? (row.artifact_refs as DeliverableAssessment["artifactRefs"]) : [],
      assuranceSignals: Array.isArray(row.assurance_signals) ? (row.assurance_signals as DeliverableAssessment["assuranceSignals"]) : [],
      digitalThread: String(row.digital_thread ?? ""),
      waiverIds: Array.isArray(row.waiver_ids) ? (row.waiver_ids as string[]) : [],
      reason: (row.reason as string | null) ?? null,
      assessedAt: String(row.assessed_at),
      harvestedAt: String(row.harvested_at),
    };
  }
}
