/**
 * EngineeringExecutionHost contract — infrastructure only.
 */

import type { HostHealthStatus } from "./host-health";
import type { LicenseState } from "./license-state";
import type { ProviderInstallationDeclaration } from "./provider-installation";

export const HOST_CLASSES = [
  "engineering_workstation",
  "dedicated_windows_vm",
  "self_hosted_ci_runner",
  "controlled_remote_host",
  "future_cloud_engineering_host",
] as const;

export type HostClass = (typeof HOST_CLASSES)[number];

export const HOST_STATUSES = [
  "registered",
  "ready",
  "busy",
  "draining",
  "revoked",
  "unavailable",
] as const;

export type HostStatus = (typeof HOST_STATUSES)[number];

export const EXECUTION_MODES = [
  "interactive_workstation",
  "headless_local",
  "self_hosted_runner",
  "controlled_remote",
] as const;

export type ExecutionMode = (typeof EXECUTION_MODES)[number];

export type ResourcePolicy = {
  maxConcurrentJobs: number;
  maxCpuPercent?: number;
  maxMemoryMb?: number;
  maxDiskMb?: number;
};

export type SandboxPolicy = {
  pathConfinement: true;
  processTimeoutRequired: true;
  arbitraryShellInjectionAllowed: false;
  restrictedSecretExposure: true;
  crossTenantIsolation: true;
};

export type WorkspacePolicy = {
  isolatedJobDirectory: true;
  crossJobFileAccessAllowed: false;
  cleanupRequired: true;
  immutableInputStaging: true;
};

export type ArtifactPolicy = {
  platformFilesOnly: true;
  inlineModelPayloadAllowed: false;
};

export type NetworkPolicy = {
  outboundRestricted: boolean;
  allowProviderLocalApi: boolean;
};

export type EngineeringExecutionHost = {
  hostId: string;
  tenantId: string;
  workspaceId: string;
  hostClass: HostClass;
  operatingSystem: string;
  architecture: string;
  executionMode: ExecutionMode;
  status: HostStatus;
  health: HostHealthStatus;
  installedProviders: ProviderInstallationDeclaration[];
  installedProviderVersions: Record<string, string>;
  licenseStatuses: Record<string, LicenseState>;
  resourcePolicy: ResourcePolicy;
  sandboxPolicy: SandboxPolicy;
  workspacePolicy: WorkspacePolicy;
  artifactPolicy: ArtifactPolicy;
  networkPolicy: NetworkPolicy;
  supportedExecutionModes: ExecutionMode[];
  lastHeartbeat: string;
  metadata: Record<string, string>;
  createdAt: string;
  updatedAt: string;
  revokedAt?: string;
};

export function createEngineeringExecutionHost(input: {
  hostId: string;
  tenantId: string;
  workspaceId: string;
  hostClass: HostClass;
  operatingSystem?: string;
  architecture?: string;
  executionMode?: ExecutionMode;
  maxConcurrentJobs?: number;
  metadata?: Record<string, string>;
}): EngineeringExecutionHost {
  const now = new Date().toISOString();
  const executionMode = input.executionMode ?? "headless_local";
  return {
    hostId: input.hostId,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    hostClass: input.hostClass,
    operatingSystem: input.operatingSystem ?? "windows",
    architecture: input.architecture ?? "x64",
    executionMode,
    status: "registered",
    health: "unknown",
    installedProviders: [],
    installedProviderVersions: {},
    licenseStatuses: {},
    resourcePolicy: {
      maxConcurrentJobs: input.maxConcurrentJobs ?? 1,
    },
    sandboxPolicy: {
      pathConfinement: true,
      processTimeoutRequired: true,
      arbitraryShellInjectionAllowed: false,
      restrictedSecretExposure: true,
      crossTenantIsolation: true,
    },
    workspacePolicy: {
      isolatedJobDirectory: true,
      crossJobFileAccessAllowed: false,
      cleanupRequired: true,
      immutableInputStaging: true,
    },
    artifactPolicy: {
      platformFilesOnly: true,
      inlineModelPayloadAllowed: false,
    },
    networkPolicy: {
      outboundRestricted: true,
      allowProviderLocalApi: true,
    },
    supportedExecutionModes: [executionMode, "self_hosted_runner"],
    lastHeartbeat: now,
    metadata: input.metadata ?? {},
    createdAt: now,
    updatedAt: now,
  };
}
