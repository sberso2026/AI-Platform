/**
 * Phase 13D — SPACE GASS live integration shared types / provenance labels.
 *
 * Official API: local SpaceGassApi.exe HTTP service (default :34560), OpenAPI
 * base path /api/v1, no per-request auth (license enforced server-side).
 */

export const SPACEGASS_LIVE_DEFAULT_HOST = "http://localhost:34560" as const;
export const SPACEGASS_LIVE_API_PREFIX = "/api/v1" as const;
export const SPACEGASS_LIVE_MIN_VERSION = "14.5" as const;

/** Environment modes for live integration honesty. */
export type SpaceGassLiveEnvironmentMode =
  | "local_engineering_workstation"
  | "controlled_execution_host"
  | "hosted_ci"
  | "remote_provider";

/**
 * Truth labels — never label fixture/export as LIVE MODEL.
 */
export type SpaceGassProvenanceLabel =
  | "LIVE MODEL"
  | "FEDERATED EXPORT"
  | "EXISTING RESULT"
  | "RTB EXECUTED RESULT";

export const SPACEGASS_PROVENANCE = {
  liveModel: "LIVE MODEL" as const,
  federatedExport: "FEDERATED EXPORT" as const,
  existingResult: "EXISTING RESULT" as const,
  rtbExecutedResult: "RTB EXECUTED RESULT" as const,
};

export type SpaceGassLiveHealthStatus =
  | "healthy"
  | "degraded"
  | "unavailable"
  | "license_unavailable"
  | "version_mismatch"
  | "unauthorized"
  | "unknown";

export type SpaceGassLiveHttpResult<T> =
  | { ok: true; status: number; data: T }
  | {
      ok: false;
      status: number;
      errorCode: string;
      detail: string;
      body?: unknown;
    };

export type SpaceGassServiceInfo = {
  baseUrl?: string;
  version?: string;
  spaceGassVersion?: string;
  productVersion?: string;
  [key: string]: unknown;
};

export type SpaceGassLicenseStatusDto = {
  isLicensed?: boolean;
  isRegistered?: boolean;
  organisation?: string;
  organization?: string;
  errorMessage?: string | null;
  modules?: string[];
  [key: string]: unknown;
};

export type SpaceGassJobStatusDto = {
  state?: { isOpen?: boolean; isModified?: boolean; isNew?: boolean };
  model?: {
    nodes?: number;
    members?: number;
    sections?: number;
    materials?: number;
    [key: string]: unknown;
  };
  analysis?: {
    hasStaticResults?: boolean;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

export type SpaceGassAnalysisRunDto = {
  id?: string;
  runId?: string;
  status?: string;
  state?: string;
  progress?: number;
  errorMessage?: string | null;
  [key: string]: unknown;
};
