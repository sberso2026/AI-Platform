/**
 * Phase 12G — TwinSimulationProviderRegistry.
 *
 * Certified executable path: deterministic_fixture ONLY.
 * Other provider types are metadata/adapters — not executed as native solvers.
 */

export const SIMULATION_PROVIDER_TYPES = [
  "deterministic_fixture",
  "external_solver",
  "engineering_tool_adapter",
  "remote_service",
  "future_local_solver",
] as const;

export type SimulationProviderType = (typeof SIMULATION_PROVIDER_TYPES)[number];

export const SIMULATION_PROVIDER_STATUSES = [
  "draft",
  "registered",
  "certified",
  "suspended",
  "revoked",
] as const;

export type SimulationProviderStatus = (typeof SIMULATION_PROVIDER_STATUSES)[number];

export type TwinSimulationProvider = {
  providerId: string;
  tenantId: string;
  workspaceId: string;
  providerKey: string;
  displayName: string;
  providerType: SimulationProviderType;
  status: SimulationProviderStatus;
  /** Only deterministic_fixture may execute in Phase 12G. */
  executableInPhase12G: boolean;
  claimsNativeEngineeringSolver: false;
  /** Compatibility adapter pointer into Platform Tool Registry (ai_tools) — not a competing framework. */
  engineeringToolRegistryRef?: string;
  timeoutMsDefault: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
};

export function createTwinSimulationProvider(input: {
  providerId: string;
  tenantId: string;
  workspaceId: string;
  providerKey: string;
  displayName: string;
  providerType: SimulationProviderType;
  engineeringToolRegistryRef?: string;
  timeoutMsDefault?: number;
  createdBy?: string;
}): TwinSimulationProvider {
  const now = new Date().toISOString();
  const executable = input.providerType === "deterministic_fixture";
  return {
    providerId: input.providerId,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    providerKey: input.providerKey,
    displayName: input.displayName,
    providerType: input.providerType,
    status: "draft",
    executableInPhase12G: executable,
    claimsNativeEngineeringSolver: false,
    engineeringToolRegistryRef: input.engineeringToolRegistryRef,
    timeoutMsDefault: input.timeoutMsDefault ?? 5_000,
    createdAt: now,
    updatedAt: now,
    createdBy: input.createdBy,
  };
}

export function canTransitionProviderStatus(
  from: SimulationProviderStatus,
  to: SimulationProviderStatus,
): boolean {
  const transitions: Record<SimulationProviderStatus, SimulationProviderStatus[]> = {
    draft: ["registered", "revoked"],
    registered: ["certified", "suspended", "revoked"],
    certified: ["suspended", "revoked"],
    suspended: ["registered", "certified", "revoked"],
    revoked: [],
  };
  return transitions[from].includes(to);
}

export function transitionProviderStatus(
  provider: TwinSimulationProvider,
  to: SimulationProviderStatus,
): TwinSimulationProvider {
  if (!canTransitionProviderStatus(provider.status, to)) {
    throw new Error(`invalid_provider_status_transition:${provider.status}->${to}`);
  }
  return { ...provider, status: to, updatedAt: new Date().toISOString() };
}

export function assertProviderExecutable(provider: TwinSimulationProvider): void {
  if (provider.status === "revoked" || provider.status === "suspended") {
    throw new Error(`provider_not_executable:${provider.status}`);
  }
  if (provider.providerType !== "deterministic_fixture") {
    throw new Error("only_deterministic_fixture_executable_in_phase_12g");
  }
  if (!provider.executableInPhase12G) {
    throw new Error("provider_not_executable_in_phase_12g");
  }
  if (provider.claimsNativeEngineeringSolver) {
    throw new Error("native_solver_claim_forbidden");
  }
}

export type TwinSimulationProviderRegistry = {
  providers: TwinSimulationProvider[];
};

export function createTwinSimulationProviderRegistry(
  providers: TwinSimulationProvider[] = [],
): TwinSimulationProviderRegistry {
  return { providers: [...providers] };
}
