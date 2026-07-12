export type ProjectIntelligenceRuntimeMode =
  | "unit_test"
  | "local_development"
  | "hosted_staging"
  | "production";

/**
 * Resolve runtime mode.
 * Provider production-readiness fail-closed applies only when explicitly in
 * hosted_staging/production (PI_PROVIDER_CERTIFICATION or RUNTIME_MODE), not merely
 * because the durable-path cert targets hosted Supabase with hash embeddings.
 */
export function resolveProjectIntelligenceRuntimeMode(
  env: NodeJS.ProcessEnv = process.env,
): ProjectIntelligenceRuntimeMode {
  const explicit = env.PROJECT_INTELLIGENCE_RUNTIME_MODE?.trim();
  if (
    explicit === "unit_test"
    || explicit === "local_development"
    || explicit === "hosted_staging"
    || explicit === "production"
  ) {
    return explicit;
  }
  if (env.NODE_ENV === "test" || env.VITEST === "true") return "unit_test";
  if (env.PI_PROVIDER_CERTIFICATION === "1") {
    if (env.PROJECT_INTELLIGENCE_CERTIFICATION_TARGET === "production") return "production";
    return "hosted_staging";
  }
  if (env.NODE_ENV === "production" && env.PROJECT_INTELLIGENCE_CERTIFICATION !== "1") {
    return "production";
  }
  return "local_development";
}

export function allowsDeterministicEmbeddings(mode: ProjectIntelligenceRuntimeMode): boolean {
  return mode === "unit_test" || mode === "local_development";
}

export function requiresRealEmbeddingProvider(mode: ProjectIntelligenceRuntimeMode): boolean {
  return mode === "hosted_staging" || mode === "production";
}

export function isHashEmbeddingProvider(provider: string): boolean {
  return provider === "platform-staging-hash"
    || provider === "deterministic-local"
    || provider.startsWith("hash-")
    || provider.includes("staging-hash");
}
