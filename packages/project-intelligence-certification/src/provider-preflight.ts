import {
  resolveProjectIntelligenceRuntimeMode,
  requiresRealEmbeddingProvider,
} from "@rtb/project-intelligence/server";

const REQUIRED_SECRETS = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"] as const;

export interface ProviderSecretPresence {
  PLATFORM_EMBEDDING_API_KEY: boolean;
  OPENAI_API_KEY: boolean;
  PLATFORM_EMBEDDING_BASE_URL: boolean;
  PLATFORM_EMBEDDING_PROVIDER: boolean;
  AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT: boolean;
  AZURE_DOCUMENT_INTELLIGENCE_KEY: boolean;
}

export function providerSecretPresence(env: NodeJS.ProcessEnv = process.env): ProviderSecretPresence {
  return {
    PLATFORM_EMBEDDING_API_KEY: Boolean(env.PLATFORM_EMBEDDING_API_KEY?.trim()),
    OPENAI_API_KEY: Boolean(env.OPENAI_API_KEY?.trim()),
    PLATFORM_EMBEDDING_BASE_URL: Boolean(env.PLATFORM_EMBEDDING_BASE_URL?.trim()),
    PLATFORM_EMBEDDING_PROVIDER: Boolean(env.PLATFORM_EMBEDDING_PROVIDER?.trim()),
    AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT: Boolean(env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT?.trim()),
    AZURE_DOCUMENT_INTELLIGENCE_KEY: Boolean(env.AZURE_DOCUMENT_INTELLIGENCE_KEY?.trim()),
  };
}

export function resolveEmbeddingSecretRouting(env: NodeJS.ProcessEnv = process.env): {
  errors: string[];
  provider: "openai" | "azure-openai" | "none";
  credentialSource: "PLATFORM_EMBEDDING_API_KEY" | "OPENAI_API_KEY" | "none";
  model: string;
  baseUrl: string;
} {
  const errors: string[] = [];
  const hasPlatform = Boolean(env.PLATFORM_EMBEDDING_API_KEY?.trim());
  const hasOpenAi = Boolean(env.OPENAI_API_KEY?.trim());
  const baseUrl = (env.PLATFORM_EMBEDDING_BASE_URL ?? "https://api.openai.com/v1").replace(/\/$/, "");
  const model = env.PLATFORM_EMBEDDING_MODEL ?? "text-embedding-3-small";
  const explicitProvider = env.PLATFORM_EMBEDDING_PROVIDER?.trim();

  if (!hasPlatform && !hasOpenAi) {
    errors.push("missing embedding provider secret: PLATFORM_EMBEDDING_API_KEY or OPENAI_API_KEY");
    return { errors, provider: "none", credentialSource: "none", model, baseUrl };
  }

  if (hasPlatform && hasOpenAi && !explicitProvider) {
    errors.push("ambiguous embedding secret routing: set PLATFORM_EMBEDDING_PROVIDER to openai or azure-openai");
  }

  const azureBase = baseUrl.includes("openai.azure.com");
  let provider: "openai" | "azure-openai" = azureBase ? "azure-openai" : "openai";
  if (explicitProvider === "openai" || explicitProvider === "azure-openai") {
    provider = explicitProvider;
  }

  if (provider === "azure-openai" && !env.PLATFORM_EMBEDDING_BASE_URL?.trim()) {
    errors.push("missing secret: PLATFORM_EMBEDDING_BASE_URL");
  }

  if (explicitProvider === "azure-openai" && !azureBase && env.PLATFORM_EMBEDDING_BASE_URL?.trim()) {
    errors.push("model registry provider and secret type disagree: PLATFORM_EMBEDDING_PROVIDER=azure-openai requires Azure OpenAI base URL");
  }

  if (explicitProvider === "openai" && azureBase) {
    errors.push("model registry provider and secret type disagree: PLATFORM_EMBEDDING_PROVIDER=openai cannot use Azure OpenAI base URL");
  }

  if (model !== "text-embedding-3-small" && env.PI_PROVIDER_CERTIFICATION === "1") {
    errors.push("PLATFORM_EMBEDDING_MODEL must be text-embedding-3-small for provider certification");
  }

  return {
    errors,
    provider,
    credentialSource: hasPlatform ? "PLATFORM_EMBEDDING_API_KEY" : "OPENAI_API_KEY",
    model,
    baseUrl,
  };
}

export function checkCertificationPreflight(env: NodeJS.ProcessEnv = process.env): string[] {
  const errors = REQUIRED_SECRETS.filter((key) => !env[key]?.trim()).map((key) => `missing secret: ${key}`);
  if (env.PROJECT_INTELLIGENCE_CERTIFICATION_TARGET === "production" || env.ALLOW_PRODUCTION_CERTIFICATION === "true") {
    errors.push("production certification is refused");
  }
  const url = env.NEXT_PUBLIC_SUPABASE_URL ?? env.SUPABASE_URL;
  const expected = env.PROJECT_INTELLIGENCE_CERTIFICATION_PROJECT_REF;
  const actual = url?.match(/https:\/\/([^.]+)/)?.[1];
  if (!expected) errors.push("PROJECT_INTELLIGENCE_CERTIFICATION_PROJECT_REF is required");
  else if (actual !== expected) errors.push(`wrong project: expected ${expected}, got ${actual ?? "unknown"}`);

  if (env.PI_PROVIDER_CERTIFICATION === "1") {
    const routing = resolveEmbeddingSecretRouting(env);
    errors.push(...routing.errors);

    if (env.PLATFORM_EMBEDDING_ALLOW_STAGING_HASH === "1") {
      errors.push("PLATFORM_EMBEDDING_ALLOW_STAGING_HASH must be disabled for provider certification");
    }

    const mode = resolveProjectIntelligenceRuntimeMode(env);
    if (requiresRealEmbeddingProvider(mode) && env.PLATFORM_EMBEDDING_FORCE_HASH === "1") {
      errors.push("production certification must not use platform-staging-hash");
    }

    if (env.PI_REQUIRE_AZURE_DI === "1") {
      if (!env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT?.trim()) {
        errors.push("missing secret: AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT");
      }
      if (!env.AZURE_DOCUMENT_INTELLIGENCE_KEY?.trim()) {
        errors.push("missing secret: AZURE_DOCUMENT_INTELLIGENCE_KEY");
      }
    }
  }
  return errors;
}
