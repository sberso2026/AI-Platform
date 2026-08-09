/**
 * Phase 13E — ETABS host probe via engineering-execution-host generic mechanism.
 *
 * Does NOT create ETABS-specific host architecture. Dynamically reuses EEH's
 * reserved ETABS probe (detect-only / unavailable). Never claims
 * ETABSHostedExecutionCertified or ETABSControlledExecutionCertified.
 */

export type EtabsHostProbeReport = {
  providerId: "etabs";
  probedAt: string;
  processOrServicePresent: boolean;
  providerIdentityOk: boolean;
  versionText?: string;
  apiOrServiceReady: boolean;
  installationStatus: string;
  healthStatus: string;
  executionReady: false;
  executionCertified: false;
  ETABSHostedExecutionCertified: false;
  ETABSControlledExecutionCertified: false;
  liveNativeCom: false;
  federationPath: "export_fixture";
  ControlledEngineeringExecutionHostReady: boolean;
  detail: string;
  correctiveFindings: string[];
};

/**
 * Probe ETABS availability through the controlled execution host foundation.
 * On workstations without ETABS COM, returns unavailable (truthful).
 */
export async function probeEtabsHostViaExecutionHost(options?: {
  timeoutMs?: number;
}): Promise<EtabsHostProbeReport> {
  void options;
  const eeh = await import("@rtb/engineering-execution-host");
  if (!eeh.ControlledEngineeringExecutionHostReady) {
    throw new Error("controlled_engineering_execution_host_not_ready");
  }

  const probe = eeh.createEtabsReservedHostProbe();
  const result = await probe.probe({ timeoutMs: options?.timeoutMs });

  return {
    providerId: "etabs",
    probedAt: result.probedAt,
    processOrServicePresent: result.processOrServicePresent,
    providerIdentityOk: result.providerIdentityOk,
    versionText: result.versionText,
    apiOrServiceReady: result.apiOrServiceReady,
    installationStatus: result.installationStatus,
    healthStatus: result.healthStatus,
    executionReady: false,
    executionCertified: false,
    ETABSHostedExecutionCertified: false,
    ETABSControlledExecutionCertified: false,
    liveNativeCom: false,
    federationPath: "export_fixture",
    ControlledEngineeringExecutionHostReady: true,
    detail: `${result.detail} Export federation path remains available; live native COM not certified.`,
    correctiveFindings: [
      ...result.correctiveFindings,
      "ETABSHostedExecutionCertified=false",
      "ETABSControlledExecutionCertified=false",
      "Use etabs_export_fixture federation — not live COM.",
    ],
  };
}
