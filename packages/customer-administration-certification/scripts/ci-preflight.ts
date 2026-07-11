/**
 * CI preflight — verify required GitHub secrets/variables are present.
 * Prints missing names only; never logs secret values.
 */
import { HOSTED_STAGING_PROJECT_REFS } from "../src/lib/env.js";

/** Repository secrets configured in GitHub Actions. */
const REQUIRED_GITHUB_SECRETS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "CERT_USER_PASSWORD",
  "COMMERCE_AUTH_SECRET",
  "COMMERCE_SCHEDULER_SECRET",
] as const;

function resolveProjectRef(url: string | undefined): string | null {
  if (!url) return null;
  return url.match(/https:\/\/([^.]+)/)?.[1] ?? null;
}

function main(): void {
  const missing = REQUIRED_GITHUB_SECRETS.filter((key) => !process.env[key]?.trim());

  const target = process.env.CUSTOMER_ADMIN_CERTIFICATION_TARGET?.trim() ?? "hosted_staging";
  const allowProduction = process.env.ALLOW_PRODUCTION_CERTIFICATION === "true";

  const errors: string[] = [...missing.map((name) => `missing secret: ${name}`)];

  if (target !== "hosted_staging") {
    errors.push(
      `CUSTOMER_ADMIN_CERTIFICATION_TARGET must be hosted_staging for release check (got: ${target})`
    );
  }

  if (allowProduction) {
    errors.push("ALLOW_PRODUCTION_CERTIFICATION must not be true for default release check");
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const projectRef = resolveProjectRef(supabaseUrl);
  if (
    projectRef &&
    !(HOSTED_STAGING_PROJECT_REFS as readonly string[]).includes(projectRef)
  ) {
    errors.push(
      `Supabase project ${projectRef} is not allowlisted for hosted_staging certification`
    );
  }

  if (errors.length > 0) {
    console.error("[ci-preflight] FAIL");
    for (const err of errors) console.error(`  - ${err}`);
    process.exit(1);
  }

  console.log("[ci-preflight] PASS — all required secrets present (values not logged)");
  console.log(`  certificationTarget: ${target}`);
  console.log(`  stagingProjectRef: ${projectRef ?? "unknown"}`);
}

main();
