import type { SupabaseClient } from "@rtb/database";
import type { EngineeringToolHandoff } from "./types";
import type { HandoffStore } from "./memory-store";

function db(client: SupabaseClient): { from(name: string): any } {
  return client as unknown as { from(name: string): any };
}

function mapRow(row: Record<string, unknown>): EngineeringToolHandoff {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    projectId: String(row.project_id),
    workPlanId: (row.work_plan_id as string | null) ?? null,
    artifactId: (row.artifact_id as string | null) ?? null,
    sourceRef: (row.source_ref as string | null) ?? null,
    toolCode: String(row.tool_code),
    capability: row.capability as EngineeringToolHandoff["capability"],
    handoffMode: row.handoff_mode as EngineeringToolHandoff["handoffMode"],
    status: row.status as EngineeringToolHandoff["status"],
    requestedBy: (row.requested_by as string | null) ?? null,
    requestedAt: String(row.requested_at),
    expiresAt: String(row.expires_at),
    tokenHash: String(row.token_hash),
    consumedAt: (row.consumed_at as string | null) ?? null,
    inputFingerprint: (row.input_fingerprint as string | null) ?? null,
    failure: (row.failure as EngineeringToolHandoff["failure"]) ?? null,
    explanation: String(row.explanation ?? ""),
    launchedNativeApplication: false,
    engineeringApproved: false,
    protocolUrl: (row.protocol_url as string | null) ?? null,
  };
}

export class SupabaseHandoffStore implements HandoffStore {
  constructor(private readonly supabase: SupabaseClient) {}

  async save(row: EngineeringToolHandoff) {
    const { data, error } = await db(this.supabase)
      .from("engineering_tool_handoffs")
      .upsert({
        id: row.id,
        tenant_id: row.tenantId,
        workspace_id: row.workspaceId,
        project_id: row.projectId,
        work_plan_id: row.workPlanId,
        artifact_id: row.artifactId,
        source_ref: row.sourceRef,
        tool_code: row.toolCode,
        capability: row.capability,
        handoff_mode: row.handoffMode,
        status: row.status,
        requested_by: row.requestedBy,
        requested_at: row.requestedAt,
        expires_at: row.expiresAt,
        token_hash: row.tokenHash,
        consumed_at: row.consumedAt,
        input_fingerprint: row.inputFingerprint,
        failure: row.failure,
        explanation: row.explanation,
        protocol_url: row.protocolUrl,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return mapRow(data as Record<string, unknown>);
  }

  async get(id: string) {
    const { data, error } = await db(this.supabase).from("engineering_tool_handoffs").select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapRow(data as Record<string, unknown>) : null;
  }

  async listByPlan(workspaceId: string, workPlanId: string) {
    const { data, error } = await db(this.supabase)
      .from("engineering_tool_handoffs")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("work_plan_id", workPlanId)
      .order("requested_at", { ascending: false });
    if (error) throw new Error(error.message);
    return ((data ?? []) as Record<string, unknown>[]).map(mapRow);
  }
}
