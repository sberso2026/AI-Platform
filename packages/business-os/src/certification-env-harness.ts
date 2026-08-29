import { vi } from "vitest";

export const SYNTHETIC_BOS_STAGING_REF = "bosstagingtesthost1";
export const FORBIDDEN_SHARED_CERT_REF = "wcydlhqiqdwgoaqrlget";

export const BOS_CERTIFICATION_ENV_KEYS = [
  "BOS_STAGING_PROJECT_REF",
  "SUPABASE_TEST_URL",
  "SUPABASE_TEST_ANON_KEY",
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "BOS_RLS_TENANT_A_JWT",
  "COMMERCE_RLS_TENANT_A_JWT",
  "BOS_RLS_TENANT_B_JWT",
  "COMMERCE_RLS_TENANT_B_JWT",
  "BOS_RLS_TENANT_A_ID",
  "COMMERCE_RLS_TENANT_A_ID",
  "BOS_RLS_TENANT_B_ID",
  "COMMERCE_RLS_TENANT_B_ID",
  "BOS_RLS_WORKSPACE_A_ID",
  "BOS_RLS_WORKSPACE_B_ID",
  "BOS_RLS_WORKSPACE_A_JWT",
  "BOS_RLS_WORKSPACE_B_JWT",
  "RTB_TEST_BASE_URL",
  "PLAYWRIGHT_BASE_URL",
  "E2E_BASE_URL",
  "RTB_TEST_USER_EMAIL",
  "E2E_USER_EMAIL",
  "XERO_CLIENT_ID",
  "XERO_CLIENT_SECRET",
  "XERO_SECRET_ID",
  "XERO_TENANT_ID",
  "XERO_REFRESH_TOKEN",
  "NEXT_PUBLIC_XERO_CLIENT_ID",
  "NEXT_PUBLIC_XERO_CLIENT_SECRET",
  "NEXT_PUBLIC_XERO_SECRET_ID",
  "MS365_CLIENT_ID",
  "MS365_CLIENT_SECRET",
  "MS365_SECRET_ID",
  "MS365_TENANT_ID",
  "MS365_REFRESH_TOKEN",
  "MS365_TEST_USER",
  "NEXT_PUBLIC_MS365_CLIENT_ID",
  "NEXT_PUBLIC_MS365_CLIENT_SECRET",
  "NEXT_PUBLIC_MS365_SECRET_ID",
  "NEXT_PUBLIC_MS365_REFRESH_TOKEN",
  "HUBSPOT_ACCESS_TOKEN",
  "HUBSPOT_SECRET_ID",
  "HUBSPOT_PORTAL_ID",
] as const;

function applyEnv(values: Record<string, string>) {
  for (const [key, value] of Object.entries(values)) {
    if (value === "") {
      vi.stubEnv(key, "");
      delete process.env[key];
    } else {
      vi.stubEnv(key, value);
    }
  }
}

export function clearBosCertificationEnv() {
  for (const key of BOS_CERTIFICATION_ENV_KEYS) {
    vi.stubEnv(key, "");
    delete process.env[key];
  }
}

export function stubBosStagingTargetOnly(overrides: Record<string, string> = {}) {
  clearBosCertificationEnv();
  applyEnv({
    BOS_STAGING_PROJECT_REF: SYNTHETIC_BOS_STAGING_REF,
    SUPABASE_TEST_URL: `https://${SYNTHETIC_BOS_STAGING_REF}.supabase.co`,
    ...overrides,
  });
}

export function stubBosPartialLiveRls(overrides: Record<string, string> = {}) {
  stubBosStagingTargetOnly({
    SUPABASE_TEST_ANON_KEY: "anon-fixture",
    ...overrides,
  });
}

export function stubBosCompleteLiveRls(overrides: Record<string, string> = {}) {
  stubBosStagingTargetOnly({
    SUPABASE_TEST_ANON_KEY: "anon-fixture",
    BOS_RLS_TENANT_A_JWT: "jwt-a",
    BOS_RLS_TENANT_B_JWT: "jwt-b",
    BOS_RLS_TENANT_B_ID: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    ...overrides,
  });
}

export function stubBosInvalidTarget(overrides: Record<string, string> = {}) {
  clearBosCertificationEnv();
  applyEnv({
    BOS_STAGING_PROJECT_REF: SYNTHETIC_BOS_STAGING_REF,
    SUPABASE_TEST_URL: `https://${FORBIDDEN_SHARED_CERT_REF}.supabase.co`,
    ...overrides,
  });
}
