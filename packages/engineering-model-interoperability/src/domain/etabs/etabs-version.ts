/**
 * Phase 13E — ETABS version / COM probe (no binary required for federation).
 */

export const ETABS_PROVIDER_KEY = "etabs" as const;
export const ETABS_DISPLAY_NAME = "CSI ETABS" as const;
export const ETABS_ADAPTER_VERSION = "0.4.0-etabs-federation" as const;
export const ETABS_BOUNDED_METHOD = "linear_elastic_static" as const;

/** Minimum product version accepted when a real runtime is present. */
export const ETABS_MIN_SUPPORTED_VERSION = "18.0" as const;

export type EtabsVersionProbeResult = {
  ok: boolean;
  versionText: string;
  versionNormalized?: string;
  probeSource:
    | "env_ETABS_HOME"
    | "env_ETABS_API"
    | "env_ETABS_EXECUTABLE"
    | "env_ETABS_COM"
    | "unavailable";
  errorCode?: "solver_unavailable" | "wrong_version" | "probe_failed" | "com_unavailable";
  detail?: string;
  comAvailable: false;
};

export function normalizeEtabsVersion(raw: string): string | undefined {
  const m = raw.trim().match(/(\d+)(?:\.(\d+))?(?:\.(\d+))?/);
  if (!m) return undefined;
  return `${m[1]}.${m[2] ?? "0"}.${m[3] ?? "0"}`;
}

export function isEtabsVersionSupported(versionNormalized: string): boolean {
  const parts = versionNormalized.split(".").map((p) => Number(p));
  const min = ETABS_MIN_SUPPORTED_VERSION.split(".").map((p) => Number(p));
  for (let i = 0; i < 3; i++) {
    const a = parts[i] ?? 0;
    const b = min[i] ?? 0;
    if (a > b) return true;
    if (a < b) return false;
  }
  return true;
}

/**
 * Probe for ETABS COM/API runtime via env only — never claims COM present
 * without configuration. Standard CI / this workstation: unavailable.
 */
export function probeEtabsVersion(
  env: NodeJS.ProcessEnv = process.env,
): EtabsVersionProbeResult {
  const home = env.ETABS_HOME?.trim();
  const api = env.ETABS_API?.trim();
  const com = env.ETABS_COM?.trim() || env.ETABS_OAPI?.trim();
  const exe = env.ETABS_EXECUTABLE?.trim() || env.ETABS_EXE?.trim();
  const forcedVersion = env.ETABS_VERSION?.trim();

  if (!home && !api && !exe && !com) {
    return {
      ok: false,
      versionText: "unavailable",
      probeSource: "unavailable",
      errorCode: "com_unavailable",
      detail:
        "No ETABS_HOME / ETABS_API / ETABS_COM / ETABS_EXECUTABLE configured. No ETABS COM OAPI binary is bundled in this repository. Export federation remains available.",
      comAvailable: false,
    };
  }

  const versionText = forcedVersion || "unknown";
  const versionNormalized = normalizeEtabsVersion(versionText);
  const probeSource = com
    ? ("env_ETABS_COM" as const)
    : exe
      ? ("env_ETABS_EXECUTABLE" as const)
      : api
        ? ("env_ETABS_API" as const)
        : ("env_ETABS_HOME" as const);

  if (!versionNormalized) {
    return {
      ok: false,
      versionText,
      probeSource,
      errorCode: "probe_failed",
      detail: "ETABS_VERSION not parseable; set ETABS_VERSION when runtime is present.",
      comAvailable: false,
    };
  }

  if (!isEtabsVersionSupported(versionNormalized)) {
    return {
      ok: false,
      versionText,
      versionNormalized,
      probeSource,
      errorCode: "wrong_version",
      detail: `ETABS ${versionNormalized} below minimum ${ETABS_MIN_SUPPORTED_VERSION}`,
      comAvailable: false,
    };
  }

  // Env attestation alone does not prove live COM — comAvailable stays false
  // until a real COM session is certified (out of scope for export federation).
  return {
    ok: true,
    versionText,
    versionNormalized,
    probeSource,
    comAvailable: false,
    detail:
      "Runtime path attested via env; live native COM not certified (ETABSHostedExecutionCertified=false).",
  };
}
