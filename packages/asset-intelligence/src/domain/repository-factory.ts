/**
 * Repository factory — production fails closed on memory adapter.
 */

import {
  assertProductionRepositorySafe,
  createDurableAssetIntelligenceMemoryStore,
  MemoryAssetIntelligenceRepository,
  PRODUCTION_MEMORY_REPOSITORY_ALLOWED,
  type AssetIntelligenceRepositoryPort,
  type DurableAssetIntelligenceStore,
  type RepositoryFactoryOptions,
} from "./persistence";
import { createPostgresAssetIntelligenceRepository } from "./postgres-repository";

export function createAssetIntelligenceRepository(
  options: RepositoryFactoryOptions = {},
): AssetIntelligenceRepositoryPort {
  const nodeEnv = options.nodeEnv ?? process.env.NODE_ENV ?? "development";
  const adapter =
    options.adapter ??
    (process.env.ASSET_INTELLIGENCE_REPOSITORY_ADAPTER as "memory" | "postgres" | undefined) ??
    (nodeEnv === "production" ? "postgres" : "memory");

  if (adapter === "memory") {
    assertProductionRepositorySafe("memory", nodeEnv);
    if (nodeEnv === "production" && !PRODUCTION_MEMORY_REPOSITORY_ALLOWED) {
      throw new Error("production_memory_repository_forbidden");
    }
    return new MemoryAssetIntelligenceRepository(
      options.memoryStore ?? createDurableAssetIntelligenceMemoryStore(),
    );
  }

  if (!options.supabase) {
    throw new Error("postgres_repository_requires_supabase_client");
  }
  return createPostgresAssetIntelligenceRepository(options.supabase as never);
}

export type { RepositoryFactoryOptions, DurableAssetIntelligenceStore };
