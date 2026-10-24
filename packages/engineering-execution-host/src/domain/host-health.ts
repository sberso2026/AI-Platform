/**
 * Host-level health (independent from provider/solver qualification).
 */

export const HOST_HEALTH_STATUSES = [
  "healthy",
  "degraded",
  "unavailable",
  "draining",
  "revoked",
  "unknown",
] as const;

export type HostHealthStatus = (typeof HOST_HEALTH_STATUSES)[number];

export type EngineeringExecutionHostHealth = {
  hostId: string;
  status: HostHealthStatus;
  checkedAt: string;
  heartbeatOk: boolean;
  capacityOk: boolean;
  providerReadinessOk: boolean;
  workspaceReadinessOk: boolean;
  artifactTransportOk: boolean;
  activeJobCount: number;
  maxConcurrentJobs: number;
  detail?: string;
};

export function evaluateHostHealth(input: {
  hostId: string;
  revoked?: boolean;
  draining?: boolean;
  heartbeatOk: boolean;
  capacityOk: boolean;
  providerReadinessOk: boolean;
  workspaceReadinessOk: boolean;
  artifactTransportOk: boolean;
  activeJobCount: number;
  maxConcurrentJobs: number;
  detail?: string;
}): EngineeringExecutionHostHealth {
  let status: HostHealthStatus = "unknown";
  if (input.revoked) status = "revoked";
  else if (input.draining) status = "draining";
  else if (!input.heartbeatOk) status = "unavailable";
  else if (
    !input.capacityOk ||
    !input.providerReadinessOk ||
    !input.workspaceReadinessOk ||
    !input.artifactTransportOk
  ) {
    status = "degraded";
  } else {
    status = "healthy";
  }

  return {
    hostId: input.hostId,
    status,
    checkedAt: new Date().toISOString(),
    heartbeatOk: input.heartbeatOk,
    capacityOk: input.capacityOk,
    providerReadinessOk: input.providerReadinessOk,
    workspaceReadinessOk: input.workspaceReadinessOk,
    artifactTransportOk: input.artifactTransportOk,
    activeJobCount: input.activeJobCount,
    maxConcurrentJobs: input.maxConcurrentJobs,
    detail: input.detail,
  };
}
