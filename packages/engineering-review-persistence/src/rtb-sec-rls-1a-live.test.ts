import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { applyHostedSqlFiles } from "../../engineering-os/scripts/apply-hosted-sql";
import { liveRlsMode, loadLocalEnv, resolveServiceRoleKey, resolveSupabaseAnonKey, resolveSupabaseUrl } from "./env";
import { mutationDenied, restFetch, type RestResult } from "./live-http";
import { cleanupTransientReviewPackages, provisionReviewRlsFixtures, type ReviewRlsFixtures } from "./fixtures";

const mode = liveRlsMode();
const LIVE = mode === "run";

const ANON_PROBE_TABLES = [
  "engineering_review_packages",
  "tenants",
  "profiles",
  "commercial_features",
  "digital_twin_source_adapters",
  "asset_intelligence_failure_taxonomy",
  "security_assurance_customer_claims",
] as const;

function clientBlocked(result: RestResult): boolean {
  if (result.status === 200 || result.status === 201) {
    return Array.isArray(result.body) && result.body.length === 0;
  }
  return result.status >= 400 && result.status < 500;
}

function asUuidArray(body: unknown): string[] {
  if (Array.isArray(body) && body.every((v) => typeof v === "string")) return body as string[];
  if (body && typeof body === "object" && "get_user_tenant_ids" in body) {
    const value = (body as { get_user_tenant_ids: unknown }).get_user_tenant_ids;
    if (Array.isArray(value)) return value.map(String);
  }
  return Array.isArray(body) ? body.map(String) : [];
}

describe.skipIf(!LIVE)("RTB-SEC-RLS-1A hosted least-privilege closeout", () => {
  loadLocalEnv();
  const url = resolveSupabaseUrl()!;
  const anonKey = resolveSupabaseAnonKey()!;
  const serviceKey = resolveServiceRoleKey()!;
  let fixtures: ReviewRlsFixtures;
  let environment: "ready" | "unavailable" = "unavailable";

  async function rest(path: string, options: RequestInit = {}, jwt?: string) {
    return restFetch(url, anonKey, serviceKey, path, options, jwt);
  }

  beforeAll(async () => {
    if (mode === "misconfigured") {
      throw new Error("ENGINEERING_REVIEW_RLS=1 but hosted credentials are missing");
    }
    const applied = await applyHostedSqlFiles([
      "supabase/migrations/20261007120000_rtb_sec_rls_1_public_schema_remediation.sql",
      "supabase/migrations/20261007140000_rtb_sec_rls_1a_least_privilege_closeout.sql",
    ]);
    if (applied.failed) {
      throw new Error(`RTB-SEC-RLS-1A migration failed: ${applied.failed}`);
    }
    fixtures = await provisionReviewRlsFixtures();
    environment = "ready";
  });

  afterAll(async () => {
    if (environment === "ready") {
      await cleanupTransientReviewPackages();
    }
  });

  beforeEach(({ skip }) => {
    if (environment !== "ready") {
      skip("SKIPPED_ENVIRONMENT_UNAVAILABLE: RTB-SEC-RLS-1A is not on hosted Postgres");
    }
  });

  it("guard RPC reports zero public RLS, anon-grant, and helper search_path violations", async () => {
    const result = await rest("rpc/rtb_sec_rls_public_violations", { method: "POST", body: "{}" }, serviceKey);
    expect(result.status, JSON.stringify(result.body)).toBe(200);
    expect(result.body, JSON.stringify(result.body)).toEqual([]);
  });

  it("anonymous SELECT/INSERT/UPDATE/DELETE is denied across representative public tables", async () => {
    for (const table of ANON_PROBE_TABLES) {
      const select = await rest(`${table}?select=*&limit=3`);
      expect(clientBlocked(select), `${table} anon SELECT ${select.status} ${JSON.stringify(select.body)}`).toBe(true);
      if (select.status === 200) expect(select.body).toEqual([]);

      const inserted = await rest(table, { method: "POST", body: JSON.stringify({ id: "00000000-0000-4000-8000-000000000001" }) });
      expect(clientBlocked(inserted) || mutationDenied(inserted), `${table} anon INSERT`).toBe(true);

      const updated = await rest(`${table}?limit=1`, { method: "PATCH", body: JSON.stringify({ id: "00000000-0000-4000-8000-000000000001" }) });
      expect(clientBlocked(updated) || mutationDenied(updated), `${table} anon UPDATE`).toBe(true);

      const deleted = await rest(`${table}?id=eq.00000000-0000-4000-8000-000000000001`, { method: "DELETE" });
      expect(clientBlocked(deleted) || mutationDenied(deleted), `${table} anon DELETE`).toBe(true);
    }
  });

  it("authenticated users can read intentional platform catalogs and cannot write taxonomy", async () => {
    const features = await rest("commercial_features?select=id&limit=3", {}, fixtures.users.a1.jwt);
    expect(features.status, JSON.stringify(features.body)).toBe(200);

    const adapters = await rest("digital_twin_source_adapters?select=adapter_id&limit=3", {}, fixtures.users.a1.jwt);
    expect(adapters.status, JSON.stringify(adapters.body)).toBe(200);

    const taxonomyWrite = await rest(
      "asset_intelligence_failure_taxonomy",
      {
        method: "POST",
        body: JSON.stringify({
          taxonomy_id: "rtb-sec-rls-1a-blocked",
          taxonomy_version: "0",
          kind: "failure_mode",
          code: "RTB-SEC-RLS-1A",
          name: "blocked",
          pack_owner: "security",
          status: "active",
          effective_from: new Date().toISOString(),
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(clientBlocked(taxonomyWrite) || mutationDenied(taxonomyWrite), JSON.stringify(taxonomyWrite.body)).toBe(true);
  });

  it("get_user_tenant_ids returns only the caller tenant and is denied to anon", async () => {
    const anonRpc = await rest("rpc/get_user_tenant_ids", { method: "POST", body: "{}" });
    expect(clientBlocked(anonRpc) || anonRpc.status >= 400, JSON.stringify(anonRpc.body)).toBe(true);

    const a1 = await rest("rpc/get_user_tenant_ids", { method: "POST", body: "{}" }, fixtures.users.a1.jwt);
    expect(a1.status, JSON.stringify(a1.body)).toBe(200);
    const a1Tenants = asUuidArray(a1.body);
    expect(a1Tenants).toContain(fixtures.tenantAId);
    expect(a1Tenants).not.toContain(fixtures.tenantBId);

    const b1 = await rest("rpc/get_user_tenant_ids", { method: "POST", body: "{}" }, fixtures.users.b1.jwt);
    expect(b1.status, JSON.stringify(b1.body)).toBe(200);
    const b1Tenants = asUuidArray(b1.body);
    expect(b1Tenants).toContain(fixtures.tenantBId);
    expect(b1Tenants).not.toContain(fixtures.tenantAId);
  });

  it("tenant and workspace isolation still holds on review packages", async () => {
    const own = await rest(
      `engineering_review_packages?select=id&id=eq.${fixtures.packageA1Id}`,
      {},
      fixtures.users.a1.jwt,
    );
    expect(own.status).toBe(200);
    expect(JSON.stringify(own.body)).toContain(fixtures.packageA1Id);

    const crossWorkspace = await rest(
      `engineering_review_packages?select=id&id=eq.${fixtures.packageA1Id}`,
      {},
      fixtures.users.a2.jwt,
    );
    expect(crossWorkspace.status).toBe(200);
    expect(Array.isArray(crossWorkspace.body) ? crossWorkspace.body : []).toEqual([]);

    const crossTenant = await rest(
      `engineering_review_packages?select=id&id=eq.${fixtures.packageA1Id}`,
      {},
      fixtures.users.b1.jwt,
    );
    expect(crossTenant.status).toBe(200);
    expect(Array.isArray(crossTenant.body) ? crossTenant.body : []).toEqual([]);
  });

  it("service_role can still read backend-only Security Assurance catalogs", async () => {
    const result = await rest("security_assurance_compliance_frameworks?select=framework_id&limit=5", {}, serviceKey);
    expect(result.status, JSON.stringify(result.body)).toBe(200);
  });
});
