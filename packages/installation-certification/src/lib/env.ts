/**
 * Installation certification environment validation and fixture types.
 * Hosted Supabase project: wcydlhqiqdwgoaqrlget
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

export const CERT_SLUG_PREFIX = "cert-install-";

export const ENGINEERING_PRODUCT_ID = "c1000000-0000-4000-8000-000000000001";
export const ENGINEERING_PLAN_ID = "d1000000-0000-4000-8000-000000000001";
export const HOSTED_PROJECT_REF = "wcydlhqiqdwgoaqrlget";

export function isCertificationMode(): boolean {
  return process.env.INSTALLATION_CERTIFICATION === "1";
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
  return process.env.RTB_TEST_BASE_URL ?? "http://localhost:3000";
}

export function resolveSchedulerSecret(): string | undefined {
  return process.env.COMMERCE_SCHEDULER_SECRET ?? process.env.INSTALLATION_SCHEDULER_SECRET;
}

export const PROVISION_SECRETS = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_ANON_KEY",
] as const;

export const CERTIFICATION_SECRETS = [
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_TEST_URL",
  "SUPABASE_TEST_ANON_KEY",
  "COMMERCE_SCHEDULER_SECRET",
  "COMMERCE_AUTH_SECRET",
] as const;

export function missingEnv(keys: readonly string[]): string[] {
  return keys.filter((key) => !process.env[key]?.trim());
}

export function assertProvisionEnv(): void {
  const missing = missingEnv(PROVISION_SECRETS);
  if (missing.length > 0) {
    throw new Error(`Provision requires: ${missing.join(", ")}`);
  }
}

export function assertCertificationSecrets(): void {
  const missing = missingEnv(CERTIFICATION_SECRETS);
  if (missing.length > 0) {
    throw new Error(`Certification requires secrets: ${missing.join(", ")}`);
  }
}

export function assertRlsEnvOrFail(): void {
  if (!isCertificationMode()) return;

  const missing = [
    ...missingEnv(["SUPABASE_TEST_URL", "SUPABASE_TEST_ANON_KEY"]),
    ...(loadFixturesManifest() ? [] : ["artifacts/cert-fixtures.json"]),
  ];

  if (missing.length > 0) {
    throw new Error(
      `INSTALLATION_CERTIFICATION=1: missing RLS prerequisites: ${missing.join(", ")}`
    );
  }
}

export function certUserPassword(): string {
  return process.env.CERT_USER_PASSWORD ?? "CertInstall!Phase3";
}

export interface CertUserFixture {
  userId: string;
  email: string;
  role: string;
  jwt: string;
  hasSeat: boolean;
}

export interface CertWorkspaceFixture {
  id: string;
  slug: string;
}

export interface CertInstallationFixture {
  productInstallationId: string;
  appInstallationIds: Record<string, string>;
  workspaceProductAssignmentId?: string;
}

export interface CertTenantFixture {
  id: string;
  slug: string;
  workspaces: CertWorkspaceFixture[];
  users: Record<string, CertUserFixture>;
  subscriptionId: string;
  suspendedSubscriptionId: string;
  seatPoolId: string;
  billingAccountId: string;
  installations: CertInstallationFixture;
}

export interface CertFixturesManifest {
  createdAt: string;
  slugPrefix: string;
  tenantA: CertTenantFixture;
  tenantB: CertTenantFixture;
  orphanTenantIds: string[];
}

export function fixturesManifestPath(): string {
  return resolve(process.cwd(), "artifacts", "cert-fixtures.json");
}

export function loadFixturesManifest(): CertFixturesManifest | null {
  const path = fixturesManifestPath();
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8")) as CertFixturesManifest;
}

export function requireFixturesManifest(): CertFixturesManifest {
  const manifest = loadFixturesManifest();
  if (!manifest) {
    if (isCertificationMode()) {
      throw new Error("INSTALLATION_CERTIFICATION=1: artifacts/cert-fixtures.json is required");
    }
    throw new Error("cert-fixtures.json not found — run pnpm provision");
  }
  return manifest;
}

export function resolveJwtFromEnvOrFixtures(
  envKey: string,
  manifest: CertFixturesManifest | null,
  tenant: "tenantA" | "tenantB",
  role: string
): string | undefined {
  const fromEnv = process.env[envKey];
  if (fromEnv) return fromEnv;
  return manifest?.[tenant]?.users?.[role]?.jwt;
}
