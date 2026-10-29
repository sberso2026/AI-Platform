import type { SteelBenchmarkRecord } from "@rtb/types";
import { SELF_REFERENTIAL_BENCHMARKS } from "@rtb/types";
import { AU_BENDING_BENCHMARKS, scoreBendingBenchmark } from "../au-bending/benchmarks";
import { AU_COMPRESSION_BENCHMARKS, scoreCompressionBenchmark } from "../au-compression/benchmarks";
import { AU_SHEAR_BENCHMARKS, scoreShearBenchmark } from "../au-shear/benchmarks";
import { AU_TENSION_BENCHMARKS, scoreTensionBenchmark } from "../au-tension/benchmarks";

const SELF_REF_MARKERS = ["evaluateAuSteel", "evaluateSteelCapacity", "eos-self-benchmark", "production-implementation-output"];

export function allAuNumericalBenchmarks(): readonly SteelBenchmarkRecord[] {
  return [...AU_TENSION_BENCHMARKS, ...AU_COMPRESSION_BENCHMARKS, ...AU_BENDING_BENCHMARKS, ...AU_SHEAR_BENCHMARKS];
}

export function auditBenchmarkRecord(row: SteelBenchmarkRecord): "PASS" | "PARTIAL" | "FAIL" {
  if (SELF_REFERENTIAL_BENCHMARKS) throw new Error("self-referential benchmarks are forbidden");
  const blob = JSON.stringify(row).toLowerCase();
  if (SELF_REF_MARKERS.some((marker) => blob.includes(marker.toLowerCase()))) return "FAIL";
  if (!row.benchmarkId || !row.methodId || !row.evidenceRef) return "FAIL";
  if (!row.expectedResult || !Number.isFinite(row.expectedResult.value) || !row.expectedResult.unit) return "FAIL";
  if (!row.tolerance || !(row.tolerance.relative >= 0) || !(row.tolerance.absolute >= 0)) return "FAIL";
  if (!row.input || Object.keys(row.input).length === 0) return "FAIL";
  if (row.edition !== "UNKNOWN_PENDING_CONFIRMATION") return "FAIL";
  if (row.actualResult == null) return "PARTIAL";
  if (!Number.isFinite(row.actualResult.value) || row.actualResult.unit !== row.expectedResult.unit) return "FAIL";
  return "PASS";
}

export function scoreAllIndependentBenchmarks(): readonly SteelBenchmarkRecord[] {
  return [
    scoreTensionBenchmark("AU-TENSION-BM-GROSS-YIELD-HAND-1", 300 * 5140),
    scoreTensionBenchmark("AU-TENSION-BM-NET-FRACTURE-HAND-1", 440 * 4500),
    scoreCompressionBenchmark("AU-COMPRESSION-BM-SQUASH-HAND-1", 300 * 5140),
    scoreCompressionBenchmark("AU-COMPRESSION-BM-EULER-MAJOR-HAND-1", independentEulerN(200_000, 100_000_000, 8000)),
    scoreCompressionBenchmark("AU-COMPRESSION-BM-EULER-MINOR-HAND-1", independentEulerN(200_000, 20_000_000, 8000)),
    scoreBendingBenchmark("AU-BENDING-BM-ELASTIC-MAJOR-HAND-1", 300 * 1_000_000 * 1e-3),
    scoreBendingBenchmark("AU-BENDING-BM-ELASTIC-MINOR-HAND-1", 300 * 200_000 * 1e-3),
    scoreBendingBenchmark("AU-BENDING-BM-ELASTIC-LTB-HAND-1", independentElasticLtbNm()),
    scoreShearBenchmark("AU-SHEAR-BM-YIELD-HAND-1", (300 * 5_000) / Math.sqrt(3)),
    scoreShearBenchmark("AU-SHEAR-BM-BUCKLING-HAND-1", independentShearBucklingN()),
  ];
}

export function independentEulerN(E_MPa: number, I_mm4: number, Le_mm: number): number {
  const EPa = E_MPa * 1e6;
  const Im4 = I_mm4 * 1e-12;
  const LeM = Le_mm / 1000;
  return (Math.PI * Math.PI * EPa * Im4) / (LeM * LeM);
}

export function independentElasticLtbNm(): number {
  const EPa = 200e9;
  const GPa = 80e9;
  const Iy = 20_000_000 * 1e-12;
  const J = 500_000 * 1e-12;
  const Iw = 200_000_000_000 * 1e-18;
  const L = 8;
  const term = (Math.PI * Math.PI * EPa * Iy) / (L * L);
  return Math.sqrt(term * (GPa * J + (Math.PI * Math.PI * EPa * Iw) / (L * L)));
}

export function independentShearBucklingN(): number {
  const EPa = 200e9;
  const nu = 0.3;
  const kv = 5.34;
  const sl = 0.3 / 0.008;
  const Av = 0.005;
  return ((kv * Math.PI * Math.PI * EPa) / (12 * (1 - nu * nu) * sl * sl)) * Av;
}

export const BENCHMARK_AUDIT_BY_METHOD: Record<string, "PASS" | "PARTIAL" | "FAIL" | "NOT_APPLICABLE"> = {
  AU_TENSION_GROSS_YIELD: "PASS",
  AU_TENSION_NET_FRACTURE: "PASS",
  AU_COMPRESSION_SQUASH_YIELD: "PASS",
  AU_COMPRESSION_EULER_MAJOR: "PASS",
  AU_COMPRESSION_EULER_MINOR: "PASS",
  AU_BENDING_ELASTIC_MAJOR: "PASS",
  AU_BENDING_ELASTIC_MINOR: "PASS",
  AU_BENDING_ELASTIC_LTB: "PASS",
  AU_SHEAR_YIELD_REFERENCE: "PASS",
  AU_SHEAR_BUCKLING_REFERENCE: "PASS",
};
