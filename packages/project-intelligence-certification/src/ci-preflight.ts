const REQUIRED_SECRETS = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"] as const;

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
  return errors;
}

const errors = checkCertificationPreflight();
if (errors.length > 0) {
  console.error(`[ci-preflight] FAIL\n${errors.map((error) => `- ${error}`).join("\n")}`);
  process.exitCode = 1;
} else console.log("[ci-preflight] PASS");
