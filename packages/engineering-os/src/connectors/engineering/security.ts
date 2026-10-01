import { ALLOWED_EXTERNAL_HOST_SUFFIXES, MAX_EXTERNAL_CONTENT_BYTES } from "./types";
import {
  CALLER_SUPPLIED_CONNECTOR_CORE_KEYS,
  assertContentSize as assertCoreContentSize,
  assertNoSecretMaterialOnRecord as assertNoSecretMaterialOnCoreRecord,
  connectorBackoff,
  isHttpsGovernedHost,
  rejectArbitraryUrlFetch,
  rejectCallerConnectorCoreClaims,
} from "../core/security";

export const CALLER_SUPPLIED_ENGINEERING_CONNECTOR_KEYS = CALLER_SUPPLIED_CONNECTOR_CORE_KEYS;

export function rejectCallerEngineeringConnectorClaims(body: Record<string, unknown>): string | null {
  return rejectCallerConnectorCoreClaims(body);
}

export function assertNoSecretMaterialOnRecord(row: Record<string, unknown>): void {
  assertNoSecretMaterialOnCoreRecord(row);
}

export { rejectArbitraryUrlFetch };

export function isGovernedExternalWebUrl(value: string | null | undefined): boolean {
  return isHttpsGovernedHost(value, ALLOWED_EXTERNAL_HOST_SUFFIXES);
}

export function assertContentSize(bytes: Uint8Array | Buffer): void {
  assertCoreContentSize(bytes, MAX_EXTERNAL_CONTENT_BYTES);
}

export function rejectPersonalIngestion(kind: string): string {
  if (kind === "email") return "PERSONAL_EMAIL_ACCESS_PROHIBITED";
  if (kind === "cloud_drive") return "PERSONAL_CLOUD_DRIVE_SCAN_PROHIBITED";
  return "PERSONAL_DATA_BOUNDARY";
}

export function backoff(retryCount: number, retryAfterHeaderMs?: number | null) {
  return connectorBackoff(retryCount, retryAfterHeaderMs);
}
