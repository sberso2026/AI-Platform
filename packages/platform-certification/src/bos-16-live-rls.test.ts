import { afterEach, describe, expect, it, vi } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  BosLiveRlsEnvironmentError,
  BOS_LIVE_RLS_REPRESENTATIVE_TABLES,
  BOS_RELEASE_INDICATORS,
  assessBosLiveRlsEnvironment,
  bosLiveRlsCertified,
  bosProductionEligible,
  liveRlsEnvironmentAvailable,
} from "@rtb/business-os";
import {
  SUPPRESSED_CONTACT_LABEL,
  buildIdentity,
  redactSuppressedContactContent,
  suppressedContactLeaks,
} from "../../business-os/src/context/identity";
import { ambientBosLiveRlsReady } from "./lib/bos-live-env";

const TEST_URL = process.env.SUPABASE_TEST_URL;
const TEST_ANON_KEY = process.env.SUPABASE_TEST_ANON_KEY;
const TENANT_A_JWT = process.env.BOS_RLS_TENANT_A_JWT || process.env.COMMERCE_RLS_TENANT_A_JWT;
const TENANT_B_JWT = process.env.BOS_RLS_TENANT_B_JWT || process.env.COMMERCE_RLS_TENANT_B_JWT;
const TENANT_A_ID = process.env.BOS_RLS_TENANT_A_ID || process.env.COMMERCE_RLS_TENANT_A_ID;
const TENANT_B_ID = process.env.BOS_RLS_TENANT_B_ID || process.env.COMMERCE_RLS_TENANT_B_ID;
const WORKSPACE_A_ID = process.env.BOS_RLS_WORKSPACE_A_ID;
const WORKSPACE_B_ID = process.env.BOS_RLS_WORKSPACE_B_ID;
const WORKSPACE_ISOLATED_A_ID = process.env.BOS_RLS_WORKSPACE_ISOLATED_A_ID;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const envReady = ambientBosLiveRlsReady();

const POSITIVE_TABLES = [
  "business_os_kpis",
  "business_os_growth_leads",
  "business_os_growth_opportunities",
  "business_os_customers",
  "business_os_profit_facts",
  "business_os_work_items",
  "business_os_risks",
  "business_os_decisions",
  "business_os_actions",
] as const;

function authed(jwt: string): SupabaseClient {
  return createClient(TEST_URL!, TEST_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${jwt}` } },
  });
}

function jwtRole(token: string): string | undefined {
  const parts = token.split(".");
  if (parts.length !== 3) return undefined;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")) as { role?: unknown };
    return typeof payload.role === "string" ? payload.role : undefined;
  } catch {
    return undefined;
  }
}

describe("BOS-16 live RLS certification honesty", () => {
  it("keeps liveRlsCertified and productionEligible static false", () => {
    expect(bosLiveRlsCertified).toBe(false);
    expect(bosProductionEligible).toBe(false);
    expect(BOS_RELEASE_INDICATORS["bos.liveRlsCertified"]).toBe(false);
    expect(BOS_RELEASE_INDICATORS["bos.productionEligible"]).toBe(false);
    expect(BOS_LIVE_RLS_REPRESENTATIVE_TABLES).toHaveLength(11);
  });
});

describe.skipIf(!envReady)("BOS-16 live RLS execution", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("treats the complete user-session contract as available, not certified", () => {
    expect(liveRlsEnvironmentAvailable()).toBe(true);
    expect(assessBosLiveRlsEnvironment()).toEqual({
      status: "available",
      projectRef: "rntonzigxwxcjlcsadip",
      hostname: "rntonzigxwxcjlcsadip.supabase.co",
    });
    expect(bosLiveRlsCertified).toBe(false);
  });

  it("proves user JWTs are authenticated sessions and not service-role", () => {
    expect(TENANT_A_JWT).toBeTruthy();
    expect(TENANT_B_JWT).toBeTruthy();
    expect(TENANT_A_JWT).not.toBe(SERVICE_ROLE_KEY);
    expect(TENANT_B_JWT).not.toBe(SERVICE_ROLE_KEY);
    expect(TENANT_A_JWT).not.toBe(TENANT_B_JWT);
    expect(jwtRole(TENANT_A_JWT!)).toBe("authenticated");
    expect(jwtRole(TENANT_B_JWT!)).toBe("authenticated");
  });

  it("fails closed if a user JWT is replaced by the service-role key", () => {
    vi.stubEnv("BOS_RLS_TENANT_A_JWT", SERVICE_ROLE_KEY ?? "");
    vi.stubEnv("COMMERCE_RLS_TENANT_A_JWT", "");
    expect(() => liveRlsEnvironmentAvailable()).toThrow(BosLiveRlsEnvironmentError);
    expect(() => liveRlsEnvironmentAvailable()).toThrow(/privileged credential/);
  });

  it("allows User A same-tenant SELECT across BOS domains", async () => {
    const client = authed(TENANT_A_JWT!);
    for (const table of POSITIVE_TABLES) {
      const selected = await client.from(table).select("id").eq("tenant_id", TENANT_A_ID!).eq("workspace_id", WORKSPACE_A_ID!);
      expect(selected.error, table).toBeNull();
      expect((selected.data ?? []).length, table).toBeGreaterThan(0);
    }
  });

  it("allows User B same-tenant SELECT across BOS domains", async () => {
    const client = authed(TENANT_B_JWT!);
    for (const table of POSITIVE_TABLES) {
      const selected = await client.from(table).select("id").eq("tenant_id", TENANT_B_ID!).eq("workspace_id", WORKSPACE_B_ID!);
      expect(selected.error, table).toBeNull();
      expect((selected.data ?? []).length, table).toBeGreaterThan(0);
    }
  });

  it("denies User A SELECT of Tenant B records", async () => {
    const client = authed(TENANT_A_JWT!);
    for (const table of POSITIVE_TABLES) {
      const selected = await client.from(table).select("id").eq("tenant_id", TENANT_B_ID!);
      expect(selected.error, table).toBeNull();
      expect(selected.data ?? [], table).toHaveLength(0);
    }
  });

  it("denies User B SELECT of Tenant A records", async () => {
    const client = authed(TENANT_B_JWT!);
    for (const table of POSITIVE_TABLES) {
      const selected = await client.from(table).select("id").eq("tenant_id", TENANT_A_ID!);
      expect(selected.error, table).toBeNull();
      expect(selected.data ?? [], table).toHaveLength(0);
    }
  });

  it("denies User A SELECT of an unmembered workspace in Tenant A", async () => {
    expect(WORKSPACE_ISOLATED_A_ID).toBeTruthy();
    const client = authed(TENANT_A_JWT!);
    const selected = await client
      .from("business_os_kpis")
      .select("id")
      .eq("tenant_id", TENANT_A_ID!)
      .eq("workspace_id", WORKSPACE_ISOLATED_A_ID!);
    expect(selected.error).toBeNull();
    expect(selected.data ?? []).toHaveLength(0);
  });

  it("allows a bounded same-tenant User A KPI write and blocks cross-tenant/workspace mutation", async () => {
    const clientA = authed(TENANT_A_JWT!);
    const ownWrite = await clientA.from("business_os_kpis").upsert(
      {
        tenant_id: TENANT_A_ID,
        workspace_id: WORKSPACE_A_ID,
        key: "bos16_rls_user_write",
        name: "BOS-16 user-path write",
        source_type: "demo",
        is_demo: true,
        provenance: { cert_fixture: true, phase: "BOS-16A4", user_path: true },
      },
      { onConflict: "tenant_id,workspace_id,key" },
    );
    expect(ownWrite.error).toBeNull();

    const crossTenant = await clientA.from("business_os_kpis").insert({
      tenant_id: TENANT_B_ID,
      workspace_id: WORKSPACE_B_ID,
      key: "bos16_rls_cross_tenant_write",
      name: "should fail",
      source_type: "demo",
      is_demo: true,
    });
    expect(crossTenant.error).not.toBeNull();

    const crossWorkspace = await clientA.from("business_os_kpis").insert({
      tenant_id: TENANT_A_ID,
      workspace_id: WORKSPACE_ISOLATED_A_ID,
      key: "bos16_rls_cross_workspace_write",
      name: "should fail",
      source_type: "demo",
      is_demo: true,
    });
    expect(crossWorkspace.error).not.toBeNull();

    const clientB = authed(TENANT_B_JWT!);
    const leaked = await clientB.from("business_os_kpis").select("id").eq("key", "bos16_rls_cross_tenant_write");
    expect(leaked.data ?? []).toHaveLength(0);
  });

  it("blocks unauthorized UPDATE and DELETE against the other tenant", async () => {
    const clientA = authed(TENANT_A_JWT!);
    for (const table of POSITIVE_TABLES) {
      const updated = await clientA
        .from(table)
        .update({ updated_at: new Date().toISOString() } as never)
        .eq("tenant_id", TENANT_B_ID!);
      expect((updated.data ?? []).length === 0 || updated.error !== null, table).toBe(true);
      const deleted = await clientA.from(table).delete().eq("tenant_id", TENANT_B_ID!);
      expect((deleted.data ?? []).length === 0 || deleted.error !== null, table).toBe(true);
    }
  });

  it("lets service role read fixtures while user assertions stay on user JWTs", async () => {
    expect(SERVICE_ROLE_KEY).toBeTruthy();
    const admin = createClient(TEST_URL!, SERVICE_ROLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const adminRows = await admin.from("business_os_kpis").select("id").eq("tenant_id", TENANT_B_ID!);
    expect(adminRows.error).toBeNull();
    expect((adminRows.data ?? []).length).toBeGreaterThan(0);

    const userA = authed(TENANT_A_JWT!);
    const userRows = await userA.from("business_os_kpis").select("id").eq("tenant_id", TENANT_B_ID!);
    expect(userRows.error).toBeNull();
    expect(userRows.data ?? []).toHaveLength(0);
  });

  it("redacts suppressed contact content without reconstructing identity", async () => {
    const client = authed(TENANT_A_JWT!);
    const selected = await client
      .from("business_os_customer_contacts")
      .select("id, name, business_email, suppressed")
      .eq("tenant_id", TENANT_A_ID!)
      .eq("workspace_id", WORKSPACE_A_ID!)
      .eq("suppressed", true);
    expect(selected.error).toBeNull();
    expect((selected.data ?? []).length).toBeGreaterThan(0);
    const row = selected.data![0] as { id: string; name: string; business_email: string | null; suppressed: boolean };
    const identity = buildIdentity({
      tenantId: TENANT_A_ID!,
      workspaceId: WORKSPACE_A_ID!,
      domain: "customer",
      entityType: "contact",
      entityId: row.id,
      displayName: row.name,
      sourceType: "demo",
      sourceRef: row.business_email,
      effectiveAt: "2026-08-29T00:00:00.000Z",
      suppressed: true,
    });
    const redacted = redactSuppressedContactContent(identity);
    expect(redacted.displayName).toBe(SUPPRESSED_CONTACT_LABEL);
    expect(redacted.sourceRef).toBeNull();
    expect(redacted.personalFieldsSuppressed).toBe(true);
    expect(suppressedContactLeaks(redacted)).toBe(false);
  });
});
