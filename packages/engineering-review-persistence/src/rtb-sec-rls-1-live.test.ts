import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { applyHostedSqlFiles } from "../../engineering-os/scripts/apply-hosted-sql";
import { liveRlsMode, loadLocalEnv, resolveServiceRoleKey, resolveSupabaseAnonKey, resolveSupabaseUrl } from "./env";
import { mutationDenied, restFetch, type RestResult } from "./live-http";
import { cleanupTransientReviewPackages, provisionReviewRlsFixtures, type ReviewRlsFixtures } from "./fixtures";

const mode = liveRlsMode();
const LIVE = mode === "run";

const DT_TABLES = [
  "digital_twin_source_adapters",
  "digital_twin_state_schemas",
  "digital_twin_source_authority_policies",
] as const;

const SA_TABLES = [
  "security_assurance_compliance_frameworks",
  "security_assurance_compliance_framework_versions",
  "security_assurance_compliance_requirements",
  "security_assurance_compliance_control_mappings",
  "security_assurance_customer_claims",
] as const;

const ALL_REMEDIATED = [...DT_TABLES, ...SA_TABLES] as const;

const CANARY_ADAPTER = "rtb-sec-rls-1-canary-adapter";

function clientBlocked(result: RestResult): boolean {
  if (result.status === 200 || result.status === 201) {
    return Array.isArray(result.body) && result.body.length === 0;
  }
  return result.status >= 400 && result.status < 500;
}

describe.skipIf(!LIVE)("RTB-SEC-RLS-1 hosted public RLS certification", () => {
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
      throw new Error(`RTB-SEC-RLS-1 migration failed: ${applied.failed}`);
    }
    fixtures = await provisionReviewRlsFixtures();
    environment = "ready";
  });

  afterAll(async () => {
    if (environment === "ready") {
      await rest(`digital_twin_source_adapters?adapter_id=eq.${CANARY_ADAPTER}`, { method: "DELETE" }, serviceKey);
      await cleanupTransientReviewPackages();
    }
  });

  beforeEach(({ skip }) => {
    if (environment !== "ready") {
      skip("SKIPPED_ENVIRONMENT_UNAVAILABLE: RTB-SEC-RLS-1 tables are not on hosted Postgres");
    }
  });

  it("guard RPC reports zero public RLS/classification/anon-grant violations", async () => {
    const result = await rest("rpc/rtb_sec_rls_public_violations", { method: "POST", body: "{}" }, serviceKey);
    expect(result.status, JSON.stringify(result.body)).toBe(200);
    expect(Array.isArray(result.body), JSON.stringify(result.body)).toBe(true);
    expect(result.body, JSON.stringify(result.body)).toEqual([]);
  });

  it("anonymous SELECT/INSERT/UPDATE/DELETE is denied on every remediated table", async () => {
    for (const table of ALL_REMEDIATED) {
      const pk = table.startsWith("digital_twin") ? "adapter_id" : "framework_id";
      const select = await rest(`${table}?select=*&limit=5`);
      expect(clientBlocked(select), `${table} anon SELECT ${select.status} ${JSON.stringify(select.body)}`).toBe(true);
      if (select.status === 200) {
        expect(select.body, `${table} anon SELECT must not return rows`).toEqual([]);
      }

      const inserted = await rest(table, { method: "POST", body: JSON.stringify({ [pk]: "rtb-sec-rls-1-anon" }) });
      expect(clientBlocked(inserted) || mutationDenied(inserted), `${table} anon INSERT`).toBe(true);

      const updated = await rest(`${table}?limit=1`, { method: "PATCH", body: JSON.stringify({ [pk]: "rtb-sec-rls-1-anon" }) });
      expect(clientBlocked(updated) || mutationDenied(updated), `${table} anon UPDATE`).toBe(true);

      const deleted = await rest(`${table}?limit=1`, { method: "DELETE" });
      expect(clientBlocked(deleted) || mutationDenied(deleted), `${table} anon DELETE`).toBe(true);
    }
  });

  it("authenticated users may SELECT Digital Twin catalogs and cannot write them", async () => {
    for (const table of DT_TABLES) {
      const a1 = await rest(`${table}?select=*&limit=5`, {}, fixtures.users.a1.jwt);
      expect(a1.status, `${table} A1 SELECT ${JSON.stringify(a1.body)}`).toBe(200);

      const b1 = await rest(`${table}?select=*&limit=5`, {}, fixtures.users.b1.jwt);
      expect(b1.status, `${table} B1 SELECT ${JSON.stringify(b1.body)}`).toBe(200);

      const payload =
        table === "digital_twin_source_adapters"
          ? {
              adapter_id: "rtb-sec-rls-1-auth-write",
              adapter_version: "0",
              source_type: "manual",
              source_system: "rtb-sec-rls-1",
              source_owner: "security",
              data_freshness_policy: "n/a",
              authentication_mode: "none",
              polling_or_push_mode: "manual",
            }
          : table === "digital_twin_state_schemas"
            ? {
                schema_id: "rtb-sec-rls-1-auth-write",
                schema_version: "0",
                display_name: "blocked",
                category: "observed",
              }
            : {
                policy_id: "rtb-sec-rls-1-auth-write",
                policy_version: "0",
                description: "blocked",
              };

      const inserted = await rest(table, { method: "POST", body: JSON.stringify(payload) }, fixtures.users.a1.jwt);
      expect(clientBlocked(inserted) || mutationDenied(inserted), `${table} A1 INSERT`).toBe(true);

      const insertedB = await rest(table, { method: "POST", body: JSON.stringify(payload) }, fixtures.users.b1.jwt);
      expect(clientBlocked(insertedB) || mutationDenied(insertedB), `${table} B1 INSERT`).toBe(true);
    }
  });

  it("authenticated tenant users cannot read or write Security Assurance backend-only tables", async () => {
    for (const table of SA_TABLES) {
      const a1 = await rest(`${table}?select=*&limit=5`, {}, fixtures.users.a1.jwt);
      expect(clientBlocked(a1), `${table} A1 SELECT ${a1.status} ${JSON.stringify(a1.body)}`).toBe(true);
      if (a1.status === 200) expect(a1.body).toEqual([]);

      const b1 = await rest(`${table}?select=*&limit=5`, {}, fixtures.users.b1.jwt);
      expect(clientBlocked(b1), `${table} B1 SELECT`).toBe(true);

      const inserted = await rest(
        table,
        { method: "POST", body: JSON.stringify({ framework_id: "ISO27001_2022" }) },
        fixtures.users.a1.jwt,
      );
      expect(clientBlocked(inserted) || mutationDenied(inserted), `${table} A1 INSERT`).toBe(true);
    }
  });

  it("service_role can insert and delete a Digital Twin canary adapter", async () => {
    const inserted = await rest(
      "digital_twin_source_adapters",
      {
        method: "POST",
        body: JSON.stringify({
          adapter_id: CANARY_ADAPTER,
          adapter_version: "0",
          source_type: "manual",
          source_system: "rtb-sec-rls-1",
          source_owner: "security",
          data_freshness_policy: "n/a",
          authentication_mode: "none",
          polling_or_push_mode: "manual",
        }),
      },
      serviceKey,
    );
    expect(inserted.status, JSON.stringify(inserted.body)).toBeGreaterThanOrEqual(200);
    expect(inserted.status).toBeLessThan(300);

    const read = await rest(
      `digital_twin_source_adapters?select=adapter_id&adapter_id=eq.${CANARY_ADAPTER}`,
      {},
      serviceKey,
    );
    expect(JSON.stringify(read.body)).toContain(CANARY_ADAPTER);

    const deleted = await rest(
      `digital_twin_source_adapters?adapter_id=eq.${CANARY_ADAPTER}`,
      { method: "DELETE" },
      serviceKey,
    );
    expect(deleted.status).toBeGreaterThanOrEqual(200);
    expect(deleted.status).toBeLessThan(300);
  });

  it("tenant isolation still holds on workspace-scoped review packages", async () => {
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
});
