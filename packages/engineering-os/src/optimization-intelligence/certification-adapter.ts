import { createHash } from "node:crypto";
import type { OptimizationExecutionPort, OptimizationExecutionRequest, OptimizationExecutionResult } from "./execution-port";
import { CERTIFICATION_STUB_ADAPTER_ID, CERTIFICATION_STUB_ADAPTER_VERSION } from "./manifest";

/**
 * Deterministic certification stub. Not a production engineering solver.
 * Exists only to prove JobService → handler → execution port → trusted ingest
 * without invoking licensed SPACE GASS / ETABS.
 */
export function isCertificationStubAdapter(adapterId: string | null | undefined): boolean {
  return adapterId == null || adapterId === "" || adapterId === CERTIFICATION_STUB_ADAPTER_ID;
}

function deterministicMetric(seed: string, metricKey: string): number {
  const hex = createHash("sha256").update(`${seed}|${metricKey}`).digest("hex").slice(0, 8);
  const n = Number.parseInt(hex, 16) / 0xffffffff;
  if (metricKey.toUpperCase().includes("UTIL")) return Number((0.4 + n * 0.4).toFixed(4));
  if (metricKey.toUpperCase().includes("MASS") || metricKey.toUpperCase().includes("WEIGHT")) {
    return Number((8 + n * 8).toFixed(4));
  }
  return Number((n * 100).toFixed(4));
}

export class CertificationStubAdapter implements OptimizationExecutionPort {
  async execute(request: OptimizationExecutionRequest): Promise<OptimizationExecutionResult> {
    const manifest = request.runInputManifest;
    const seed = `${request.runId}|${manifest.alternative.alternative_id}|${manifest.execution.random_seed ?? ""}`;
    const metrics: OptimizationExecutionResult["metrics"] = manifest.objectives.map((objective) => ({
      metricKey: objective.metric_key,
      value: deterministicMetric(seed, objective.metric_key),
      unit: objective.unit,
      objectiveId: objective.objective_id,
    }));
    for (const constraint of manifest.constraints) {
      if (metrics.some((m) => m.metricKey === constraint.metric_key)) continue;
      metrics.push({
        metricKey: constraint.metric_key,
        value: deterministicMetric(seed, constraint.metric_key),
        unit: constraint.unit,
      });
    }
    return {
      executionRef: request.executionRef,
      status: "succeeded",
      sourceKind: "ADAPTER",
      metrics,
      constraintEvidenceRefs: manifest.constraints.map((c) => c.constraint_id),
      rawArtifactRefs: [],
      toolProvenance: { toolId: CERTIFICATION_STUB_ADAPTER_ID, toolVersion: CERTIFICATION_STUB_ADAPTER_VERSION },
      adapterProvenance: { adapterId: CERTIFICATION_STUB_ADAPTER_ID, adapterVersion: CERTIFICATION_STUB_ADAPTER_VERSION },
      warnings: ["certification_stub_not_a_structural_solver"],
    };
  }
}
