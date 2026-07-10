import type { Json, SupabaseClient } from "@rtb/database";
import type { DigitalTwin } from "@rtb/types";

export class DigitalTwinService {
  constructor(private readonly supabase: SupabaseClient) {}

  async register(input: {
    tenantId: string;
    workspaceId?: string;
    twinType: string;
    name: string;
    externalId?: string;
    metadata?: Record<string, unknown>;
    knowledgeNodeId?: string;
    createdBy?: string;
  }): Promise<DigitalTwin> {
    const { data, error } = await this.supabase
      .from("digital_twins")
      .insert({
        tenant_id: input.tenantId,
        workspace_id: input.workspaceId ?? null,
        twin_type: input.twinType,
        name: input.name,
        external_id: input.externalId ?? null,
        metadata: (input.metadata ?? {}) as Json,
        knowledge_node_id: input.knowledgeNodeId ?? null,
        created_by: input.createdBy ?? null,
        status: "active",
      })
      .select()
      .single();

    if (error || !data) throw new Error(`Failed to register twin: ${error?.message}`);

    await this.supabase.from("digital_twin_status_history").insert({
      twin_id: data.id,
      status: "active",
      reason: "Initial registration",
      changed_by: input.createdBy ?? null,
    });

    return mapTwin(data);
  }

  async list(tenantId: string, limit = 50): Promise<DigitalTwin[]> {
    const { data, error } = await this.supabase
      .from("digital_twins")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Failed to list twins: ${error.message}`);
    return (data ?? []).map(mapTwin);
  }

  async updateStatus(twinId: string, status: DigitalTwin["status"], reason?: string, changedBy?: string) {
    await this.supabase.from("digital_twins").update({ status }).eq("id", twinId);
    await this.supabase.from("digital_twin_status_history").insert({
      twin_id: twinId,
      status,
      reason: reason ?? null,
      changed_by: changedBy ?? null,
    });
  }
}

function mapTwin(row: Record<string, unknown>): DigitalTwin {
  return {
    id: row.id as string,
    tenant_id: row.tenant_id as string,
    workspace_id: row.workspace_id as string | undefined,
    twin_type: row.twin_type as string,
    name: row.name as string,
    external_id: row.external_id as string | undefined,
    status: row.status as DigitalTwin["status"],
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    knowledge_node_id: row.knowledge_node_id as string | undefined,
    created_by: row.created_by as string | undefined,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}
