const SAFE_MESSAGES: Record<string, string> = {
  oauth_pending: "Waiting for you to finish connecting.",
  oauth_state_invalid: "This connection request is invalid. Start Connect again.",
  oauth_state_expired: "This connection request expired. Start Connect again.",
  oauth_state_mismatch: "This connection request does not match the current workspace.",
  oauth_tenant_mismatch: "This connection belongs to a different organisation.",
  oauth_workspace_mismatch: "This connection belongs to a different workspace.",
  oauth_consent_denied: "You declined access. No connection was created.",
  oauth_code_missing: "The provider did not return an authorisation code.",
  oauth_provider_error: "The provider could not complete sign-in. Try again.",
  oauth_redirect_forbidden: "The return address is not allowed.",
  live_oauth_not_certified: "Live provider sign-in is not enabled in this release.",
  connector_reauth_required: "Reconnect is required before sync can run.",
  connector_revoked: "This integration is disconnected. Sync is blocked.",
  provider_unavailable: "The provider is temporarily unavailable. Try again later.",
  authentication_expired: "Provider authorisation expired. Reconnect to continue.",
  permission_denied: "BOS does not have the approved read permission. Reconnect if this is unexpected.",
  rate_limited: "The provider rate-limited this request. Wait and try Sync Now.",
  timeout: "The provider timed out. Try Sync Now again.",
  schema_invalid: "The provider returned data that BOS cannot use. Nothing was stored as canonical.",
  xero_org_mismatch: "This Xero organisation does not match the bound organisation.",
  m365_tenant_mismatch: "This Microsoft 365 directory does not match the bound directory.",
  hubspot_portal_mismatch: "This HubSpot portal does not match the bound portal.",
  xero_org_unbound: "No Xero organisation is bound yet.",
  m365_tenant_unbound: "No Microsoft 365 directory is bound yet.",
  hubspot_portal_unbound: "No HubSpot portal is bound yet.",
  installation_revoked: "The installation was revoked. Connect again to continue.",
  invalid_connector_ui_transition: "That action is not allowed in the current connection state.",
  csv_oauth_not_supported: "File import does not use provider sign-in.",
};

export function connectorUserSafeMessage(errorCategory: string | null | undefined, fallback?: string | null): string | null {
  if (!errorCategory) return null;
  if (SAFE_MESSAGES[errorCategory]) return SAFE_MESSAGES[errorCategory];
  if (fallback && !looksUnsafe(fallback)) return fallback;
  return "Something went wrong with this integration. Try again or disconnect.";
}

function looksUnsafe(value: string): boolean {
  return /stack|exception|secret_id|access_token|refresh_token|client_secret|bearer\s+\S+|eyJ[A-Za-z0-9_-]+\./i.test(
    value,
  );
}
