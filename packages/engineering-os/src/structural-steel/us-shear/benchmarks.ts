import type { SteelBenchmarkRecord } from "@rtb/types";
import { forceWithinTolerance } from "../mechanics/tension-force";

/**
 * Independent hand calculations. Expected values are not produced by the US adapter.
 * Von Mises Vy: 300 N/mm² × 5000 mm² / √3 = 866025.4037844386 N.
 * Elastic plate shear buckling with E=200 GPa, ν=0.3, kv=5.34, d=300 mm, tw=8 mm, Av=5000 mm² → 3432068 N.
 * These mechanics benchmarks do not establish AISC shear-strength conformance.
 */
export const US_SHEAR_BENCHMARKS: readonly SteelBenchmarkRecord[] = [
  {
    benchmarkId: "US-SHEAR-BM-YIELD-MAJOR-HAND-1",
    methodId: "US_SHEAR_ELASTIC_MAJOR_MECHANICS",
    jurisdiction: "united-states",
    standard: "AISC 360",
    edition: "UNKNOWN_PENDING_CONFIRMATION",
    annex: null,
    sourceAuthority: "VALIDATED_INTERNAL_ENGINEERING_RULE",
    input: { fy_N_per_mm2: 300, Av_mm2: 5_000 },
    expectedResult: { value: 866_025.4037844386, unit: "N" },
    tolerance: { relative: 1e-8, absolute: 1e-4 },
    actualResult: null,
    reviewer: null,
    validationDate: null,
    evidenceRef: "independent-hand-calc-Vy-fy-Av-over-sqrt3",
  },
  {
    benchmarkId: "US-SHEAR-BM-YIELD-MINOR-HAND-1",
    methodId: "US_SHEAR_ELASTIC_MINOR_MECHANICS",
    jurisdiction: "united-states",
    standard: "AISC 360",
    edition: "UNKNOWN_PENDING_CONFIRMATION",
    annex: null,
    sourceAuthority: "VALIDATED_INTERNAL_ENGINEERING_RULE",
    input: { fy_N_per_mm2: 300, Av_mm2: 5_000 },
    expectedResult: { value: 866_025.4037844386, unit: "N" },
    tolerance: { relative: 1e-8, absolute: 1e-4 },
    actualResult: null,
    reviewer: null,
    validationDate: null,
    evidenceRef: "independent-hand-calc-Vy-fy-Av-over-sqrt3-minor",
  },
  {
    benchmarkId: "US-SHEAR-BM-BUCKLING-HAND-1",
    methodId: "US_SHEAR_ELASTIC_BUCKLING_MECHANICS",
    jurisdiction: "united-states",
    standard: "AISC 360",
    edition: "UNKNOWN_PENDING_CONFIRMATION",
    annex: null,
    sourceAuthority: "VALIDATED_INTERNAL_ENGINEERING_RULE",
    input: { E_MPa: 200_000, nu: 0.3, kv: 5.34, d_mm: 300, tw_mm: 8, Av_mm2: 5_000 },
    expectedResult: { value: 3_432_068, unit: "N" },
    tolerance: { relative: 1e-6, absolute: 1 },
    actualResult: null,
    reviewer: null,
    validationDate: null,
    evidenceRef: "independent-hand-calc-elastic-plate-shear-buckling",
  },
];

export function scoreUsShearBenchmark(benchmarkId: string, actual: number): SteelBenchmarkRecord {
  const row = US_SHEAR_BENCHMARKS.find((item) => item.benchmarkId === benchmarkId);
  if (!row) throw new Error(`unknown US shear benchmark ${benchmarkId}`);
  const pass = forceWithinTolerance(actual, row.expectedResult.value)
    || Math.abs(actual - row.expectedResult.value) <= Math.max(row.tolerance.absolute, row.tolerance.relative * Math.abs(row.expectedResult.value));
  return {
    ...row,
    actualResult: { value: actual, unit: row.expectedResult.unit },
    reviewer: "independent-hand-calculation",
    validationDate: "2026-10-06",
    evidenceRef: `${row.evidenceRef}:${pass ? "PASS" : "FAIL"}`,
  };
}
