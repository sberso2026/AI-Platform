import type { StructuralDemandMethodRecord } from "@rtb/types";
import { STRUCTURAL_DEMAND_METHOD_IDS } from "@rtb/types";

export const STRUCTURAL_DEMAND_METHOD_REGISTRY: readonly StructuralDemandMethodRecord[] = [
  { methodId: "SS_BEAM_UDL", boundary: "SIMPLE_SIMPLE", applicationKind: "UNIFORM_DISTRIBUTED_LOAD", maturity: "IMPLEMENTED", deflectionSupported: true, independentBenchmark: true },
  { methodId: "SS_BEAM_POINT_LOAD", boundary: "SIMPLE_SIMPLE", applicationKind: "POINT_FORCE", maturity: "IMPLEMENTED", deflectionSupported: true, independentBenchmark: true },
  { methodId: "SS_BEAM_APPLIED_MOMENT", boundary: "SIMPLE_SIMPLE", applicationKind: "POINT_MOMENT", maturity: "IMPLEMENTED", deflectionSupported: true, independentBenchmark: true },
  { methodId: "SS_BEAM_LINEAR_VARYING", boundary: "SIMPLE_SIMPLE", applicationKind: "LINEARLY_VARYING_DISTRIBUTED_LOAD", maturity: "IMPLEMENTED", deflectionSupported: false, independentBenchmark: true },
  { methodId: "CANTILEVER_UDL", boundary: "FIXED_FREE", applicationKind: "UNIFORM_DISTRIBUTED_LOAD", maturity: "IMPLEMENTED", deflectionSupported: true, independentBenchmark: true },
  { methodId: "CANTILEVER_POINT_LOAD", boundary: "FIXED_FREE", applicationKind: "POINT_FORCE", maturity: "IMPLEMENTED", deflectionSupported: true, independentBenchmark: true },
  { methodId: "CANTILEVER_APPLIED_MOMENT", boundary: "FIXED_FREE", applicationKind: "POINT_MOMENT", maturity: "IMPLEMENTED", deflectionSupported: true, independentBenchmark: true },
  { methodId: "CANTILEVER_LINEAR_VARYING", boundary: "FIXED_FREE", applicationKind: "LINEARLY_VARYING_DISTRIBUTED_LOAD", maturity: "IMPLEMENTED", deflectionSupported: false, independentBenchmark: true },
  { methodId: "LINEAR_SUPERPOSITION", boundary: "ANY", applicationKind: "SUPERPOSITION", maturity: "IMPLEMENTED", deflectionSupported: true, independentBenchmark: true },
  { methodId: "AXIAL_DIRECT", boundary: "ANY", applicationKind: "AXIAL", maturity: "IMPLEMENTED", deflectionSupported: false, independentBenchmark: true },
  { methodId: "SYNTHETIC_SS_BEAM_UDL_STATICS", boundary: "SIMPLE_SIMPLE", applicationKind: "UNIFORM_DISTRIBUTED_LOAD", maturity: "IMPLEMENTED", deflectionSupported: true, independentBenchmark: true },
];

export function demandMethodRecord(methodId: string): StructuralDemandMethodRecord {
  const row = STRUCTURAL_DEMAND_METHOD_REGISTRY.find((item) => item.methodId === methodId);
  if (!row) throw new Error(`UNSUPPORTED_CASE: unknown demand method ${methodId}`);
  return row;
}

export function assertDemandMethodsNotCertifiedByUnitTests(): void {
  for (const methodId of STRUCTURAL_DEMAND_METHOD_IDS) {
    const row = demandMethodRecord(methodId);
    if (row.maturity === "CERTIFIED" || row.maturity === "PILOT" || row.maturity === "HUMAN_VALIDATED") {
      throw new Error("implemented demand formulas must not be marked CERTIFIED from unit tests alone");
    }
  }
}
