import type { SupabaseClient } from "@rtb/database";
import type { EngineeringWorkPlan } from "./types";
import type { WorkPlanStore } from "./memory-store";

function db(client: SupabaseClient): { from(name: string): any } {
  return client as unknown as { from(name: string): any };
}

function mapPlan(row: Record<string, unknown>): EngineeringWorkPlan {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    projectId: String(row.project_id),
    workType: row.work_type as EngineeringWorkPlan["workType"],
    templateCode: String(row.template_code),
    templateVersion: String(row.template_version),
    discipline: (row.discipline as string | null) ?? null,
    systemId: (row.system_id as string | null) ?? null,
    assetId: (row.asset_id as string | null) ?? null,
    lifecycleStage: row.lifecycle_stage as EngineeringWorkPlan["lifecycleStage"],
    relatedObjectType: (row.related_object_type as string | null) ?? null,
    relatedObjectId: (row.related_object_id as string | null) ?? null,
    relatedDeliverableId: (row.related_deliverable_id as string | null) ?? null,
    relatedInterfaceId: (row.related_interface_id as string | null) ?? null,
    relatedChangeId: (row.related_change_id as string | null) ?? null,
    status: row.status as EngineeringWorkPlan["status"],
    readiness: row.readiness as EngineeringWorkPlan["readiness"],
    startAllowed: Boolean(row.start_allowed),
    conditionsAcknowledged: Boolean(row.conditions_acknowledged),
    staleness: row.staleness as EngineeringWorkPlan["staleness"],
    inputFingerprint: String(row.input_fingerprint),
    context: (row.context as EngineeringWorkPlan["context"]) ?? {
      information: [],
      gaps: [],
      requirements: [],
      assumptions: [],
      interfaces: [],
      decisions: [],
      analyses: [],
      expectedOutputs: [],
      actions: [],
      conditions: [],
    },
    explanations: (row.explanations as EngineeringWorkPlan["explanations"]) ?? {
      whyBlocked: null,
      whyConditional: null,
      templateProvenance: `${row.template_code}@${row.template_version}`,
      engineeringApproved: false,
      optionWinnerSelected: false,
    },
    generatedAt: String(row.generated_at),
    generatedBy: (row.generated_by as string | null) ?? null,
    supersedesPlanId: (row.supersedes_plan_id as string | null) ?? null,
    startedAt: (row.started_at as string | null) ?? null,
    completedAt: (row.completed_at as string | null) ?? null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    metrics: (row.metrics as EngineeringWorkPlan["metrics"]) ?? {
      informationReferencesEvaluated: 0,
      requirementsEvaluated: 0,
      threadRelationshipsTraversed: 0,
      readinessEvaluations: 0,
      durationMs: 0,
    },
  };
}

export class SupabaseWorkPlanStore implements WorkPlanStore {
  constructor(private readonly supabase: SupabaseClient) {}

  async listPlans(workspaceId: string, projectId: string) {
    const { data, error } = await db(this.supabase)
      .from("engineering_work_plans")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("project_id", projectId)
      .order("generated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return ((data ?? []) as Record<string, unknown>[]).map(mapPlan);
  }

  async getPlan(id: string) {
    const { data, error } = await db(this.supabase).from("engineering_work_plans").select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapPlan(data as Record<string, unknown>) : null;
  }

  async savePlan(row: EngineeringWorkPlan) {
    const { data, error } = await db(this.supabase)
      .from("engineering_work_plans")
      .upsert({
        id: row.id,
        tenant_id: row.tenantId,
        workspace_id: row.workspaceId,
        project_id: row.projectId,
        work_type: row.workType,
        template_code: row.templateCode,
        template_version: row.templateVersion,
        discipline: row.discipline,
        system_id: row.systemId,
        asset_id: row.assetId,
        lifecycle_stage: row.lifecycleStage,
        related_object_type: row.relatedObjectType,
        related_object_id: row.relatedObjectId,
        related_deliverable_id: row.relatedDeliverableId,
        related_interface_id: row.relatedInterfaceId,
        related_change_id: row.relatedChangeId,
        status: row.status,
        readiness: row.readiness,
        start_allowed: row.startAllowed,
        conditions_acknowledged: row.conditionsAcknowledged,
        staleness: row.staleness,
        input_fingerprint: row.inputFingerprint,
        context: row.context,
        explanations: row.explanations,
        generated_at: row.generatedAt,
        generated_by: row.generatedBy,
        supersedes_plan_id: row.supersedesPlanId,
        started_at: row.startedAt,
        completed_at: row.completedAt,
        created_at: row.createdAt,
        updated_at: row.updatedAt,
        metrics: row.metrics,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return mapPlan(data as Record<string, unknown>);
  }
}
