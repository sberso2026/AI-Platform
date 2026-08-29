export type XeroErrorCategory =
  | "xero_secret_boundary"
  | "xero_missing_secret"
  | "xero_secret_retrieval_failed"
  | "xero_live_unavailable"
  | "xero_browser_secret_forbidden"
  | "xero_token_invalid"
  | "xero_unauthorized"
  | "xero_forbidden"
  | "xero_not_found"
  | "xero_conflict"
  | "xero_rate_limited"
  | "xero_provider_error"
  | "xero_timeout"
  | "xero_schema_invalid"
  | "xero_org_mismatch"
  | "xero_org_ambiguous"
  | "xero_org_unbound"
  | "xero_method_forbidden"
  | "xero_endpoint_forbidden"
  | "xero_scope_forbidden"
  | "xero_capability_forbidden"
  | "xero_pagination_failed"
  | "live_credentials_unavailable";

export class XeroConnectorError extends Error {
  readonly category: XeroErrorCategory;
  readonly status: number | null;
  constructor(category: XeroErrorCategory, status: number | null = null) {
    super(category);
    this.name = "XeroConnectorError";
    this.category = category;
    this.status = status;
  }
}

export function xeroErrorFromHttpStatus(status: number): XeroConnectorError {
  if (status === 401) return new XeroConnectorError("xero_unauthorized", 401);
  if (status === 403) return new XeroConnectorError("xero_forbidden", 403);
  if (status === 404) return new XeroConnectorError("xero_not_found", 404);
  if (status === 409) return new XeroConnectorError("xero_conflict", 409);
  if (status === 429) return new XeroConnectorError("xero_rate_limited", 429);
  if (status >= 500) return new XeroConnectorError("xero_provider_error", status);
  return new XeroConnectorError("xero_provider_error", status);
}
