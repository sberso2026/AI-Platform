import type { ExternalToolLicenceStatus, ExternalToolLicenceType, ExternalToolReadiness } from "./catalog";
import { evaluateAdapterCompatibility } from "./compatibility";
import type { ExternalToolProfile } from "./types";

export type DevelopmentEvaluationReadiness =
  | "READY_FOR_DEVELOPMENT_EVALUATION"
  | "NOT_READY_FOR_DEVELOPMENT_EVALUATION";

export function requiredFieldsForModes(modes: ExternalToolProfile["integrationModes"]): {
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

export function isTrialLicenceExpired(
  profile: Pick<ExternalToolProfile, "licenceType" | "licenceExpiresAt">,
  now = new Date(),
): boolean {
  if (profile.licenceType !== "TRIAL") return false;
  if (!profile.licenceExpiresAt) return false;
  const expires = new Date(profile.licenceExpiresAt);
  if (Number.isNaN(expires.getTime())) return true;
  return expires.getTime() <= now.getTime();
}

/**
 * Trial expiry is mandatory. Unknown trial expiry fail-closes.
 * Workspace assignment cannot override this derivation.
 */
export function effectiveLicenceStatus(
  profile: Pick<ExternalToolProfile, "licenceType" | "licenceStatus" | "licenceExpiresAt">,
  now = new Date(),
): ExternalToolLicenceStatus {
  if (isTrialLicenceExpired(profile, now)) return "EXPIRED";
  if (profile.licenceType === "TRIAL" && !profile.licenceExpiresAt) return "UNAVAILABLE";
  return profile.licenceStatus;
}

function developmentEvaluationReady(
  profile: Omit<ExternalToolProfile, "readiness" | "adapterCompatibilityStatus" | "developmentEvaluationReadiness">,
  adapterCompatibilityStatus: ReturnType<typeof evaluateAdapterCompatibility>,
  licence: ExternalToolLicenceStatus,
): DevelopmentEvaluationReadiness {
  if (!profile.enabled || profile.status === "disabled") return "NOT_READY_FOR_DEVELOPMENT_EVALUATION";
  if (!profile.executionHostId) return "NOT_READY_FOR_DEVELOPMENT_EVALUATION";
  if (!profile.executablePath || profile.installationStatus !== "INSTALLED" || !profile.installedVersion) {
    return "NOT_READY_FOR_DEVELOPMENT_EVALUATION";
  }
  if (profile.apiAvailable !== true) return "NOT_READY_FOR_DEVELOPMENT_EVALUATION";
  if (adapterCompatibilityStatus !== "CERTIFIED") return "NOT_READY_FOR_DEVELOPMENT_EVALUATION";
  if (licence !== "AVAILABLE" && licence !== "NOT_REQUIRED") return "NOT_READY_FOR_DEVELOPMENT_EVALUATION";
  if (profile.automationPermission !== "PERMITTED" || !profile.automationConfirmedBy || !profile.automationConfirmedAt) {
    return "NOT_READY_FOR_DEVELOPMENT_EVALUATION";
  }
  const requiredCaps = ["OPTIMIZATION_EXECUTION", "LINEAR_STATIC_ANALYSIS", "RESULT_EXTRACTION"];
  if (requiredCaps.some((key) => profile.capabilities.some((c) => c.key === key) && !capabilityCertified(profile.capabilities, key))) {
    return "NOT_READY_FOR_DEVELOPMENT_EVALUATION";
  }
  if (profile.lastValidation.overall !== "PASS") return "NOT_READY_FOR_DEVELOPMENT_EVALUATION";
  return "READY_FOR_DEVELOPMENT_EVALUATION";
}

/**
 * Derived readiness. READY is fail-closed for production-class execution.
 * Trial licences cannot be READY. Automation is never inferred from executable presence.
 */
export function deriveReadiness(
  profile: Omit<ExternalToolProfile, "readiness" | "adapterCompatibilityStatus" | "developmentEvaluationReadiness">,
): {
  readiness: ExternalToolReadiness;
  adapterCompatibilityStatus: ReturnType<typeof evaluateAdapterCompatibility>;
  developmentEvaluationReadiness: DevelopmentEvaluationReadiness;
} {
  const adapterCompatibilityStatus = evaluateAdapterCompatibility({
    installedVersion: profile.installedVersion,
    compatibleToolVersions: profile.compatibleToolVersions,
    notCertifiedToolVersions: profile.notCertifiedToolVersions,
    minSupportedVersion: profile.minSupportedVersion,
  });
  const licence = effectiveLicenceStatus(profile);

  const developmentEvaluationReadiness = developmentEvaluationReady(profile, adapterCompatibilityStatus, licence);

  if (profile.status === "disabled" || !profile.enabled) {
    return { readiness: "BLOCKED", adapterCompatibilityStatus, developmentEvaluationReadiness };
  }

  const req = requiredFieldsForModes(profile.integrationModes);
  if (profile.integrationModes.length === 0) {
    return { readiness: "NOT_CONFIGURED", adapterCompatibilityStatus, developmentEvaluationReadiness };
  }

  if (req.execution) {
    const installMissing =
      !profile.executionHostId ||
      !profile.executablePath ||
      !profile.installedVersion ||
      profile.installationStatus !== "INSTALLED";
    if (installMissing) {
      return { readiness: "NOT_CONFIGURED", adapterCompatibilityStatus, developmentEvaluationReadiness };
    }
    if (adapterCompatibilityStatus === "INCOMPATIBLE") {
      return { readiness: "BLOCKED", adapterCompatibilityStatus, developmentEvaluationReadiness };
    }
    if (adapterCompatibilityStatus !== "CERTIFIED") {
      return { readiness: "BLOCKED", adapterCompatibilityStatus, developmentEvaluationReadiness };
    }
    if (licence === "UNAVAILABLE" || licence === "EXPIRED") {
      return { readiness: "UNAVAILABLE", adapterCompatibilityStatus, developmentEvaluationReadiness };
    }
    if (licence !== "AVAILABLE" && licence !== "NOT_REQUIRED") {
      return { readiness: "UNAVAILABLE", adapterCompatibilityStatus, developmentEvaluationReadiness };
    }
    if (profile.licenceType === "TRIAL" || profile.productionUsePermitted !== true) {
      return { readiness: "BLOCKED", adapterCompatibilityStatus, developmentEvaluationReadiness };
    }
    if (profile.environment === "production" && profile.productionUsePermitted !== true) {
      return { readiness: "BLOCKED", adapterCompatibilityStatus, developmentEvaluationReadiness };
    }
    if (profile.automationPermission !== "PERMITTED") {
      return { readiness: "BLOCKED", adapterCompatibilityStatus, developmentEvaluationReadiness };
    }
    if (!profile.automationConfirmedBy || !profile.automationConfirmedAt) {
      return { readiness: "BLOCKED", adapterCompatibilityStatus, developmentEvaluationReadiness };
    }
    const requiredCaps = ["OPTIMIZATION_EXECUTION", "LINEAR_STATIC_ANALYSIS", "RESULT_EXTRACTION"];
    const needsOpt = profile.capabilities.some((c) => c.key === "OPTIMIZATION_EXECUTION");
    if (needsOpt && requiredCaps.some((key) => profile.capabilities.some((c) => c.key === key) && !capabilityCertified(profile.capabilities, key))) {
      return { readiness: "BLOCKED", adapterCompatibilityStatus, developmentEvaluationReadiness };
    }
    if (profile.lastValidation.overall === "FAIL") {
      return { readiness: "UNAVAILABLE", adapterCompatibilityStatus, developmentEvaluationReadiness };
    }
    if (profile.lastValidation.overall !== "PASS") {
      return { readiness: "CONFIGURED", adapterCompatibilityStatus, developmentEvaluationReadiness };
    }
    return { readiness: "READY", adapterCompatibilityStatus, developmentEvaluationReadiness };
  }

  if (req.api) {
    if (!profile.endpoint || !profile.connectorId) {
      return { readiness: "NOT_CONFIGURED", adapterCompatibilityStatus, developmentEvaluationReadiness };
    }
    if (profile.lastValidation.overall === "FAIL") {
      return { readiness: "UNAVAILABLE", adapterCompatibilityStatus, developmentEvaluationReadiness };
    }
    if (profile.lastValidation.overall !== "PASS") {
      return { readiness: "CONFIGURED", adapterCompatibilityStatus, developmentEvaluationReadiness };
    }
    return { readiness: "READY", adapterCompatibilityStatus, developmentEvaluationReadiness };
  }

  if (req.model || req.data) {
    if (!profile.adapterId) return { readiness: "NOT_CONFIGURED", adapterCompatibilityStatus, developmentEvaluationReadiness };
    if (profile.lastValidation.overall === "PASS") {
      return { readiness: "READY", adapterCompatibilityStatus, developmentEvaluationReadiness };
    }
    return { readiness: "CONFIGURED", adapterCompatibilityStatus, developmentEvaluationReadiness };
  }

  return { readiness: "NOT_CONFIGURED", adapterCompatibilityStatus, developmentEvaluationReadiness };
}

export function withDerivedState<
  T extends Omit<ExternalToolProfile, "readiness" | "adapterCompatibilityStatus" | "developmentEvaluationReadiness">,
>(
  profile: T,
): T & {
  readiness: ExternalToolReadiness;
  adapterCompatibilityStatus: ReturnType<typeof evaluateAdapterCompatibility>;
  developmentEvaluationReadiness: DevelopmentEvaluationReadiness;
} {
  return { ...profile, ...deriveReadiness(profile) };
}

export function defaultLicenceGovernance(): {
  licenceType: ExternalToolLicenceType;
  licenceExpiresAt: null;
  apiAvailable: null;
  productionUsePermitted: false;
} {
  return {
    licenceType: "UNKNOWN",
    licenceExpiresAt: null,
    apiAvailable: null,
    productionUsePermitted: false,
  };
}
