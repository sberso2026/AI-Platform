/**
 * Phase 12I — External engineering solver stubs + CalculiX registration.
 *
 * CalculiX is the first real adapter. Other solvers remain reserved/unavailable.
 * silentSolverFallbackAllowed = false — real requests must not fall back to fixture.
 */

import {
  CALCULIX_ADAPTER_ID,
  CALCULIX_ADAPTER_VERSION,
  CALCULIX_SOLVER_ID,
  CALCULIX_TOOL_REGISTRY_REF,
  createCalculiXSolverAdapter,
} from "./solvers/calculix-adapter";
import type { EngineeringSolverAdapter } from "./solvers/engineering-solver-adapter";
import { SILENT_SOLVER_FALLBACK_ALLOWED } from "../version";

export const FIRST_REAL_SOLVER_ID = CALCULIX_SOLVER_ID;

export const RESERVED_EXTERNAL_SOLVER_ADAPTERS = [
  "ansys",
  "abaqus",
  "opensees",
  "openfoam",
  "sap2000",
  "etabs",
  "staad",
  "spacegass",
  "nastran",
  "comsol",
  "other_external",
] as const;

export type ReservedExternalSolverAdapter =
  (typeof RESERVED_EXTERNAL_SOLVER_ADAPTERS)[number];

export type ExternalSolverAdapterContractStub = {
  adapterKey: ReservedExternalSolverAdapter;
  status: "reserved";
  implemented: false;
  activatable: false;
  notes: string;
};

export const EXTERNAL_SOLVER_ADAPTER_CONTRACT_STUBS: readonly ExternalSolverAdapterContractStub[] =
  RESERVED_EXTERNAL_SOLVER_ADAPTERS.map((adapterKey) => ({
    adapterKey,
    status: "reserved" as const,
    implemented: false as const,
    activatable: false as const,
    notes: "Phase 12I reservation — unavailable stub; not first solver.",
  }));

export type ImplementedExternalSolverRegistration = {
  solverId: typeof CALCULIX_SOLVER_ID;
  adapterId: typeof CALCULIX_ADAPTER_ID;
  adapterVersion: typeof CALCULIX_ADAPTER_VERSION;
  status: "implemented";
  implemented: true;
  activatable: true;
  licenseFamily: "open_source_gpl";
  toolRegistryRef: typeof CALCULIX_TOOL_REGISTRY_REF;
  notes: string;
};

export const IMPLEMENTED_EXTERNAL_SOLVER_REGISTRATIONS: readonly ImplementedExternalSolverRegistration[] =
  [
    {
      solverId: CALCULIX_SOLVER_ID,
      adapterId: CALCULIX_ADAPTER_ID,
      adapterVersion: CALCULIX_ADAPTER_VERSION,
      status: "implemented",
      implemented: true,
      activatable: true,
      licenseFamily: "open_source_gpl",
      toolRegistryRef: CALCULIX_TOOL_REGISTRY_REF,
      notes: "First real engineering solver adapter — linear elastic static only.",
    },
  ];

export function assertReservedSolversUnavailable(): {
  ok: true;
  reservedCount: number;
} {
  for (const stub of EXTERNAL_SOLVER_ADAPTER_CONTRACT_STUBS) {
    if (stub.implemented || stub.activatable || stub.status !== "reserved") {
      throw new Error(`external_solver_adapter_must_remain_reserved:${stub.adapterKey}`);
    }
  }
  return { ok: true, reservedCount: EXTERNAL_SOLVER_ADAPTER_CONTRACT_STUBS.length };
}

/** @deprecated Prefer assertReservedSolversUnavailable — CalculiX is implemented. */
export function assertExternalSolverAdaptersNotImplemented(): {
  ok: true;
  externalEngineeringSolverAdaptersImplemented: true;
  firstRealSolverId: typeof CALCULIX_SOLVER_ID;
} {
  assertReservedSolversUnavailable();
  if (IMPLEMENTED_EXTERNAL_SOLVER_REGISTRATIONS.length < 1) {
    throw new Error("first_real_solver_required");
  }
  return {
    ok: true,
    externalEngineeringSolverAdaptersImplemented: true,
    firstRealSolverId: CALCULIX_SOLVER_ID,
  };
}

export function rejectUnauthorizedSolverActivation(payload: Record<string, unknown>): void {
  const forbidden = [
    "activateAnsys",
    "activateAbaqus",
    "activateOpenSees",
    "activateOpenFOAM",
    "activateSap2000",
    "activateEtabs",
    "activateStaad",
    "activateSpaceGass",
    "solverBinary",
    "nativeSolver",
    "feaPayload",
  ];
  for (const key of forbidden) {
    if (key in payload) {
      throw new Error(`external_solver_adapter_activation_forbidden:${key}`);
    }
  }
  if (SILENT_SOLVER_FALLBACK_ALLOWED) {
    throw new Error("silent_solver_fallback_must_remain_false");
  }
}

/** @deprecated Use rejectUnauthorizedSolverActivation */
export function rejectExternalSolverAdapterActivation(payload: Record<string, unknown>): void {
  rejectUnauthorizedSolverActivation(payload);
}

export function getCalculiXAdapter(): EngineeringSolverAdapter {
  return createCalculiXSolverAdapter();
}

export function resolveExternalSolverAdapter(
  solverId: string,
): EngineeringSolverAdapter | null {
  if (solverId === CALCULIX_SOLVER_ID || solverId === CALCULIX_ADAPTER_ID) {
    return getCalculiXAdapter();
  }
  return null;
}
