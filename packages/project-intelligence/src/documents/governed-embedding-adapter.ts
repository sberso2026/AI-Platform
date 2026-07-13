import { createHash, randomUUID } from "node:crypto";
import type { EmbeddingRequest, EmbeddingResult, ProjectIntelligenceEmbeddingAdapter } from "./embedding-adapter";
import {
  assertEmbeddingDimensionCompatible,
  assertModelActivationAllowed,
  DOCUMENT_INTELLIGENCE_VECTOR_DIMENSION,
  resolveActiveEmbeddingModel,
  type EmbeddingModelRegistryEntry,
} from "./embedding-registry";
import { DocumentIntelligenceError } from "./errors";
import {
  allowsDeterministicEmbeddings,
  isHashEmbeddingProvider,
  requiresRealEmbeddingProvider,
  resolveProjectIntelligenceRuntimeMode,
  type ProjectIntelligenceRuntimeMode,
} from "./runtime-mode";

export type GovernedEmbeddingProviderKind = "openai" | "azure-openai" | "platform-staging-hash";

export interface GovernedEmbeddingAdapterOptions {
  baseUrl?: string;
  apiKey?: string;
  model?: string;
  dimensions?: 1536;
  allowStagingHashFallback?: boolean;
  providerKind?: GovernedEmbeddingProviderKind;
  registryEntry?: EmbeddingModelRegistryEntry;
  runtimeMode?: ProjectIntelligenceRuntimeMode;
  logUsage?: (event: {
    provider: string;
    model: string;
    tokens: number;
    tenantHint?: string;
    costEstimate?: number;
    providerRequestId?: string;
    traceId: string;
  }) => Promise<void> | void;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Production embedding adapter.
 * Path: worker → Platform AI governance (registry + dimension guard) → approved provider → meter → validate → persist.
 * Hash embeddings are unit_test / local_development only — never silent fallback in hosted_staging/production.
 */
export class GovernedEmbeddingAdapter implements ProjectIntelligenceEmbeddingAdapter {
  private readonly baseUrl: string;
  private readonly apiKey?: string;
  private readonly model: string;
  private readonly dimensions: 1536;
  private readonly allowStagingHashFallback: boolean;
  private readonly providerKind: GovernedEmbeddingProviderKind;
  private readonly registryEntry: EmbeddingModelRegistryEntry;
  private readonly runtimeMode: ProjectIntelligenceRuntimeMode;
  private readonly logUsage?: GovernedEmbeddingAdapterOptions["logUsage"];

  constructor(options: GovernedEmbeddingAdapterOptions = {}) {
    this.runtimeMode = options.runtimeMode ?? resolveProjectIntelligenceRuntimeMode();
    this.registryEntry = options.registryEntry ?? resolveActiveEmbeddingModel();
    this.baseUrl = (options.baseUrl ?? process.env.PLATFORM_EMBEDDING_BASE_URL ?? "https://api.openai.com/v1").replace(/\/$/, "");
    this.apiKey = options.apiKey ?? process.env.PLATFORM_EMBEDDING_API_KEY ?? process.env.OPENAI_API_KEY;
    this.model = options.model ?? this.registryEntry.model;
    this.dimensions = options.dimensions ?? DOCUMENT_INTELLIGENCE_VECTOR_DIMENSION;
    assertEmbeddingDimensionCompatible(this.dimensions);
    assertEmbeddingDimensionCompatible(this.registryEntry.embeddingDimension);

    const hasKey = Boolean(this.apiKey?.trim());
    const explicitProvider = process.env.PLATFORM_EMBEDDING_PROVIDER?.trim();
    const defaultAllowHash = allowsDeterministicEmbeddings(this.runtimeMode)
      && !requiresRealEmbeddingProvider(this.runtimeMode)
      && (process.env.PLATFORM_EMBEDDING_ALLOW_STAGING_HASH === "1"
        || (process.env.PROJECT_INTELLIGENCE_CERTIFICATION === "1"
          && process.env.PI_PROVIDER_CERTIFICATION !== "1"
          && !requiresRealEmbeddingProvider(this.runtimeMode)));

    // Provider certification and production modes never allow hash fallback unless explicitly unit_test.
    this.allowStagingHashFallback = options.allowStagingHashFallback
      ?? (process.env.PI_PROVIDER_CERTIFICATION === "1" || requiresRealEmbeddingProvider(this.runtimeMode)
        ? false
        : defaultAllowHash || process.env.PLATFORM_EMBEDDING_ALLOW_STAGING_HASH === "1");

    if (options.providerKind) {
      this.providerKind = options.providerKind;
    } else if (explicitProvider === "openai" || explicitProvider === "azure-openai") {
      this.providerKind = explicitProvider;
    } else if (hasKey) {
      this.providerKind = this.baseUrl.includes("openai.azure.com") ? "azure-openai" : "openai";
    } else {
      this.providerKind = "platform-staging-hash";
    }

    if (requiresRealEmbeddingProvider(this.runtimeMode) || process.env.PI_PROVIDER_CERTIFICATION === "1") {
      if (!hasKey || isHashEmbeddingProvider(this.providerKind)) {
        throw new DocumentIntelligenceError(
          "document_embedding_failed",
          "Hosted staging/production requires a real governed embedding API key; hash embeddings are disabled",
          503,
          { mode: this.runtimeMode, provider: this.providerKind },
        );
      }
    }

    this.logUsage = options.logUsage;
  }

  get provider(): string {
    if (this.providerKind === "openai") return "openai";
    if (this.providerKind === "azure-openai") return "azure-openai";
    return "platform-staging-hash";
  }

  get modelId(): string {
    return this.providerKind === "platform-staging-hash"
      ? "platform-staging-hash-1536-v1"
      : this.model;
  }

  get registry(): EmbeddingModelRegistryEntry {
    return this.registryEntry;
  }

  async embed(request: EmbeddingRequest): Promise<EmbeddingResult> {
    assertModelActivationAllowed({
      ...this.registryEntry,
      provider: this.provider,
      model: this.modelId,
    }, this.runtimeMode);

    const dimensions = request.dimensions ?? this.dimensions;
    assertEmbeddingDimensionCompatible(dimensions);

    const maxChars = Number(process.env.PLATFORM_EMBEDDING_MAX_CHARS ?? 32_000);
    for (const text of request.texts) {
      if (text.length > maxChars) {
        throw new DocumentIntelligenceError(
          "document_embedding_failed",
          "Embedding content exceeds size limit",
          413,
          { maxChars },
        );
      }
    }

    if ((this.providerKind === "openai" || this.providerKind === "azure-openai") && this.apiKey) {
      return this.embedOpenAiCompatible(request, dimensions);
    }

    if (!this.allowStagingHashFallback || requiresRealEmbeddingProvider(this.runtimeMode)) {
      throw new DocumentIntelligenceError(
        "document_embedding_failed",
        "No governed embedding API key configured",
        503,
      );
    }

    return this.embedStagingHash(request, dimensions);
  }

  private async embedOpenAiCompatible(request: EmbeddingRequest, dimensions: number): Promise<EmbeddingResult> {
    const retry = this.registryEntry.retryPolicy;
    let lastError: unknown;
    for (let attempt = 1; attempt <= retry.maxAttempts; attempt += 1) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.registryEntry.timeoutMs);
        let response: Response;
        try {
          response = await fetch(`${this.baseUrl}/embeddings`, {
            method: "POST",
            headers: {
              authorization: `Bearer ${this.apiKey}`,
              "content-type": "application/json",
              "x-rtb-correlation-id": request.correlationId ?? randomUUID(),
            },
            body: JSON.stringify({
              model: this.model,
              input: request.texts,
              dimensions,
            }),
            signal: controller.signal,
          });
        } finally {
          clearTimeout(timer);
        }

        if (response.status === 429 || response.status >= 500) {
          const retryAfter = Number(response.headers.get("retry-after") ?? 0);
          const delay = Math.min(
            retry.maxDelayMs,
            retryAfter > 0 ? retryAfter * 1000 : retry.baseDelayMs * 2 ** (attempt - 1),
          );
          if (attempt < retry.maxAttempts) {
            await sleep(delay);
            continue;
          }
          throw new DocumentIntelligenceError(
            "document_embedding_failed",
            response.status === 429 ? "Embedding provider rate limited" : "Embedding provider unavailable",
            502,
            { status: response.status, attempt },
          );
        }

        if (!response.ok) {
          const detail = await response.text().catch(() => "");
          throw new DocumentIntelligenceError(
            "document_embedding_failed",
            `Embedding provider failed with HTTP ${response.status}`,
            502,
            { detail: detail.slice(0, 200) },
          );
        }

        const providerRequestId = response.headers.get("x-request-id")
          ?? response.headers.get("x-ms-request-id")
          ?? undefined;
        const body = await response.json() as {
          data?: Array<{ embedding: number[] }>;
          usage?: { total_tokens?: number };
        };
        const embeddings = (body.data ?? []).map((row) => row.embedding);
        if (embeddings.length !== request.texts.length) {
          throw new DocumentIntelligenceError("document_embedding_failed", "Embedding count mismatch", 502);
        }
        for (const vector of embeddings) {
          if (vector.length !== dimensions) {
            throw new DocumentIntelligenceError("document_embedding_failed", "Unexpected embedding dimensions", 502, {
              expected: dimensions,
              actual: vector.length,
            });
          }
        }

        const tokens = body.usage?.total_tokens
          ?? request.texts.reduce((sum, text) => sum + Math.ceil(text.length / 4), 0);
        const traceId = request.correlationId
          ?? createHash("sha256").update(request.texts.join("\n")).digest("hex").slice(0, 16);
        await this.logUsage?.({
          provider: this.provider,
          model: this.model,
          tokens,
          costEstimate: (tokens / 1000) * this.registryEntry.costPer1kTokens,
          providerRequestId,
          traceId,
        });

        return {
          embeddings,
          dimensions,
          provider: this.provider,
          model: this.model,
          traceId,
        };
      } catch (error) {
        lastError = error;
        if (error instanceof DocumentIntelligenceError && error.statusCode !== 502) throw error;
        if (attempt >= retry.maxAttempts) break;
        await sleep(Math.min(retry.maxDelayMs, retry.baseDelayMs * 2 ** (attempt - 1)));
      }
    }

    if (lastError instanceof DocumentIntelligenceError) throw lastError;
    throw new DocumentIntelligenceError(
      "document_embedding_failed",
      lastError instanceof Error ? lastError.message : "Embedding provider failed",
      502,
    );
  }

  private async embedStagingHash(request: EmbeddingRequest, dimensions: number): Promise<EmbeddingResult> {
    const embeddings = request.texts.map((text) => {
      const vector: number[] = [];
      for (let i = 0; i < dimensions; i += 1) {
        const digest = createHash("sha256").update(`${text}:${i}`).digest();
        const value = digest.readUInt32BE(0) / 0xffffffff;
        vector.push(Number((value * 2 - 1).toFixed(6)));
      }
      const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1;
      return vector.map((value) => Number((value / norm).toFixed(6)));
    });

    const traceId = request.correlationId
      ?? createHash("sha256").update(request.texts.join("\n")).digest("hex").slice(0, 16);
    await this.logUsage?.({
      provider: "platform-staging-hash",
      model: "platform-staging-hash-1536-v1",
      tokens: request.texts.reduce((sum, text) => sum + Math.ceil(text.length / 4), 0),
      traceId,
    });

    return {
      embeddings,
      dimensions,
      provider: "platform-staging-hash",
      model: "platform-staging-hash-1536-v1",
      traceId,
    };
  }
}
