import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  BOS_13_BOUNDARY_NOTE,
  BOS_CONNECTOR_CERTIFICATION,
  BOS_PREVIEW_PROVIDER_PROMOTION_GATES,
  BOS_PRODUCTION_GA_REMAINING_GATES,
  BOS_RELEASE_INDICATORS,
  BOS_13_VERDICT,
  BOS_13_WEB_TSC_RECONCILIATION,
  BROWSER_E2E_STATUS,
  BUSINESS_OS_PHASE,
  BUSINESS_OS_VERSION,
  LIVE_RLS_STATUS,
  bosBrowserE2eCertified,
  bosLiveRlsCertified,
  bosProductionEligible,
  bosReleaseCandidate,
  createBusinessOS,
  defaultBusinessCapabilityRegistry,
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

const REPRESENTATIVE_TABLES = [
  "business_os_kpis",
  "business_os_finance_snapshots",
  "business_os_growth_leads",
  "business_os_revenue_proposals",
  "business_os_customers",
  "business_os_profit_facts",
  "business_os_work_items",
  "business_os_decisions",
  "business_os_risks",
  "business_os_connector_staging",
] as const;

describe("BOS-13 production validation", () => {
  beforeEach(() => {
    clearBosCertificationEnv();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });
  it("certifies RC limitations without a 19th capability or new domain", () => {
    expect(BUSINESS_OS_VERSION).toBe("0.13.3");
    expect(BUSINESS_OS_PHASE).toBe("BOS-15");
    expect(BOS_13_VERDICT).toBe("PASS_WITH_LIMITATIONS");
    expect(BOS_13_BOUNDARY_NOTE).toContain("Do not start a post-BOS-13 feature phase");
    expect(defaultBusinessCapabilityRegistry.ids()).toHaveLength(18);
    const bos = createBusinessOS({} as never, createPlatformKernel({} as never));
    expect(bos.status.snapshot().phase).toBe("BOS-15");
    expect(bos.capabilities.isImplemented("ai_workforce")).toBe(true);
    expect(bos.connectors.contract().implemented).toBe(true);
    expect(bosReleaseCandidate).toBe(true);
    expect(bosProductionEligible).toBe(false);
    expect(BOS_RELEASE_INDICATORS["bos.liveRlsCertified"]).toBe(false);
    expect(BOS_RELEASE_INDICATORS["bos.liveXeroCertified"]).toBe(false);
    expect(BOS_RELEASE_INDICATORS["bos.liveMicrosoft365Certified"]).toBe(false);
    expect(BOS_RELEASE_INDICATORS["bos.liveHubSpotCertified"]).toBe(false);
    expect(BOS_RELEASE_INDICATORS["bos.browserE2eCertified"]).toBe(false);
    expect(LIVE_RLS_STATUS).toBe("LIVE_RLS_NOT_CERTIFIED");
    expect(BROWSER_E2E_STATUS).toBe("BROWSER_E2E_NOT_CERTIFIED");
    expect(BOS_CONNECTOR_CERTIFICATION.xero.live).not.toBe("LIVE_PROVIDER_CERTIFIED");
    expect(BOS_PRODUCTION_GA_REMAINING_GATES).toEqual([
      "BOS15B_BLOCKED_LIVE_RLS_ENV",
      "BOS15F_BLOCKED_BROWSER_ENV",
      "inherited_engineering_os_web_tsc_baseline_debt",
      "BOS_V1_QUALIFICATION_PLAN_NOT_EXECUTED",
    ]);
    expect(BOS_PREVIEW_PROVIDER_PROMOTION_GATES).toEqual([
      "BOS15C_XERO_BLOCKED_ENV",
      "BOS15D_MICROSOFT_365_BLOCKED_ENV",
      "BOS15E_HUBSPOT_BLOCKED_ENV",
    ]);
  });

  it("records BOS-owned web tsc errors as pre-BOS-12 and resolved", () => {
    const occ = readFileSync(resolve(ROOT, "apps/web/src/app/(platform)/business/page.tsx"), "utf8");
    expect(occ).toContain("const [busy, setBusy] = useState(false);");
    expect(occ).toContain('fetch("/api/business/command")');
    expect(occ).toContain('fetch("/api/business/decisions/summary")');
    expect(occ).toContain('fetch("/api/business/risk/summary")');
    expect(occ).not.toMatch(/computeFinanceMetrics|scoreLead|evaluatePricing/);
    const operations = readFileSync(resolve(ROOT, "apps/web/src/app/(platform)/business/operations/page.tsx"), "utf8");
    expect(operations).toContain("<StatusChip value={row.health} />");
    expect(operations).not.toContain("label={row.health}");
    const detail = readFileSync(
      resolve(ROOT, "apps/web/src/app/(platform)/business/operations/[id]/page.tsx"),
      "utf8",
    );
    expect(detail).toContain("<StatusChip value={data.health.status} />");
    expect(BOS_13_WEB_TSC_RECONCILIATION).toHaveLength(3);
    expect(BOS_13_WEB_TSC_RECONCILIATION.every((row) => row.classification === "PRE_EXISTING_BEFORE_BOS_12")).toBe(
      true,
    );
    expect(BOS_13_WEB_TSC_RECONCILIATION.every((row) => row.status === "RESOLVED")).toBe(true);
  });

  it("does not treat SQL inspection as live RLS certification", () => {
    const migration = resolve(ROOT, "supabase/migrations/20260819170000_batch_108_business_os_connectors_hardening.sql");
    expect(existsSync(migration)).toBe(true);
    expect(readFileSync(migration, "utf8")).toContain("ENABLE ROW LEVEL SECURITY");
    expect(LIVE_RLS_STATUS).toBe("LIVE_RLS_NOT_CERTIFIED");
    expect(bosLiveRlsCertified).toBe(false);
    expect(liveRlsEnvironmentAvailable()).toBe(false);
    expect(bosBrowserE2eCertified).toBe(false);
  });
});

describe.skipIf(!envReady)("BOS-13 live RLS denial", () => {
  let clientA: SupabaseClient;

  function authed(jwt: string): SupabaseClient {
    return createClient(TEST_URL!, TEST_ANON_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });
  }

  it("denies Tenant A SELECT/INSERT/UPDATE/DELETE against Tenant B representative BOS tables", async () => {
    clientA = authed(TENANT_A_JWT!);
    for (const table of REPRESENTATIVE_TABLES) {
      const selected = await clientA.from(table).select("id").eq("tenant_id", TENANT_B_ID!);
      expect(selected.error).toBeNull();
      expect(selected.data ?? []).toHaveLength(0);

      const inserted = await clientA.from(table).insert({ tenant_id: TENANT_B_ID } as never);
      expect(inserted.error).not.toBeNull();

      const updated = await clientA.from(table).update({ updated_at: new Date().toISOString() } as never).eq("tenant_id", TENANT_B_ID!);
      expect((updated.data ?? []).length === 0 || updated.error !== null).toBe(true);

      const deleted = await clientA.from(table).delete().eq("tenant_id", TENANT_B_ID!);
      expect((deleted.data ?? []).length === 0 || deleted.error !== null).toBe(true);
    }
  });

  it.skipIf(!WORKSPACE_B_ID)("denies workspace isolation reads inside the same tenant when workspace JWT is supplied", async () => {
    clientA = authed(TENANT_A_JWT!);
    const selected = await clientA.from("business_os_kpis").select("id").eq("workspace_id", WORKSPACE_B_ID!);
    expect(selected.data ?? []).toHaveLength(0);
  });
});
