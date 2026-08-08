/**
 * Phase 12I — EngineeringSolverAdapter common contract.
 *
 * Twin domain contracts stay solver-agnostic: no CalculiX types leak here.
 * Adapters are external_engineering_tool ownership; Twin orchestrates via
 * Platform Tool Registry–compatible provider refs.
 */

export const ENGINEERING_SOLVER_EXECUTION_STATUSES = [
  "completed",
  "completed_with_warnings",
  "non_converged",
  "failed",
  "cancelled",
  "timeout",
  "unknown",
] as const;

export type EngineeringSolverExecutionStatus =
  (typeof ENGINEERING_SOLVER_EXECUTION_STATUSES)[number];

export const ENGINEERING_SOLVER_ADAPTER_STATUSES = [
  "draft",
  "registered",
  "healthy",
  "degraded",
  "unavailable",
  "revoked",
] as const;

export type EngineeringSolverAdapterStatus =
  (typeof ENGINEERING_SOLVER_ADAPTER_STATUSES)[number];

export type SolverArtifactRef = {
  artifactRefId: string;
  /** Platform Files style path or logical file id — never embed binaries. */
  filePathOrId: string;
  contentHash?: string;
  label: string;
  kind: "input" | "output" | "log" | "manifest" | "other";
};

export type EngineeringSolverVersionObservation = {
  adapterId: string;
  solverId: string;
  probedAt: string;
  versionText: string;
  versionNormalized?: string;
  probeCommand: string;
  ok: boolean;
  errorCode?: string;
};

export type EngineeringSolverHealth = {
  adapterId: string;
  healthy: boolean;
  status: EngineeringSolverAdapterStatus;
  checkedAt: string;
  detail?: string;
  version?: EngineeringSolverVersionObservation;
};

export type EngineeringSolverExecuteRequest = {
  requestId: string;
  adapterId: string;
  solverId: string;
  methodKey: string;
  /** Absolute sandbox working directory — adapter MUST confine artifacts here. */
  artifactDir: string;
  inputArtifactRefs: SolverArtifactRef[];
  timeoutMs: number;
  /** Explicit unit system pin — unknown/mismatched units fail closed. */
  unitSystem: string;
  unitCode: string;
  /** Material / section / property defaults must be fully explicit in defaultsManifest. */
  defaultsManifestVersion: string;
  cancelSignal?: AbortSignal;
  metadata?: Record<string, string>;
};

export type EngineeringSolverExecuteResult = {
  requestId: string;
  adapterId: string;
  solverId: string;
  status: EngineeringSolverExecutionStatus;
  startedAt: string;
  finishedAt: string;
  exitCode?: number;
  stdoutTail?: string;
  stderrTail?: string;
  outputArtifactRefs: SolverArtifactRef[];
  mappedSummary?: Record<string, unknown>;
  errorCode?: string;
  warnings?: string[];
  /** Never true — Twin does not claim native FEA product ownership. */
  nativeSolverInvoked: false;
  /** True when a real external process was spawned. */
  externalProcessSpawned: boolean;
  silentFallbackUsed: false;
};

export type EngineeringSolverAdapter = {
  adapterId: string;
  solverId: string;
  displayName: string;
  adapterVersion: string;
  licenseFamily: "open_source_gpl" | "commercial" | "unknown" | "reserved";
  status: EngineeringSolverAdapterStatus;
  /** ONE bounded certified method key for first solver (e.g. linear_elastic_static). */
  certifiedMethodKeys: readonly string[];
  toolRegistryRef?: string;
  versionProbe(): Promise<EngineeringSolverVersionObservation>;
  healthCheck(): Promise<EngineeringSolverHealth>;
  execute(request: EngineeringSolverExecuteRequest): Promise<EngineeringSolverExecuteResult>;
  cancel?(requestId: string): Promise<{ ok: boolean; detail?: string }>;
};

export function isRealExternalSolverProviderType(
  providerType: string,
  providerKey?: string,
): boolean {
  if (
    providerType === "external_solver" ||
    providerType === "engineering_tool_adapter"
  ) {
    return true;
  }
  const key = (providerKey ?? "").toLowerCase();
  return key.includes("calculix") || key.includes("ccx") || key === "real_external";
}

export function assertNoSilentSolverFallback(input: {
  providerType: string;
  providerKey?: string;
  silentFallbackUsed?: boolean;
  usedFixtureInsteadOfReal?: boolean;
}): void {
  if (!isRealExternalSolverProviderType(input.providerType, input.providerKey)) {
    return;
  }
  if (input.silentFallbackUsed || input.usedFixtureInsteadOfReal) {
    throw new Error("silent_solver_fallback_forbidden");
  }
}
