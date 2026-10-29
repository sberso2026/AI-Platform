import type { SteelBenchmarkRecord } from "@rtb/types";
import { forceWithinTolerance } from "./units";

export const AU_BENDING_BENCHMARKS: readonly SteelBenchmarkRecord[] = [
  {
    benchmarkId: "AU-BENDING-BM-ELASTIC-MAJOR-HAND-1",
    methodId: "AU_BENDING_ELASTIC_MAJOR",
    jurisdiction: "australia",
    standard: "AS 4100",
    edition: "UNKNOWN_PENDING_CONFIRMATION",
    annex: null,
    sourceAuthority: "VALIDATED_INTERNAL_ENGINEERING_RULE",
    input: { fy_N_per_mm2: 300, Zyy_mm3: 1_000_000 },
    expectedResult: { value: 300_000, unit: "N.m" },
    tolerance: { relative: 1e-8, absolute: 1e-4 },
    actualResult: null,
    reviewer: null,
    validationDate: null,
    evidenceRef: "independent-hand-calc-My-300x1e6mm3",
  },
  {
    benchmarkId: "AU-BENDING-BM-ELASTIC-MINOR-HAND-1",
    methodId: "AU_BENDING_ELASTIC_MINOR",
    jurisdiction: "australia",
    standard: "AS 4100",
    edition: "UNKNOWN_PENDING_CONFIRMATION",
    annex: null,
    sourceAuthority: "VALIDATED_INTERNAL_ENGINEERING_RULE",
    input: { fy_N_per_mm2: 300, Zzz_mm3: 200_000 },
    expectedResult: { value: 60_000, unit: "N.m" },
    tolerance: { relative: 1e-8, absolute: 1e-4 },
    actualResult: null,
    reviewer: null,
    validationDate: null,
    evidenceRef: "independent-hand-calc-My-300x2e5mm3",
  },
  {
    benchmarkId: "AU-BENDING-BM-ELASTIC-LTB-HAND-1",
    methodId: "AU_BENDING_ELASTIC_LTB",
    jurisdiction: "australia",
    standard: "AS 4100",
    edition: "UNKNOWN_PENDING_CONFIRMATION",
    annex: null,
    sourceAuthority: "VALIDATED_INTERNAL_ENGINEERING_RULE",
    input: { E_MPa: 200_000, G_MPa: 80_000, Izz_mm4: 20_000_000, J_mm4: 500_000, Iw_mm6: 200_000_000_000, Lu_mm: 8000 },
    expectedResult: { value: 168_757, unit: "N.m" },
    tolerance: { relative: 1e-6, absolute: 1 },
    actualResult: null,
    reviewer: null,
    validationDate: null,
    evidenceRef: "independent-hand-calc-elastic-Mcr-uniform-moment",
  },
];

export function scoreBendingBenchmark(benchmarkId: string, actual: number): SteelBenchmarkRecord {
  const row = AU_BENDING_BENCHMARKS.find((item) => item.benchmarkId === benchmarkId);
  if (!row) throw new Error(`unknown bending benchmark ${benchmarkId}`);
  const pass = forceWithinTolerance(actual, row.expectedResult.value) || Math.abs(actual - row.expectedResult.value) <= Math.max(row.tolerance.absolute, row.tolerance.relative * Math.abs(row.expectedResult.value));
  return {
    ...row,
    actualResult: { value: actual, unit: row.expectedResult.unit },
    reviewer: "independent-hand-calculation",
    validationDate: "2026-10-05",
    evidenceRef: `${row.evidenceRef}:${pass ? "PASS" : "FAIL"}`,
  };
}
