/**
 * SPACE GASS host probe — detect only; never claims live execution certified.
 * Reuses interop live health probe modules (non-certified retention).
 */

import { probeSpaceGassLiveHealth } from "@rtb/engineering-model-interoperability";
import { classifyLicenseState } from "./license-state";
import type {
  EngineeringProviderHostProbe,
  ProviderHostProbeResult,
} from "./provider-host-probe";
import { SPACEGASSLiveExecutionCertified } from "../version";

export type SpaceGassHostProbeReport = ProviderHostProbeResult & {
  apiBaseUrl?: string;
  liveSessionProven: boolean;
  SPACEGASSLiveExecutionCertified: false;
  detectOnly: true;
};

export async function probeSpaceGassHost(options?: {
  timeoutMs?: number;
  apiBaseUrl?: string;
}): Promise<SpaceGassHostProbeReport> {
  if (SPACEGASSLiveExecutionCertified) {
    throw new Error("spacegass_live_execution_certified_must_remain_false");
  }

  const env = options?.apiBaseUrl
    ? { ...process.env, SPACEGASS_API_URL: options.apiBaseUrl }
    : process.env;

  const health = await probeSpaceGassLiveHealth({
    timeoutMs: options?.timeoutMs ?? 3000,
    env,
  });

  const licenseState = classifyLicenseState({
    reachable: health.reachable,
    isLicensed: health.licenseOk ? true : health.reachable ? false : null,
  });

  const installationStatus = health.reachable
    ? ("installed" as const)
    : ("missing" as const);

  let healthStatus: SpaceGassHostProbeReport["healthStatus"] = "unavailable";
  if (health.status === "healthy") healthStatus = "healthy";
  else if (health.status === "degraded") healthStatus = "degraded";
  else if (health.reachable) healthStatus = "degraded";

  return {
    providerId: "spacegass",
    probedAt: health.checkedAt,
    processOrServicePresent: health.reachable,
    providerIdentityOk: health.versionOk,
    versionText: health.versionText,
    apiOrServiceReady: health.reachable && health.versionOk && health.licenseOk,
    licenseState,
    installationStatus,
    healthStatus,
    executionReady: false,
    detail: health.detail,
    correctiveFindings: [
      ...health.correctiveFindings,
      "Phase 13D.1 host probe is detect-only; SPACEGASSLiveExecutionCertified=false.",
    ],
    executionCertified: false,
    apiBaseUrl: health.apiBaseUrl,
    liveSessionProven: health.liveSessionProven,
    SPACEGASSLiveExecutionCertified: false,
    detectOnly: true,
  };
}

export function createSpaceGassHostProbe(): EngineeringProviderHostProbe {
  return {
    providerId: "spacegass",
    async probe(options) {
      return probeSpaceGassHost(options);
    },
  };
}
