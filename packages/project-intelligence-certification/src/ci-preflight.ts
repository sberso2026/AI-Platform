const REQUIRED_SECRETS = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"] as const;
const PROVIDER_EMBEDDING_SECRETS = ["PLATFORM_EMBEDDING_API_KEY", "OPENAI_API_KEY"] as const;

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
    const hasEmbeddingKey = PROVIDER_EMBEDDING_SECRETS.some((key) => Boolean(env[key]?.trim()));
    if (!hasEmbeddingKey) {
      errors.push("missing embedding provider secret: PLATFORM_EMBEDDING_API_KEY or OPENAI_API_KEY");
    }
    if (env.PLATFORM_EMBEDDING_ALLOW_STAGING_HASH === "1") {
      errors.push("PLATFORM_EMBEDDING_ALLOW_STAGING_HASH must be disabled for provider certification");
    }
  }
  return errors;
}

const errors = checkCertificationPreflight();
if (errors.length > 0) {
  console.error(`[ci-preflight] FAIL\n${errors.map((error) => `- ${error}`).join("\n")}`);
  process.exitCode = 1;
} else console.log("[ci-preflight] PASS");
