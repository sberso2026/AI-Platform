import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

export const PI_CERT_SLUG_PREFIX = "cert-pi-";
export const ENGINEERING_PRODUCT_ID = "c1000000-0000-4000-8000-000000000001";
export const ENGINEERING_PLAN_ID = "d1000000-0000-4000-8000-000000000001";

export interface PiUserFixture {
  id: string;
  email: string;
  jwt: string;
  role: string;
}

export interface PiDenialFixture {
  tenantId: string;
  expectedCode: string;
  expectedReason?: string;
  expectedState?: string;
}

export interface PiFixtureManifest {
  runId: string;
  createdAt: string;
  slugPrefix: string;
  baseline: {
    tenantId: string;
    workspaceId: string;
    workspaceBId: string;
    engineeringProjectId: string;
    mappingId: string;
    approvedMappingId: string;
    foreignMappingId: string;
    users: Record<string, PiUserFixture>;
    engineeringOsInstallationId: string;
    piApplicationInstallationId: string;
    licenceId: string;
    seatAssignments: { owner: string; engineer: string };
  };
  denial: {
    piNotInstalledTenant: PiDenialFixture & {
      owner: PiUserFixture;
      workspaceId: string;
      engineeringOsInstallationId: string;
    };
    suspendedLicence: PiDenialFixture & { owner: PiUserFixture; licenceId: string };
    seatNotAssigned: PiDenialFixture & { workspaceId: string; user: PiUserFixture };
    workspaceNotAssigned: PiDenialFixture & { userWithoutWorkspace: PiUserFixture };
  };
}

export function resolveSupabaseUrl(): string | undefined {
  return process.env.SUPABASE_URL ?? process.env.SUPABASE_TEST_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
}

export function resolveSupabaseAnonKey(): string | undefined {
  return process.env.SUPABASE_ANON_KEY ?? process.env.SUPABASE_TEST_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

export function resolveServiceRoleKey(): string | undefined {
  return process.env.SUPABASE_SERVICE_ROLE_KEY;
}

export function certUserPassword(): string {
  return process.env.CERT_USER_PASSWORD ?? "CertInstall!Phase3";
}

export function assertProvisionEnv(): void {
  const missing = [
    !resolveSupabaseUrl() && "SUPABASE_URL or SUPABASE_TEST_URL",
    !resolveSupabaseAnonKey() && "SUPABASE_ANON_KEY or SUPABASE_TEST_ANON_KEY",
    !resolveServiceRoleKey() && "SUPABASE_SERVICE_ROLE_KEY",
  ].filter(Boolean);
  if (missing.length) throw new Error(`PI fixture provisioning requires: ${missing.join(", ")}`);
}

export function fixturesManifestPath(): string {
  return resolve(process.cwd(), "artifacts", "pi-cert-fixtures.json");
}

export function loadPiFixturesManifest(): PiFixtureManifest | null {
  const path = fixturesManifestPath();
  return existsSync(path) ? (JSON.parse(readFileSync(path, "utf8")) as PiFixtureManifest) : null;
}

export function requirePiFixturesManifest(): PiFixtureManifest {
  const manifest = loadPiFixturesManifest();
  if (!manifest) throw new Error("artifacts/pi-cert-fixtures.json not found — run pnpm provision");
  return manifest;
}
