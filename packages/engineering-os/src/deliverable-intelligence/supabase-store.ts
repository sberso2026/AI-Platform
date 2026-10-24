import type { SupabaseClient } from "@rtb/database";
import type { DeliverableStore } from "./memory-store";
import type {
  DeliverableAssessment,
  DeliverableArtifactBinding,
  DeliverableExpectation,
  DeliverableProfileSetting,
  DeliverableWaiver,
  DocumentStatusMapping,
  LifecycleStage,
  MaturityPurpose,
  ProjectDeliverableDefinition,
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
    adoptedFromTemplate: Boolean(row.adopted_from_template),
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
        adopted_from_template: Boolean(row.adoptedFromTemplate),
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
      revisionPolicy: (row.revision_policy as DeliverableArtifactBinding["revisionPolicy"]) ?? undefined,
      resolvedRevision: (row.resolved_revision as string | null) ?? null,
      rawStatusCode: (row.raw_status_code as string | null) ?? null,
      mappedSemantic: (row.mapped_semantic as DeliverableArtifactBinding["mappedSemantic"]) ?? null,
      mappingVersion: (row.mapping_version as string | null) ?? null,
      baselineId: (row.baseline_id as string | null) ?? null,
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
      revision_policy: row.revisionPolicy ?? null,
      resolved_revision: row.resolvedRevision ?? null,
      raw_status_code: row.rawStatusCode ?? null,
      mapped_semantic: row.mappedSemantic ?? null,
      mapping_version: row.mappingVersion ?? null,
      baseline_id: row.baselineId ?? null,
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

  async listStatusMappings(workspaceId: string, projectId?: string | null): Promise<DocumentStatusMapping[]> {
    let q = db(this.supabase).from("engineering_document_status_mappings").select("*").eq("workspace_id", workspaceId);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return ((data ?? []) as Record<string, unknown>[])
      .map(fromMapping)
      .filter((row) => !projectId || !row.projectId || row.projectId === projectId);
  }

  async saveStatusMapping(row: DocumentStatusMapping): Promise<DocumentStatusMapping> {
    const { data, error } = await db(this.supabase)
      .from("engineering_document_status_mappings")
      .upsert({
        id: row.id,
        tenant_id: row.tenantId,
        workspace_id: row.workspaceId,
        project_id: row.projectId ?? null,
        source_system: row.sourceSystem,
        raw_status_code: row.rawStatusCode,
        semantic: row.semantic,
        mapping_version: row.mappingVersion,
        enabled: row.enabled,
        description: row.description ?? null,
        configured_by: row.configuredBy,
        configured_at: row.configuredAt,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return fromMapping(data as Record<string, unknown>);
  }

  async getProjectDefinition(workspaceId: string, definitionId: string, version: string): Promise<ProjectDeliverableDefinition | null> {
    const { data, error } = await db(this.supabase)
      .from("engineering_project_deliverable_definitions")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("definition_id", definitionId)
      .eq("definition_version", version)
      .maybeSingle();
    if (error || !data) return null;
    return fromProjectDefinition(data as Record<string, unknown>);
  }

  async listProjectDefinitions(workspaceId: string, projectId: string): Promise<ProjectDeliverableDefinition[]> {
    const { data, error } = await db(this.supabase)
      .from("engineering_project_deliverable_definitions")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("project_id", projectId);
    if (error) throw new Error(error.message);
    return ((data ?? []) as Record<string, unknown>[]).map(fromProjectDefinition);
  }

  async saveProjectDefinition(row: ProjectDeliverableDefinition): Promise<ProjectDeliverableDefinition> {
    const { data, error } = await db(this.supabase)
      .from("engineering_project_deliverable_definitions")
      .upsert({
        id: crypto.randomUUID(),
        tenant_id: row.tenantId,
        workspace_id: row.workspaceId,
        project_id: row.projectId,
        definition_id: row.definitionId,
        definition_version: row.definitionVersion,
        code: row.code,
        name: row.name,
        purpose: row.purpose,
        origin: row.origin,
        artifact_classes: row.artifactClasses,
        responsible_discipline: row.responsibleDiscipline,
        contributing_disciplines: row.contributingDisciplines,
        lifecycle_stages: row.lifecycleStages,
        multidisciplinary: row.multidisciplinary,
        required_roles: row.requiredRoles,
        coordination_required: row.coordinationRequired,
        analysis_required: row.analysisRequired,
        review_required: row.reviewRequired,
        traceability_required: row.traceabilityRequired,
        configuration_required: row.configurationRequired,
        rationale: row.rationale ?? null,
        created_by: row.createdBy,
        created_at: row.createdAt,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return fromProjectDefinition(data as Record<string, unknown>);
  }

  async listAssessments(workspaceId: string, projectId?: string): Promise<DeliverableAssessment[]> {
    const { data, error } = await db(this.supabase)
      .from("engineering_deliverable_assessments")
      .select("*")
      .eq("workspace_id", workspaceId);
    if (error) throw new Error(error.message);
    const rows = ((data ?? []) as Record<string, unknown>[]).map((row) => this.mapAssessment(row));
    if (!projectId) return rows;
    const expectations = await db(this.supabase)
      .from("engineering_deliverable_expectations")
      .select("id")
      .eq("workspace_id", workspaceId)
      .eq("project_id", projectId);
    const ids = new Set(((expectations.data ?? []) as Array<{ id: string }>).map((row) => row.id));
    return rows.filter((row) => ids.has(row.expectationId));
  }
}

function fromMapping(row: Record<string, unknown>): DocumentStatusMapping {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    projectId: (row.project_id as string | null) ?? null,
    sourceSystem: String(row.source_system ?? "project"),
    rawStatusCode: String(row.raw_status_code),
    semantic: row.semantic as DocumentStatusMapping["semantic"],
    mappingVersion: String(row.mapping_version),
    enabled: row.enabled !== false,
    description: (row.description as string | null) ?? null,
    configuredBy: String(row.configured_by ?? ""),
    configuredAt: String(row.configured_at),
  };
}

function fromProjectDefinition(row: Record<string, unknown>): ProjectDeliverableDefinition {
  return {
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    projectId: String(row.project_id),
    definitionId: String(row.definition_id),
    definitionVersion: String(row.definition_version),
    code: String(row.code),
    name: String(row.name),
    purpose: String(row.purpose ?? ""),
    origin: "PROJECT_CONFIGURED",
    artifactClasses: Array.isArray(row.artifact_classes) ? (row.artifact_classes as ProjectDeliverableDefinition["artifactClasses"]) : ["document"],
    responsibleDiscipline: String(row.responsible_discipline),
    contributingDisciplines: Array.isArray(row.contributing_disciplines) ? (row.contributing_disciplines as string[]) : [],
    lifecycleStages: Array.isArray(row.lifecycle_stages) ? (row.lifecycle_stages as ProjectDeliverableDefinition["lifecycleStages"]) : ["FEED"],
    multidisciplinary: Boolean(row.multidisciplinary),
    requiredRoles: Array.isArray(row.required_roles) ? (row.required_roles as ProjectDeliverableDefinition["requiredRoles"]) : ["PRIMARY"],
    coordinationRequired: Boolean(row.coordination_required),
    analysisRequired: Boolean(row.analysis_required),
    reviewRequired: Boolean(row.review_required),
    traceabilityRequired: Boolean(row.traceability_required),
    configurationRequired: Boolean(row.configuration_required),
    rationale: (row.rationale as string | null) ?? null,
    createdBy: String(row.created_by ?? ""),
    createdAt: String(row.created_at),
  };
}
