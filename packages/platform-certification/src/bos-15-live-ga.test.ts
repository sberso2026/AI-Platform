import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  BOS15A_STATUS,
  BOS15B_STATUS,
  BOS15C_STATUS,
  BOS15D_STATUS,
  BOS15E_STATUS,
  BOS15F_STATUS,
  BOS15_PROVIDER_STATUS,
  BOS_14_CERTIFIED_SHA,
  BOS_15_BOUNDARY_NOTE,
  BOS_15_VERDICT,
  BOS_CONNECTOR_CERTIFICATION,
  BOS_LIVE_RLS_REPRESENTATIVE_TABLES,
  BOS_PRODUCTION_GA_REMAINING_GATES,
  BOS_RELEASE_INDICATORS,
  BUSINESS_OS_PHASE,
  BUSINESS_OS_VERSION,
  bos15EnvironmentPreflight,
  bosBrowserE2eCertified,
  bosLiveRlsCertified,
  bosProductionEligible,
  bosReleaseCandidate,
  browserE2eEnvironmentAvailable,
  createBusinessOS,
  defaultBusinessCapabilityRegistry,
  liveProviderCredentialsAvailable,
  liveRlsEnvironmentAvailable,
} from "@rtb/business-os";
import { createPlatformKernel } from "@rtb/platform-kernel";
import { ambientBosLiveRlsReady } from "./lib/bos-live-env";
import { clearBosCertificationEnv } from "../../business-os/src/certification-env-harness";

const ROOT = resolve(import.meta.dirname, "../../..");
const TEST_URL = process.env.SUPABASE_TEST_URL;
const TEST_ANON_KEY = process.env.SUPABASE_TEST_ANON_KEY;
const TENANT_A_JWT = process.env.BOS_RLS_TENANT_A_JWT || process.env.COMMERCE_RLS_TENANT_A_JWT;
const TENANT_B_ID = process.env.BOS_RLS_TENANT_B_ID || process.env.COMMERCE_RLS_TENANT_B_ID;
const WORKSPACE_B_ID = process.env.BOS_RLS_WORKSPACE_B_ID;
const WORKSPACE_A_ID = process.env.BOS_RLS_WORKSPACE_A_ID;
const envReady = ambientBosLiveRlsReady();

describe("BOS-15 live GA certification", () => {
  beforeEach(() => {
    clearBosCertificationEnv();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });
  it("keeps capability count 18 and refuses productionEligible without live gates", () => {
    expect(BUSINESS_OS_VERSION).toBe("0.13.3");
    expect(BUSINESS_OS_PHASE).toBe("BOS-15");
    expect(BOS_15_VERDICT).toBe("PASS_WITH_LIMITATIONS");
    expect(BOS_15_BOUNDARY_NOTE).toContain("post-GA feature work");
    expect(BOS_14_CERTIFIED_SHA).toBe("1a52a8fedf065756ce78d1021e2a3bfda1546ea8");
    expect(defaultBusinessCapabilityRegistry.ids()).toHaveLength(18);
    const bos = createBusinessOS({} as never, createPlatformKernel({} as never));
    expect(bos.status.snapshot().phase).toBe("BOS-15");
    expect(bosReleaseCandidate).toBe(true);
    expect(bosProductionEligible).toBe(false);
    expect(BOS_RELEASE_INDICATORS["bos.liveRlsCertified"]).toBe(false);
    expect(BOS_RELEASE_INDICATORS["bos.liveXeroCertified"]).toBe(false);
    expect(BOS_RELEASE_INDICATORS["bos.liveMicrosoft365Certified"]).toBe(false);
    expect(BOS_RELEASE_INDICATORS["bos.liveHubSpotCertified"]).toBe(false);
    expect(BOS_RELEASE_INDICATORS["bos.browserE2eCertified"]).toBe(false);
    expect(BOS15A_STATUS).toBe("BOS15A_PREFLIGHT_COMPLETE");
    expect(BOS15B_STATUS).toBe("BOS15B_BLOCKED_LIVE_RLS_ENV");
    expect(BOS15C_STATUS).toBe("BOS15C_XERO_BLOCKED_ENV");
    expect(BOS15D_STATUS).toBe("BOS15D_MICROSOFT_365_BLOCKED_ENV");
    expect(BOS15E_STATUS).toBe("BOS15E_HUBSPOT_BLOCKED_ENV");
    expect(BOS15F_STATUS).toBe("BOS15F_BLOCKED_BROWSER_ENV");
    expect(BOS15_PROVIDER_STATUS.xero).toBe("BLOCKED_ENV");
    expect(BOS15_PROVIDER_STATUS.microsoft_365).toBe("BLOCKED_ENV");
    expect(BOS15_PROVIDER_STATUS.hubspot).toBe("BLOCKED_ENV");
    expect(BOS_CONNECTOR_CERTIFICATION.xero.live).toBe("BLOCKED_ENV");
    expect(bosBrowserE2eCertified).toBe(false);
    expect(browserE2eEnvironmentAvailable()).toBe(false);
    expect(liveProviderCredentialsAvailable("xero")).toBe(false);
    expect(BOS_PRODUCTION_GA_REMAINING_GATES).toEqual([
      "BOS15B_BLOCKED_LIVE_RLS_ENV",
      "BOS15C_XERO_BLOCKED_ENV",
      "BOS15D_MICROSOFT_365_BLOCKED_ENV",
      "BOS15E_HUBSPOT_BLOCKED_ENV",
      "BOS15F_BLOCKED_BROWSER_ENV",
      "inherited_engineering_os_web_tsc_baseline_debt",
    ]);
  });

  it("completes BOS-15A preflight without exposing secret values", () => {
    const preflight = bos15EnvironmentPreflight();
    expect(liveRlsEnvironmentAvailable()).toBe(false);
    expect(preflight.supabase.classification).toBe("BLOCKED_ENV");
    expect(preflight.xero.classification).toBe("BLOCKED_ENV");
    expect(preflight.microsoft365.classification).toBe("BLOCKED_ENV");
    expect(preflight.hubspot.classification).toBe("BLOCKED_ENV");
    expect(preflight.browser.classification).toBe("BLOCKED_ENV");
    expect(preflight.supabase.executed).toBe(false);
    expect(preflight.xero.executed).toBe(false);
    expect(preflight.microsoft365.executed).toBe(false);
    expect(preflight.hubspot.executed).toBe(false);
    expect(preflight.browser.executed).toBe(false);
    expect(JSON.stringify(preflight)).not.toMatch(/eyJ|sk-|secret-|Bearer /i);
  });

  it("does not treat FORCE RLS SQL as live denial certification", () => {
    const migration = resolve(ROOT, "supabase/migrations/20260819170000_batch_108_business_os_connectors_hardening.sql");
    expect(existsSync(migration)).toBe(true);
    expect(readFileSync(migration, "utf8")).toContain("FORCE ROW LEVEL SECURITY");
    expect(bosLiveRlsCertified).toBe(false);
    expect(liveRlsEnvironmentAvailable()).toBe(false);
  });
});

describe.skipIf(!envReady)("BOS-15B live RLS denial", () => {
  function authed(jwt: string): SupabaseClient {
    return createClient(TEST_URL!, TEST_ANON_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });
  }

  it("denies Tenant A SELECT/INSERT/UPDATE/DELETE against Tenant B representative BOS tables", async () => {
    const clientA = authed(TENANT_A_JWT!);
    for (const table of BOS_LIVE_RLS_REPRESENTATIVE_TABLES) {
      const selected = await clientA.from(table).select("id").eq("tenant_id", TENANT_B_ID!);
      expect(selected.error).toBeNull();
      expect(selected.data ?? []).toHaveLength(0);
      const inserted = await clientA.from(table).insert({ tenant_id: TENANT_B_ID } as never);
      expect(inserted.error).not.toBeNull();
      const updated = await clientA
        .from(table)
        .update({ updated_at: new Date().toISOString() } as never)
        .eq("tenant_id", TENANT_B_ID!);
      expect((updated.data ?? []).length === 0 || updated.error !== null).toBe(true);
      const deleted = await clientA.from(table).delete().eq("tenant_id", TENANT_B_ID!);
      expect((deleted.data ?? []).length === 0 || deleted.error !== null).toBe(true);
    }
  });

  it.skipIf(!WORKSPACE_B_ID)("denies unauthorized Workspace 2 SELECT/INSERT/UPDATE/DELETE", async () => {
    const clientA = authed(TENANT_A_JWT!);
    for (const table of BOS_LIVE_RLS_REPRESENTATIVE_TABLES) {
      const selected = await clientA.from(table).select("id").eq("workspace_id", WORKSPACE_B_ID!);
      expect(selected.data ?? []).toHaveLength(0);
      const inserted = await clientA.from(table).insert({ workspace_id: WORKSPACE_B_ID } as never);
      expect(inserted.error).not.toBeNull();
      const updated = await clientA
        .from(table)
        .update({ updated_at: new Date().toISOString() } as never)
        .eq("workspace_id", WORKSPACE_B_ID!);
      expect((updated.data ?? []).length === 0 || updated.error !== null).toBe(true);
      const deleted = await clientA.from(table).delete().eq("workspace_id", WORKSPACE_B_ID!);
      expect((deleted.data ?? []).length === 0 || deleted.error !== null).toBe(true);
    }
  });

  it.skipIf(!WORKSPACE_A_ID)("permits Tenant A Workspace 1 positive-control reads for a member", async () => {
    const clientA = authed(TENANT_A_JWT!);
    const selected = await clientA.from("business_os_kpis").select("id").eq("workspace_id", WORKSPACE_A_ID!);
    expect(selected.error).toBeNull();
  });
});
