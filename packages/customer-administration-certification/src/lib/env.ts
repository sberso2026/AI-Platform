import { execSync } from "node:child_process";
import { resolve } from "node:path";

export const CERT_SLUG_PREFIX = "cert-phase4-";
export const HOSTED_PROJECT_REF = "wcydlhqiqdwgoaqrlget";
export const HOSTED_STAGING_PROJECT_REFS = [HOSTED_PROJECT_REF] as const;
export const HOSTED_PRODUCTION_PROJECT_REFS = [] as const;

export const REQUIRED_SECRETS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "CERT_USER_PASSWORD",
  "COMMERCE_SCHEDULER_SECRET",
  "COMMERCE_AUTH_SECRET",
] as const;

export function isCertificationMode(): boolean {
  return process.env.CUSTOMER_ADMIN_CERTIFICATION === "1";
}

export function resolveSupabaseUrl(): string | undefined {
  return process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
}

export function resolveSupabaseAnonKey(): string | undefined {
  return process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

export function resolveServiceRoleKey(): string | undefined {
  return process.env.SUPABASE_SERVICE_ROLE_KEY;
}

export function resolveTestBaseUrl(): string {
  return process.env.RTB_TEST_BASE_URL ?? "http://127.0.0.1:3000";
}

export function certUserPassword(): string {
  const pwd = process.env.CERT_USER_PASSWORD;
  if (!pwd?.trim()) {
    throw new Error("CERT_USER_PASSWORD is required for Phase 4 certification");
  }
  return pwd;
}

export function assertPreflight(
  root: string,
  options?: { allowDirty?: boolean }
): { commitSha: string; branch: string } {
  const missing = REQUIRED_SECRETS.filter((k) => !process.env[k]?.trim());
  if (missing.length > 0) {
    throw new Error(`Phase 4 preflight missing secrets: ${missing.join(", ")}`);
  }

  const allowDirty = options?.allowDirty ?? process.env.CUSTOMER_ADMIN_ALLOW_DIRTY === "1";
  const status = execSync("git status --porcelain", { cwd: root, encoding: "utf8" }).trim();
  if (status && !allowDirty) {
    throw new Error(
      `Phase 4 preflight: working tree must be clean before certification. Uncommitted:\n${status}`
    );
  }

  const commitSha = execSync("git rev-parse HEAD", { cwd: root, encoding: "utf8" }).trim();
  const branch = execSync("git rev-parse --abbrev-ref HEAD", { cwd: root, encoding: "utf8" }).trim();
  return { commitSha, branch };
}

export function fixturesManifestPath(): string {
  return resolve(process.cwd(), "artifacts/generated/customer-administration/phase4-cert-fixtures.json");
}
