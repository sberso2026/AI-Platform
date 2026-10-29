/**
 * Generic vendor-neutral provider host probe interface.
 */

import type { LicenseState } from "./license-state";
import type {
  InstallationStatus,
  ProviderHealthStatus,
} from "./provider-installation";

export type ProviderHostProbeResult = {
  providerId: string;
  probedAt: string;
  processOrServicePresent: boolean;
  providerIdentityOk: boolean;
  versionText?: string;
  apiOrServiceReady: boolean;
  licenseState: LicenseState;
  installationStatus: InstallationStatus;
  healthStatus: ProviderHealthStatus;
  executionReady: boolean;
  detail: string;
  correctiveFindings: string[];
  /** Always false at host foundation — execution certification is separate. */
  executionCertified: false;
};

export type EngineeringProviderHostProbe = {
  readonly providerId: string;
  probe(options?: { timeoutMs?: number }): Promise<ProviderHostProbeResult>;
};

export function unavailableProviderProbeResult(
  providerId: string,
  detail: string,
  findings: string[] = [],
): ProviderHostProbeResult {
  return {
    providerId,
    probedAt: new Date().toISOString(),
    processOrServicePresent: false,
    providerIdentityOk: false,
    apiOrServiceReady: false,
    licenseState: "unknown",
    installationStatus: "missing",
    healthStatus: "unavailable",
    executionReady: false,
    detail,
    correctiveFindings: findings,
    executionCertified: false,
  };
}
