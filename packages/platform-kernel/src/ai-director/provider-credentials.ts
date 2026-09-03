import type { ModelProviderType } from "@rtb/types";

export type ResolvedProviderCredentials = {
  providerType: Extract<ModelProviderType, "openai" | "azure_openai">;
  apiKeyPresent: boolean;
  baseUrl: string;
  defaultModel: string;
  azureApiVersion?: string;
};

function env(name: string): string {
  return process.env[name]?.trim() ?? "";
}

/**
 * Resolve governed chat-provider credentials from platform environment.
 * Never returns secret values.
 */
export function resolveChatProviderCredentials(): ResolvedProviderCredentials | null {
  const apiKey = env("PLATFORM_LLM_API_KEY") || env("OPENAI_API_KEY") || env("PLATFORM_EMBEDDING_API_KEY");
  if (!apiKey) return null;

  const explicit = env("PLATFORM_LLM_PROVIDER").toLowerCase();
  const baseUrl = (
    env("PLATFORM_LLM_BASE_URL") ||
    env("OPENAI_BASE_URL") ||
    env("PLATFORM_EMBEDDING_BASE_URL") ||
    "https://api.openai.com/v1"
  ).replace(/\/$/, "");
  const azure =
    explicit === "azure_openai" ||
    explicit === "azure-openai" ||
    baseUrl.includes("openai.azure.com");

  return {
    providerType: azure ? "azure_openai" : "openai",
    apiKeyPresent: true,
    baseUrl,
    defaultModel: env("PLATFORM_LLM_MODEL") || (azure ? env("PLATFORM_LLM_DEPLOYMENT") : "") || "gpt-4o-mini",
    azureApiVersion: azure ? env("PLATFORM_LLM_API_VERSION") || "2024-06-01" : undefined,
  };
}

export function chatProviderApiKey(): string | undefined {
  return env("PLATFORM_LLM_API_KEY") || env("OPENAI_API_KEY") || env("PLATFORM_EMBEDDING_API_KEY") || undefined;
}
