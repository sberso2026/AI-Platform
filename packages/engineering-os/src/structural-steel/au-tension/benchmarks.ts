import type { SteelBenchmarkRecord } from "@rtb/types";
import { forceWithinTolerance } from "./units";

/**
 * Independent hand calculations in mixed units (N/mm² × mm² = N).
 * These numbers are the benchmark source of truth and are not produced by the adapter.
 */
export const AU_TENSION_BENCHMARKS: readonly SteelBenchmarkRecord[] = [
  {
    benchmarkId: "AU-TENSION-BM-GROSS-YIELD-HAND-1",
    methodId: "AU_TENSION_GROSS_YIELD",
    jurisdiction: "australia",
    standard: "AS 4100",
    edition: "UNKNOWN_PENDING_CONFIRMATION",
    annex: null,
    sourceAuthority: "VALIDATED_INTERNAL_ENGINEERING_RULE",
    input: { fy_N_per_mm2: 300, Ag_mm2: 5140 },
    expectedResult: { value: 1_542_000, unit: "N" },
    tolerance: { relative: 1e-8, absolute: 1e-4 },
    actualResult: null,
    reviewer: null,
    validationDate: null,
    evidenceRef: "independent-hand-calc-gross-yield-300x5140",
  },
  {
    benchmarkId: "AU-TENSION-BM-NET-FRACTURE-HAND-1",
    methodId: "AU_TENSION_NET_FRACTURE",
    jurisdiction: "australia",
    standard: "AS 4100",
    edition: "UNKNOWN_PENDING_CONFIRMATION",
    annex: null,
    sourceAuthority: "VALIDATED_INTERNAL_ENGINEERING_RULE",
    input: { fu_N_per_mm2: 440, An_mm2: 4500 },
    expectedResult: { value: 1_980_000, unit: "N" },
    tolerance: { relative: 1e-8, absolute: 1e-4 },
    actualResult: null,
    reviewer: null,
    validationDate: null,
    evidenceRef: "independent-hand-calc-net-fracture-440x4500",
  },
];

export function scoreTensionBenchmark(benchmarkId: string, actualN: number): SteelBenchmarkRecord {
  const row = AU_TENSION_BENCHMARKS.find((item) => item.benchmarkId === benchmarkId);
  if (!row) throw new Error(`unknown tension benchmark ${benchmarkId}`);
  const pass = forceWithinTolerance(actualN, row.expectedResult.value);
  return {
    ...row,
    actualResult: { value: actualN, unit: "N" },
    reviewer: "independent-hand-calculation",
    validationDate: "2026-10-05",
    evidenceRef: `${row.evidenceRef}:${pass ? "PASS" : "FAIL"}`,
  };
}
