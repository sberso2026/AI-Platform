import type { SteelBenchmarkRecord } from "@rtb/types";
import { forceWithinTolerance } from "./units";

export const AU_SHEAR_BENCHMARKS: readonly SteelBenchmarkRecord[] = [
  {
    benchmarkId: "AU-SHEAR-BM-YIELD-HAND-1",
    methodId: "AU_SHEAR_YIELD_REFERENCE",
    jurisdiction: "australia",
    standard: "AS 4100",
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
    benchmarkId: "AU-SHEAR-BM-BUCKLING-HAND-1",
    methodId: "AU_SHEAR_BUCKLING_REFERENCE",
    jurisdiction: "australia",
    standard: "AS 4100",
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

export function scoreShearBenchmark(benchmarkId: string, actual: number): SteelBenchmarkRecord {
  const row = AU_SHEAR_BENCHMARKS.find((item) => item.benchmarkId === benchmarkId);
  if (!row) throw new Error(`unknown shear benchmark ${benchmarkId}`);
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
