export const CONNECTOR_SSRF_BLOCKED_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "169.254.169.254",
  "metadata.google.internal",
]);

export const CALLER_SUPPLIED_CONNECTOR_CORE_KEYS = [
  "tenantId",
  "workspaceId",
  "aal",
  "host",
  "baseUrl",
  "graphHost",
  "token",
  "accessToken",
  "refreshToken",
  "clientSecret",
  "apiKey",
] as const;

const SECRET_KEYS = [
  "clientSecret",
  "client_secret",
  "refreshToken",
  "refresh_token",
  "accessToken",
  "access_token",
  "apiKey",
  "api_key",
  "privateKey",
  "private_key",
  "certificatePem",
  "password",
];

export function rejectCallerConnectorCoreClaims(body: Record<string, unknown>): string | null {
  for (const key of CALLER_SUPPLIED_CONNECTOR_CORE_KEYS) {
    if (key in body && body[key] != null && body[key] !== "") return "caller_supplied_authority_rejected";
  }
  return null;
}

export function assertNoSecretMaterialOnRecord(row: Record<string, unknown>): void {
  for (const key of SECRET_KEYS) {
    if (typeof row[key] === "string" && String(row[key]).trim()) {
      throw new Error("connector_secret_forbidden_on_record");
    }
  }
}

export function rejectArbitraryUrlFetch(callerUrl: unknown): string | null {
  if (typeof callerUrl === "string" && callerUrl.trim()) return "ARBITRARY_URL_FETCH_PROHIBITED";
  return null;
}

export function isBlockedSsrfHost(host: string): boolean {
  const normalized = host.toLowerCase();
  return CONNECTOR_SSRF_BLOCKED_HOSTS.has(normalized) || normalized.endsWith(".internal") || normalized.endsWith(".local");
}

export function isHttpsGovernedHost(value: string | null | undefined, suffixes: readonly string[]): boolean {
  if (!value) return false;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;
    const host = url.hostname.toLowerCase();
    if (isBlockedSsrfHost(host)) return false;
    return suffixes.some((suffix) => host === suffix.replace(/^\./, "") || host.endsWith(suffix));
  } catch {
    return false;
  }
}

export function validateRedirectLocation(location: string | null, allow: (value: string) => boolean): boolean {
  if (!location) return true;
  if (location.startsWith("/")) return true;
  return allow(location);
}

export function assertContentSize(bytes: Uint8Array | Buffer, maxBytes: number): void {
  if (bytes.byteLength > maxBytes) throw new Error("content_too_large");
}

export function connectorBackoff(retryCount: number, retryAfterHeaderMs?: number | null): number {
  if (typeof retryAfterHeaderMs === "number" && retryAfterHeaderMs > 0) {
    return Math.min(60_000, retryAfterHeaderMs);
  }
  return Math.min(60_000, 400 * 2 ** Math.min(retryCount, 6));
}

export function classifyConnectorFailure(kind: string): "AUTHENTICATION_REQUIRED" | "RATE_LIMITED" | "RESYNC_REQUIRED" | "DEGRADED" {
  if (kind === "AUTH") return "AUTHENTICATION_REQUIRED";
  if (kind === "THROTTLE") return "RATE_LIMITED";
  if (kind === "RESYNC") return "RESYNC_REQUIRED";
  return "DEGRADED";
}

export function observabilitySafe(metadata: Record<string, unknown>) {
  const copy = { ...metadata };
  for (const key of SECRET_KEYS) delete copy[key];
  delete copy.content;
  delete copy.contentBase64;
  delete copy.bytes;
  return copy;
}
