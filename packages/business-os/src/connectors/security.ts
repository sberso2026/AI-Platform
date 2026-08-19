import type { BosConnectorId } from "@rtb/types";
import { BOS_CONNECTOR_APPROVED_HOSTS } from "./catalog";

export const SECRET_FIELD_NAMES = [
  "secret",
  "token",
  "accessToken",
  "access_token",
  "refreshToken",
  "refresh_token",
  "clientSecret",
  "client_secret",
  "password",
  "apiKey",
  "api_key",
  "bearer",
  "authorization",
  "privateKey",
  "private_key",
] as const;

const PRIVATE_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "metadata.google.internal",
  "169.254.169.254",
]);

export function containsSecretFields(input: Record<string, unknown>): boolean {
  const keys = Object.keys(input).map((key) => key.toLowerCase());
  return SECRET_FIELD_NAMES.some((name) => keys.includes(name.toLowerCase()));
}

export function redactSecrets<T>(value: T): T {
  if (value == null) return value;
  if (typeof value === "string") {
    if (/bearer\s+\S+/i.test(value) || /sk_live|xox[baprs]-|eyJ[A-Za-z0-9_-]+\./.test(value)) {
      return "[redacted]" as T;
    }
    return value;
  }
  if (Array.isArray(value)) return value.map((item) => redactSecrets(item)) as T;
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      if (SECRET_FIELD_NAMES.some((name) => name.toLowerCase() === key.toLowerCase())) {
        out[key] = "[redacted]";
      } else {
        out[key] = redactSecrets(item);
      }
    }
    return out as T;
  }
  return value;
}

export function assertNoInlineSecrets(input: Record<string, unknown>): void {
  if (containsSecretFields(input)) throw new Error("secret_redaction_required");
}

export function assertConnectorUrl(connectorId: BosConnectorId, raw: string): URL {
  if (!raw || typeof raw !== "string") throw new Error("unrestricted_external_proxy_forbidden");
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("unrestricted_external_proxy_forbidden");
  }
  if (url.protocol !== "https:") throw new Error("unrestricted_external_proxy_forbidden");
  const host = url.hostname.toLowerCase();
  if (PRIVATE_HOSTS.has(host) || host.endsWith(".local") || host.endsWith(".internal")) {
    throw new Error("unrestricted_external_proxy_forbidden");
  }
  if (/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(host)) {
    throw new Error("unrestricted_external_proxy_forbidden");
  }
  if (connectorId === "csv_excel") throw new Error("unrestricted_external_proxy_forbidden");
  const allowed = BOS_CONNECTOR_APPROVED_HOSTS[connectorId];
  if (!allowed?.includes(host)) throw new Error("unrestricted_external_proxy_forbidden");
  return url;
}

export function sanitizeSpreadsheetCell(value: string): string {
  const trimmed = value.replace(/^\uFEFF/, "");
  if (/^[=+\-@\t\r]/.test(trimmed)) return `'${trimmed}`;
  return trimmed;
}
