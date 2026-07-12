import { DocumentIntelligenceError } from "./errors";
import {
  allowsDeterministicEmbeddings,
  isHashEmbeddingProvider,
  requiresRealEmbeddingProvider,
  resolveProjectIntelligenceRuntimeMode,
  type ProjectIntelligenceRuntimeMode,
} from "./runtime-mode";

/** Persistent pgvector column dimension for active Document Intelligence index. */
export const DOCUMENT_INTELLIGENCE_VECTOR_DIMENSION = 1536 as const;

export interface EmbeddingModelRegistryEntry {
  provider: string;
  model: string;
  embeddingDimension: number;
  version: string;
  activationState: "active" | "inactive" | "deprecated";
  tenantEligibility: "all" | "allowlist" | "deny";
  dataClassificationPolicy: string;
  region: string;
  batchSize: number;
  timeoutMs: number;
  retryPolicy: {
    maxAttempts: number;
    baseDelayMs: number;
    maxDelayMs: number;
  };
  costPer1kTokens: number;
  rateLimitPerMinute: number;
  privacyTermsRef: string;
  fallbackPolicy: string;
  deprecationState: "none" | "scheduled" | "deprecated";
}

export const OPENAI_TEXT_EMBEDDING_3_SMALL: EmbeddingModelRegistryEntry = {
  provider: "openai",
  model: "text-embedding-3-small",
  embeddingDimension: 1536,
  version: "text-embedding-3-small@1536",
  activationState: "active",
  tenantEligibility: "all",
  dataClassificationPolicy: "engineering-document-content",
  region: process.env.PLATFORM_EMBEDDING_REGION ?? "provider-default",
  batchSize: 64,
  timeoutMs: 60_000,
  retryPolicy: { maxAttempts: 4, baseDelayMs: 500, maxDelayMs: 8_000 },
  costPer1kTokens: 0.02,
  rateLimitPerMinute: 3_000,
  privacyTermsRef: "docs/security/PROJECT_INTELLIGENCE_DOCUMENT_PROVIDER_SECURITY.md",
  fallbackPolicy: "azure-openai-same-model-or-fail-closed",
  deprecationState: "none",
};

export function assertEmbeddingDimensionCompatible(
  declaredDimension: number,
  databaseDimension: number = DOCUMENT_INTELLIGENCE_VECTOR_DIMENSION,
): void {
  if (declaredDimension !== databaseDimension) {
    throw new DocumentIntelligenceError(
      "document_embedding_failed",
      `Embedding model dimension ${declaredDimension} is incompatible with database vector(${databaseDimension}). Use a versioned embedding table / controlled reindex — do not force-write.`,
      422,
      { declaredDimension, databaseDimension },
    );
  }
}

export function assertModelActivationAllowed(
  entry: EmbeddingModelRegistryEntry,
  mode: ProjectIntelligenceRuntimeMode = resolveProjectIntelligenceRuntimeMode(),
): void {
  if (entry.activationState !== "active") {
    throw new DocumentIntelligenceError(
      "document_embedding_failed",
      `Embedding model ${entry.model} is not active`,
      503,
      { activationState: entry.activationState },
    );
  }
  assertEmbeddingDimensionCompatible(entry.embeddingDimension);
  if (requiresRealEmbeddingProvider(mode) && isHashEmbeddingProvider(entry.provider)) {
    throw new DocumentIntelligenceError(
      "document_embedding_failed",
      "Hash/deterministic embeddings are forbidden in hosted_staging and production",
      503,
      { provider: entry.provider, mode },
    );
  }
  if (!allowsDeterministicEmbeddings(mode) && isHashEmbeddingProvider(entry.provider)) {
    throw new DocumentIntelligenceError(
      "document_embedding_failed",
      "Deterministic embeddings are not allowed in this runtime mode",
      503,
      { provider: entry.provider, mode },
    );
  }
}

export function resolveActiveEmbeddingModel(
  env: NodeJS.ProcessEnv = process.env,
): EmbeddingModelRegistryEntry {
  const model = env.PLATFORM_EMBEDDING_MODEL ?? OPENAI_TEXT_EMBEDDING_3_SMALL.model;
  return {
    ...OPENAI_TEXT_EMBEDDING_3_SMALL,
    model,
    version: `${model}@${OPENAI_TEXT_EMBEDDING_3_SMALL.embeddingDimension}`,
    region: env.PLATFORM_EMBEDDING_REGION ?? OPENAI_TEXT_EMBEDDING_3_SMALL.region,
  };
}
