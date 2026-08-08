/**
 * Phase 12G — TwinSimulationScenarioComparison (differences only).
 * simulationOptimizationImplemented=false — comparison is not optimization.
 */

export type TwinSimulationScenarioComparison = {
  comparisonId: string;
  tenantId: string;
  workspaceId: string;
  twinId: string;
  baselineScenarioId: string;
  candidateScenarioId: string;
  baselineResultId?: string;
  candidateResultId?: string;
  differences: Array<{ field: string; baseline: unknown; candidate: unknown }>;
  isOptimization: false;
  optimizationImplemented: false;
  createdAt: string;
  createdBy?: string;
};

export function createTwinSimulationScenarioComparison(input: {
  comparisonId: string;
  tenantId: string;
  workspaceId: string;
  twinId: string;
  baselineScenarioId: string;
  candidateScenarioId: string;
  baselineSummary?: Record<string, unknown>;
  candidateSummary?: Record<string, unknown>;
  baselineResultId?: string;
  candidateResultId?: string;
  createdBy?: string;
}): TwinSimulationScenarioComparison {
  const baseline = input.baselineSummary ?? {};
  const candidate = input.candidateSummary ?? {};
  const keys = new Set([...Object.keys(baseline), ...Object.keys(candidate)]);
  const differences: TwinSimulationScenarioComparison["differences"] = [];
  for (const field of keys) {
    const b = baseline[field];
    const c = candidate[field];
    if (JSON.stringify(b) !== JSON.stringify(c)) {
      differences.push({ field, baseline: b, candidate: c });
    }
  }
  return {
    comparisonId: input.comparisonId,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    twinId: input.twinId,
    baselineScenarioId: input.baselineScenarioId,
    candidateScenarioId: input.candidateScenarioId,
    baselineResultId: input.baselineResultId,
    candidateResultId: input.candidateResultId,
    differences,
    isOptimization: false,
    optimizationImplemented: false,
    createdAt: new Date().toISOString(),
    createdBy: input.createdBy,
  };
}

export function assertComparisonNotOptimization(
  comparison: TwinSimulationScenarioComparison,
): void {
  if (comparison.isOptimization || comparison.optimizationImplemented) {
    throw new Error("scenario_comparison_must_not_be_optimization");
  }
}
