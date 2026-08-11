import { describe, expect, it } from "vitest";
import {
  AssetIntelligenceV1Intact,
  DigitalTwinV1Intact,
  EngineeringModelInteroperabilityV1Intact,
  EngineeringOSProductBoundaryLocked,
  InspectionIntelligenceV1Intact,
  ProjectControlsV1Intact,
  ProjectIntelligenceV1Intact,
  duplicateAssetOwnershipDetected,
  privateCrossModuleCouplingDetected,
} from "../version";
import {
  assertPhaseE11Invariants,
  getPhaseE11Declaration,
  PhaseE11BenchmarkIsNotRealUserKpi,
  PhaseE11NoUnsupportedProductivityClaims,
} from "./contracts";
import { runEngineeringOSEvaluation } from "./evaluation-framework";
import { runAllBenchmarkTasks, ENGINEERING_BENCHMARK_TASKS } from "./benchmark-tasks";
import { calculateEfficiencyDeltas } from "./efficiency";
import {
  assertNeverPresentBenchmarkAsRealUser,
  observeKpi,
  ENGINEERING_PRODUCT_KPI_CATALOG,
} from "./kpis";
import {
  assertNavigationNotBlockedByEnterprise,
  buildPerformanceBudgets,
  summarizeSamples,
  E11_PERF_BASELINE_SAMPLES,
} from "./performance-budgets";
import { runAllResilienceEvaluations } from "./resilience";
import { runAllAdversarialEvaluations } from "./adversarial";
import {
  EngineeringAdoptionEventBuffer,
  createAdoptionEvent,
} from "./adoption";
import { buildEvaluationReport } from "./evaluation-report";
import { runProfileEvaluations } from "./profile-evaluation";
import { runKgpBenchmark } from "./kgp-benchmark";
import { PhaseE10EssentialZeroConnectorIndependent } from "../phase-e10/contracts";

describe("Phase E11 evaluation, performance & engineer adoption", () => {
  it("preserves E0-E10 invariants and evaluation flags", () => {
    expect(PhaseE11BenchmarkIsNotRealUserKpi).toBe(true);
    expect(PhaseE11NoUnsupportedProductivityClaims).toBe(true);
    expect(getPhaseE11Declaration().platformEvalOwnership).toBe(
      "platform_intelligence",
    );
    expect(PhaseE10EssentialZeroConnectorIndependent).toBe(true);
    assertPhaseE11Invariants({
      ProjectIntelligenceV1Intact,
      InspectionIntelligenceV1Intact,
      AssetIntelligenceV1Intact,
      ProjectControlsV1Intact,
      DigitalTwinV1Intact,
      EngineeringModelInteroperabilityV1Intact,
      privateCrossModuleCouplingDetected,
      duplicateAssetOwnershipDetected,
      EngineeringOSProductBoundaryLocked,
    });
  });

  it("evaluation framework covers retrieval→intelligence domains deterministically", () => {
    const result = runEngineeringOSEvaluation();
    expect(result.deterministic).toBe(true);
    expect(result.metricKind).toBe("BENCHMARK_METRIC");
    expect(result.disclaimer).toMatch(/not real client/i);
    expect(result.overallPassed).toBe(true);
    for (const domain of Object.keys(result.domains)) {
      expect(result.domains[domain as keyof typeof result.domains].passed).toBe(
        true,
      );
    }
  });

  it("benchmark tasks A–N all pass on synthetic corpus", () => {
    expect(ENGINEERING_BENCHMARK_TASKS).toHaveLength(14);
    const run = runAllBenchmarkTasks();
    expect(run.metricKind).toBe("BENCHMARK_METRIC");
    expect(run.allPassed).toBe(true);
    expect(run.results).toHaveLength(14);
  });

  it("workflow efficiency metrics are labelled BENCHMARK only", () => {
    const deltas = calculateEfficiencyDeltas();
    expect(deltas.length).toBeGreaterThan(0);
    for (const d of deltas) {
      expect(d.metricKind).toBe("BENCHMARK_METRIC");
      expect(d.timeSavedMs).toBeGreaterThan(0);
      expect(d.interactionReduction).toBeGreaterThan(0);
      expect(d.disclaimer).toMatch(/not real client/i);
    }
  });

  it("KPI contracts separate SYSTEM / BENCHMARK / REAL_USER", () => {
    expect(Object.keys(ENGINEERING_PRODUCT_KPI_CATALOG)).toHaveLength(12);
    const bench = observeKpi({
      kpiId: "RETRIEVAL_SUCCESS",
      kind: "BENCHMARK_METRIC",
      value: 1,
    });
    expect(bench.status).toBe("BENCHMARK");
    const liveEmpty = observeKpi({
      kpiId: "USER_REPORTED_USEFULNESS",
      kind: "REAL_USER_METRIC",
      value: null,
      sampleCount: 0,
    });
    expect(liveEmpty.status).toBe("NOT_ENOUGH_DATA");
    expect(assertNeverPresentBenchmarkAsRealUser([bench, liveEmpty])).toBe(true);
    expect(() =>
      observeKpi({
        kpiId: "USER_REPORTED_USEFULNESS",
        kind: "BENCHMARK_METRIC",
        value: 1,
      }),
    ).toThrow();
  });

  it("performance budgets derived from baseline with P50/P95 where valid", () => {
    const budgets = buildPerformanceBudgets();
    expect(budgets.length).toBe(E11_PERF_BASELINE_SAMPLES.length);
    for (const b of budgets) {
      expect(b.budgetMs).toBeGreaterThan(b.baselineP50Ms);
      expect(b.rationale).toMatch(/baseline P50/);
    }
    const askSamples = E11_PERF_BASELINE_SAMPLES.find(
      (s) => s.surface === "total_ask_response",
    )!;
    const stats = summarizeSamples(askSamples.samplesMs);
    expect(stats.p50).not.toBeNull();
    expect(stats.p95).not.toBeNull();
    expect(assertNavigationNotBlockedByEnterprise().navigationIndependentOfAiConnectorsIntelligence).toBe(
      true,
    );
  });

  it("resilience degrades safely without fabrication", () => {
    const r = runAllResilienceEvaluations();
    expect(r.allPassed).toBe(true);
    expect(r.results.every((x) => x.fabricatedFallback === false)).toBe(true);
    expect(r.results.every((x) => x.humanAuthorityPreserved)).toBe(true);
  });

  it("adversarial security cases fail closed", () => {
    const r = runAllAdversarialEvaluations();
    expect(r.allPassed).toBe(true);
    expect(r.results.every((x) => x.failClosed && x.blocked)).toBe(true);
  });

  it("E10 profile evaluation: ESSENTIAL zero-connector; others degrade safely", () => {
    const r = runProfileEvaluations();
    expect(r.allPassed).toBe(true);
    const essential = r.results.find((x) => x.profileId === "ESSENTIAL")!;
    expect(essential.enterpriseServicesRequired).toBe(false);
    expect(essential.essentialZeroConnectorIndependent).toBe(true);
  });

  it("KGP-style integrity workflow benchmark passes without fabrication", () => {
    const kgp = runKgpBenchmark();
    expect(kgp.passed).toBe(true);
    expect(kgp.answers).toHaveLength(6);
    expect(kgp.metricKind).toBe("BENCHMARK_METRIC");
    expect(kgp.answers.every((a) => a.fabricated === false)).toBe(true);
  });

  it("adoption telemetry is privacy-safe and optional feedback is non-intrusive", () => {
    const buf = new EngineeringAdoptionEventBuffer();
    buf.record(
      createAdoptionEvent({
        type: "ask_used",
        tenantId: "tenant-a",
        surface: "ask",
      }),
    );
    buf.record(
      createAdoptionEvent({
        type: "feedback_useful",
        tenantId: "tenant-a",
        reason: "saved_time",
      }),
    );
    expect(buf.list()[0]?.containsDocumentContent).toBe(false);
    expect(buf.list()[0]?.containsHiddenCot).toBe(false);
    expect(buf.counts().ask_used).toBe(1);
  });

  it("admin evaluation report distinguishes BENCHMARK / LIVE / NOT_ENOUGH_DATA", () => {
    const report = buildEvaluationReport();
    expect(report.adminOnly).toBe(true);
    expect(report.overallBenchmarkPassed).toBe(true);
    expect(report.disclaimer).toMatch(/must not be presented as live/i);
    const adoption = report.sections.find((s) => s.id === "adoption")!;
    expect(adoption.status).toBe("NOT_ENOUGH_DATA");
    expect(adoption.metrics?.[0]?.value).toBe("NOT_ENOUGH_DATA");
    expect(report.sections.every((s) => s.status !== "LIVE" || s.id === "adoption")).toBe(
      true,
    );
    const withLive = buildEvaluationReport({
      adoption: (() => {
        const b = new EngineeringAdoptionEventBuffer();
        b.record(createAdoptionEvent({ type: "ask_used", tenantId: "t1" }));
        return b;
      })(),
    });
    expect(withLive.sections.find((s) => s.id === "adoption")?.status).toBe("LIVE");
  });
});
