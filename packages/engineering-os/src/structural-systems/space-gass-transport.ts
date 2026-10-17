import {
  D1G_R4_CANONICAL_BASE_URL,
  D1G_R4_DOCUMENTED_LOCALHOST_BASE_URL,
  D1G_R4_NATIVE_RESPONSE_SIZE_LIMIT_BYTES,
  D1G_R4_REQUEST_CONCURRENCY_LIMIT,
  D1G_R4_REQUEST_TIMEOUT_MS,
  D1G_R4_RETRY_LIMIT,
} from "@rtb/types";

/**
 * Local read transport for the documented SPACE GASS API v1 service.
 * Official base: http://localhost:34560/api/v1 from the authentication and versioning pages.
 * Paths below are the GET routes named by those pages and the concepts page.
 * Query result paths follow the documented Job.Query.Analysis.Static hierarchy
 * and the kebab-case style of /job/analysis/static/run-linear. Run, open, and save routes are absent.
 */

export const D1G_R4_ENDPOINT_ALLOWLIST = {
  JOB_UNITS: "/job/units",
  NODES: "/job/structure/nodes",
  MEMBERS: "/job/structure/members",
  NODE_RESTRAINTS: "/job/structure/node-restraints",
  LOAD_CASES: "/job/loads/load-cases",
  COMBINATION_LOAD_CASES: "/job/loads/combination-load-cases",
  RUN_STATUS: "/job/analysis/runs/{runId}",
  NODE_REACTIONS: "/job/query/analysis/static/node-reactions",
  MEMBER_INTERMEDIATE_FORCES: "/job/query/analysis/static/member-intermediate-forces",
} as const;

export type SpaceGassEndpointId = keyof typeof D1G_R4_ENDPOINT_ALLOWLIST;
export const D1G_R4_QUERY_PARAMETERS = ["LoadCases", "Members", "Nodes", "NodeType"] as const;
export const D1G_R4_REQUEST_TIMEOUT_CONTRACT = `EVERY_GET_ABORTS_AT_${D1G_R4_REQUEST_TIMEOUT_MS}_MS` as const;
export const D1G_R4_RETRY_POLICY = `GET_ONLY_MAX_${D1G_R4_RETRY_LIMIT}_RETRIES_FOR_TIMEOUT_OR_503_NO_RETRY_ON_OTHER_STATUS` as const;

const LIST_FILTER = /^[0-9]+(?:[,-][0-9]+)*$/;
const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);

export type SpaceGassHttpResponse = {
  status: number;
  headers: { get(name: string): string | null };
  body: Uint8Array | null;
};

export type SpaceGassFetch = (url: string, init: { method: "GET"; redirect: "manual"; signal: AbortSignal }) => Promise<SpaceGassHttpResponse>;

export type SpaceGassTransportConfig = {
  baseUrl?: string;
  loopbackPort?: number;
  timeoutMs?: number;
  maxResponseBytes?: number;
  fetchImpl?: SpaceGassFetch;
  liveEnabled?: boolean;
};

export type SpaceGassTransportError = { code: string; message: string };

let inFlight = 0;
const waiters: (() => void)[] = [];

export function validateSpaceGassBaseUrl(raw: string, loopbackPort?: number): { ok: true; baseUrl: string } | { ok: false; code: string } {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return { ok: false, code: "SOURCE_INVALID" };
  }
  if (parsed.username || parsed.password) return { ok: false, code: "SOURCE_INVALID" };
  if (parsed.hash) return { ok: false, code: "SOURCE_INVALID" };
  if (parsed.protocol !== "http:") return { ok: false, code: "SOURCE_INVALID" };
  if (parsed.search) return { ok: false, code: "SOURCE_INVALID" };
  const host = parsed.hostname.toLowerCase();
  if (!LOOPBACK_HOSTS.has(host)) return { ok: false, code: "SOURCE_INVALID" };
  const port = parsed.port === "" ? 80 : Number(parsed.port);
  const allowedPort = loopbackPort ?? 34560;
  if (!Number.isInteger(allowedPort) || allowedPort < 1 || allowedPort > 65535) return { ok: false, code: "SOURCE_INVALID" };
  if (port !== allowedPort) return { ok: false, code: "SOURCE_INVALID" };
  if (parsed.pathname.replace(/\/$/, "") !== "/api/v1") return { ok: false, code: "SOURCE_INVALID" };
  return { ok: true, baseUrl: `${parsed.origin}/api/v1` };
}

export function canonicalSpaceGassBaseUrl(): string {
  return D1G_R4_CANONICAL_BASE_URL;
}

export function documentedLocalhostBaseUrl(): string {
  return D1G_R4_DOCUMENTED_LOCALHOST_BASE_URL;
}

function queryFor(endpoint: SpaceGassEndpointId, query: Readonly<Record<string, string>>, runId?: string): { path: string } | { code: string } {
  if (endpoint === "RUN_STATUS") {
    if (!runId || !/^[0-9]+$/.test(runId)) return { code: "SOURCE_INVALID" };
    return { path: `/job/analysis/runs/${runId}` };
  }
  const path = D1G_R4_ENDPOINT_ALLOWLIST[endpoint];
  if (path.includes("{")) return { code: "SOURCE_INVALID" };
  for (const key of Object.keys(query)) {
    if (!D1G_R4_QUERY_PARAMETERS.includes(key as never)) return { code: "SOURCE_INVALID" };
    const value = query[key] ?? "";
    if (key === "NodeType" && value !== "Restrained") return { code: "SOURCE_INVALID" };
    if (key !== "NodeType" && !LIST_FILTER.test(value)) return { code: "SOURCE_INVALID" };
  }
  return { path };
}

async function acquire(): Promise<void> {
  if (inFlight < D1G_R4_REQUEST_CONCURRENCY_LIMIT) {
    inFlight += 1;
    return;
  }
  await new Promise<void>((resolve) => waiters.push(resolve));
  inFlight += 1;
}

function release(): void {
  inFlight -= 1;
  const next = waiters.shift();
  if (next) next();
}

export function spaceGassTransportInFlight(): number {
  return inFlight;
}

async function readOnce(fetchImpl: SpaceGassFetch, url: string, timeoutMs: number, maxBytes: number): Promise<{ ok: true; status: number; bytes: Uint8Array } | { ok: false; code: string; status?: number }> {
  const signal = AbortSignal.timeout(timeoutMs);
  let response: SpaceGassHttpResponse;
  try {
    response = await fetchImpl(url, { method: "GET", redirect: "manual", signal });
  } catch {
    return { ok: false, code: "PROVIDER_UNAVAILABLE" };
  }
  if (response.status >= 300 && response.status < 400) return { ok: false, code: "SOURCE_INVALID", status: response.status };
  if (response.status === 401) return { ok: false, code: "AUTHENTICATION_REQUIRED", status: response.status };
  if (response.status === 402 || response.status === 403) return { ok: false, code: "LICENSE_UNAVAILABLE", status: response.status };
  if (response.status === 409) return { ok: false, code: "MODEL_NOT_ANALYZED", status: response.status };
  if (response.status === 503) return { ok: false, code: "PROVIDER_UNAVAILABLE", status: response.status };
  if (response.status !== 200) return { ok: false, code: "SOURCE_INVALID", status: response.status };
  const declared = Number(response.headers.get("content-length") ?? "");
  if (Number.isFinite(declared) && declared > maxBytes) return { ok: false, code: "SOURCE_TOO_LARGE", status: response.status };
  const bytes = response.body ?? new Uint8Array();
  if (bytes.byteLength > maxBytes) return { ok: false, code: "SOURCE_TOO_LARGE", status: response.status };
  return { ok: true, status: response.status, bytes };
}

export async function readSpaceGassEndpoint(
  config: SpaceGassTransportConfig,
  endpoint: SpaceGassEndpointId,
  query: Readonly<Record<string, string>> = {},
  runId?: string,
): Promise<{ ok: true; endpoint: SpaceGassEndpointId; urlPath: string; bytes: Uint8Array } | SpaceGassTransportError> {
  if (config.liveEnabled !== true) return { code: "PROVIDER_UNAVAILABLE", message: "live local read is disabled" };
  const base = validateSpaceGassBaseUrl(config.baseUrl ?? D1G_R4_CANONICAL_BASE_URL, config.loopbackPort);
  if (!base.ok) return { code: base.code, message: "base url is outside the local read boundary" };
  const routed = queryFor(endpoint, query, runId);
  if ("code" in routed) return { code: routed.code, message: "query or endpoint is outside the allowlist" };
  const fetchImpl = config.fetchImpl;
  if (!fetchImpl) return { code: "PROVIDER_UNAVAILABLE", message: "no local read transport is configured" };
  const timeoutMs = config.timeoutMs ?? D1G_R4_REQUEST_TIMEOUT_MS;
  const maxBytes = config.maxResponseBytes ?? D1G_R4_NATIVE_RESPONSE_SIZE_LIMIT_BYTES;
  if (timeoutMs < 1 || maxBytes < 1 || maxBytes > D1G_R4_NATIVE_RESPONSE_SIZE_LIMIT_BYTES) {
    return { code: "SOURCE_INVALID", message: "timeout or response limit is outside the governed bound" };
  }
  const params = new URLSearchParams();
  for (const key of D1G_R4_QUERY_PARAMETERS) {
    if (query[key]) params.set(key, query[key]);
  }
  const suffix = params.size > 0 ? `?${params.toString()}` : "";
  const url = `${base.baseUrl}${routed.path}${suffix}`;
  await acquire();
  try {
    let attempt = 0;
    let last: { ok: false; code: string; status?: number } | null = null;
    while (attempt <= D1G_R4_RETRY_LIMIT) {
      const read = await readOnce(fetchImpl, url, timeoutMs, maxBytes);
      if (read.ok) return { ok: true, endpoint, urlPath: routed.path, bytes: read.bytes };
      last = read;
      const retry = read.code === "PROVIDER_UNAVAILABLE" && (read.status === 503 || read.status === undefined);
      if (!retry || attempt === D1G_R4_RETRY_LIMIT) break;
      attempt += 1;
    }
    return { code: last?.code ?? "PROVIDER_UNAVAILABLE", message: "local read failed closed" };
  } finally {
    release();
  }
}
