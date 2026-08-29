/**
 * Isolated Microsoft Graph client. Tokens never leave this boundary.
 * Graph business-data operations are GET only. Mutations throw before fetch.
 */
import {
  MS365_ALLOWED_GRAPH_SCOPES,
  MS365_ALLOWED_OPERATIONS,
  MS365_GRAPH_HOST,
  MS365_IDENTITY_HOST,
  MS365_MUTATION_OPERATIONS,
  type Ms365ReadOperation,
  m365GraphPathAllowed,
  m365IdentityTokenPathAllowed,
} from "./m365-policy";
import { Ms365ConnectorError, m365ErrorFromHttpStatus } from "./m365-errors";
import type { Ms365SecretMaterial } from "./m365-secrets";
import {
  mapValidMs365Records,
  minimiseDriveItem,
  minimiseEvent,
  minimiseUser,
  type MinimisedMs365Record,
  validateMs365NextLink,
} from "./m365-validate";
import { assertConnectorUrl } from "./security";

export type Ms365Fetch = (input: string | URL, init?: RequestInit) => Promise<Response>;

export type Ms365ClientDeps = {
  fetch: Ms365Fetch;
  secrets: Ms365SecretMaterial;
  expectedProviderOrgId: string;
  timeoutMs?: number;
};

const TIMEOUT_MS = 5_000;
const EVENT_SELECT = "id,subject,start,end,isCancelled,lastModifiedDateTime";
const DRIVE_SELECT = "id,name,lastModifiedDateTime,file,folder";
const USER_SELECT = "id,userPrincipalName,displayName";

export class Microsoft365ProviderClient {
  private accessToken: string | null = null;
  private boundTenantId: string | null = null;

  constructor(private readonly deps: Ms365ClientDeps) {}

  write(): never {
    throw new Error("connector_write_forbidden");
  }

  sendMail(): never {
    return this.write();
  }
  replyMail(): never {
    return this.write();
  }
  forwardMail(): never {
    return this.write();
  }
  deleteMail(): never {
    return this.write();
  }
  createEvent(): never {
    return this.write();
  }
  updateEvent(): never {
    return this.write();
  }
  deleteEvent(): never {
    return this.write();
  }
  uploadFile(): never {
    return this.write();
  }
  updateFile(): never {
    return this.write();
  }
  deleteFile(): never {
    return this.write();
  }
  createContact(): never {
    return this.write();
  }
  updateContact(): never {
    return this.write();
  }
  updateDirectory(): never {
    return this.write();
  }
  updateSharePoint(): never {
    return this.write();
  }

  graphRequest(_method: string, _url: string): never {
    throw new Error("unrestricted_external_proxy_forbidden");
  }

  async getSignedInUser(): Promise<MinimisedMs365Record> {
    await this.ensureBound();
    const json = await this.graphGet("/v1.0/me", { $select: USER_SELECT });
    return minimiseUser(json);
  }

  async getCalendarEventsReadOnly(): Promise<MinimisedMs365Record[]> {
    await this.ensureBound();
    const json = await this.graphGet("/v1.0/me/events", { $select: EVENT_SELECT, $top: "50" });
    validateMs365NextLink((json as { "@odata.nextLink"?: unknown })["@odata.nextLink"], "/v1.0/me/events");
    return mapValidMs365Records((json as { value?: unknown }).value, minimiseEvent).records;
  }

  async getDriveItemMetadata(): Promise<MinimisedMs365Record[]> {
    await this.ensureBound();
    const json = await this.graphGet("/v1.0/me/drive/root/children", { $select: DRIVE_SELECT, $top: "50" });
    validateMs365NextLink(
      (json as { "@odata.nextLink"?: unknown })["@odata.nextLink"],
      "/v1.0/me/drive/root/children",
    );
    return mapValidMs365Records((json as { value?: unknown }).value, minimiseDriveItem).records;
  }

  allowedOperations(): readonly Ms365ReadOperation[] {
    return MS365_ALLOWED_OPERATIONS;
  }

  boundProviderOrgId(): string | null {
    return this.boundTenantId;
  }

  async revokeAuthorization(): Promise<{ attempted: true; providerRevocation: "unavailable" }> {
    this.accessToken = null;
    return { attempted: true, providerRevocation: "unavailable" };
  }

  private async ensureBound(): Promise<void> {
    await this.ensureAccessToken();
    const expected = this.deps.expectedProviderOrgId;
    if (!expected) throw new Ms365ConnectorError("m365_tenant_unbound");
    if (this.deps.secrets.tenantId !== expected) throw new Ms365ConnectorError("m365_tenant_mismatch");
    const tid = this.tokenTenantId();
    if (tid && tid !== expected) throw new Ms365ConnectorError("m365_tenant_mismatch");
    this.boundTenantId = expected;
  }

  private tokenTenantId(): string | null {
    if (!this.accessToken) return null;
    const parts = this.accessToken.split(".");
    if (parts.length !== 3) return null;
    try {
      const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")) as { tid?: unknown };
      return typeof payload.tid === "string" && payload.tid ? payload.tid : null;
    } catch {
      return null;
    }
  }

  private async ensureAccessToken(): Promise<void> {
    if (this.accessToken) return;
    const pathname = `/${this.deps.expectedProviderOrgId}/oauth2/v2.0/token`;
    if (!m365IdentityTokenPathAllowed(pathname, this.deps.expectedProviderOrgId)) {
      throw new Ms365ConnectorError("m365_tenant_mismatch");
    }
    const body = await this.identityPost(pathname, {
      client_id: this.deps.secrets.clientId,
      client_secret: this.deps.secrets.clientSecret,
      grant_type: "refresh_token",
      refresh_token: this.deps.secrets.refreshToken,
      scope: MS365_ALLOWED_GRAPH_SCOPES.join(" "),
    });
    const token = body && typeof body === "object" ? (body as { access_token?: unknown }).access_token : null;
    if (typeof token !== "string" || token.length < 8) {
      throw new Ms365ConnectorError("m365_token_invalid");
    }
    const granted = body && typeof body === "object" ? (body as { scope?: unknown }).scope : null;
    if (typeof granted === "string") {
      for (const scope of granted.split(/\s+/).filter(Boolean)) {
        if (scope === "openid" || scope === "profile" || scope === "email") continue;
        if (!(MS365_ALLOWED_GRAPH_SCOPES as readonly string[]).includes(scope)) {
          throw new Ms365ConnectorError("m365_scope_forbidden");
        }
      }
    }
    this.accessToken = token;
  }

  private async graphGet(pathname: string, query?: Record<string, string>): Promise<unknown> {
    if (!m365GraphPathAllowed(pathname)) throw new Ms365ConnectorError("m365_endpoint_forbidden");
    const url = new URL(`https://${MS365_GRAPH_HOST}${pathname}`);
    for (const [key, value] of Object.entries(query ?? {})) {
      if (key !== "$select" && key !== "$top" && key !== "$skiptoken") {
        throw new Ms365ConnectorError("m365_endpoint_forbidden");
      }
      url.searchParams.set(key, value);
    }
    assertConnectorUrl("microsoft_365", url.toString());
    return this.send("GET", url, {
      Authorization: `Bearer ${this.accessToken}`,
      Accept: "application/json",
    });
  }

  private async identityPost(pathname: string, form: Record<string, string>): Promise<unknown> {
    if (!m365IdentityTokenPathAllowed(pathname, this.deps.expectedProviderOrgId)) {
      throw new Ms365ConnectorError("m365_endpoint_forbidden");
    }
    const url = new URL(`https://${MS365_IDENTITY_HOST}${pathname}`);
    assertConnectorUrl("microsoft_365", url.toString());
    return this.send("POST", url, { "Content-Type": "application/x-www-form-urlencoded" }, new URLSearchParams(form).toString());
  }

  private async send(
    method: "GET" | "POST",
    url: URL,
    headers: Record<string, string>,
    body?: string,
  ): Promise<unknown> {
    if (url.hostname === MS365_GRAPH_HOST && method !== "GET") {
      throw new Ms365ConnectorError("m365_method_forbidden");
    }
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
      if (error instanceof Ms365ConnectorError) throw error;
      throw new Ms365ConnectorError("m365_timeout");
    } finally {
      clearTimeout(timeout);
    }
    if (!response.ok) throw m365ErrorFromHttpStatus(response.status);
    try {
      return await response.json();
    } catch {
      throw new Ms365ConnectorError("m365_schema_invalid");
    }
  }
}

export function assertMs365MutationForbidden(operation: string): never {
  if ((MS365_MUTATION_OPERATIONS as readonly string[]).includes(operation) || operation === "write") {
    throw new Error("connector_write_forbidden");
  }
  throw new Ms365ConnectorError("m365_method_forbidden");
}
