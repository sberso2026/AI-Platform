import { createHash } from "node:crypto";
import { DocumentIntelligenceError } from "./errors";

export interface EmbeddingRequest {
  texts: readonly string[];
  dimensions?: 64 | 1536 | 3072;
  model?: string;
  correlationId?: string;
}

export interface EmbeddingResult {
  embeddings: readonly (readonly number[])[];
  dimensions: number;
  provider: string;
  model: string;
  traceId: string;
}

export interface ProjectIntelligenceEmbeddingAdapter {
  embed(request: EmbeddingRequest): Promise<EmbeddingResult>;
}

function hashToUnitFloat(seed: string, index: number): number {
  const digest = createHash("sha256").update(`${seed}:${index}`).digest();
  const value = digest.readUInt32BE(0) / 0xffffffff;
  return Number((value * 2 - 1).toFixed(6));
}

/** Deterministic local embeddings for certification — not for production semantic quality. */
export class DeterministicLocalEmbeddingAdapter implements ProjectIntelligenceEmbeddingAdapter {
  constructor(private readonly defaultDimensions: 64 | 1536 | 3072 = 64) {}

  async embed(request: EmbeddingRequest): Promise<EmbeddingResult> {
    const dimensions = request.dimensions ?? this.defaultDimensions;
    if (dimensions !== 64 && dimensions !== 1536 && dimensions !== 3072) {
      throw new DocumentIntelligenceError(
        "document_embedding_failed",
        "Unsupported embedding dimensions",
        422,
        { dimensions },
      );
    }

    const embeddings = request.texts.map((text) => {
      const vector: number[] = [];
      for (let i = 0; i < dimensions; i += 1) {
        vector.push(hashToUnitFloat(text, i));
      }
      const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1;
      return vector.map((value) => Number((value / norm).toFixed(6)));
    });

    return {
      embeddings,
      dimensions,
      provider: "deterministic-local",
      model: request.model ?? `local-hash-${dimensions}`,
      traceId: request.correlationId ?? createHash("sha256").update(request.texts.join("\n")).digest("hex").slice(0, 16),
    };
  }
}
