import {
  ALLOWED_GRAPH_HOSTS,
  ALLOWED_SHAREPOINT_HOST_SUFFIXES,
  MAX_CONTENT_BYTES,
  type GraphDriveItem,
} from "./types";

const PERSONAL_DRIVE_MARKERS = ["/me/drive", "/users/", "onedrive.live.com", "-my.sharepoint.com/personal/", "/personal/"];
const PERSONAL_MAIL_MARKERS = ["/me/messages", "/me/mailfolders", "/users/.*/messages"];
const SSRF_BLOCKED_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "169.254.169.254",
  "metadata.google.internal",
]);

export const CALLER_SUPPLIED_CONNECTOR_KEYS = ["tenantId", "workspaceId", "aal", "host", "baseUrl", "graphHost", "token", "accessToken", "refreshToken", "clientSecret"] as const;

export function rejectCallerConnectorClaims(body: Record<string, unknown>): string | null {
  for (const key of CALLER_SUPPLIED_CONNECTOR_KEYS) {
    if (key in body && body[key] != null && body[key] !== "") return "caller_supplied_authority_rejected";
  }
  return null;
}

export function assertNoSecretMaterialOnRecord(row: Record<string, unknown>): void {
  const forbidden = ["clientSecret", "client_secret", "refreshToken", "refresh_token", "accessToken", "access_token", "privateKey", "private_key", "certificatePem"];
  for (const key of forbidden) {
    if (typeof row[key] === "string" && String(row[key]).trim()) {
      throw new Error("connector_secret_forbidden_on_record");
    }
  }
}

export function isAllowedGraphUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;
    if (SSRF_BLOCKED_HOSTS.has(url.hostname.toLowerCase())) return false;
    if (url.hostname.endsWith(".internal") || url.hostname.endsWith(".local")) return false;
    return (ALLOWED_GRAPH_HOSTS as readonly string[]).includes(url.hostname.toLowerCase());
  } catch {
    return false;
  }
}

export function isGovernedSharePointWebUrl(value: string | null | undefined): boolean {
  if (!value) return false;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;
    const host = url.hostname.toLowerCase();
    if (SSRF_BLOCKED_HOSTS.has(host)) return false;
    return ALLOWED_SHAREPOINT_HOST_SUFFIXES.some((suffix) => host.endsWith(suffix.replace(/^\./, "")) || host.endsWith(suffix));
  } catch {
    return false;
  }
}

export function rejectArbitraryUrlFetch(callerUrl: unknown): string | null {
  if (typeof callerUrl === "string" && callerUrl.trim()) return "ARBITRARY_URL_FETCH_PROHIBITED";
  return null;
}

export function isPersonalOneDriveItem(item: Pick<GraphDriveItem, "driveType" | "webUrl" | "pathWithinRoot">): boolean {
  if (item.driveType === "personal") return true;
  const haystack = `${item.webUrl ?? ""} ${item.pathWithinRoot ?? ""}`.toLowerCase();
  return PERSONAL_DRIVE_MARKERS.some((marker) => haystack.includes(marker));
}

export function isPersonalGraphPath(path: string): boolean {
  const normalized = path.toLowerCase();
  return PERSONAL_DRIVE_MARKERS.some((marker) => normalized.includes(marker));
}

export function isPersonalMailPath(path: string): boolean {
  const normalized = path.toLowerCase();
  return PERSONAL_MAIL_MARKERS.some((marker) => new RegExp(marker).test(normalized));
}

export function assertApprovedGraphPath(path: string): void {
  if (isPersonalGraphPath(path) && path.toLowerCase().includes("/me/drive")) {
    throw new Error("PERSONAL_ONEDRIVE_ACCESS_PROHIBITED");
  }
  if (isPersonalMailPath(path)) {
    throw new Error("PERSONAL_EMAIL_ACCESS_PROHIBITED");
  }
}

export function itemWithinApprovedRoot(itemPath: string, approvedRootPath: string | null): boolean {
  if (!approvedRootPath) return true;
  const item = normalizePath(itemPath);
  const root = normalizePath(approvedRootPath);
  return item === root || item.startsWith(root.endsWith("/") ? root : `${root}/`);
}

export function normalizePath(path: string): string {
  return path.replace(/\\/g, "/").replace(/\/+/g, "/").replace(/\/$/, "").toLowerCase();
}

export function hasPathTraversal(path: string): boolean {
  return path.split(/[/\\]/).includes("..") || path.includes("%2e%2e");
}

export function assertContentSize(bytes: Uint8Array | Buffer): void {
  if (bytes.byteLength > MAX_CONTENT_BYTES) throw new Error("content_too_large");
}

export function validateRedirectLocation(location: string | null): boolean {
  if (!location) return true;
  if (location.startsWith("/")) return true;
  return isAllowedGraphUrl(location);
}
