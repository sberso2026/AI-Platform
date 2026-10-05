/**
 * Repository factory — production fails closed on the memory adapter.
 */

import {
  assertProductionRepositorySafe,
  createDurableDigitalTwinMemoryStore,
  MemoryDigitalTwinRepository,
  type DurableDigitalTwinStore,
  type DigitalTwinRepositoryPort,
  type RepositoryFactoryOptions,
} from "./persistence";
import { PRODUCTION_MEMORY_REPOSITORY_ALLOWED } from "../version";
import { createPostgresDigitalTwinRepository } from "./postgres-repository";

export function createDigitalTwinRepository(
  options: RepositoryFactoryOptions = {},
): DigitalTwinRepositoryPort {
  const nodeEnv = options.nodeEnv ?? process.env.NODE_ENV ?? "development";
  const adapter =
    options.adapter ??
    (process.env.DIGITAL_TWIN_REPOSITORY_ADAPTER as "memory" | "postgres" | undefined) ??
    (nodeEnv === "production" ? "postgres" : "memory");

  if (adapter === "memory") {
    assertProductionRepositorySafe("memory", nodeEnv);
    if (nodeEnv === "production" && !PRODUCTION_MEMORY_REPOSITORY_ALLOWED) {
      throw new Error("production_memory_repository_forbidden");
    }
    return new MemoryDigitalTwinRepository(
      options.memoryStore ?? createDurableDigitalTwinMemoryStore(),
    );
  }

  if (!options.supabase) {
    throw new Error("postgres_repository_requires_supabase_client");
  }
  return createPostgresDigitalTwinRepository(options.supabase);
}

export type { RepositoryFactoryOptions, DurableDigitalTwinStore };
