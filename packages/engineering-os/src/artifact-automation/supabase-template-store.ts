import type { SupabaseClient } from "@rtb/database";
import type { ArtifactType } from "./types";
import type { GeneratorWorkType } from "../work-generator/types";
import type { LifecycleStage } from "../lifecycle-intelligence/types";
import type { ArtifactTemplatePolicyRecord, TenantTemplateFallbackPolicy, TemplateFallbackPolicy, TemplatePresentationKind, TemplatePresentationStatus, TemplateSourceClass } from "./template-policy";
import type { TemplatePolicyStore } from "./memory-template-store";

function db(client: SupabaseClient): { from(name: string): any } {
  return client as unknown as { from(name: string): any };
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map((row) => String(row)) : [];
}

function mapPolicy(row: Record<string, unknown>): ArtifactTemplatePolicyRecord {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    projectId: row.project_id == null ? null : String(row.project_id),
    artifactType: String(row.artifact_type) as ArtifactType,
    templateCode: String(row.template_code),
    templateVersion: String(row.template_version),
    name: String(row.name),
    sourceClass: String(row.source_class) as Exclude<TemplateSourceClass, "EOS_DEFAULT">,
    status: String(row.status) as TemplatePresentationStatus,
    disciplines: asStringArray(row.disciplines),
    workTypes: asStringArray(row.work_types) as GeneratorWorkType[],
    lifecycleStages: asStringArray(row.lifecycle_stages) as LifecycleStage[],
    packagedAssetKey: String(row.packaged_asset_key),
    presentationKind: String(row.presentation_kind) as Exclude<TemplatePresentationKind, "DEFINITION">,
    branding: (row.branding as ArtifactTemplatePolicyRecord["branding"]) ?? {},
    fallbackPolicy: String(row.fallback_policy) as TemplateFallbackPolicy,
    active: Boolean(row.active),
    createdBy: row.created_by == null ? null : String(row.created_by),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapFallback(row: Record<string, unknown>): TenantTemplateFallbackPolicy {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    fallbackPolicy: String(row.fallback_policy) as TemplateFallbackPolicy,
    createdBy: row.created_by == null ? null : String(row.created_by),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export class SupabaseTemplatePolicyStore implements TemplatePolicyStore {
  constructor(private readonly supabase: SupabaseClient) {}

  async listPolicies(workspaceId: string) {
    const { data, error } = await db(this.supabase)
      .from("engineering_artifact_template_policies")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return ((data ?? []) as Record<string, unknown>[]).map(mapPolicy);
  }

  async getPolicy(id: string) {
    const { data, error } = await db(this.supabase)
      .from("engineering_artifact_template_policies")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapPolicy(data as Record<string, unknown>) : null;
  }

  async savePolicy(row: ArtifactTemplatePolicyRecord) {
    const { error } = await db(this.supabase).from("engineering_artifact_template_policies").upsert({
      id: row.id,
      tenant_id: row.tenantId,
      workspace_id: row.workspaceId,
      project_id: row.projectId,
      artifact_type: row.artifactType,
      template_code: row.templateCode,
      template_version: row.templateVersion,
      name: row.name,
      source_class: row.sourceClass,
      status: row.status,
      disciplines: row.disciplines,
      work_types: row.workTypes,
      lifecycle_stages: row.lifecycleStages,
      packaged_asset_key: row.packagedAssetKey,
      presentation_kind: row.presentationKind,
      branding: row.branding,
      fallback_policy: row.fallbackPolicy,
      active: row.active,
      created_by: row.createdBy ?? null,
      created_at: row.createdAt,
      updated_at: row.updatedAt,
    });
    if (error) throw new Error(error.message);
    return row;
  }

  async getFallback(workspaceId: string) {
    const { data, error } = await db(this.supabase)
      .from("engineering_artifact_template_fallback_policies")
      .select("*")
      .eq("workspace_id", workspaceId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapFallback(data as Record<string, unknown>) : null;
  }

  async saveFallback(row: TenantTemplateFallbackPolicy) {
    const { error } = await db(this.supabase).from("engineering_artifact_template_fallback_policies").upsert({
      id: row.id,
      tenant_id: row.tenantId,
      workspace_id: row.workspaceId,
      fallback_policy: row.fallbackPolicy,
      created_by: row.createdBy ?? null,
      created_at: row.createdAt,
      updated_at: row.updatedAt,
    });
    if (error) throw new Error(error.message);
    return row;
  }
}
