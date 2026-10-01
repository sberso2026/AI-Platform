import { ALLOWED_EXTERNAL_HOST_SUFFIXES, MAX_EXTERNAL_CONTENT_BYTES } from "./types";

const SSRF_BLOCKED_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "169.254.169.254",
  "metadata.google.internal",
]);

export const CALLER_SUPPLIED_ENGINEERING_CONNECTOR_KEYS = [
  "tenantId",
  "workspaceId",
  "aal",
  "host",
  "baseUrl",
  "token",
  "accessToken",
  "refreshToken",
  "clientSecret",
  "apiKey",
] as const;

export function rejectCallerEngineeringConnectorClaims(body: Record<string, unknown>): string | null {
  for (const key of CALLER_SUPPLIED_ENGINEERING_CONNECTOR_KEYS) {
    if (key in body && body[key] != null && body[key] !== "") return "caller_supplied_authority_rejected";
  }
  return null;
}

export function assertNoSecretMaterialOnRecord(row: Record<string, unknown>): void {
  const forbidden = ["clientSecret", "client_secret", "refreshToken", "accessToken", "apiKey", "api_key", "privateKey", "password"];
  for (const key of forbidden) {
    if (typeof row[key] === "string" && String(row[key]).trim()) {
      throw new Error("connector_secret_forbidden_on_record");
    }
  }
}

export function rejectArbitraryUrlFetch(callerUrl: unknown): string | null {
  if (typeof callerUrl === "string" && callerUrl.trim()) return "ARBITRARY_URL_FETCH_PROHIBITED";
  return null;
}

export function isGovernedExternalWebUrl(value: string | null | undefined): boolean {
  if (!value) return false;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;
    const host = url.hostname.toLowerCase();
    if (SSRF_BLOCKED_HOSTS.has(host)) return false;
    if (host.endsWith(".internal") || host.endsWith(".local")) return false;
    return ALLOWED_EXTERNAL_HOST_SUFFIXES.some((suffix) => host === suffix.replace(/^\./, "") || host.endsWith(suffix));
  } catch {
    return false;
  }
}

export function assertContentSize(bytes: Uint8Array | Buffer): void {
  if (bytes.byteLength > MAX_EXTERNAL_CONTENT_BYTES) throw new Error("content_too_large");
}

export function rejectPersonalIngestion(kind: string): string {
  if (kind === "email") return "PERSONAL_EMAIL_ACCESS_PROHIBITED";
  if (kind === "cloud_drive") return "PERSONAL_CLOUD_DRIVE_SCAN_PROHIBITED";
  return "PERSONAL_DATA_BOUNDARY";
}

export function backoff(retryCount: number) {
  return Math.min(60_000, 400 * 2 ** Math.min(retryCount, 6));
}
