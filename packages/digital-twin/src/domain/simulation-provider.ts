/**
 * Phase 12G/12I — TwinSimulationProviderRegistry.
 *
 * Executable paths:
 * - deterministic_fixture (test-only)
 * - external_solver / engineering_tool_adapter for CalculiX (qualified real path)
 * Native FEA product claims remain forbidden.
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
  /** Fixture or CalculiX-backed real adapter may execute when qualified. */
  executableInPhase12G: boolean;
  executableInPhase12I: boolean;
  claimsNativeEngineeringSolver: false;
  /** Compatibility adapter pointer into Platform Tool Registry (ai_tools). */
  engineeringToolRegistryRef?: string;
  /** Optional solver id for external adapters (e.g. calculix). */
  solverId?: string;
  timeoutMsDefault: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
};

function isCalculiXProvider(input: {
  providerType: SimulationProviderType;
  providerKey: string;
  solverId?: string;
}): boolean {
  if (input.solverId === "calculix") return true;
  const key = input.providerKey.toLowerCase();
  if (key.includes("calculix") || key.includes("ccx")) return true;
  return (
    (input.providerType === "external_solver" ||
      input.providerType === "engineering_tool_adapter") &&
    key.includes("calculix")
  );
}

export function createTwinSimulationProvider(input: {
  providerId: string;
  tenantId: string;
  workspaceId: string;
  providerKey: string;
  displayName: string;
  providerType: SimulationProviderType;
  engineeringToolRegistryRef?: string;
  solverId?: string;
  timeoutMsDefault?: number;
  createdBy?: string;
}): TwinSimulationProvider {
  const now = new Date().toISOString();
  const fixture = input.providerType === "deterministic_fixture";
  const calculix = isCalculiXProvider(input);
  return {
    providerId: input.providerId,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    providerKey: input.providerKey,
    displayName: input.displayName,
    providerType: input.providerType,
    status: "draft",
    executableInPhase12G: fixture,
    executableInPhase12I: fixture || calculix,
    claimsNativeEngineeringSolver: false,
    engineeringToolRegistryRef: input.engineeringToolRegistryRef,
    solverId: input.solverId ?? (calculix ? "calculix" : undefined),
    timeoutMsDefault: input.timeoutMsDefault ?? (calculix ? 30_000 : 5_000),
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
  const fixture = provider.providerType === "deterministic_fixture";
  const calculix = isCalculiXProvider(provider);
  if (!fixture && !calculix) {
    throw new Error("provider_not_executable_reserved_or_unimplemented");
  }
  if (!provider.executableInPhase12I && !provider.executableInPhase12G) {
    throw new Error("provider_not_executable");
  }
  if (provider.claimsNativeEngineeringSolver) {
    throw new Error("native_solver_claim_forbidden");
  }
}

export function isRealExternalProvider(provider: TwinSimulationProvider): boolean {
  return isCalculiXProvider(provider) && provider.providerType !== "deterministic_fixture";
}

export type TwinSimulationProviderRegistry = {
  providers: TwinSimulationProvider[];
};

export function createTwinSimulationProviderRegistry(
  providers: TwinSimulationProvider[] = [],
): TwinSimulationProviderRegistry {
  return { providers: [...providers] };
}
