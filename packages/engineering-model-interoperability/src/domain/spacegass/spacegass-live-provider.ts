/**
 * Phase 13D — SPACEGASSLiveProvider
 *
 * Native TypeScript HTTP client for the official SPACE GASS local API
 * (SpaceGassApi.exe). Default base: http://localhost:34560 → /api/v1.
 * No Python SDK in the production path. No auth headers (license server-side).
 * Always close jobs. Fail closed when unreachable — never invent success.
 */

import {
  SPACEGASS_LIVE_API_PREFIX,
  SPACEGASS_LIVE_DEFAULT_HOST,
  type SpaceGassAnalysisRunDto,
  type SpaceGassJobStatusDto,
  type SpaceGassLicenseStatusDto,
  type SpaceGassLiveEnvironmentMode,
  type SpaceGassLiveHttpResult,
  type SpaceGassServiceInfo,
} from "./spacegass-live-types";

export type SPACEGASSLiveProviderOptions = {
  env?: NodeJS.ProcessEnv;
  /** Override fetch for unit tests. */
  fetchImpl?: typeof fetch;
  /** Request timeout ms (default 5000). */
  timeoutMs?: number;
};

export type SPACEGASSLiveProvider = {
  providerId: "spacegass_live_provider";
  apiBaseUrl: string;
  environmentMode: SpaceGassLiveEnvironmentMode;
  /** True when client code is present — not the same as LiveReady certification. */
  implementationPresent: true;
  resolveApiBaseUrl: () => string;
  getEnvironmentMode: () => SpaceGassLiveEnvironmentMode;
  request: <T = unknown>(
    method: string,
    path: string,
    body?: unknown,
  ) => Promise<SpaceGassLiveHttpResult<T>>;
  getServiceInfo: () => Promise<SpaceGassLiveHttpResult<SpaceGassServiceInfo>>;
  getLicenseStatus: () => Promise<
    SpaceGassLiveHttpResult<SpaceGassLicenseStatusDto>
  >;
  getJobStatus: () => Promise<SpaceGassLiveHttpResult<SpaceGassJobStatusDto>>;
  openJob: (filePath: string) => Promise<SpaceGassLiveHttpResult<unknown>>;
  openSample: (fileName: string) => Promise<SpaceGassLiveHttpResult<unknown>>;
  closeJob: () => Promise<SpaceGassLiveHttpResult<unknown>>;
  getNodes: () => Promise<SpaceGassLiveHttpResult<unknown[]>>;
  getMembers: () => Promise<SpaceGassLiveHttpResult<unknown[]>>;
  getSections: () => Promise<SpaceGassLiveHttpResult<unknown[]>>;
  getMaterials: () => Promise<SpaceGassLiveHttpResult<unknown[]>>;
  runLinearStatic: () => Promise<SpaceGassLiveHttpResult<SpaceGassAnalysisRunDto>>;
  getAnalysisRun: (
    runId: string,
  ) => Promise<SpaceGassLiveHttpResult<SpaceGassAnalysisRunDto>>;
  queryNodeReactions: () => Promise<SpaceGassLiveHttpResult<unknown>>;
  queryNodeDisplacements: () => Promise<SpaceGassLiveHttpResult<unknown>>;
  queryMemberEndForces: () => Promise<SpaceGassLiveHttpResult<unknown>>;
};

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

export function resolveSpaceGassApiBaseUrl(
  env: NodeJS.ProcessEnv = process.env,
): string {
  const raw =
    env.SPACEGASS_API_URL?.trim() ||
    env.SPACEGASS_API?.trim() ||
    SPACEGASS_LIVE_DEFAULT_HOST;
  const host = stripTrailingSlash(raw);
  if (host.endsWith(SPACEGASS_LIVE_API_PREFIX)) return host;
  return `${host}${SPACEGASS_LIVE_API_PREFIX}`;
}

export function resolveSpaceGassLiveEnvironmentMode(
  env: NodeJS.ProcessEnv = process.env,
): SpaceGassLiveEnvironmentMode {
  const forced = env.SPACEGASS_LIVE_ENVIRONMENT_MODE?.trim();
  if (
    forced === "local_engineering_workstation" ||
    forced === "controlled_execution_host" ||
    forced === "hosted_ci" ||
    forced === "remote_provider"
  ) {
    return forced;
  }
  if (env.GITHUB_ACTIONS === "true" || env.CI === "true") {
    return "hosted_ci";
  }
  if (env.SPACEGASS_CONTROLLED_HOST === "1") {
    return "controlled_execution_host";
  }
  if (env.SPACEGASS_REMOTE_PROVIDER === "1") {
    return "remote_provider";
  }
  return "local_engineering_workstation";
}

export function createSPACEGASSLiveProvider(
  options?: SPACEGASSLiveProviderOptions,
): SPACEGASSLiveProvider {
  const env = options?.env ?? process.env;
  const fetchImpl = options?.fetchImpl ?? globalThis.fetch.bind(globalThis);
  const timeoutMs = options?.timeoutMs ?? 5000;
  const apiBaseUrl = resolveSpaceGassApiBaseUrl(env);
  const environmentMode = resolveSpaceGassLiveEnvironmentMode(env);

  async function request<T = unknown>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<SpaceGassLiveHttpResult<T>> {
    if (typeof fetchImpl !== "function") {
      return {
        ok: false,
        status: 0,
        errorCode: "fetch_unavailable",
        detail: "fetch is not available in this runtime",
      };
    }
    const suffix = path.startsWith("/") ? path : `/${path}`;
    const url = `${apiBaseUrl}${suffix}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const init: RequestInit = {
        method,
        signal: controller.signal,
        headers: body
          ? { Accept: "application/json", "Content-Type": "application/json" }
          : { Accept: "application/json" },
      };
      if (body !== undefined) {
        init.body = JSON.stringify(body);
      }
      const res = await fetchImpl(url, init);
      const text = await res.text();
      let parsed: unknown = undefined;
      if (text) {
        try {
          parsed = JSON.parse(text);
        } catch {
          parsed = text;
        }
      }
      if (!res.ok) {
        const errObj =
          parsed && typeof parsed === "object"
            ? (parsed as Record<string, unknown>)
            : {};
        const errorCode =
          typeof errObj.errorCode === "string"
            ? errObj.errorCode
            : res.status === 403
              ? "unauthorized"
              : res.status === 404
                ? "not_found"
                : "http_error";
        return {
          ok: false,
          status: res.status,
          errorCode,
          detail:
            (typeof errObj.detail === "string" && errObj.detail) ||
            (typeof errObj.title === "string" && errObj.title) ||
            `SPACE GASS API ${method} ${suffix} → HTTP ${res.status}`,
          body: parsed,
        };
      }
      return { ok: true, status: res.status, data: parsed as T };
    } catch (e) {
      const name = e instanceof Error ? e.name : "Error";
      const message = e instanceof Error ? e.message : String(e);
      const aborted = name === "AbortError" || /aborted|timeout/i.test(message);
      return {
        ok: false,
        status: 0,
        errorCode: aborted ? "timeout" : "unreachable",
        detail: aborted
          ? `SPACE GASS API timed out after ${timeoutMs}ms (${url})`
          : `SPACE GASS API unreachable: ${message} (${url})`,
      };
    } finally {
      clearTimeout(timer);
    }
  }

  const provider: SPACEGASSLiveProvider = {
    providerId: "spacegass_live_provider",
    apiBaseUrl,
    environmentMode,
    implementationPresent: true,
    resolveApiBaseUrl: () => apiBaseUrl,
    getEnvironmentMode: () => environmentMode,
    request,
    getServiceInfo: () => request<SpaceGassServiceInfo>("GET", "/service/info"),
    getLicenseStatus: () =>
      request<SpaceGassLicenseStatusDto>("GET", "/license/status"),
    getJobStatus: () => request<SpaceGassJobStatusDto>("GET", "/job/status"),
    openJob: (filePath: string) =>
      request("POST", "/job/open", { filePath }),
    openSample: (fileName: string) =>
      request("POST", "/job/open-sample", { fileName }),
    closeJob: () => request("POST", "/job/close"),
    getNodes: async () => {
      const r = await request<unknown>("GET", "/job/structure/nodes");
      if (!r.ok) return r as SpaceGassLiveHttpResult<unknown[]>;
      const data = Array.isArray(r.data)
        ? r.data
        : Array.isArray((r.data as { items?: unknown[] })?.items)
          ? ((r.data as { items: unknown[] }).items)
          : [];
      return { ok: true, status: r.status, data };
    },
    getMembers: async () => {
      const r = await request<unknown>("GET", "/job/structure/members");
      if (!r.ok) return r as SpaceGassLiveHttpResult<unknown[]>;
      const data = Array.isArray(r.data)
        ? r.data
        : Array.isArray((r.data as { items?: unknown[] })?.items)
          ? ((r.data as { items: unknown[] }).items)
          : [];
      return { ok: true, status: r.status, data };
    },
    getSections: async () => {
      const r = await request<unknown>("GET", "/job/structure/sections");
      if (!r.ok) return r as SpaceGassLiveHttpResult<unknown[]>;
      const data = Array.isArray(r.data)
        ? r.data
        : Array.isArray((r.data as { items?: unknown[] })?.items)
          ? ((r.data as { items: unknown[] }).items)
          : [];
      return { ok: true, status: r.status, data };
    },
    getMaterials: async () => {
      const r = await request<unknown>("GET", "/job/structure/materials");
      if (!r.ok) return r as SpaceGassLiveHttpResult<unknown[]>;
      const data = Array.isArray(r.data)
        ? r.data
        : Array.isArray((r.data as { items?: unknown[] })?.items)
          ? ((r.data as { items: unknown[] }).items)
          : [];
      return { ok: true, status: r.status, data };
    },
    runLinearStatic: () =>
      request<SpaceGassAnalysisRunDto>(
        "POST",
        "/job/analysis/static/run-linear",
      ),
    getAnalysisRun: (runId: string) =>
      request<SpaceGassAnalysisRunDto>(
        "GET",
        `/job/analysis/runs/${encodeURIComponent(runId)}`,
      ),
    queryNodeReactions: () =>
      request("GET", "/job/query/analysis/static/node-reactions"),
    queryNodeDisplacements: () =>
      request("GET", "/job/query/analysis/static/node-displacements"),
    queryMemberEndForces: () =>
      request("GET", "/job/query/analysis/static/member-end-forces"),
  };

  return provider;
}
