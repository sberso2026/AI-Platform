/**
 * Phase 12H — External engineering solver adapter reservation (stubs only).
 *
 * ANSYS / Abaqus / OpenSees / OpenFOAM / etc. are NOT implemented.
 * externalEngineeringSolverAdaptersImplemented remains false.
 */

export const RESERVED_EXTERNAL_SOLVER_ADAPTERS = [
  "ansys",
  "abaqus",
  "opensees",
  "openfoam",
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
    notes: "Phase 12H reservation only — no real solver adapter.",
  }));

export function assertExternalSolverAdaptersNotImplemented(): {
  ok: true;
  externalEngineeringSolverAdaptersImplemented: false;
} {
  for (const stub of EXTERNAL_SOLVER_ADAPTER_CONTRACT_STUBS) {
    if (stub.implemented || stub.activatable || stub.status !== "reserved") {
      throw new Error(`external_solver_adapter_must_remain_reserved:${stub.adapterKey}`);
    }
  }
  return { ok: true, externalEngineeringSolverAdaptersImplemented: false };
}

export function rejectExternalSolverAdapterActivation(payload: Record<string, unknown>): void {
  const forbidden = [
    "activateAnsys",
    "activateAbaqus",
    "activateOpenSees",
    "activateOpenFOAM",
    "solverBinary",
    "externalSolverAdapter",
    "nativeSolver",
    "feaPayload",
  ];
  for (const key of forbidden) {
    if (key in payload) {
      throw new Error(`external_solver_adapter_activation_forbidden:${key}`);
    }
  }
}
