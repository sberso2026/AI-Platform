export type AdapterCompatibilityStatus = "NOT_CONFIGURED" | "CERTIFIED" | "NOT_CERTIFIED" | "INCOMPATIBLE";

function normalizeVersion(raw: string | null | undefined): string | null {
  if (!raw || !raw.trim()) return null;
  const m = raw.trim().match(/(\d+)(?:\.(\d+))?(?:\.(\d+))?/);
  if (!m) return raw.trim();
  return `${m[1]}.${m[2] ?? "0"}.${m[3] ?? "0"}`;
}

function majorMinor(version: string): string {
  const parts = version.split(".");
  return `${parts[0] ?? "0"}.${parts[1] ?? "0"}`;
}

/**
 * Machine-readable adapter/tool compatibility.
 * Fail closed when installed version is outside certified ranges.
 */
export function evaluateAdapterCompatibility(input: {
  installedVersion: string | null | undefined;
  compatibleToolVersions: string[];
  notCertifiedToolVersions: string[];
  minSupportedVersion?: string | null;
}): AdapterCompatibilityStatus {
  const installed = normalizeVersion(input.installedVersion);
  if (!installed) return "NOT_CONFIGURED";

  const blocked = input.notCertifiedToolVersions.some((prefix) => {
    const needle = prefix.replace(/\.x$/i, "").replace(/\*$/, "");
    return installed === needle || installed.startsWith(`${needle}.`);
  });
  if (blocked) return "INCOMPATIBLE";

  if (input.minSupportedVersion) {
    const min = normalizeVersion(input.minSupportedVersion);
    if (min) {
      const installedParts = installed.split(".").map((p) => Number(p) || 0);
      const minParts = min.split(".").map((p) => Number(p) || 0);
      for (let i = 0; i < Math.max(installedParts.length, minParts.length); i++) {
        if ((installedParts[i] ?? 0) < (minParts[i] ?? 0)) return "INCOMPATIBLE";
        if ((installedParts[i] ?? 0) > (minParts[i] ?? 0)) break;
      }
    }
  }

  if (input.compatibleToolVersions.length === 0) return "NOT_CERTIFIED";

  const certified = input.compatibleToolVersions.some((entry) => {
    const normalized = normalizeVersion(entry);
    if (!normalized) return false;
    return installed === normalized || majorMinor(installed) === majorMinor(normalized) || installed.startsWith(`${normalized}.`);
  });
  return certified ? "CERTIFIED" : "NOT_CERTIFIED";
}
