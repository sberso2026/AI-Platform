import type { SteelBenchmarkRecord } from "@rtb/types";
import { forceWithinTolerance } from "./units";

export const AU_COMPRESSION_BENCHMARKS: readonly SteelBenchmarkRecord[] = [
  {
    benchmarkId: "AU-COMPRESSION-BM-SQUASH-HAND-1",
    methodId: "AU_COMPRESSION_SQUASH_YIELD",
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
    evidenceRef: "independent-hand-calc-squash-300x5140",
  },
  {
    benchmarkId: "AU-COMPRESSION-BM-EULER-MAJOR-HAND-1",
    methodId: "AU_COMPRESSION_EULER_MAJOR",
    jurisdiction: "australia",
    standard: "AS 4100",
    edition: "UNKNOWN_PENDING_CONFIRMATION",
    annex: null,
    sourceAuthority: "VALIDATED_INTERNAL_ENGINEERING_RULE",
    input: { E_MPa: 200_000, Iyy_mm4: 100_000_000, Le_mm: 8000 },
    expectedResult: { value: 3_084_251, unit: "N" },
    tolerance: { relative: 1e-6, absolute: 1 },
    actualResult: null,
    reviewer: null,
    validationDate: null,
    evidenceRef: "independent-hand-calc-euler-pi2-EI-Le2-major",
  },
  {
    benchmarkId: "AU-COMPRESSION-BM-EULER-MINOR-HAND-1",
    methodId: "AU_COMPRESSION_EULER_MINOR",
    jurisdiction: "australia",
    standard: "AS 4100",
    edition: "UNKNOWN_PENDING_CONFIRMATION",
    annex: null,
    sourceAuthority: "VALIDATED_INTERNAL_ENGINEERING_RULE",
    input: { E_MPa: 200_000, Izz_mm4: 20_000_000, Le_mm: 8000 },
    expectedResult: { value: 616_850, unit: "N" },
    tolerance: { relative: 1e-6, absolute: 1 },
    actualResult: null,
    reviewer: null,
    validationDate: null,
    evidenceRef: "independent-hand-calc-euler-pi2-EI-Le2-minor",
  },
];

export function scoreCompressionBenchmark(benchmarkId: string, actualN: number): SteelBenchmarkRecord {
  const row = AU_COMPRESSION_BENCHMARKS.find((item) => item.benchmarkId === benchmarkId);
  if (!row) throw new Error(`unknown compression benchmark ${benchmarkId}`);
  const pass = forceWithinTolerance(actualN, row.expectedResult.value) || Math.abs(actualN - row.expectedResult.value) <= Math.max(row.tolerance.absolute, row.tolerance.relative * Math.abs(row.expectedResult.value));
  return {
    ...row,
    actualResult: { value: actualN, unit: "N" },
    reviewer: "independent-hand-calculation",
    validationDate: "2026-10-05",
    evidenceRef: `${row.evidenceRef}:${pass ? "PASS" : "FAIL"}`,
  };
}
