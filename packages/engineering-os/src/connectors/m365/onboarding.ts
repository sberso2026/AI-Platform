/**
 * EOS-A16C production Microsoft 365 self-service onboarding.
 * MODE A: RTB-managed multitenant application. Microsoft remains optional.
 * Does not create ConnectorV2 or persist raw secrets.
 */

import { observabilitySafe, rejectCallerConnectorCoreClaims, rejectArbitraryUrlFetch } from "../core/security";
import { DEFAULT_CONNECTOR_WRITE_POLICY } from "../core/types";
import { SHAREPOINT_PILOT_MODE, SHAREPOINT_PILOT_WRITE_ENABLED } from "./live-readiness";
import { isGovernedSharePointWebUrl } from "./security";
import { MICROSOFT_PERMISSION_MODEL } from "./types";

export const M365_CONNECTION_MODES = ["RTB_MANAGED_MICROSOFT", "ENTERPRISE_MANAGED_MICROSOFT", "NO_MICROSOFT"] as const;
export type M365ConnectionMode = (typeof M365_CONNECTION_MODES)[number];
export const DEFAULT_M365_CONNECTION_MODE: M365ConnectionMode = "RTB_MANAGED_MICROSOFT";
export const ENTERPRISE_MANAGED_MODE_STATUS = "ARCHITECTURAL_EXTENSION" as const;

export const M365_SETUP_STATES = [
  "NOT_CONNECTED",
  "MICROSOFT_SIGN_IN_REQUIRED",
  "ADMIN_CONSENT_REQUIRED",
  "CONNECTED_NO_SITE",
  "SITE_PERMISSION_REQUIRED",
  "SITE_CONNECTED",
  "LIBRARY_SELECTION_REQUIRED",
  "VALIDATING",
  "READY",
  "AUTH_EXPIRED",
  "PERMISSION_REVOKED",
  "CONNECTION_ERROR",
] as const;
export type M365SetupState = (typeof M365_SETUP_STATES)[number];

export const USER_HEALTH_STATES = ["CONNECTED", "ATTENTION_REQUIRED", "DISCONNECTED"] as const;
export type UserHealthState = (typeof USER_HEALTH_STATES)[number];

export const RTB_M365_CREDENTIAL_SECRET_REF = "secret:rtb-m365-multitenant" as const;

export type RtbMicrosoftAppConfig = {
  applicationId: string;
  credentialSecretId: string;
  configured: boolean;
};

export type TrustedMicrosoftIdentity = {
  microsoftTenantId: string;
  signedInUserId: string;
  organisationName?: string | null;
  adminConsentGranted: boolean;
  consentRequired?: boolean;
  source: "microsoft_token" | "microsoft_admin_consent";
};

export type ResolvedSharePointSite = {
  hostname: string;
  path: string;
  siteId: string;
  displayName: string;
  webUrl: string;
};

export type DiscoveredLibrary = {
  driveId: string;
  name: string;
  driveType: string;
  webUrl?: string | null;
};

export function rtbMicrosoftAppConfig(env: NodeJS.ProcessEnv = process.env): RtbMicrosoftAppConfig {
  const applicationId = env.RTB_M365_APPLICATION_ID?.trim() ?? "";
  const credentialSecretId = env.RTB_M365_CREDENTIAL_SECRET_ID?.trim() || RTB_M365_CREDENTIAL_SECRET_REF;
  return {
    applicationId,
    credentialSecretId,
    configured: Boolean(applicationId),
  };
}

export function resolveRtbAppSecret(secretId: string, env: NodeJS.ProcessEnv = process.env): string | null {
  const expected = env.RTB_M365_CREDENTIAL_SECRET_ID?.trim() || RTB_M365_CREDENTIAL_SECRET_REF;
  if (secretId !== expected) return null;
  return env.RTB_M365_CLIENT_SECRET?.trim() || null;
}

export function assertNoCallerOnboardingAuthority(body: Record<string, unknown>): string | null {
  return rejectCallerConnectorCoreClaims(body) ?? rejectArbitraryUrlFetch(body.url ?? body.href ?? body.fetchUrl ?? body.graphUrl);
}

export function assertTrustedMicrosoftIdentity(identity: TrustedMicrosoftIdentity): void {
  const record = identity as unknown as Record<string, unknown>;
  if (assertNoCallerOnboardingAuthority(record)) throw new Error("caller_supplied_authority_rejected");
  if (typeof record.accessToken === "string" && record.accessToken.trim()) throw new Error("caller_supplied_token_rejected");
  if (!identity.microsoftTenantId?.trim()) throw new Error("microsoft_tenant_missing");
  if (!identity.signedInUserId?.trim()) throw new Error("microsoft_user_missing");
  if (identity.source !== "microsoft_token" && identity.source !== "microsoft_admin_consent") {
    throw new Error("untrusted_microsoft_identity");
  }
}

export function parseSharePointSiteUrl(value: string): { hostname: string; path: string; webUrl: string } {
  const trimmed = value.trim();
  if (!trimmed) throw new Error("site_url_required");
  if (!isGovernedSharePointWebUrl(trimmed)) throw new Error("UNAPPROVED_SITE");
  const url = new URL(trimmed);
  const host = url.hostname.toLowerCase();
  if (host.includes("-my.sharepoint.")) throw new Error("PERSONAL_ONEDRIVE_ACCESS_PROHIBITED");
  const segments = url.pathname.split("/").filter(Boolean);
  let path = "";
  if (segments[0] === "sites" || segments[0] === "teams") {
    if (!segments[1]) throw new Error("UNAPPROVED_SITE");
    path = `/${segments[0]}/${decodeURIComponent(segments[1])}`;
  } else if (segments.length > 0) {
    throw new Error("UNAPPROVED_SITE");
  }
  return {
    hostname: host,
    path,
    webUrl: `https://${host}${path}`,
  };
}

export function graphSitePath(hostname: string, path: string): string {
  const relative = path.replace(/^\//, "");
  return relative ? `/sites/${hostname}:/${relative}` : `/sites/${hostname}`;
}

export function userHealthForSetup(state: M365SetupState): UserHealthState {
  if (state === "READY") return "CONNECTED";
  if (state === "NOT_CONNECTED") return "DISCONNECTED";
  return "ATTENTION_REQUIRED";
}

export function mapGraphFailureToSetupState(message: string, kind?: string): M365SetupState {
  const text = `${kind ?? ""} ${message}`.toLowerCase();
  if (text.includes("consent")) return "ADMIN_CONSENT_REQUIRED";
  if (text.includes("invalid_client") || text.includes("token_rejected") || text.includes("secret_unavailable") || text.includes("expired")) {
    return "AUTH_EXPIRED";
  }
  if (text.includes("forbidden") || text.includes("permission") || kind === "FORBIDDEN") return "SITE_PERMISSION_REQUIRED";
  if (text.includes("revoked")) return "PERMISSION_REVOKED";
  if (kind === "AUTH") return "AUTH_EXPIRED";
  return "CONNECTION_ERROR";
}

export function userFacingSetupMessage(state: M365SetupState): string {
  switch (state) {
    case "NOT_CONNECTED":
      return "Microsoft 365 is not connected. You can use RTB Managed Repository without Microsoft.";
    case "MICROSOFT_SIGN_IN_REQUIRED":
      return "Sign in with Microsoft to connect your organisation.";
    case "ADMIN_CONSENT_REQUIRED":
      return "Microsoft requires an administrator to approve read-only access for this organisation.";
    case "CONNECTED_NO_SITE":
      return "Microsoft is connected. Enter the approved SharePoint project site.";
    case "SITE_PERMISSION_REQUIRED":
      return "RTB does not yet have permission to this SharePoint site. Ask a Microsoft administrator to restore access.";
    case "SITE_CONNECTED":
    case "LIBRARY_SELECTION_REQUIRED":
      return "Select the approved document library.";
    case "VALIDATING":
      return "Checking Microsoft access.";
    case "READY":
      return "SharePoint repository is connected for read-only engineering use.";
    case "AUTH_EXPIRED":
      return "Microsoft authorization has expired. Reconnect.";
    case "PERMISSION_REVOKED":
      return "RTB no longer has permission to this SharePoint site. Ask a Microsoft administrator to restore access.";
    default:
      return "Microsoft connection needs attention.";
  }
}

export function proposeSharePointDocumentHints(fileName: string): {
  proposed: true;
  documentNumber: string | null;
  revision: string | null;
  discipline: string | null;
} {
  const name = fileName.trim();
  const number = name.match(/\b([A-Z]{2,8}(?:[-_][A-Z0-9]{1,8}){1,3})\b/i)?.[1] ?? null;
  const revision = name.match(/\bRev(?:ision)?[-_ ]?([A-Z0-9]+)\b/i)?.[1] ?? name.match(/_R(\d+)\b/i)?.[1] ?? null;
  const lower = name.toLowerCase();
  const discipline = lower.includes("mech")
    ? "mechanical"
    : lower.includes("struct")
      ? "structural"
      : lower.includes("elec")
        ? "electrical"
        : lower.includes("civil")
          ? "civil"
          : null;
  return { proposed: true, documentNumber: number, revision, discipline };
}

export function onboardingCatalog() {
  return {
    microsoftOptional: true,
    defaultConnectionMode: DEFAULT_M365_CONNECTION_MODE,
    enterpriseManagedMode: ENTERPRISE_MANAGED_MODE_STATUS,
    permissionModel: MICROSOFT_PERMISSION_MODEL.preferred,
    sitesReadAllRequired: false,
    filesReadAllRequired: false,
    readOnlyDefault: SHAREPOINT_PILOT_MODE === "READ_ONLY",
    writeEnabled: SHAREPOINT_PILOT_WRITE_ENABLED,
    writePolicy: DEFAULT_CONNECTOR_WRITE_POLICY,
    liveMicrosoftProof: "DEFERRED_EXTERNAL_CONFIGURATION",
  } as const;
}

export function safeOnboardingTelemetry(input: Record<string, unknown>) {
  return observabilitySafe({
    ...input,
    content: undefined,
    bytes: undefined,
  });
}
