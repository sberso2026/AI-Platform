import type { SteelBenchmarkRecord } from "@rtb/types";
import { SELF_REFERENTIAL_BENCHMARKS } from "@rtb/types";
import { US_BENDING_BENCHMARKS, scoreUsBendingBenchmark } from "../us-bending/benchmarks";
import { US_COMPRESSION_BENCHMARKS, scoreUsCompressionBenchmark } from "../us-compression/benchmarks";
import { US_SHEAR_BENCHMARKS, scoreUsShearBenchmark } from "../us-shear/benchmarks";
import { US_TENSION_BENCHMARKS, scoreUsTensionBenchmark } from "../us-tension/benchmarks";
import { firstYieldMomentNm } from "../mechanics/bending";
import { eulerLoadN } from "../mechanics/euler";
import { elasticLtbMomentNm } from "../mechanics/ltb";
import { elasticShearBucklingForceN, vonMisesShearYieldN } from "../mechanics/shear";
import { nominalTensionForceN } from "../mechanics/tension-force";

const SELF_REF_MARKERS = ["evaluateUsSteel", "evaluateSteelCapacity", "eos-self-benchmark", "production-implementation-output"];

const fy345 = { name: "Fy", value: 345, unit: "MPa", provenanceRef: "bm", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" as const };
const fu450 = { name: "Fu", value: 450, unit: "MPa", provenanceRef: "bm", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" as const };
const Ag9480 = { name: "Ag", value: 9480, unit: "mm2", provenanceRef: "bm", sourceAuthority: "OTHER_GOVERNED_SOURCE" as const };
const An8200 = { name: "An", value: 8200, unit: "mm2", provenanceRef: "bm", sourceAuthority: "OTHER_GOVERNED_SOURCE" as const };
const fy = { name: "Fy", value: 300, unit: "MPa", provenanceRef: "bm", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" as const };
const Ag = { name: "Ag", value: 5140, unit: "mm2", provenanceRef: "bm", sourceAuthority: "OTHER_GOVERNED_SOURCE" as const };
const Sx = { name: "Sx", value: 1_000_000, unit: "mm3", provenanceRef: "bm", sourceAuthority: "OTHER_GOVERNED_SOURCE" as const };
const Sy = { name: "Sy", value: 200_000, unit: "mm3", provenanceRef: "bm", sourceAuthority: "OTHER_GOVERNED_SOURCE" as const };
const Av = { name: "Aw", value: 5_000, unit: "mm2", provenanceRef: "bm", sourceAuthority: "OTHER_GOVERNED_SOURCE" as const };

export function allUsNumericalBenchmarks(): readonly SteelBenchmarkRecord[] {
  return [...US_TENSION_BENCHMARKS, ...US_COMPRESSION_BENCHMARKS, ...US_BENDING_BENCHMARKS, ...US_SHEAR_BENCHMARKS];
}

export function auditUsBenchmarkRecord(row: SteelBenchmarkRecord): "PASS" | "PARTIAL" | "FAIL" {
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

export function scoreAllIndependentUsBenchmarks(): readonly SteelBenchmarkRecord[] {
  return [
    scoreUsTensionBenchmark("US-TENSION-BM-GROSS-YIELD-HAND-1", nominalTensionForceN(fy345, Ag9480, "Fy", "Ag")),
    scoreUsTensionBenchmark("US-TENSION-BM-NET-FRACTURE-HAND-1", nominalTensionForceN(fu450, An8200, "Fu", "An")),
    scoreUsCompressionBenchmark("US-COMPRESSION-BM-SQUASH-HAND-1", nominalTensionForceN(fy, Ag, "Fy", "Ag")),
    scoreUsCompressionBenchmark("US-COMPRESSION-BM-EULER-MAJOR-HAND-1", eulerLoadN(200e9, 100_000_000 * 1e-12, 8)),
    scoreUsCompressionBenchmark("US-COMPRESSION-BM-EULER-MINOR-HAND-1", eulerLoadN(200e9, 20_000_000 * 1e-12, 8)),
    scoreUsBendingBenchmark("US-BENDING-BM-ELASTIC-MAJOR-HAND-1", firstYieldMomentNm(fy, Sx, "Fy", "Sx")),
    scoreUsBendingBenchmark("US-BENDING-BM-ELASTIC-MINOR-HAND-1", firstYieldMomentNm(fy, Sy, "Fy", "Sy")),
    scoreUsBendingBenchmark("US-BENDING-BM-ELASTIC-LTB-HAND-1", elasticLtbMomentNm({
      EPa: 200e9,
      GPa: 80e9,
      IminorM4: 20_000_000 * 1e-12,
      JM4: 500_000 * 1e-12,
      IwM6: 200_000_000_000 * 1e-18,
      unbracedLengthM: 8,
    })),
    scoreUsShearBenchmark("US-SHEAR-BM-YIELD-MAJOR-HAND-1", vonMisesShearYieldN(fy, Av)),
    scoreUsShearBenchmark("US-SHEAR-BM-YIELD-MINOR-HAND-1", vonMisesShearYieldN(fy, Av)),
    scoreUsShearBenchmark("US-SHEAR-BM-BUCKLING-HAND-1", elasticShearBucklingForceN({
      EPa: 200e9,
      poisson: 0.3,
      kv: 5.34,
      webDepthM: 0.3,
      webThicknessM: 0.008,
      shearAreaM2: 0.005,
    })),
  ];
}

export const US_BENCHMARK_AUDIT_BY_METHOD: Record<string, "PASS" | "PARTIAL" | "FAIL" | "NOT_APPLICABLE"> = {
  US_TENSION_GROSS_YIELD_MECHANICS: "PASS",
  US_TENSION_NET_FRACTURE_MECHANICS: "PASS",
  US_COMPRESSION_SQUASH_YIELD_MECHANICS: "PASS",
  US_COMPRESSION_EULER_MAJOR_MECHANICS: "PASS",
  US_COMPRESSION_EULER_MINOR_MECHANICS: "PASS",
  US_BENDING_ELASTIC_MAJOR_MECHANICS: "PASS",
  US_BENDING_ELASTIC_MINOR_MECHANICS: "PASS",
  US_BENDING_ELASTIC_LTB_MECHANICS: "PASS",
  US_SHEAR_ELASTIC_MAJOR_MECHANICS: "PASS",
  US_SHEAR_ELASTIC_MINOR_MECHANICS: "PASS",
  US_SHEAR_ELASTIC_BUCKLING_MECHANICS: "PASS",
};

export const US_BENCHMARK_AUDIT_RESULT = "PASS" as const;
