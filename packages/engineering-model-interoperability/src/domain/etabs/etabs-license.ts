/**
 * Phase 13E — ETABS license probing (no secrets stored).
 */

import { probeEtabsVersion } from "./etabs-version";

export type EtabsLicenseStatus =
  | "available"
  | "unavailable"
  | "unknown"
  | "not_configured";

export type EtabsLicenseObservation = {
  status: EtabsLicenseStatus;
  errorCode?: "license_unavailable" | "solver_unavailable" | "com_unavailable";
  detail: string;
  licenseKeyPresent: false;
  checkedAt: string;
};

/**
 * Probe license/runtime readiness without reading or storing secrets.
 * ETABS_LICENSE_PRESENT=1 may indicate operator-attested presence only.
 */
export function probeEtabsLicense(
  env: NodeJS.ProcessEnv = process.env,
): EtabsLicenseObservation {
  const checkedAt = new Date().toISOString();
  const version = probeEtabsVersion(env);
  if (!version.ok) {
    return {
      status: "not_configured",
      errorCode:
        version.errorCode === "com_unavailable"
          ? "com_unavailable"
          : "solver_unavailable",
      detail: version.detail ?? "ETABS runtime/COM not configured",
      licenseKeyPresent: false,
      checkedAt,
    };
  }

  const attested = env.ETABS_LICENSE_PRESENT?.trim() === "1";
  if (!attested) {
    return {
      status: "unavailable",
      errorCode: "license_unavailable",
      detail:
        "Runtime path configured but ETABS_LICENSE_PRESENT!=1. No license secrets are stored in-repo.",
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
