import type { SteelBenchmarkRecord } from "@rtb/types";
import { forceWithinTolerance } from "../mechanics/tension-force";

/**
 * Independent hand calculations: stress × area in mixed units (N/mm² × mm² = N).
 * Expected values are not produced by the US, AU, or EU adapters.
 */
export const US_TENSION_BENCHMARKS: readonly SteelBenchmarkRecord[] = [
  {
    benchmarkId: "US-TENSION-BM-GROSS-YIELD-HAND-1",
    methodId: "US_TENSION_GROSS_YIELD_MECHANICS",
    jurisdiction: "united-states",
    standard: "AISC 360",
    edition: "UNKNOWN_PENDING_CONFIRMATION",
    annex: null,
    sourceAuthority: "VALIDATED_INTERNAL_ENGINEERING_RULE",
    input: { fy_N_per_mm2: 345, Ag_mm2: 9480 },
    expectedResult: { value: 3_270_600, unit: "N" },
    tolerance: { relative: 1e-8, absolute: 1e-4 },
    actualResult: null,
    reviewer: null,
    validationDate: null,
    evidenceRef: "independent-hand-calc-gross-yield-345x9480",
  },
  {
    benchmarkId: "US-TENSION-BM-NET-FRACTURE-HAND-1",
    methodId: "US_TENSION_NET_FRACTURE_MECHANICS",
    jurisdiction: "united-states",
    standard: "AISC 360",
    edition: "UNKNOWN_PENDING_CONFIRMATION",
    annex: null,
    sourceAuthority: "VALIDATED_INTERNAL_ENGINEERING_RULE",
    input: { fu_N_per_mm2: 450, An_mm2: 8200 },
    expectedResult: { value: 3_690_000, unit: "N" },
    tolerance: { relative: 1e-8, absolute: 1e-4 },
    actualResult: null,
    reviewer: null,
    validationDate: null,
    evidenceRef: "independent-hand-calc-net-fracture-450x8200",
  },
];

export function scoreUsTensionBenchmark(benchmarkId: string, actualN: number): SteelBenchmarkRecord {
  const row = US_TENSION_BENCHMARKS.find((item) => item.benchmarkId === benchmarkId);
  if (!row) throw new Error(`unknown US tension benchmark ${benchmarkId}`);
  const pass = forceWithinTolerance(actualN, row.expectedResult.value);
  return {
    ...row,
    actualResult: { value: actualN, unit: "N" },
    reviewer: "independent-hand-calculation",
    validationDate: "2026-10-06",
    evidenceRef: `${row.evidenceRef}:${pass ? "PASS" : "FAIL"}`,
  };
}
