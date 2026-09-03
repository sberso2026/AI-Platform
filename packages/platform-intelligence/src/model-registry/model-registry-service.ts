import type { SupabaseClient } from "@rtb/database";
import type { ModelRouteResolution } from "@rtb/types";

const SYSTEM_CHAT_MODEL_ID = "00000000-0000-4000-8000-0000000000e3";

function isEmbeddingModel(modelKey: string | null | undefined, capabilities: unknown): boolean {
  const key = (modelKey ?? "").toLowerCase();
  if (key.includes("embedding")) return true;
  if (!Array.isArray(capabilities)) return false;
  return capabilities.some((row) => {
    const capability = typeof row === "object" && row && "capability" in row ? String((row as { capability?: string }).capability ?? "") : "";
    return capability.toLowerCase() === "embedding";
  });
}

function toRoute(model: Record<string, unknown>, provider: Record<string, unknown> | null | undefined): ModelRouteResolution {
  return {
    modelKey: model.model_key as string,
    modelId: model.id as string,
    providerType: (provider?.provider_type as string) ?? "mock",
    providerId: (provider?.id as string) ?? "mock",
    costInputPer1k: Number(model.cost_input_per_1k ?? 0),
    costOutputPer1k: Number(model.cost_output_per_1k ?? 0),
  };
}

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
    const { data: routes } = await this.supabase
      .from("model_routes")
      .select("model_id, priority, model_registry(*, model_providers(*), model_capabilities(capability))")
      .eq("tenant_id", tenantId)
      .eq("intent", intent)
      .eq("is_active", true)
      .order("priority");

    for (const route of routes ?? []) {
      const row = route as Record<string, unknown>;
      const model = row.model_registry as Record<string, unknown> | null;
      if (!model) continue;
      const provider = model.model_providers as Record<string, unknown> | null;
      if (isEmbeddingModel(model.model_key as string, model.model_capabilities)) continue;
      const providerType = provider?.provider_type as string | undefined;
      const allowed = await this.isModelAllowed(tenantId, model.id as string, providerType ?? "mock");
      if (!allowed) continue;
      if (providerType === "mock") {
        const chat = await this.resolveSystemChatRoute(tenantId);
        if (chat) return chat;
      }
      return toRoute(model, provider);
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

    const chat = await this.resolveSystemChatRoute(tenantId);
    if (chat) return chat;

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

  private async resolveSystemChatRoute(tenantId: string): Promise<ModelRouteResolution | null> {
    const { data } = await this.supabase
      .from("model_registry")
      .select("*, model_providers(*), model_capabilities(capability)")
      .eq("id", SYSTEM_CHAT_MODEL_ID)
      .eq("status", "active")
      .maybeSingle();
    if (!data) return null;
    const model = data as Record<string, unknown>;
    const provider = model.model_providers as Record<string, unknown> | null;
    if (isEmbeddingModel(model.model_key as string, model.model_capabilities)) return null;
    const allowed = await this.isModelAllowed(
      tenantId,
      model.id as string,
      (provider?.provider_type as string) ?? "openai",
    );
    if (!allowed) return null;
    return toRoute(model, provider);
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
