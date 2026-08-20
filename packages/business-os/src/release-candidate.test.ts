import { describe, expect, it } from "vitest";
import { BUSINESS_CAPABILITY_IDS } from "@rtb/types";
import { createPlatformKernel } from "@rtb/platform-kernel";
import type { SupabaseClient } from "@rtb/database";
import { AuditService } from "@rtb/platform-core";
import {
  BUSINESS_OS_PHASE,
  BUSINESS_OS_VERSION,
  BOS_13_BOUNDARY_NOTE,
  BOS_CONNECTOR_CERTIFICATION,
  BOS_PRODUCTION_GA_REMAINING_GATES,
  BOS_RELEASE_INDICATORS,
  BOS_13_PERFORMANCE_DATASET_SIZE,
  BOS_13_PERFORMANCE_ENVIRONMENT,
  BOS_13_VERDICT,
  BOS_13_WEB_TSC_RECONCILIATION,
  BROWSER_E2E_STATUS,
  LIVE_RLS_STATUS,
  applyPricingGuardrails,
  assertConnectorUrl,
  assertNoInlineSecrets,
  assessInherent,
  bosBrowserE2eCertified,
  bosLiveHubSpotCertified,
  bosLiveMicrosoft365Certified,
  bosLiveRlsCertified,
  bosLiveXeroCertified,
  bosProductionEligible,
  bosReleaseCandidate,
  compareExpectedVsActual,
  computeBusinessHealth,
  computeCapacityMetrics,
  computeCostProgress,
  computeDecisionPriority,
  computeFactMetrics,
  computeFinanceMetrics,
  computePipelineMetrics,
  computeResidual,
  computeWorkProgress,
  createBusinessOS,
  defaultBusinessCapabilityRegistry,
  defaultGuardrails,
  evaluateBidNoBid,
  evaluatePricing,
  getBosReleaseDeclaration,
  liveProviderCredentialsAvailable,
  liveRlsEnvironmentAvailable,
  money,
  previewCsv,
  rankProfitFacts,
  redactSecrets,
  sanitizeSpreadsheetCell,
  scoreLead,
  scoreOpportunity,
  sub,
} from "./index";
import { reconstructableSuppressedIdentityLeak } from "./connectors/suppression";
import { BosConnectorsService } from "./connectors/service";
import { createMemoryConnectorStore } from "./connectors/store";
import { BOS_CONNECTOR_ADAPTERS } from "./connectors/adapters";
import { BusinessContextGraphService } from "./context/service";
import { createMemoryGraphPort } from "./context/graph-port";
import { demoContextRecords, BOS_10_DEMO_CUSTOMER_ID } from "./context/demo";
import { AiWorkforceService } from "./workforce/service";
import { allowPolicyPort, createMemoryAgentRegistry, createMemoryWorkforceStore } from "./workforce/store";
import { testFact } from "./profit/test-facts";
import type { BusinessFinanceSnapshot, BusinessGrowthOpportunity, BusinessKpi } from "@rtb/types";

const SCOPE = {
  tenantId: "11111111-1111-4111-8111-111111111111",
  workspaceId: "22222222-2222-4222-8222-222222222222",
  userId: "33333333-3333-4333-8333-333333333333",
};
const HUMAN = { userId: SCOPE.userId, actorType: "human" as const };

function percentile(samples: number[], p: number): number {
  const sorted = [...samples].sort((a, b) => a - b);
  if (!sorted.length) return 0;
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[idx]!;
}

function financeSnapshot(
  partial: Partial<BusinessFinanceSnapshot> & Pick<BusinessFinanceSnapshot, "revenueMinor">,
): BusinessFinanceSnapshot {
  return {
    id: "snap",
    tenantId: SCOPE.tenantId,
    workspaceId: SCOPE.workspaceId,
    periodId: "p",
    currency: "AUD",
    scale: 2,
    costOfSalesMinor: "0",
    operatingExpensesMinor: "0",
    cashMinor: null,
    accountsReceivableMinor: null,
    accountsPayableMinor: null,
    budgetRevenueMinor: null,
    budgetExpensesMinor: null,
    budgetProfitMinor: null,
    sourceType: "demo",
    provenance: { sourceRecordId: "fin-src-1", live: false },
    syncedAt: "2026-07-02T09:00:00.000Z",
    isDemo: true,
    createdAt: "2026-07-02T09:00:00.000Z",
    updatedAt: "2026-07-02T09:00:00.000Z",
    ...partial,
  };
}

function kpi(partial: Partial<BusinessKpi> & Pick<BusinessKpi, "id" | "key" | "status">): BusinessKpi {
  return {
    tenantId: SCOPE.tenantId,
    workspaceId: SCOPE.workspaceId,
    name: partial.key,
    category: "cash",
    unit: "minor",
    value: partial.status === "unknown" ? null : 1,
    target: null,
    warningThreshold: null,
    criticalThreshold: null,
    direction: "higher_is_better",
    measuredAt: "2026-08-18T09:00:00.000Z",
    sourceType: "demo",
    provenance: { domain: "finance", live: false },
    isDemo: true,
    createdAt: "2026-08-18T09:00:00.000Z",
    updatedAt: "2026-08-18T09:00:00.000Z",
    ...partial,
  };
}

function opp(
  partial: Partial<BusinessGrowthOpportunity> & Pick<BusinessGrowthOpportunity, "name" | "stage">,
): BusinessGrowthOpportunity {
  return {
    id: partial.name,
    tenantId: SCOPE.tenantId,
    workspaceId: SCOPE.workspaceId,
    estimatedValueMinor: "10000",
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
    provenance: { sourceRecordId: "growth-src-1" },
    suppressed: false,
    isDemo: true,
    createdAt: "2026-06-01T00:00:00.000Z",
    updatedAt: "2026-06-01T00:00:00.000Z",
    ...partial,
  };
}

describe("BOS-13 release indicators", () => {
  it("declares RC with honest live/GA limitations and no new capability", () => {
    expect(BUSINESS_OS_VERSION).toBe("0.13.2");
    expect(BUSINESS_OS_PHASE).toBe("BOS-14");
    expect(BOS_13_VERDICT).toBe("PASS_WITH_LIMITATIONS");
    expect(BOS_13_BOUNDARY_NOTE).toContain("Do not start a post-BOS-13 feature phase");
    expect(defaultBusinessCapabilityRegistry.ids()).toHaveLength(18);
    expect([...defaultBusinessCapabilityRegistry.ids()]).toEqual([...BUSINESS_CAPABILITY_IDS]);
    expect(BUSINESS_CAPABILITY_IDS).not.toContain("connectors_hardening");
    const bos = createBusinessOS({} as never, createPlatformKernel({} as never));
    expect(bos.status.snapshot().phase).toBe("BOS-14");
    expect(bos.capabilities.list()).toHaveLength(18);
    expect(BOS_RELEASE_INDICATORS).toEqual({
      "bos.releaseCandidate": true,
      "bos.productionEligible": false,
      "bos.liveRlsCertified": false,
      "bos.liveXeroCertified": false,
      "bos.liveMicrosoft365Certified": false,
      "bos.liveHubSpotCertified": false,
      "bos.browserE2eCertified": false,
      implementsOwnAiStack: false,
      duplicateIntegrationStackDetected: false,
      duplicateAgentRuntimeDetected: false,
      duplicateKnowledgeGraphDetected: false,
      ExternalWritesDisabled: true,
      NoVendorHardDependency: true,
      NoAutonomousApproval: true,
      directAgentProviderAccess: false,
      unrestrictedGraphAccess: false,
      canonicalDomainMutationBypass: false,
      crossTenantConnectorAccess: false,
      crossTenantAgentAccess: false,
      suppressedIdentityReconstructionBlocked: true,
    });
    expect(bosReleaseCandidate).toBe(true);
    expect(bosProductionEligible).toBe(false);
    expect(bosLiveRlsCertified).toBe(false);
    expect(bosLiveXeroCertified).toBe(false);
    expect(bosLiveMicrosoft365Certified).toBe(false);
    expect(bosLiveHubSpotCertified).toBe(false);
    expect(bosBrowserE2eCertified).toBe(false);
    expect(LIVE_RLS_STATUS).toBe("LIVE_RLS_NOT_CERTIFIED");
    expect(BROWSER_E2E_STATUS).toBe("BROWSER_E2E_NOT_CERTIFIED");
    expect(BOS_PRODUCTION_GA_REMAINING_GATES).toContain("BOS14A_BLOCKED_LIVE_RLS_ENV");
    expect(getBosReleaseDeclaration().productionGaReady).toBe(false);
    expect(BOS_13_WEB_TSC_RECONCILIATION.every((row) => row.status === "RESOLVED")).toBe(true);
    expect(BOS_13_WEB_TSC_RECONCILIATION.every((row) => row.classification === "PRE_EXISTING_BEFORE_BOS_12")).toBe(
      true,
    );
  });
});

describe("BOS-13 supervised business workflow", () => {
  it("preserves provenance, exact money, proposed/actual split, and human approval", () => {
    const sourceLead = {
      id: "lead-1",
      organisationName: "Acme Civil",
      industry: "construction",
      geography: "AU",
      estimatedValueMinor: "12500000",
      provenance: { sourceRecordId: "lead-1", sourceType: "demo" },
    };
    const frozenSource = structuredClone(sourceLead);
    const leadScore = scoreLead(
      {
        organisationName: sourceLead.organisationName,
        industry: sourceLead.industry,
        geography: sourceLead.geography,
        targetMarket: "infrastructure",
        companySizeBand: "mid",
        services: "advisory",
        website: "https://acme.example",
        evidenceOfNeed: true,
        relationshipKind: "referral",
      },
      {
        industries: ["construction"],
        geographies: ["AU"],
        companySizeBands: ["mid"],
        services: ["advisory"],
        targetMarkets: ["infrastructure"],
      },
    );
    const qualificationStatus = leadScore.total === null || leadScore.missingInputs.length > 0 ? "unknown" : "qualified";
    expect(qualificationStatus).not.toBe("approved");
    expect(sourceLead).toEqual(frozenSource);

    const opportunity = {
      ...sourceLead,
      id: "opp-1",
      sourceLeadId: sourceLead.id,
      stage: "proposal" as const,
      proposedValueMinor: sourceLead.estimatedValueMinor,
      actualValueMinor: null as string | null,
    };
    const opportunityScore = scoreOpportunity({
      estimatedValueMinor: opportunity.proposedValueMinor,
      expectedMarginBps: "2200",
      strategicFit: "high",
      relationshipStrength: "high",
      deliveryCapability: "medium",
      commercialRisk: "low",
      nextAction: "send proposal",
    });
    expect(opportunity.actualValueMinor).toBeNull();
    expect(opportunity.provenance.sourceRecordId).toBe("lead-1");

    const pricing = evaluatePricing({
      revenueMinor: opportunity.proposedValueMinor,
      estimatedDirectCostMinor: "9000000",
      allocatedCostMinor: "500000",
      discountBps: "1800",
      currency: "AUD",
      targetMarginBps: "2500",
    });
    const guarded = applyPricingGuardrails(pricing, defaultGuardrails("AUD"));
    expect(guarded.requiresApproval).toBe(true);
    expect(BOS_RELEASE_INDICATORS.NoAutonomousApproval).toBe(true);
    const bid = evaluateBidNoBid({
      opportunityScore: opportunityScore.total,
      estimatedValueMinor: opportunity.proposedValueMinor,
      expectedMarginBps: "2200",
      strategicFit: "high",
      relationshipStrength: "high",
      deliveryCapability: "medium",
      commercialRisk: "low",
      proposalEffort: "medium",
      evidenceQuality: "high",
      expectedCloseDate: "2026-10-01",
    });
    expect(bid.recommendation).not.toBe("approved");

    const proposed = money(opportunity.proposedValueMinor, "AUD")!;
    const operationalCost = money("4100000", "AUD")!;
    const actualRevenue = money("11800000", "AUD")!;
    const contribution = sub(actualRevenue, operationalCost);
    expect(contribution.minor).toBe(7700000n);
    expect(proposed.minor).not.toBe(actualRevenue.minor);

    const workProgress = computeWorkProgress({ progressBps: "4500" }, []);
    expect(workProgress.progressBps).toBe("4500");
    const costProgress = computeCostProgress({
      work: { budgetCostMinor: "9000000", currency: "AUD", scale: 2 },
      facts: [{ amountMinor: operationalCost.minor.toString(), currency: "AUD", scale: 2, valueState: "actual" }],
      progressBps: workProgress.progressBps,
    });
    expect(costProgress.unknownReasons ?? []).not.toContain("invented");

    const profit = computeFactMetrics(
      testFact({
        dimensionName: "Acme Civil",
        revenueMinor: actualRevenue.minor.toString(),
        directCostMinor: operationalCost.minor.toString(),
        valueState: "actual",
        provenance: { sourceRecordId: "lead-1" },
      }),
    );
    expect(profit.contribution?.minor).toBe("7700000");
    expect(profit.valueState).toBe("actual");

    const inherent = assessInherent("likely", "major");
    expect(inherent.level).not.toBe("unknown");
    const residual = computeResidual(inherent.level, []);
    expect(residual.residualLevel).toBe(inherent.level);

    const decision = computeDecisionPriority({
      pending: true,
      originatingSignalSeverity: "warning",
      financialImpactMinor: contribution.minor.toString(),
      customerImpact: "high",
      operationalImpact: "medium",
      reversibility: "reversible",
      strategicImportance: "high",
    });
    expect(decision.authoritativeAi).toBe(false);
    expect(["high", "urgent", "critical"]).toContain(decision.priority);

    const outcome = compareExpectedVsActual({
      expectedValue: proposed.minor.toString(),
      actualValue: actualRevenue.minor.toString(),
      expectedCurrency: "AUD",
      actualCurrency: "AUD",
      expectedScale: 2,
      actualScale: 2,
    });
    expect(outcome.comparable).toBe(true);
    expect(outcome.varianceState).toBe("computed");
    expect(sourceLead.estimatedValueMinor).toBe(frozenSource.estimatedValueMinor);
  });
});

describe("BOS-13 unknown-state integrity", () => {
  it("does not coerce missing evidence into healthy/zero/approved/low-risk states", () => {
    expect(computeBusinessHealth([]).overallStatus).toBe("unknown");
    expect(computeBusinessHealth([kpi({ id: "k1", key: "cash", status: "unknown", value: null })]).overallStatus).toBe(
      "unknown",
    );
    const finance = computeFinanceMetrics(financeSnapshot({ revenueMinor: null, costOfSalesMinor: null }), null, {
      periodStart: "2026-06-01",
      periodEnd: "2026-06-30",
    });
    expect(finance.grossProfit).toBeNull();
    expect(finance.unknownReasons.length).toBeGreaterThan(0);
    expect(computePipelineMetrics([]).totalPipeline).toBeNull();
    const emptyLead = scoreLead({});
    expect(emptyLead.total === null || emptyLead.missingInputs.length > 0).toBe(true);
    const emptyBid = evaluateBidNoBid({});
    expect(emptyBid.recommendation).toBe("insufficient_evidence");
    const emptyPricing = evaluatePricing({ currency: "AUD" });
    expect(emptyPricing.revenue).toBeNull();
    expect(emptyPricing.requiresApproval).toBe(false);
    const emptyProgress = computeWorkProgress({ progressBps: null }, []);
    expect(emptyProgress.progressBps).toBeNull();
    expect(emptyProgress.method).toBe("unknown");
    const emptyCapacity = computeCapacityMetrics({});
    expect(emptyCapacity.capacityStatus).toBe("unknown");
    const emptyProfit = computeFactMetrics(testFact({ dimensionName: "Unknown", revenueMinor: null, directCostMinor: null }));
    expect(emptyProfit.contribution).toBeNull();
    const unknownRisk = assessInherent("unknown", "unknown");
    expect(unknownRisk.level).toBe("unknown");
    expect(computeResidual("unknown", []).residualLevel).toBe("unknown");
    const unknownDecision = computeDecisionPriority({ pending: true });
    expect(unknownDecision.priority).toBe("unknown");
    const unknownOutcome = compareExpectedVsActual({ expectedValue: "100", actualValue: null });
    expect(unknownOutcome.varianceState).toBe("unknown");
  });
});

describe("BOS-13 OCC multi-domain primitives", () => {
  it("computes health only from KPI states and keeps domain math in domain modules", () => {
    const health = computeBusinessHealth([
      kpi({ id: "f", key: "runway", status: "warning", category: "cash", value: 4 }),
      kpi({ id: "g", key: "pipeline", status: "healthy", category: "pipeline", value: 1 }),
      kpi({ id: "r", key: "win_rate", status: "watch", category: "revenue", value: 1 }),
      kpi({ id: "c", key: "concentration", status: "warning", category: "receivables", value: 1 }),
      kpi({ id: "p", key: "contribution", status: "healthy", category: "margin", value: 1 }),
      kpi({ id: "o", key: "delivery", status: "watch", category: "operations", value: 1 }),
      kpi({ id: "d", key: "pending_decisions", status: "warning", category: "decision", value: 1 }),
      kpi({ id: "k", key: "residual_risk", status: "critical", category: "risk", value: 1 }),
    ]);
    expect(health.overallStatus).toBe("critical");
    expect(health.method).toBe("deterministic_kpi_weights_v1");
    expect(health.unknownCount).toBe(0);
  });
});

describe("BOS-13 connectors, secrets, SSRF, staging, CSV", () => {
  it("certifies contract/sandbox only and never infers live provider certification", async () => {
    expect(BOS_CONNECTOR_CERTIFICATION.xero.contract).toBe("CONTRACT_CERTIFIED");
    expect(BOS_CONNECTOR_CERTIFICATION.xero.sandbox).toBe("SANDBOX_CERTIFIED");
    expect(BOS_CONNECTOR_CERTIFICATION.xero.live).toBe("BLOCKED_ENV");
    expect(BOS_CONNECTOR_CERTIFICATION.microsoft_365.live).toBe("BLOCKED_ENV");
    expect(BOS_CONNECTOR_CERTIFICATION.hubspot.live).toBe("BLOCKED_ENV");
    expect(liveProviderCredentialsAvailable("xero")).toBe(false);
    expect(liveProviderCredentialsAvailable("microsoft_365")).toBe(false);
    expect(liveProviderCredentialsAvailable("hubspot")).toBe(false);

    const kernel = createPlatformKernel({} as SupabaseClient);
    const audit = new AuditService({} as SupabaseClient);
    const connectors = new BosConnectorsService({} as SupabaseClient, kernel, audit, {
      store: createMemoryConnectorStore(),
    });
    await expect(
      connectors.configure(SCOPE, { connectorId: "xero", accessToken: "tok_live" } as never, HUMAN),
    ).rejects.toThrow("secret_redaction_required");
    expect(() => assertNoInlineSecrets({ token: "abc" })).toThrow("secret_redaction_required");
    expect(JSON.stringify(redactSecrets({ accessToken: "secret", ok: true }))).not.toContain("secret");

    for (const host of [
      "http://api.xero.com/x",
      "https://127.0.0.1/x",
      "https://localhost/x",
      "https://169.254.169.254/latest/meta-data",
      "https://10.0.0.8/x",
      "https://192.168.1.4/x",
      "https://evil.example/xero",
    ]) {
      expect(() => assertConnectorUrl("xero", host)).toThrow("unrestricted_external_proxy_forbidden");
    }
    expect(assertConnectorUrl("xero", "https://api.xero.com/api.xro/2.0/Invoices").hostname).toBe("api.xero.com");
    expect(() => connectors.proxyArbitraryUrl()).toThrow("unrestricted_external_proxy_forbidden");
    expect(() => connectors.writeExternal()).toThrow("connector_write_forbidden");
    expect(() => BOS_CONNECTOR_ADAPTERS.hubspot.write()).toThrow("connector_write_forbidden");

    const installed = await connectors.configure(SCOPE, { connectorId: "hubspot", mode: "fixture" }, HUMAN);
    const run = await connectors.sync(SCOPE, { installationId: installed.id }, HUMAN);
    expect(run.status).toBe("completed");
    const staged = await connectors.store.listStaging(SCOPE);
    expect(staged.every((row) => row.becomesCanonical === false)).toBe(true);
    expect(staged.every((row) => row.mappingVersion && row.provider && row.externalSourceId && row.syncRunId)).toBe(
      true,
    );
    expect(JSON.stringify(staged)).not.toContain("Hidden Person");
    expect(reconstructableSuppressedIdentityLeak(staged)).toBe(false);

    const timed = await connectors.sync(SCOPE, { installationId: installed.id, simulate: "timeout" }, HUMAN);
    expect(timed.errorCategory).toBe("timeout");
    const limited = await connectors.sync(SCOPE, { installationId: installed.id, simulate: "rate_limit" }, HUMAN);
    expect(limited.status).toBe("partial");
    const partial = await connectors.sync(SCOPE, { installationId: installed.id, simulate: "partial" }, HUMAN);
    expect(["partial", "completed"]).toContain(partial.status);
    const cancelled = await connectors.sync(SCOPE, { installationId: installed.id, cancel: true }, HUMAN);
    expect(cancelled.status).toBe("cancelled");

    expect(() =>
      previewCsv({ filename: "customers.csv", entityType: "customer", content: `name\n${"A".repeat(1_000_001)}` }),
    ).toThrow("file_too_large");
    expect(() =>
      previewCsv({ filename: "customers.xlsx", entityType: "customer", content: "PK\nxl/workbook.xml" }),
    ).toThrow("macro_content_forbidden");
    expect(sanitizeSpreadsheetCell("=cmd")).toBe("'=cmd");
    const preview = await connectors.previewImport(
      SCOPE,
      { filename: "customers.csv", content: "name,external_id\nAcme,ext-1\nAcme,ext-1\n", entityType: "customer" },
      HUMAN,
    );
    expect(preview.preview.duplicates).toBe(1);
    expect(preview.batch.committedAt).toBeNull();
    const committed = await connectors.commitImport(
      SCOPE,
      { batchId: preview.batch.id, content: "name,external_id\nAcme,ext-1\nAcme,ext-1\n" },
      HUMAN,
    );
    expect(committed.status).toBe("committed");
    const afterCommit = await connectors.store.listStaging(SCOPE);
    expect(afterCommit.every((row) => row.becomesCanonical === false)).toBe(true);
  });
});

describe("BOS-13 AI workforce and context graph", () => {
  it("blocks registry mismatch, disabled/revoked agents, and canonical mutation", async () => {
    const graph = createMemoryGraphPort();
    const kernel = createPlatformKernel({} as SupabaseClient);
    const audit = new AuditService({} as SupabaseClient);
    const context = new BusinessContextGraphService({} as SupabaseClient, kernel, audit, graph);
    const store = createMemoryWorkforceStore();
    const workforce = new AiWorkforceService({} as SupabaseClient, kernel, audit, context, {
      store,
      registry: createMemoryAgentRegistry(),
      policy: allowPolicyPort(),
    });
    expect(() => workforce.callModelProvider()).toThrow("direct_provider_access_forbidden");
    expect(() => workforce.mutateCanonicalRecord()).toThrow("canonical_domain_mutation_forbidden");
    expect(() => workforce.autonomousApprove()).toThrow("autonomous_approval_forbidden");
    expect(() => workforce.unrestrictedGraph()).toThrow("unrestricted_graph_query_forbidden");
    expect(() => context.executeRawGraphQuery()).toThrow("unrestricted_graph_query_forbidden");
    expect(context.contract().projectionOnly).toBe(true);

    await context.applyRecords(SCOPE, demoContextRecords(SCOPE));
    const installed = await workforce.install(SCOPE, { slug: "business-advisor" }, HUMAN);
    await expect(
      workforce.requestTask(
        SCOPE,
        { installationId: installed.id, intent: "recommend", entityType: "customer", entityId: BOS_10_DEMO_CUSTOMER_ID },
        HUMAN,
      ),
    ).rejects.toThrow("agent_not_enabled");
    await expect(
      workforce.configure(SCOPE, installed.id, { authority: "execute_with_approval" }, HUMAN),
    ).rejects.toThrow("invalid_authority");
    await workforce.enable(SCOPE, installed.id, HUMAN);
    await workforce.revoke(SCOPE, installed.id, HUMAN);
    await expect(
      workforce.requestTask(
        SCOPE,
        { installationId: installed.id, intent: "recommend", entityType: "customer", entityId: BOS_10_DEMO_CUSTOMER_ID },
        HUMAN,
      ),
    ).rejects.toThrow("agent_not_enabled");

    const advisor = await workforce.install(SCOPE, { slug: "business-advisor" }, HUMAN);
    await workforce.enable(SCOPE, advisor.id, HUMAN);
    const current = await store.getInstallation(SCOPE, advisor.id);
    await store.upsertInstallation({ ...current!, kernelAgentId: "not-the-registry-id" });
    await expect(
      workforce.requestTask(
        SCOPE,
        { installationId: advisor.id, intent: "observe", entityType: "customer", entityId: BOS_10_DEMO_CUSTOMER_ID },
        HUMAN,
      ),
    ).rejects.toThrow("agent_registry_mismatch");
  });
});

describe("BOS-13 performance (fixture dataset, not production scale)", () => {
  it("records p50/p95 for multi-domain operations without claiming GA scale", () => {
    const size = BOS_13_PERFORMANCE_DATASET_SIZE;
    const kpis = Array.from({ length: size }, (_, i) =>
      kpi({ id: `k${i}`, key: `kpi_${i}`, status: i % 7 === 0 ? "unknown" : "healthy", value: i % 7 === 0 ? null : i }),
    );
    const opportunities = Array.from({ length: size }, (_, i) =>
      opp({ name: `opp-${i}`, stage: i % 11 === 0 ? "won" : "qualified", estimatedValueMinor: String(10_000 + i) }),
    );
    const facts = Array.from({ length: size }, (_, i) =>
      testFact({
        dimensionName: `cust-${i}`,
        revenueMinor: String(50_000 + i),
        directCostMinor: String(20_000 + i),
      }),
    );
    const snapshot = financeSnapshot({
      revenueMinor: "38000000",
      costOfSalesMinor: "34808000",
      operatingExpensesMinor: "14000000",
      cashMinor: "21000000",
    });

    const measure = (fn: () => void, runs = 21): { p50: number; p95: number } => {
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
    const decision = measure(() =>
      computeDecisionPriority({ pending: true, originatingSignalSeverity: "warning", financialImpactMinor: "1000" }),
    );
    const risk = measure(() => assessInherent("possible", "moderate"));

    for (const row of [occ, finance, pipeline, profit, decision, risk]) {
      expect(row.p50).toBeGreaterThanOrEqual(0);
      expect(row.p95).toBeGreaterThanOrEqual(row.p50);
      expect(row.p95).toBeLessThan(2_000);
    }
    expect(BOS_13_PERFORMANCE_ENVIRONMENT).toBe("cloud-agent-fixture");
    expect(size).toBe(400);
  });

  it("records connector, search, and agent-context timings on a fixture environment", async () => {
    const graph = createMemoryGraphPort();
    const kernel = createPlatformKernel({} as SupabaseClient);
    const audit = new AuditService({} as SupabaseClient);
    const context = new BusinessContextGraphService({} as SupabaseClient, kernel, audit, graph);
    const connectors = new BosConnectorsService({} as SupabaseClient, kernel, audit, {
      store: createMemoryConnectorStore(),
    });
    const workforce = new AiWorkforceService({} as SupabaseClient, kernel, audit, context, {
      store: createMemoryWorkforceStore(),
      registry: createMemoryAgentRegistry(),
      policy: allowPolicyPort(),
    });
    await context.applyRecords(SCOPE, demoContextRecords(SCOPE));
    const installed = await connectors.configure(SCOPE, { connectorId: "xero", mode: "fixture" }, HUMAN);
    const samples = { sync: [] as number[], search: [] as number[], agent: [] as number[], overview: [] as number[] };
    for (let i = 0; i < 11; i += 1) {
      let started = performance.now();
      await connectors.overview(SCOPE);
      samples.overview.push(performance.now() - started);
      started = performance.now();
      await connectors.sync(SCOPE, { installationId: installed.id }, HUMAN);
      samples.sync.push(performance.now() - started);
      started = performance.now();
      await context.search(SCOPE, "Customer");
      samples.search.push(performance.now() - started);
      started = performance.now();
      await context.agentContext(SCOPE, { entityType: "customer", entityId: BOS_10_DEMO_CUSTOMER_ID });
      samples.agent.push(performance.now() - started);
    }
    for (const key of Object.keys(samples) as Array<keyof typeof samples>) {
      expect(percentile(samples[key], 95)).toBeGreaterThanOrEqual(percentile(samples[key], 50));
      expect(percentile(samples[key], 95)).toBeLessThan(2_000);
    }
    expect(await workforce.diagnostics(SCOPE)).toBeTruthy();
    expect(BOS_13_PERFORMANCE_ENVIRONMENT).toBe("cloud-agent-fixture");
  });
});

describe("BOS-13 live and browser honesty", () => {
  it("does not treat skipped live/browser suites as certification", () => {
    expect(liveRlsEnvironmentAvailable()).toBe(false);
    expect(LIVE_RLS_STATUS).toBe("LIVE_RLS_NOT_CERTIFIED");
    expect(bosLiveRlsCertified).toBe(false);
    expect(BROWSER_E2E_STATUS).toBe("BROWSER_E2E_NOT_CERTIFIED");
    expect(bosBrowserE2eCertified).toBe(false);
  });
});
