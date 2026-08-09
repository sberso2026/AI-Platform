/**
 * Phase 13A — Existing Digital Twin / platform footprint inventory (document in code).
 *
 * Read-only inventory of reserved stubs and certified paths. Do NOT modify
 * packages/digital-twin as part of this discovery phase.
 */

import { DIGITAL_TWIN_RESERVED_SOLVER_STUBS } from "../version";

export const EXISTING_DT_FOOTPRINT = {
  package: "packages/digital-twin",
  version: "1.0.0",
  releaseTag: "digital-twin-v1.0.0",
  releaseCommit: "a94425ed009ca087c2f44c9d3757c0c82bd936b1",
  engineeringSolverAdapterPath:
    "packages/digital-twin/src/domain/solvers/engineering-solver-adapter.ts",
  calculixAdapterPath:
    "packages/digital-twin/src/domain/solvers/calculix-adapter.ts",
  reservedStubsPath:
    "packages/digital-twin/src/domain/simulation-external-solver-stubs.ts",
  reservedSolverStubs: DIGITAL_TWIN_RESERVED_SOLVER_STUBS,
  certifiedSolver: {
    solverId: "calculix",
    capability: "linear_elastic_static",
    note: "Only certified real external execution path in Digital Twin V1",
  },
  fourLayerQualification: [
    "method_qualification",
    "provider_qualification",
    "application_qualification",
    "execution_qualification",
  ] as const,
  engineeringToolFrameworkOwnership: "platform_intelligence",
  noPhase13aUnderDigitalTwin: true,
} as const;

export function assertExistingFootprintInventory(): {
  ok: true;
  reservedStubCount: number;
  calculixCertifiedOnly: true;
} {
  if (EXISTING_DT_FOOTPRINT.reservedSolverStubs.length < 8) {
    throw new Error("dt_reserved_stub_inventory_incomplete");
  }
  if (!EXISTING_DT_FOOTPRINT.reservedSolverStubs.includes("etabs")) {
    throw new Error("etabs_stub_missing_from_inventory");
  }
  if (!EXISTING_DT_FOOTPRINT.reservedSolverStubs.includes("spacegass")) {
    throw new Error("spacegass_stub_missing_from_inventory");
  }
  if (EXISTING_DT_FOOTPRINT.certifiedSolver.solverId !== "calculix") {
    throw new Error("calculix_must_remain_sole_certified_solver_in_v1");
  }
  return {
    ok: true,
    reservedStubCount: EXISTING_DT_FOOTPRINT.reservedSolverStubs.length,
    calculixCertifiedOnly: true,
  };
}
