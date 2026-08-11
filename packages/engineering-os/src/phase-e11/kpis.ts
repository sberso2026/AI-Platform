/**
 * Canonical product KPI contracts — SYSTEM / BENCHMARK / REAL_USER separation.
 */

import type { EngineeringMetricKind, EngineeringReportDataStatus } from "./contracts";

export const EngineeringProductKpiIds = [
  "SEARCH_TIME_REDUCTION",
  "TASK_COMPLETION_TIME",
  "CONTEXT_SWITCH_REDUCTION",
  "DUPLICATE_ENTRY_REDUCTION",
  "RETRIEVAL_SUCCESS",
  "CITATION_CORRECTNESS",
  "ABSTENTION_CORRECTNESS",
  "EVIDENCE_COMPLETENESS",
  "ACTION_ACCEPTANCE",
  "AI_OVERRIDE_RATE",
  "TOOL_SUCCESS_RATE",
  "USER_REPORTED_USEFULNESS",
] as const;
export type EngineeringProductKpiId = (typeof EngineeringProductKpiIds)[number];

export type EngineeringProductKpiContract = {
  id: EngineeringProductKpiId;
  /** Which metric kind this KPI may represent when populated. */
  allowedKinds: readonly EngineeringMetricKind[];
  unit: string;
  description: string;
  /** Never present benchmark values as real-user KPIs. */
  forbidBenchmarkAsRealUser: true;
};

export const ENGINEERING_PRODUCT_KPI_CATALOG: Record<
  EngineeringProductKpiId,
  EngineeringProductKpiContract
> = {
  SEARCH_TIME_REDUCTION: {
    id: "SEARCH_TIME_REDUCTION",
    allowedKinds: ["BENCHMARK_METRIC", "REAL_USER_METRIC"],
    unit: "percent",
    description: "Reduction in time to find relevant engineering evidence vs baseline workflow.",
    forbidBenchmarkAsRealUser: true,
  },
  TASK_COMPLETION_TIME: {
    id: "TASK_COMPLETION_TIME",
    allowedKinds: ["SYSTEM_METRIC", "BENCHMARK_METRIC", "REAL_USER_METRIC"],
    unit: "ms",
    description: "Time to complete a defined engineering task.",
    forbidBenchmarkAsRealUser: true,
  },
  CONTEXT_SWITCH_REDUCTION: {
    id: "CONTEXT_SWITCH_REDUCTION",
    allowedKinds: ["BENCHMARK_METRIC", "REAL_USER_METRIC"],
    unit: "percent",
    description: "Fewer application/context switches to complete a task.",
    forbidBenchmarkAsRealUser: true,
  },
  DUPLICATE_ENTRY_REDUCTION: {
    id: "DUPLICATE_ENTRY_REDUCTION",
    allowedKinds: ["BENCHMARK_METRIC", "REAL_USER_METRIC"],
    unit: "percent",
    description: "Fewer duplicate field entries via prefill/proposals.",
    forbidBenchmarkAsRealUser: true,
  },
  RETRIEVAL_SUCCESS: {
    id: "RETRIEVAL_SUCCESS",
    allowedKinds: ["SYSTEM_METRIC", "BENCHMARK_METRIC", "REAL_USER_METRIC"],
    unit: "ratio",
    description: "Share of retrievals returning permission-scoped relevant evidence.",
    forbidBenchmarkAsRealUser: true,
  },
  CITATION_CORRECTNESS: {
    id: "CITATION_CORRECTNESS",
    allowedKinds: ["SYSTEM_METRIC", "BENCHMARK_METRIC"],
    unit: "ratio",
    description: "Citations resolve to the correct revision/object.",
    forbidBenchmarkAsRealUser: true,
  },
  ABSTENTION_CORRECTNESS: {
    id: "ABSTENTION_CORRECTNESS",
    allowedKinds: ["SYSTEM_METRIC", "BENCHMARK_METRIC"],
    unit: "ratio",
    description: "Abstains when evidence insufficient; answers when grounded.",
    forbidBenchmarkAsRealUser: true,
  },
  EVIDENCE_COMPLETENESS: {
    id: "EVIDENCE_COMPLETENESS",
    allowedKinds: ["BENCHMARK_METRIC", "SYSTEM_METRIC"],
    unit: "ratio",
    description: "Required evidence classes present for the ask intent.",
    forbidBenchmarkAsRealUser: true,
  },
  ACTION_ACCEPTANCE: {
    id: "ACTION_ACCEPTANCE",
    allowedKinds: ["SYSTEM_METRIC", "BENCHMARK_METRIC", "REAL_USER_METRIC"],
    unit: "ratio",
    description: "Accepted proposals / proposed actions (human authority).",
    forbidBenchmarkAsRealUser: true,
  },
  AI_OVERRIDE_RATE: {
    id: "AI_OVERRIDE_RATE",
    allowedKinds: ["SYSTEM_METRIC", "REAL_USER_METRIC"],
    unit: "ratio",
    description: "Share of AI suggestions edited or rejected by humans.",
    forbidBenchmarkAsRealUser: true,
  },
  TOOL_SUCCESS_RATE: {
    id: "TOOL_SUCCESS_RATE",
    allowedKinds: ["SYSTEM_METRIC", "BENCHMARK_METRIC"],
    unit: "ratio",
    description: "Governed tool invocations completing with valid provenance.",
    forbidBenchmarkAsRealUser: true,
  },
  USER_REPORTED_USEFULNESS: {
    id: "USER_REPORTED_USEFULNESS",
    allowedKinds: ["REAL_USER_METRIC"],
    unit: "ratio",
    description: "Optional Useful / Not useful feedback (no intrusive surveys).",
    forbidBenchmarkAsRealUser: true,
  },
};

export type EngineeringKpiObservation = {
  kpiId: EngineeringProductKpiId;
  kind: EngineeringMetricKind;
  value: number | null;
  status: EngineeringReportDataStatus;
  label: string;
};

export function observeKpi(input: {
  kpiId: EngineeringProductKpiId;
  kind: EngineeringMetricKind;
  value: number | null;
  sampleCount?: number;
}): EngineeringKpiObservation {
  const contract = ENGINEERING_PRODUCT_KPI_CATALOG[input.kpiId];
  if (!contract.allowedKinds.includes(input.kind)) {
    throw new Error(`KPI ${input.kpiId} forbids kind ${input.kind}`);
  }
  if (input.kind === "BENCHMARK_METRIC" && input.kpiId === "USER_REPORTED_USEFULNESS") {
    throw new Error("USER_REPORTED_USEFULNESS cannot be a BENCHMARK_METRIC");
  }
  const sampleCount = input.sampleCount ?? (input.value === null ? 0 : 1);
  let status: EngineeringReportDataStatus;
  if (input.kind === "BENCHMARK_METRIC") status = "BENCHMARK";
  else if (sampleCount < 1 || input.value === null) status = "NOT_ENOUGH_DATA";
  else status = "LIVE";

  return {
    kpiId: input.kpiId,
    kind: input.kind,
    value: input.value,
    status,
    label:
      status === "BENCHMARK"
        ? "BENCHMARK (synthetic — not real-user productivity)"
        : status === "NOT_ENOUGH_DATA"
          ? "NOT_ENOUGH_DATA"
          : "LIVE",
  };
}

export function assertNeverPresentBenchmarkAsRealUser(
  observations: readonly EngineeringKpiObservation[],
): boolean {
  return !observations.some(
    (o) => o.kind === "BENCHMARK_METRIC" && o.status === "LIVE",
  );
}
