import type { SupabaseClient } from "@rtb/database";
import type { ModelRouteResolution } from "@rtb/types";

export class ModelRegistryService {
  constructor(private readonly supabase: SupabaseClient) {}

  async listModels(tenantId: string) {
    const { data, error } = await this.supabase
      .from("model_registry")
      .select("*, model_providers(*)")
      .or(`tenant_id.eq.${tenantId},tenant_id.is.null`)
      .eq("status", "active")
      .order("display_name");
    if (error) throw new Error(`Failed to list models: ${error.message}`);
    return data ?? [];
  }

  async listProviders(tenantId: string) {
    const { data, error } = await this.supabase
      .from("model_providers")
      .select("*")
      .or(`tenant_id.eq.${tenantId},tenant_id.is.null`)
      .eq("status", "active");
    if (error) throw new Error(`Failed to list providers: ${error.message}`);
    return data ?? [];
  }

  async resolveRoute(tenantId: string, intent: string): Promise<ModelRouteResolution> {
    const { data: route } = await this.supabase
      .from("model_routes")
      .select("model_id, model_registry(*, model_providers(*))")
      .eq("tenant_id", tenantId)
      .eq("intent", intent)
      .eq("is_active", true)
      .order("priority")
      .limit(1)
      .single();

    if (route) {
      const row = route as Record<string, unknown>;
      const model = row.model_registry as Record<string, unknown>;
      const provider = model.model_providers as Record<string, unknown>;

      const allowed = await this.isModelAllowed(tenantId, model.id as string, provider.provider_type as string);
      if (allowed) {
        return {
          modelKey: model.model_key as string,
          modelId: model.id as string,
          providerType: provider.provider_type as string,
          providerId: provider.id as string,
          costInputPer1k: Number(model.cost_input_per_1k ?? 0),
          costOutputPer1k: Number(model.cost_output_per_1k ?? 0),
        };
      }
    }

    // Fallback to legacy ai_model_routes
    const { data: legacyRoute } = await this.supabase
      .from("ai_model_routes")
      .select("model_name, provider_id, ai_model_providers(provider_type)")
      .eq("tenant_id", tenantId)
      .eq("intent", intent)
      .eq("is_active", true)
      .order("priority")
      .limit(1)
      .single();

    if (legacyRoute) {
      const row = legacyRoute as Record<string, unknown> & { ai_model_providers?: { provider_type: string } };
      return {
        modelKey: row.model_name as string,
        modelId: "legacy",
        providerType: row.ai_model_providers?.provider_type ?? "mock",
        providerId: row.provider_id as string,
        costInputPer1k: 0,
        costOutputPer1k: 0,
      };
    }

    // Global mock fallback
    const { data: mockModel } = await this.supabase
      .from("model_registry")
      .select("*, model_providers(*)")
      .eq("model_key", "mock-gpt")
      .limit(1)
      .single();

    if (mockModel) {
      const model = mockModel as Record<string, unknown>;
      const provider = model.model_providers as Record<string, unknown>;
      return {
        modelKey: "mock-gpt",
        modelId: model.id as string,
        providerType: (provider?.provider_type as string) ?? "mock",
        providerId: (provider?.id as string) ?? "mock",
        costInputPer1k: 0,
        costOutputPer1k: 0,
      };
    }

    return {
      modelKey: "mock-gpt",
      modelId: "mock",
      providerType: "mock",
      providerId: "mock",
      costInputPer1k: 0,
      costOutputPer1k: 0,
    };
  }

  private async isModelAllowed(tenantId: string, modelId: string, providerType: string): Promise<boolean> {
    const { data: denies } = await this.supabase
      .from("tenant_model_policies")
      .select("id")
      .eq("tenant_id", tenantId)
      .eq("policy_type", "deny")
      .or(`model_id.eq.${modelId},provider_type.eq.${providerType}`)
      .limit(1);
    return !denies?.length;
  }

  async logUsage(input: {
    tenantId: string;
    modelId: string;
    runId?: string;
    inputTokens?: number;
    outputTokens?: number;
    latencyMs?: number;
    status?: string;
  }) {
    if (input.modelId === "legacy" || input.modelId === "mock") return null;

    const { data, error } = await this.supabase
      .from("model_usage_logs")
      .insert({
        tenant_id: input.tenantId,
        model_id: input.modelId,
        run_id: input.runId ?? null,
        input_tokens: input.inputTokens ?? 0,
        output_tokens: input.outputTokens ?? 0,
        latency_ms: input.latencyMs ?? null,
        status: input.status ?? "completed",
      })
      .select()
      .single();
    if (error) throw new Error(`Failed to log model usage: ${error.message}`);
    return data;
  }
}
