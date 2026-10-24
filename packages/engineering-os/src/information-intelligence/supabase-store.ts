import type { SupabaseClient } from "@rtb/database";
import type { EngineeringInformationRef, InformationAuthorityPolicy, InformationAuthorityResolution } from "./types";
import type { InformationStore } from "./memory-store";

function db(client: SupabaseClient): { from(name: string): any } {
  return client as unknown as { from(name: string): any };
}

function mapRef(row: Record<string, unknown>): EngineeringInformationRef {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    projectId: String(row.project_id),
    sourceObjectType: row.source_object_type as EngineeringInformationRef["sourceObjectType"],
    sourceObjectId: String(row.source_object_id),
    informationType: row.information_type as EngineeringInformationRef["informationType"],
    sourceKind: row.source_kind as EngineeringInformationRef["sourceKind"],
    discipline: (row.discipline as string | null) ?? null,
    responsibleDiscipline: (row.responsible_discipline as string | null) ?? null,
    systemId: (row.system_id as string | null) ?? null,
    assetId: (row.asset_id as string | null) ?? null,
    lifecycleStage: (row.lifecycle_stage as string | null) ?? null,
    purpose: row.purpose as EngineeringInformationRef["purpose"],
    configurationBaselineId: (row.configuration_baseline_id as string | null) ?? null,
    eligibility: row.eligibility as EngineeringInformationRef["eligibility"],
    sourceFacts: (row.source_facts as EngineeringInformationRef["sourceFacts"]) ?? {},
    createdBy: (row.created_by as string | null) ?? null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapPolicy(row: Record<string, unknown>): InformationAuthorityPolicy {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    projectId: (row.project_id as string | null) ?? null,
    policyId: String(row.policy_id),
    policyVersion: String(row.policy_version),
    informationType: row.information_type as InformationAuthorityPolicy["informationType"],
    purpose: row.purpose as InformationAuthorityPolicy["purpose"],
    discipline: (row.discipline as string | null) ?? null,
    systemId: (row.system_id as string | null) ?? null,
    lifecycleStage: (row.lifecycle_stage as string | null) ?? null,
    eligibleSourceKinds: (row.eligible_source_kinds as InformationAuthorityPolicy["eligibleSourceKinds"]) ?? [],
    eligibleSourceObjectTypes: (row.eligible_source_object_types as InformationAuthorityPolicy["eligibleSourceObjectTypes"]) ?? [],
    requireAuthoritativeSource: Boolean(row.require_authoritative_source),
    createdBy: (row.created_by as string | null) ?? null,
    createdAt: String(row.created_at),
  };
}

function mapResolution(row: Record<string, unknown>): InformationAuthorityResolution {
  return row.payload as InformationAuthorityResolution;
}

export class SupabaseInformationStore implements InformationStore {
  constructor(private readonly supabase: SupabaseClient) {}

  async listRefs(workspaceId: string, projectId: string) {
    const { data, error } = await db(this.supabase)
      .from("engineering_information_refs")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("project_id", projectId);
    if (error) throw new Error(error.message);
    return ((data ?? []) as Record<string, unknown>[]).map(mapRef);
  }

  async getRef(id: string) {
    const { data, error } = await db(this.supabase).from("engineering_information_refs").select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapRef(data as Record<string, unknown>) : null;
  }

  async saveRef(row: EngineeringInformationRef) {
    const { data, error } = await db(this.supabase)
      .from("engineering_information_refs")
      .upsert({
        id: row.id,
        tenant_id: row.tenantId,
        workspace_id: row.workspaceId,
        project_id: row.projectId,
        source_object_type: row.sourceObjectType,
        source_object_id: row.sourceObjectId,
        information_type: row.informationType,
        source_kind: row.sourceKind,
        discipline: row.discipline,
        responsible_discipline: row.responsibleDiscipline,
        system_id: row.systemId,
        asset_id: row.assetId,
        lifecycle_stage: row.lifecycleStage,
        purpose: row.purpose,
        configuration_baseline_id: row.configurationBaselineId,
        eligibility: row.eligibility,
        source_facts: row.sourceFacts,
        created_by: row.createdBy,
        created_at: row.createdAt,
        updated_at: row.updatedAt,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return mapRef(data as Record<string, unknown>);
  }

  async listPolicies(workspaceId: string, projectId?: string | null) {
    const { data, error } = await db(this.supabase)
      .from("engineering_information_authority_policies")
      .select("*")
      .eq("workspace_id", workspaceId);
    if (error) throw new Error(error.message);
    const rows = ((data ?? []) as Record<string, unknown>[]).map(mapPolicy);
    if (!projectId) return rows;
    return rows.filter((row) => row.projectId === projectId || row.projectId == null);
  }

  async getPolicy(id: string) {
    const { data, error } = await db(this.supabase).from("engineering_information_authority_policies").select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapPolicy(data as Record<string, unknown>) : null;
  }

  async savePolicy(row: InformationAuthorityPolicy) {
    const { data, error } = await db(this.supabase)
      .from("engineering_information_authority_policies")
      .upsert({
        id: row.id,
        tenant_id: row.tenantId,
        workspace_id: row.workspaceId,
        project_id: row.projectId,
        policy_id: row.policyId,
        policy_version: row.policyVersion,
        information_type: row.informationType,
        purpose: row.purpose,
        discipline: row.discipline,
        system_id: row.systemId,
        lifecycle_stage: row.lifecycleStage,
        eligible_source_kinds: row.eligibleSourceKinds,
        eligible_source_object_types: row.eligibleSourceObjectTypes,
        require_authoritative_source: row.requireAuthoritativeSource,
        created_by: row.createdBy,
        created_at: row.createdAt,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return mapPolicy(data as Record<string, unknown>);
  }

  async saveResolution(row: InformationAuthorityResolution) {
    const { error } = await db(this.supabase).from("engineering_information_authority_resolutions").upsert({
      id: row.id,
      tenant_id: row.tenantId,
      workspace_id: row.workspaceId,
      project_id: row.projectId,
      policy_id: row.policyId,
      policy_version: row.policyVersion,
      information_type: row.informationType,
      purpose: row.purpose,
      outcome: row.outcome,
      selected_ref_id: row.selectedRefId,
      payload: row,
      created_at: row.createdAt,
    });
    if (error) throw new Error(error.message);
    return row;
  }

  async listResolutions(workspaceId: string, projectId: string) {
    const { data, error } = await db(this.supabase)
      .from("engineering_information_authority_resolutions")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("project_id", projectId);
    if (error) throw new Error(error.message);
    return ((data ?? []) as Record<string, unknown>[]).map(mapResolution);
  }

  async getResolution(id: string) {
    const { data, error } = await db(this.supabase).from("engineering_information_authority_resolutions").select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapResolution(data as Record<string, unknown>) : null;
  }
}
