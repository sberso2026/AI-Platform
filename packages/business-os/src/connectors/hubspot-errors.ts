export type HubSpotErrorCategory =
  | "hubspot_secret_boundary"
  | "hubspot_missing_secret"
  | "hubspot_secret_retrieval_failed"
  | "hubspot_live_unavailable"
  | "hubspot_browser_secret_forbidden"
  | "hubspot_private_app_forbidden"
  | "hubspot_token_invalid"
  | "hubspot_unauthorized"
  | "hubspot_forbidden"
  | "hubspot_not_found"
  | "hubspot_conflict"
  | "hubspot_rate_limited"
  | "hubspot_provider_error"
  | "hubspot_timeout"
  | "hubspot_schema_invalid"
  | "hubspot_portal_mismatch"
  | "hubspot_portal_unbound"
  | "hubspot_method_forbidden"
  | "hubspot_endpoint_forbidden"
  | "hubspot_scope_forbidden"
  | "hubspot_capability_forbidden"
  | "hubspot_pagination_failed"
  | "hubspot_oauth_config_invalid"
  | "live_credentials_unavailable";

export class HubSpotConnectorError extends Error {
  readonly category: HubSpotErrorCategory;
  readonly status: number | null;
  constructor(category: HubSpotErrorCategory, status: number | null = null) {
    super(category);
    this.name = "HubSpotConnectorError";
    this.category = category;
    this.status = status;
  }
}

export function hubspotErrorFromHttpStatus(status: number): HubSpotConnectorError {
  if (status === 401) return new HubSpotConnectorError("hubspot_unauthorized", 401);
  if (status === 403) return new HubSpotConnectorError("hubspot_forbidden", 403);
  if (status === 404) return new HubSpotConnectorError("hubspot_not_found", 404);
  if (status === 409) return new HubSpotConnectorError("hubspot_conflict", 409);
  if (status === 429) return new HubSpotConnectorError("hubspot_rate_limited", 429);
  if (status >= 500) return new HubSpotConnectorError("hubspot_provider_error", status);
  return new HubSpotConnectorError("hubspot_provider_error", status);
}
