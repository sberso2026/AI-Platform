/**
 * Repository factory — production fails closed on the memory adapter.
 */

import {
  assertProductionRepositorySafe,
  createDurableProjectControlsMemoryStore,
  MemoryProjectControlsRepository,
  PRODUCTION_MEMORY_REPOSITORY_ALLOWED,
  type DurableProjectControlsStore,
  type ProjectControlsRepositoryPort,
  type RepositoryFactoryOptions,
} from "./persistence";
import { createPostgresProjectControlsRepository } from "./postgres-repository";

function resolveNodeEnv(
  value: string | undefined,
): "development" | "production" | "test" {
  if (value === "production" || value === "test") return value;
  return "development";
}

export function createProjectControlsRepository(
  options: RepositoryFactoryOptions = {},
): ProjectControlsRepositoryPort {
  const nodeEnv = resolveNodeEnv(options.nodeEnv ?? process.env.NODE_ENV);
  const adapter =
    options.adapter ??
    (process.env.PROJECT_CONTROLS_REPOSITORY_ADAPTER === "postgres"
      ? "postgres"
      : process.env.PROJECT_CONTROLS_REPOSITORY_ADAPTER === "memory"
        ? "memory"
        : undefined) ??
    (nodeEnv === "production" ? "postgres" : "memory");

  if (adapter === "memory") {
    assertProductionRepositorySafe("memory", nodeEnv);
    if (nodeEnv === "production" && !PRODUCTION_MEMORY_REPOSITORY_ALLOWED) {
      throw new Error("production_memory_repository_forbidden");
    }
    return new MemoryProjectControlsRepository(
      options.memoryStore ?? createDurableProjectControlsMemoryStore(),
    );
  }

  if (!options.supabase) {
    throw new Error("postgres_repository_requires_supabase_client");
  }
  return createPostgresProjectControlsRepository(options.supabase);
}

export type { RepositoryFactoryOptions, DurableProjectControlsStore };
