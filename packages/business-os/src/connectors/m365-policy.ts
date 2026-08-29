/**
 * BOS-16A6 Microsoft 365 security policy. Extends the existing BOS-12 connector.
 * Delegated, least-privilege, read-only Graph. Not a second integration stack.
 */
import { bosConnectorUiState } from "./ui-state";

export const MS365_ALLOWED_CAPABILITIES = ["directory.read", "calendar.read", "files.metadata.read"] as const;

export const MS365_CAPABILITY_CLASS = {
  "directory.read": "required_now",
  "calendar.read": "required_now",
  "files.metadata.read": "required_now",
  "mail.metadata.read": "future",
  "mail.content.read": "future",
} as const;

export const MS365_DENIED_CAPABILITIES = [
  "mail.send",
  "mail.write",
  "file.write",
  "calendar.write",
  "contact.write",
  "directory.write",
  "sharepoint.write",
] as const;

/** Delegated Graph permissions only. Mail.Read is not in the current BOS catalog. */
export const MS365_ALLOWED_GRAPH_SCOPES = ["offline_access", "User.Read", "Calendars.Read", "Files.Read"] as const;

export const MS365_DENIED_GRAPH_SCOPES = [
  "Mail.Send",
  "Mail.ReadWrite",
  "Mail.Read",
  "Files.ReadWrite",
  "Files.ReadWrite.All",
  "Calendars.ReadWrite",
  "Contacts.ReadWrite",
  "Sites.ReadWrite.All",
  "Directory.ReadWrite.All",
  "User.ReadWrite.All",
  "User.ReadWrite",
] as const;

export type Ms365ReadOperation = "getSignedInUser" | "getCalendarEventsReadOnly" | "getDriveItemMetadata";

export const MS365_ALLOWED_OPERATIONS: readonly Ms365ReadOperation[] = [
  "getSignedInUser",
  "getCalendarEventsReadOnly",
  "getDriveItemMetadata",
] as const;

export const MS365_MUTATION_OPERATIONS = [
  "sendMail",
  "replyMail",
  "forwardMail",
  "deleteMail",
  "createEvent",
  "updateEvent",
  "deleteEvent",
  "uploadFile",
  "updateFile",
  "deleteFile",
  "createContact",
  "updateContact",
  "updateDirectory",
  "updateSharePoint",
] as const;

export const MS365_GRAPH_HOST = "graph.microsoft.com";
export const MS365_IDENTITY_HOST = "login.microsoftonline.com";

export const MS365_ALLOWED_GET_PATHS = ["/v1.0/me", "/v1.0/me/events", "/v1.0/me/drive/root/children"] as const;

export const MS365_ALLOWED_QUERY_KEYS = ["$select", "$top", "$skiptoken"] as const;

export const MS365_CONNECTION_STATES = [
  "NOT_CONNECTED",
  "CONNECTING",
  "CONNECTED",
  "SYNCING",
  "ERROR",
  "REAUTH_REQUIRED",
  "DISCONNECTED",
] as const;

export type Ms365ConnectionState = (typeof MS365_CONNECTION_STATES)[number];

export type Ms365FieldClass = "required" | "provenance_only" | "sensitive_required" | "discard";

export const MS365_FIELD_POLICY = {
  user: {
    id: "required",
    userPrincipalName: "provenance_only",
    displayName: "provenance_only",
    mail: "discard",
    businessPhones: "discard",
    mobilePhone: "discard",
    streetAddress: "discard",
  },
  event: {
    id: "required",
    subject: "provenance_only",
    start: "required",
    end: "required",
    isCancelled: "provenance_only",
    lastModifiedDateTime: "provenance_only",
    body: "discard",
    attendees: "discard",
    location: "discard",
    organizer: "discard",
    onlineMeeting: "discard",
  },
  driveItem: {
    id: "required",
    name: "provenance_only",
    lastModifiedDateTime: "provenance_only",
    file: "provenance_only",
    folder: "provenance_only",
    size: "discard",
    webUrl: "discard",
    createdBy: "discard",
    content: "discard",
  },
} as const satisfies Record<string, Record<string, Ms365FieldClass>>;

export type Ms365ThreatId =
  | "token_theft"
  | "refresh_token_exposure"
  | "excessive_graph_scopes"
  | "cross_tenant_access"
  | "wrong_microsoft_tenant"
  | "mailbox_data_leakage"
  | "sharepoint_onedrive_leakage"
  | "browser_credential_exposure"
  | "ai_credential_exposure"
  | "pii_logging"
  | "arbitrary_graph_proxy"
  | "external_email_sending"
  | "file_modification_deletion"
  | "calendar_mutation"
  | "cross_workspace_leakage"
  | "revoked_consent"
  | "expired_token"
  | "throttling_429"
  | "provider_5xx_timeout"
  | "malformed_graph_response"
  | "canonical_bos_mutation_bypass";

export type Ms365ThreatControl = {
  id: Ms365ThreatId;
  control: string;
  failure: string;
  evidence: string;
};

export const MS365_THREAT_MODEL: readonly Ms365ThreatControl[] = [
  {
    id: "token_theft",
    control: "Access tokens stay in the Graph client process memory; never returned from adapter methods",
    failure: "m365_token_invalid",
    evidence: "m365-client.test.ts: token not returned",
  },
  {
    id: "refresh_token_exposure",
    control: "Refresh token is Platform secret-reference material; configure rejects inline secret fields",
    failure: "secret_redaction_required",
    evidence: "m365-security.test.ts: inline secret rejected",
  },
  {
    id: "excessive_graph_scopes",
    control: "MS365_ALLOWED_GRAPH_SCOPES is delegated User.Read, Calendars.Read, Files.Read, offline_access",
    failure: "m365_scope_forbidden",
    evidence: "m365-policy.test.ts: denied Mail.Send",
  },
  {
    id: "cross_tenant_access",
    control: "requireInstallation checks BOS tenant_id before provider access",
    failure: "cross_tenant_connector_forbidden",
    evidence: "m365-security.test.ts: cross-tenant blocked",
  },
  {
    id: "wrong_microsoft_tenant",
    control: "Live client uses tenant-specific token URL and requires expectedProviderOrgId",
    failure: "m365_tenant_mismatch",
    evidence: "m365-client.test.ts: wrong tenant rejected",
  },
  {
    id: "mailbox_data_leakage",
    control: "Mail.Read is not requested; send/read mail methods throw before fetch",
    failure: "connector_write_forbidden | m365_capability_forbidden",
    evidence: "m365-client.test.ts: email send blocked",
  },
  {
    id: "sharepoint_onedrive_leakage",
    control: "Drive reads keep metadata only; content, webUrl, and createdBy are discarded",
    failure: "m365_schema_invalid",
    evidence: "m365-validate.test.ts: drive content discarded",
  },
  {
    id: "browser_credential_exposure",
    control: "No NEXT_PUBLIC MS365 secrets; public installation redacts secretId",
    failure: "m365_browser_secret_forbidden",
    evidence: "m365-security.test.ts: no NEXT_PUBLIC MS365 secret",
  },
  {
    id: "ai_credential_exposure",
    control: "configure/sync/revoke require human actor; callProviderFromAgent throws",
    failure: "direct_provider_access_forbidden",
    evidence: "m365-security.test.ts: agent cannot access provider",
  },
  {
    id: "pii_logging",
    control: "m365SafeTelemetry strips tokens, bodies, attendees, and file content",
    failure: "secret_redaction_required",
    evidence: "m365-security.test.ts: logging redaction",
  },
  {
    id: "arbitrary_graph_proxy",
    control: "graphRequest(method, url) throws; host and path allowlists on typed GETs",
    failure: "unrestricted_external_proxy_forbidden",
    evidence: "m365-client.test.ts: endpoint allowlist",
  },
  {
    id: "external_email_sending",
    control: "sendMail/replyMail/forwardMail throw connector_write_forbidden before fetch",
    failure: "connector_write_forbidden",
    evidence: "m365-client.test.ts: email send blocked",
  },
  {
    id: "file_modification_deletion",
    control: "uploadFile/updateFile/deleteFile throw before fetch; Graph data plane is GET only",
    failure: "connector_write_forbidden | m365_method_forbidden",
    evidence: "m365-client.test.ts: file mutation blocked",
  },
  {
    id: "calendar_mutation",
    control: "createEvent/updateEvent/deleteEvent throw before fetch",
    failure: "connector_write_forbidden",
    evidence: "m365-client.test.ts: calendar mutation blocked",
  },
  {
    id: "cross_workspace_leakage",
    control: "requireInstallation checks workspace_id before provider access",
    failure: "cross_workspace_graph_forbidden",
    evidence: "m365-security.test.ts: cross-workspace blocked",
  },
  {
    id: "revoked_consent",
    control: "revoke clears secret_id, marks revoked, blocks sync; Graph write-revoke is out of GET-only generation",
    failure: "connector_revoked",
    evidence: "m365-security.test.ts: disconnect blocks sync",
  },
  {
    id: "expired_token",
    control: "401/invalid_grant map to typed errors; no fabricated BOS facts",
    failure: "m365_unauthorized",
    evidence: "m365-client.test.ts: 401 fail-closed",
  },
  {
    id: "throttling_429",
    control: "429 maps to rateLimited without fabricating facts; bounded adapter retries only",
    failure: "m365_rate_limited",
    evidence: "m365-client.test.ts: 429 typed",
  },
  {
    id: "provider_5xx_timeout",
    control: "5xx and network abort map to typed errors; empty live page, no fixture fallback",
    failure: "m365_provider_error | m365_timeout",
    evidence: "m365-client.test.ts: 5xx and timeout",
  },
  {
    id: "malformed_graph_response",
    control: "Schema validation before staging; missing values stay null",
    failure: "m365_schema_invalid",
    evidence: "m365-validate.test.ts: schema-invalid rejected",
  },
  {
    id: "canonical_bos_mutation_bypass",
    control: "Staging becomesCanonical=false; sync never writes canonical BOS domains",
    failure: "canonicalDomainMutationBypass remains false",
    evidence: "m365-security.test.ts: staging-first",
  },
] as const;

export function assertMs365CapabilityAllowed(capability: string): void {
  if (!(MS365_ALLOWED_CAPABILITIES as readonly string[]).includes(capability)) {
    throw new Error("m365_capability_forbidden");
  }
}

export function assertMs365ScopeAllowed(scope: string): void {
  if (!(MS365_ALLOWED_GRAPH_SCOPES as readonly string[]).includes(scope)) {
    throw new Error("m365_scope_forbidden");
  }
}

export function m365GraphPathAllowed(pathname: string): boolean {
  return (MS365_ALLOWED_GET_PATHS as readonly string[]).includes(pathname);
}

const TENANT_GUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export function m365IdentityTokenPathAllowed(pathname: string, expectedTenantId: string): boolean {
  if (!TENANT_GUID.test(expectedTenantId)) return false;
  return pathname === `/${expectedTenantId}/oauth2/v2.0/token`;
}

export function buildMs365AuthorizeUrl(input: {
  clientId: string;
  tenantId: string;
  redirectUri: string;
  state: string;
}): string {
  if (!input.clientId.trim() || !input.redirectUri.trim() || !input.state.trim()) {
    throw new Error("m365_oauth_config_invalid");
  }
  if (!TENANT_GUID.test(input.tenantId)) throw new Error("m365_tenant_mismatch");
  const url = new URL(`https://${MS365_IDENTITY_HOST}/${input.tenantId}/oauth2/v2.0/authorize`);
  url.searchParams.set("client_id", input.clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", input.redirectUri);
  url.searchParams.set("response_mode", "query");
  url.searchParams.set("scope", MS365_ALLOWED_GRAPH_SCOPES.join(" "));
  url.searchParams.set("state", input.state);
  url.searchParams.set("prompt", "consent");
  return url.toString();
}

export function ms365ConnectionState(input: {
  health: string;
  effectiveMode: string;
  secretId: string | null;
  errorCategory: string | null;
  oauthPending?: boolean;
  inFlightSync?: boolean;
}): Ms365ConnectionState {
  return bosConnectorUiState({ ...input, unauthorizedCategory: "m365_unauthorized" });
}
