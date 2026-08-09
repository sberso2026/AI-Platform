/**
 * Provider installation metadata — no license keys.
 */

import type { LicenseState } from "./license-state";

export const INSTALLATION_STATUSES = [
  "installed",
  "missing",
  "unknown",
] as const;

export type InstallationStatus = (typeof INSTALLATION_STATUSES)[number];

export const PROVIDER_HEALTH_STATUSES = [
  "healthy",
  "degraded",
  "unavailable",
  "unknown",
] as const;

export type ProviderHealthStatus = (typeof PROVIDER_HEALTH_STATUSES)[number];

export type ProviderInstallationDeclaration = {
  providerId: string;
  providerVersion?: string;
  installationStatus: InstallationStatus;
  licenseStatus: LicenseState;
  healthStatus: ProviderHealthStatus;
  revoked: boolean;
  observedAt: string;
  detail?: string;
};

export function declareProviderInstallation(input: {
  providerId: string;
  providerVersion?: string;
  installationStatus?: InstallationStatus;
  licenseStatus?: LicenseState;
  healthStatus?: ProviderHealthStatus;
  revoked?: boolean;
  detail?: string;
}): ProviderInstallationDeclaration {
  return {
    providerId: input.providerId,
    providerVersion: input.providerVersion,
    installationStatus: input.installationStatus ?? "unknown",
    licenseStatus: input.licenseStatus ?? "unknown",
    healthStatus: input.healthStatus ?? "unknown",
    revoked: input.revoked ?? false,
    observedAt: new Date().toISOString(),
    detail: input.detail,
  };
}
