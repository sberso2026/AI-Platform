export type Ms365ErrorCategory =
  | "m365_secret_boundary"
  | "m365_missing_secret"
  | "m365_secret_retrieval_failed"
  | "m365_live_unavailable"
  | "m365_browser_secret_forbidden"
  | "m365_token_invalid"
  | "m365_unauthorized"
  | "m365_forbidden"
  | "m365_not_found"
  | "m365_conflict"
  | "m365_rate_limited"
  | "m365_provider_error"
  | "m365_timeout"
  | "m365_schema_invalid"
  | "m365_tenant_mismatch"
  | "m365_tenant_unbound"
  | "m365_method_forbidden"
  | "m365_endpoint_forbidden"
  | "m365_scope_forbidden"
  | "m365_capability_forbidden"
  | "m365_pagination_failed"
  | "m365_oauth_config_invalid"
  | "live_credentials_unavailable";

export class Ms365ConnectorError extends Error {
  readonly category: Ms365ErrorCategory;
  readonly status: number | null;
  constructor(category: Ms365ErrorCategory, status: number | null = null) {
    super(category);
    this.name = "Ms365ConnectorError";
    this.category = category;
    this.status = status;
  }
}

export function m365ErrorFromHttpStatus(status: number): Ms365ConnectorError {
  if (status === 401) return new Ms365ConnectorError("m365_unauthorized", 401);
  if (status === 403) return new Ms365ConnectorError("m365_forbidden", 403);
  if (status === 404) return new Ms365ConnectorError("m365_not_found", 404);
  if (status === 409) return new Ms365ConnectorError("m365_conflict", 409);
  if (status === 429) return new Ms365ConnectorError("m365_rate_limited", 429);
  if (status >= 500) return new Ms365ConnectorError("m365_provider_error", status);
  return new Ms365ConnectorError("m365_provider_error", status);
}
