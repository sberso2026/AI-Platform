import type { ExternalToolIntegrationMode, ExternalToolReadiness } from "./catalog";
import { evaluateAdapterCompatibility } from "./compatibility";
import type { ExternalToolProfile } from "./types";

export function requiredFieldsForModes(modes: ExternalToolIntegrationMode[]): {
  execution: boolean;
  api: boolean;
  model: boolean;
  data: boolean;
} {
  return {
    execution: modes.includes("EXECUTION_ADAPTER"),
    api: modes.includes("API_CONNECTOR"),
    model: modes.includes("MODEL_FILE_INTEROP"),
    data: modes.includes("DATA_CONNECTOR"),
  };
}

export function assertModeRequirements(profile: Pick<ExternalToolProfile, "integrationModes" | "executablePath" | "executionHostId" | "endpoint" | "connectorId" | "credentialSecretId" | "adapterId">): void {
  const req = requiredFieldsForModes(profile.integrationModes);
  if (req.api) {
    if (profile.executablePath) throw new Error("api_connector_must_not_set_executable_path");
  }
  if (profile.integrationModes.length === 0) throw new Error("integration_mode_required");
}

function capabilityCertified(capabilities: ExternalToolProfile["capabilities"], key: string): boolean {
  return capabilities.some((cap) => cap.key === key && cap.certification === "CERTIFIED");
}

/**
 * Derived readiness. READY is fail-closed for execution tools.
 * Automation is never inferred from executable presence.
 */
export function deriveReadiness(profile: Omit<ExternalToolProfile, "readiness" | "adapterCompatibilityStatus">): {
  readiness: ExternalToolReadiness;
  adapterCompatibilityStatus: ReturnType<typeof evaluateAdapterCompatibility>;
} {
  const adapterCompatibilityStatus = evaluateAdapterCompatibility({
    installedVersion: profile.installedVersion,
    compatibleToolVersions: profile.compatibleToolVersions,
    notCertifiedToolVersions: profile.notCertifiedToolVersions,
    minSupportedVersion: profile.minSupportedVersion,
  });

  if (profile.status === "disabled" || !profile.enabled) {
    return { readiness: "BLOCKED", adapterCompatibilityStatus };
  }

  const req = requiredFieldsForModes(profile.integrationModes);
  if (profile.integrationModes.length === 0) {
    return { readiness: "NOT_CONFIGURED", adapterCompatibilityStatus };
  }

  if (req.execution) {
    const installMissing =
      !profile.executionHostId ||
      !profile.executablePath ||
      !profile.installedVersion ||
      profile.installationStatus !== "INSTALLED";
    if (installMissing) {
      return { readiness: "NOT_CONFIGURED", adapterCompatibilityStatus };
    }
    if (adapterCompatibilityStatus === "INCOMPATIBLE") {
      return { readiness: "BLOCKED", adapterCompatibilityStatus };
    }
    if (adapterCompatibilityStatus !== "CERTIFIED") {
      return { readiness: "BLOCKED", adapterCompatibilityStatus };
    }
    if (profile.licenceStatus === "UNAVAILABLE" || profile.licenceStatus === "EXPIRED") {
      return { readiness: "UNAVAILABLE", adapterCompatibilityStatus };
    }
    if (profile.licenceStatus !== "AVAILABLE" && profile.licenceStatus !== "NOT_REQUIRED") {
      return { readiness: "UNAVAILABLE", adapterCompatibilityStatus };
    }
    if (profile.automationPermission !== "PERMITTED") {
      return { readiness: "BLOCKED", adapterCompatibilityStatus };
    }
    if (!profile.automationConfirmedBy || !profile.automationConfirmedAt) {
      return { readiness: "BLOCKED", adapterCompatibilityStatus };
    }
    const requiredCaps = ["OPTIMIZATION_EXECUTION", "LINEAR_STATIC_ANALYSIS", "RESULT_EXTRACTION"];
    const needsOpt = profile.capabilities.some((c) => c.key === "OPTIMIZATION_EXECUTION");
    if (needsOpt && requiredCaps.some((key) => profile.capabilities.some((c) => c.key === key) && !capabilityCertified(profile.capabilities, key))) {
      return { readiness: "BLOCKED", adapterCompatibilityStatus };
    }
    if (profile.lastValidation.overall === "FAIL") return { readiness: "UNAVAILABLE", adapterCompatibilityStatus };
    if (profile.lastValidation.overall !== "PASS") return { readiness: "CONFIGURED", adapterCompatibilityStatus };
    return { readiness: "READY", adapterCompatibilityStatus };
  }

  if (req.api) {
    if (!profile.endpoint || !profile.connectorId) {
      return { readiness: "NOT_CONFIGURED", adapterCompatibilityStatus };
    }
    if (profile.lastValidation.overall === "FAIL") return { readiness: "UNAVAILABLE", adapterCompatibilityStatus };
    if (profile.lastValidation.overall !== "PASS") return { readiness: "CONFIGURED", adapterCompatibilityStatus };
    return { readiness: "READY", adapterCompatibilityStatus };
  }

  if (req.model || req.data) {
    if (!profile.adapterId) return { readiness: "NOT_CONFIGURED", adapterCompatibilityStatus };
    if (profile.lastValidation.overall === "PASS") return { readiness: "READY", adapterCompatibilityStatus };
    return { readiness: "CONFIGURED", adapterCompatibilityStatus };
  }

  return { readiness: "NOT_CONFIGURED", adapterCompatibilityStatus };
}

export function withDerivedState<T extends Omit<ExternalToolProfile, "readiness" | "adapterCompatibilityStatus">>(
  profile: T,
): T & { readiness: ExternalToolReadiness; adapterCompatibilityStatus: ReturnType<typeof evaluateAdapterCompatibility> } {
  return { ...profile, ...deriveReadiness(profile) };
}
