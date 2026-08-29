/**
 * Isolated HubSpot CRM client. Tokens never leave this boundary.
 * CRM data-plane operations are GET only. Mutations throw before fetch.
 * OAuth issuance, refresh, and revocation are a separate identity-lifecycle POST surface.
 */
import {
  HUBSPOT_ALLOWED_OAUTH_SCOPES,
  HUBSPOT_ALLOWED_OPERATIONS,
  HUBSPOT_API_HOST,
  HUBSPOT_COMPANY_PROPERTIES,
  HUBSPOT_CONTACT_PROPERTIES,
  HUBSPOT_DEAL_PROPERTIES,
  HUBSPOT_IDENTITY_GRANT_TYPES,
  HUBSPOT_MUTATION_OPERATIONS,
  HUBSPOT_OAUTH_REVOKE_PATH,
  HUBSPOT_OAUTH_TOKEN_PATH,
  type HubSpotReadOperation,
  hubspotCrmPathAllowed,
  hubspotLegacyOauthPath,
  hubspotOauthIdentityPostAllowed,
  hubspotOauthRevokePathAllowed,
  hubspotOauthTokenPathAllowed,
} from "./hubspot-policy";
import { HubSpotConnectorError, hubspotErrorFromHttpStatus } from "./hubspot-errors";
import type { HubSpotSecretMaterial } from "./hubspot-secrets";
import {
  mapValidHubSpotRecords,
  minimiseAccountIdentity,
  minimiseCompany,
  minimiseContact,
  minimiseDeal,
  type MinimisedHubSpotRecord,
  portalIdFromUnknown,
  validateHubSpotPaging,
} from "./hubspot-validate";
import { assertConnectorUrl } from "./security";

export type HubSpotFetch = (input: string | URL, init?: RequestInit) => Promise<Response>;

export type HubSpotClientDeps = {
  fetch: HubSpotFetch;
  secrets: HubSpotSecretMaterial;
  expectedProviderOrgId: string;
  timeoutMs?: number;
};

const TIMEOUT_MS = 5_000;

export class HubSpotProviderClient {
  private accessToken: string | null = null;
  private boundPortalId: string | null = null;

  constructor(private readonly deps: HubSpotClientDeps) {}

  write(): never {
    throw new Error("connector_write_forbidden");
  }

  createContact(): never {
    return this.write();
  }
  updateContact(): never {
    return this.write();
  }
  deleteContact(): never {
    return this.write();
  }
  createCompany(): never {
    return this.write();
  }
  updateCompany(): never {
    return this.write();
  }
  deleteCompany(): never {
    return this.write();
  }
  createDeal(): never {
    return this.write();
  }
  updateDeal(): never {
    return this.write();
  }
  deleteDeal(): never {
    return this.write();
  }
  changePipelineStage(): never {
    return this.write();
  }
  createNote(): never {
    return this.write();
  }
  sendEmail(): never {
    return this.write();
  }
  enrolWorkflow(): never {
    return this.write();
  }
  modifyCrmOwnership(): never {
    return this.write();
  }
  changeAccountSettings(): never {
    return this.write();
  }

  hubspotRequest(_method: string, _url: string): never {
    throw new Error("unrestricted_external_proxy_forbidden");
  }

  async getAccountIdentity(): Promise<MinimisedHubSpotRecord> {
    await this.ensureBound();
    const json = await this.crmGet("/account-info/v3/details");
    const identity = minimiseAccountIdentity(json);
    if (identity.externalSourceId !== this.deps.expectedProviderOrgId) {
      throw new HubSpotConnectorError("hubspot_portal_mismatch");
    }
    return identity;
  }

  async getContactsReadOnly(): Promise<MinimisedHubSpotRecord[]> {
    await this.ensureBound();
    const json = await this.crmGet("/crm/v3/objects/contacts", {
      limit: "50",
      properties: HUBSPOT_CONTACT_PROPERTIES.join(","),
      archived: "false",
    });
    validateHubSpotPaging((json as { paging?: unknown }).paging, "/crm/v3/objects/contacts");
    return mapValidHubSpotRecords((json as { results?: unknown }).results, minimiseContact).records;
  }

  async getCompaniesReadOnly(): Promise<MinimisedHubSpotRecord[]> {
    await this.ensureBound();
    const json = await this.crmGet("/crm/v3/objects/companies", {
      limit: "50",
      properties: HUBSPOT_COMPANY_PROPERTIES.join(","),
      archived: "false",
    });
    validateHubSpotPaging((json as { paging?: unknown }).paging, "/crm/v3/objects/companies");
    return mapValidHubSpotRecords((json as { results?: unknown }).results, minimiseCompany).records;
  }

  async getDealsReadOnly(): Promise<MinimisedHubSpotRecord[]> {
    await this.ensureBound();
    const json = await this.crmGet("/crm/v3/objects/deals", {
      limit: "50",
      properties: HUBSPOT_DEAL_PROPERTIES.join(","),
      archived: "false",
    });
    validateHubSpotPaging((json as { paging?: unknown }).paging, "/crm/v3/objects/deals");
    return mapValidHubSpotRecords((json as { results?: unknown }).results, minimiseDeal).records;
  }

  allowedOperations(): readonly HubSpotReadOperation[] {
    return HUBSPOT_ALLOWED_OPERATIONS;
  }

  boundProviderOrgId(): string | null {
    return this.boundPortalId;
  }

  async revokeAuthorization(): Promise<{
    attempted: true;
    providerRevocation: "submitted" | "unavailable";
    errorCategory: string | null;
  }> {
    try {
      await this.identityPost(HUBSPOT_OAUTH_REVOKE_PATH, {
        client_id: this.deps.secrets.clientId,
        client_secret: this.deps.secrets.clientSecret,
        token: this.deps.secrets.refreshToken,
        token_type_hint: "refresh_token",
      });
      this.accessToken = null;
      return { attempted: true, providerRevocation: "submitted", errorCategory: null };
    } catch (error) {
      this.accessToken = null;
      const errorCategory = error instanceof HubSpotConnectorError ? error.category : "hubspot_live_unavailable";
      return { attempted: true, providerRevocation: "unavailable", errorCategory };
    }
  }

  async exchangeAuthorizationCode(input: { code: string; redirectUri: string }): Promise<{ boundPortalId: string }> {
    if (!input.code.trim() || !input.redirectUri.trim()) {
      throw new HubSpotConnectorError("hubspot_oauth_config_invalid");
    }
    const body = await this.identityPost(HUBSPOT_OAUTH_TOKEN_PATH, {
      grant_type: "authorization_code",
      client_id: this.deps.secrets.clientId,
      client_secret: this.deps.secrets.clientSecret,
      code: input.code,
      redirect_uri: input.redirectUri,
    });
    this.applyAccessToken(body);
    const expected = this.deps.expectedProviderOrgId;
    if (!expected || !/^\d+$/.test(expected) || this.deps.secrets.portalId !== expected) {
      throw new HubSpotConnectorError("hubspot_portal_mismatch");
    }
    this.boundPortalId = expected;
    return { boundPortalId: expected };
  }

  private async ensureBound(): Promise<void> {
    const expected = this.deps.expectedProviderOrgId;
    if (!expected) throw new HubSpotConnectorError("hubspot_portal_unbound");
    if (!/^\d+$/.test(expected)) throw new HubSpotConnectorError("hubspot_portal_mismatch");
    if (this.deps.secrets.portalId !== expected) throw new HubSpotConnectorError("hubspot_portal_mismatch");
    await this.ensureAccessToken();
    this.boundPortalId = expected;
  }

  private async ensureAccessToken(): Promise<void> {
    if (this.accessToken) return;
    const body = await this.identityPost(HUBSPOT_OAUTH_TOKEN_PATH, {
      grant_type: "refresh_token",
      client_id: this.deps.secrets.clientId,
      client_secret: this.deps.secrets.clientSecret,
      refresh_token: this.deps.secrets.refreshToken,
    });
    this.applyAccessToken(body);
  }

  private applyAccessToken(body: unknown): void {
    const token = body && typeof body === "object" ? (body as { access_token?: unknown }).access_token : null;
    if (typeof token !== "string" || token.length < 8) {
      throw new HubSpotConnectorError("hubspot_token_invalid");
    }
    const hubId = portalIdFromUnknown(
      body && typeof body === "object" ? (body as { hub_id?: unknown }).hub_id : null,
    );
    if (hubId && hubId !== this.deps.expectedProviderOrgId) {
      throw new HubSpotConnectorError("hubspot_portal_mismatch");
    }
    const granted =
      body && typeof body === "object"
        ? ((body as { scope?: unknown; scopes?: unknown }).scope ?? (body as { scopes?: unknown }).scopes)
        : null;
    const grantedText = Array.isArray(granted) ? granted.join(" ") : typeof granted === "string" ? granted : null;
    if (grantedText) {
      for (const scope of grantedText.split(/[\s,]+/).filter(Boolean)) {
        if (!(HUBSPOT_ALLOWED_OAUTH_SCOPES as readonly string[]).includes(scope)) {
          throw new HubSpotConnectorError("hubspot_scope_forbidden");
        }
      }
    }
    this.accessToken = token;
  }

  private async crmGet(pathname: string, query?: Record<string, string>): Promise<unknown> {
    if (!hubspotCrmPathAllowed(pathname)) throw new HubSpotConnectorError("hubspot_endpoint_forbidden");
    const url = new URL(`https://${HUBSPOT_API_HOST}${pathname}`);
    for (const [key, value] of Object.entries(query ?? {})) {
      if (key !== "limit" && key !== "after" && key !== "properties" && key !== "archived") {
        throw new HubSpotConnectorError("hubspot_endpoint_forbidden");
      }
      url.searchParams.set(key, value);
    }
    assertConnectorUrl("hubspot", url.toString());
    return this.send("GET", url, {
      Authorization: `Bearer ${this.accessToken}`,
      Accept: "application/json",
    });
  }

  private async identityPost(pathname: string, form: Record<string, string>): Promise<unknown> {
    if (hubspotLegacyOauthPath(pathname) || !hubspotOauthIdentityPostAllowed(pathname)) {
      throw new HubSpotConnectorError("hubspot_endpoint_forbidden");
    }
    if (hubspotOauthTokenPathAllowed(pathname)) {
      const grant = form.grant_type;
      if (!(HUBSPOT_IDENTITY_GRANT_TYPES as readonly string[]).includes(grant)) {
        throw new HubSpotConnectorError("hubspot_method_forbidden");
      }
      const allowed =
        grant === "refresh_token"
          ? ["grant_type", "client_id", "client_secret", "refresh_token"]
          : ["grant_type", "client_id", "client_secret", "code", "redirect_uri"];
      if (Object.keys(form).some((key) => !allowed.includes(key))) {
        throw new HubSpotConnectorError("hubspot_method_forbidden");
      }
    }
    if (hubspotOauthRevokePathAllowed(pathname)) {
      const allowed = ["client_id", "client_secret", "token", "token_type_hint"];
      if (Object.keys(form).some((key) => !allowed.includes(key))) {
        throw new HubSpotConnectorError("hubspot_method_forbidden");
      }
      if (form.token_type_hint !== "refresh_token") {
        throw new HubSpotConnectorError("hubspot_method_forbidden");
      }
    }
    const url = new URL(`https://${HUBSPOT_API_HOST}${pathname}`);
    if (url.search) throw new HubSpotConnectorError("hubspot_endpoint_forbidden");
    assertConnectorUrl("hubspot", url.toString());
    return this.send("POST", url, { "Content-Type": "application/x-www-form-urlencoded" }, new URLSearchParams(form).toString());
  }

  private async send(
    method: "GET" | "POST",
    url: URL,
    headers: Record<string, string>,
    body?: string,
  ): Promise<unknown> {
    const pathname = url.pathname;
    if (hubspotLegacyOauthPath(pathname)) throw new HubSpotConnectorError("hubspot_endpoint_forbidden");
    const isIdentityPost = method === "POST" && hubspotOauthIdentityPostAllowed(pathname);
    if (url.hostname === HUBSPOT_API_HOST && method !== "GET" && !isIdentityPost) {
      throw new HubSpotConnectorError("hubspot_method_forbidden");
    }
    if (url.hostname === HUBSPOT_API_HOST && method === "GET" && !hubspotCrmPathAllowed(pathname)) {
      throw new HubSpotConnectorError("hubspot_endpoint_forbidden");
    }
    if (isIdentityPost && url.search) throw new HubSpotConnectorError("hubspot_endpoint_forbidden");
    assertConnectorUrl("hubspot", url.toString());
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.deps.timeoutMs ?? TIMEOUT_MS);
    let response: Response;
    try {
      response = await this.deps.fetch(url.toString(), {
        method,
        headers,
        body,
        signal: controller.signal,
      });
    } catch (error) {
      if (error instanceof HubSpotConnectorError) throw error;
      throw new HubSpotConnectorError("hubspot_timeout");
    } finally {
      clearTimeout(timeout);
    }
    if (isIdentityPost && hubspotOauthRevokePathAllowed(pathname) && (response.status === 204 || response.ok)) {
      return {};
    }
    if (!response.ok) throw hubspotErrorFromHttpStatus(response.status);
    if (response.status === 204) return {};
    try {
      return await response.json();
    } catch {
      throw new HubSpotConnectorError("hubspot_schema_invalid");
    }
  }
}

export function assertHubSpotMutationForbidden(operation: string): never {
  if ((HUBSPOT_MUTATION_OPERATIONS as readonly string[]).includes(operation) || operation === "write") {
    throw new Error("connector_write_forbidden");
  }
  throw new HubSpotConnectorError("hubspot_method_forbidden");
}
