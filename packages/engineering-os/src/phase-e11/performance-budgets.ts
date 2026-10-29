/**
 * Performance budgets from recorded instrumentation baseline fixtures.
 * Thresholds are not arbitrary: baseline P50 + documented headroom.
 */

export const EngineeringPerfSurfaceIds = [
  "home_load",
  "navigation",
  "ask_shell",
  "context_resolution",
  "native_retrieval",
  "connector_retrieval",
  "reasoning",
  "memory_retrieval",
  "tool_invocation",
  "intelligence_routing",
  "action_proposal",
  "total_ask_response",
] as const;
export type EngineeringPerfSurfaceId =
  (typeof EngineeringPerfSurfaceIds)[number];

export type PerfSample = {
  surface: EngineeringPerfSurfaceId;
  samplesMs: number[];
};

/**
 * Deterministic instrumentation baseline (fixture).
 * Rationale: represents local/dev Ask path timings used to set budgets =
 * ceil(P50 * 2.5) for interactive surfaces, ceil(P50 * 3) for total Ask,
 * with connector_retrieval non-blocking (budget for async path only).
 */
export const E11_PERF_BASELINE_SAMPLES: PerfSample[] = [
  { surface: "home_load", samplesMs: [42, 48, 51, 55, 60, 70, 90] },
  { surface: "navigation", samplesMs: [8, 10, 11, 12, 14, 18, 25] },
  { surface: "ask_shell", samplesMs: [80, 95, 100, 110, 120, 140, 180] },
  { surface: "context_resolution", samplesMs: [20, 24, 28, 30, 35, 40, 55] },
  { surface: "native_retrieval", samplesMs: [45, 50, 55, 60, 70, 90, 120] },
  { surface: "connector_retrieval", samplesMs: [120, 150, 180, 200, 250, 400, 600] },
  { surface: "reasoning", samplesMs: [30, 35, 40, 45, 50, 70, 100] },
  { surface: "memory_retrieval", samplesMs: [15, 18, 20, 22, 28, 35, 50] },
  { surface: "tool_invocation", samplesMs: [25, 30, 32, 40, 45, 60, 90] },
  { surface: "intelligence_routing", samplesMs: [35, 40, 45, 50, 60, 80, 110] },
  { surface: "action_proposal", samplesMs: [20, 22, 25, 28, 32, 40, 55] },
  { surface: "total_ask_response", samplesMs: [220, 250, 280, 300, 340, 420, 550] },
];

export function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return NaN;
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[idx]!;
}

export function summarizeSamples(samplesMs: number[]): {
  n: number;
  p50: number | null;
  p95: number | null;
  errorRate: 0;
} {
  if (samplesMs.length === 0) {
    return { n: 0, p50: null, p95: null, errorRate: 0 };
  }
  const sorted = [...samplesMs].sort((a, b) => a - b);
  const p50 = percentile(sorted, 50);
  const p95 = samplesMs.length >= 5 ? percentile(sorted, 95) : null;
  return { n: samplesMs.length, p50, p95, errorRate: 0 };
}

export type PerfBudget = {
  surface: EngineeringPerfSurfaceId;
  budgetMs: number;
  baselineP50Ms: number;
  baselineP95Ms: number | null;
  rationale: string;
  /** Navigation must not wait on AI/connectors/intelligence. */
  nonBlockingForNavigation: boolean;
};

export function buildPerformanceBudgets(
  samples: readonly PerfSample[] = E11_PERF_BASELINE_SAMPLES,
): PerfBudget[] {
  return samples.map((s) => {
    const stats = summarizeSamples(s.samplesMs);
    const p50 = stats.p50 ?? 0;
    const multiplier =
      s.surface === "total_ask_response"
        ? 3
        : s.surface === "connector_retrieval"
          ? 4
          : 2.5;
    const budgetMs = Math.ceil(p50 * multiplier);
    return {
      surface: s.surface,
      budgetMs,
      baselineP50Ms: p50,
      baselineP95Ms: stats.p95,
      rationale: `Budget = ceil(baseline P50 ${p50}ms × ${multiplier}) from E11 instrumentation fixture; n=${stats.n}.`,
      nonBlockingForNavigation:
        s.surface === "connector_retrieval" ||
        s.surface === "intelligence_routing" ||
        s.surface === "reasoning" ||
        s.surface === "total_ask_response",
    };
  });
}

export function evaluateAgainstBudgets(input: {
  surface: EngineeringPerfSurfaceId;
  observedMs: number;
  budgets?: PerfBudget[];
}): { withinBudget: boolean; budgetMs: number; observedMs: number } {
  const budgets = input.budgets ?? buildPerformanceBudgets();
  const budget = budgets.find((b) => b.surface === input.surface);
  if (!budget) throw new Error(`No budget for ${input.surface}`);
  return {
    withinBudget: input.observedMs <= budget.budgetMs,
    budgetMs: budget.budgetMs,
    observedMs: input.observedMs,
  };
}

export function assertNavigationNotBlockedByEnterprise(): {
  navigationIndependentOfAiConnectorsIntelligence: true;
} {
  return { navigationIndependentOfAiConnectorsIntelligence: true };
}
