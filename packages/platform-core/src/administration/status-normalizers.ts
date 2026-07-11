import type { InstallationStatus } from "../commerce/commerce-types";
import type { HealthStatus } from "./administration-types";

/** Maps installation + optional health check outcome to customer health status */
export function normalizeHealthStatus(input: {
  installationStatus?: InstallationStatus | string;
  healthCheckStatus?: string;
  installationSuspended?: boolean;
}): HealthStatus {
  if (input.installationSuspended || input.installationStatus === "suspended") {
    return "suspended";
  }
  if (input.installationStatus === "failed") return "failed";
  if (input.installationStatus === "degraded") return "degraded";
  if (input.healthCheckStatus === "warning") return "warning";
  if (input.healthCheckStatus === "degraded") return "degraded";
  if (input.healthCheckStatus === "failed") return "failed";
  if (
    input.installationStatus === "active" ||
    input.installationStatus === "healthy"
  ) {
    return "healthy";
  }
  if (
    ["provisioning", "validating", "requested", "queued", "upgrading", "rolling_back"].includes(
      input.installationStatus ?? ""
    )
  ) {
    return "warning";
  }
  return "warning";
}

export function normalizeSystemHealthStatus(
  raw: string | undefined
): "operational" | "warning" | "degraded" | "unavailable" | "suspended" {
  switch (raw) {
    case "ok":
    case "healthy":
    case "operational":
      return "operational";
    case "warning":
      return "warning";
    case "degraded":
      return "degraded";
    case "suspended":
      return "suspended";
    case "error":
    case "failed":
    case "unavailable":
      return "unavailable";
    default:
      return "warning";
  }
}

export const HEALTH_STATUS_LABELS: Record<HealthStatus, string> = {
  healthy: "Healthy",
  warning: "Warning",
  degraded: "Degraded",
  failed: "Failed",
  suspended: "Suspended",
};
