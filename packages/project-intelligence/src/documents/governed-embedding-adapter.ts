import { createHash } from "node:crypto";
import type { EmbeddingRequest, EmbeddingResult, ProjectIntelligenceEmbeddingAdapter } from "./embedding-adapter";
import { DocumentIntelligenceError } from "./errors";

export type GovernedEmbeddingProviderKind = "openai" | "platform-staging-hash";

export interface GovernedEmbeddingAdapterOptions {
  /** OpenAI-compatible base URL (default api.openai.com). */
  baseUrl?: string;
  apiKey?: string;
  model?: string;
  dimensions?: 1536;
  /** When no API key, allow staging-hash path for durable-path cert (not production semantic proof). */
  allowStagingHashFallback?: boolean;
  providerKind?: GovernedEmbeddingProviderKind;
  logUsage?: (event: {
    provider: string;
    model: string;
    tokens: number;
    tenantHint?: string;
  }) => Promise<void> | void;
}

/**
 * Production embedding adapter. Prefer OpenAI text-embedding-3-small via Platform-configured key.
 * Staging-hash fallback is governed (metered, versioned) but is NOT production semantic proof.
 */
export class GovernedEmbeddingAdapter implements ProjectIntelligenceEmbeddingAdapter {
  private readonly baseUrl: string;
  private readonly apiKey?: string;
  private readonly model: string;
  private readonly dimensions: 1536;
  private readonly allowStagingHashFallback: boolean;
  private readonly providerKind: GovernedEmbeddingProviderKind;
  private readonly logUsage?: GovernedEmbeddingAdapterOptions["logUsage"];

  constructor(options: GovernedEmbeddingAdapterOptions = {}) {
    this.baseUrl = (options.baseUrl ?? process.env.PLATFORM_EMBEDDING_BASE_URL ?? "https://api.openai.com/v1").replace(/\/$/, "");
    this.apiKey = options.apiKey ?? process.env.PLATFORM_EMBEDDING_API_KEY ?? process.env.OPENAI_API_KEY;
    this.model = options.model ?? process.env.PLATFORM_EMBEDDING_MODEL ?? "text-embedding-3-small";
    this.dimensions = options.dimensions ?? 1536;
    this.allowStagingHashFallback = options.allowStagingHashFallback
      ?? (process.env.PLATFORM_EMBEDDING_ALLOW_STAGING_HASH === "1"
        || process.env.PROJECT_INTELLIGENCE_CERTIFICATION === "1");
    this.providerKind = options.providerKind
      ?? (this.apiKey ? "openai" : "platform-staging-hash");
    this.logUsage = options.logUsage;
  }

  get provider(): string {
    return this.providerKind === "openai" ? "openai" : "platform-staging-hash";
  }

  get modelId(): string {
    return this.providerKind === "openai" ? this.model : "platform-staging-hash-1536-v1";
  }

  async embed(request: EmbeddingRequest): Promise<EmbeddingResult> {
    const dimensions = request.dimensions ?? this.dimensions;
    if (dimensions !== 1536) {
      throw new DocumentIntelligenceError(
        "document_embedding_failed",
        "Governed embeddings require 1536 dimensions for pgvector index compatibility",
        422,
        { dimensions },
      );
    }

    if (this.providerKind === "openai" && this.apiKey) {
      return this.embedOpenAi(request, dimensions);
    }

    if (!this.allowStagingHashFallback) {
      throw new DocumentIntelligenceError(
        "document_embedding_failed",
        "No governed embedding API key configured",
        503,
      );
    }

    return this.embedStagingHash(request, dimensions);
  }

  private async embedOpenAi(request: EmbeddingRequest, dimensions: number): Promise<EmbeddingResult> {
    const response = await fetch(`${this.baseUrl}/embeddings`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${this.apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        input: request.texts,
        dimensions,
      }),
      signal: AbortSignal.timeout(60_000),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new DocumentIntelligenceError(
        "document_embedding_failed",
        `Embedding provider failed with HTTP ${response.status}`,
        502,
        { detail: detail.slice(0, 500) },
      );
    }

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

    await this.logUsage?.({
      provider: "openai",
      model: this.model,
      tokens: body.usage?.total_tokens ?? request.texts.reduce((sum, text) => sum + Math.ceil(text.length / 4), 0),
    });

    return {
      embeddings,
      dimensions,
      provider: "openai",
      model: this.model,
      traceId: request.correlationId ?? createHash("sha256").update(request.texts.join("\n")).digest("hex").slice(0, 16),
    };
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

    await this.logUsage?.({
      provider: "platform-staging-hash",
      model: "platform-staging-hash-1536-v1",
      tokens: request.texts.reduce((sum, text) => sum + Math.ceil(text.length / 4), 0),
    });

    return {
      embeddings,
      dimensions,
      provider: "platform-staging-hash",
      model: "platform-staging-hash-1536-v1",
      traceId: request.correlationId ?? createHash("sha256").update(request.texts.join("\n")).digest("hex").slice(0, 16),
    };
  }
}
