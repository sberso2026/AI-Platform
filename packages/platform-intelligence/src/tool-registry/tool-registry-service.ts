import type { Json, SupabaseClient } from "@rtb/database";
import type { ToolRiskLevel } from "@rtb/types";

export class ToolRegistryService {
  constructor(private readonly supabase: SupabaseClient) {}

  async listTools(tenantId: string) {
    const { data, error } = await this.supabase
      .from("ai_tools")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("name");
    if (error) throw new Error(`Failed to list tools: ${error.message}`);
    return data ?? [];
  }

  async getToolByKey(tenantId: string, toolKey: string) {
    const { data, error } = await this.supabase
      .from("ai_tools")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("tool_key", toolKey)
      .single();
    if (error) return null;
    return data;
  }

  async createTool(input: {
    tenantId: string;
    toolKey: string;
    name: string;
    description?: string;
    category: string;
    provider?: string;
    riskLevel?: ToolRiskLevel;
    inputSchema?: Record<string, unknown>;
    outputSchema?: Record<string, unknown>;
    createdBy?: string;
    pluginId?: string;
  }) {
    const { data, error } = await this.supabase
      .from("ai_tools")
      .insert({
        tenant_id: input.tenantId,
        tool_key: input.toolKey,
        name: input.name,
        description: input.description ?? null,
        category: input.category,
        provider: input.provider ?? "platform",
        risk_level: input.riskLevel ?? "low",
        input_schema: (input.inputSchema ?? {}) as Json,
        output_schema: (input.outputSchema ?? {}) as Json,
        created_by: input.createdBy ?? null,
        plugin_id: input.pluginId ?? null,
      })
      .select()
      .single();
    if (error) throw new Error(`Failed to create tool: ${error.message}`);

    await this.supabase.from("ai_tool_versions").insert({
      tool_id: data.id,
      version: "1.0.0",
      input_schema: (input.inputSchema ?? {}) as Json,
      output_schema: (input.outputSchema ?? {}) as Json,
      status: "active",
      created_by: input.createdBy ?? null,
    });

    return data;
  }

  async hasPermission(tenantId: string, toolId: string, principalType: string, principalId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from("ai_tool_permissions")
      .select("id")
      .eq("tenant_id", tenantId)
      .eq("tool_id", toolId)
      .eq("principal_type", principalType)
      .eq("principal_id", principalId)
      .limit(1);
    if (error) throw new Error(`Failed to check tool permission: ${error.message}`);
    return (data?.length ?? 0) > 0;
  }

  async assignToAgent(tenantId: string, toolId: string, agentId: string) {
    const { data, error } = await this.supabase
      .from("ai_tool_assignments")
      .upsert({
        tenant_id: tenantId,
        tool_id: toolId,
        assignee_type: "agent",
        assignee_id: agentId,
        is_active: true,
      })
      .select()
      .single();
    if (error) throw new Error(`Failed to assign tool: ${error.message}`);
    return data;
  }

  async getAgentTools(tenantId: string, agentId: string) {
    const { data: assignments, error } = await this.supabase
      .from("ai_tool_assignments")
      .select("tool_id, ai_tools(*)")
      .eq("tenant_id", tenantId)
      .eq("assignee_type", "agent")
      .eq("assignee_id", agentId)
      .eq("is_active", true);
    if (error) throw new Error(`Failed to get agent tools: ${error.message}`);
    return (assignments ?? []).map((a) => (a as Record<string, unknown>).ai_tools).filter(Boolean);
  }

  async canAgentUseTool(tenantId: string, agentId: string, toolId: string): Promise<boolean> {
    const { data: assignment } = await this.supabase
      .from("ai_tool_assignments")
      .select("id")
      .eq("tenant_id", tenantId)
      .eq("tool_id", toolId)
      .eq("assignee_type", "agent")
      .eq("assignee_id", agentId)
      .eq("is_active", true)
      .limit(1);
    if (!assignment?.length) return false;

    const hasExplicit = await this.hasPermission(tenantId, toolId, "agent", agentId);
    if (hasExplicit) return true;

    const { data: tool } = await this.supabase
      .from("ai_tools")
      .select("risk_level, status")
      .eq("id", toolId)
      .single();
    if (!tool || tool.status !== "active") return false;
    return tool.risk_level === "low";
  }

  async logUsage(input: {
    tenantId: string;
    toolId: string;
    agentId?: string;
    runId?: string;
    userId?: string;
    input?: Record<string, unknown>;
    output?: Record<string, unknown>;
    status?: string;
    durationMs?: number;
  }) {
    const { data, error } = await this.supabase
      .from("ai_tool_usage_logs")
      .insert({
        tenant_id: input.tenantId,
        tool_id: input.toolId,
        agent_id: input.agentId ?? null,
        run_id: input.runId ?? null,
        user_id: input.userId ?? null,
        input: (input.input ?? {}) as Json,
        output: (input.output ?? null) as Json,
        status: input.status ?? "completed",
        duration_ms: input.durationMs ?? null,
      })
      .select()
      .single();
    if (error) throw new Error(`Failed to log tool usage: ${error.message}`);
    return data;
  }

  async recordHealthCheck(tenantId: string, toolId: string, status: string, latencyMs?: number, message?: string) {
    const { data, error } = await this.supabase
      .from("ai_tool_health_checks")
      .insert({
        tenant_id: tenantId,
        tool_id: toolId,
        status,
        latency_ms: latencyMs ?? null,
        message: message ?? null,
      })
      .select()
      .single();
    if (error) throw new Error(`Failed to record health check: ${error.message}`);
    return data;
  }
}
