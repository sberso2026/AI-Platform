/**
 * Phase 13D — Real SPACE GASS live health probe.
 *
 * Not static config alone: reachable → version → license/session → model readiness.
 * Maps to healthy | degraded | unavailable | license_unavailable | version_mismatch |
 * unauthorized | unknown.
 */

import {
  createSPACEGASSLiveProvider,
  type SPACEGASSLiveProvider,
  type SPACEGASSLiveProviderOptions,
} from "./spacegass-live-provider";
import {
  SPACEGASS_LIVE_MIN_VERSION,
  type SpaceGassLiveEnvironmentMode,
  type SpaceGassLiveHealthStatus,
  type SpaceGassProvenanceLabel,
} from "./spacegass-live-types";
import {
  isSpaceGassVersionSupported,
  normalizeSpaceGassVersion,
} from "./spacegass-version";

export type SpaceGassLiveHealthReport = {
  status: SpaceGassLiveHealthStatus;
  checkedAt: string;
  apiBaseUrl: string;
  environmentMode: SpaceGassLiveEnvironmentMode;
  reachable: boolean;
  versionText?: string;
  versionNormalized?: string;
  versionOk: boolean;
  licenseOk: boolean;
  licenseDetail?: string;
  modelReady: boolean;
  modelDetail?: string;
  liveSessionProven: boolean;
  /** Certification Ready requires proven live session — never set from code-exists alone. */
  SPACEGASSLiveProviderReady: boolean;
  detail: string;
  correctiveFindings: string[];
  provenanceNeverLiveFromFixture: true;
  serviceInfoError?: string;
  licenseError?: string;
};

function extractVersionText(info: Record<string, unknown> | undefined): string {
  if (!info) return "";
  for (const key of [
    "spaceGassVersion",
    "productVersion",
    "version",
    "Version",
    "build",
  ]) {
    const v = info[key];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "";
}

/**
 * Probe live API. Fail-closed when unreachable — never invent healthy.
 */
export async function probeSpaceGassLiveHealth(
  options?: SPACEGASSLiveProviderOptions & { provider?: SPACEGASSLiveProvider },
): Promise<SpaceGassLiveHealthReport> {
  const checkedAt = new Date().toISOString();
  const provider =
    options?.provider ?? createSPACEGASSLiveProvider(options);
  const correctiveFindings: string[] = [];
  const apiBaseUrl = provider.resolveApiBaseUrl();
  const environmentMode = provider.getEnvironmentMode();

  const service = await provider.getServiceInfo();
  if (!service.ok) {
    const status: SpaceGassLiveHealthStatus =
      service.errorCode === "unauthorized" ? "unauthorized" : "unavailable";
    correctiveFindings.push(
      "Start SpaceGassApi.exe on an engineering workstation or controlled host (SPACE GASS 14.5+ licensed).",
    );
    correctiveFindings.push(
      `Ensure HTTP API is listening (default ${apiBaseUrl.replace(/\/api\/v1$/, "")}).`,
    );
    correctiveFindings.push(
      "GitHub-hosted CI cannot certify live SPACE GASS; use controlled_execution_host evidence.",
    );
    return {
      status,
      checkedAt,
      apiBaseUrl,
      environmentMode,
      reachable: false,
      versionOk: false,
      licenseOk: false,
      modelReady: false,
      liveSessionProven: false,
      SPACEGASSLiveProviderReady: false,
      detail: service.detail,
      correctiveFindings,
      provenanceNeverLiveFromFixture: true,
      serviceInfoError: service.detail,
    };
  }

  const versionText = extractVersionText(
    service.data as Record<string, unknown>,
  );
  const versionNormalized = versionText
    ? normalizeSpaceGassVersion(versionText)
    : undefined;
  // Live path requires 14.5+; reuse numeric compare helper with live min.
  let versionOk = false;
  if (versionNormalized) {
    const parts = versionNormalized.split(".").map((p) => Number(p));
    const min = SPACEGASS_LIVE_MIN_VERSION.split(".").map((p) => Number(p));
    versionOk = true;
    for (let i = 0; i < 3; i++) {
      const a = parts[i] ?? 0;
      const b = min[i] ?? 0;
      if (a > b) break;
      if (a < b) {
        versionOk = false;
        break;
      }
    }
    // Also satisfy older helper floor if configured higher later.
    if (versionOk && !isSpaceGassVersionSupported(versionNormalized)) {
      versionOk = false;
    }
  }

  if (!versionOk) {
    correctiveFindings.push(
      `SPACE GASS API version must be >= ${SPACEGASS_LIVE_MIN_VERSION} (observed: ${versionText || "unknown"}).`,
    );
    return {
      status: "version_mismatch",
      checkedAt,
      apiBaseUrl,
      environmentMode,
      reachable: true,
      versionText: versionText || undefined,
      versionNormalized,
      versionOk: false,
      licenseOk: false,
      modelReady: false,
      liveSessionProven: false,
      SPACEGASSLiveProviderReady: false,
      detail: `version_mismatch:${versionText || "unknown"}`,
      correctiveFindings,
      provenanceNeverLiveFromFixture: true,
    };
  }

  const license = await provider.getLicenseStatus();
  let licenseOk = false;
  let licenseDetail: string | undefined;
  if (!license.ok) {
    licenseDetail = license.detail;
    if (license.status === 403 || license.errorCode === "unauthorized") {
      correctiveFindings.push(
        "License/registration refused by SPACE GASS API (403). Acquire CORE + API module license.",
      );
      return {
        status: "unauthorized",
        checkedAt,
        apiBaseUrl,
        environmentMode,
        reachable: true,
        versionText,
        versionNormalized,
        versionOk: true,
        licenseOk: false,
        licenseDetail,
        modelReady: false,
        liveSessionProven: false,
        SPACEGASSLiveProviderReady: false,
        detail: license.detail,
        correctiveFindings,
        provenanceNeverLiveFromFixture: true,
        licenseError: license.detail,
      };
    }
    correctiveFindings.push(
      "Could not read /license/status — treat as license_unavailable.",
    );
    return {
      status: "license_unavailable",
      checkedAt,
      apiBaseUrl,
      environmentMode,
      reachable: true,
      versionText,
      versionNormalized,
      versionOk: true,
      licenseOk: false,
      licenseDetail,
      modelReady: false,
      liveSessionProven: false,
      SPACEGASSLiveProviderReady: false,
      detail: license.detail,
      correctiveFindings,
      provenanceNeverLiveFromFixture: true,
      licenseError: license.detail,
    };
  } else {
    const dto = license.data;
    licenseOk = dto.isLicensed === true;
    licenseDetail =
      (typeof dto.errorMessage === "string" && dto.errorMessage) ||
      (licenseOk
        ? "licensed"
        : "API reachable but isLicensed!=true");
    if (!licenseOk) {
      correctiveFindings.push(
        "SPACE GASS API reports unlicensed / incomplete license. Install licensed SPACE GASS 14.5+ with API module.",
      );
      return {
        status: "license_unavailable",
        checkedAt,
        apiBaseUrl,
        environmentMode,
        reachable: true,
        versionText,
        versionNormalized,
        versionOk: true,
        licenseOk: false,
        licenseDetail,
        modelReady: false,
        liveSessionProven: false,
        SPACEGASSLiveProviderReady: false,
        detail: licenseDetail,
        correctiveFindings,
        provenanceNeverLiveFromFixture: true,
      };
    }
  }

  // Model readiness: job may be closed (ok for health) — degraded if no job open.
  const job = await provider.getJobStatus();
  let modelReady = false;
  let modelDetail: string | undefined;
  if (job.ok) {
    modelReady = job.data.state?.isOpen === true;
    modelDetail = modelReady
      ? "job_open"
      : "api_healthy_no_job_open";
  } else if (job.status === 404) {
    modelReady = false;
    modelDetail = "no_job_open";
  } else {
    modelDetail = job.detail;
  }

  const liveSessionProven = true; // service+license proven
  const status: SpaceGassLiveHealthStatus = modelReady
    ? "healthy"
    : "degraded";

  return {
    status,
    checkedAt,
    apiBaseUrl,
    environmentMode,
    reachable: true,
    versionText,
    versionNormalized,
    versionOk: true,
    licenseOk: true,
    licenseDetail,
    modelReady,
    modelDetail,
    liveSessionProven,
    // Ready flags still require cert artifact evidence of live federation/execution.
    SPACEGASSLiveProviderReady: liveSessionProven,
    detail:
      status === "healthy"
        ? "SPACE GASS live API healthy with open job"
        : "SPACE GASS live API licensed/reachable; no open job (degraded)",
    correctiveFindings:
      status === "degraded"
        ? [
            "Open a .sg job (POST /job/open or /job/open-sample) before live federation/execution certification.",
          ]
        : [],
    provenanceNeverLiveFromFixture: true,
  };
}

export function provenanceLabelForFederationSource(
  source: "live_api" | "export_fixture",
): SpaceGassProvenanceLabel {
  return source === "live_api" ? "LIVE MODEL" : "FEDERATED EXPORT";
}
