/**
 * Admin-only evaluation report builder.
 * Distinguishes BENCHMARK / LIVE / NOT_ENOUGH_DATA — no misleading percentages.
 */

import type { EngineeringReportDataStatus } from "./contracts";
import { runEngineeringOSEvaluation } from "./evaluation-framework";
import { calculateEfficiencyDeltas } from "./efficiency";
import {
  buildPerformanceBudgets,
  summarizeSamples,
  E11_PERF_BASELINE_SAMPLES,
} from "./performance-budgets";
import { runAllResilienceEvaluations } from "./resilience";
import { runAllAdversarialEvaluations } from "./adversarial";
import { observeKpi, type EngineeringKpiObservation } from "./kpis";
import type { EngineeringAdoptionEventBuffer } from "./adoption";
import { runProfileEvaluations } from "./profile-evaluation";
import { runKgpBenchmark } from "./kgp-benchmark";

export type EvaluationReportSection = {
  id: string;
  title: string;
  status: EngineeringReportDataStatus;
  summary: string;
  /** Present only when status allows; never invent live % from benchmarks. */
  metrics?: Array<{ label: string; value: string; status: EngineeringReportDataStatus }>;
};

export type EngineeringEvaluationReport = {
  adminOnly: true;
  generatedAt: string;
  disclaimer: string;
  sections: EvaluationReportSection[];
  kpis: EngineeringKpiObservation[];
  overallBenchmarkPassed: boolean;
};

export function buildEvaluationReport(input?: {
  adoption?: EngineeringAdoptionEventBuffer;
  now?: Date;
}): EngineeringEvaluationReport {
  const evalResult = runEngineeringOSEvaluation();
  const efficiency = calculateEfficiencyDeltas();
  const budgets = buildPerformanceBudgets();
  const resilience = runAllResilienceEvaluations();
  const adversarial = runAllAdversarialEvaluations();
  const profiles = runProfileEvaluations();
  const kgp = runKgpBenchmark();
  const adoptionCounts = input?.adoption?.counts() ?? {};
  const adoptionEvents = Object.values(adoptionCounts).reduce((a, b) => a + b, 0);

  const perfMetrics = budgets.map((b) => {
    const sample = E11_PERF_BASELINE_SAMPLES.find((s) => s.surface === b.surface)!;
    const stats = summarizeSamples(sample.samplesMs);
    return {
      label: `${b.surface} P50/P95/budget`,
      value:
        stats.p95 === null
          ? `P50=${stats.p50}ms · P95=NOT_ENOUGH_DATA · budget=${b.budgetMs}ms`
          : `P50=${stats.p50}ms · P95=${stats.p95}ms · budget=${b.budgetMs}ms`,
      status: "BENCHMARK" as const,
    };
  });

  const kpis: EngineeringKpiObservation[] = [
    observeKpi({
      kpiId: "RETRIEVAL_SUCCESS",
      kind: "BENCHMARK_METRIC",
      value: evalResult.domains.retrieval.passed ? 1 : 0,
    }),
    observeKpi({
      kpiId: "CITATION_CORRECTNESS",
      kind: "BENCHMARK_METRIC",
      value: evalResult.domains.retrieval.criteria.find(
        (c) => c.criterion === "citation_correctness",
      )?.passed
        ? 1
        : 0,
    }),
    observeKpi({
      kpiId: "ABSTENTION_CORRECTNESS",
      kind: "BENCHMARK_METRIC",
      value: evalResult.domains.retrieval.criteria.find(
        (c) => c.criterion === "abstention_correctness",
      )?.passed
        ? 1
        : 0,
    }),
    observeKpi({
      kpiId: "TOOL_SUCCESS_RATE",
      kind: "BENCHMARK_METRIC",
      value: evalResult.domains.tools.passed ? 1 : 0,
    }),
    observeKpi({
      kpiId: "TASK_COMPLETION_TIME",
      kind: "BENCHMARK_METRIC",
      value: efficiency[0]?.timeSavedMs ?? null,
    }),
    observeKpi({
      kpiId: "USER_REPORTED_USEFULNESS",
      kind: "REAL_USER_METRIC",
      value: null,
      sampleCount: adoptionCounts.feedback_useful ?? 0,
    }),
    observeKpi({
      kpiId: "ACTION_ACCEPTANCE",
      kind: "REAL_USER_METRIC",
      value: null,
      sampleCount: adoptionCounts.action_accepted ?? 0,
    }),
  ];

  const sections: EvaluationReportSection[] = [
    {
      id: "performance",
      title: "Performance",
      status: "BENCHMARK",
      summary:
        "Instrumentation fixture baselines with explicit budget rationales. Navigation remains independent of AI/connectors/intelligence.",
      metrics: perfMetrics,
    },
    {
      id: "retrieval_quality",
      title: "Retrieval quality",
      status: "BENCHMARK",
      summary: evalResult.domains.retrieval.passed
        ? "All retrieval criteria passed on synthetic corpus."
        : "Retrieval criteria failures on synthetic corpus.",
    },
    {
      id: "grounding_abstention",
      title: "Grounding / abstention",
      status: "BENCHMARK",
      summary: evalResult.domains.reasoning.passed
        ? "Grounding, conflict, and abstention criteria passed."
        : "Reasoning criteria failures.",
    },
    {
      id: "tool_reliability",
      title: "Tool reliability",
      status: "BENCHMARK",
      summary: evalResult.domains.tools.passed
        ? "Governed tool selection/certification/provenance passed."
        : "Tool criteria failures.",
    },
    {
      id: "workflow_outcomes",
      title: "Workflow outcomes",
      status: "BENCHMARK",
      summary: evalResult.domains.actions.passed
        ? "Action prefill/approval/idempotency/audit passed."
        : "Action criteria failures.",
    },
    {
      id: "benchmark_efficiency",
      title: "Benchmark efficiency",
      status: "BENCHMARK",
      summary:
        "timeSaved / interactionReduction / duplicateEntryReduction from synthetic manual vs EOS fixtures — not real-user ROI.",
      metrics: efficiency.map((e) => ({
        label: `Task ${e.taskId}`,
        value: `timeSavedRatio=${e.timeSavedRatio.toFixed(2)} · interactionReductionRatio=${e.interactionReductionRatio.toFixed(2)}`,
        status: "BENCHMARK" as const,
      })),
    },
    {
      id: "resilience",
      title: "Resilience",
      status: "BENCHMARK",
      summary: resilience.allPassed
        ? "All resilience scenarios degrade safely without fabrication."
        : "Resilience failures.",
    },
    {
      id: "security_adversarial",
      title: "Security / adversarial",
      status: "BENCHMARK",
      summary: adversarial.allPassed
        ? "All adversarial cases fail closed."
        : "Adversarial failures.",
    },
    {
      id: "profiles",
      title: "E10 profile evaluation",
      status: "BENCHMARK",
      summary: profiles.allPassed
        ? "ESSENTIAL zero-connector; PROFESSIONAL optional degrade; ENTERPRISE native path not excessively blocked."
        : "Profile evaluation failures.",
    },
    {
      id: "kgp",
      title: "KGP-style integrity workflow",
      status: "BENCHMARK",
      summary: kgp.passed
        ? "Fragmented asset integrity workflow questions answered from seed evidence."
        : "KGP benchmark failures.",
    },
    {
      id: "adoption",
      title: "Adoption metrics",
      status: adoptionEvents > 0 ? "LIVE" : "NOT_ENOUGH_DATA",
      summary:
        adoptionEvents > 0
          ? `Privacy-safe adoption events recorded: ${adoptionEvents}.`
          : "No live adoption telemetry yet — NOT_ENOUGH_DATA (not shown as 0%).",
      metrics:
        adoptionEvents > 0
          ? Object.entries(adoptionCounts).map(([label, value]) => ({
              label,
              value: String(value),
              status: "LIVE" as const,
            }))
          : [
              {
                label: "events",
                value: "NOT_ENOUGH_DATA",
                status: "NOT_ENOUGH_DATA" as const,
              },
            ],
    },
  ];

  return {
    adminOnly: true,
    generatedAt: (input?.now ?? new Date()).toISOString(),
    disclaimer:
      "BENCHMARK sections use synthetic fixtures and must not be presented as live client productivity or accuracy. LIVE requires real telemetry. Prefer NOT_ENOUGH_DATA over misleading percentages.",
    sections,
    kpis,
    overallBenchmarkPassed:
      evalResult.overallPassed &&
      resilience.allPassed &&
      adversarial.allPassed &&
      profiles.allPassed &&
      kgp.passed,
  };
}
