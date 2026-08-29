/**
 * BOS-16A7 HubSpot security policy. Extends the existing BOS-12 connector.
 * OAuth, read-only CRM objects. Not a second integration stack.
 * Scopes verified 2026-08-29 against HubSpot scopes reference.
 */
import { bosConnectorUiState } from "./ui-state";

export const HUBSPOT_ALLOWED_CAPABILITIES = ["crm.contacts.read", "crm.companies.read", "crm.deals.read"] as const;

export const HUBSPOT_CAPABILITY_CLASS = {
  "crm.contacts.read": "required_now",
  "crm.companies.read": "required_now",
  "crm.deals.read": "required_now",
  "crm.pipelines.read": "future",
  "crm.owners.read": "future",
  "crm.associations.read": "future",
} as const;

export const HUBSPOT_DENIED_CAPABILITIES = [
  "crm.contacts.write",
  "crm.companies.write",
  "crm.deals.write",
  "crm.tickets.write",
  "marketing.write",
  "automation.write",
  "email.send",
  "commerce.write",
  "settings.write",
] as const;

export const HUBSPOT_ALLOWED_OAUTH_SCOPES = [
  "oauth",
  "crm.objects.contacts.read",
  "crm.objects.companies.read",
  "crm.objects.deals.read",
] as const;

export const HUBSPOT_DENIED_OAUTH_SCOPES = [
  "crm.objects.contacts.write",
  "crm.objects.companies.write",
  "crm.objects.deals.write",
  "crm.objects.tickets.read",
  "crm.objects.tickets.write",
  "crm.objects.owners.write",
  "crm.objects.contacts.sensitive.read",
  "crm.objects.contacts.highly_sensitive.read",
  "automation",
  "content",
  "sales-email-read",
  "e-commerce",
  "settings",
] as const;

export const HUBSPOT_SCOPE_MINIMISATION_PASS = true as const;
export const HUBSPOT_CURRENT_OAUTH_CONTRACT_VERIFIED = true as const;
export const HUBSPOT_OAUTH_API_VERSION = "2026-03" as const;

export type HubSpotReadOperation =
  | "getAccountIdentity"
  | "getCompaniesReadOnly"
  | "getContactsReadOnly"
  | "getDealsReadOnly";

export const HUBSPOT_ALLOWED_OPERATIONS: readonly HubSpotReadOperation[] = [
  "getAccountIdentity",
  "getCompaniesReadOnly",
  "getContactsReadOnly",
  "getDealsReadOnly",
] as const;

export const HUBSPOT_MUTATION_OPERATIONS = [
  "createContact",
  "updateContact",
  "deleteContact",
  "createCompany",
  "updateCompany",
  "deleteCompany",
  "createDeal",
  "updateDeal",
  "deleteDeal",
  "changePipelineStage",
  "createNote",
  "sendEmail",
  "enrolWorkflow",
  "modifyCrmOwnership",
  "changeAccountSettings",
] as const;

export const HUBSPOT_API_HOST = "api.hubapi.com";
export const HUBSPOT_AUTHORIZE_HOST = "app.hubspot.com";

export const HUBSPOT_ALLOWED_GET_PATHS = [
  "/account-info/v3/details",
  "/crm/v3/objects/contacts",
  "/crm/v3/objects/companies",
  "/crm/v3/objects/deals",
] as const;

export const HUBSPOT_OAUTH_TOKEN_PATH = "/oauth/2026-03/token";
export const HUBSPOT_OAUTH_REVOKE_PATH = "/oauth/2026-03/token/revoke";

export const HUBSPOT_LEGACY_OAUTH_PATHS = [
  "/oauth/v1/token",
  "/oauth/v3/token",
] as const;

export const HUBSPOT_LEGACY_OAUTH_PATH_PREFIXES = [
  "/oauth/v1/access-tokens/",
  "/oauth/v1/refresh-tokens/",
  "/oauth/v3/refresh-tokens/",
] as const;

export const HUBSPOT_IDENTITY_GRANT_TYPES = ["authorization_code", "refresh_token"] as const;

export const HUBSPOT_ALLOWED_QUERY_KEYS = ["limit", "after", "properties", "archived"] as const;

export const HUBSPOT_CONTACT_PROPERTIES = ["firstname", "lastname", "company", "createdate", "lastmodifieddate"] as const;
export const HUBSPOT_COMPANY_PROPERTIES = ["name", "domain", "createdate", "hs_lastmodifieddate"] as const;
export const HUBSPOT_DEAL_PROPERTIES = [
  "dealname",
  "amount",
  "dealstage",
  "pipeline",
  "closedate",
  "hs_is_closed_won",
  "hs_lastmodifieddate",
] as const;

export const HUBSPOT_CONNECTION_STATES = [
  "NOT_CONNECTED",
  "CONNECTING",
  "CONNECTED",
  "SYNCING",
  "ERROR",
  "REAUTH_REQUIRED",
  "DISCONNECTED",
] as const;

export type HubSpotConnectionState = (typeof HUBSPOT_CONNECTION_STATES)[number];

export type HubSpotFieldClass = "required" | "provenance_only" | "sensitive_required" | "discard";

export const HUBSPOT_FIELD_POLICY = {
  contact: {
    id: "required",
    firstname: "provenance_only",
    lastname: "provenance_only",
    company: "provenance_only",
    email: "discard",
    phone: "discard",
    address: "discard",
    notes: "discard",
  },
  company: {
    id: "required",
    name: "required",
    domain: "provenance_only",
    phone: "discard",
    address: "discard",
  },
  deal: {
    id: "required",
    dealname: "provenance_only",
    amount: "sensitive_required",
    dealstage: "required",
    pipeline: "provenance_only",
    closedate: "provenance_only",
    description: "discard",
    notes: "discard",
  },
} as const satisfies Record<string, Record<string, HubSpotFieldClass>>;

export type HubSpotThreatId =
  | "access_token_theft"
  | "refresh_token_theft"
  | "client_secret_exposure"
  | "private_app_token_misuse"
  | "excessive_crm_scopes"
  | "cross_tenant_portal_leakage"
  | "wrong_portal_binding"
  | "arbitrary_hubspot_proxy"
  | "crm_object_mutation"
  | "marketing_email_actions"
  | "workflow_triggering"
  | "owner_user_data_leakage"
  | "pii_logging"
  | "browser_token_exposure"
  | "ai_credential_access"
  | "schema_drift"
  | "pagination_abuse"
  | "rate_limiting"
  | "revoked_authorization"
  | "expired_token"
  | "canonical_bos_mutation_bypass"
  | "staging_poisoning";

export type HubSpotThreatControl = {
  id: HubSpotThreatId;
  control: string;
  failure: string;
  evidence: string;
};

export const HUBSPOT_THREAT_MODEL: readonly HubSpotThreatControl[] = [
  {
    id: "access_token_theft",
    control: "Access tokens stay in HubSpotProviderClient memory and are never returned",
    failure: "hubspot_token_invalid",
    evidence: "hubspot-client.test.ts: token not returned",
  },
  {
    id: "refresh_token_theft",
    control: "Refresh token is Platform secret-reference material; configure rejects inline tokens",
    failure: "secret_redaction_required",
    evidence: "hubspot-security.test.ts: inline token rejected",
  },
  {
    id: "client_secret_exposure",
    control: "Client secret is server env only; authorize URL never includes it",
    failure: "hubspot_browser_secret_forbidden",
    evidence: "hubspot-policy.test.ts: authorize URL has no secret",
  },
  {
    id: "private_app_token_misuse",
    control: "Live contract requires OAuth refresh material; PAT/hapikey and standalone access tokens are rejected",
    failure: "hubspot_private_app_forbidden",
    evidence: "hubspot-security.test.ts: private-app token rejected",
  },
  {
    id: "excessive_crm_scopes",
    control: "Allowlist is oauth + contacts/companies/deals .read only",
    failure: "hubspot_scope_forbidden",
    evidence: "hubspot-policy.test.ts: write scopes denied",
  },
  {
    id: "cross_tenant_portal_leakage",
    control: "requireInstallation checks BOS tenant_id before provider access",
    failure: "cross_tenant_connector_forbidden",
    evidence: "hubspot-security.test.ts: cross-tenant blocked",
  },
  {
    id: "wrong_portal_binding",
    control: "Live client requires expectedProviderOrgId matching hub_id / portalId",
    failure: "hubspot_portal_mismatch",
    evidence: "hubspot-client.test.ts: wrong portal rejected",
  },
  {
    id: "arbitrary_hubspot_proxy",
    control: "hubspotRequest(method, url) throws; host and path allowlists on typed methods",
    failure: "unrestricted_external_proxy_forbidden",
    evidence: "hubspot-client.test.ts: endpoint allowlist",
  },
  {
    id: "crm_object_mutation",
    control: "create/update/delete contact/company/deal throw before fetch",
    failure: "connector_write_forbidden",
    evidence: "hubspot-client.test.ts: CRM mutation blocked",
  },
  {
    id: "marketing_email_actions",
    control: "sendEmail throws; marketing scopes are denied",
    failure: "connector_write_forbidden | hubspot_scope_forbidden",
    evidence: "hubspot-client.test.ts: email action blocked",
  },
  {
    id: "workflow_triggering",
    control: "enrolWorkflow throws; automation scope is denied",
    failure: "connector_write_forbidden",
    evidence: "hubspot-client.test.ts: workflow blocked",
  },
  {
    id: "owner_user_data_leakage",
    control: "Owners API is not requested; owner records are not fetched",
    failure: "hubspot_endpoint_forbidden",
    evidence: "hubspot-policy.test.ts: owners path denied",
  },
  {
    id: "pii_logging",
    control: "hubspotSafeTelemetry strips tokens, emails, phones, and full payloads",
    failure: "secret_redaction_required",
    evidence: "hubspot-security.test.ts: logging redaction",
  },
  {
    id: "browser_token_exposure",
    control: "No NEXT_PUBLIC HubSpot secrets; public installation redacts secretId",
    failure: "hubspot_browser_secret_forbidden",
    evidence: "hubspot-security.test.ts: no NEXT_PUBLIC HubSpot secret",
  },
  {
    id: "ai_credential_access",
    control: "configure/sync/revoke require human actor; callProviderFromAgent throws",
    failure: "direct_provider_access_forbidden",
    evidence: "hubspot-security.test.ts: agent cannot access provider",
  },
  {
    id: "schema_drift",
    control: "Schema validation before staging; missing values stay null",
    failure: "hubspot_schema_invalid",
    evidence: "hubspot-validate.test.ts: schema-invalid rejected",
  },
  {
    id: "pagination_abuse",
    control: "Only after tokens / validated api.hubapi.com next links on allowlisted paths",
    failure: "hubspot_pagination_failed",
    evidence: "hubspot-validate.test.ts: hostile pagination rejected",
  },
  {
    id: "rate_limiting",
    control: "429 maps to rateLimited without fabricating CRM facts",
    failure: "hubspot_rate_limited",
    evidence: "hubspot-client.test.ts: 429 typed",
  },
  {
    id: "revoked_authorization",
    control: "revoke clears secret_id and blocks sync; POST /oauth/2026-03/token/revoke is identity-lifecycle only and never puts tokens in the URL",
    failure: "connector_revoked",
    evidence: "hubspot-security.test.ts: disconnect blocks sync",
  },
  {
    id: "expired_token",
    control: "401 maps to typed error; no fabricated leads/customers/opportunities",
    failure: "hubspot_unauthorized",
    evidence: "hubspot-client.test.ts: 401 fail-closed",
  },
  {
    id: "canonical_bos_mutation_bypass",
    control: "Staging becomesCanonical=false; sync never writes growth/customer canonical tables",
    failure: "canonicalDomainMutationBypass remains false",
    evidence: "hubspot-security.test.ts: staging-first",
  },
  {
    id: "staging_poisoning",
    control: "Minimised fields, suppression redaction, tenant-scoped staging",
    failure: "suppressed_identity_reconstruction_forbidden",
    evidence: "hubspot-security.test.ts: suppression privacy",
  },
] as const;

export function assertHubSpotCapabilityAllowed(capability: string): void {
  if (!(HUBSPOT_ALLOWED_CAPABILITIES as readonly string[]).includes(capability)) {
    throw new Error("hubspot_capability_forbidden");
  }
}

export function assertHubSpotScopeAllowed(scope: string): void {
  if (!(HUBSPOT_ALLOWED_OAUTH_SCOPES as readonly string[]).includes(scope)) {
    throw new Error("hubspot_scope_forbidden");
  }
}

export function hubspotCrmPathAllowed(pathname: string): boolean {
  return (HUBSPOT_ALLOWED_GET_PATHS as readonly string[]).includes(pathname);
}

export function hubspotOauthTokenPathAllowed(pathname: string): boolean {
  return pathname === HUBSPOT_OAUTH_TOKEN_PATH;
}

export function hubspotOauthRevokePathAllowed(pathname: string): boolean {
  return pathname === HUBSPOT_OAUTH_REVOKE_PATH;
}

export function hubspotOauthIdentityPostAllowed(pathname: string): boolean {
  return hubspotOauthTokenPathAllowed(pathname) || hubspotOauthRevokePathAllowed(pathname);
}

export function hubspotLegacyOauthPath(pathname: string): boolean {
  if ((HUBSPOT_LEGACY_OAUTH_PATHS as readonly string[]).includes(pathname)) return true;
  return HUBSPOT_LEGACY_OAUTH_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function buildHubSpotAuthorizeUrl(input: { clientId: string; redirectUri: string; state: string }): string {
  if (!input.clientId.trim() || !input.redirectUri.trim() || !input.state.trim()) {
    throw new Error("hubspot_oauth_config_invalid");
  }
  const url = new URL(`https://${HUBSPOT_AUTHORIZE_HOST}/oauth/authorize`);
  url.searchParams.set("client_id", input.clientId);
  url.searchParams.set("redirect_uri", input.redirectUri);
  url.searchParams.set("scope", HUBSPOT_ALLOWED_OAUTH_SCOPES.join(" "));
  url.searchParams.set("state", input.state);
  return url.toString();
}

export function hubspotConnectionState(input: {
  health: string;
  effectiveMode: string;
  secretId: string | null;
  errorCategory: string | null;
  oauthPending?: boolean;
  inFlightSync?: boolean;
}): HubSpotConnectionState {
  return bosConnectorUiState({ ...input, unauthorizedCategory: "hubspot_unauthorized" });
}
