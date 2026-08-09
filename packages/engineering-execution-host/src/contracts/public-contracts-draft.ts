/**
 * Phase 13D.1 — Public contracts 0.1.0-execution-host (prerelease, not 1.0.0).
 */

import { PUBLIC_CONTRACT_VERSION } from "../version";

export const EXECUTION_HOST_PUBLIC_CONTRACT_FAMILIES = [
  "EngineeringExecutionHostCore",
  "EngineeringExecutionHostRegistryCore",
  "ProviderInstallationDeclarationCore",
  "EngineeringProviderHostProbeCore",
  "EngineeringExecutionJobCore",
  "ExecutionWorkspaceIsolationCore",
  "ExecutionSandboxPolicyCore",
  "LicenseStateClassificationCore",
  "ProviderVersionPinningCore",
  "ExecutionArtifactRefCore",
  "ControlVsExecutionPlaneCore",
  "EtabsHostReservation",
] as const;

export type ExecutionHostPublicContractFamily =
  (typeof EXECUTION_HOST_PUBLIC_CONTRACT_FAMILIES)[number];

export function assertExecutionHostPrereleaseContracts(): {
  ok: true;
  contractVersion: typeof PUBLIC_CONTRACT_VERSION;
  families: typeof EXECUTION_HOST_PUBLIC_CONTRACT_FAMILIES;
  runtimeBacked: true;
  ga: false;
} {
  if (PUBLIC_CONTRACT_VERSION !== "0.1.0-execution-host") {
    throw new Error("execution_host_contracts_must_be_0_1_0_execution_host");
  }
  if (PUBLIC_CONTRACT_VERSION === "1.0.0") {
    throw new Error("execution_host_contracts_must_not_be_ga");
  }
  return {
    ok: true,
    contractVersion: PUBLIC_CONTRACT_VERSION,
    families: EXECUTION_HOST_PUBLIC_CONTRACT_FAMILIES,
    runtimeBacked: true,
    ga: false,
  };
}
