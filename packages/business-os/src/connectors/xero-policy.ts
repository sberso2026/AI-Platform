/**
 * BOS-16A5A Xero security policy: capability, endpoint, scope, and threat controls.
 * Executable allowlist for the existing BOS-12 connector. Not a second integration stack.
 */
export const XERO_ALLOWED_CAPABILITIES = ["accounting.read", "financial_facts.read"] as const;

export const XERO_DENIED_CAPABILITIES = [
  "invoice.write",
  "contact.write",
  "payment.create",
  "bank_transaction.write",
  "credit_note.write",
  "journal.write",
  "payroll.write",
  "file.upload",
  "email.send",
  "organisation.configure",
] as const;

export const XERO_ALLOWED_OAUTH_SCOPES = [
  "offline_access",
  "accounting.settings.read",
  "accounting.transactions.read",
  "accounting.contacts.read",
] as const;

export const XERO_DENIED_OAUTH_SCOPES = [
  "accounting.transactions",
  "accounting.contacts",
  "accounting.settings",
  "accounting.attachments",
  "payroll.employees",
  "files",
] as const;

export type XeroReadOperation =
  | "getOrganisation"
  | "getAccounts"
  | "getInvoicesReadOnly"
  | "getFinancialContacts"
  | "getAccountBalances";

export const XERO_ALLOWED_OPERATIONS: readonly XeroReadOperation[] = [
  "getOrganisation",
  "getAccounts",
  "getInvoicesReadOnly",
  "getFinancialContacts",
  "getAccountBalances",
] as const;

export const XERO_MUTATION_OPERATIONS = [
  "createInvoice",
  "updateInvoice",
  "deleteInvoice",
  "createContact",
  "updateContact",
  "deleteContact",
  "createPayment",
  "createBankTransaction",
  "createCreditNote",
  "createJournal",
  "uploadFile",
  "sendEmail",
  "updateOrganisation",
] as const;

export const XERO_ACCOUNTING_HOST = "api.xero.com";
export const XERO_IDENTITY_HOST = "identity.xero.com";

export const XERO_ALLOWED_GET_PATHS = [
  "/connections",
  "/api.xro/2.0/Organisation",
  "/api.xro/2.0/Accounts",
  "/api.xro/2.0/Invoices",
  "/api.xro/2.0/Contacts",
] as const;

export const XERO_IDENTITY_POST_PATHS = ["/connect/token", "/connect/revocation"] as const;

export const XERO_ALLOWED_QUERY_KEYS = ["page", "pageSize", "summaryOnly"] as const;

export type XeroFieldClass = "required_for_bos" | "provenance_only" | "sensitive_necessary" | "discard";

export const XERO_FIELD_POLICY = {
  organisation: {
    OrganisationID: "required_for_bos",
    Name: "provenance_only",
    IsDemoCompany: "required_for_bos",
    CountryCode: "provenance_only",
    OrganisationStatus: "provenance_only",
    Class: "provenance_only",
  },
  account: {
    AccountID: "required_for_bos",
    Code: "required_for_bos",
    Name: "provenance_only",
    Type: "required_for_bos",
    Status: "provenance_only",
    CurrencyCode: "required_for_bos",
    BankAccountNumber: "discard",
    TaxType: "discard",
  },
  invoice: {
    InvoiceID: "required_for_bos",
    InvoiceNumber: "provenance_only",
    Status: "required_for_bos",
    CurrencyCode: "required_for_bos",
    Total: "sensitive_necessary",
    AmountDue: "sensitive_necessary",
    Date: "provenance_only",
    Contact: "discard",
    LineItems: "discard",
  },
  contact: {
    ContactID: "required_for_bos",
    Name: "provenance_only",
    ContactStatus: "provenance_only",
    IsCustomer: "required_for_bos",
    IsSupplier: "required_for_bos",
    Balances: "sensitive_necessary",
    EmailAddress: "discard",
    Phones: "discard",
    Addresses: "discard",
  },
} as const satisfies Record<string, Record<string, XeroFieldClass>>;

export type XeroThreatId =
  | "refresh_token_theft"
  | "client_secret_exposure"
  | "browser_credential_exposure"
  | "agent_credential_access"
  | "excessive_oauth_scopes"
  | "cross_tenant_connector_leakage"
  | "wrong_xero_org_binding"
  | "provider_response_injection"
  | "sensitive_payload_logging"
  | "unauthorized_canonical_commit"
  | "external_provider_mutation"
  | "token_replay"
  | "revoked_expired_token"
  | "provider_rate_limit"
  | "compromised_staging_data"
  | "disconnect_revocation_failure";

export type XeroThreatControl = {
  id: XeroThreatId;
  control: string;
  failure: string;
  evidence: string;
};

export const XERO_THREAT_MODEL: readonly XeroThreatControl[] = [
  {
    id: "refresh_token_theft",
    control: "Refresh tokens stay in Platform secret references / server env; never returned from adapter methods",
    failure: "xero_secret_boundary",
    evidence: "xero-security.test.ts: credentials never exposed",
  },
  {
    id: "client_secret_exposure",
    control: "Client secret is secret-reference material; configure rejects inline secret fields",
    failure: "secret_redaction_required",
    evidence: "connectors/service.test.ts: inline secret rejected",
  },
  {
    id: "browser_credential_exposure",
    control: "No NEXT_PUBLIC Xero secrets; public installation redacts secretId to secret_ref",
    failure: "xero_browser_secret_forbidden",
    evidence: "xero-security.test.ts: no NEXT_PUBLIC Xero secret",
  },
  {
    id: "agent_credential_access",
    control: "configure/sync/revoke require human actor; callProviderFromAgent throws",
    failure: "self_registration_forbidden | direct_provider_access_forbidden",
    evidence: "connectors/service.test.ts: agent cannot configure",
  },
  {
    id: "excessive_oauth_scopes",
    control: "XERO_ALLOWED_OAUTH_SCOPES is read-only accounting plus offline_access",
    failure: "xero_scope_forbidden",
    evidence: "xero-policy.test.ts: denied write scopes",
  },
  {
    id: "cross_tenant_connector_leakage",
    control: "requireInstallation checks tenant_id and workspace_id before provider access",
    failure: "cross_tenant_connector_forbidden",
    evidence: "connectors/service.test.ts: tenant isolation",
  },
  {
    id: "wrong_xero_org_binding",
    control: "Live client requires expectedProviderOrgId and rejects mismatch/ambiguity",
    failure: "xero_org_mismatch | xero_org_ambiguous",
    evidence: "xero-client.test.ts: wrong provider org rejected",
  },
  {
    id: "provider_response_injection",
    control: "Schema validation before staging; unknown values stay unknown/null",
    failure: "xero_schema_invalid",
    evidence: "xero-validate.test.ts: schema-invalid rejected",
  },
  {
    id: "sensitive_payload_logging",
    control: "redactSecrets + xeroSafeTelemetry strip tokens and payloads",
    failure: "secret_redaction_required",
    evidence: "xero-security.test.ts: logging redaction",
  },
  {
    id: "unauthorized_canonical_commit",
    control: "Staging becomesCanonical=false; sync never writes business_os_finance_*",
    failure: "canonicalDomainMutationBypass remains false",
    evidence: "connectors/service.test.ts: staging-first",
  },
  {
    id: "external_provider_mutation",
    control: "GET-only accounting HTTP; mutation methods throw before fetch",
    failure: "connector_write_forbidden | xero_method_forbidden",
    evidence: "xero-client.test.ts: mutation blocked before HTTP",
  },
  {
    id: "token_replay",
    control: "Access tokens are process-memory only, never staged, never returned, never logged",
    failure: "xero_token_boundary",
    evidence: "xero-client.test.ts: token not returned",
  },
  {
    id: "revoked_expired_token",
    control: "401/invalid_grant map to typed errors; revoked installations cannot sync",
    failure: "xero_unauthorized | connector_revoked",
    evidence: "xero-client.test.ts: 401 fail-closed",
  },
  {
    id: "provider_rate_limit",
    control: "429 maps to rateLimited without fabricating facts; bounded adapter retries only",
    failure: "xero_rate_limited",
    evidence: "xero-client.test.ts: 429 typed",
  },
  {
    id: "compromised_staging_data",
    control: "Minimised payloads, tenant-scoped staging, suppression redaction, no AI access by default",
    failure: "cross_tenant_connector_forbidden",
    evidence: "connectors/service.test.ts: isolation and suppression",
  },
  {
    id: "disconnect_revocation_failure",
    control: "revoke clears secret_id, marks revoked, blocks sync, audits, attempts provider revocation via mockable boundary",
    failure: "connector_revoked",
    evidence: "xero-security.test.ts: disconnect disables sync",
  },
] as const;

export function assertXeroCapabilityAllowed(capability: string): void {
  if (!(XERO_ALLOWED_CAPABILITIES as readonly string[]).includes(capability)) {
    throw new Error("xero_capability_forbidden");
  }
}

export function assertXeroScopeAllowed(scope: string): void {
  if (!(XERO_ALLOWED_OAUTH_SCOPES as readonly string[]).includes(scope)) {
    throw new Error("xero_scope_forbidden");
  }
}

export function xeroAccountingPathAllowed(pathname: string): boolean {
  return (XERO_ALLOWED_GET_PATHS as readonly string[]).includes(pathname);
}

export function xeroIdentityPostPathAllowed(pathname: string): boolean {
  return (XERO_IDENTITY_POST_PATHS as readonly string[]).includes(pathname);
}
