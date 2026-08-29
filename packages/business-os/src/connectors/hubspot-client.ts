/**
 * Isolated HubSpot CRM client. Tokens never leave this boundary.
 * CRM data-plane operations are GET only. Mutations throw before fetch.
 * OAuth token exchange and refresh-token revocation are identity-lifecycle paths.
 */
import {
  HUBSPOT_ALLOWED_OAUTH_SCOPES,
  HUBSPOT_ALLOWED_OPERATIONS,
  HUBSPOT_API_HOST,
  HUBSPOT_COMPANY_PROPERTIES,
  HUBSPOT_CONTACT_PROPERTIES,
  HUBSPOT_DEAL_PROPERTIES,
  HUBSPOT_MUTATION_OPERATIONS,
  HUBSPOT_OAUTH_REVOKE_PREFIX,
  type HubSpotReadOperation,
  hubspotCrmPathAllowed,
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

  async revokeAuthorization(): Promise<{ attempted: true; providerRevocation: "submitted" | "unavailable" }> {
    const pathname = `${HUBSPOT_OAUTH_REVOKE_PREFIX}${encodeURIComponent(this.deps.secrets.refreshToken)}`;
    if (!hubspotOauthRevokePathAllowed(pathname)) {
      this.accessToken = null;
      return { attempted: true, providerRevocation: "unavailable" };
    }
    try {
      const url = new URL(`https://${HUBSPOT_API_HOST}${pathname}`);
      await this.send("DELETE", url, { Accept: "application/json" });
      this.accessToken = null;
      return { attempted: true, providerRevocation: "submitted" };
    } catch {
      this.accessToken = null;
      return { attempted: true, providerRevocation: "unavailable" };
    }
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
    const body = await this.oauthTokenPost({
      grant_type: "refresh_token",
      client_id: this.deps.secrets.clientId,
      client_secret: this.deps.secrets.clientSecret,
      refresh_token: this.deps.secrets.refreshToken,
    });
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

  private async oauthTokenPost(form: Record<string, string>): Promise<unknown> {
    if (!hubspotOauthTokenPathAllowed("/oauth/v3/token")) {
      throw new HubSpotConnectorError("hubspot_endpoint_forbidden");
    }
    const url = new URL(`https://${HUBSPOT_API_HOST}/oauth/v3/token`);
    assertConnectorUrl("hubspot", url.toString());
    return this.send("POST", url, { "Content-Type": "application/x-www-form-urlencoded" }, new URLSearchParams(form).toString());
  }

  private async send(
    method: "GET" | "POST" | "DELETE",
    url: URL,
    headers: Record<string, string>,
    body?: string,
  ): Promise<unknown> {
    const pathname = url.pathname;
    const isOauthToken = method === "POST" && hubspotOauthTokenPathAllowed(pathname);
    const isOauthRevoke = method === "DELETE" && hubspotOauthRevokePathAllowed(pathname);
    if (url.hostname === HUBSPOT_API_HOST && method !== "GET" && !isOauthToken && !isOauthRevoke) {
      throw new HubSpotConnectorError("hubspot_method_forbidden");
    }
    if (url.hostname === HUBSPOT_API_HOST && method === "GET" && !hubspotCrmPathAllowed(pathname)) {
      throw new HubSpotConnectorError("hubspot_endpoint_forbidden");
    }
    const asserted = isOauthRevoke
      ? `https://${HUBSPOT_API_HOST}${HUBSPOT_OAUTH_REVOKE_PREFIX}redacted`
      : url.toString();
    assertConnectorUrl("hubspot", asserted);
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
    if (isOauthRevoke && (response.status === 204 || response.ok)) return {};
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
