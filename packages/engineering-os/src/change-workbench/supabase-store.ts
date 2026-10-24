import type { SupabaseClient } from "@rtb/database";
import type { EngineeringImpactAssessment } from "./types";
import type { ImpactAssessmentStore } from "./memory-store";

function db(client: SupabaseClient): { from(name: string): any } {
  return client as unknown as { from(name: string): any };
}

function fromRow(row: Record<string, unknown>): EngineeringImpactAssessment {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    projectId: String(row.project_id),
    sourceObjectType: String(row.source_object_type),
    sourceObjectId: String(row.source_object_id),
    sourceChangeId: row.source_change_id ? String(row.source_change_id) : null,
    workflow: row.workflow as EngineeringImpactAssessment["workflow"],
    policyCode: String(row.policy_code),
    policyVersion: String(row.policy_version),
    status: row.status as EngineeringImpactAssessment["status"],
    completeness: row.completeness as EngineeringImpactAssessment["completeness"],
    traversalStatus: row.traversal_status as EngineeringImpactAssessment["traversalStatus"],
    staleness: row.staleness as EngineeringImpactAssessment["staleness"],
    sourceFingerprint: String(row.source_fingerprint),
    graphFingerprint: String(row.graph_fingerprint),
    snapshot: row.snapshot as EngineeringImpactAssessment["snapshot"],
    supersedesAssessmentId: row.supersedes_assessment_id ? String(row.supersedes_assessment_id) : null,
    viewProjectMismatch: Boolean(row.view_project_mismatch),
    createdAt: String(row.created_at),
    createdBy: row.created_by ? String(row.created_by) : null,
  };
}

export class SupabaseImpactAssessmentStore implements ImpactAssessmentStore {
  constructor(private readonly supabase: SupabaseClient) {}

  async save(row: EngineeringImpactAssessment) {
    const payload = {
      id: row.id,
      tenant_id: row.tenantId,
      workspace_id: row.workspaceId,
      project_id: row.projectId,
      source_object_type: row.sourceObjectType,
      source_object_id: row.sourceObjectId,
      source_change_id: row.sourceChangeId,
      workflow: row.workflow,
      policy_code: row.policyCode,
      policy_version: row.policyVersion,
      status: row.status,
      completeness: row.completeness,
      traversal_status: row.traversalStatus,
      staleness: row.staleness,
      source_fingerprint: row.sourceFingerprint,
      graph_fingerprint: row.graphFingerprint,
      snapshot: row.snapshot,
      supersedes_assessment_id: row.supersedesAssessmentId,
      view_project_mismatch: row.viewProjectMismatch,
      created_at: row.createdAt,
      created_by: row.createdBy,
    };
    const { error } = await db(this.supabase).from("engineering_impact_assessments").upsert(payload);
    if (error) throw new Error(error.message);
    return row;
  }

  async get(id: string) {
    const { data, error } = await db(this.supabase).from("engineering_impact_assessments").select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? fromRow(data as Record<string, unknown>) : null;
  }

  async listBySource(workspaceId: string, sourceObjectType: string, sourceObjectId: string) {
    const { data, error } = await db(this.supabase)
      .from("engineering_impact_assessments")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("source_object_type", sourceObjectType)
      .eq("source_object_id", sourceObjectId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return ((data ?? []) as Record<string, unknown>[]).map((row) => fromRow(row));
  }

  async listByProject(workspaceId: string, projectId: string) {
    const { data, error } = await db(this.supabase)
      .from("engineering_impact_assessments")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return ((data ?? []) as Record<string, unknown>[]).map((row) => fromRow(row));
  }
}
