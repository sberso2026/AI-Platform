import type { ModelAdapter, ModelProviderType } from "@rtb/types";
import { chatProviderApiKey, resolveChatProviderCredentials } from "../provider-credentials";

const DEFAULT_TIMEOUT_MS = 45_000;

type ChatCompleteParams = {
  model: string;
  messages: { role: string; content: string }[];
  tools?: unknown[];
};

function directorError(layer: string, cause: string): Error {
  return new Error(`AI_DIRECTOR_FAILURE layer=${layer} cause=${cause}`);
}

async function postChatCompletions(input: {
  url: string;
  headers: Record<string, string>;
  body: Record<string, unknown>;
  timeoutMs: number;
}): Promise<{ content: string; status: number }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), input.timeoutMs);
  try {
    const response = await fetch(input.url, {
      method: "POST",
      headers: input.headers,
      body: JSON.stringify(input.body),
      signal: controller.signal,
    });
    const raw = await response.text();
    let parsed: Record<string, unknown> = {};
    try {
      parsed = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    } catch {
      throw directorError("response_parser", `malformed_json:http_${response.status}`);
    }
    if (!response.ok) {
      const code =
        typeof parsed.error === "object" && parsed.error && "code" in parsed.error
          ? String((parsed.error as { code?: string }).code ?? response.status)
          : String(response.status);
      if (response.status === 401 || response.status === 403) {
        throw directorError("provider_credentials", `provider_http_${response.status}`);
      }
      if (response.status === 429) {
        throw directorError("provider", "provider_rate_limited");
      }
      throw directorError("provider", `provider_http_${response.status}:${code}`.slice(0, 120));
    }
    const choices = parsed.choices;
    const content =
      Array.isArray(choices) && choices[0] && typeof choices[0] === "object"
        ? String(
            ((choices[0] as { message?: { content?: unknown } }).message?.content ?? ""),
          ).trim()
        : "";
    if (!content) {
      throw directorError("response_parser", "empty_completion");
    }
    return { content, status: response.status };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw directorError("provider", "timeout");
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export class OpenAIModelAdapter implements ModelAdapter {
  readonly providerType: ModelProviderType = "openai";

  async complete(params: ChatCompleteParams) {
    const creds = resolveChatProviderCredentials();
    const apiKey = chatProviderApiKey();
    if (!creds || !apiKey || creds.providerType !== "openai") {
      throw directorError("provider_credentials", "openai_credentials_unavailable");
    }
    const model = params.model?.trim() && !params.model.includes("embedding")
      ? params.model.trim()
      : creds.defaultModel;
    const result = await postChatCompletions({
      url: `${creds.baseUrl}/chat/completions`,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: {
        model,
        temperature: 0,
        messages: params.messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
      },
      timeoutMs: DEFAULT_TIMEOUT_MS,
    });
    return {
      content: result.content,
      confidence: 0.78,
      evidenceRefs: [],
    };
  }
}

export class AzureOpenAIModelAdapter implements ModelAdapter {
  readonly providerType: ModelProviderType = "azure_openai";

  async complete(params: ChatCompleteParams) {
    const creds = resolveChatProviderCredentials();
    const apiKey = chatProviderApiKey();
    if (!creds || !apiKey || creds.providerType !== "azure_openai") {
      throw directorError("provider_credentials", "azure_openai_credentials_unavailable");
    }
    const deployment = params.model?.trim() || creds.defaultModel;
    const result = await postChatCompletions({
      url: `${creds.baseUrl}/openai/deployments/${encodeURIComponent(deployment)}/chat/completions?api-version=${encodeURIComponent(creds.azureApiVersion ?? "2024-06-01")}`,
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: {
        temperature: 0,
        messages: params.messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
      },
      timeoutMs: DEFAULT_TIMEOUT_MS,
    });
    return {
      content: result.content,
      confidence: 0.78,
      evidenceRefs: [],
    };
  }
}
