/**
 * Phase 13C — SPACE GASS version probing (no binary required for federation).
 */

export const SPACEGASS_PROVIDER_KEY = "spacegass" as const;
export const SPACEGASS_DISPLAY_NAME = "SPACE GASS" as const;
export const SPACEGASS_ADAPTER_VERSION = "0.3.0-spacegass" as const;
export const SPACEGASS_BOUNDED_METHOD = "linear_elastic_static" as const;

/** Minimum product version accepted when a real runtime is present. */
export const SPACEGASS_MIN_SUPPORTED_VERSION = "12.0" as const;

export type SpaceGassVersionProbeResult = {
  ok: boolean;
  versionText: string;
  versionNormalized?: string;
  probeSource:
    | "env_SPACEGASS_HOME"
    | "env_SPACEGASS_API"
    | "env_SPACEGASS_EXECUTABLE"
    | "unavailable";
  errorCode?: "solver_unavailable" | "wrong_version" | "probe_failed";
  detail?: string;
};

export function normalizeSpaceGassVersion(raw: string): string | undefined {
  const m = raw.trim().match(/(\d+)(?:\.(\d+))?(?:\.(\d+))?/);
  if (!m) return undefined;
  return `${m[1]}.${m[2] ?? "0"}.${m[3] ?? "0"}`;
}

export function isSpaceGassVersionSupported(versionNormalized: string): boolean {
  const parts = versionNormalized.split(".").map((p) => Number(p));
  const min = SPACEGASS_MIN_SUPPORTED_VERSION.split(".").map((p) => Number(p));
  for (let i = 0; i < 3; i++) {
    const a = parts[i] ?? 0;
    const b = min[i] ?? 0;
    if (a > b) return true;
    if (a < b) return false;
  }
  return true;
}

/**
 * Probe for SPACE GASS runtime via env only — never claims a binary exists in-repo.
 */
export function probeSpaceGassVersion(
  env: NodeJS.ProcessEnv = process.env,
): SpaceGassVersionProbeResult {
  const home = env.SPACEGASS_HOME?.trim();
  const api = env.SPACEGASS_API?.trim();
  const exe = env.SPACEGASS_EXECUTABLE?.trim() || env.SPACEGASS_EXE?.trim();
  const forcedVersion = env.SPACEGASS_VERSION?.trim();

  if (!home && !api && !exe) {
    return {
      ok: false,
      versionText: "unavailable",
      probeSource: "unavailable",
      errorCode: "solver_unavailable",
      detail:
        "No SPACEGASS_HOME / SPACEGASS_API / SPACEGASS_EXECUTABLE configured. No SPACE GASS SDK/binary is bundled in this repository.",
    };
  }

  const versionText = forcedVersion || "unknown";
  const versionNormalized = normalizeSpaceGassVersion(versionText);
  if (!versionNormalized) {
    return {
      ok: false,
      versionText,
      probeSource: exe
        ? "env_SPACEGASS_EXECUTABLE"
        : api
          ? "env_SPACEGASS_API"
          : "env_SPACEGASS_HOME",
      errorCode: "probe_failed",
      detail: "SPACEGASS_VERSION not parseable; set SPACEGASS_VERSION when runtime is present.",
    };
  }

  if (!isSpaceGassVersionSupported(versionNormalized)) {
    return {
      ok: false,
      versionText,
      versionNormalized,
      probeSource: exe
        ? "env_SPACEGASS_EXECUTABLE"
        : api
          ? "env_SPACEGASS_API"
          : "env_SPACEGASS_HOME",
      errorCode: "wrong_version",
      detail: `SPACE GASS ${versionNormalized} below minimum ${SPACEGASS_MIN_SUPPORTED_VERSION}`,
    };
  }

  return {
    ok: true,
    versionText,
    versionNormalized,
    probeSource: exe
      ? "env_SPACEGASS_EXECUTABLE"
      : api
        ? "env_SPACEGASS_API"
        : "env_SPACEGASS_HOME",
  };
}
