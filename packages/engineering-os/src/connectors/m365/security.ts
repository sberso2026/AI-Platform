import {
  ALLOWED_GRAPH_HOSTS,
  ALLOWED_SHAREPOINT_HOST_SUFFIXES,
  MAX_CONTENT_BYTES,
  type GraphDriveItem,
} from "./types";
import {
  CALLER_SUPPLIED_CONNECTOR_CORE_KEYS,
  assertNoSecretMaterialOnRecord as assertNoSecretMaterialOnCoreRecord,
  isBlockedSsrfHost,
  rejectArbitraryUrlFetch,
  rejectCallerConnectorCoreClaims,
  validateRedirectLocation as validateCoreRedirect,
} from "../core/security";

const PERSONAL_DRIVE_MARKERS = ["/me/drive", "/users/", "onedrive.live.com", "-my.sharepoint.com/personal/", "/personal/"];
const PERSONAL_MAIL_MARKERS = ["/me/messages", "/me/mailfolders", "/users/.*/messages"];

export const CALLER_SUPPLIED_CONNECTOR_KEYS = CALLER_SUPPLIED_CONNECTOR_CORE_KEYS;

export function rejectCallerConnectorClaims(body: Record<string, unknown>): string | null {
  return rejectCallerConnectorCoreClaims(body);
}

export function assertNoSecretMaterialOnRecord(row: Record<string, unknown>): void {
  assertNoSecretMaterialOnCoreRecord(row);
}

export function isAllowedGraphUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;
    if (isBlockedSsrfHost(url.hostname)) return false;
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
    if (isBlockedSsrfHost(host)) return false;
    return ALLOWED_SHAREPOINT_HOST_SUFFIXES.some((suffix) => host.endsWith(suffix.replace(/^\./, "")) || host.endsWith(suffix));
  } catch {
    return false;
  }
}

export { rejectArbitraryUrlFetch };

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

export function itemBelongsToApprovedSharePointScope(
  item: { siteId?: string | null; driveId?: string | null },
  scope: { externalSiteId: string; externalDriveId: string },
): boolean {
  if (!item.driveId || item.driveId !== scope.externalDriveId) return false;
  const graphSiteId = item.siteId?.trim() ?? "";
  if (!graphSiteId) return true;
  if (microsoftSiteIdsMatch(graphSiteId, scope.externalSiteId)) return true;
  // Live Graph parentReference.siteId often uses a different encoding than the
  // onboarded Sites.Selected site id. Enumeration is already constrained to this drive.
  return true;
}

export function microsoftSiteIdsMatch(left: string, right: string): boolean {
  if (left === right) return true;
  const leftParts = splitMicrosoftSiteId(left);
  const rightParts = splitMicrosoftSiteId(right);
  if (!leftParts.length || !rightParts.length) return false;
  const rightSet = new Set(rightParts);
  return leftParts.some((part) => rightSet.has(part));
}

function splitMicrosoftSiteId(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[|,]/)
    .map((part) => part.trim())
    .filter((part) => part.length >= 8);
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
  return validateCoreRedirect(location, (value) => isAllowedGraphUrl(value) || isAllowedSharePointContentRedirect(value));
}

function isAllowedSharePointContentRedirect(value: string): boolean {
  if (!isGovernedSharePointWebUrl(value)) return false;
  return !isPersonalOneDriveItem({ driveType: "documentLibrary", webUrl: value, pathWithinRoot: value });
}
