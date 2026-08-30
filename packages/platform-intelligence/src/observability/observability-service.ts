import type { Json, SupabaseClient } from "@rtb/database";
import type { TraceContext } from "@rtb/types";

export class ObservabilityService {
  constructor(private readonly supabase: SupabaseClient) {}

  async listTraces(tenantId: string, limit = 50) {
    const { data, error } = await this.supabase
      .from("traces")
      .select("*, trace_spans(*)")
      .eq("tenant_id", tenantId)
      .order("started_at", { ascending: false })
      .limit(limit);
    if (error) throw new Error(`Failed to list traces: ${error.message}`);
    return data ?? [];
  }

  async startTrace(ctx: TraceContext) {
    const { data, error } = await this.supabase
      .from("traces")
      .insert({
        tenant_id: ctx.tenantId,
        trace_key: `trace-${Date.now()}`,
        name: ctx.name,
        source: ctx.source,
        status: "running",
        metadata: (ctx.metadata ?? {}) as Json,
      })
      .select()
      .single();
    if (error) throw new Error(`Failed to start trace: ${error.message}`);
    return data;
  }

  async completeTrace(traceId: string, status: "completed" | "failed" = "completed") {
    const { data, error } = await this.supabase
      .from("traces")
      .update({ status, completed_at: new Date().toISOString() })
      .eq("id", traceId)
      .select()
      .maybeSingle();
    if (error) throw new Error(`Failed to complete trace: ${error.message}`);
    return data;
  }

  async createSpan(input: {
    traceId: string;
    name: string;
    spanType?: string;
    parentId?: string;
    metadata?: Record<string, unknown>;
  }) {
    const startedAt = new Date().toISOString();
    const { data, error } = await this.supabase
      .from("trace_spans")
      .insert({
        trace_id: input.traceId,
        parent_id: input.parentId ?? null,
        name: input.name,
        span_type: input.spanType ?? "internal",
        status: "running",
        metadata: (input.metadata ?? {}) as Json,
        started_at: startedAt,
      })
      .select()
      .single();
    if (error) throw new Error(`Failed to create span: ${error.message}`);
    return { span: data, startedAt };
  }

  async completeSpan(spanId: string, startedAt: string, status: "completed" | "failed" = "completed") {
    const completedAt = new Date().toISOString();
    const durationMs = new Date(completedAt).getTime() - new Date(startedAt).getTime();
    const { data, error } = await this.supabase
      .from("trace_spans")
      .update({ status, completed_at: completedAt, duration_ms: durationMs })
      .eq("id", spanId)
      .select()
      .maybeSingle();
    if (error) throw new Error(`Failed to complete span: ${error.message}`);
    return data;
  }

  async recordMetric(tenantId: string, metricName: string, value: number, dimensions?: Record<string, unknown>) {
    const { data, error } = await this.supabase
      .from("metric_events")
      .insert({
        tenant_id: tenantId,
        metric_name: metricName,
        metric_value: value,
        dimensions: (dimensions ?? {}) as Json,
      })
      .select()
      .single();
    if (error) throw new Error(`Failed to record metric: ${error.message}`);
    return data;
  }

  async logError(input: {
    tenantId: string;
    traceId?: string;
    source: string;
    message: string;
    errorCode?: string;
    metadata?: Record<string, unknown>;
  }) {
    const { data, error } = await this.supabase
      .from("error_events")
      .insert({
        tenant_id: input.tenantId,
        trace_id: input.traceId ?? null,
        source: input.source,
        error_code: input.errorCode ?? null,
        message: input.message,
        metadata: (input.metadata ?? {}) as Json,
      })
      .select()
      .single();
    if (error) throw new Error(`Failed to log error: ${error.message}`);
    return data;
  }

  async getMetricsSummary(tenantId: string) {
    const metrics = [
      "agent_latency",
      "tool_latency",
      "workflow_latency",
      "token_usage",
      "cost",
      "failure_rate",
      "policy_violation_rate",
    ];
    const summary: Record<string, number> = {};
    for (const name of metrics) {
      const { data } = await this.supabase
        .from("metric_events")
        .select("metric_value")
        .eq("tenant_id", tenantId)
        .eq("metric_name", name)
        .order("recorded_at", { ascending: false })
        .limit(100);
      if (data?.length) {
        summary[name] = data.reduce((sum, r) => sum + Number(r.metric_value), 0) / data.length;
      }
    }
    return summary;
  }
}
