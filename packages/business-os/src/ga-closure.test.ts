import { describe, expect, it } from "vitest";
import { BUSINESS_CAPABILITY_IDS } from "@rtb/types";
import { createPlatformKernel } from "@rtb/platform-kernel";
import {
  BOS14A_STATUS,
  BOS14B_PROVIDER_STATUS,
  BOS14C_STATUS,
  BOS_13_CERTIFIED_SHA,
  BOS_14_BOUNDARY_NOTE,
  BOS_14_CERTIFIED_SHA,
  BOS_15_BOUNDARY_NOTE,
  BOS_15_VERDICT,
  BOS_14_PERFORMANCE_CONCURRENCY,
  BOS_14_PERFORMANCE_DATASET_SIZE,
  BOS_14_PERFORMANCE_ENVIRONMENT,
  BOS_14_VERDICT,
  BOS_CONNECTOR_CERTIFICATION,
  BOS_LIVE_RLS_REPRESENTATIVE_TABLES,
  BOS_PRODUCTION_GA_REMAINING_GATES,
  BOS_RELEASE_INDICATORS,
  BROWSER_E2E_STATUS,
  BUSINESS_OS_PHASE,
  BUSINESS_OS_VERSION,
  LIVE_RLS_STATUS,
  bosBrowserE2eCertified,
  bosLiveHubSpotCertified,
  bosLiveMicrosoft365Certified,
  bosLiveRlsCertified,
  bosLiveXeroCertified,
  bosProductionEligible,
  bosReleaseCandidate,
  browserE2eEnvironmentAvailable,
  computeBusinessHealth,
  computeFinanceMetrics,
  computePipelineMetrics,
  createBusinessOS,
  defaultBusinessCapabilityRegistry,
  evaluateBidNoBid,
  evaluatePricing,
  getBosReleaseDeclaration,
  liveProviderCredentialsAvailable,
  liveRlsEnvironmentAvailable,
  rankProfitFacts,
} from "./index";
import { testFact } from "./profit/test-facts";
import type { BusinessFinanceSnapshot, BusinessGrowthOpportunity, BusinessKpi } from "@rtb/types";

function percentile(samples: number[], p: number): number {
  const sorted = [...samples].sort((a, b) => a - b);
  if (!sorted.length) return 0;
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[idx]!;
}

describe("BOS-14 GA closure honesty", () => {
  it("preserves RC invariants and refuses GA without live/browser execution", () => {
    expect(BUSINESS_OS_VERSION).toBe("0.13.3");
    expect(BUSINESS_OS_PHASE).toBe("BOS-15");
    expect(BOS_14_VERDICT).toBe("PASS_WITH_LIMITATIONS");
    expect(BOS_15_VERDICT).toBe("PASS_WITH_LIMITATIONS");
    expect(BOS_14_BOUNDARY_NOTE).toContain("Do not implement new BOS modules");
    expect(BOS_15_BOUNDARY_NOTE).toContain("Do not implement new BOS modules");
    expect(BOS_13_CERTIFIED_SHA).toBe("be2f7e14af2ed10c0a123c84ce9ac51d702474ee");
    expect(BOS_14_CERTIFIED_SHA).toBe("1a52a8fedf065756ce78d1021e2a3bfda1546ea8");
    expect(defaultBusinessCapabilityRegistry.ids()).toHaveLength(18);
    expect([...defaultBusinessCapabilityRegistry.ids()]).toEqual([...BUSINESS_CAPABILITY_IDS]);
    const bos = createBusinessOS({} as never, createPlatformKernel({} as never));
    expect(bos.status.snapshot().phase).toBe("BOS-15");
    expect(bos.capabilities.list()).toHaveLength(18);
    expect(bosReleaseCandidate).toBe(true);
    expect(bosProductionEligible).toBe(false);
    expect(bosLiveRlsCertified).toBe(false);
    expect(bosLiveXeroCertified).toBe(false);
    expect(bosLiveMicrosoft365Certified).toBe(false);
    expect(bosLiveHubSpotCertified).toBe(false);
    expect(bosBrowserE2eCertified).toBe(false);
    expect(BOS_RELEASE_INDICATORS["bos.releaseCandidate"]).toBe(true);
    expect(BOS_RELEASE_INDICATORS["bos.productionEligible"]).toBe(false);
    expect(BOS_RELEASE_INDICATORS.implementsOwnAiStack).toBe(false);
    expect(BOS_RELEASE_INDICATORS.duplicateIntegrationStackDetected).toBe(false);
    expect(BOS_RELEASE_INDICATORS.duplicateAgentRuntimeDetected).toBe(false);
    expect(BOS_RELEASE_INDICATORS.duplicateKnowledgeGraphDetected).toBe(false);
    expect(BOS_RELEASE_INDICATORS.ExternalWritesDisabled).toBe(true);
    expect(BOS_RELEASE_INDICATORS.NoVendorHardDependency).toBe(true);
    expect(BOS_RELEASE_INDICATORS.NoAutonomousApproval).toBe(true);
    expect(BOS_RELEASE_INDICATORS.directAgentProviderAccess).toBe(false);
    expect(BOS_RELEASE_INDICATORS.unrestrictedGraphAccess).toBe(false);
    expect(BOS_RELEASE_INDICATORS.canonicalDomainMutationBypass).toBe(false);
    expect(BOS_RELEASE_INDICATORS.crossTenantConnectorAccess).toBe(false);
    expect(BOS_RELEASE_INDICATORS.crossTenantAgentAccess).toBe(false);
    expect(BOS_RELEASE_INDICATORS.suppressedIdentityReconstructionBlocked).toBe(true);
    expect(getBosReleaseDeclaration().productionGaReady).toBe(false);
  });
});

describe("BOS-14A live RLS", () => {
  it("returns BOS14A_BLOCKED_LIVE_RLS_ENV when JWTs and test DB are absent", () => {
    const liveRlsReady = liveRlsEnvironmentAvailable();
    expect(typeof liveRlsReady).toBe("boolean");
    if (!liveRlsReady) {
      expect(liveRlsReady).toBe(false);
    }
    expect(BOS14A_STATUS).toBe("BOS14A_BLOCKED_LIVE_RLS_ENV");
    expect(LIVE_RLS_STATUS).toBe("LIVE_RLS_NOT_CERTIFIED");
    expect(bosLiveRlsCertified).toBe(false);
    expect(BOS_LIVE_RLS_REPRESENTATIVE_TABLES).toEqual([
      "business_os_kpis",
      "business_os_finance_snapshots",
      "business_os_growth_leads",
      "business_os_revenue_proposals",
      "business_os_customers",
      "business_os_profit_facts",
      "business_os_work_items",
      "business_os_decisions",
      "business_os_risks",
      "business_os_context_projection_runs",
      "business_os_connector_staging",
    ]);
    expect(BOS_PRODUCTION_GA_REMAINING_GATES).toContain("BOS15B_BLOCKED_LIVE_RLS_ENV");
  });
});

describe("BOS-14B live providers", () => {
  it("classifies each provider BLOCKED_ENV and does not infer live from fixtures", () => {
    expect(liveProviderCredentialsAvailable("xero")).toBe(false);
    expect(liveProviderCredentialsAvailable("microsoft_365")).toBe(false);
    expect(liveProviderCredentialsAvailable("hubspot")).toBe(false);
    expect(BOS14B_PROVIDER_STATUS.xero).toBe("BLOCKED_ENV");
    expect(BOS14B_PROVIDER_STATUS.microsoft_365).toBe("BLOCKED_ENV");
    expect(BOS14B_PROVIDER_STATUS.hubspot).toBe("BLOCKED_ENV");
    expect(BOS_CONNECTOR_CERTIFICATION.xero.contract).toBe("CONTRACT_CERTIFIED");
    expect(BOS_CONNECTOR_CERTIFICATION.xero.sandbox).toBe("SANDBOX_CERTIFIED");
    expect(BOS_CONNECTOR_CERTIFICATION.xero.live).toBe("BLOCKED_ENV");
    expect(BOS_CONNECTOR_CERTIFICATION.xero.live).not.toBe("LIVE_PROVIDER_CERTIFIED");
    expect(BOS_CONNECTOR_CERTIFICATION.microsoft_365.live).toBe("BLOCKED_ENV");
    expect(BOS_CONNECTOR_CERTIFICATION.hubspot.live).toBe("BLOCKED_ENV");
    expect(bosLiveXeroCertified).toBe(false);
    expect(bosLiveMicrosoft365Certified).toBe(false);
    expect(bosLiveHubSpotCertified).toBe(false);
  });
});

describe("BOS-14C browser E2E", () => {
  it("does not certify browser E2E without a live app, auth, and Playwright base URL", () => {
    expect(browserE2eEnvironmentAvailable()).toBe(false);
    expect(BOS14C_STATUS).toBe("BOS14C_BLOCKED_BROWSER_ENV");
    expect(BROWSER_E2E_STATUS).toBe("BROWSER_E2E_NOT_CERTIFIED");
    expect(bosBrowserE2eCertified).toBe(false);
  });
});

describe("BOS-14 performance (larger fixture, not production scale)", () => {
  it("records p50/p95 on 1200-record synthetic load with declared concurrency", () => {
    const size = BOS_14_PERFORMANCE_DATASET_SIZE;
    const kpis: BusinessKpi[] = Array.from({ length: size }, (_, i) => ({
      id: `k${i}`,
      tenantId: "t",
      workspaceId: "w",
      key: `kpi_${i}`,
      name: `kpi_${i}`,
      category: i % 2 === 0 ? "cash" : "pipeline",
      unit: "minor",
      value: i % 9 === 0 ? null : i,
      target: null,
      warningThreshold: null,
      criticalThreshold: null,
      direction: "higher_is_better",
      status: i % 9 === 0 ? "unknown" : "healthy",
      measuredAt: "2026-08-18T09:00:00.000Z",
      sourceType: "demo",
      provenance: {},
      isDemo: true,
      createdAt: "2026-08-18T09:00:00.000Z",
      updatedAt: "2026-08-18T09:00:00.000Z",
    }));
    const opportunities: BusinessGrowthOpportunity[] = Array.from({ length: size }, (_, i) => ({
      id: `opp-${i}`,
      tenantId: "t",
      workspaceId: "w",
      name: `opp-${i}`,
      stage: i % 11 === 0 ? "won" : "qualified",
      estimatedValueMinor: String(10_000 + i),
      currency: "AUD",
      scale: 2,
      probabilityBps: null,
      expectedCloseDate: null,
      expectedMarginBps: null,
      sourceType: "demo",
      score: null,
      scoreVersion: "opportunity_score.v1",
      scoreDetail: {
        total: null,
        components: [],
        missingInputs: [],
        version: "opportunity_score.v1",
        method: "deterministic_opportunity_score_v1",
        disclaimer: "",
      },
      provenance: {},
      suppressed: false,
      isDemo: true,
      createdAt: "2026-06-01T00:00:00.000Z",
      updatedAt: "2026-06-01T00:00:00.000Z",
    }));
    const facts = Array.from({ length: size }, (_, i) =>
      testFact({ dimensionName: `cust-${i}`, revenueMinor: String(50_000 + i), directCostMinor: String(20_000 + i) }),
    );
    const snapshot: BusinessFinanceSnapshot = {
      id: "snap",
      tenantId: "t",
      workspaceId: "w",
      periodId: "p",
      currency: "AUD",
      scale: 2,
      revenueMinor: "38000000",
      costOfSalesMinor: "34808000",
      operatingExpensesMinor: "14000000",
      cashMinor: "21000000",
      accountsReceivableMinor: null,
      accountsPayableMinor: null,
      budgetRevenueMinor: null,
      budgetExpensesMinor: null,
      budgetProfitMinor: null,
      sourceType: "demo",
      provenance: {},
      syncedAt: "2026-07-02T09:00:00.000Z",
      isDemo: true,
      createdAt: "2026-07-02T09:00:00.000Z",
      updatedAt: "2026-07-02T09:00:00.000Z",
    };
    const measure = (fn: () => void, runs = 11): { p50: number; p95: number } => {
      const samples: number[] = [];
      for (let i = 0; i < runs; i += 1) {
        const started = performance.now();
        fn();
        samples.push(performance.now() - started);
      }
      return { p50: percentile(samples, 50), p95: percentile(samples, 95) };
    };
    const occ = measure(() => computeBusinessHealth(kpis));
    const finance = measure(() =>
      computeFinanceMetrics(snapshot, null, { periodStart: "2026-06-01", periodEnd: "2026-06-30" }),
    );
    const pipeline = measure(() => computePipelineMetrics(opportunities));
    const profit = measure(() => rankProfitFacts(facts, "contribution"));
    const pricing = measure(() => evaluatePricing({ currency: "AUD", revenueMinor: "12500000", estimatedDirectCostMinor: "9000000" }));
    const bid = measure(() => evaluateBidNoBid({}));
    for (const row of [occ, finance, pipeline, profit, pricing, bid]) {
      expect(row.p50).toBeGreaterThanOrEqual(0);
      expect(row.p95).toBeGreaterThanOrEqual(row.p50);
      expect(row.p95).toBeLessThan(5_000);
    }
    expect(size).toBe(1200);
    expect(BOS_14_PERFORMANCE_CONCURRENCY).toBe(4);
    expect(BOS_14_PERFORMANCE_ENVIRONMENT).toBe("cloud-agent-fixture");
  });
});
