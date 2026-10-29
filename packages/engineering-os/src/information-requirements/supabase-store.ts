import type { SupabaseClient } from "@rtb/database";
import type {
  EngineeringHandoverPackage,
  EngineeringInformationRequirement,
  HandoverPackageItem,
  InformationRequirementSatisfaction,
  InformationRequirementTemplate,
} from "./types";
import type { InformationRequirementStore } from "./memory-store";
import { INFORMATION_REQUIREMENT_TEMPLATES } from "./catalog";

function db(client: SupabaseClient): { from(name: string): any } {
  return client as unknown as { from(name: string): any };
}

function mapRequirement(row: Record<string, unknown>): EngineeringInformationRequirement {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    projectId: String(row.project_id),
    requirementType: row.requirement_type as EngineeringInformationRequirement["requirementType"],
    informationType: row.information_type as EngineeringInformationRequirement["informationType"],
    purpose: row.purpose as EngineeringInformationRequirement["purpose"],
    title: String(row.title),
    whyRequired: String(row.why_required),
    providerKind: row.provider_kind as EngineeringInformationRequirement["providerKind"],
    providerDiscipline: (row.provider_discipline as string | null) ?? null,
    providerOrg: (row.provider_org as string | null) ?? null,
    providerRole: (row.provider_role as string | null) ?? null,
    consumerKind: row.consumer_kind as EngineeringInformationRequirement["consumerKind"],
    consumerDiscipline: (row.consumer_discipline as string | null) ?? null,
    consumerOrg: (row.consumer_org as string | null) ?? null,
    consumerRole: (row.consumer_role as string | null) ?? null,
    systemId: (row.system_id as string | null) ?? null,
    assetId: (row.asset_id as string | null) ?? null,
    packageId: (row.package_id as string | null) ?? null,
    interfaceId: (row.interface_id as string | null) ?? null,
    deliverableId: (row.deliverable_id as string | null) ?? null,
    lifecycleStage: (row.lifecycle_stage as EngineeringInformationRequirement["lifecycleStage"]) ?? null,
    neededBy: (row.needed_by as string | null) ?? null,
    requiredForObjectType: (row.required_for_object_type as string | null) ?? null,
    requiredForObjectId: (row.required_for_object_id as string | null) ?? null,
    workType: (row.work_type as EngineeringInformationRequirement["workType"]) ?? null,
    acceptanceCriteriaRef: (row.acceptance_criteria_ref as string | null) ?? null,
    blocking: Boolean(row.blocking),
    requireAuthoritative: Boolean(row.require_authoritative),
    requireManagedSource: Boolean(row.require_managed_source),
    status: row.status as EngineeringInformationRequirement["status"],
    constructionRequestId: (row.construction_request_id as string | null) ?? null,
    createdBy: (row.created_by as string | null) ?? null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapSatisfaction(row: Record<string, unknown>): InformationRequirementSatisfaction {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    requirementId: String(row.requirement_id),
    informationRefId: String(row.information_ref_id),
    managedRepositoryId: (row.managed_repository_id as string | null) ?? null,
    unmanagedRejected: Boolean(row.unmanaged_rejected),
    acceptedForPurpose: Boolean(row.accepted_for_purpose),
    rejected: Boolean(row.rejected),
    engineeringApproved: false,
    createdAt: String(row.created_at),
  };
}

function mapPackage(row: Record<string, unknown>): EngineeringHandoverPackage {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    projectId: String(row.project_id),
    displayName: String(row.display_name),
    systemId: (row.system_id as string | null) ?? null,
    assetId: (row.asset_id as string | null) ?? null,
    discipline: (row.discipline as string | null) ?? null,
    lifecycleStage: (row.lifecycle_stage as EngineeringHandoverPackage["lifecycleStage"]) ?? null,
    state: row.state as EngineeringHandoverPackage["state"],
    acceptedBy: (row.accepted_by as string | null) ?? null,
    acceptedAt: (row.accepted_at as string | null) ?? null,
    createdBy: (row.created_by as string | null) ?? null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export class SupabaseInformationRequirementStore implements InformationRequirementStore {
  constructor(private readonly supabase: SupabaseClient) {}

  async listRequirements(workspaceId: string, projectId: string) {
    const { data, error } = await db(this.supabase)
      .from("engineering_information_requirements")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("project_id", projectId);
    if (error) throw new Error(error.message);
    return ((data ?? []) as Record<string, unknown>[]).map(mapRequirement);
  }

  async getRequirement(id: string) {
    const { data, error } = await db(this.supabase).from("engineering_information_requirements").select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapRequirement(data as Record<string, unknown>) : null;
  }

  async saveRequirement(row: EngineeringInformationRequirement) {
    const { data, error } = await db(this.supabase)
      .from("engineering_information_requirements")
      .upsert({
        id: row.id,
        tenant_id: row.tenantId,
        workspace_id: row.workspaceId,
        project_id: row.projectId,
        requirement_type: row.requirementType,
        information_type: row.informationType,
        purpose: row.purpose,
        title: row.title,
        why_required: row.whyRequired,
        provider_kind: row.providerKind,
        provider_discipline: row.providerDiscipline,
        provider_org: row.providerOrg,
        provider_role: row.providerRole,
        consumer_kind: row.consumerKind,
        consumer_discipline: row.consumerDiscipline,
        consumer_org: row.consumerOrg,
        consumer_role: row.consumerRole,
        system_id: row.systemId,
        asset_id: row.assetId,
        package_id: row.packageId,
        interface_id: row.interfaceId,
        deliverable_id: row.deliverableId,
        lifecycle_stage: row.lifecycleStage,
        needed_by: row.neededBy,
        required_for_object_type: row.requiredForObjectType,
        required_for_object_id: row.requiredForObjectId,
        work_type: row.workType,
        acceptance_criteria_ref: row.acceptanceCriteriaRef,
        blocking: row.blocking,
        require_authoritative: row.requireAuthoritative,
        require_managed_source: row.requireManagedSource,
        status: row.status,
        construction_request_id: row.constructionRequestId,
        created_by: row.createdBy,
        created_at: row.createdAt,
        updated_at: row.updatedAt,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return mapRequirement(data as Record<string, unknown>);
  }

  async listSatisfactions(workspaceId: string, requirementIds: string[]) {
    if (!requirementIds.length) return [];
    const { data, error } = await db(this.supabase)
      .from("engineering_information_requirement_satisfactions")
      .select("*")
      .eq("workspace_id", workspaceId)
      .in("requirement_id", requirementIds);
    if (error) throw new Error(error.message);
    return ((data ?? []) as Record<string, unknown>[]).map(mapSatisfaction);
  }

  async saveSatisfaction(row: InformationRequirementSatisfaction) {
    const { data, error } = await db(this.supabase)
      .from("engineering_information_requirement_satisfactions")
      .upsert({
        id: row.id,
        tenant_id: row.tenantId,
        workspace_id: row.workspaceId,
        requirement_id: row.requirementId,
        information_ref_id: row.informationRefId,
        managed_repository_id: row.managedRepositoryId,
        unmanaged_rejected: row.unmanagedRejected,
        accepted_for_purpose: row.acceptedForPurpose,
        rejected: row.rejected,
        created_at: row.createdAt,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return mapSatisfaction(data as Record<string, unknown>);
  }

  async listPackages(workspaceId: string, projectId: string) {
    const { data, error } = await db(this.supabase)
      .from("engineering_handover_packages")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("project_id", projectId);
    if (error) throw new Error(error.message);
    return ((data ?? []) as Record<string, unknown>[]).map(mapPackage);
  }

  async getPackage(id: string) {
    const { data, error } = await db(this.supabase).from("engineering_handover_packages").select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapPackage(data as Record<string, unknown>) : null;
  }

  async savePackage(row: EngineeringHandoverPackage) {
    const { data, error } = await db(this.supabase)
      .from("engineering_handover_packages")
      .upsert({
        id: row.id,
        tenant_id: row.tenantId,
        workspace_id: row.workspaceId,
        project_id: row.projectId,
        display_name: row.displayName,
        system_id: row.systemId,
        asset_id: row.assetId,
        discipline: row.discipline,
        lifecycle_stage: row.lifecycleStage,
        state: row.state,
        accepted_by: row.acceptedBy,
        accepted_at: row.acceptedAt,
        created_by: row.createdBy,
        created_at: row.createdAt,
        updated_at: row.updatedAt,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return mapPackage(data as Record<string, unknown>);
  }

  async listPackageItems(packageId: string) {
    const { data, error } = await db(this.supabase).from("engineering_handover_package_items").select("*").eq("package_id", packageId);
    if (error) throw new Error(error.message);
    return ((data ?? []) as Record<string, unknown>[]).map((row) => ({
      id: String(row.id),
      packageId: String(row.package_id),
      requirementId: String(row.requirement_id),
    }));
  }

  async savePackageItem(row: HandoverPackageItem) {
    const { error } = await db(this.supabase).from("engineering_handover_package_items").upsert({
      id: row.id,
      package_id: row.packageId,
      requirement_id: row.requirementId,
    });
    if (error) throw new Error(error.message);
    return row;
  }

  async listTemplates() {
    return INFORMATION_REQUIREMENT_TEMPLATES;
  }
}
