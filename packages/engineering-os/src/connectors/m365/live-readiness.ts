/**
 * EOS-A16B SharePoint live-read configuration readiness.
 * Does not enable write-back or invent live Graph credentials.
 */

import { rejectArbitraryUrlFetch, rejectCallerConnectorCoreClaims } from "../core/security";
import { DEFAULT_CONNECTOR_WRITE_POLICY } from "../core/types";
import { MICROSOFT_PERMISSION_MODEL, type M365Connection, type SharePointScope } from "./types";

export const SHAREPOINT_PILOT_MODE = "READ_ONLY" as const;
export const SHAREPOINT_PILOT_WRITE_ENABLED = false as const;

export const SHAREPOINT_LIVE_READINESS = [
  "CONFIG_VALID",
  "CONFIG_MISSING",
  "CREDENTIAL_MISSING",
  "SITE_NOT_ALLOWLISTED",
  "AUTH_FAILED",
  "SOURCE_UNAVAILABLE",
  "PERMISSION_DENIED",
  "READY_FOR_LIVE_READ",
] as const;
export type SharePointLiveReadiness = (typeof SHAREPOINT_LIVE_READINESS)[number];

export const SHAREPOINT_REQUIRED_LIVE_PERMISSIONS = {
  application: "Sites.Selected",
  siteGrant: "read",
  notRequired: MICROSOFT_PERMISSION_MODEL.notRequired,
  writeForPilot: "DISABLED",
} as const;

export type SharePointLiveReadinessInput = {
  connection?: Pick<M365Connection, "microsoftTenantId" | "applicationId" | "credentialSecretId" | "enabled"> | null;
  scope?: Pick<SharePointScope, "externalSiteId" | "externalDriveId"> | null;
  repositoryEnabled?: boolean;
  repositoryAllowlisted?: boolean;
  secretValuePresent?: boolean | null;
  graphTest?: { ok: boolean; status: string; message: string } | null;
  callerBody?: Record<string, unknown> | null;
};

export type SharePointLiveReadinessResult = {
  status: SharePointLiveReadiness;
  writeEnabled: false;
  secretsExposed: false;
  permissionModel: typeof SHAREPOINT_REQUIRED_LIVE_PERMISSIONS.application;
  reasons: string[];
};

export function sharePointPilotWriteEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.EOS_SHAREPOINT_PILOT_WRITE === "1";
}

export function validateSharePointLiveReadConfig(input: {
  microsoftTenantId?: string | null;
  applicationId?: string | null;
  credentialSecretId?: string | null;
  externalSiteId?: string | null;
  externalDriveId?: string | null;
  graphUrl?: unknown;
  accessToken?: unknown;
  url?: unknown;
}): { ok: boolean; status: SharePointLiveReadiness; reason: string } {
  if (rejectArbitraryUrlFetch(input.graphUrl ?? input.url)) {
    return { ok: false, status: "CONFIG_MISSING", reason: "ARBITRARY_URL_FETCH_PROHIBITED" };
  }
  if (typeof input.accessToken === "string" && input.accessToken.trim()) {
    return { ok: false, status: "AUTH_FAILED", reason: "caller_supplied_token_rejected" };
  }
  if (!input.microsoftTenantId?.trim() || !input.applicationId?.trim()) {
    return { ok: false, status: "CONFIG_MISSING", reason: "tenant_or_application_missing" };
  }
  if (!input.credentialSecretId?.trim()) {
    return { ok: false, status: "CREDENTIAL_MISSING", reason: "credential_secret_id_missing" };
  }
  if (!input.externalSiteId?.trim() || !input.externalDriveId?.trim()) {
    return { ok: false, status: "SITE_NOT_ALLOWLISTED", reason: "site_or_drive_missing" };
  }
  return { ok: true, status: "CONFIG_VALID", reason: "config_valid" };
}

export function evaluateSharePointLiveReadiness(input: SharePointLiveReadinessInput): SharePointLiveReadinessResult {
  const reasons: string[] = [];
  const writeEnabled = false as const;
  if (input.callerBody) {
    const rejected = rejectCallerConnectorCoreClaims(input.callerBody) ?? rejectArbitraryUrlFetch(input.callerBody.url);
    if (rejected) {
      return {
        status: "AUTH_FAILED",
        writeEnabled,
        secretsExposed: false,
        permissionModel: "Sites.Selected",
        reasons: [rejected],
      };
    }
  }
  const connection = input.connection;
  if (!connection?.microsoftTenantId?.trim() || !connection.applicationId?.trim()) {
    return {
      status: "CONFIG_MISSING",
      writeEnabled,
      secretsExposed: false,
      permissionModel: "Sites.Selected",
      reasons: ["connection_incomplete"],
    };
  }
  if (!connection.credentialSecretId?.trim() || input.secretValuePresent === false) {
    return {
      status: "CREDENTIAL_MISSING",
      writeEnabled,
      secretsExposed: false,
      permissionModel: "Sites.Selected",
      reasons: ["credential_missing"],
    };
  }
  if (!input.repositoryAllowlisted || !input.repositoryEnabled || !input.scope?.externalSiteId?.trim() || !input.scope.externalDriveId?.trim()) {
    return {
      status: "SITE_NOT_ALLOWLISTED",
      writeEnabled,
      secretsExposed: false,
      permissionModel: "Sites.Selected",
      reasons: ["repository_not_allowlisted"],
    };
  }
  const validated = validateSharePointLiveReadConfig({
    microsoftTenantId: connection.microsoftTenantId,
    applicationId: connection.applicationId,
    credentialSecretId: connection.credentialSecretId,
    externalSiteId: input.scope.externalSiteId,
    externalDriveId: input.scope.externalDriveId,
  });
  if (!validated.ok) {
    return {
      status: validated.status,
      writeEnabled,
      secretsExposed: false,
      permissionModel: "Sites.Selected",
      reasons: [validated.reason],
    };
  }
  if (!input.graphTest) {
    return {
      status: "CONFIG_VALID",
      writeEnabled,
      secretsExposed: false,
      permissionModel: "Sites.Selected",
      reasons: ["graph_not_probed"],
    };
  }
  if (input.graphTest.ok) {
    return {
      status: "READY_FOR_LIVE_READ",
      writeEnabled,
      secretsExposed: false,
      permissionModel: "Sites.Selected",
      reasons: ["graph_credential_accepted", `write_policy:${DEFAULT_CONNECTOR_WRITE_POLICY}`],
    };
  }
  const message = input.graphTest.message.toLowerCase();
  const status = input.graphTest.status;
  if (status === "AUTHENTICATION_REQUIRED" || message.includes("token") || message.includes("invalid_client") || message.includes("secret_unavailable")) {
    reasons.push("auth_failed");
    return { status: "AUTH_FAILED", writeEnabled, secretsExposed: false, permissionModel: "Sites.Selected", reasons };
  }
  if (message.includes("forbidden") || message.includes("permission")) {
    return { status: "PERMISSION_DENIED", writeEnabled, secretsExposed: false, permissionModel: "Sites.Selected", reasons: ["permission_denied"] };
  }
  return { status: "SOURCE_UNAVAILABLE", writeEnabled, secretsExposed: false, permissionModel: "Sites.Selected", reasons: ["source_unavailable"] };
}

export function liveSharePointExternalTestState(): "BLOCKED_EXTERNAL_CONFIGURATION" {
  return "BLOCKED_EXTERNAL_CONFIGURATION";
}
