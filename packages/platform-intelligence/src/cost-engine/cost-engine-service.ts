import type { Json, SupabaseClient } from "@rtb/database";
import type { CostEventInput } from "@rtb/types";

export class CostEngineService {
  constructor(private readonly supabase: SupabaseClient) {}

  async listEvents(tenantId: string, limit = 100) {
    const { data, error } = await this.supabase
      .from("cost_events")
      .select("*, cost_allocations(*)")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw new Error(`Failed to list cost events: ${error.message}`);
    return data ?? [];
  }

  async recordEvent(input: CostEventInput) {
    const { data: event, error } = await this.supabase
      .from("cost_events")
      .insert({
        tenant_id: input.tenantId,
        workspace_id: input.workspaceId ?? null,
        event_type: input.eventType,
        amount: input.amount,
        quantity: input.quantity ?? 0,
        unit: input.unit ?? "tokens",
        metadata: (input.metadata ?? {}) as Json,
        source_type: input.sourceType ?? null,
        source_id: input.sourceId ?? null,
        user_id: input.userId ?? null,
      })
      .select()
      .single();
    if (error) throw new Error(`Failed to record cost event: ${error.message}`);

    if (input.allocations?.length) {
      await this.supabase.from("cost_allocations").insert(
        input.allocations.map((a) => ({
          cost_event_id: event.id,
          dimension: a.dimension,
          dimension_id: a.dimensionId ?? null,
          amount: a.amount,
        }))
      );
    }

    return event;
  }

  async recordModelCall(input: {
    tenantId: string;
    workspaceId?: string;
    runId?: string;
    agentId?: string;
    userId?: string;
    inputTokens: number;
    outputTokens: number;
    costInputPer1k: number;
    costOutputPer1k: number;
  }) {
    const amount =
      (input.inputTokens / 1000) * input.costInputPer1k +
      (input.outputTokens / 1000) * input.costOutputPer1k;

    return this.recordEvent({
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      eventType: "model_call",
      amount,
      quantity: input.inputTokens + input.outputTokens,
      unit: "tokens",
      sourceType: "agent_run",
      sourceId: input.runId,
      userId: input.userId,
      metadata: { input_tokens: input.inputTokens, output_tokens: input.outputTokens },
      allocations: [
        { dimension: "tenant", dimensionId: input.tenantId, amount },
        ...(input.agentId ? [{ dimension: "agent", dimensionId: input.agentId, amount }] : []),
        ...(input.userId ? [{ dimension: "user", dimensionId: input.userId, amount }] : []),
      ],
    });
  }

  async getSummary(tenantId: string) {
    const { data, error } = await this.supabase
      .from("cost_events")
      .select("event_type, amount")
      .eq("tenant_id", tenantId);
    if (error) throw new Error(`Failed to get cost summary: ${error.message}`);

    const summary: Record<string, number> = {};
    let total = 0;
    for (const row of data ?? []) {
      const type = row.event_type as string;
      const amount = Number(row.amount);
      summary[type] = (summary[type] ?? 0) + amount;
      total += amount;
    }
    return { total, byType: summary };
  }

  async listBudgets(tenantId: string) {
    const { data, error } = await this.supabase
      .from("cost_budgets")
      .select("*")
      .eq("tenant_id", tenantId);
    if (error) throw new Error(`Failed to list budgets: ${error.message}`);
    return data ?? [];
  }
}
