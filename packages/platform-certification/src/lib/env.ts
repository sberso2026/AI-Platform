/**
 * Phase 7B platform certification environment helpers.
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

export const CERT_SLUG_PREFIX = "cert-platform-7b-";
export const ENGINEERING_PRODUCT_ID = "c1000000-0000-4000-8000-000000000001";
export const ENGINEERING_PLAN_ID = "d1000000-0000-4000-8000-000000000001";
export const REFERENCE_OS_PRODUCT_ID = "c1000000-0000-4000-8000-000000000006";
export const REFERENCE_OS_PLAN_ID = "d1000000-0000-4000-8000-000000000006";
export const HOSTED_PROJECT_REF = "wcydlhqiqdwgoaqrlget";

export function resolveRunId(): string {
  return (
    process.env.GITHUB_RUN_ID?.trim() ||
    process.env.PLATFORM_CERT_RUN_ID?.trim() ||
    Date.now().toString(36)
  );
}

export function isCertificationMode(): boolean {
  return process.env.PLATFORM_CERTIFICATION === "1";
}

export function resolveSupabaseUrl(): string | undefined {
  return (
    process.env.SUPABASE_URL ??
    process.env.SUPABASE_TEST_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_URL
  );
}

export function resolveSupabaseAnonKey(): string | undefined {
  return (
    process.env.SUPABASE_ANON_KEY ??
    process.env.SUPABASE_TEST_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function resolveServiceRoleKey(): string | undefined {
  return process.env.SUPABASE_SERVICE_ROLE_KEY;
}

export function resolveTestBaseUrl(): string {
  return process.env.RTB_TEST_BASE_URL ?? "http://127.0.0.1:3000";
}

export function certUserPassword(): string {
  return process.env.CERT_USER_PASSWORD ?? "CertPlatform7B!Pass";
}

export function assertProvisionEnv(): void {
  const missing: string[] = [];
  if (!resolveSupabaseUrl()?.trim()) missing.push("SUPABASE_URL");
  if (!resolveSupabaseAnonKey()?.trim()) missing.push("SUPABASE_ANON_KEY");
  if (!resolveServiceRoleKey()?.trim()) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (missing.length) throw new Error(`Provision requires: ${missing.join(", ")}`);
  if (process.env.ALLOW_PRODUCTION_CERTIFICATION === "true") {
    throw new Error("Destructive production certification blocked");
  }
}

export function fixturesManifestPath(pkgDir = process.cwd()): string {
  return resolve(pkgDir, "artifacts/platform-7b-fixtures.json");
}

export function loadFixturesManifest(pkgDir = process.cwd()): Platform7bFixturesManifest | null {
  const path = fixturesManifestPath(pkgDir);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8")) as Platform7bFixturesManifest;
}

export type Platform7bUserRole =
  | "owner"
  | "admin"
  | "eng_admin"
  | "engineer"
  | "viewer"
  | "unentitled";

export interface Platform7bUserFixture {
  userId: string;
  email: string;
  role: Platform7bUserRole;
  jwt: string;
}

export interface Platform7bInstallFixture {
  id: string;
  productId: string;
  productSlug: string;
  status: string;
}

export interface Platform7bFixturesManifest {
  runId: string;
  tenantId: string;
  tenantSlug: string;
  workspaces: { id: string; slug: string; name: string }[];
  users: Record<Platform7bUserRole, Platform7bUserFixture>;
  installations: {
    engineering: Platform7bInstallFixture;
    referenceOs: Platform7bInstallFixture;
  };
  createdAt: string;
}
