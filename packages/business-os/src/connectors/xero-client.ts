/**
 * Isolated Xero HTTP client. Tokens never leave this boundary.
 * Accounting requests are GET-only. Mutations throw before fetch.
 */
import {
  XERO_ACCOUNTING_HOST,
  XERO_ALLOWED_OPERATIONS,
  XERO_IDENTITY_HOST,
  XERO_MUTATION_OPERATIONS,
  type XeroReadOperation,
  xeroAccountingPathAllowed,
  xeroIdentityPostPathAllowed,
} from "./xero-policy";
import { XeroConnectorError, xeroErrorFromHttpStatus } from "./xero-errors";
import type { XeroSecretMaterial } from "./xero-secrets";
import {
  mapValidRecords,
  minimiseAccount,
  minimiseContact,
  minimiseInvoice,
  minimiseOrganisation,
  type MinimisedXeroRecord,
} from "./xero-validate";
import { assertConnectorUrl } from "./security";

export type XeroFetch = (input: string | URL, init?: RequestInit) => Promise<Response>;

export type XeroClientDeps = {
  fetch: XeroFetch;
  secrets: XeroSecretMaterial;
  expectedProviderOrgId: string;
  timeoutMs?: number;
};

export type XeroConnection = {
  tenantId: string;
  tenantType?: string;
};

const TIMEOUT_MS = 5_000;

function encodeBasic(clientId: string, clientSecret: string): string {
  return Buffer.from(`${clientId}:${clientSecret}`, "utf8").toString("base64");
}

export class XeroProviderClient {
  private accessToken: string | null = null;
  private boundOrgId: string | null = null;

  constructor(private readonly deps: XeroClientDeps) {}

  write(): never {
    throw new Error("connector_write_forbidden");
  }

  createInvoice(): never {
    return this.write();
  }
  updateInvoice(): never {
    return this.write();
  }
  deleteInvoice(): never {
    return this.write();
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
  createPayment(): never {
    return this.write();
  }
  createBankTransaction(): never {
    return this.write();
  }
  createCreditNote(): never {
    return this.write();
  }
  createJournal(): never {
    return this.write();
  }
  uploadFile(): never {
    return this.write();
  }
  sendEmail(): never {
    return this.write();
  }
  updateOrganisation(): never {
    return this.write();
  }

  request(_method: string, _url: string): never {
    throw new Error("unrestricted_external_proxy_forbidden");
  }

  async getOrganisation(): Promise<MinimisedXeroRecord> {
    await this.ensureBound();
    const json = await this.accountingGet("/api.xro/2.0/Organisation");
    const orgs = (json as { Organisations?: unknown }).Organisations;
    const first = Array.isArray(orgs) ? orgs[0] : orgs;
    return minimiseOrganisation(first);
  }

  async getAccounts(): Promise<MinimisedXeroRecord[]> {
    await this.ensureBound();
    const json = await this.accountingGet("/api.xro/2.0/Accounts");
    return mapValidRecords((json as { Accounts?: unknown }).Accounts, minimiseAccount).records;
  }

  async getInvoicesReadOnly(page = 1): Promise<MinimisedXeroRecord[]> {
    await this.ensureBound();
    if (!Number.isInteger(page) || page < 1) throw new XeroConnectorError("xero_pagination_failed");
    const json = await this.accountingGet("/api.xro/2.0/Invoices", { page: String(page), summaryOnly: "true" });
    return mapValidRecords((json as { Invoices?: unknown }).Invoices, minimiseInvoice).records;
  }

  async getFinancialContacts(page = 1): Promise<MinimisedXeroRecord[]> {
    await this.ensureBound();
    if (!Number.isInteger(page) || page < 1) throw new XeroConnectorError("xero_pagination_failed");
    const json = await this.accountingGet("/api.xro/2.0/Contacts", { page: String(page) });
    return mapValidRecords((json as { Contacts?: unknown }).Contacts, minimiseContact).records;
  }

  async getAccountBalances(): Promise<MinimisedXeroRecord[]> {
    return this.getAccounts();
  }

  allowedOperations(): readonly XeroReadOperation[] {
    return XERO_ALLOWED_OPERATIONS;
  }

  boundProviderOrgId(): string | null {
    return this.boundOrgId;
  }

  async revokeAuthorization(): Promise<{ attempted: true; providerRevocation: "submitted" | "unavailable" }> {
    try {
      await this.identityPost("/connect/revocation", {
        token: this.deps.secrets.refreshToken,
        token_type_hint: "refresh_token",
      });
      this.accessToken = null;
      return { attempted: true, providerRevocation: "submitted" };
    } catch {
      this.accessToken = null;
      return { attempted: true, providerRevocation: "unavailable" };
    }
  }

  private async ensureBound(): Promise<void> {
    await this.ensureAccessToken();
    if (this.boundOrgId) return;
    const connections = await this.listConnections();
    const expected = this.deps.expectedProviderOrgId;
    if (!expected) throw new XeroConnectorError("xero_org_unbound");
    const matches = connections.filter((row) => row.tenantId === expected);
    if (matches.length === 1) {
      this.boundOrgId = matches[0].tenantId;
      return;
    }
    if (connections.length > 1 && matches.length === 0) {
      throw new XeroConnectorError("xero_org_mismatch");
    }
    if (connections.length > 1) throw new XeroConnectorError("xero_org_ambiguous");
    throw new XeroConnectorError("xero_org_mismatch");
  }

  private async listConnections(): Promise<XeroConnection[]> {
    if (!xeroAccountingPathAllowed("/connections")) throw new XeroConnectorError("xero_endpoint_forbidden");
    const url = new URL(`https://${XERO_ACCOUNTING_HOST}/connections`);
    assertConnectorUrl("xero", url.toString());
    if (!this.accessToken) throw new XeroConnectorError("xero_unauthorized");
    const json = await this.send("GET", url, {
      Authorization: `Bearer ${this.accessToken}`,
      Accept: "application/json",
    });
    if (!Array.isArray(json)) throw new XeroConnectorError("xero_schema_invalid");
    return json.map((row) => {
      if (!row || typeof row !== "object") throw new XeroConnectorError("xero_schema_invalid");
      const tenantId = (row as { tenantId?: unknown }).tenantId;
      if (typeof tenantId !== "string" || !tenantId) throw new XeroConnectorError("xero_schema_invalid");
      return { tenantId, tenantType: String((row as { tenantType?: unknown }).tenantType ?? "") };
    });
  }

  private async ensureAccessToken(): Promise<void> {
    if (this.accessToken) return;
    const body = await this.identityPost("/connect/token", {
      grant_type: "refresh_token",
      refresh_token: this.deps.secrets.refreshToken,
    });
    const token = body && typeof body === "object" ? (body as { access_token?: unknown }).access_token : null;
    if (typeof token !== "string" || token.length < 8) {
      throw new XeroConnectorError("xero_token_invalid");
    }
    this.accessToken = token;
  }

  private async accountingGet(pathname: string, query?: Record<string, string>): Promise<unknown> {
    if (!xeroAccountingPathAllowed(pathname)) throw new XeroConnectorError("xero_endpoint_forbidden");
    const url = new URL(`https://${XERO_ACCOUNTING_HOST}${pathname}`);
    for (const [key, value] of Object.entries(query ?? {})) {
      if (key !== "page" && key !== "pageSize" && key !== "summaryOnly") {
        throw new XeroConnectorError("xero_endpoint_forbidden");
      }
      url.searchParams.set(key, value);
    }
    assertConnectorUrl("xero", url.toString());
    return this.send("GET", url, {
      Authorization: `Bearer ${this.accessToken}`,
      Accept: "application/json",
      "Xero-Tenant-Id": this.deps.expectedProviderOrgId,
    });
  }

  private async identityPost(pathname: string, form: Record<string, string>): Promise<unknown> {
    if (!xeroIdentityPostPathAllowed(pathname)) throw new XeroConnectorError("xero_endpoint_forbidden");
    const url = new URL(`https://${XERO_IDENTITY_HOST}${pathname}`);
    assertConnectorUrl("xero", url.toString());
    const headers: Record<string, string> = {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${encodeBasic(this.deps.secrets.clientId, this.deps.secrets.clientSecret)}`,
    };
    return this.send("POST", url, headers, new URLSearchParams(form).toString());
  }

  private async send(
    method: "GET" | "POST",
    url: URL,
    headers: Record<string, string>,
    body?: string,
  ): Promise<unknown> {
    if (url.hostname === XERO_ACCOUNTING_HOST && method !== "GET") {
      throw new XeroConnectorError("xero_method_forbidden");
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
      if (error instanceof XeroConnectorError) throw error;
      throw new XeroConnectorError("xero_timeout");
    } finally {
      clearTimeout(timeout);
    }
    if (!response.ok) throw xeroErrorFromHttpStatus(response.status);
    try {
      return await response.json();
    } catch {
      throw new XeroConnectorError("xero_schema_invalid");
    }
  }
}

export function assertXeroMutationForbidden(operation: string): never {
  if ((XERO_MUTATION_OPERATIONS as readonly string[]).includes(operation) || operation === "write") {
    throw new Error("connector_write_forbidden");
  }
  throw new XeroConnectorError("xero_method_forbidden");
}
