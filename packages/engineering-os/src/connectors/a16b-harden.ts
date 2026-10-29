/**
 * EOS-A16B HARDEN freeze.
 * Bounded scanner + SharePoint read-only hardening. Does not reopen V5B or start PROVE.
 */

import { DEFAULT_CONNECTOR_WRITE_POLICY } from "./core/types";
import { PUBLIC_BUCKET_FORBIDDEN } from "../artifact-automation/binary-store";
import { SHAREPOINT_PILOT_MODE, SHAREPOINT_PILOT_WRITE_ENABLED } from "./m365/live-readiness";

export const A16B_PHASE = "HARDEN" as const;
export const A16B_V5B_REOPEN = false;
export const A16B_A16A_COMMIT = "bfc366c35aa5b0156287ea17c155b693f6ef4254";

export const A16B_SCANNER_SECURITY_MODEL = {
  endpointSource: "RTB_REVIEW_CLAMAV_URL server-side env only",
  hostedTlsRequired: true,
  hostedAuthRequired: true,
  authModel: "Authorization Bearer RTB_REVIEW_CLAMAV_AUTH_TOKEN",
  secretSource: "server-side process env RTB_REVIEW_CLAMAV_AUTH_TOKEN",
  localDevException: "loopback HTTP without bearer for clamav-http-bridge",
  publicScanner: "PROHIBITED",
  callerSuppliedUrl: "PROHIBITED",
  redirectPolicy: "FAIL_CLOSED_NO_FOLLOW",
  timeoutMs: 8_000,
  maxScanBytes: 25 * 1024 * 1024,
  maxResponseBytes: 8_192,
} as const;

export const A16B_RETURNED_ARTIFACT_FLOW = "DISABLED" as const;
export const A16B_OFFICE_INSPECTION_OBJECT_STORAGE_ADAPTER = "DEFERRED" as const;

export const A16B_RETRY_POLICY = {
  authDenied: "NO_RETRY",
  throttle: "BOUNDED_BACKOFF",
  network: "BOUNDED_BACKOFF",
  writes: "NOT_ENABLED_FOR_PILOT",
} as const;

export function a16bHardenAssertions() {
  if (SHAREPOINT_PILOT_MODE !== "READ_ONLY") throw new Error("sharepoint_pilot_mode_regressed");
  if (SHAREPOINT_PILOT_WRITE_ENABLED !== false) throw new Error("sharepoint_write_enabled");
  if (DEFAULT_CONNECTOR_WRITE_POLICY !== "READ_ONLY") throw new Error("write_policy_regressed");
  if (PUBLIC_BUCKET_FORBIDDEN !== true) throw new Error("public_bucket_regressed");
  return {
    phase: A16B_PHASE,
    sharePointPilotMode: SHAREPOINT_PILOT_MODE,
    returnedArtifactFlow: A16B_RETURNED_ARTIFACT_FLOW,
    officeInspectionAdapter: A16B_OFFICE_INSPECTION_OBJECT_STORAGE_ADAPTER,
  } as const;
}
