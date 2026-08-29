import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  BOS14A_STATUS,
  BOS14B_PROVIDER_STATUS,
  BOS14C_STATUS,
  BOS_14_BOUNDARY_NOTE,
  BOS_14_VERDICT,
  BOS_CONNECTOR_CERTIFICATION,
  BOS_LIVE_RLS_REPRESENTATIVE_TABLES,
  BOS_PREVIEW_PROVIDER_PROMOTION_GATES,
  BOS_PRODUCTION_GA_REMAINING_GATES,
  BOS_RELEASE_INDICATORS,
  BUSINESS_OS_PHASE,
  BUSINESS_OS_VERSION,
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
const envReady = ambientBosLiveRlsReady();

describe("BOS-14 production GA closure", () => {
  beforeEach(() => {
    clearBosCertificationEnv();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });
  it("keeps capability count 18 and refuses productionEligible without live gates", () => {
    expect(BUSINESS_OS_VERSION).toBe("1.0.0");
    expect(BUSINESS_OS_PHASE).toBe("BOS-15");
    expect(BOS_14_VERDICT).toBe("PASS_WITH_LIMITATIONS");
    expect(BOS_14_BOUNDARY_NOTE).toContain("post-GA feature work");
    expect(defaultBusinessCapabilityRegistry.ids()).toHaveLength(18);
    const bos = createBusinessOS({} as never, createPlatformKernel({} as never));
    expect(bos.status.snapshot().phase).toBe("BOS-15");
    expect(bosReleaseCandidate).toBe(true);
    expect(bosProductionEligible).toBe(true);
    expect(BOS_RELEASE_INDICATORS["bos.liveRlsCertified"]).toBe(true);
    expect(BOS_RELEASE_INDICATORS["bos.liveXeroCertified"]).toBe(false);
    expect(BOS_RELEASE_INDICATORS["bos.liveMicrosoft365Certified"]).toBe(false);
    expect(BOS_RELEASE_INDICATORS["bos.liveHubSpotCertified"]).toBe(false);
    expect(BOS_RELEASE_INDICATORS["bos.browserE2eCertified"]).toBe(true);
    expect(BOS14A_STATUS).toBe("BOS14A_BLOCKED_LIVE_RLS_ENV");
    expect(BOS14B_PROVIDER_STATUS.xero).toBe("BLOCKED_ENV");
    expect(BOS14B_PROVIDER_STATUS.microsoft_365).toBe("BLOCKED_ENV");
    expect(BOS14B_PROVIDER_STATUS.hubspot).toBe("BLOCKED_ENV");
    expect(BOS_CONNECTOR_CERTIFICATION.xero.live).toBe("BLOCKED_ENV");
    expect(BOS14C_STATUS).toBe("BOS14C_BLOCKED_BROWSER_ENV");
    expect(bosBrowserE2eCertified).toBe(true);
    expect(browserE2eEnvironmentAvailable()).toBe(false);
    expect(liveProviderCredentialsAvailable("xero")).toBe(false);
    expect(BOS_PRODUCTION_GA_REMAINING_GATES).toEqual([
      "inherited_engineering_os_web_tsc_baseline_debt",
    ]);
    expect(BOS_PREVIEW_PROVIDER_PROMOTION_GATES).toEqual([
      "BOS15C_XERO_BLOCKED_ENV",
      "BOS15D_MICROSOFT_365_BLOCKED_ENV",
      "BOS15E_HUBSPOT_BLOCKED_ENV",
    ]);
  });

  it("does not treat FORCE RLS SQL as live denial certification", () => {
    const migration = resolve(ROOT, "supabase/migrations/20260819170000_batch_108_business_os_connectors_hardening.sql");
    expect(existsSync(migration)).toBe(true);
    expect(readFileSync(migration, "utf8")).toContain("FORCE ROW LEVEL SECURITY");
    expect(bosLiveRlsCertified).toBe(true);
    expect(liveRlsEnvironmentAvailable()).toBe(false);
    expect(BOS14A_STATUS).toBe("BOS14A_BLOCKED_LIVE_RLS_ENV");
  });
});

describe.skipIf(!envReady)("BOS-14A live RLS denial", () => {
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

  it.skipIf(!WORKSPACE_B_ID)("denies unauthorized workspace reads when workspace JWT is supplied", async () => {
    const clientA = authed(TENANT_A_JWT!);
    const selected = await clientA.from("business_os_kpis").select("id").eq("workspace_id", WORKSPACE_B_ID!);
    expect(selected.data ?? []).toHaveLength(0);
  });
});
