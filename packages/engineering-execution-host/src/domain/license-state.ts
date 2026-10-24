/**
 * Bounded license-state classification — no secrets / no license keys.
 */

export const LICENSE_STATES = [
  "available",
  "unavailable",
  "expired",
  "invalid",
  "unknown",
] as const;

export type LicenseState = (typeof LICENSE_STATES)[number];

export type LicenseStateObservation = {
  providerId: string;
  state: LicenseState;
  observedAt: string;
  detail?: string;
  /** Always false — commercial license material stays external. */
  storesLicenseSecret: false;
};

export function classifyLicenseState(
  input: {
    reachable?: boolean;
    isLicensed?: boolean | null;
    expired?: boolean;
    invalid?: boolean;
  },
): LicenseState {
  if (input.invalid) return "invalid";
  if (input.expired) return "expired";
  if (input.isLicensed === true) return "available";
  if (input.isLicensed === false) return "unavailable";
  if (input.reachable === false) return "unknown";
  return "unknown";
}

export function createLicenseStateObservation(input: {
  providerId: string;
  state: LicenseState;
  detail?: string;
}): LicenseStateObservation {
  return {
    providerId: input.providerId,
    state: input.state,
    observedAt: new Date().toISOString(),
    detail: input.detail,
    storesLicenseSecret: false,
  };
}
