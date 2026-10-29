/**
 * Phase 13C — SPACE GASS license probing (no secrets stored).
 */

import { probeSpaceGassVersion } from "./spacegass-version";

export type SpaceGassLicenseStatus =
  | "available"
  | "unavailable"
  | "unknown"
  | "not_configured";

export type SpaceGassLicenseObservation = {
  status: SpaceGassLicenseStatus;
  errorCode?: "license_unavailable" | "solver_unavailable";
  detail: string;
  /** Never persist license keys — presence flag only. */
  licenseKeyPresent: false;
  checkedAt: string;
};

/**
 * Probe license/runtime readiness without reading or storing secrets.
 * SPACEGASS_LICENSE_PRESENT=1 may indicate operator-attested presence only.
 */
export function probeSpaceGassLicense(
  env: NodeJS.ProcessEnv = process.env,
): SpaceGassLicenseObservation {
  const checkedAt = new Date().toISOString();
  const version = probeSpaceGassVersion(env);
  if (!version.ok) {
    return {
      status: "not_configured",
      errorCode: "solver_unavailable",
      detail: version.detail ?? "SPACE GASS runtime not configured",
      licenseKeyPresent: false,
      checkedAt,
    };
  }

  const attested = env.SPACEGASS_LICENSE_PRESENT?.trim() === "1";
  if (!attested) {
    return {
      status: "unavailable",
      errorCode: "license_unavailable",
      detail:
        "Runtime path configured but SPACEGASS_LICENSE_PRESENT!=1. No license secrets are stored in-repo.",
      licenseKeyPresent: false,
      checkedAt,
    };
  }

  return {
    status: "available",
    detail: "Operator-attested license presence (no secret material stored).",
    licenseKeyPresent: false,
    checkedAt,
  };
}
