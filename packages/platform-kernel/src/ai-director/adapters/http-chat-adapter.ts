import type { ModelAdapter, ModelProviderType } from "@rtb/types";

type VendorChatAdapterOptions = {
  apiKey: string;
  baseUrl: string;
  timeoutMs: number;
  providerType: ModelProviderType;
  fetchImpl: typeof fetch;
};

/**
 * OpenAI-compatible chat adapter used by Kernel AI Director.
 * Registered only when a vendor credential is present. PI never calls this directly.
 */
export class OpenAiCompatibleChatAdapter implements ModelAdapter {
  readonly providerType: ModelProviderType;

  constructor(private readonly options: VendorChatAdapterOptions) {
    this.providerType = options.providerType;
  }

  async complete(params: {
    model: string;
    messages: { role: string; content: string }[];
    tools?: unknown[];
  }) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.options.timeoutMs);
    try {
      const response = await this.options.fetchImpl(`${this.options.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${this.options.apiKey}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: params.model,
          messages: params.messages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
          temperature: 0,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Vendor chat adapter request failed (${response.status})`);
      }

      const payload = (await response.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const content = payload.choices?.[0]?.message?.content?.trim();
      if (!content) {
        throw new Error("Vendor chat adapter request failed (empty)");
      }

      return {
        content,
        confidence: 0.7,
        evidenceRefs: [],
      };
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Vendor chat adapter timeout");
      }
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }
}

export function tryCreateVendorChatAdapter(
  env: Record<string, string | undefined> = process.env,
  fetchImpl: typeof fetch = fetch,
): ModelAdapter | null {
  const apiKey = env.PLATFORM_LLM_API_KEY || env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const requested = (env.PLATFORM_LLM_PROVIDER_TYPE || "openai") as ModelProviderType;
  if (requested === "mock" || requested === "local") return null;

  const timeoutMs = Number(env.PLATFORM_LLM_TIMEOUT_MS || 20000);
  return new OpenAiCompatibleChatAdapter({
    apiKey,
    baseUrl: (env.PLATFORM_LLM_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, ""),
    timeoutMs: Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 20000,
    providerType: requested,
    fetchImpl,
  });
}
