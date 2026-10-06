import type { SteelBenchmarkRecord } from "@rtb/types";
import { forceWithinTolerance } from "../mechanics/tension-force";

/**
 * Independent hand calculations: stress × area in mixed units (N/mm² × mm² = N).
 * Expected values are not produced by the EU adapter or AU adapter.
 */
export const EU_TENSION_BENCHMARKS: readonly SteelBenchmarkRecord[] = [
  {
    benchmarkId: "EU-TENSION-BM-GROSS-YIELD-HAND-1",
    methodId: "EU_TENSION_GROSS_YIELD_MECHANICS",
    jurisdiction: "eu-eea",
    standard: "EN 1993-1-1",
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
    benchmarkId: "EU-TENSION-BM-NET-FRACTURE-HAND-1",
    methodId: "EU_TENSION_NET_FRACTURE_MECHANICS",
    jurisdiction: "eu-eea",
    standard: "EN 1993-1-1",
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

export function scoreEuTensionBenchmark(benchmarkId: string, actualN: number): SteelBenchmarkRecord {
  const row = EU_TENSION_BENCHMARKS.find((item) => item.benchmarkId === benchmarkId);
  if (!row) throw new Error(`unknown EU tension benchmark ${benchmarkId}`);
  const pass = forceWithinTolerance(actualN, row.expectedResult.value);
  return {
    ...row,
    actualResult: { value: actualN, unit: "N" },
    reviewer: "independent-hand-calculation",
    validationDate: "2026-10-06",
    evidenceRef: `${row.evidenceRef}:${pass ? "PASS" : "FAIL"}`,
  };
}
