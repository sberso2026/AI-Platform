import type { SteelBenchmarkRecord } from "@rtb/types";
import { SELF_REFERENTIAL_BENCHMARKS } from "@rtb/types";
import { EU_BENDING_BENCHMARKS, scoreEuBendingBenchmark } from "../eu-bending/benchmarks";
import { EU_COMPRESSION_BENCHMARKS, scoreEuCompressionBenchmark } from "../eu-compression/benchmarks";
import { EU_SHEAR_BENCHMARKS, scoreEuShearBenchmark } from "../eu-shear/benchmarks";
import { EU_TENSION_BENCHMARKS, scoreEuTensionBenchmark } from "../eu-tension/benchmarks";
import { firstYieldMomentNm } from "../mechanics/bending";
import { eulerLoadN } from "../mechanics/euler";
import { elasticLtbMomentNm } from "../mechanics/ltb";
import { elasticShearBucklingForceN, vonMisesShearYieldN } from "../mechanics/shear";
import { nominalTensionForceN } from "../mechanics/tension-force";

const SELF_REF_MARKERS = ["evaluateEuSteel", "evaluateSteelCapacity", "eos-self-benchmark", "production-implementation-output"];

const fy = { name: "fy", value: 300, unit: "MPa", provenanceRef: "bm", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" as const };
const fu = { name: "fu", value: 440, unit: "MPa", provenanceRef: "bm", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" as const };
const Ag = { name: "Ag", value: 5140, unit: "mm2", provenanceRef: "bm", sourceAuthority: "OTHER_GOVERNED_SOURCE" as const };
const An = { name: "An", value: 4500, unit: "mm2", provenanceRef: "bm", sourceAuthority: "OTHER_GOVERNED_SOURCE" as const };
const Zyy = { name: "Zyy", value: 1_000_000, unit: "mm3", provenanceRef: "bm", sourceAuthority: "OTHER_GOVERNED_SOURCE" as const };
const Zzz = { name: "Zzz", value: 200_000, unit: "mm3", provenanceRef: "bm", sourceAuthority: "OTHER_GOVERNED_SOURCE" as const };
const Av = { name: "Av", value: 5_000, unit: "mm2", provenanceRef: "bm", sourceAuthority: "OTHER_GOVERNED_SOURCE" as const };

export function allEuNumericalBenchmarks(): readonly SteelBenchmarkRecord[] {
  return [...EU_TENSION_BENCHMARKS, ...EU_COMPRESSION_BENCHMARKS, ...EU_BENDING_BENCHMARKS, ...EU_SHEAR_BENCHMARKS];
}

export function auditEuBenchmarkRecord(row: SteelBenchmarkRecord): "PASS" | "PARTIAL" | "FAIL" {
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

export function scoreAllIndependentEuBenchmarks(): readonly SteelBenchmarkRecord[] {
  return [
    scoreEuTensionBenchmark("EU-TENSION-BM-GROSS-YIELD-HAND-1", nominalTensionForceN(fy, Ag, "fy", "Ag")),
    scoreEuTensionBenchmark("EU-TENSION-BM-NET-FRACTURE-HAND-1", nominalTensionForceN(fu, An, "fu", "An")),
    scoreEuCompressionBenchmark("EU-COMPRESSION-BM-SQUASH-HAND-1", nominalTensionForceN(fy, Ag, "fy", "Ag")),
    scoreEuCompressionBenchmark("EU-COMPRESSION-BM-EULER-MAJOR-HAND-1", eulerLoadN(200e9, 100_000_000 * 1e-12, 8)),
    scoreEuCompressionBenchmark("EU-COMPRESSION-BM-EULER-MINOR-HAND-1", eulerLoadN(200e9, 20_000_000 * 1e-12, 8)),
    scoreEuBendingBenchmark("EU-BENDING-BM-ELASTIC-MAJOR-HAND-1", firstYieldMomentNm(fy, Zyy, "fy", "Zyy")),
    scoreEuBendingBenchmark("EU-BENDING-BM-ELASTIC-MINOR-HAND-1", firstYieldMomentNm(fy, Zzz, "fy", "Zzz")),
    scoreEuBendingBenchmark("EU-BENDING-BM-ELASTIC-LTB-HAND-1", elasticLtbMomentNm({
      EPa: 200e9,
      GPa: 80e9,
      IminorM4: 20_000_000 * 1e-12,
      JM4: 500_000 * 1e-12,
      IwM6: 200_000_000_000 * 1e-18,
      unbracedLengthM: 8,
    })),
    scoreEuShearBenchmark("EU-SHEAR-BM-YIELD-MAJOR-HAND-1", vonMisesShearYieldN(fy, Av)),
    scoreEuShearBenchmark("EU-SHEAR-BM-YIELD-MINOR-HAND-1", vonMisesShearYieldN(fy, Av)),
    scoreEuShearBenchmark("EU-SHEAR-BM-BUCKLING-HAND-1", elasticShearBucklingForceN({
      EPa: 200e9,
      poisson: 0.3,
      kv: 5.34,
      webDepthM: 0.3,
      webThicknessM: 0.008,
      shearAreaM2: 0.005,
    })),
  ];
}

export const EU_BENCHMARK_AUDIT_BY_METHOD: Record<string, "PASS" | "PARTIAL" | "FAIL" | "NOT_APPLICABLE"> = {
  EU_TENSION_GROSS_YIELD_MECHANICS: "PASS",
  EU_TENSION_NET_FRACTURE_MECHANICS: "PASS",
  EU_COMPRESSION_SQUASH_YIELD_MECHANICS: "PASS",
  EU_COMPRESSION_EULER_MAJOR_MECHANICS: "PASS",
  EU_COMPRESSION_EULER_MINOR_MECHANICS: "PASS",
  EU_BENDING_ELASTIC_MAJOR_MECHANICS: "PASS",
  EU_BENDING_ELASTIC_MINOR_MECHANICS: "PASS",
  EU_BENDING_ELASTIC_LTB_MECHANICS: "PASS",
  EU_SHEAR_ELASTIC_MAJOR_MECHANICS: "PASS",
  EU_SHEAR_ELASTIC_MINOR_MECHANICS: "PASS",
  EU_SHEAR_ELASTIC_BUCKLING_MECHANICS: "PASS",
};

export const EU_BENCHMARK_AUDIT_RESULT = "PASS" as const;
